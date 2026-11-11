// FÉNIX FIGHT - v0.6 (Mejoras visuales)
const C = document.getElementById('c'), X = C.getContext('2d'), W = 960, H = 540, GY = 440;

// ---------- CONTROLES ----------
const KB = [
  { l: 'KeyA', r: 'KeyD', u: 'KeyW', b: 'KeyS', p: 'KeyJ', k: 'KeyK', s: 'KeyU', x: 'KeyI', a: 'KeyL' },
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', b: 'ArrowDown', p: 'Comma', k: 'Period', s: 'Semicolon', x: 'Slash', a: 'Quote' }];
const keys = {}, prev = [{}, {}];
addEventListener('keydown', e => { keys[e.code] = 1; if (e.code.startsWith('Arrow')) e.preventDefault() });
addEventListener('keyup', e => keys[e.code] = 0);
// Lista de mandos conectados, ordenados por índice (estable mientras no se desconecten)
const pads = () => [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(g => g && g.connected).sort((a, b) => a.index - b.index);
// Asignación: el primer mando que pulse un botón es P1 y el segundo es P2 (se libera si se desconecta)
const slot = [null, null];
function claim() {
  const L = pads();
  for (let p = 0; p < 2; p++) if (slot[p] != null && !L.some(g => g.index == slot[p])) slot[p] = null;
  for (const g of L) {
    if (slot.includes(g.index)) continue;
    if (g.buttons.some(b => b.pressed) || Math.abs(g.axes[0] || 0) > .6 || Math.abs(g.axes[1] || 0) > .6) {
      const f = slot[0] == null ? 0 : slot[1] == null ? 1 : -1; if (f >= 0) slot[f] = g.index;
    }
  }
}
const padFor = i => slot[i] == null ? undefined : pads().find(g => g.index == slot[i]);
const pad = () => pads()[0];
function inp(i) {
  const o = {}, k = KB[i]; for (const a in k) o[a] = !!keys[k[a]];
  const g = padFor(i); if (g) {
    const B = n => g.buttons[n] && g.buttons[n].pressed, ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    // PS4/Xbox (mapeo estándar): 0=X/A 1=O/B 2=Cuadrado/X 3=Triángulo/Y 4=L1 5=R1 6=L2 7=R2 12-15=cruceta
    o.l = o.l || ax < -.4 || B(14); o.r = o.r || ax > .4 || B(15); o.u = o.u || ay < -.5 || B(12);
    o.b = o.b || ay > .5 || B(13) || B(4) || B(5); o.p = o.p || B(0); o.k = o.k || B(2); o.s = o.s || B(1); o.x = o.x || B(3); o.a = o.a || B(7) || B(6);
  }
  o.hit = {}; for (const a in k) o.hit[a] = o[a] && !prev[i][a];
  for (const a in k) prev[i][a] = o[a]; return o;
}

// ---------- ROSTER ----------
const R = [
  {
    id: 'cortez', n: 'Cortez', c: '#6b4f9e', s: 4,
    k: ['P', { n: 'Reprobación Directa', d: 6, v: 11, st: ['slow', 150] }], x: ['A', { n: 'Física Cuántica', pct: .4, r: 420, dl: 30, pull: 1, col: '#000' }]
  },
  {
    id: 'mono', n: 'Mono', c: '#8a8a8a', s: 4,
    k: ['P', { n: 'Trámite Pendiente', d: 4, v: 7, w: 44, st: ['slow', 150] }], x: ['F', { n: 'Paro Municipal', t: 150 }]
  },
  {
    id: 'manu', n: 'Manu', c: '#2e7d32', s: 4,
    k: ['A', { n: 'Reforestación Rápida', d: 5, r: 200, dl: 20, st: ['root', 100], col: '#2e7d32' }], x: ['A', { n: 'Tala Ilegal', d: 30, r: 2000, dl: 50, col: '#3e2723', tree: 1, sure: 1 }]
  },
  {
    id: 'mario', n: 'Mario', c: '#c62828', s: 5.5,
    k: ['A', { n: 'Golpe de lesbiana', d: 4, r: 150, dl: 5, st: ['stun', 50], col: '#fff' }], x: ['D', { n: 'Trans-formacion', d: 35, v: 28 }]
  },
  {
    id: 'gonza', n: 'Gonza', c: '#1565c0', s: 5,
    // Re-tocador: se retoca (cura, limpia estados malos y sale más rápido). Flaite: le roba la vida al rival.
    k: ['H', { n: 'Re-tocador', heal: 10, cd: 240, clean: 1, boost: 90, col: '#f8bbd0' }], x: ['A', { n: 'Flaite', d: 20, r: 150, dl: 14, st: ['stun', 30], drain: 1, col: '#7b1fa2' }]
  },
  {
    id: 'wenley', n: 'Wenley', c: '#eceff1', s: 4.5,
    k: ['P', { n: '¿Quieres Leche?', d: 2, v: 8, st: ['stun', 60], heal: 5 }], x: ['A', { n: 'Tsunami Descremado', d: 25, r: 2000, dl: 20, col: '#fff' }]
  },
  {
    id: 'manin', n: 'Manin', c: '#e65100', s: 4.5,
    k: ['P', { n: 'Ají Rocoto', d: 2, v: 9, st: ['burn', 180] }], x: ['A', { n: 'Furia Inca', d: 28, r: 2000, dl: 50, col: '#795548' }]
  },
  {
    id: 'ale', n: 'Ale', c: '#ec407a', s: 5.5,
    k: ['Z', { n: 'Coreografía' }], x: ['P', { n: 'Army Bomb', d: 28, v: 20, w: 90 }]
  },
  {
    id: 'mati', n: 'Mati', c: '#b71c1c', s: 3.5,
    k: ['G', { n: 'Expropiación de Vida', d: 6, r: 100 }], x: ['Q', { n: 'Redistribución del Daño' }]
  },
  {
    id: 'alonso', n: 'Alonso', c: '#6a1b9a', s: 4.5,
    k: ['P', { n: 'Seducción Inevitable', d: 2, v: 9, st: ['invert', 200] }], x: ['B', { n: 'Blackout', d: 34 }]
  },
  {
    id: 'jp', n: 'JP', c: '#f9a825', s: 5,
    k: ['P', { n: 'Chancleta Voladora', d: 9, v: 14, w: 46, st: ['stun', 35], sp: 'chancla' }], x: ['P', { n: 'Resaca del Domingo', d: 16, v: 24, w: 170, st: ['invert', 240], col: '#9ccc65' }]
  },
  {
    // Benja: Omnitrix defectuoso. La habilidad saca un alien al azar (a veces sale bien, a veces es Wi-Fi). pv: en la selección muestra la imagen de Ben 10.
    id: 'benja', n: 'Benja', c: '#ff7043', s: 5.2, ext: 'png', pv: 1,
    k: ['R', {
      n: 'Omnitrix Fallido', cd: 150, pool: [
        ['A', { n: '¡Cuatrobrazos!', d: 16, r: 150, dl: 8, st: ['stun', 45], col: '#e53935' }],
        ['D', { n: '¡XLR8! (sin frenos)', d: 14, v: 30 }],
        ['H', { n: '¡Merienda Alienígena!', heal: 14, col: '#80deea' }],
        ['H', { n: '¡Ups, era Wi-Fi!', heal: -8, col: '#ff5252' }],
        ['A', { n: '¡Fuego Pantanoso! (huele mal)', d: 12, r: 200, dl: 12, st: ['burn', 120], col: '#ff6d00' }],
        ['A', { n: '¡Gancho Antiaéreo!', d: 10, r: 110, dl: 3, up: 1 }]]
    }],
    x: ['A', { n: 'Gran Chico Pisotón', d: 28, r: 260, dl: 40, st: ['stun', 70], col: '#76ff03' }]
  },
  {
    id: 'tormenta', n: 'Tormenta', c: '#455a64', s: 5.5,
    k: ['A', { n: 'Mordisco', d: 7, r: 100, dl: 8, st: ['stun', 40], col: '#fff' }], x: ['A', { n: 'Aullido de Tormenta', d: 22, r: 2000, dl: 45, st: ['slow', 150], col: '#90caf9' }]
  },
  {
    id: 'villarroel', n: 'Villarroel', c: '#5c7fb0', s: 4,
    k: ['P', { n: 'Mano Helada', d: 5, v: 11, st: ['slow', 120], col: '#b3e5fc' }], x: ['A', { n: 'Ventisca', d: 20, r: 2000, dl: 45, st: ['freeze', 60], col: '#e1f5fe' }]
  },
  {
    // Rafa: cura, no pelea. Un solo golpe (la patada repite el mismo golpe), se sana a sí mismo y su especial es el campanazo.
    id: 'rafa', n: 'Rafa', c: '#424242', s: 3.6, ext: 'png', nk: 1,
    k: ['H', { n: 'Sanación', heal: 14, cd: 300, col: '#69f0ae' }], x: ['A', { n: 'El Tocador', d: 18, r: 2000, dl: 50, st: ['stun', 100], col: '#ffd54f' }]
  },
  {
    // Rosita: abuela con sopaipillas y puños de energía azul.
    id: 'rosita', n: 'Rosita', c: '#c2185b', s: 4.6, ext: 'png',
    k: ['P', { n: 'Golpe de Sopaipilla', d: 8, v: 13, w: 50, st: ['stun', 30], col: '#f5b041', sp: 'sopa' }], x: ['P', { n: 'Puño de Abuela', d: 24, v: 28, w: 120, st: ['stun', 50], col: '#4fc3f7' }]
  }];

// Carga de imágenes (retratos y cuerpos completos)
R.forEach(r => {
  r.img = new Image();
  // Retrato: img/<id>.jpg (o .png si el personaje lo indica); si no existe prueba la otra extensión
  const ex = r.ext || 'jpg'; r.img.onerror = () => { if (!r.tried) { r.tried = 1; r.img.src = 'img/' + r.id + '.' + (ex == 'jpg' ? 'png' : 'jpg') } };
  r.img.src = 'img/' + r.id + '.' + ex;

  r.full = new Image();
  r.full.src = 'img/' + r.id + '_full.png'; // Los sprites de cuerpo completo (respaldo)

  // Frames de animación (carpeta sprites/<id>/<n>.png, datos en anim.js)
  const A = (typeof ANIM !== 'undefined') && ANIM[r.id];
  if (A) { r.A = A; r.fr = A.f.map((_, i) => { const im = new Image(); im.src = 'sprites/' + r.id + '/' + i + '.png'; return im }) }
});

// ---------- ESTADO ----------
let sc = 'title', tt = 0, mi = 0, oi = 0, snd = (() => { try { return localStorage.getItem('sfSnd') != '0' } catch (e) { return true } })(), cur = [0, 5], lock = [0, 0], selT = 0, selGo = 0, F = [], proj = [], fx = [], trees = [], dog = null, dark = 0, shake = 0, flashC = null, flashT = 0;
let paused = false, pi = 0, pz = {}, timer = 99, tf = 0, state = 'intro', stT = 0, msg = '', round = 1, toasts = [];
const S0 = () => ({ slow: 0, stun: 0, root: 0, invert: 0, freeze: 0, burn: 0 });
const mk = (i, ch) => ({ i, ch, wins: 0, ...fresh(i) });
function fresh(i) { return { x: i ? 720 : 240, y: GY, vx: 0, vy: 0, hp: 100, face: i ? -1 : 1, atk: null, dash: null, cd: { k: 0, x: 0 }, assist: 1, hs: 0, parry: 0, dance: 0, boost: 0, blk: 0, at: 0, cast: 0, mv: false, gh: 100, sq: 0, kt: 0, s: S0() } }
function startRound() { F.forEach(f => Object.assign(f, fresh(f.i))); proj = []; fx = []; trees = []; gh = []; hstop = 0; bt = 0; pt = pt.filter(p => p.k == 'ember'); dog = null; dark = 0; timer = 99; tf = 0; state = 'intro'; stT = 75; msg = 'RONDA ' + round }
function startMatch() { F = [mk(0, R[cur[0]]), mk(1, R[cur[1]])]; round = 1; sc = 'fight'; startRound() }
const toast = (t, f) => toasts.push({ t, f, l: 70 });
// ---------- SONIDO (WebAudio, sin archivos) ----------
let AC = null;
function sfx(k) {
  if (!snd) return; try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state == 'suspended') AC.resume();
    const P = { nav: [520, .05, 'square'], ok: [780, .12, 'square'], hit: [160, .1, 'sawtooth'], sp: [330, .3, 'triangle'], ko: [110, .6, 'sawtooth'] }[k], t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.type = P[2]; o.frequency.setValueAtTime(P[0], t); o.frequency.exponentialRampToValueAtTime(P[0] * (k == 'sp' ? 2.5 : .5), t + P[1]);
    g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + P[1]); o.connect(g); g.connect(AC.destination); o.start(); o.stop(t + P[1])
  } catch (e) { }
}


