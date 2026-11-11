/* ============================================================================
 *  combat.js  ·  Fénix Fight v5.6
 *  Sistema de combate modular: ataques por fases, alcance real, física de
 *  movimiento y "juice" (hitstop, shake, estelas).
 *
 *  Se carga ANTES de game.js (ver index.html). No depende del DOM: la parte de
 *  dibujo recibe el contexto 2D como parámetro, así el resto es testeable en Node.
 *
 *  Contenido
 *    1. Ease ........ curvas de interpolación
 *    2. Config ...... constantes ajustables (todo el "feeling" está aquí)
 *    3. Reach ....... alcance REAL de cada golpe (calculado desde el sprite)
 *    4. Attack ...... máquina de estados STARTUP → ACTIVE → RECOVERY
 *    5. Locomotion .. aceleración, fricción, salto variable, colisión de cuerpos
 *    6. Juice ....... hitstop, shake, estelas fantasma y ribbons de trayectoria
 *    7. Rig ......... pose interpolada (crossfade + lean + squash/stretch)
 * ========================================================================== */
(function (root) {
  'use strict';

  // ==========================================================================
  // 1. EASING  (t en [0,1] → [0,1])
  // ==========================================================================
  const Ease = {
    linear: t => t,
    inQuad: t => t * t,
    outQuad: t => 1 - (1 - t) * (1 - t),
    inOutQuad: t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: t => t * t * t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    outBack: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) },
    smooth: t => t * t * (3 - 2 * t)
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sat = t => clamp(t, 0, 1);

  // ==========================================================================
  // 2. CONFIG  — toca aquí para ajustar el feeling
  // ==========================================================================
  const Config = {
    // Caja de daño (hurtbox) y de colisión entre cuerpos (pushbox), en px de juego (W = 960)
    HURT_HALF: 30,        // semiancho del cuerpo: el golpe conecta cuando la punta de la extremidad toca este borde
    PUSH_DIST: 54,        // (ver separate)
    PUSH_MAX: 7,          // máx. px por frame que se separan los cuerpos (evita teletransportes al terminar un esquive)        // distancia mínima centro-a-centro entre dos luchadores en el suelo
    HIT_Y: 120,           // diferencia vertical máxima para que un golpe conecte
    REACH_MARGIN: 10,     // la hitbox sobresale este margen de lo que se VE del sprite (evita "atravesar sin pegar")
    REACH_MAX: 128,       // tope de alcance (centro → punta) para que ningún personaje sea injusto

    // Datos de fotogramas (a 60 FPS). su = startup, ac = active, rc = recovery
    MOVES: {
      //          arranque  activo  recuperación  daño  alcance mínimo  lunge (impulso) altura de la punta  origen del arco
      punch: { su: 5, ac: 3, rc: 14, d: 6, minReach: 78, lunge: 2.4, tipY: 100, orgY: 104, arc: 0.10 },
      kick: { su: 7, ac: 4, rc: 17, d: 9, minReach: 98, lunge: 3.2, tipY: 62, orgY: 70, arc: 0.55 },
      grab: { su: 6, ac: 2, rc: 24, d: 0, minReach: 56, lunge: 0, tipY: 90, orgY: 90, arc: 0 }
    },

    // Locomoción
    ACCEL_GROUND: 0.30,   // fracción de la velocidad máxima ganada por frame al caminar (≈ 5 frames hasta velocidad máx.)
    TURN_BOOST: 1.8,      // multiplicador de aceleración al invertir la dirección (frena rápido)
    FRICTION_GROUND: 0.72,// factor de velocidad por frame sin input en el suelo
    ACCEL_AIR: 0.10,      // control aéreo (menor que en el suelo)
    FRICTION_AIR: 0.97,   // casi sin fricción en el aire: conserva el impulso
    GRAVITY: 0.8,
    JUMP_V: -16,
    JUMP_CUT_GRAV: 2.4,   // multiplicador de gravedad al subir SIN mantener el botón → salto corto
    FALL_GRAV: 1.12,      // caída ligeramente más rápida que la subida (se siente más pesado)

    // Juice
    SHAKE_DECAY: 0.84,
    HITSTOP: { light: 3, medium: 5, heavy: 9, mega: 14, block: 2 }
  };

  // ==========================================================================
  // 3. REACH — alcance real de cada golpe, derivado del sprite
  //    ANIM[id].st.punch|kick = [preparación, IMPACTO, recuperación]
  //    El frame de IMPACTO dibuja la extremidad extendida: su ancho "hacia
  //    delante" (ancho - ancla, o ancla si el frame está espejado) es lo que el
  //    jugador VE. La hitbox nunca puede ser menor que eso.
  // ==========================================================================
  const _reachCache = {};

  /** Distancia hacia delante (px) que cubre el sprite del frame de impacto. */
  function spriteForward(ch, type) {
    const A = ch && ch.A; if (!A) return 0;
    const arr = A.st[type === 'kick' ? 'kick' : 'punch']; if (!arr) return 0;
    let best = 0;
    // Se miran TODOS los frames de la pose (no solo el del medio): el más largo manda.
    for (let n = 0; n < arr.length; n++) {
      const i = arr[n], m = A.f[i]; if (!m) continue;
      const k = A.sc * (m[3] || 1), w = m[0] * k, a = m[2] * k;
      const flip = A.fl && A.fl.includes(i);
      best = Math.max(best, flip ? a : w - a);
    }
    return best;
  }

  /** Alcance de la hitbox: centro del luchador → punta del golpe. */
  function reachFor(ch, type) {
    const key = (ch && ch.id) + ':' + type;
    if (_reachCache[key] != null) return _reachCache[key];
    const mv = Config.MOVES[type];
    const r = clamp(Math.max(mv.minReach, spriteForward(ch, type) + Config.REACH_MARGIN), 0, Config.REACH_MAX);
    return (_reachCache[key] = r);
  }

  // ==========================================================================
  // 4. ATTACK — máquina de estados por fases
  //
  //   t=0 ──STARTUP──▶ su ──ACTIVE──▶ su+ac ──RECOVERY──▶ su+ac+rc ──▶ fin
  //   (anticipación)   (la extremidad viaja; hitbox viva)   (castigable)
  //
  //  Se mantienen los campos t/su/ac/rc/d/r/h/grab que ya usaba game.js
  //  (IA, skins, etc.), así que es un reemplazo directo del objeto literal.
  // ==========================================================================
  const Phase = { STARTUP: 'startup', ACTIVE: 'active', RECOVERY: 'recovery', DONE: 'done' };

  class Attack {
    /**
     * @param {'punch'|'kick'|'grab'} type
     * @param {object} ch  personaje (R[i]) para calcular el alcance
     */
    constructor(type, ch) {
      const mv = Config.MOVES[type];
      this.type = type;
      this.grab = type === 'grab' ? 1 : 0;
      this.t = 0; this.su = mv.su; this.ac = mv.ac; this.rc = mv.rc;
      this.d = mv.d; this.h = 0;                         // h = ya conectó (un golpe por ataque)
      this.reach = reachFor(ch, type);                   // punta de la hitbox al máximo
      this.r = this.reach + Config.HURT_HALF;            // distancia centro-centro máxima (compat. con la IA)
      this.mv = mv;
      this.tipX = 0; this.tipY = mv.tipY;                // última posición de la punta (para chispas y estelas)
      this.prevTip = null;
    }
    get total() { return this.su + this.ac + this.rc }
    get phase() {
      if (this.t <= this.su) return Phase.STARTUP;
      if (this.t <= this.su + this.ac) return Phase.ACTIVE;
      if (this.t <= this.total) return Phase.RECOVERY;
      return Phase.DONE;
    }
    /** Progreso 0..1 dentro de la fase actual. */
    get u() {
      switch (this.phase) {
        case Phase.STARTUP: return sat(this.t / this.su);
        case Phase.ACTIVE: return sat((this.t - this.su) / this.ac);
        case Phase.RECOVERY: return sat((this.t - this.su - this.ac) / this.rc);
        default: return 1;
      }
    }
    get isActive() { return this.phase === Phase.ACTIVE }
    get finished() { return this.t > this.total }

    /**
     * Longitud de la hitbox en este frame (centro → punta).
     * Sale del 50 % (ya iniciado en STARTUP) y se EXTIENDE con outQuad durante ACTIVE: el golpe
     * viaja, no aparece. En recuperación se repliega.
     */
    reachNow() {
      switch (this.phase) {
        case Phase.STARTUP: return this.reach * .5 * Ease.inQuad(this.u);       // la extremidad ya empieza a salir en los últimos frames
        case Phase.ACTIVE: return lerp(this.reach * .5, this.reach, Ease.outQuad(sat((this.t - this.su) / this.ac)));
        case Phase.RECOVERY: return lerp(this.reach, this.reach * .3, Ease.inOutQuad(this.u));
        default: return 0;
      }
    }

    /**
     * Avanza un frame. Devuelve eventos para que game.js reaccione:
     *   { start, activeStart, hitCheck, end }
     */
    step() {
      this.t++;
      return {
        start: this.t === 1,
        activeStart: this.t === this.su + 1,
        hitCheck: this.isActive && !this.h,
        end: this.finished
      };
    }

    /**
     * ¿La hitbox toca el hurtbox del rival?  (AABB 1D horizontal + tolerancia vertical)
     *   punta de la extremidad  ≥  borde cercano del cuerpo rival
     */
    connects(f, e) {
      if (!this.isActive || this.h) return false;
      const dx = (e.x - f.x) * f.face;                  // distancia al rival "hacia delante"
      if (dx < -Config.HURT_HALF * .5) return false;    // totalmente a la espalda
      if (Math.abs(e.y - f.y) >= Config.HIT_Y) return false;
      return dx - Config.HURT_HALF <= this.reachNow();
    }
  }

  // ==========================================================================
  // 5. LOCOMOTION — aceleración, fricción, salto variable, empuje entre cuerpos
  // ==========================================================================
  const Locomotion = {
    /**
     * Velocidad horizontal "de caminar" con inercia. Llamar UNA vez por frame.
     * @param f        luchador (usa f.mvx)
     * @param dir      -1 | 0 | +1  (0 si no puede moverse)
     * @param maxSp    velocidad máxima (ch.s * modificadores)
     * @param grounded bool
     */
    walk(f, dir, maxSp, grounded) {
      let v = f.mvx || 0;
      if (dir !== 0) {
        const turning = v * dir < 0;
        const a = maxSp * (grounded ? Config.ACCEL_GROUND : Config.ACCEL_AIR) * (turning ? Config.TURN_BOOST : 1);
        if (v * dir < maxSp) { v += dir * a; if (v * dir > maxSp) v = dir * maxSp }   // acelera hasta el tope
        else v = dir * maxSp + (v - dir * maxSp) * .8;                              // el exceso (p. ej. un lunge) se disipa solo
      } else {
        v *= grounded ? Config.FRICTION_GROUND : Config.FRICTION_AIR;
        if (Math.abs(v) < .05) v = 0;
      }
      f.mvx = v;
      return v;
    },

    /** Impulso hacia delante al empezar la fase ACTIVE (el cuerpo "entra" en el golpe). */
    lunge(f, atk) { if (atk.mv.lunge) f.mvx = (f.mvx || 0) + f.face * atk.mv.lunge },

    /**
     * Gravedad con altura de salto variable.
     *  - Subiendo y botón soltado → gravedad ×2.4 (salto corto, sin cortes bruscos de velocidad)
     *  - Cayendo → algo más rápido (peso)
     */
    gravity(f, jumpHeld) {
      let g = Config.GRAVITY;
      if (f.vy < 0 && f.jmp && !jumpHeld) g *= Config.JUMP_CUT_GRAV;   // solo saltos voluntarios (los lanzamientos por golpe no se recortan)
      else if (f.vy > 0) g *= Config.FALL_GRAV;
      f.vy += g;
    },

    /**
     * Colisión entre cuerpos: dos luchadores en el suelo no pueden solaparse.
     * Se ignora durante esquives (intangibles), mientras alguien salta por encima
     * (diferencia de altura) y para el dasher hasta que conecta.
     * @param wallL,wallR límites del escenario
     */
    separate(a, b, wallL, wallR) {
      if (a.dg > 0 || b.dg > 0) return;
      if (a.dash && !a.dash.h) return;
      if (b.dash && !b.dash.h) return;
      if (Math.abs(a.y - b.y) > 70) return;             // uno está saltando sobre el otro
      const d = b.x - a.x, ad = Math.abs(d), need = Config.PUSH_DIST - ad;
      if (need <= 0) return;
      const dir = d === 0 ? (a.i ? 1 : -1) : Math.sign(d);
      let pa = Math.min(need / 2, Config.PUSH_MAX), pb = pa;
      // si uno está contra la pared, el otro absorbe todo el empuje
      if (a.x - pa < wallL) { pb += pa - (a.x - wallL); pa = a.x - wallL }
      if (b.x + pb > wallR) { pa += pb - (wallR - b.x); pb = wallR - b.x }
      a.x -= dir * pa; b.x += dir * pb;
    }
  };

  // ==========================================================================
  // 6. JUICE — hitstop, shake y estelas
  // ==========================================================================
  const Juice = {
    /** Frames de hitstop según el golpe (3-5 en golpes normales, más en golpes pesados). */
    hitstopFor(d, { blocked = false, heavy = false, mega = false, kind = 'punch' } = {}) {
      const H = Config.HITSTOP;
      if (blocked) return H.block;
      if (mega) return H.mega;
      if (heavy) return H.heavy;
      if (d >= 10) return H.medium + 1;
      return kind === 'kick' ? H.medium : d >= 6 ? H.light + 1 : H.light;
    },

    /** Sacudida con decaimiento exponencial y sesgo en la dirección del golpe. Devuelve [ox, oy]. */
    shakeOffset(amount, dir) {
      if (amount <= 0) return [0, 0];
      return [(Math.random() - .5) * amount + dir * amount * .35, (Math.random() - .5) * amount * .6];
    },
    shakeDecay(amount) { return amount > .6 ? amount * Config.SHAKE_DECAY : 0 },

    /** Vibración de la víctima durante el hitstop (±px alternando cada frame). */
    victimJitter(hstop, frameCounter) { return hstop > 0 ? ((frameCounter & 1) ? 1 : -1) * Math.min(4, 1.5 + hstop * .25) : 0 }
  };

  /**
   * Ribbons de trayectoria: la punta del golpe deja una estela vectorial curva.
   * Se dibujan con 'lighter' y se desvanecen en ~9 frames.
   */
  const Ribbons = {
    list: [],
    clear() { this.list.length = 0 },
    /** Añade un tramo entre la posición anterior y la actual de la punta. */
    push(x0, y0, x1, y1, face, color, width, bend) {
      this.list.push({ x0, y0, x1, y1, face, c: color, w: width, bend, l: 9, m: 9 });
    },
    update() { this.list = this.list.filter(r => --r.l > 0) },
    draw(X) {
      if (!this.list.length) return;
      X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round';
      for (const r of this.list) {
        const a = r.l / r.m, mx = (r.x0 + r.x1) / 2, my = (r.y0 + r.y1) / 2 - r.bend;   // punto de control curvado hacia arriba
        // 3 trazos concéntricos: halo ancho tenue → núcleo fino blanco
        X.strokeStyle = r.c; X.globalAlpha = a * .35; X.lineWidth = r.w * 2.4 * a + 2;
        X.beginPath(); X.moveTo(r.x0, r.y0); X.quadraticCurveTo(mx, my, r.x1, r.y1); X.stroke();
        X.globalAlpha = a * .7; X.lineWidth = r.w * 1.2 * a + 1;
        X.beginPath(); X.moveTo(r.x0, r.y0); X.quadraticCurveTo(mx, my, r.x1, r.y1); X.stroke();
        X.strokeStyle = '#fff'; X.globalAlpha = a * .9; X.lineWidth = Math.max(1, r.w * .45 * a);
        X.beginPath(); X.moveTo(r.x0, r.y0); X.quadraticCurveTo(mx, my, r.x1, r.y1); X.stroke();
      }
      X.restore();
    }
  };

  /**
   * Posición de la punta (en coordenadas de mundo) en el frame actual del ataque.
   * El golpe sigue un ARCO: la punta sube/baja respecto al origen según `arc`
   * (patada = arco alto; puño = casi recto).
   */
  function tipPosition(f, atk) {
    const mv = atk.mv, R = atk.reachNow();
    const prog = atk.phase === Phase.ACTIVE ? Ease.outQuad(sat((atk.t - atk.su) / atk.ac)) : atk.phase === Phase.STARTUP ? 0 : 1;
    const ang = lerp(-mv.arc * .5, mv.arc, prog);       // radianes: barrido de la extremidad
    const ox = f.x + f.face * 10, oy = f.y - mv.orgY;
    return { x: ox + f.face * Math.cos(ang) * R, y: oy - Math.sin(ang) * R * .9 - (mv.orgY - mv.tipY) * prog * .5, ox, oy };
  }

  // ==========================================================================
  // 7. RIG — pose interpolada de un ataque (para dibujar)
  //    Devuelve capas [{frame, alpha}] para hacer crossfade entre poses clave
  //    y un transform (dx, rot, sx, sy) con lean / lunge / squash & stretch.
  //    Los sprites son 3 poses por golpe: sin esto el cambio es un "pop";
  //    con esto la extremidad "viaja" aunque solo haya 3 dibujos.
  // ==========================================================================
  /**
   * @param {object} f        luchador
   * @param {number[]} arr    [chamber, impacto, recuperación] (ANIM.st.punch|kick)
   * @param {number} neutral  frame de la pose neutral (idle/walk actual)
   */
  function attackRig(f, arr, neutral) {
    const a = f.atk, n = arr.length, P = Phase;
    const chamber = arr[0], impact = arr[Math.min(1, n - 1)], rec = arr[n > 2 ? n - 1 : 0];
    const big = a.type === 'kick' ? 1.35 : 1;
    const out = { layers: [], dx: 0, rot: 0, sx: 1, sy: 1 };
    const u = a.u, ph = a.phase;

    if (ph === P.STARTUP) {
      // 1) crossfade neutral → chamber en los primeros frames (adiós al "pop")
      const k = Ease.outQuad(sat(a.t / Math.min(a.su, 3)));
      out.layers.push({ frame: neutral, alpha: 1 });
      out.layers.push({ frame: chamber, alpha: k });
      // 2) en los últimos 2 frames asoma el impacto (anticipación del golpe)
      const pre = sat((a.t - (a.su - 2)) / 2);
      if (pre > 0) out.layers.push({ frame: impact, alpha: pre * .45 });
      // cuerpo: se hunde y carga el peso hacia atrás
      const e = Ease.outCubic(u);
      out.dx = -8 * big * e; out.rot = -.05 * big * e; out.sx = 1 + .05 * e; out.sy = 1 - .06 * e;
    }
    else if (ph === P.ACTIVE) {
      const e = Ease.outQuad(u), k = a.t - a.su;
      out.layers.push({ frame: chamber, alpha: 1 });
      out.layers.push({ frame: impact, alpha: Math.min(1, .55 + .45 * (k - 1)) });
      // cuerpo: lunge hacia delante, estiramiento
      out.dx = lerp(-8 * big, 12 * big, e); out.rot = lerp(-.05 * big, .07 * big, e);
      out.sx = lerp(1.05, 1.1, e); out.sy = lerp(.94, .97, e);
    }
    else {
      // RECOVERY: impacto → recuperación → neutral, todo con crossfade
      const toRec = Ease.inOutQuad(sat(u / .4)), toNeu = Ease.inOutQuad(sat((u - .65) / .35));
      out.layers.push({ frame: impact, alpha: 1 });
      out.layers.push({ frame: rec, alpha: toRec });
      if (toNeu > 0) out.layers.push({ frame: neutral, alpha: toNeu });
      const e = Ease.inOutQuad(u);
      out.dx = lerp(12 * big, 0, e); out.rot = lerp(.07 * big, 0, e);
      out.sx = lerp(1.1, 1, e); out.sy = lerp(.97, 1, e);
    }
    // Una capa opaca (alpha 1) tapa a las de abajo: se descartan para no ver el cuerpo "doble"
    let top = 0; out.layers.forEach((l, i) => { if (l.alpha >= .999) top = i });
    out.layers = out.layers.slice(top).filter(l => l.alpha > .01);
    return out;
  }

  /**
   * Estelas fantasma ("afterimages") durante ACTIVE y últimos frames de STARTUP:
   * copias del sprite a lo largo del recorrido del cuerpo. `ghosts` es el array
   * `gh` de game.js (se reutiliza para no duplicar el sistema).
   */
  function pushAttackGhost(ghosts, f, rig, frame) {
    ghosts.push({ ch: f.ch, fi: frame, x: f.x + f.face * rig.dx, y: f.y, face: f.face, l: 9, m: 9, sx: rig.sx, sy: rig.sy, rot: rig.rot, tint: f.atk.type === 'kick' ? 1 : 0 });
  }

  const Combat = { Ease, Config, Phase, Attack, Locomotion, Juice, Ribbons, reachFor, spriteForward, tipPosition, attackRig, pushAttackGhost, clamp, lerp };
  if (typeof module !== 'undefined' && module.exports) module.exports = Combat; else root.Combat = Combat;
})(typeof window !== 'undefined' ? window : globalThis);
