/* ============================================================================
 *  assist.js  ·  Fénix Fight v5.7
 *  Se carga DESPUÉS de combat.js y ANTES de game.js. Todo cuelga de `Combat`.
 *
 *    1. Timeline ...... máquina de fases genérica (in → windup → strike → ...)
 *    2. Motion ........ curvas de pose para sprites ESTÁTICOS (arco, aceleración,
 *                       squash & stretch) + posición mundial de un punto del sprite
 *    3. Assist ........ transformación Mario → Criss → Mario (un golpe pesado)
 *    4. InputBuffer ... no se pierden los botones pulsados durante el hitstop
 *
 *  No toca el DOM salvo para dibujar (X = contexto 2D que recibe por parámetro)
 *  y para crear el canvas de siluetas; la lógica corre en Node (ver test_assist.js).
 * ========================================================================== */
(function (root) {
  'use strict';
  const Combat = (typeof module !== 'undefined' && module.exports) ? require('./combat.js') : root.Combat;
  const { Ease, Config: CC, clamp, lerp } = Combat;
  const sat = t => clamp(t, 0, 1);

  // ==========================================================================
  // 1. TIMELINE — fases consecutivas con progreso 0..1 en cada una
  //    new Timeline([{n:'startup', f:12}, {n:'active', f:6}, {n:'recovery', f:16}])
  //    step() se llama UNA vez por frame y avisa de la fase que empieza.
  // ==========================================================================
  class Timeline {
    constructor(phases) {
      this.phases = phases; this.t = 0; this.idx = 0; this.done = false; this.starts = [];
      let a = 0; phases.forEach(p => { this.starts.push(a); a += p.f }); this.total = a;
    }
    get phase() { return this.done ? 'done' : this.phases[this.idx].n }
    get u() { return this.done ? 1 : sat((this.t - this.starts[this.idx]) / this.phases[this.idx].f) }
    /** @returns {{enter:string|null, done:boolean}} */
    step() {
      const ev = { enter: null, done: false };
      if (this.done) return ev;
      this.t++;
      while (this.t >= this.starts[this.idx] + this.phases[this.idx].f) {
        if (this.idx === this.phases.length - 1) { this.done = true; ev.done = true; break }
        this.idx++; ev.enter = this.phases[this.idx].n;
      }
      return ev;
    }
  }

  // ==========================================================================
  // 2. MOTION — pose de un sprite estático a lo largo de una fase
  //    Un golpe con UN solo dibujo se anima moviendo el cuerpo entero por un ARCO:
  //    cada canal (dx, dy, rot, sx, sy) tiene su propia curva de aceleración, y
  //    como rot y dx no usan la misma curva, la punta del puño dibuja una trayectoria
  //    curva en vez de una recta. Sin saltos: cada fase empieza donde acabó la anterior.
  // ==========================================================================
  const E = Object.assign({
    outQuart: t => 1 - Math.pow(1 - t, 4),
    inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }, Ease);
  const NEUTRAL = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };
  /** Keyframe: t (0..1 dentro de la fase), pose, `e` curva hacia este key, `ch` curva por canal (opcional). */
  const K = (t, pose, e, ch) => Object.assign({ t, e: e || 'linear', ch: ch || null }, NEUTRAL, pose);

  const Motion = {
    NEUTRAL, K,
    sample(keys, u) {
      u = sat(u);
      let a = keys[keys.length - 1], b = a;
      for (let i = 1; i < keys.length; i++) if (u <= keys[i].t) { a = keys[i - 1]; b = keys[i]; break }
      const span = b.t - a.t, k = span > 0 ? sat((u - a.t) / span) : 1, out = {};
      for (const c in NEUTRAL) out[c] = lerp(a[c], b[c], E[(b.ch && b.ch[c]) || b.e](k));
      return out;
    },
    /**
     * Punto del sprite (px,py relativos al ancla: px hacia delante, py negativo = hacia arriba, en px de pantalla
     * SIN escalar) → coordenadas de mundo, aplicando exactamente la misma transformación con la que se dibuja.
     */
    toWorld(x, y, face, pose, px, py) {
      const X = face * pose.sx * px, Y = pose.sy * py, th = pose.rot * face, c = Math.cos(th), s = Math.sin(th);
      return { x: x + face * pose.dx + X * c - Y * s, y: y + pose.dy + X * s + Y * c };
    }
  };

  // ==========================================================================
  // 3. ASSIST — Mario → Criss → Mario
  //
  //   IN ──▶ WINDUP ──▶ STRIKE ──▶ RECOVER ──▶ OUT ──▶ (Mario)
  //   morph   carga     avance +    castigable   morph
  //  (inmune) (telegrafía) golpe   (vulnerable)  (inmune)
  //
  //  · IN/OUT: Mario se ilumina en silueta blanca → destello → Criss emerge (y al revés).
  //    Con UNA sola imagen de Criss la transición se vende con silueta + destello + pop de escala.
  //  · Si lo golpean fuera de IN/OUT, la transformación se cancela y vuelve a Mario aturdido.
  //  · Todo el "feeling" está en Config.
  // ==========================================================================
  const Config = {
    SPRITE: {
      src: 'sprites/criss/assist.png',
      h: 172,                    // alto en px de juego (Mario ≈ 153)
      ax: .5,                    // ancla horizontal (0..1) = donde "pisa"
      footY: 14,                 // el dibujo está cortado en los muslos: se hunde un poco en el suelo
      fist: { x: .917, y: .353 } // puño adelantado dentro de la imagen (0..1), para estela y arco
    },
    FRAMES: { in: 16, windup: 12, strike: 8, recover: 16, out: 14 },   // a 60 FPS ≈ 1,1 s en total
    STRIKE: {
      d: 18,        // daño (≥14 derriba)
      reach: 104,   // alcance centro → puño al final del avance
      adv: 150,     // avance máximo en px durante STRIKE
      stop: 56,     // no se acerca más que esto al rival (nunca lo atraviesa)
      hitstop: 5    // frames de congelación al conectar (3-5)
    },
    SWAP: .45,      // momento del morph en que se cambia de silueta (0..1)
    POSES: {
      windup: [K(0, {}), K(.6, { dx: -20, dy: 6, rot: -.22, sx: 1.05, sy: .90 }, 'outCubic'), K(1, { dx: -16, dy: 5, rot: -.19, sx: 1.04, sy: .92 }, 'smooth')],
      strike: [K(0, { dx: -16, dy: 5, rot: -.19, sx: 1.04, sy: .92 }),
        K(.45, { dx: 14, dy: -5, rot: .10, sx: 1.12, sy: .97 }, 'outCubic'),                   // salta hacia delante (arco)
        K(1, { dx: 34, dy: 0, rot: .27, sx: 1.17, sy: .96 }, 'outQuart', { rot: 'outBack' })], // el torso se pasa un poco y asienta
      recover: [K(0, { dx: 34, rot: .27, sx: 1.17, sy: .96 }), K(.35, { dx: 30, rot: .24, sx: 1.15, sy: .97 }, 'linear'), K(1, {}, 'inOutQuad')]
    }
  };

  // ---- sprite de Criss (una sola imagen) y siluetas ----
  const Art = { img: null };
  function load(src) {
    if (typeof Image === 'undefined') return;
    Art.img = new Image(); Art.img.src = src || Config.SPRITE.src;
  }
  const _tint = new Map();
  /** Silueta de color plano de una imagen (canvas cacheado). Funciona en todos los navegadores (no usa ctx.filter). */
  function tint(img, col) {
    if (!img || !img.naturalWidth || typeof document === 'undefined') return null;
    let m = _tint.get(img); if (!m) _tint.set(img, m = {});
    if (m[col]) return m[col];
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
    return (m[col] = c);
  }
  const crissSpr = () => {
    const img = Art.img; if (!img || !img.complete || !img.naturalWidth) return null;
    const S = Config.SPRITE, s = S.h / img.naturalHeight, w = img.naturalWidth * s;
    return { img, w, h: S.h, ax: w * S.ax, flip: 1, fy: S.footY };
  };
  /** Mismo cálculo que drawFrame() de game.js, para poder dibujar un frame de Mario con una pose propia. */
  const marioSpr = (ch, i) => {
    const A = ch.A, im = ch.fr && ch.fr[i]; if (!A || !im || !im.naturalWidth) return null;
    const m = A.f[i], k = A.sc * (m[3] || 1);
    return { img: im, w: m[0] * k, h: m[1] * k, ax: m[2] * k, flip: A.fl && A.fl.includes(i) ? -1 : 1, fy: 0 };
  };
  function drawSpr(X, spr, x, y, face, pose, alpha, white) {
    if (alpha <= .003) return;
    X.save(); X.globalAlpha *= alpha; X.translate(x + face * pose.dx, y + spr.fy + pose.dy);
    if (pose.rot) X.rotate(pose.rot * face);
    X.scale(face * spr.flip * pose.sx, pose.sy);
    X.drawImage(white ? (tint(spr.img, '#fff') || spr.img) : spr.img, -spr.ax, -spr.h, spr.w, spr.h);
    X.restore();
  }
  /** Morph a → b pasando por silueta blanca: a(color) → a(blanco) → [destello] → b(blanco) → b(color). p: 0..1 */
  function morph(X, a, b, p, face, x, y, jit) {
    const sw = Config.SWAP;
    if (p < sw) {
      const q = p / sw, e = Ease.inQuad(q), pz = Object.assign({}, NEUTRAL, { dx: jit, sx: 1 + .06 * e, sy: 1 - .05 * e });   // se agacha cargando energía
      drawSpr(X, a, x, y, face, pz, 1, false); drawSpr(X, a, x, y, face, pz, e, true);
    } else {
      const q = (p - sw) / (1 - sw), pop = Ease.outBack(sat(q * 1.2)), pz = Object.assign({}, NEUTRAL, { sx: lerp(.88, 1, pop), sy: lerp(1.1, 1, pop) });   // sale estirado y asienta
      drawSpr(X, b, x, y, face, pz, Ease.smooth(q), false); drawSpr(X, b, x, y, face, pz, Math.pow(1 - q, 1.5), true);
    }
    const g = Math.max(0, 1 - Math.abs(p - sw) / .28);   // destello que tapa el cambio de silueta
    if (g > 0) {
      X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = g * .9;
      const gr = X.createRadialGradient(x, y - 80, 4, x, y - 80, 130); gr.addColorStop(0, '#fff'); gr.addColorStop(.4, '#ce93d8'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      X.fillStyle = gr; X.beginPath(); X.arc(x, y - 80, 130, 0, 7); X.fill(); X.restore();
    }
  }

  const PURPLE = ['#ce93d8', '#f48fb1', '#fff'];

  /** Mueve a f hacia nx sin atravesar al rival (distancia mínima o.stop), sin retroceder y dentro del escenario. */
  function moveTo(f, e, nx, o, H) {
    const stopX = e.x - f.face * o.stop, wl = H.walls();
    if ((nx - stopX) * f.face > 0) nx = (f.x - stopX) * f.face >= 0 ? f.x : stopX;
    f.x = clamp(nx, wl[0], wl[1]);
  }

  const Assist = {
    Config, load, tint, morph,
    isActive: f => !!f.xf,
    phase: f => f.xf ? f.xf.tl.phase : null,
    /** Inmune durante la transformación (IN / OUT). */
    invulnerable: f => !!f.xf && (f.xf.tl.phase === 'in' || f.xf.tl.phase === 'out'),

    /**
     * Arranca la transformación. Llamar desde cast() (tipo 'C').
     * @param f luchador (Mario) · @param e rival · @param o opciones de la habilidad (d, reach, adv, hitstop, frames…)
     * @param H hooks del juego: { sfx, ring, star, spark, dust, say, toast, shake, flash, ghost, hit, walls }
     */
    start(f, e, o, H) {
      if (f.xf) return false;
      const op = Object.assign({}, Config.STRIKE, o || {}), fr = Object.assign({}, Config.FRAMES, (o && o.frames) || {});
      f.xf = {
        o: op, h: 0, x0: f.x, prevTip: null, swapped: false,
        tl: new Timeline([{ n: 'in', f: fr.in }, { n: 'windup', f: fr.windup }, { n: 'strike', f: fr.strike }, { n: 'recover', f: fr.recover }, { n: 'out', f: fr.out }])
      };
      f.atk = null; f.dash = null; f.mvx = 0;
      if (H) { H.ring(f.x, f.y - 80, 90, '#ce93d8', 6, 16); H.spark(f.x, f.y - 80, 10, PURPLE, 7, 18) }
      return true;
    },

    /** Interrumpe (golpe recibido, congelado…): vuelve a Mario al instante con un pequeño efecto. */
    cancel(f, H) {
      if (!f.xf) return;
      f.xf = null;
      if (H) { H.ring(f.x, f.y - 90, 70, '#ce93d8', 6, 12); H.spark(f.x, f.y - 90, 10, PURPLE, 8, 16) }
    },

    /** Un frame de la máquina de estados. Llamar UNA vez por frame desde upd(). */
    step(f, e, H) {
      const xf = f.xf; if (!xf) return;
      const tl = xf.tl, o = xf.o, ev = tl.step(), ph = tl.phase, u = tl.u;
      f.mvx = 0; f.atk = null;
      const swapNow = (ph === 'in' || ph === 'out') && !xf.swapped && u >= Config.SWAP;   // momento del destello
      if (swapNow) { xf.swapped = true; H.flash('#fff', 4); H.shake(ph === 'in' ? 10 : 6); H.star(f.x, f.y - 90, 110, '#e1bee7'); H.ring(f.x, f.y - 90, 130, '#ce93d8', 8, 16); H.spark(f.x, f.y - 90, 18, PURPLE, 11, 20) }

      if (ev.enter === 'windup') { H.say(f, '¡CRISS!', 50); H.sfx('nav'); H.ring(f.x, f.y - 80, 110, '#f48fb1', 5, 14) }
      if (ev.enter === 'strike') { xf.x0 = f.x; xf.prevTip = null; H.sfx('kick'); H.shake(8); H.dust(f.x - f.face * 12, f.y + 2, 5, 1.3) }
      if (ev.enter === 'out') xf.swapped = false;

      if (ph === 'in' && f.at % 2 === 0) H.spark(f.x + (Math.random() - .5) * 60, f.y - 20, 1, PURPLE, 4, 16);          // energía que sube
      if (ph === 'windup' && f.at % 3 === 0) H.spark(f.x + f.face * 70, f.y - 95, 2, PURPLE, 5, 10);                     // se concentra en el puño

      if (ph === 'strike') {
        // avance: acelera y frena (smooth). Pico ≈ 1,5× la velocidad media (~28 px/frame, igual que tu dash): sin saltos de posición.
        moveTo(f, e, xf.x0 + f.face * o.adv * Ease.smooth(u), o, H);
        // puño: estela con el MISMO arco con el que se dibuja el sprite
        const spr = crissSpr(), S = Config.SPRITE;
        if (spr) {
          const pose = Motion.sample(Config.POSES.strike, u), tip = Motion.toWorld(f.x, f.y + S.footY, f.face, pose, (S.fist.x - S.ax) * spr.w, -(1 - S.fist.y) * spr.h);
          const p0 = xf.prevTip || { x: f.x + f.face * 10, y: tip.y + 24 };
          Combat.Ribbons.push(p0.x, p0.y, tip.x, tip.y, f.face, '#f48fb1', 10, 6); xf.prevTip = tip;
          H.ghost({ x: f.x, y: f.y, face: f.face, l: 9, m: 9, pose, draw: (X, q) => drawSpr(X, crissSpr() || spr, q.x, q.y, q.face, q.pose, 1, false) });
        }
        if (!xf.h) {
          const dx = (e.x - f.x) * f.face, reach = lerp(.55, 1, Ease.outQuad(u)) * o.reach;
          if (dx > -CC.HURT_HALF * .5 && Math.abs(e.y - f.y) < CC.HIT_Y && dx - CC.HURT_HALF <= reach) {
            xf.h = 1; H.hit(f, e, o.d, o.st || null, { kind: 'punch', hs: o.hitstop });   // hs: hitstop propio (3-5 frames)
          }
        }
      }
      if (ph === 'recover') moveTo(f, e, f.x + f.face * 1.6 * (1 - u), o, H);   // desliza un poco al frenar

      if (ev.done) {
        f.xf = null; f.cast = 0;
        H.ring(f.x, f.y - 80, 80, '#ce93d8', 5, 14); H.spark(f.x, f.y - 80, 10, PURPLE, 7, 16);
      }
    },

    /**
     * Dibuja al luchador transformado. Devuelve true si ya dibujó (game.js salta su dibujo normal).
     * Devuelve false si el sprite aún no cargó: entonces se ve a Mario normal y la lógica sigue igual.
     */
    draw(X, f) {
      const xf = f.xf, cr = crissSpr(); if (!xf || !cr || !f.ch.A) return false;
      const st = f.ch.A.st, ph = xf.tl.phase, u = xf.tl.u, face = f.face, x = f.x, y = f.y;
      if (ph === 'in') { const m = marioSpr(f.ch, st.cast[0]); if (!m) return false; morph(X, m, cr, u, face, x, y, u < Config.SWAP ? Math.sin(f.at * 2.2) * 2.2 * u : 0) }
      else if (ph === 'out') { const m = marioSpr(f.ch, st.idle[0]); if (!m) return false; morph(X, cr, m, u, face, x, y, 0) }
      else {
        const pose = Motion.sample(Config.POSES[ph], u);
        drawSpr(X, cr, x, y, face, pose, 1, false);
        if (ph === 'strike') {   // fogonazo rosado al inicio del golpe
          const t = tint(cr.img, '#f8bbd0'); if (t) { X.save(); X.globalAlpha *= .4 * (1 - u); drawSpr(X, { img: t, w: cr.w, h: cr.h, ax: cr.ax, flip: 1, fy: cr.fy }, x, y, face, pose, 1, false); X.restore() }
        }
      }
      return true;
    }
  };

  // ==========================================================================
  // 4. INPUT BUFFER — el hitstop congela upd(), pero las pulsaciones (flancos) se
  //    calculan en cada tick: sin esto, un botón pulsado durante la congelación se
  //    pierde y los combos "se comen" inputs justo después de conectar.
  //    apply() se llama UNA vez por tick con el array de inputs ya calculado.
  // ==========================================================================
  const InputBuffer = {
    keys: ['p', 'k', 's', 'x', 'a', 'd', 'g', 'q', 'u'],
    buf: [{}, {}],
    clear() { this.buf = [{}, {}] },
    /** @param I [input0, input1] con .hit  ·  @param frozen true mientras dura el hitstop */
    apply(I, frozen) {
      I.forEach((inp, i) => {
        const b = this.buf[i];
        if (frozen) { for (const k of this.keys) if (inp.hit[k]) b[k] = 1 }
        else for (const k in b) { inp.hit[k] = true; delete b[k] }   // al descongelar, se reinyecta lo pulsado
      });
    }
  };

  Object.assign(Combat, { Timeline, Motion, Assist, InputBuffer });
})(typeof window !== 'undefined' ? window : globalThis);