// ---------- EFECTOS (partículas, hitstop, cámara) ----------
let pt = [], gh = [], hstop = 0, bt = 0;
const cam = { x: W / 2, z: 1 }, rnd = (a, b) => a + Math.random() * (b - a);
function spark(x, y, n, cols, sp, life) { for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(sp * .4, sp); pt.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, l: life + rnd(-4, 6), m: life + 6, c: cols[i % cols.length], g: .25 }) } }
function dust(x, y, n, s) { for (let i = 0; i < n; i++) pt.push({ k: 'dust', x: x + rnd(-10, 10), y: y - rnd(0, 4), vx: rnd(-1.6, 1.6) * s, vy: rnd(-1.4, -.2), l: 26, m: 26, r: rnd(5, 11) * s, c: '#d7c7a6', g: 0 }) }
function ring(x, y, R, c, w, life, flat) { pt.push({ k: 'ring', x, y, r: 6, R, l: life, m: life, c, w: w || 6, flat }) }
function star(x, y, s, c) { pt.push({ k: 'star', x, y, r: s, l: 9, m: 9, c, a: rnd(0, 3) }) }
function dmgText(x, y, v, c) { pt.push({ k: 'txt', x, y, vx: rnd(-.6, .6), vy: -1.6, l: 48, m: 48, t: String(v), c }) }
const ember = y => ({ k: 'ember', x: rnd(0, W), y: y == null ? H + 8 : y, vx: rnd(-.2, .2), vy: -rnd(.4, 1.3), l: (260 + rnd(0, 200)) | 0, m: 300, r: rnd(1, 3), ph: rnd(0, 60), c: ['#ffb74d', '#ff7043', '#ffe082'][(Math.random() * 3) | 0] });
function impact(f, e, d, blocked) {
  const x = e.x - f.face * 18, y = e.y - 95 - rnd(0, 30), big = d >= 15;
  if (blocked) { spark(x, y, 8, ['#4fc3f7', '#fff'], 6, 14); ring(x, y, 46, '#4fc3f7', 4, 12); return }
  spark(x, y, big ? 26 : 14, ['#fff', '#ffd54f', '#ff7043'], big ? 13 : 9, 18);
  star(x, y, big ? 70 : 42, '#fff59d'); ring(x, y, big ? 110 : 70, '#fff', 5, 14);
  dmgText(x + rnd(-14, 14), y - 30, Math.round(d), big ? '#ff5252' : '#fff')
}
function ptUpd() {
  pt = pt.filter(p => {
    p.l--;
    if (p.k == 'ring') { p.r += (p.R - p.r) * .25; return p.l > 0 }
    if (p.k == 'star') return p.l > 0;
    p.x += p.vx || 0; p.y += p.vy || 0; if (p.g) p.vy += p.g;
    if (p.k == 'spark') p.vx *= .93;
    if (p.k == 'dust') p.r += .35;
    if (p.k == 'ember') p.x += Math.sin((p.l + p.ph) / 20) * .6;
    return p.l > 0
  });
  gh = gh.filter(g => --g.l > 0)
}
function drawPt() {
  pt.forEach(p => {
    const a = Math.max(0, p.l / p.m); X.save();
    if (p.k == 'spark') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = Math.min(1, a * 1.5); X.strokeStyle = p.c; X.lineWidth = 3 * a + 1; X.lineCap = 'round'; X.beginPath(); X.moveTo(p.x, p.y); X.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); X.stroke() }
    else if (p.k == 'dust') { X.globalAlpha = a * .45; X.fillStyle = p.c; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 7); X.fill() }
    else if (p.k == 'ring') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = a; X.strokeStyle = p.c; X.lineWidth = p.w * a + 1; X.beginPath(); if (p.flat) X.ellipse(p.x, p.y, p.r, p.r * .2, 0, 0, 7); else X.arc(p.x, p.y, p.r, 0, 7); X.stroke() }
    else if (p.k == 'star') {
      X.globalCompositeOperation = 'lighter'; X.globalAlpha = a; X.translate(p.x, p.y); X.rotate(p.a); const s = p.r * (.4 + .6 * (1 - a)); X.fillStyle = p.c; X.beginPath();
      for (let i = 0; i < 16; i++) { const r = i % 2 ? s * .26 : s, an = i * Math.PI / 8; X.lineTo(Math.cos(an) * r, Math.sin(an) * r) } X.closePath(); X.fill()
    }
    else if (p.k == 'txt') { X.globalAlpha = Math.min(1, a * 2); X.font = 'bold ' + (24 + (1 - a) * 6 | 0) + 'px Impact,sans-serif'; X.textAlign = 'center'; X.lineJoin = 'round'; X.lineWidth = 5; X.strokeStyle = '#000'; X.strokeText(p.t, p.x, p.y); X.fillStyle = p.c; X.fillText(p.t, p.x, p.y) }
    else if (p.k == 'ember') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = Math.min(1, p.l / 60) * .8; X.fillStyle = p.c; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 7); X.fill() }
    else if (p.k == 'glow') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = a * .55; const g = X.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r); g.addColorStop(0, p.c); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 7); X.fill() }
    X.restore()
  })
}

// Dibuja un retrato en un cuadrado w×w. Si la imagen es mucho más alta que ancha (Rafa, Rosita) recorta la parte de arriba (la cara) en vez de aplastarla.
function dI(im, x, y, w) { const iw = im.naturalWidth, ih = im.naturalHeight; if (ih > iw * 1.15) X.drawImage(im, 0, 0, iw, iw, x, y, w, w); else X.drawImage(im, x, y, w, w) }
// ---------- COMBATE ----------
function hit(f, e, d, st, o = {}) {
  if (e.parry > 0 && !o.sure) { f.s.stun = 50; e.parry = 0; toast('¡PARRY!', e); ring(e.x, e.y - 90, 90, '#fff', 8, 16); spark(e.x, e.y - 90, 16, ['#fff', '#4fc3f7'], 11, 16); hstop = 8; return }
  if (e.dance > 0) { d *= 1.5; e.dance = 0 }
  const bk = e.blk && !o.sure;   // o.sure: golpe garantizado, el bloqueo no lo frena
  if (bk) { d *= .2 } else { e.hs = 12; e.vx = f.face * 7; e.atk = null; if (st) e.s[st[0]] = st[1]; if (o.pull) e.x = f.x + f.face * 60; if (o.up) e.vy = -14 }
  sfx(bk ? 'nav' : 'hit'); const hb = e.hp; e.hp = Math.max(0, e.hp - d);
  if (o.drain) { const g = (hb - e.hp) * o.drain; if (g > 0) { f.hp = Math.min(100, f.hp + g); spark(f.x, f.y - 90, 14, ['#e040fb', '#fff'], 7, 22); dmgText(f.x, f.y - 190, '+' + Math.round(g), '#e040fb') } }
  shake = Math.min(12, d / 2 + 3);
  impact(f, e, d, bk); hstop = Math.max(hstop, bk ? 2 : d >= 20 ? 9 : d >= 10 ? 6 : 3);
  if (o.heal) f.hp = Math.min(100, f.hp + o.heal);
}
function cast(f, e, m) {
  const isX = m == f.ch.x; if (m[0] == 'R') m = m[1].pool[(Math.random() * m[1].pool.length) | 0];   // R: habilidad al azar de una lista
  const [t, o] = m; toast(o.n, f); sfx('sp'); f.cast = 22; f.cp = isX ? 'cast2' : 'cast';
  if (o.heal && t != 'P') { const b = f.hp; f.hp = Math.max(1, Math.min(100, f.hp + o.heal)); if (t == 'H') { const dv = Math.round(f.hp - b), good = o.heal > 0; spark(f.x, f.y - 90, 20, good ? ['#b9f6ca', '#fff'] : ['#ff5252', '#fff'], 6, 26); ring(f.x, f.y - 90, 120, o.col || '#69f0ae', 6, 22); dmgText(f.x, f.y - 160, (dv > 0 ? '+' : '') + dv, good ? '#69f0ae' : '#ff5252') } }
  if (o.clean) for (const k in f.s) f.s[k] = 0;   // limpia estados (lento, quemado, confundido...)
  if (o.boost) f.boost = o.boost;                  // velocidad x1.5 por un rato
  if (t == 'P') proj.push({ x: f.x + f.face * 40, y: f.y - 85, vx: f.face * o.v, w: o.w || 30, o, f, e, life: 100 });
  if (t == 'A') { if (o.tree) trees.push({ t: o.dl, m: o.dl, f, e, o, sx: f.x + f.face * 24, sy: f.y - 175, land: 0 }); else fx.push({ t: o.dl, m: o.dl, f, e, o }) }
  if (t == 'D') f.dash = { v: o.v, t: 22, o, h: 0 };
  if (t == 'F') e.s.freeze = o.t;
  if (t == 'Q') { const a = (f.hp + e.hp) / 2; f.hp = e.hp = a }
  if (t == 'K') f.parry = 25;
  if (t == 'Z') f.dance = 120;
  if (t == 'B') { dark = 100; fx.push({ t: 100, m: 100, f, e, o: { d: o.d, r: 300, col: '#000' } }) }
  if (t == 'G' && Math.abs(e.x - f.x) < o.r) { hit(f, e, o.d, null, {}); f.hp = Math.min(100, f.hp + o.d) }
}
function upd(f, e, I) {
  const s = f.s, px = f.x; f.face = e.x > f.x ? 1 : -1; f.at++; f.cast--;
  for (const k in s) if (s[k] > 0) s[k]--;
  if (s.burn > 0) f.hp = Math.max(0, f.hp - .07);
  f.cd.k--; f.cd.x--; f.hs--; f.parry--; f.boost--;
  if (f.dance > 0 && --f.dance == 0) f.boost = 120;
  const gr = f.y >= GY, can = !(s.stun > 0 || s.freeze > 0 || f.hs > 0 || f.dash || f.dance > 0);
  let L = I.l, Rt = I.r; if (s.invert > 0) [L, Rt] = [Rt, L];
  f.blk = can && gr && I.b && !f.atk;
  if (can && !f.atk && !f.blk) {
    const sp = f.ch.s * (s.slow > 0 ? .5 : 1) * (f.boost > 0 ? 1.5 : 1);
    if (s.root <= 0) { if (L) f.x -= sp; if (Rt) f.x += sp }
    if (I.u && gr && s.root <= 0) { f.vy = -16; dust(f.x, GY + 2, 5, 1) }
    if (I.hit.p || (I.hit.k && f.ch.nk)) f.atk = { t: 0, su: 4, ac: 3, rc: 12, d: 6, r: 70, h: 0 };   // nk: personaje sin patada (Rafa) -> mismo golpe
    else if (I.hit.k) f.atk = { t: 0, su: 7, ac: 4, rc: 14, d: 9, r: 90, h: 0 };
    else if (I.hit.s && f.cd.k <= 0) { f.cd.k = f.ch.k[1].cd || 90; cast(f, e, f.ch.k) }
    else if (I.hit.x && f.cd.x <= 0) { f.cd.x = 480; cast(f, e, f.ch.x) }
    else if (I.hit.a && f.assist) { f.assist = 0; dog = { x: f.x, dir: f.face, e, f }; toast('¡Tormenta!', f) }
  }
  if (f.dash) { const d = f.dash; if (hasAnim(f.ch) && f.at % 2 == 0) gh.push({ ch: f.ch, fi: poseFrame(f), x: f.x, y: f.y, face: f.face, l: 14, m: 14 }); f.x += f.face * d.v; if (!d.h && Math.abs(e.x - f.x) < 60) { d.h = 1; hit(f, e, d.o.d, null, {}) } if (--d.t <= 0) f.dash = null }
  const a = f.atk;
  if (a) {
    a.t++;
    if (a.t > a.su && a.t <= a.su + a.ac && !a.h && (e.x - f.x) * f.face > 0 && Math.abs(e.x - f.x) < a.r && Math.abs(e.y - f.y) < 110) { a.h = 1; hit(f, e, a.d) }
    if (a.t > a.su + a.ac + a.rc) f.atk = null
  }
  f.vy += .8; f.y += f.vy; if (f.y > GY) { if (f.vy > 4) { f.sq = 1; dust(f.x, GY + 2, 8, 1.2) } f.y = GY; f.vy = 0 }
  f.sq *= .82; if (f.mv && gr && f.at % 9 == 0) dust(f.x - f.face * 12, GY + 2, 2, .7);
  f.x += f.vx; f.vx *= .85; f.x = Math.max(40, Math.min(W - 40, f.x));
  f.mv = Math.abs(f.x - px) > .6;
}
// Proyectiles con dibujo propio: o.sp = 'sopa' (sopaipilla) | 'chancla' (chancleta)
function projArt(p) {
  const c = p.o.col || p.f.ch.c, a = p.life * .45 * (p.vx > 0 ? -1 : 1);
  X.save(); X.globalCompositeOperation = 'lighter'; const gl = X.createRadialGradient(p.x, p.y, 2, p.x, p.y, 44); gl.addColorStop(0, c); gl.addColorStop(1, 'rgba(0,0,0,0)'); X.globalAlpha = .45; X.fillStyle = gl; X.beginPath(); X.arc(p.x, p.y, 44, 0, 7); X.fill(); X.restore();
  X.save(); X.translate(p.x, p.y); X.rotate(a); X.lineJoin = 'round';
  if (p.o.sp == 'sopa') {
    const g = X.createRadialGradient(-6, -6, 2, 0, 0, 26); g.addColorStop(0, '#ffd877'); g.addColorStop(.6, '#e9a028'); g.addColorStop(1, '#b8650f');
    X.fillStyle = g; X.strokeStyle = '#6d3a0a'; X.lineWidth = 3; X.beginPath(); X.arc(0, 0, 25, 0, 7); X.fill(); X.stroke();
    X.fillStyle = 'rgba(255,240,170,.75)'; [[-9, -8, 6, 4], [8, -3, 5, 4], [-3, 9, 7, 4], [10, 11, 4, 3]].forEach(b => { X.beginPath(); X.ellipse(b[0], b[1], b[2], b[3], 0, 0, 7); X.fill() });
    X.fillStyle = 'rgba(120,60,10,.55)'; [[3, -12, 2], [-12, 3, 2], [13, 6, 2.2], [-4, 0, 2]].forEach(b => { X.beginPath(); X.arc(b[0], b[1], b[2], 0, 7); X.fill() })
  } else {
    X.fillStyle = '#1e88e5'; X.strokeStyle = '#0b3d75'; X.lineWidth = 3; X.beginPath(); X.ellipse(0, 0, 30, 15, 0, 0, 7); X.fill(); X.stroke();
    X.fillStyle = '#90caf9'; X.beginPath(); X.ellipse(-4, -2, 20, 8, 0, 0, 7); X.fill();
    X.strokeStyle = '#fff'; X.lineWidth = 6; X.lineCap = 'round'; X.beginPath(); X.moveTo(-8, -9); X.lineTo(10, 0); X.lineTo(-8, 9); X.stroke()
  }
  X.restore()
}
// Árbol (copa hacia arriba cuando ang = 0), centrado en (x, y)
function treeArt(x, y, ang, sz, al) {
  X.save(); X.translate(x, y); X.rotate(ang); X.scale(sz, sz); X.globalAlpha = al; X.lineJoin = 'round';
  X.fillStyle = '#6d4c41'; X.strokeStyle = '#2b1710'; X.lineWidth = 3.5;
  X.beginPath(); X.moveTo(-10, 54); X.lineTo(-7, -22); X.lineTo(7, -22); X.lineTo(10, 54); X.closePath(); X.fill(); X.stroke();
  X.strokeStyle = 'rgba(30,15,10,.5)'; X.lineWidth = 2; [[-4, 48, -3, -12], [3, 44, 2, -16]].forEach(q => { X.beginPath(); X.moveTo(q[0], q[1]); X.lineTo(q[2], q[3]); X.stroke() });
  X.fillStyle = '#5d4037'; X.strokeStyle = '#2b1710'; X.lineWidth = 3;   // raíces
  X.beginPath(); X.moveTo(-10, 50); X.quadraticCurveTo(-26, 56, -32, 72); X.quadraticCurveTo(-14, 66, -4, 60); X.quadraticCurveTo(2, 74, 14, 78); X.quadraticCurveTo(14, 62, 10, 50); X.closePath(); X.fill(); X.stroke();
  X.fillStyle = '#4e342e'; X.beginPath(); X.ellipse(-2, 66, 9, 5, .3, 0, 7); X.fill();
  for (let i = 0; i < 3; i++) {   // copa en 3 pisos
    const b = -14 - i * 28, hw = 46 - i * 9;
    X.fillStyle = i == 1 ? '#388e3c' : '#2e7d32'; X.strokeStyle = '#163f1a'; X.lineWidth = 3;
    X.beginPath(); X.moveTo(-hw, b); X.lineTo(0, b - 50); X.lineTo(hw, b); X.closePath(); X.fill(); X.stroke();
    X.strokeStyle = 'rgba(165,214,167,.55)'; X.lineWidth = 3; X.beginPath(); X.moveTo(-hw * .55, b - 8); X.lineTo(-4, b - 38); X.stroke()
  }
  X.restore()
}
function world() {
  fx = fx.filter(z => {
    if (--z.t > 0) return true; const { f, e, o } = z;
    if (Math.abs(e.x - f.x) < o.r) hit(f, e, o.pct ? e.hp * o.pct : o.d, o.st, o);
    const bc = o.col && o.col != '#000' ? o.col : '#b388ff'; ring(f.x, GY, Math.min(o.r, 520), bc, 10, 22, 1); spark(f.x, GY - 20, 18, [bc, '#fff'], 10, 22);
    flashC = o.col || '#fff'; flashT = 10; shake = Math.max(shake, 8); return false
  });
  trees = trees.filter(z => {
    const { f, e, o } = z;
    if (z.t > 0) {
      if (--z.t == 0) {   // impacto: cae donde esté el rival ahora mismo (no importa si saltó, se alejó o se cubrió)
        z.lx = e.x; z.ly = e.y - 70; hit(f, e, o.d, o.st, o); z.land = 42;
        spark(e.x, e.y - 60, 30, ['#43a047', '#a5d6a7', '#6d4c41', '#fff'], 13, 26); dust(e.x, GY + 2, 14, 1.6); ring(e.x, GY, 170, '#8d6e63', 9, 22, 1);
        flashC = '#c8e6c9'; flashT = 8; shake = Math.max(shake, 14)
      }
      return true
    }
    return --z.land > 0
  });
  proj = proj.filter(p => {
    p.x += p.vx; p.life--; pt.push({ k: 'glow', x: p.x - p.vx * .5, y: p.y + rnd(-8, 8), vx: 0, vy: 0, l: 12, m: 12, r: 14, c: p.o.col || p.f.ch.c });
    if (Math.abs(p.x - p.e.x) < p.w / 2 + 25 && Math.abs(p.y - (p.e.y - 70)) < 80) { hit(p.f, p.e, p.o.d, p.o.st, p.o); return false }
    return p.life > 0 && p.x > -100 && p.x < W + 100
  });
  if (dog) { dust(dog.x, GY + 2, 1, .8); dog.x += dog.dir * 14; if (Math.abs(dog.x - dog.e.x) < 40) { dog.e.s.freeze = 90; dog = null } else if (dog.x < -50 || dog.x > W + 50) dog = null }
}
function endRound(w) {
  sfx('ko'); trees = []; if (w >= 0) F[w].wins++;
  msg = w < 0 ? '¡EMPATE!' : F[w].ch.n + ' gana la ronda'; state = 'ko'; stT = 130; bt = 0;
  if (w >= 0) { const l = F[1 - w]; spark(l.x, l.y - 90, 40, ['#fff', '#ffd54f', '#ff7043'], 16, 30); ring(l.x, l.y - 90, 180, '#fff', 10, 24); star(l.x, l.y - 90, 130, '#fff59d'); flashC = '#fff'; flashT = 14; shake = 16 }
  if (F.some(f => f.wins >= 2)) { msg = F[w].ch.n.toUpperCase() + ' GANA LA RETA'; state = 'over'; stT = 60 }
}

// ---------- DIBUJO ----------
function head(f, x, y, r) {
  const im = f.ch.img; X.save(); X.beginPath(); X.arc(x, y, r, 0, 7); X.clip();
  if (im.complete && im.naturalWidth) dI(im, x - r, y - r, 2 * r);
  else { X.fillStyle = '#555'; X.fillRect(x - r, y - r, 2 * r, 2 * r); X.fillStyle = '#fff'; X.font = 'bold ' + r + 'px sans-serif'; X.textAlign = 'center'; X.fillText(f.ch.n[0], x, y + r / 3) }
  X.restore(); X.beginPath(); X.arc(x, y, r, 0, 7); X.lineWidth = 3; X.strokeStyle = '#fff'; X.stroke()
}
function portrait(ch, x, y, w, rad, line, lw) {
  const im = ch.img; X.save(); X.beginPath(); X.roundRect(x, y, w, w, rad); X.clip();
  if (im.complete && im.naturalWidth) dI(im, x, y, w);
  else { X.fillStyle = ch.c; X.fillRect(x, y, w, w); X.fillStyle = '#fff'; X.font = 'bold ' + w / 2 + 'px sans-serif'; X.textAlign = 'center'; X.fillText(ch.n[0], x + w / 2, y + w * .67) }
  X.restore(); X.beginPath(); X.roundRect(x, y, w, w, rad); X.lineWidth = lw || 3; X.strokeStyle = line || '#fff'; X.stroke()
}
// ---------- ANIMACIÓN POR FRAMES ----------
const frOK = (ch, i) => ch.fr && ch.fr[i] && ch.fr[i].complete && ch.fr[i].naturalWidth > 0;
const hasAnim = ch => !!ch.A && frOK(ch, ch.A.st.idle[0]);
// Dibuja el frame i con los pies en (x, gy). El ancla X mantiene al personaje en su sitio aunque estire brazo/pierna.
function drawFrame(ch, i, x, gy, face, mul, sx, sy) {
  if (!frOK(ch, i)) i = ch.A.st.idle[0];
  const A = ch.A, m = A.f[i], k = A.sc * (mul || 1) * (m[3] || 1), w = m[0] * k, h = m[1] * k, fl = A.fl && A.fl.includes(i) ? -1 : 1;   // m[3]: ajuste de escala opcional por frame
  X.save(); X.translate(x, gy); X.scale(face * fl * (sx || 1), sy || 1); X.drawImage(ch.fr[i], -m[2] * k, -h, w, h); X.restore();
}
// Elige el frame según lo que esté haciendo el luchador
function poseFrame(f) {
  const S = f.ch.A.st, s = f.s, a = f.atk, t = f.at, loop = (arr, sp) => arr[((t / sp) | 0) % arr.length];
  if (f.hs > 0 || s.stun > 0) return S.hit[0];
  if (s.freeze > 0) return S.idle[0];
  if (f.blk) return S.block[0];
  if (f.dash) return S.kick[Math.min(1, S.kick.length - 1)];
  if (a) {
    const arr = a.r > 80 ? S.kick : S.punch, n = arr.length;
    if (a.t <= a.su) return arr[0];
    if (a.t <= a.su + a.ac + 4) return arr[Math.min(1, n - 1)];
    return arr[n > 2 ? n - 1 : 0];
  }
  if (f.cast > 0) return (S[f.cp] || S.cast)[0];   // cast2 = pose del especial (si el personaje la tiene)
  if (f.y < GY - 6) return S.jump[f.vy < 0 ? 0 : S.jump.length - 1];
  if (f.dance > 0) return loop(S.walk, 4);
  if (f.mv) return loop(S.walk, 7);
  return loop(S.idle, 14);
}
function hasSprite(ch) { return !!(ch.full && ch.full.complete && ch.full.naturalWidth) }
function sprite(ch, x, gy, h, face) {
  const im = ch.full, w = h * im.naturalWidth / im.naturalHeight;
  X.save(); X.translate(x, gy); X.scale(face, 1); X.drawImage(im, -w / 2, -h, w, h); X.restore()
}
// ---------- SKINS (pixel-art procedural, por personaje) ----------
const SK = {
  cortez: { sk: '#e3b08a', top: '#26262e', pants: '#1d1d26', sl: 'L', deco: 'logo', sh: '#f2f2f2' },
  mono: { sk: '#d9a47c', top: '#f6dd3b', pants: '#cdbd91', sl: 'S', deco: 'pocket', sh: '#f2f2f2' },
  manu: { sk: '#d9a47c', top: '#5f7a3a', pants: '#56703a', sl: 'L', deco: 'camo', pc: 1, sh: '#eee' },
  mario: { sk: '#e0b08c', top: '#18181c', pants: '#18181c', sl: 'L', deco: 'zip', ps: 1, sh: '#fff' },
  gonza: { sk: '#d4a07a', top: '#6d7a3c', pants: '#5a6b34', sl: 'S', deco: 'vest', pc: 1, knee: 1, sh: '#eee' },
  wenley: { sk: '#6b4430', top: '#4e7a54', pants: '#25272b', sl: 'L', deco: 'stripes', sh: '#fff' },
  manin: { sk: '#e3b08a', top: '#1c1c22', pants: '#2f5a96', sl: 'S', deco: 'logo', sh: '#222' },
  ale: { sk: '#e8bc98', top: '#1e1e26', pants: '#1a1a22', sl: 'L', deco: 'hood', sh: '#fff' },
  mati: { sk: '#e0b08c', top: '#8d939c', pants: '#767c85', sl: 'L', deco: 'hood', sh: '#fff' },
  alonso: { sk: '#e0ae88', top: '#6a7a42', pants: '#5b6b3a', sl: 'S', deco: 'apron', sh: '#fff' },
  jp: { sk: '#e0ae88', top: '#17171b', pants: '#2b4a7c', sl: 'S', deco: 'logo', sh: '#e8e8e8' },
  benja: { sk: '#d9a47c', top: '#1d1d28', pants: '#232a45', sl: 'L', deco: 'redvest', sh: '#fff' },
  tormenta: { sk: '#e8dcc8', top: '#2b3a55', pants: '#3d4a3a', sl: 'S', deco: 'vest', sh: '#eee' },
  villarroel: { sk: '#d9a47c', top: '#6f93c4', pants: '#2f5a96', sl: 'L', deco: 'hood', sh: '#222' }
};
const sh = (c, k) => { const n = parseInt(c.slice(1), 16); return '#' + [16, 8, 0].map(s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k))).toString(16).padStart(2, '0')).join('') };
function bubble(ch, x, y, r) {
  X.save(); X.beginPath(); X.arc(x, y, r, 0, 7); X.clip();
  const im = ch.img;
  if (im.complete && im.naturalWidth) dI(im, x - r, y - r, 2 * r); else { X.fillStyle = ch.c; X.fillRect(x - r, y - r, 2 * r, 2 * r) }
  const g = X.createRadialGradient(x - r * .3, y - r * .4, r * .1, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(.6, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,180,255,.35)');
  X.fillStyle = g; X.fillRect(x - r, y - r, 2 * r, 2 * r); X.restore();
  X.lineWidth = 5; X.strokeStyle = '#111'; X.beginPath(); X.arc(x, y, r + 1, 0, 7); X.stroke();
  X.lineWidth = 3; X.strokeStyle = '#dfefff'; X.beginPath(); X.arc(x, y, r - 1, 0, 7); X.stroke();
  X.strokeStyle = 'rgba(255,255,255,.9)'; X.lineWidth = 3; X.beginPath(); X.arc(x, y, r - 7, 3.6, 4.5); X.stroke()
}
function skin(ch, x, gy, sc, face, p) {
  p = p || {}; const o = SK[ch.id] || SK.cortez, cy = p.cy || 0, ln = p.lean || 0, ext = p.ext || 0, air = p.air, hip = -50 + cy;
  X.save(); X.translate(x, gy); X.scale(face * sc, sc); X.imageSmoothingEnabled = false;
  const B = (a, b, w, h, c) => { X.fillStyle = '#111'; X.fillRect(a - 2, b - 2, w + 4, h + 4); X.fillStyle = c; X.fillRect(a, b, w, h) }, Fr = (a, b, w, h, c) => { X.fillStyle = c; X.fillRect(a, b, w, h) };
  const top2 = sh(o.top, .72), pn2 = sh(o.pants, .72), slv = o.sl == 'L' ? o.top : o.sk;
  for (let i = 0; i < 2; i++) {
    const w = p.wlk ? Math.sin(p.ph + i * Math.PI) * 9 : 0, lx = (i ? 6 : -18) + w + (cy ? (i ? 4 : -4) : 0), up = air ? 12 : 0, lh = -hip - 8 - up;
    if (p.kick && i) { const L = 14 + ext * 50; B(2, hip, L, 15, o.pants); Fr(2, hip + 9, L, 6, pn2); B(L - 2, hip - 3, 12, 22, o.sh); continue }
    B(lx, hip, 15, lh, o.pants); Fr(lx + 10, hip, 5, lh, pn2);
    if (o.ps) Fr(lx + 1, hip, 3, lh, '#fff');
    if (o.pc) [[3, 6], [8, 16], [2, 26]].forEach(q => { if (q[1] < lh - 4) Fr(lx + q[0], hip + q[1], 5, 4, sh(o.pants, .6)) });
    if (o.knee && lh > 20) B(lx + 1, hip + lh * .45, 13, 8, '#2b2b2b');
    B(lx - 2, -8 - up, 21, 8, o.sh); Fr(lx - 2, -3 - up, 21, 3, '#999');
  }
  const tx = -20 + ln, ty = hip - 48;
  B(tx, ty, 40, 50, o.top); Fr(tx + 30, ty, 10, 50, top2); Fr(tx + 2, ty + 2, 6, 20, sh(o.top, 1.15));
  Fr(tx, hip - 5, 40, 5, '#1a1a1a'); Fr(tx + 17, hip - 5, 6, 5, '#d9b13a');
  const d = o.deco;
  if (d == 'camo') [[6, 6], [22, 10], [12, 22], [28, 28], [6, 36], [20, 40]].forEach(q => Fr(tx + q[0], ty + q[1], 9, 6, '#3b4d27'));
  if (d == 'stripes') for (let k = 6; k < 46; k += 10)Fr(tx, ty + k, 40, 4, '#2d4a33');
  if (d == 'pocket') { Fr(tx + 6, ty + 10, 11, 10, sh(o.top, .8)); Fr(tx + 17, ty, 6, 12, sh(o.top, .85)) }
  if (d == 'logo') { Fr(tx + 10, ty + 14, 20, 4, 'rgba(255,255,255,.35)'); Fr(tx + 10, ty + 22, 14, 3, 'rgba(255,255,255,.2)') }
  if (d == 'zip') { Fr(tx + 19, ty, 3, 50, sh(o.top, 1.6)) }
  if (d == 'hood') { Fr(tx + 4, ty - 4, 32, 8, top2); Fr(tx + 8, ty + 32, 24, 12, top2); Fr(tx + 13, ty + 6, 2, 16, '#fff'); Fr(tx + 25, ty + 6, 2, 16, '#fff') }
  if (d == 'vest') { Fr(tx, ty, 40, 50, '#4a5a2a'); Fr(tx + 2, ty, 36, 50, '#6d7a3c'); Fr(tx + 19, ty, 3, 50, '#2a331a'); B(tx + 4, ty + 30, 12, 12, '#55622f'); B(tx + 24, ty + 30, 12, 12, '#55622f') }
  if (d == 'redvest') { Fr(tx + 2, ty, 14, 50, '#d32f2f'); Fr(tx + 24, ty, 14, 50, '#b71c1c'); Fr(tx + 19, ty, 3, 50, '#fff') }
  if (d == 'apron') { Fr(tx + 6, ty + 8, 28, 42, '#3f6fb0'); Fr(tx + 6, ty + 8, 28, 4, '#2b4f86'); Fr(tx + 10, ty - 2, 3, 10, '#2b4f86'); Fr(tx + 27, ty - 2, 3, 10, '#2b4f86'); Fr(tx + 12, ty + 26, 16, 10, '#d32f2f'); Fr(tx + 12, ty + 26, 16, 3, '#8e1b1b') }
  B(tx + 14, ty - 8, 12, 10, o.sk);
  const arm = (sx, front) => {
    const sy = ty + 6, r = front ? ext : 0, pun = front && ext > 0 && !p.kick;
    if (p.dance) { const a = Math.sin(p.dance / 3 + (front ? 0 : 2)) * 8; B(sx, sy - 30 + a, 12, 34, slv); B(sx, sy - 44 + a, 12, 14, o.sk); return }
    if (pun) { const L = 22 + ext * 48; B(sx, sy, L, 13, slv); if (o.sl != 'L') Fr(sx + 14, sy, L - 14, 13, o.sk); B(sx + L - 2, sy - 2, 15, 16, o.sk); Fr(sx + L + 4, sy, 2, 12, sh(o.sk, .8)); return }
    B(sx, sy, 13, 24, slv); if (o.sl != 'L') Fr(sx, sy + 10, 13, 14, o.sk);
    const fy = p.blk ? sy - 20 : sy - 12; B(sx + 11, fy, 13, 30, o.sl == 'L' ? o.top : o.sk); if (o.sl == 'L') Fr(sx + 11, fy, 13, 6, sh(o.top, .8));
    B(sx + 10, fy - 12, 15, 15, o.sk); Fr(sx + 20, fy - 8, 3, 8, sh(o.sk, .8))
  };
  arm(tx - 4, 0); arm(tx + 22, 1);
  bubble(ch, ln + 2, ty - 30, 30);
  X.restore()
}
function skinPose(f) {
  const a = f.atk, m = Math.abs(f.x - (f.lx == null ? f.x : f.lx)) > .6; f.lx = f.x; if (m) f.ph = (f.ph || 0) + .38;
  let ext = 0; if (a) ext = a.t <= a.su + a.ac ? Math.min(1, a.t / Math.max(1, a.su)) : Math.max(0, 1 - (a.t - a.su - a.ac) / a.rc);
  if (f.dash) ext = 1;
  return { ph: f.ph || 0, wlk: m && f.y >= GY - 1, ext, kick: !!(a && a.r > 80), air: f.y < GY - 6, cy: f.blk ? 16 : 0, blk: f.blk, lean: f.hs > 0 ? -9 : f.dash ? 8 : 0, dance: f.dance > 0 ? f.dance : 0 }
}
function drawF(f) {
  const x = f.x, y = f.y, h = f.blk ? 105 : 140, s = f.s, an = hasAnim(f.ch), sp = hasSprite(f.ch);
  // sombra: se achica y se aclara al saltar
  const air = Math.max(0, GY - y), k = Math.max(.35, 1 - air / 320);
  X.fillStyle = 'rgba(0,0,0,' + (.42 * k) + ')'; X.beginPath(); X.ellipse(x, GY + 4, 40 * k, 9 * k, 0, 0, 7); X.fill();
  // aura al lanzar habilidades / dash / boost
  const au = f.cast > 0 || f.dash ? f.ch.c : f.boost > 0 ? '#ffd600' : null;
  if (au) {
    X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = f.dash ? .5 : Math.min(.6, .2 + Math.max(0, f.cast) / 30);
    const gr = X.createRadialGradient(x, y - 80, 10, x, y - 80, 140); gr.addColorStop(0, au); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(x - 150, y - 230, 300, 300); X.restore()
  }
  // caída al perder el round
  const dead = (state == 'ko' || state == 'over') && f.hp <= 0, koF = dead && an && f.ch.A.st.ko, ang = dead && !koF ? Math.min(1, f.kt / 22) : 0;
  X.save(); if (dead && !koF) { X.translate(0, -28 * ang); X.translate(x, y); X.rotate(-f.face * ang * 1.45); X.translate(-x, -y) }
  if (f.hs > 6) X.filter = 'brightness(2.5)';
  if (an) {
    let sx = 1 + .12 * f.sq, sy = 1 - .12 * f.sq;
    if (air > 8 && !dead) { const st = Math.min(.1, Math.abs(f.vy) * .008); sy += st; sx -= st * .6 }
    if (!f.mv && !f.atk && air < 2 && !dead) sy *= 1 + Math.sin(f.at / 10) * .01;
    if (f.mv && air < 2 && !dead && f.ch.A.st.walk.length < 2) { sy *= 1 + Math.abs(Math.sin(f.at / 4)) * .045; sx *= 1 - Math.abs(Math.sin(f.at / 4)) * .02 }   // caminar con un solo frame: rebote
    if (f.ch.A.pr && f.hs > 0 && !dead) { X.translate(x, y); X.rotate(-f.face * Math.min(1, f.hs / 12) * .16); X.translate(-x, -y) }   // sin frame de golpe recibido: retroceso
    if (koF) drawFrame(f.ch, f.kt < 8 ? f.ch.A.st.hit[0] : f.ch.A.st.ko[0], x, y, f.kt < 8 ? f.face : -f.face, 1, 1, 1)
    else drawFrame(f.ch, dead ? f.ch.A.st.hit[0] : poseFrame(f), x, y, f.face, 1, sx, sy)
  }
  else if (sp) sprite(f.ch, x, y, h + 14, f.face); else skin(f.ch, x, y, 1.1, f.face, skinPose(f));
  X.restore();
  X.lineWidth = 4;
  if (s.freeze > 0) { X.fillStyle = 'rgba(140,200,255,.28)'; X.fillRect(x - 30, y - h - 24, 60, h + 24); X.strokeStyle = '#8cf'; X.strokeRect(x - 30, y - h - 24, 60, h + 24) }
  if (s.stun > 0) { X.fillStyle = '#ff0'; X.font = '24px sans-serif'; X.textAlign = 'center'; X.fillText('★ ★', x, y - h - 30) }
  if (s.burn > 0) { X.fillText('🔥', x, y - h - 30); if (Math.random() < .3) pt.push({ k: 'ember', x: x + rnd(-20, 20), y: y - rnd(20, 120), vx: 0, vy: -rnd(.8, 1.8), l: 30, m: 30, r: rnd(2, 4), ph: 0, c: '#ff7043' }) }
  if (s.root > 0) { X.fillStyle = '#4e342e'; X.fillRect(x - 30, y - 8, 60, 10) }
  if (s.slow > 0 || s.invert > 0) { X.font = '22px sans-serif'; X.fillText(s.invert > 0 ? '💋' : '🐌', x, y - h - 30) }
  if (f.blk) { X.strokeStyle = '#4fc3f7'; X.beginPath(); X.arc(x + f.face * 30, y - h / 2, 45, 0, 7); X.stroke() }
  if (f.parry > 0) { X.strokeStyle = '#fff'; X.beginPath(); X.arc(x, y - h / 2, 60, 0, 7); X.stroke() }
  if (f.dance > 0) { X.font = '28px sans-serif'; X.fillText('♪', x + Math.sin(f.dance / 4) * 30, y - h - 30) }
}
function para(x, y, w, h, sk) { X.beginPath(); X.moveTo(x + sk, y); X.lineTo(x + w + sk, y); X.lineTo(x + w, y + h); X.lineTo(x, y + h); X.closePath() }
function bar(f, i) {
  const w = 320, x = i ? 538 : 102, y = 30, h = 24, sk = i ? -14 : 14, p = f.hp / 100, gp = (f.gh == null ? f.hp : f.gh) / 100, now = performance.now();
  // marco
  para(x - 3, y - 3, w + 6, h + 6, sk); X.fillStyle = '#07070f'; X.fill();
  X.save(); para(x, y, w, h, sk); X.clip(); X.fillStyle = '#262638'; X.fillRect(x - 20, y, w + 60, h);
  const bw = w + 40, bx0 = x - 20, seg = q => i ? [bx0 + bw * (1 - q), bw * q] : [bx0, bw * q];
  let r = seg(gp); X.fillStyle = '#ffe082'; X.fillRect(r[0], y, r[1], h);               // daño reciente (barra amarilla)
  r = seg(p); const low = p < .25, g = X.createLinearGradient(0, y, 0, y + h);
  if (p > .5) { g.addColorStop(0, '#b6ff5a'); g.addColorStop(1, '#2e9e2e') } else if (p > .25) { g.addColorStop(0, '#fff176'); g.addColorStop(1, '#f9a825') } else { g.addColorStop(0, '#ff8a80'); g.addColorStop(1, '#c62828') }
  X.fillStyle = g; X.globalAlpha = low ? .75 + .25 * Math.sin(now / 90) : 1; X.fillRect(r[0], y, r[1], h); X.globalAlpha = 1;
  X.fillStyle = 'rgba(255,255,255,.28)'; X.fillRect(r[0], y, r[1], h * .42);             // brillo
  X.restore(); para(x, y, w, h, sk); X.lineWidth = 2; X.strokeStyle = '#fff'; X.stroke();
  // retrato
  const px = i ? W - 62 : 62; X.beginPath(); X.arc(px, 46, 36, 0, 7); X.fillStyle = '#07070f'; X.fill();
  head(f, px, 46, 31); X.beginPath(); X.arc(px, 46, 35, 0, 7); X.lineWidth = 4; X.strokeStyle = PCOL[i]; X.stroke();
  // nombre
  X.font = 'bold 21px Impact,sans-serif'; X.textAlign = i ? 'right' : 'left'; X.lineJoin = 'round'; X.lineWidth = 4; X.strokeStyle = '#000';
  const nx = i ? x + w : x + 6; X.strokeText(f.ch.n.toUpperCase(), nx, 25); X.fillStyle = '#fff'; X.fillText(f.ch.n.toUpperCase(), nx, 25);
  // rondas ganadas (rombos)
  for (let k = 0; k < 2; k++) {
    const dx = i ? x + 10 + k * 22 : x + w - 10 - k * 22, on = k < f.wins; X.save(); X.translate(dx, 68); X.rotate(.785);
    X.fillStyle = on ? '#ffd600' : '#3a3a4a'; X.strokeStyle = '#000'; X.lineWidth = 2; X.fillRect(-6, -6, 12, 12); X.strokeRect(-6, -6, 12, 12);
    if (on) { X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,214,0,.5)'; X.fillRect(-9, -9, 18, 18) } X.restore()
  }
  // cooldowns
  [[f.cd.k, f.ch.k[1].cd || 90, '#4fc3f7', 'HAB'], [f.cd.x, 480, '#ffb300', 'ESP'], [f.assist ? 0 : 1, 1, '#bbb', 'TORM']].forEach((c, j) => {
    const rd = Math.max(0, Math.min(1, 1 - c[0] / c[1])), ready = j == 2 ? !!f.assist : rd >= 1, bx = x + j * 64;
    X.fillStyle = '#12121c'; X.beginPath(); X.roundRect(bx, 76, 58, 9, 3); X.fill();
    X.fillStyle = ready ? c[2] : '#666'; X.beginPath(); X.roundRect(bx, 76, 58 * (j == 2 ? (f.assist ? 1 : 0) : rd), 9, 3); X.fill();
    if (ready) { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .3 + .2 * Math.sin(now / 150 + j); X.strokeStyle = c[2]; X.lineWidth = 3; X.beginPath(); X.roundRect(bx - 1, 75, 60, 11, 4); X.stroke(); X.restore() }
    X.font = 'bold 10px sans-serif'; X.textAlign = 'left'; X.fillStyle = ready ? '#fff' : '#889'; X.fillText(c[3], bx + 1, 97)
  })
}
function timerBox() {
  const low = timer <= 10 && state == 'go', now = performance.now(); X.save(); X.translate(W / 2, 46);
  if (low) { const s = 1 + (Math.sin(now / 120) * .5 + .5) * .12; X.scale(s, s) }
  const g = X.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#2b2b4d'); g.addColorStop(1, '#0d0d1c');
  X.beginPath(); X.roundRect(-40, -30, 80, 60, 12); X.fillStyle = g; X.fill(); X.lineWidth = 3; X.strokeStyle = low ? '#ff5252' : '#ffd600'; X.stroke();
  X.font = 'bold 40px Impact,sans-serif'; X.textAlign = 'center'; X.lineWidth = 4; X.strokeStyle = '#000'; const t = String(Math.max(0, timer));
  X.strokeText(t, 0, 14); X.fillStyle = low ? '#ff8a80' : '#fff'; X.fillText(t, 0, 14); X.restore()
}
// ---------- ESCENARIO (se dibuja una vez en un canvas aparte) ----------
function buildBG() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const sk = g.createLinearGradient(0, 0, 0, GY);
  [[0, '#0d0730'], [.3, '#2d1666'], [.55, '#8e3a8c'], [.75, '#ef6c57'], [.92, '#ffb35c'], [1, '#ffe08a']].forEach(a => sk.addColorStop(a[0], a[1]));
  g.fillStyle = sk; g.fillRect(0, 0, W, GY);
  for (let i = 0; i < 90; i++) { g.globalAlpha = rnd(.25, .9); g.fillStyle = '#fff'; const z = Math.random() < .12 ? 3 : 2; g.fillRect(rnd(0, W), rnd(0, GY * .42), z, z) }
  g.globalAlpha = 1;
  const sx = W * .5, sy = GY - 130, sg = g.createRadialGradient(sx, sy, 20, sx, sy, 300);
  sg.addColorStop(0, 'rgba(255,230,150,.9)'); sg.addColorStop(.25, 'rgba(255,150,80,.45)'); sg.addColorStop(1, 'rgba(255,100,80,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, GY);
  g.save(); g.beginPath(); g.arc(sx, sy, 62, 0, 7); g.clip(); g.fillStyle = '#fff3b0'; g.fillRect(sx - 62, sy - 62, 124, 124);
  g.fillStyle = 'rgba(255,120,60,.6)'; for (let k = 0; k < 5; k++) g.fillRect(sx - 64, sy + 8 + k * 11, 128, 3 + k); g.restore();
  const range = (base, amp, col, seed) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= W; x += 20) g.lineTo(x, base - (Math.sin(x * .008 + seed) * amp + Math.sin(x * .021 + seed * 2.3) * amp * .5 + Math.sin(x * .05 + seed) * amp * .15)); g.lineTo(W, GY); g.closePath(); g.fill() };
  range(GY - 150, 55, '#4a2470', 1); range(GY - 110, 45, '#341a58', 4);
  for (let x = -10; x < W;) {
    const bw = rnd(30, 66), bh = rnd(50, 150); g.fillStyle = '#1d1238'; g.fillRect(x, GY - 100 - bh, bw, bh + 100);
    for (let wy = GY - 100 - bh + 8; wy < GY - 112; wy += 14) for (let wx = x + 5; wx < x + bw - 6; wx += 11) if (Math.random() < .35) { g.fillStyle = Math.random() < .8 ? '#ffd27a' : '#7fd3ff'; g.globalAlpha = .75; g.fillRect(wx, wy, 5, 7); g.globalAlpha = 1 }
    x += bw + rnd(0, 6)
  }
  for (let i = 0; i < W; i += 40) {
    const bg = g.createLinearGradient(i, 0, i + 26, 0); bg.addColorStop(0, '#7a5546'); bg.addColorStop(1, '#4a2f26'); g.fillStyle = bg;
    g.beginPath(); g.moveTo(i, GY); g.lineTo(i, GY - 104); g.lineTo(i + 13, GY - 118); g.lineTo(i + 26, GY - 104); g.lineTo(i + 26, GY); g.fill();
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i + 19, GY - 104, 7, 104)
  }
  [GY - 84, GY - 34].forEach(y => { g.fillStyle = '#8b6a58'; g.fillRect(0, y, W, 13); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y + 10, W, 3); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(0, y, W, 2); g.fillStyle = '#2a1a14'; for (let i = 13; i < W; i += 40) g.fillRect(i, y + 5, 3, 3) });
  const gr = g.createLinearGradient(0, GY, 0, H); gr.addColorStop(0, '#4f8f2a'); gr.addColorStop(.25, '#3a7320'); gr.addColorStop(1, '#173d0d'); g.fillStyle = gr; g.fillRect(0, GY, W, H - GY);
  for (let k = 0; k < 8; k += 2) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, GY + k * k * 1.6, W, (k + 1) * (k + 1) * 1.6 - k * k * 1.6) }
  const shg = g.createLinearGradient(0, GY, 0, GY + 14); shg.addColorStop(0, 'rgba(0,0,0,.45)'); shg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = shg; g.fillRect(0, GY, W, 14);
  g.strokeStyle = 'rgba(160,220,90,.35)'; g.lineWidth = 2; for (let i = 0; i < 160; i++) { const x = rnd(0, W), y = rnd(GY + 4, H); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-3, 3), y - rnd(4, 9)); g.stroke() }
  g.save(); g.beginPath(); g.rect(0, GY, W, H - GY); g.clip(); g.translate(W / 2, GY + 6); g.scale(1, .22);
  const gl = g.createRadialGradient(0, 0, 10, 0, 0, 480); gl.addColorStop(0, 'rgba(255,190,90,.4)'); gl.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gl; g.fillRect(-W, -400, 2 * W, 800); g.restore();
  return c
}
function buildVig() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 640);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,12,.6)'); g.fillStyle = r; g.fillRect(0, 0, W, H); return c
}
const BG = buildBG(), VIG = buildVig();
function drawClouds(t) {
  X.save(); X.fillStyle = 'rgba(255,190,150,.16)';
  [[0, 70, 150], [330, 120, 200], [620, 50, 170], [800, 150, 130]].forEach(([o, y, w], i) => {
    const x = ((o + t * (6 + i * 2)) % (W + 400)) - 200; X.beginPath(); X.ellipse(x, y, w, 16, 0, 0, 7); X.ellipse(x + w * .4, y - 10, w * .55, 14, 0, 0, 7); X.ellipse(x - w * .4, y + 4, w * .5, 12, 0, 0, 7); X.fill()
  }); X.restore()
}
function draw() {
  X.save(); X.clearRect(0, 0, W, H);
  if (shake > 0 && !paused) { X.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake-- }
  if (sc == 'title' || sc == 'opts') { drawTitle(); X.restore(); return }
  if (sc == 'sel') { drawSel(); X.restore(); return }
  const now = performance.now() / 1000;
  // cámara: sigue el punto medio y se acerca cuando los luchadores están cerca
  const mid = (F[0].x + F[1].x) / 2, dist = Math.abs(F[0].x - F[1].x), tz = 1 + (1 - Math.min(dist, 650) / 650) * .1;
  if (!paused) { cam.z += (tz - cam.z) * .06; cam.x += (mid - cam.x) * .08 }
  const hw = W / 2 / cam.z, cx = Math.max(hw, Math.min(W - hw, cam.x));
  X.save(); X.translate(W / 2, 330); X.scale(cam.z, cam.z); X.translate(-cx, -330);
  X.drawImage(BG, 0, 0); drawClouds(now);
  // aviso de ataques de área (círculo en el suelo que se llena)
  fx.forEach(z => {
    if (!z.m) return; const pr = 1 - z.t / z.m, R = Math.min(z.o.r, 420), c = z.o.col && z.o.col != '#000' ? z.o.col : '#b388ff';
    X.save(); X.translate(z.f.x, GY + 4); X.scale(1, .22); X.globalAlpha = .12 + .25 * pr; X.fillStyle = c; X.beginPath(); X.arc(0, 0, R * (.4 + .6 * pr), 0, 7); X.fill();
    X.globalAlpha = .6 * pr; X.lineWidth = 6; X.strokeStyle = '#fff'; X.beginPath(); X.arc(0, 0, R * (.4 + .6 * pr), 0, 7); X.stroke(); X.restore()
  });
  // aviso de la Tala Ilegal: sombra del árbol sobre el rival
  trees.forEach(z => {
    if (z.t <= 0) return; const pr = 1 - z.t / z.m;
    X.save(); X.translate(z.e.x, GY + 4); X.scale(1, .22); X.globalAlpha = .15 + .35 * pr; X.fillStyle = '#1b0f0a'; X.beginPath(); X.arc(0, 0, 90 * (.45 + .55 * pr), 0, 7); X.fill();
    X.globalAlpha = .6 * pr; X.lineWidth = 6; X.strokeStyle = '#a5d6a7'; X.beginPath(); X.arc(0, 0, 90 * (.45 + .55 * pr), 0, 7); X.stroke(); X.restore()
  });
  // estela de dash
  gh.forEach(q => { X.save(); X.globalAlpha = q.l / q.m * .4; drawFrame(q.ch, q.fi, q.x, q.y, q.face, 1); X.restore() });
  F.forEach(drawF);
  trees.forEach(z => {
    const { f, e } = z;
    if (z.t > 0) {   // vuelo: lo lanza sobre la cabeza, gira y apunta siempre al rival
      const p = 1 - z.t / z.m, k = p * p * (3 - 2 * p), tx = e.x, ty = e.y - 70;
      treeArt(z.sx + (tx - z.sx) * k, z.sy + (ty - z.sy) * k - Math.sin(p * Math.PI) * 120, f.face * (p * 2.5 * Math.PI - .35 * (1 - p)), .8, 1)
    } else {         // caído: se desploma al suelo y se desvanece
      const q = 1 - z.land / 42, fall = Math.min(1, q * 3.2), y = z.ly + (GY - 14 - z.ly) * (1 - (1 - fall) * (1 - fall));
      treeArt(z.lx, y, f.face * Math.PI / 2, .8, Math.min(1, z.land / 14))
    }
  });
  proj.forEach(p => {
    if (p.o.sp) { projArt(p); return }
    const c = p.o.col || p.f.ch.c; X.fillStyle = c; X.globalAlpha = .9; X.beginPath(); X.ellipse(p.x, p.y, p.w / 2, 18, 0, 0, 7); X.fill(); X.globalAlpha = 1; X.strokeStyle = '#fff'; X.lineWidth = 2; X.stroke();
    X.save(); X.globalCompositeOperation = 'lighter'; const r = Math.max(p.w / 2, 18) * 1.7, g = X.createRadialGradient(p.x, p.y, 2, p.x, p.y, r); g.addColorStop(0, '#fff'); g.addColorStop(.35, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = g; X.beginPath(); X.arc(p.x, p.y, r, 0, 7); X.fill(); X.restore()
  });
  if (dog) { X.save(); X.font = '44px sans-serif'; X.textAlign = 'center'; X.translate(dog.x, GY); X.scale(dog.dir, 1); X.fillText('🐕', 0, 0); X.restore() }
  drawPt();
  if (!paused) toasts = toasts.filter(t => t.l-- > 0); toasts.forEach(t => {
    X.fillStyle = '#fff'; X.strokeStyle = '#000'; X.lineWidth = 4; X.lineJoin = 'round'; X.font = 'bold 22px sans-serif'; X.textAlign = 'center';
    const y = Math.max(135, t.f.y - 200 - (70 - t.l) * .6); X.globalAlpha = Math.min(1, t.l / 15); X.strokeText(t.t, t.f.x, y); X.fillText(t.t, t.f.x, y); X.globalAlpha = 1
  });
  X.restore();
  // ---- pantalla ----
  if (flashT > 0) { X.globalAlpha = flashT / 14; X.fillStyle = flashC; X.fillRect(0, 0, W, H); X.globalAlpha = 1; if (!paused) flashT-- }
  if (dark > 0) { if (!paused) dark--; X.fillStyle = '#000'; X.fillRect(0, 0, W, H); X.fillStyle = '#fff'; X.font = 'bold 30px sans-serif'; X.textAlign = 'center'; X.fillText('💥 ¡PAM! ¡CRASH! 🍻 💥', W / 2, H / 2) }
  X.drawImage(VIG, 0, 0);
  F.forEach(bar); timerBox();
  if (state != 'go') {
    const txt = state == 'intro' && stT < 20 ? '¡PELEEN!' : msg, e = Math.min(1, bt / 12), sc2 = 1 + (1 - e) * (1 - e) * 1.4;
    X.fillStyle = 'rgba(0,0,0,' + (.5 * e) + ')'; X.fillRect(0, 200, W, 110);
    X.save(); X.translate(W / 2, 270); X.scale(sc2, sc2); X.globalAlpha = e; X.textAlign = 'center'; X.font = 'bold 60px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 10; X.strokeStyle = '#b71c1c'; X.strokeText(txt, 0, 0);
    const lg = X.createLinearGradient(0, -48, 0, 4); lg.addColorStop(0, '#fff59d'); lg.addColorStop(1, '#ff9800'); X.fillStyle = lg; X.fillText(txt, 0, 0); X.restore();
    if ((state == 'ko' || state == 'over') && bt < 90) {
      const k = Math.min(1, bt / 8), j = bt < 18 ? (Math.random() - .5) * 8 : 0; X.save(); X.translate(W / 2 + j, 178 + j); X.scale(1 + (1 - k) * 1.5, 1 + (1 - k) * 1.5); X.globalAlpha = k;
      X.textAlign = 'center'; X.font = 'bold 92px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 14; X.strokeStyle = '#000'; X.strokeText('K.O.', 0, 0); X.fillStyle = '#ff1744'; X.fillText('K.O.', 0, 0); X.restore()
    }
    if (state == 'over') { X.font = '20px sans-serif'; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText('Pulsa puñetazo para volver a elegir', W / 2, 300) }
  }
  if (paused) drawPause();
  X.restore();
}
function titleBG() {
  const cols = [7, 6, 5, 4].find(c => R.length % c == 0) || 4, rows = Math.ceil(R.length / cols), tw = W / cols, th = H / rows;
  R.forEach((r, i) => {
    const x = (i % cols) * tw, y = ((i / cols) | 0) * th, im = r.img;
    X.save(); X.beginPath(); X.rect(x + 1, y + 1, tw - 2, th - 2); X.clip();
    if (im.complete && im.naturalWidth) {
      const s = Math.max(tw, th) / 200 * (1.1 + .05 * Math.sin(tt / 80 + i * 1.3)), d = 200 * s;
      dI(im, x + tw / 2 - d / 2, y + th / 2 - d / 2 - (d - th) * .18, d)
    }
    else { X.fillStyle = r.c; X.fillRect(x, y, tw, th) }
    X.restore()
  });
  X.fillStyle = 'rgba(15,0,40,.5)'; X.fillRect(0, 0, W, H);
  const g = X.createRadialGradient(W / 2, 260, 60, W / 2, 260, 620); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,.1)');
  X.fillStyle = g; X.fillRect(0, 0, W, H)
}
function drawTitle() {
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  if (tt < 40) return;
  X.globalAlpha = Math.min(1, (tt - 40) / 60);
  titleBG(); drawPt(); const by = Math.sin(tt / 28) * 4; X.shadowColor = '#ff6f00'; X.shadowBlur = 26;
  X.textAlign = 'center'; X.font = 'bold 92px Impact,sans-serif'; X.lineWidth = 10; X.lineJoin = 'round'; X.strokeStyle = '#b71c1c'; X.strokeText('FÉNIX FIGHT', W / 2, 170 + by);
  const lg = X.createLinearGradient(0, 100, 0, 170); lg.addColorStop(0, '#fff176'); lg.addColorStop(1, '#ff6f00'); X.fillStyle = lg; X.fillText('FÉNIX FIGHT', W / 2, 170 + by); X.shadowBlur = 0;
  X.font = 'bold 18px sans-serif'; X.fillStyle = '#fff'; X.fillText('CASA FÉNIX · PELEA DE AMIGOS', W / 2, 202);
  X.font = '34px sans-serif'; X.fillText('🐕', W / 2, 290);
  X.globalAlpha = 1;
  if (tt < 100) return;
  const items = sc == 'opts' ? ['Sonido: ' + (snd ? 'CON SONIDO 🔊' : 'SIN SONIDO 🔇'), 'Volver'] : ['1 vs 1', 'Opciones'], sel = sc == 'opts' ? oi : mi;
  if (sc == 'opts') { X.fillStyle = 'rgba(0,0,0,.7)'; X.fillRect(0, 310, W, 200); X.fillStyle = '#ffd600'; X.font = 'bold 26px sans-serif'; X.fillText('OPCIONES', W / 2, 345) }
  items.forEach((t, i) => {
    const y = (sc == 'opts' ? 365 : 335) + i * 62;
    X.fillStyle = i == sel ? '#ffd600' : 'rgba(0,0,0,.55)'; X.fillRect(W / 2 - 190, y, 380, 48);
    X.fillStyle = i == sel ? '#000' : '#fff'; X.font = 'bold 28px sans-serif'; X.fillText(t, W / 2, y + 34)
  });
  X.fillStyle = '#ddd'; X.font = '16px sans-serif'; X.fillText('Arriba/abajo: mover · Puño (J / ✕ del mando): elegir · Patada: volver', W / 2, 520);
}
// ---------- PAUSA ----------
const PAUSE_ITEMS = ['Reanudar', 'Reiniciar', 'Salir'];
function drawPause() {
  X.fillStyle = 'rgba(0,0,0,.65)'; X.fillRect(0, 0, W, H);
  X.textAlign = 'center'; X.fillStyle = '#ffd600'; X.font = 'bold 64px Impact,sans-serif'; X.fillText('PAUSA', W / 2, 170);
  PAUSE_ITEMS.forEach((t, i) => {
    const y = 205 + i * 66;
    X.fillStyle = i == pi ? '#ffd600' : 'rgba(255,255,255,.12)'; X.fillRect(W / 2 - 170, y, 340, 50);
    X.fillStyle = i == pi ? '#000' : '#fff'; X.font = 'bold 28px sans-serif'; X.fillText(t, W / 2, y + 35)
  });
  X.fillStyle = '#bbb'; X.font = '16px sans-serif'; X.fillText('Arriba/abajo: mover · Puño: elegir · Esc / P / Start: reanudar', W / 2, 490);
}
function setPause(v) { if (v == paused) return; paused = v; pi = 0; sfx('ok') }
function pausePressed() {
  const d = !!(keys.Escape || keys.KeyP || pads().some(g => g.buttons[9] && g.buttons[9].pressed)), h = d && !pz.d; pz.d = d; return h
}
addEventListener('blur', () => { if (sc == 'fight' && state != 'over') setPause(true) });
const COLS = 6, PCOL = ['#ff5252', '#4fc3f7'];
function preview(p, ch, x0, y0, w, h) {
  const col = PCOL[p], lk = lock[p], cx = x0 + w / 2, gy = y0 + 292, face = p ? -1 : 1;
  X.fillStyle = 'rgba(10,10,30,.85)'; X.fillRect(x0, y0, w, h);
  const sg = X.createRadialGradient(cx, gy - 110, 10, cx, gy - 110, 190); sg.addColorStop(0, ch.c + 'aa'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = sg; X.fillRect(x0, y0, w, h);
  X.lineWidth = lk ? 6 : 3; X.strokeStyle = col; X.strokeRect(x0, y0, w, h);
  X.fillStyle = col; X.fillRect(x0, y0, w, 28); X.fillStyle = '#000'; X.font = 'bold 16px sans-serif'; X.textAlign = 'center';
  X.fillText(lk ? 'JUGADOR ' + (p + 1) + ' · ¡LISTO!' : 'JUGADOR ' + (p + 1) + ' · ELIGIENDO', cx, y0 + 20);

  const bob = Math.sin(selT / (lk ? 5 : 12) + p) * (lk ? 4 : 2.5);
  // Aquí usamos el sprite completo si existe
  if (ch.pv && hasSprite(ch)) {
    X.fillStyle = 'rgba(0,0,0,.4)'; X.beginPath(); X.ellipse(cx, gy + 4, 80, 12, 0, 0, 7); X.fill();
    sprite(ch, cx, gy + bob, 235, face);
  } else if (hasAnim(ch)) {
    const S = ch.A.st, u = selT % 90;
    let fi = S.idle[((selT / 14) | 0) % S.idle.length];
    if (lk && u < 14) fi = S.punch[Math.min(1, S.punch.length - 1)];
    else if (lk && u >= 45 && u < 59) fi = S.kick[Math.min(1, S.kick.length - 1)];
    X.fillStyle = 'rgba(0,0,0,.4)'; X.beginPath(); X.ellipse(cx, gy + 4, 80, 12, 0, 0, 7); X.fill();
    drawFrame(ch, fi, cx, gy + bob, face, 1.6);
  } else if (hasSprite(ch)) {
    X.fillStyle = 'rgba(0,0,0,.4)'; X.beginPath(); X.ellipse(cx, gy + 4, 80, 12, 0, 0, 7); X.fill();
    sprite(ch, cx, gy + bob, 262, face);
  } else {
    X.fillStyle = 'rgba(0,0,0,.4)'; X.beginPath(); X.ellipse(cx, gy + 4, 80, 12, 0, 0, 7); X.fill();
    skin(ch, cx, gy + bob, 1.6, face, { ph: 0, ext: lk ? (Math.sin(selT / 5) > .6 ? 1 : 0) : 0, lean: 0 });
  }
  X.textAlign = 'center'; X.fillStyle = '#fff'; X.font = 'bold 28px sans-serif'; X.fillText(ch.n, cx, y0 + h - 52);
  X.font = '14px sans-serif'; X.fillStyle = '#ffd600'; X.fillText('Hab: ' + ch.k[1].n, cx, y0 + h - 30);
  X.fillStyle = '#ffb300'; X.fillText('Esp: ' + ch.x[1].n, cx, y0 + h - 12);
}
function drawSel() {
  const bgG = X.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 620); bgG.addColorStop(0, '#2a2a5a'); bgG.addColorStop(1, '#0c0c1e'); X.fillStyle = bgG; X.fillRect(0, 0, W, H);
  X.save(); X.globalAlpha = .06; X.fillStyle = '#fff'; for (let i = -H; i < W; i += 48) { const o = (selT * .5) % 48; X.beginPath(); X.moveTo(i + o, 0); X.lineTo(i + o + 18, 0); X.lineTo(i + o + 18 + H, H); X.lineTo(i + o + H, H); X.fill() } X.restore(); drawPt();
  X.textAlign = 'center'; X.fillStyle = '#ffd600'; X.font = 'bold 40px sans-serif'; X.fillText('FÉNIX FIGHT', W / 2, 46);
  X.fillStyle = '#fff'; X.font = '16px sans-serif'; X.fillText('Elijan luchador a la vez · puñetazo = listo · patada = cancelar', W / 2, 74);
  const PW = 250, PY = 92, PH = 372, CWd = 68, PXs = 72, TH = 84, TP = 96, GX = (W - (COLS * PXs - 4)) / 2, GY0 = PY + (PH - (Math.ceil(R.length / COLS) * TP - 12)) / 2;
  preview(0, R[cur[0]], 10, PY, PW, PH);
  preview(1, R[cur[1]], W - 10 - PW, PY, PW, PH);
  R.forEach((r, i) => {
    const x = GX + (i % COLS) * PXs, y = GY0 + ((i / COLS) | 0) * TP, hov = cur[0] == i || cur[1] == i;
    X.fillStyle = hov ? '#333355' : '#222'; X.fillRect(x, y, CWd, TH);
    portrait(r, x + 6, y + 6, CWd - 12, 10, '#fff', 2);
    X.fillStyle = '#fff'; X.font = 'bold 12px sans-serif'; X.textAlign = 'center'; X.fillText(r.n, x + CWd / 2, y + TH - 6);
    [0, 1].forEach(p => {
      if (cur[p] != i) return;
      X.lineWidth = 4; X.strokeStyle = PCOL[p]; const o = p ? 5 : 0; X.strokeRect(x + o, y + o, CWd - 2 * o, TH - 2 * o);
      X.fillStyle = PCOL[p]; X.fillRect(p ? x + CWd - 26 : x, y, 26, 16); X.fillStyle = '#000'; X.font = 'bold 12px sans-serif'; X.fillText('P' + (p + 1), x + (p ? CWd - 13 : 13), y + 13);
      if (lock[p]) {
        X.globalAlpha = .35; X.fillStyle = PCOL[p]; X.fillRect(x, y, CWd, TH); X.globalAlpha = 1;
        X.fillStyle = '#000'; X.fillRect(x, y + 26, CWd, 22); X.fillStyle = PCOL[p]; X.font = 'bold 12px sans-serif'; X.fillText('P' + (p + 1) + ' LISTO', x + CWd / 2, y + 42)
      }
    });
  });
  if (selGo > 0) {
    X.fillStyle = 'rgba(0,0,0,.75)'; X.fillRect(0, 230, W, 70); X.fillStyle = '#ffd600'; X.font = 'bold 44px sans-serif'; X.textAlign = 'center';
    X.fillText(R[cur[0]].n.toUpperCase() + '  VS  ' + R[cur[1]].n.toUpperCase(), W / 2, 280)
  }
  X.font = '13px sans-serif'; X.textAlign = 'center';
  X.fillStyle = '#ff8a80'; X.fillText('P1: A/D/W/S mover · J elegir · K cancelar · o 1er mando', 10 + PW / 2, H - 52);
  X.fillStyle = '#81d4fa'; X.fillText('P2: flechas · , elegir · . cancelar · o 2º mando: ✕ / ◻', W - 10 - PW / 2, H - 52);
  const np = pads().length; X.fillStyle = slot[0] != null && slot[1] != null ? '#69f0ae' : '#ffd54f'; X.font = '15px sans-serif'; X.fillText('Navegador ve ' + np + ' mando(s) · P1: ' + (slot[0] != null ? 'mando OK' : 'pulsa un botón en su mando') + ' · P2: ' + (slot[1] != null ? 'mando OK' : 'pulsa un botón en su mando'), W / 2, H - 18);
  X.fillStyle = '#bbb'; X.font = '13px sans-serif'; X.fillText('Controles en pelea: mover · saltar · bloquear · puño · patada · hab · especial · Tormenta (L / \' / R2)', W / 2, H - 34);
}

// ---------- BUCLE ----------
function tick() {
  claim(); const I = [inp(0), inp(1)], pp = pausePressed();
  if (sc != 'fight') paused = false;
  else if (paused) {
    if (pp || I.some(i => i.hit.k)) { setPause(false); return }
    I.forEach(({ hit: h }) => {
      if (h.u) { pi = (pi + 2) % 3; sfx('nav') } if (h.b) { pi = (pi + 1) % 3; sfx('nav') }
      if (h.p) {
        sfx('ok');
        if (pi == 0) paused = false;
        else if (pi == 1) { paused = false; startMatch() }
        else { paused = false; sc = 'title'; mi = 0; tt = 140; lock = [0, 0]; selGo = 0; toasts = [] }
      }
    });
    return
  }
  else if (pp && state != 'over') { setPause(true); return }
  ptUpd(); if (sc != 'fight' ? Math.random() < .35 : Math.random() < .06) pt.push(ember());
  if (sc == 'title') {
    tt++;
    if (tt > 100) I.forEach(({ hit: h }) => { if (h.u || h.b) { mi = 1 - mi; sfx('nav') } if (h.p) { sfx('ok'); if (mi == 0) sc = 'sel'; else { sc = 'opts'; oi = 0 } } });
    return
  }
  if (sc == 'opts') {
    I.forEach(({ hit: h }) => {
      if (h.u || h.b) { oi = 1 - oi; sfx('nav') }
      if (h.k) sc = 'title';
      else if (oi == 0 && (h.p || h.l || h.r)) { snd = !snd; try { localStorage.setItem('sfSnd', snd ? '1' : '0') } catch (e) { } sfx('ok') }
      else if (oi == 1 && h.p) { sfx('ok'); sc = 'title' }
    });
    return
  }
  if (sc == 'sel') {
    selT++;
    [0, 1].forEach(p => {
      const i = I[p].hit;
      if (!lock[p]) {
        if (i.k) { if (!lock[1 - p]) { sc = 'title'; lock = [0, 0]; selGo = 0 } return }
        const c = cur[p] % COLS, r = (cur[p] / COLS) | 0, rows = Math.ceil(R.length / COLS), rl = q => Math.min(COLS, R.length - q * COLS); let n = cur[p];
        if (i.l) n = r * COLS + (c + rl(r) - 1) % rl(r);
        if (i.r) n = r * COLS + (c + 1) % rl(r);
        if (i.u) { const q = (r + rows - 1) % rows; n = q * COLS + Math.min(c, rl(q) - 1) }
        if (i.b) { const q = (r + 1) % rows; n = q * COLS + Math.min(c, rl(q) - 1) }
        if (n != cur[p]) { cur[p] = n; sfx('nav') }
        if (i.p) { lock[p] = 1; sfx('ok') }
      }
      else if (i.k) { lock[p] = 0 }
    });
    if (sc != 'sel') return;
    if (lock[0] && lock[1]) { if (++selGo >= 50) { lock = [0, 0]; selGo = 0; startMatch() } } else selGo = 0;
    return
  }
  F.forEach(f => { if (f.gh > f.hp) f.gh = Math.max(f.hp, f.gh - .4); else f.gh = f.hp; if (state == 'ko' || state == 'over') f.kt++ }); bt++;
  if (state == 'over' && I.some(i => i.hit.p) && stT <= 0) { sc = 'sel'; return }
  if (state == 'intro') { if (--stT <= 0) state = 'go'; else if (stT == 19) bt = 0 }
  else if (state == 'go') {
    if (hstop > 0) hstop--;
    else {
      upd(F[0], F[1], I[0]); upd(F[1], F[0], I[1]); world();
      if (++tf >= 60) { tf = 0; timer-- }
      const [a, b] = [F[0].hp, F[1].hp];
      if (a <= 0 || b <= 0 || timer <= 0) endRound(a == b ? -1 : a > b ? 0 : 1)
    }
  }
  else if (--stT <= 0 && state == 'ko') { round++; startRound() }
  else if (state == 'over') stT--;
}
let last = 0, acc = 0;
(function loop(t) { acc += Math.min(100, t - last); last = t; while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60 } draw(); requestAnimationFrame(loop) })(0);