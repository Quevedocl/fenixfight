// FÉNIX FIGHT - v0.6 (Mejoras visuales)
const C = document.getElementById('c'), X0 = C.getContext('2d'), _q = (X0.imageSmoothingQuality = 'high'), W = 960, H = 540, GY = 440, S = C.width / W;
let X = X0; let CAMZ = 1, CAMX = 480, perfLv = 0; const FOOT = 30;   // FOOT: los pies se dibujan FOOT px por debajo de GY para que pisen el piso (no floten en su borde)
const WC = document.createElement('canvas'), WX = WC.getContext('2d'), WOX = 270, WOY = 320, WW = 540, WH = 380; WC.width = WW * S; WC.height = WH * S;

// ---------- CONTROLES ----------
const KB = [
  { l: 'KeyA', r: 'KeyD', u: 'KeyW', b: 'KeyS', p: 'KeyJ', hp: 'KeyU', k: 'KeyK', hk: 'KeyI', mod: 'KeyL', g: 'KeyH', bl: 'KeyB', d: 'ShiftLeft', a: 'KeyG', q: 'KeyO' },
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', b: 'ArrowDown', p: 'Comma', hp: 'Semicolon', k: 'Period', hk: 'Slash', mod: 'Quote', g: 'Enter', bl: 'KeyM', d: 'ShiftRight', a: 'KeyN', q: 'KeyP' }];
// Mapa del mando (compartido por ambos jugadores). b# = botón #, a#+ / a#- = eje, b100-b103 = cruceta tipo "hat" (arriba, derecha, abajo, izquierda)
// v8.0 (PS4): □ puño rápido · △ puño fuerte · ✕ patada rápida · ○ patada fuerte · L2 + □/△/✕ = Habilidad 1/2/3 · L2 + ○ = Definitiva · R1 agarre · R2 bloqueo · L1 esquive
// Las habilidades (s, x, z) y la definitiva (q) se derivan de L2 + botón dentro de inp(); no se asignan por separado.
const PM0 = {
  l: ['b14', 'b103', 'a0-'], r: ['b15', 'b101', 'a0+'], u: ['b12', 'b100', 'a1-'], b: ['b13', 'b102', 'a1+'], d: ['b4'], g: ['b5'], bl: ['b7'], mod: ['b6'],
  p: ['b2'], hp: ['b3'], k: ['b0'], hk: ['b1'], a: ['b11'], q: ['b8', 'b10']
};
const KB0 = JSON.parse(JSON.stringify(KB)), PM = JSON.parse(JSON.stringify(PM0));
try {   // controles personalizados guardados en este navegador
  const sv = JSON.parse(localStorage.getItem('sfCtl2') || 'null');
  if (sv) {
    [0, 1].forEach(i => { if (sv.kb && sv.kb[i]) for (const a in KB[i]) if (typeof sv.kb[i][a] == 'string') KB[i][a] = sv.kb[i][a] });
    if (sv.pm) for (const a in PM) if (Array.isArray(sv.pm[a]) && sv.pm[a].every(b => typeof b == 'string')) PM[a] = sv.pm[a]
  }
} catch (e) { }
const ctlSave = () => { try { localStorage.setItem('sfCtl2', JSON.stringify({ kb: KB, pm: PM })) } catch (e) { } };
const keys = {}, prev = [{}, {}];
let bindCap = null;   // captura de tecla para reasignar (pantalla Controles)
addEventListener('keydown', e => { if (bindCap) { if (!e.repeat) bindCap.key = e.code; e.preventDefault(); return } keys[e.code] = 1; if (e.code.startsWith('Arrow')) e.preventDefault() });
addEventListener('keyup', e => keys[e.code] = 0);
addEventListener('keydown', e => { if (e.code == 'F3') { Combat.debug = !Combat.debug; e.preventDefault() } });   // F3: muestra hitboxes / hurtboxes / pushboxes
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
// v6.2: diagnóstico y robustez con 2 mandos iguales (ambos por cable o ambos por bluetooth)
let padDbg = false;
addEventListener('keydown', e => { if (e.code == 'F2') { padDbg = !padDbg; e.preventDefault() } if (e.code == 'F4') { slot[0] = slot[1] = null; e.preventDefault() } });   // F2: panel de mandos · F4: soltar asignación (cada jugador pulsa un botón de nuevo)
addEventListener('gamepaddisconnected', e => { for (let p = 0; p < 2; p++) if (slot[p] === e.gamepad.index) slot[p] = null });
addEventListener('gamepadconnected', e => { for (let p = 0; p < 2; p++) if (slot[p] === e.gamepad.index) slot[p] = null });   // mando que se reconecta (p. ej. bluetooth dormido) vuelve a reclamarse con un botón
function drawPadDbg() {
  if (!padDbg) return; const raw = navigator.getGamepads ? [...navigator.getGamepads()] : [], vis = raw.filter(g => g && g.connected).length;
  X.setTransform(S, 0, 0, S, 0, 0); X.save(); X.fillStyle = 'rgba(0,0,0,.82)'; X.fillRect(10, 60, 560, 150); X.textAlign = 'left'; X.font = 'bold 13px monospace'; X.fillStyle = vis >= 2 ? '#69f0ae' : '#ffd54f';
  X.fillText('MANDOS QUE VE EL NAVEGADOR: ' + vis + '   (F2 ocultar · F4 reasignar P1/P2)', 20, 82); X.font = '11px monospace'; X.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) { const g = raw[i], who = g ? (slot[0] === g.index ? 'P1' : slot[1] === g.index ? 'P2' : '--') : '  ', pr = g ? g.buttons.map((b, k) => b.pressed ? k : '').filter(v => v !== '').join(',') : '';
    X.fillText('[' + i + '] ' + (g && g.connected ? who + ' ' + (g.id || '').slice(0, 52) + ' · ' + (g.mapping || 'sin mapeo') + (pr ? ' · botones: ' + pr : '') : '(vacío)'), 20, 104 + i * 18) }
  X.fillStyle = vis >= 2 ? '#a5d6a7' : '#ffcc80'; X.fillText(vis >= 2 ? 'El navegador ve los 2 mandos: cada jugador pulsa un botón para tomar su lugar.' : 'Si con los 2 mandos conectados aquí aparece solo 1, el sistema/navegador los está fusionando (no el juego).', 20, 188); X.restore()
}
const pad = () => pads()[0];
// Cruceta tipo "hat" en axes[9] (mandos genéricos sin mapeo estándar): solo se usa si ese eje llegó a marcar el valor de reposo
const hatSeen = {};
function hatMask(g) {
  if (g.mapping == 'standard' || g.axes.length < 10) return 0; const v = g.axes[9];
  if (Math.abs(v - 1.2857) < .06) { hatSeen[g.index] = 1; return 0 } if (!hatSeen[g.index]) return 0;
  const idx = Math.round((v + 1) / .2857142857); if (idx < 0 || idx > 7 || Math.abs(v - (idx * .2857142857 - 1)) > .08) return 0;
  return [1, 3, 2, 6, 4, 12, 8, 9][idx]
}
function bindOn(g, b, hm) {
  const n = +b.slice(1); if (b[0] == 'b') { if (n >= 100) return !!(hm & [1, 2, 4, 8][n - 100]); const q = g.buttons[n]; return !!q && (q.pressed || q.value > .6) }
  const v = g.axes[+b.slice(1, -1)] || 0; return b.slice(-1) == '+' ? v > .45 : v < -.45
}
function inp(i) {
  const k = KB[i], ko = {}, po = {}; for (const a in k) ko[a] = !!keys[k[a]];
  const g = padFor(i); if (g) { const hm = hatMask(g); for (const a in PM) po[a] = PM[a].some(b => bindOn(g, b, hm)) }
  const menu = sc != 'fight' || paused;
  if (g && menu) { const ok = po.p || po.k, bk = po.hk; po.x = po.hp; po.p = ok; po.k = bk; po.s = ok; po.hp = po.hk = po.mod = false }   // en menús del mando: ✕ / □ confirman · ○ vuelve
  const o = {}, A = ['l', 'r', 'u', 'b', 'p', 'hp', 'k', 'hk', 'mod', 'g', 'bl', 'd', 'a', 'q', 's', 'x', 'z'];
  A.forEach(a => o[a] = !!(ko[a] || po[a]));
  if (o.mod && !menu) { o.s = o.p; o.x = o.hp; o.z = o.k; o.q = o.q || o.hk; o.p = o.hp = o.k = o.hk = false }   // L2 + □/△/✕ = habilidades · L2 + ○ = definitiva (como en Mortal Kombat)
  o.hit = {}; A.forEach(a => { o.hit[a] = o[a] && !prev[i][a]; prev[i][a] = o[a] }); return o;
}

// ---------- ROSTER ----------
const R = [
  {
    id: 'mono', pvimg: 'img/skin/mono.jpg', n: 'Mono', c: '#8a8a8a', s: 4,
    k: ['P', { n: 'Trámite Pendiente', d: 4, v: 7, w: 44, st: ['slow', 150] }], x: ['F', { n: 'Paro Municipal', t: 80 }]
  },
  {
    id: 'manu', n: 'Manu', c: '#2e7d32', s: 4,
    k: ['A', { n: 'Reforestación Rápida', d: 5, r: 200, dl: 20, st: ['root', 100], col: '#2e7d32' }], x: ['A', { n: 'Tala Ilegal', d: 24, r: 2000, dl: 50, cd: 600, col: '#3e2723', tree: 1, sure: 1 }]
  },
  {
    id: 'mario', n: 'Marrio', c: '#c62828', s: 5.5,
    // 'C' = transformación en Criss (ver assist.js). Habilidad anterior: ['A', { n: 'Golpe de lesbiana', d: 4, r: 150, dl: 5, st: ['stun', 50], col: '#fff' }]
    k: ['C', { n: 'Asistencia de Criss', cd: 420, d: 18 }], x: ['D', { n: 'Trans-formacion', d: 24, v: 28 }]
  },
  {
    id: 'gonza', pvimg: 'img/skin/gonza.jpg', n: 'Chino', c: '#1565c0', s: 5,
    // Re-tocador: se retoca (cura, limpia estados malos y sale más rápido). Flaite: le roba la vida al rival.
    k: ['H', { n: 'Re-tocador', heal: 10, cd: 240, clean: 1, boost: 90, col: '#f8bbd0' }], x: ['A', { n: 'Flaite', d: 15, r: 150, dl: 14, st: ['stun', 30], drain: .6, col: '#7b1fa2' }]
  },
  {
    id: 'wenley', n: 'Wenley', c: '#d32f2f', s: 4.5,
    k: ['P', { n: '¿Quieres Leche?', d: 2, v: 8, st: ['stun', 40], heal: 3 }], x: ['A', { n: 'Tsunami Descremado', d: 18, r: 2000, dl: 20, col: '#fff' }]
  },
  {
    id: 'manin', pvimg: 'img/skin/manin.jpg', n: 'Mamin', c: '#e65100', s: 4.5,
    k: ['P', { n: 'Ají Rocoto', d: 2, v: 9, st: ['burn', 180] }], x: ['A', { n: 'Furia Inca', d: 20, r: 2000, dl: 50, col: '#795548' }]
  },
  {
    id: 'ale', n: 'Ale', c: '#ec407a', s: 5.5,
    k: ['P', { n: '¡Handroll!', d: 8, v: 13, w: 46, cd: 110, st: ['burn', 100], col: '#66bb6a', sp: 'handroll' }], x: ['P', { n: 'Army Bomb', d: 28, v: 20, w: 90 }]
  },
  {
    id: 'mati', pvimg: 'img/skin/mati.jpg', n: 'Mati', c: '#b71c1c', s: 3.5,
    k: ['G', { n: 'Expropiación de Vida', d: 6, r: 100 }], x: ['Q', { n: 'Redistribución del Daño' }]
  },
  {
    id: 'alonso', n: 'Alonso', c: '#6a1b9a', s: 4.5,
    k: ['P', { n: 'Seducción Inevitable', d: 2, v: 9, st: ['invert', 200] }], x: ['A', { n: 'Flambeado Final', d: 22, r: 2000, dl: 40, st: ['burn', 200], col: '#ff6d00' }]
  },
  {
    id: 'jp', n: 'JP', c: '#f9a825', s: 5,
    k: ['P', { n: 'Mocasín Volador', d: 9, v: 14, w: 46, st: ['stun', 35], sp: 'chancla' }], x: ['A', { n: 'Herencia Familiar', d: 30, r: 2000, dl: 55, cd: 600, st: ['stun', 55], col: '#8d6e63', mansion: 1, sure: 1 }]
  },
  {
    // Benja: Omnitrix defectuoso. La habilidad saca un alien al azar (a veces sale bien, a veces es Wi-Fi). pv: en la selección muestra la imagen de Ben 10.
    id: 'benja', n: 'Benja', c: '#ff7043', s: 5.2, ext: 'png', pv: 1,
    k: ['R', {
      n: 'Omnitrix Fallido', cd: 150, pool: [
        ['A', { n: '¡Cuatrobrazos!', d: 13, r: 150, dl: 8, st: ['stun', 45], col: '#e53935' }],
        ['D', { n: '¡XLR8! (sin frenos)', d: 14, v: 30 }],
        ['H', { n: '¡Merienda Alienígena!', heal: 14, col: '#80deea' }],
        ['H', { n: '¡Ups, era Wi-Fi!', heal: -8, col: '#ff5252' }],
        ['A', { n: '¡Fuego Pantanoso! (huele mal)', d: 12, r: 200, dl: 12, st: ['burn', 120], col: '#ff6d00' }],
        ['A', { n: '¡Gancho Antiaéreo!', d: 10, r: 110, dl: 3, up: 1 }]]
    }],
    x: ['A', { n: 'Gran Chico Pisotón', d: 22, r: 260, dl: 40, st: ['stun', 70], col: '#76ff03' }]
  },
  {
    // Rafa: cura, no pelea. Un solo golpe (la patada repite el mismo golpe), se sana a sí mismo y su especial es el campanazo.
    id: 'rafa', n: 'Rafa', c: '#424242', s: 3.6, ext: 'png', nk: 1,
    k: ['H', { n: 'Sanación', heal: 14, cd: 300, col: '#69f0ae' }], x: ['A', { n: 'El Tocador', d: 16, r: 2000, dl: 50, st: ['stun', 60], col: '#ffd54f' }]
  },
  {
    // Rosita: abuela con sopaipillas y puños de energía azul.
    id: 'rosita', n: 'Rosita', c: '#c2185b', s: 4.6, ext: 'png',
    k: ['P', { n: 'Golpe de Sopaipilla', d: 8, v: 13, w: 50, st: ['stun', 30], col: '#f5b041', sp: 'sopa' }], x: ['P', { n: 'Puño de Abuela', d: 22, v: 28, w: 120, st: ['stun', 50], col: '#4fc3f7' }]
  },
  {
    // Tata: peleador veloz de polera teñida. HAB = Chakal nomá (embestida con aturdimiento). ESP = Golpe seductor (atrae al rival y le invierte los controles).
    id: 'tata', pvimg: 'img/skin/tata.jpg', n: 'Tata', c: '#26c6da', s: 5.2,
    k: ['D', { n: 'Chakal nomá', d: 14, v: 28, st: ['stun', 30], cd: 150 }], x: ['A', { n: 'Golpe seductor', d: 20, r: 170, dl: 16, pull: 1, st: ['invert', 160], col: '#f06292' }]
  },
  {
    // Toño: bailarín de chaqueta y pañuelo arcoíris (el chiste del grupo). HAB = Golpe arcoíris (puñetazo de área multicolor). ESP = Tiradera de indirectas (3 globos de texto pasivo-agresivos).
    id: 'tono', n: 'Toño', c: '#e91e63', s: 5, ext: 'png',
    k: ['A', { n: 'Golpe arcoíris', d: 13, r: 160, dl: 7, cd: 150, st: ['stun', 40], col: '#ff4081', rainbow: 1 }],
    x: ['P', { n: 'Tiradera de indirectas', d: 6, v: 13, w: 60, cd: 420, st: ['stun', 25], col: '#f06292', sp: 'indirecta', volley: 3 }]
  },
  {
    // Juanito: camionero. HAB = Paro de camioneros (un camión cruza la pista y atropella al rival; se esquiva saltando). ESP = Bloqueo total (dos camiones cierran el paso a ambos lados: golpe garantizado + inmoviliza).
    id: 'juanito', n: 'Juanito', c: '#ff8f00', s: 4.8, ext: 'png',
    k: ['T', { n: 'Paro de camioneros', d: 18, cd: 330, st: ['stun', 40], mode: 'run', col: '#ffb300' }],
    x: ['T', { n: 'Bloqueo total', d: 20, cd: 600, st: ['root', 150], mode: 'wall', col: '#ff6d00', sure: 1 }]
  },
  {
    // Gastón: el calvo barbudo del grupo. HAB = Cabezazo Calvo (embestida que aturde). ESP = Rugido de Barba (área que ralentiza).
    id: 'gaston', pvimg: 'img/skin/gaston.jpg', n: 'Gastón', c: '#8d6e63', s: 5,
    k: ['D', { n: 'Cabezazo Calvo', d: 15, v: 28, st: ['stun', 30], cd: 180 }], x: ['A', { n: 'Rugido de Barba', d: 16, r: 160, dl: 10, cd: 420, st: ['slow', 90], col: '#ffb74d' }]
  },
  {
    // Pitu: árbitro de la pelea. HAB = Pitazo (proyectil que aturde). ESP = Silbato Final (área que aturde).
    id: 'pitu', pvimg: 'img/skin/pitu.jpg', n: 'Pitu', c: '#4fc3f7', s: 4.6,
    k: ['P', { n: 'Pitazo', d: 9, v: 15, w: 44, st: ['stun', 30], col: '#4fc3f7' }], x: ['A', { n: 'Silbato Final', d: 14, r: 170, dl: 10, cd: 420, st: ['stun', 45], col: '#fff176' }]
  },
  {
    // Tío René: el tío del asado. HAB = Reto del Tío (área que ralentiza). ESP = Chancleta Voladora (proyectil que aturde).
    id: 'tiorene', pvimg: 'img/skin/tiorene.jpg', n: 'Tío René', c: '#7e8a5b', s: 5,
    k: ['A', { n: 'Reto del Tío', d: 14, r: 150, dl: 10, cd: 150, st: ['slow', 100], col: '#ffcc80' }], x: ['P', { n: 'Chancleta Voladora', d: 13, v: 17, w: 46, cd: 420, st: ['stun', 40], col: '#a1887f', sp: 'chancla' }]
  }];
// Previsualización (selección) y skin completa (VS / historia) de todo el roster: img/skin/<id>.jpg y .png
const SKINPNG = ['ale', 'alonso', 'benja', 'gonza', 'gaston', 'jp', 'juanito', 'manin', 'manu', 'mario', 'mati', 'mono', 'pitu', 'rafa', 'rosita', 'tata', 'tiorene', 'tono', 'wenley'];
R.forEach(r => { if (!r.pvimg && SKINPNG.includes(r.id)) r.pvimg = 'img/skin/' + r.id + '.jpg' });

// KIT (kit.js): cada luchador tiene 3 especiales (k = E1, x = E2, z = E3), agarre (gr), pasiva (pa) y definitiva (se mezcla en ULT más abajo).
// Las habilidades y combos antiguos ya no existen.
R.forEach(r => {
  const K = KIT[r.id]; if (!K) return;
  r.k = K.e[0]; r.x = K.e[1]; r.z = K.e[2]; r.gr = K.g; r.pa = K.p.id; r.kit = K; r.cb = null;
  if (KITSTAT[r.id] && KITSTAT[r.id].s) r.s = KITSTAT[r.id].s
});
// Vidas distintas por personaje (los resistentes pegan menos, los frágiles tienen buenas herramientas)
const MHP = { manu: 115, mario: 95, ale: 90, mati: 110, alonso: 95, manin: 105, rafa: 85, juanito: 110, rosita: 112 };   // rosita: pasiva (más vida)
R.forEach(r => r.hp = MHP[r.id] || 100);
// Carga de imágenes (retratos y cuerpos completos)
// Si un frame .webp no existe, intenta el .png (evita que un personaje se quede sin animación por la extensión)
const frFallback = im => { im.onerror = () => { if (!im._png && /\.webp$/.test(im.src)) { im._png = 1; im.src = im.src.replace(/\.webp$/, '.png') } } };
R.forEach(r => {
  r.img = new Image();
  // Retrato: img/<id>.jpg (o .png si el personaje lo indica); si no existe prueba la otra extensión
  // v6.3: retratos unificados en img/p/<id>.jpg (512 px); si falta, usa el retrato original
  const ex = r.ext || 'jpg'; r.img.onerror = () => { if (!r.tried) { r.tried = 1; r.img.src = 'img/' + r.id + '.' + ex } else if (r.tried == 1) { r.tried = 2; r.img.src = 'img/' + r.id + '.' + (ex == 'jpg' ? 'png' : 'jpg') } };
  r.img.src = 'img/p/' + r.id + '.jpg';

  if (r.pvimg) { r.pvi = new Image(); r.pvi.src = r.pvimg }   // previsualización a medida (selección de luchador)
  r.full = new Image();
  r.full.src = 'img/' + r.id + '_full.png'; // Los sprites de cuerpo completo (respaldo)

  // Frames de animación (carpeta sprites/<id>/<n>.png, datos en anim.js)
  const A = (typeof ANIM !== 'undefined') && ANIM[r.id];
  if (A) { r.A = A; r.fr = A.f.map((_, i) => { const im = new Image(); frFallback(im); if (i < (A.nb || 1e9)) im.src = 'sprites/' + r.id + '/' + i + '.webp'; return im }) }
});
// Skin alternativa: ANIM[id + '_b'] (p. ej. Chino se transforma en barbero con su ultra) y arte HD original para las pantallas grandes
R.forEach(r => {
  const B = ANIM[r.id + '_b'];
  if (B) r.alt = Object.assign(Object.create(r), { A: B, dir: r.id + '_b', base: r, hdI: {}, fr: B.f.map((_, i) => { const im = new Image(); frFallback(im); if (i < (B.nb || 1e9)) im.src = 'sprites/' + r.id + '_b/' + i + '.webp'; return im }) });
  r.skI = new Image(); if (SKINPNG.includes(r.id)) r.skI.src = 'img/skin/' + r.id + '.webp';
  r.hdFull = new Image(); if (typeof HDFULL != 'undefined' && HDFULL.includes(r.id)) r.hdFull.src = 'img/hd/' + r.id + '.webp'
});
// Las poses MK (agachado, caídas, uppercut...) se descargan solo para los luchadores del combate
function ensureFrames(ch) { if (ch && ch.fr) ch.fr.forEach((im, i) => { if (!im.getAttribute('src')) im.src = 'sprites/' + (ch.dir || ch.id) + '/' + i + '.webp' }) }
Combat.Assist.load();   // sprite estático de Criss (sprites/criss/assist.png)
let trucks = [], vehs = [];   // camiones de Juanito (Paro de camioneros / Bloqueo total)

// ---------- ESTADO ----------
let sc = 'title', tt = 0, mi = 0, oi = 0, snd = (() => { try { return localStorage.getItem('sfSnd') != '0' } catch (e) { return true } })(), cur = [0, 5], lock = [0, 0], selT = 0, selGo = 0, F = [], proj = [], fx = [], trees = [], dog = null, dark = 0, shake = 0, flashC = null, flashT = 0;
let paused = false, pi = 0, pz = {}, timer = 99, tf = 0, state = 'intro', stT = 0, msg = '', round = 1, toasts = [];
const S0 = () => ({ slow: 0, stun: 0, root: 0, invert: 0, freeze: 0, burn: 0, blind: 0 });
const mk = (i, ch) => { ensureFrames(ch); if (ch.alt) ensureFrames(ch.alt); return { i, ch, wins: 0, ...fresh(i, ch) } };
function fresh(i, ch) { return { scr: null, scrF: null, cmbH: [], ccd: {}, rn: -10, cn: 0, cnT: 0, tapD: 0, tapT: 0, x: i ? 720 : 240, y: GY, vx: 0, vy: 0, mvx: 0, jmp: 0, jhold: 0, hp: ch.hp, mhp: ch.hp, face: i ? -1 : 1, atk: null, dash: null, cd: { k: 0, x: 0, z: 0, c: 0, d: 0 }, shield: 0, shT: 0, barrier: 0, form: null, chain: 0, chainT: 0, still: 0, pb: 0, pbt: 0, lh: -99, beat: 0, assist: 1, hs: 0, parry: 0, dance: 0, boost: 0, blk: 0, at: 0, cast: 0, mv: false, gh: ch.hp, sq: 0, kt: 0, s: S0(), kd: 0, ib: [], imm: 0, cb: 0, cbt: 0, bru: [], gg: 0, dt: 0, say: null, ult: 0, dg: 0, dgd: 0, bh: 0, xf: null } }
function startRound() { F.forEach(f => { if (f.ch.base) f.ch = f.ch.base; const u = f.ult || 0; Object.assign(f, fresh(f.i, f.ch)); f.ult = u }); proj = []; fx = []; trees = []; trucks = []; vehs = []; gh = []; Combat.Ribbons.clear(); Combat.InputBuffer.clear(); hstop = 0; bt = 0; pt = pt.filter(p => p.k == 'ember'); dog = null; dark = 0; timer = 99; tf = 0; state = 'intro'; stT = 75; msg = 'RONDA ' + round; sub = roundSub(); win = null; perf = false; slowT = 0; slowDiv = 2; koFr = 0; camP = 0; camF.w = 0; riv = null; if (round == 1 && mode != 'train' && F.length == 2) { const q = rivalry(); if (q) riv = { l: q.l, t0: q.t, t: 0, on: true, cur: -1 } } }
const toast = (t, f) => toasts.push({ t, f, l: 70 });
// ======================================================================
//  AUDIO v5: música (arcade.mp3) + efectos sintetizados + voces de los personajes + locutor
// ======================================================================
// ▼▼ MÚSICA: pega aquí el LINK DIRECTO a tu canción (debe terminar en .mp3 / .ogg / .wav / .m4a). Si lo dejas vacío usa arcade.mp3 de la carpeta.
// ▼▼ MÚSICA: pega aquí el LINK DIRECTO a tu canción (debe terminar en .mp3 / .ogg / .wav / .m4a). Si lo dejas vacío usa arcade.mp3 de la carpeta.
// Asegúrate de que la variable esté apuntando al archivo local
const MUSIC_URL = ''; // Vacío para que use arcade.mp3 de la carpeta por defecto
const MAIN_BGM = new Audio(MUSIC_URL.trim() || 'arcade.mp3');
MAIN_BGM.loop = true;
MAIN_BGM.loop = true;
let bgmFail = false;   // si el link no carga, se usa arcade.mp3 de la carpeta
const BGM = new Audio(MAIN_BGM); BGM.addEventListener('error', () => { if (!bgmFail && MAIN_BGM != 'arcade.mp3') { bgmFail = true; BGM.src = 'arcade.mp3'; if (snd && volM > 0) BGM.play().catch(() => { }) } }); BGM.loop = true; BGM.preload = 'auto'; let bgmN = 0;
const lvGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : +v } catch (e) { return d } };
const lvSet = (k, v) => { try { localStorage.setItem(k, v) } catch (e) { } };
let volM = lvGet('sfVolM', .5), volF = lvGet('sfVolF', 1), voz = lvGet('sfVoz', 1) != 0;
const bgmVol = () => Math.max(0, Math.min(1, volM * .55));   // la música queda por debajo de los efectos
BGM.volume = bgmVol();
// Pista por escenario: pon archivos en /music (azotea.mp3, nieve.mp3, puerto.mp3, volcan.mp3). Si no existen se usa arcade.mp3.
const STAGE_BGM = ['music/azotea.mp3', 'music/nieve.mp3', 'music/puerto.mp3', 'music/volcan.mp3'], stOK = {};
STAGE_BGM.forEach(u => { try { const a = new Audio(); a.preload = 'metadata'; a.onloadedmetadata = () => { stOK[u] = 1 }; a.onerror = () => { }; a.src = u } catch (e) { } });
function stageMusic(i) {
  const u = i >= 0 ? STAGE_BGM[i] : null, want = u && stOK[u] ? u : bgmFail ? 'arcade.mp3' : MAIN_BGM;
  if (!BGM.src.endsWith(want)) { BGM.src = want; if (snd && volM > 0) BGM.play().catch(() => { }) }
}
function musicTick() {
  const dg = sc == 'fight' && F.length == 2 && state != 'over' && F.some(f => f.hp > 0 && f.hp < f.mhp * .3) ? 1 : 0;   // alguien al borde del K.O.
  danger += (dg - danger) * .02; try { BGM.playbackRate = 1 + danger * .07 } catch (e) { }
  if (dg && state == 'go' && !paused && ++hbT % 46 == 0) { tone(62, 38, .16, 'sine', .8); setTimeout(() => tone(54, 34, .14, 'sine', .55), 150) }   // latido
  if (++bgmN % 20) return; BGM.volume = bgmVol(); stageMusic(sc == 'fight' || sc == 'vs' ? stg : -1);
  if (!snd || volM <= 0) { if (!BGM.paused) BGM.pause(); return }
  if (BGM.paused && !document.hidden) BGM.play().catch(() => { })
}
// ---- Motor WebAudio (se crea/reanuda con la primera tecla, clic o toque: los navegadores lo exigen)
let AC = null, MG = null, NB = null, RVB = null, DST = null;
function ac() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const cp = AC.createDynamicsCompressor(); cp.threshold.value = -14; cp.knee.value = 12; cp.ratio.value = 6; cp.attack.value = .002; cp.release.value = .2;
      MG = AC.createGain(); MG.connect(cp); cp.connect(AC.destination);
      const n = AC.sampleRate | 0; NB = AC.createBuffer(1, n, AC.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      // Reverb de sala grande (respuesta generada: ruido que se apaga y se oscurece) -> da cuerpo y "épica" a golpes y habilidades
      const rl = (AC.sampleRate * 1.9) | 0, ib = AC.createBuffer(2, rl, AC.sampleRate);
      for (let c = 0; c < 2; c++) { const dd = ib.getChannelData(c); let lp = 0; for (let i = 0; i < rl; i++) { const t = i / rl; lp += ((Math.random() * 2 - 1) - lp) * (.55 - .45 * t); dd[i] = lp * Math.pow(1 - t, 2.6) * 2.2 } }
      const cv = AC.createConvolver(); cv.buffer = ib; RVB = AC.createGain(); RVB.gain.value = .9; RVB.connect(cv); cv.connect(MG);
      // Distorsión (saturación) para los golpes graves y los poderes
      const ws = AC.createWaveShaper(), cu = new Float32Array(1024); for (let i = 0; i < 1024; i++) cu[i] = Math.tanh((i / 512 - 1) * 4);
      ws.curve = cu; ws.oversample = '2x'; DST = AC.createGain(); const pg = AC.createGain(); pg.gain.value = .5; DST.connect(ws); ws.connect(pg); pg.connect(MG);
    }
    if (AC.state != 'running') AC.resume().catch(() => { });
    MG.gain.value = volF * 1.4; return AC
  } catch (e) { return null }
}
function unlockAudio() { ac(); if (snd && volM > 0 && BGM.paused) BGM.play().catch(() => { }) }
// Los navegadores bloquean el audio hasta que haya un clic / tecla. Si el contexto sigue dormido, se reintenta y se avisa en pantalla.
let sndPoke = 0;
function audioPoke() { if (!snd) return; if (!AC) { ac(); return } if (AC.state != 'running' && ++sndPoke % 30 == 0) AC.resume().catch(() => { }) }
function drawSndHint() {
  if (!snd || (AC && AC.state == 'running')) return;
  X.save(); X.setTransform(S, 0, 0, S, 0, 0); X.globalAlpha = .6 + .3 * Math.sin(performance.now() / 280); X.font = 'bold 15px sans-serif'; X.textAlign = 'center';
  const t = '\u{1F507} Haz clic o pulsa una tecla del teclado para activar el sonido', w = X.measureText(t).width + 30;
  X.fillStyle = 'rgba(0,0,0,.7)'; X.fillRect(W / 2 - w / 2, H - 34, w, 24); X.fillStyle = '#ffd54f'; X.fillText(t, W / 2, H - 17); X.restore()
}
['keydown', 'pointerdown', 'mousedown', 'click', 'touchstart'].forEach(ev => addEventListener(ev, unlockAudio, { passive: true }));
document.addEventListener('visibilitychange', () => { if (document.hidden) { BGM.pause(); if (AC) AC.suspend().catch(() => { }); try { speechSynthesis.cancel() } catch (e) { } } else unlockAudio() });
function outTo(g, x) {   // x: { w: envío a reverb, d: pasa por distorsión }
  g.connect(x && x.d ? DST : MG);
  if (x && x.w) { const s = AC.createGain(); s.gain.value = x.w; g.connect(s); s.connect(RVB) }
}
function tone(f0, f1, dur, type, vol, dl, x) {
  const a = ac(); if (!a) return; const t = a.currentTime + (dl || 0), o = a.createOscillator(), g = a.createGain(), at = (x && x.a) || .006, dd = Math.max(dur, at + .02);
  o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); if (f1 && f1 != f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dd);
  if (x && x.det) o.detune.value = x.det;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + at); g.gain.exponentialRampToValueAtTime(.0001, t + dd);
  o.connect(g); outTo(g, x); o.start(t); o.stop(t + dd + .05)
}
function noise(dur, vol, ft, f0, f1, dl, q, x) {
  const a = ac(); if (!a) return; const t = a.currentTime + (dl || 0), s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(), at = (x && x.a) || 0;
  s.buffer = NB; s.loop = true; fl.type = ft || 'lowpass'; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f0, t); if (f1) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  if (at) { g.gain.setValueAtTime(.0002, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + at) } else g.gain.setValueAtTime(Math.max(.0002, vol), t);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl); fl.connect(g); outTo(g, x); s.start(t, Math.random() * .5); s.stop(t + dur + .05)
}
const SFXT = {};
// Habilidades: cada tipo (P proyectil, A área, D embestida, W teletransporte, S/Y escudo, V/T vehículo, O/C poder, H cura) tiene su sonido
function castSnd(t) {
  const R = { w: .5 };
  switch (t) {
    case 'H':   // cura: arpegio brillante con eco
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, .34, 'sine', .3, i * .08, { w: .6, a: .02 }));
      noise(.5, .12, 'highpass', 6000, 9000, .1, 1, { w: .5 }); tone(130, 130, .6, 'sine', .35, 0, { a: .1 }); break;
    case 'A':   // área: carga que sube y estallido grave
      tone(120, 760, .38, 'sawtooth', .2, 0, { w: .4, a: .25 }); noise(.4, .45, 'bandpass', 300, 5200, 0, 2, { a: .3 });
      tone(110, 26, .8, 'sine', 1.6, .36, R); noise(.7, 1.1, 'lowpass', 5200, 110, .36, 1, R); tone(260, 70, .25, 'sawtooth', .3, .36, { d: 1 }); break;
    case 'D':   // embestida: ráfaga de viento y empujón
      noise(.38, .95, 'bandpass', 250, 4600, 0, 1.6, { w: .2 }); tone(90, 360, .3, 'sawtooth', .3, 0, { d: 1 }); tone(70, 38, .28, 'sine', 1, 0); break;
    case 'W':   // teletransporte: chasquido eléctrico
      tone(2400, 180, .28, 'square', .2, 0, { w: .4 }); tone(260, 2000, .22, 'sine', .3, .08, R); noise(.3, .6, 'highpass', 2000, 9000, 0, 1, R); tone(75, 36, .3, 'sine', .9, .24); break;
    case 'S': case 'Y':   // escudo / barrera: destello metálico
      [660, 990, 1320, 1980].forEach((f, i) => tone(f, f * 1.01, .55, 'triangle', .22, i * .03, { w: .7, a: .015 })); tone(2600, 2500, .6, 'sine', .12, .02, { w: .8 }); tone(100, 70, .3, 'sine', .8); break;
    case 'V': case 'T':   // vehículo: motor rugiendo
      tone(55, 150, .7, 'sawtooth', .42, 0, { d: 1, a: .12 }); tone(110, 300, .7, 'square', .12, 0, { a: .2 }); noise(.7, .6, 'lowpass', 500, 1800, 0, 1, { a: .15 }); tone(70, 32, .5, 'sine', 1.3, .5, R); break;
    case 'O': case 'C':   // transformación / poder: acorde de potencia y onda expansiva
      [110, 165, 220, 330].forEach(f => tone(f, f * 1.5, .75, 'sawtooth', .16, 0, { d: 1, w: .4, a: .2 })); noise(.6, .7, 'bandpass', 200, 6000, 0, 1.4, { a: .3, w: .4 });
      tone(100, 24, .9, 'sine', 1.6, .3, R); noise(.7, 1, 'lowpass', 4500, 100, .3, 1, R); break;
    default:    // 'P' y el resto: carga de energía y disparo (proyectil)
      tone(180, 820, .22, 'sawtooth', .2, 0, { w: .4, a: .12 }); noise(.22, .4, 'bandpass', 500, 3800, 0, 2, { a: .12 });
      tone(160, 520, .32, 'sawtooth', .28, .16, { d: 1, w: .4 }); noise(.32, .85, 'bandpass', 420, 3000, .16, 1.2, { w: .3 }); tone(85, 38, .3, 'sine', 1.1, .16); tone(1300, 2600, .22, 'triangle', .12, .16, { w: .6 });
  }
}
function sfx(k, a) {
  if (!snd) return; const now = performance.now(); if (now - (SFXT[k] || 0) < 40) return; SFXT[k] = now;
  if (!ac()) return;
  const R = { w: .45 };
  try { switch (k) {
    case 'nav': tone(700, 940, .06, 'triangle', .3); break;
    case 'ok': tone(523, 523, .08, 'square', .2); tone(784, 1047, .18, 'square', .2, .07); break;
    case 'back': tone(520, 300, .1, 'triangle', .3); break;
    // ---- Impactos: chasquido seco + cuerpo grave + cola con eco. Cuanto más fuerte el golpe, más graves, metal y reverb
    case 'hit':
      noise(.05, .95, 'highpass', 3800, 1600); noise(.14, .85, 'bandpass', 1900, 280, 0, 1.2, { w: .12 }); tone(230, 55, .16, 'sine', 1.1); tone(95, 46, .2, 'sine', .7); tone(520, 110, .07, 'square', .18, 0, { d: 1 }); break;
    case 'hitbig':
      noise(.04, 1.2, 'highpass', 5200, 1800); noise(.32, 1.1, 'lowpass', 4300, 170, 0, 1, { w: .3 }); tone(150, 34, .42, 'sine', 1.5, 0, { w: .2 }); tone(320, 70, .16, 'sawtooth', .38, 0, { d: 1 });
      tone(1900, 850, .3, 'triangle', .13, 0, { w: .5 }); tone(70, 36, .35, 'sine', 1, .04); break;
    case 'mega':   // golpe brutal / ultra: estruendo con onda expansiva
      noise(.05, 1.3, 'highpass', 6000, 1800); tone(110, 26, .8, 'sine', 1.8, 0, R); noise(.65, 1.2, 'lowpass', 5200, 100, 0, 1, R); tone(300, 60, .22, 'sawtooth', .45, 0, { d: 1 });
      tone(2400, 300, .35, 'sawtooth', .16, 0, { w: .6 }); tone(46, 30, 1.1, 'sine', 1.2, .05, { a: .05 }); noise(.5, .6, 'bandpass', 160, 900, .05, 1.4, { w: .6 }); break;
    case 'punch': {   // a: 0 rápido, 1 normal, 2 fuerte
      const s = a == 2 ? 1 : a == 0 ? .6 : .8; noise(.1 + s * .08, .45 * s + .2, 'bandpass', 760 - s * 160, 3400, 0, .9, { w: .12 });
      if (a == 2) { tone(190, 70, .18, 'sawtooth', .2, 0, { d: 1 }); noise(.14, .45, 'lowpass', 1000, 180) } break
    }
    case 'kick': {
      const s = a == 2 ? 1 : a == 0 ? .6 : .8; noise(.16 + s * .1, .5 * s + .25, 'bandpass', 420, 2300, 0, .8, { w: .15 }); tone(140, 55, .2, 'sine', .3 * s + .15);
      if (a == 2) tone(220, 80, .18, 'sawtooth', .2, 0, { d: 1 }); break
    }
    case 'block': tone(1400, 700, .1, 'square', .24); noise(.1, .7, 'highpass', 3000, 1800, 0, 1, { w: .3 }); tone(170, 85, .1, 'sine', .7); tone(2100, 2050, .4, 'sine', .17, 0, { w: .7 }); tone(3150, 3100, .3, 'sine', .09, 0, { w: .7 }); break;
    case 'fall': tone(95, 28, .55, 'sine', 1.6, 0, { w: .25 }); noise(.5, 1.1, 'lowpass', 1700, 85, 0, 1, { w: .3 }); noise(.08, .6, 'highpass', 2500, 1200); tone(190, 60, .18, 'sawtooth', .22, 0, { d: 1 }); break;
    case 'sp': castSnd(a); break;
    case 'heal': castSnd('H'); break;
    case 'ko':
      tone(240, 46, 1.1, 'sawtooth', .5, 0, { d: 1, w: .4 }); noise(1, 1, 'lowpass', 3000, 65, 0, 1, R); tone(70, 28, 1.3, 'sine', 1.6, .05, R); tone(620, 55, 1.3, 'sawtooth', .16, .05, { w: .8 }); tone(2000, 300, .5, 'triangle', .12, 0, { w: .8 }); break;
    case 'spit': tone(1100, 500, .12, 'sawtooth', .3); noise(.1, .4, 'bandpass', 2000, 900); break;
    case 'dodge': noise(.24, .65, 'bandpass', 500, 3800, 0, 1.5, { w: .15 }); tone(500, 1400, .16, 'triangle', .2); break;
    case 'grab': tone(160, 60, .24, 'square', .5, 0, { d: 1 }); noise(.16, .75, 'lowpass', 1600, 180); tone(80, 40, .22, 'sine', .9); break;
    case 'ultra':   // súper: subida orquestal, impacto monstruoso y acorde final
      tone(60, 900, 1, 'sawtooth', .26, 0, { d: 1, w: .4, a: .6 }); tone(61, 910, 1, 'sawtooth', .22, 0, { det: 14, w: .4, a: .6 }); tone(160, 1500, 1, 'square', .1, 0, { a: .7, w: .4 });
      noise(1, .6, 'bandpass', 250, 7000, 0, 1.4, { a: .75, w: .3 });
      tone(70, 22, 1.5, 'sine', 1.9, .95, R); noise(1.2, 1.2, 'lowpass', 6000, 80, .95, 1, R); tone(300, 50, .3, 'sawtooth', .45, .95, { d: 1 });
      [110, 138.6, 165, 220].forEach(f => tone(f, f, .9, 'sawtooth', .14, .98, { d: 1, w: .7 })); [440, 554, 659].forEach(f => tone(f, f, 1, 'triangle', .1, 1, { w: .8, a: .05 })); break;
    case 'step': noise(.05, .16, 'lowpass', 600, 200); break;
    case 'land': noise(.14, .45, 'lowpass', 900, 130, 0, 1, { w: .1 }); tone(100, 42, .16, 'sine', .7); break;
    case 'jump': tone(280, 620, .12, 'triangle', .2); noise(.08, .2, 'bandpass', 1200, 2400); break;
    case 'count': tone(440, 440, .14, 'square', .25); break;
    case 'go': tone(660, 660, .1, 'square', .28); tone(990, 1320, .3, 'square', .28, .09); break;
  } } catch (e) { }
}
function sfxN(d, v) { if (!snd) return; noise(d, Math.min(1.3, v * 2.4), 'lowpass', 3200, 120, 0, 1, { w: .45 }); tone(100, 30, Math.max(.25, d), 'sine', Math.min(1.5, v * 3.2), 0, { w: .25 }) }   // explosiones: estruendo + golpe grave

// ---- Voces procedurales de los personajes (gruñidos con formantes: cada uno tiene su tono)
const VP = { rosita: 250, ale: 225, rafa: 105, wenley: 120, mati: 125, manu: 150 };
const FOR = { a: [800, 1150], o: [450, 800], e: [550, 1800], u: [330, 750], i: [300, 2300] };
const vh = id => { let h = 7; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h };
const GRT = {};
function formant(f0, f1, dur, v1, v2, vol, dl) {
  const a = ac(); if (!a) return; const t = a.currentTime + (dl || 0), o = a.createOscillator(), g = a.createGain(), lf = a.createOscillator(), lg = a.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  lf.frequency.value = 38; lg.gain.value = f0 * .015; lf.connect(lg); lg.connect(o.frequency); lf.start(t); lf.stop(t + dur + .05);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .025); g.gain.setValueAtTime(vol, t + dur * .55); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  for (let n = 0; n < 2; n++) {
    const bp = a.createBiquadFilter(), ga = a.createGain(); bp.type = 'bandpass'; bp.Q.value = 7; ga.gain.value = n ? .55 : 1;
    bp.frequency.setValueAtTime(FOR[v1][n], t); bp.frequency.linearRampToValueAtTime(FOR[v2][n], t + dur);
    o.connect(bp); bp.connect(ga); ga.connect(g)
  }
  g.connect(MG); o.start(t); o.stop(t + dur + .05)
}
function grunt(ch, kind) {
  if (!snd || !voz || !ch) return; const now = performance.now(); if (now - (GRT[ch.id] || 0) < 260) return; GRT[ch.id] = now;
  if (!ac()) return; const h = vh(ch.id), f = VP[ch.id] || 100 + (h % 8) * 12, j = 1 + ((h >> 4) % 5) * .02;
  if (kind == 'atk') { formant(f * 1.25 * j, f * .95, .15, 'a', 'o', .85); noise(.07, .25, 'highpass', 2500, 1800) }
  else if (kind == 'pain') { formant(f * 1.5 * j, f * .75, .3, 'a', 'e', .9) }
  else if (kind == 'ko') { formant(f * 1.6 * j, f * .5, .75, 'a', 'o', 1) }
  else if (kind == 'shout') { formant(f * 1.1 * j, f * 1.7, .34, 'o', 'a', 1); noise(.12, .3, 'highpass', 2500, 1500) }
}
// ---- Voz hablada (Web Speech del navegador, en español): nombres, frases de los personajes y locutor
let ES = [], lastSp = 0;
function loadVoices() { try { ES = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => (/CL|MX|US/i.test(b.lang) ? 1 : 0) - (/CL|MX|US/i.test(a.lang) ? 1 : 0)) } catch (e) { } }
try { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices } catch (e) { }
function speak() { }   // narrador eliminado: solo quedan los gruñidos de los personajes

// ---------- EFECTOS (partículas, hitstop, cámara) ----------
let cp = 0, cc = 0, pcb = -1;
let perf = false, danger = 0, hbT = 0, shakeDir = 0, pt = [], gh = [], hstop = 0, bt = 0, stains = [], win = null, slowT = 0, sub = '';
// cámara dinámica: camP = zoom extra por impacto, camF = foco en la víctima, koK = encuadre del K.O., koFr = congelado del último golpe, slowDiv = factor de cámara lenta (2 = mitad, 3 = un tercio)
let camP = 0, camF = { x: 0, w: 0 }, koK = 0, koFr = 0, slowDiv = 2, riv = null;
let bld = (() => { try { return localStorage.getItem('sfBld') != '0' } catch (e) { return true } })();
const pick = a => a[(Math.random() * a.length) | 0];
const OUCH = ['¡AY!', '¡Mi cadera!', '¡No po!', '¡Qué dolor!', '¡Pucha!', '¡Cómo duele!', '¡Eso fue ilegal!', '¡Árbitro!', '¡Mamita!', '¡Me quebraste!', '¡Mi seguro!', '¡Cuidado con la cara!'];
const TAUNT = ['¿Cachai?', '¡Muy lento!', '¡Sapo!', '¡Toma!', '¿Eso es todo?', '¡Qué lástima!', 'Ni cosquillas...', '¡Pa\' la casa!'];
const INTRO = ['Casa Fénix no se hace responsable', 'Que no se rompa nada... otra vez', 'Los vecinos ya llamaron', 'Se aceptan apuestas', 'Que gane el menos peor', 'Hoy se arregla todo a combos', 'Prohibido llorar'];
const LOWHP = ['¡Me muero!', '¡Dame una chance!', '¡Llamen a mi mamá!', '¡Veo la luz!'];
// Rivalidades: diálogos antes de la primera ronda según quién se enfrenta (clave = ids ordenados alfabéticamente)
const RIV = {
  'alonso|tono': { t: 'Seducción vs orgullo', l: [['alonso', 'Toño, mi seducción es inevitable.'], ['tono', 'Qué lindo, Alonso... pero conmigo no funciona.'], ['alonso', 'Eso... no me lo esperaba.']] },
  'juanito|tono': { t: 'Paro vs desfile', l: [['juanito', 'Toño, hay paro. No se puede pasar.'], ['tono', 'Mi amor, yo ya iba a desfilar igual.'], ['juanito', 'Te voy a bloquear la ruta.'], ['tono', 'Qué indirecta más directa.']] },
  'juanito|mono': { t: 'Doble paro', l: [['juanito', 'Mono, yo también estoy de paro.'], ['mono', 'Entonces no atiende nadie.'], ['juanito', 'Bloqueamos todo, entonces.'], ['mono', 'Vuelva mañana.']] },
  'tata|tono': { t: 'Chakal vs arcoíris', l: [['tata', 'Toño, chakal nomá.'], ['tono', 'Tata, tu polera hace juego con mi pañuelo.'], ['tata', '¿Te gusta? Es teñida a mano.']] },
  'alonso|tata': { t: 'Duelo de galanes', l: [['tata', 'Alonso, yo soy chakal nomá.'], ['alonso', 'Yo cocino, tú sudas, mi amor.'], ['tata', 'Te voy a dar un golpe seductor.']] },
  'jp|tata': { t: 'Herencia vs chakal', l: [['jp', 'Tata, mi familia tiene una mansión.'], ['tata', '¿Y por qué vives en el living?'], ['jp', 'Te la tiro encima, ya vas a ver.']] },
  'mono|rafa': { t: 'Sanación vs burocracia', l: [['rafa', 'Mono, ¿me sanas este trámite?'], ['mono', 'Le falta un timbre, Rafa.'], ['rafa', 'Yo curo todo... menos la burocracia.'], ['mono', 'Vuelva mañana.']] },
  'jp|manu': { t: 'Sombra vs resaca', l: [['manu', 'JP, planté un árbol pa\' tu resaca.'], ['jp', 'Prefiero mi chancleta, Manu.'], ['manu', 'Entonces yo traigo la motosierra.']] },
  'ale|benja': { t: 'Handroll vs Omnitrix', l: [['ale', 'Benja, ¿otra vez con el Omnitrix?'], ['benja', '¡Esta vez sí funciona! ...creo.'], ['ale', 'Te invito un handroll de derrota.']] },
  'alonso|rosita': { t: 'Seducción vs abuela', l: [['alonso', 'Rosita, soy irresistible.'], ['rosita', 'Mijito, ni mi gato te mira.'], ['alonso', 'Eso... dolió.'], ['rosita', 'Siéntate a comer, antes de pelear.']] },
  'gonza|manin': { t: 'Rocoto contra todo', l: [['gonza', 'Mamin, ¿tienes ají pa\' mí?'], ['manin', 'Mi rocoto te deja sin voz, Chino.'], ['gonza', 'Qué miedo, po.']] },
  'mario|wenley': { t: 'Lácteo vs rojo', l: [['mario', 'Wenley, ¿quieres leche o quieres pelea?'], ['wenley', 'Las dos, Marrio.'], ['mario', 'Entonces pelea con leche.']] },
  'mati|alonso': { t: 'Carisma vs expropiación', l: [['mati', 'Alonso, expropio tu carisma.'], ['alonso', 'Nadie expropia lo inevitable.']] },
  'jp|rafa': { t: 'Resaca terminal', l: [['rafa', 'JP, yo te curo la resaca.'], ['jp', 'Primero pelea, después sanas.']] },
  'manin|rosita': { t: 'Ají vs abuela', l: [['manin', 'Rosita, ¿le pongo ají a su sopaipilla?'], ['rosita', 'Mijito, yo cocinaba cuando tú no existías.']] },
  'gaston|tiorene': { t: 'Calvos y asados', l: [['gaston', 'Tío René, el asado lo hago yo.'], ['tiorene', 'Gastón, tú ni parrilla tienes.'], ['gaston', 'Tengo la frente pa\' prender el carbón.']] },
  'mono|pitu': { t: 'Trámite vs árbitro', l: [['pitu', 'Mono, estás en off-side administrativo.'], ['mono', 'Vuelva mañana con el pitazo timbrado.']] }
};
function genRiv(a, b) { const A = DUELO_FRASES[a], B = DUELO_FRASES[b]; return A && B ? { t: 'Duelo en ' + STGN[stg], l: [[a, A.o], [b, B.r], [a, A.c]] } : null }
function rivalry() {
  const a = F[0].ch.id, b = F[1].ch.id;
  if (a == b) return { t: 'Choque de gemelos', l: [[0, '¿Y tú quién eres? ¡El original soy yo!'], [1, '¡Mentira! ¡El original soy yo!'], [0, 'Prepárate, impostor.']] };
  const key = [a, b].sort().join('|'), r = RIV[key] || RIV2[key] || genRiv(a, b); if (!r) return null;
  const l = r.l.map(([id, tx]) => [F.findIndex(f => f.ch.id == id), tx]).filter(x => x[0] >= 0); return l.length ? { t: r.t, l } : null
}
const RIVGAP = 85;
function roundSub() {
  if (F.length < 2 || mode == 'train' || round == 1) return pick(INTRO);
  const w0 = F[0].wins, w1 = F[1].wins;
  if (w0 == w1) return 'RONDA DECISIVA · el que caiga hoy se va a la casa';
  const L = w0 > w1 ? 0 : 1; return F[L].ch.n + ' va arriba, pero ' + F[1 - L].ch.n + ' no se rinde'
}
function rivTick(I) {   // dialogo previo: fighters congelados, globos de texto por turnos, cámara sobre quien habla
  const r = riv, n = r.l.length; r.t++;
  F.forEach(f => { if (f.say && f.say.l > 0) f.say.l-- });
  const k = (r.t - 20) / RIVGAP;
  if (r.t >= 20 && Number.isInteger(k) && k < n) { const [who, tx] = r.l[k], f = F[who]; say(f, tx, RIVGAP - 2); grunt(f.ch, 'shout'); r.cur = who }
  if (r.cur >= 0) { camF = { x: F[r.cur].x, w: .8 }; camP = Math.max(camP, .08) }
  if ((I.some(i => i.hit.p) && r.t > 15) || r.t >= 20 + n * RIVGAP + 10) { r.on = false; F.forEach(f => { f.say = null }); bt = 0 }
}
function drawRiv() {
  const r = riv, k = Math.min(1, r.t / 14), bh = 46 * k; X.save(); X.fillStyle = '#000'; X.fillRect(0, 0, W, bh); X.fillRect(0, H - bh, W, bh);
  X.globalAlpha = k; X.textAlign = 'center'; X.lineJoin = 'round'; X.font = 'bold 26px Impact,sans-serif'; X.lineWidth = 5; X.strokeStyle = '#000';
  const tt0 = '⚔ ' + r.t0 + ' ⚔'; X.fillStyle = '#ffd54f'; X.fillText(tt0, W / 2, 32);
  X.font = 'bold 15px sans-serif'; X.fillStyle = 'rgba(255,255,255,.75)'; X.fillText('Pulsa ' + padBtn('p') + ' para saltar', W / 2, H - 16); X.restore()
}
const VICT = {
  mono: ['Vuelva mañana.', 'Su caso quedó pendiente. Para siempre.', 'Hay paro, pero pa\' pegarte vine igual.'],
  manu: ['Yo planto, tú caes.', 'Fue tala ilegal y nadie me va a multar.', 'Más verde que tu envidia, ¿cachai?'],
  mario: ['¡Ni me despeiné, po!', 'Ganó el más rojo de la sala.', 'Me debes una colación.'],
  gonza: ['Te retoqué la cara, ¿cachai?', '¿Y mi aplauso, po?', 'Más flaite que fome, y gané igual.'],
  tono: ['Ganó el orgullo, mi amor.', 'Eso fue una indirecta... y te la merecías.', 'Más fabuloso que tú, imposible.'],
  juanito: ['Gracias wapa'],
  tata: ['Chakal nomá, hermano.', 'Fue golpe seductor y quedaste enamorado.', 'Te dije que me dejaras pasar, po.'],
  wenley: ['¿Quieres leche? Pa\' la próxima.', 'Quedaste descremado.', 'Gané con harto calcio.'],
  manin: ['Con ají to\' se arregla.', 'Furia Inca nivel experto.', 'Pica, pero es rico perder.'],
  ale: ['¡Handroll pa\' celebrar!', 'Army Bomb arriba, ganamos.', 'Fue fácil, ¿o no?'],
  mati: ['Expropiada tu victoria, compadre.', 'Redistribuí tu vida entre todos... menos tú.', 'Ganó el pueblo. Bueno, yo.'],
  alonso: ['Fue inevitable.', 'Se fue la luz... y tú también.', 'Lo sabías desde la primera ronda.'],
  jp: ['Gané, y ni se arrugó mi polerón.', 'Esto va a la cuenta del club, caballero.', 'Papá me paga la multa, tú el hospital.'],
  benja: ['¡Era el Omnitrix, lo juro!', 'Ups... gané sin querer.', 'Cuatro brazos, cuatro razones pa\' ganar.'],
  rafa: ['Sanado y ganado.', 'Curé mis heridas. Las tuyas, no.', 'El que cura, pega.'],
  rosita: ['Mijito, siéntese y tome once.', 'Sopaipilla pa\' todos... menos pa\' ti.', 'Ya po, y no llores.'],
  gaston: ['Brilló la calva, ganó Gastón.', 'Con esta frente no se juega.', 'Barba, brillo y victoria.'],
  pitu: ['¡Fin del partido, po!', 'Tarjeta roja pa\' ti.', 'El árbitro nunca pierde.'],
  tiorene: ['Cuando yo era joven esto era más difícil.', 'Sírvanse el asado, ganamos.', 'Aprendan, cabros, aprendan.']
}, VICT0 = ['¡Gané, po!', 'Casa Fénix tiene nuevo campeón.', 'Pidan la revancha, si quieren.'];
const WINR = ['¡Uno menos!', '¡Fácil!', '¡Ni calenté!', '¡Siguiente!'];
const LOSE = ['¡Me caí no más!', 'Estaba resbaloso...', 'Pidan la revancha', 'Eso no vale'];
const say = (f, t, l) => { f.say = { t, l: l || 75 }; if (sc == 'fight') speak(t, f.ch) };
const cam = { x: W / 2, z: 1 }, rnd = (a, b) => a + Math.random() * (b - a);
function spark(x, y, n, cols, sp, life) { for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(sp * .4, sp); pt.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, l: life + rnd(-4, 6), m: life + 6, c: cols[i % cols.length], g: .25 }) } }
function dust(x, y, n, s) { for (let i = 0; i < n; i++) pt.push({ k: 'dust', x: x + rnd(-10, 10), y: y - rnd(0, 4), vx: rnd(-1.6, 1.6) * s, vy: rnd(-1.4, -.2), l: 26, m: 26, r: rnd(5, 11) * s, c: '#d7c7a6', g: 0 }) }
function ring(x, y, R, c, w, life, flat) { pt.push({ k: 'ring', x, y, r: 6, R, l: life, m: life, c, w: w || 6, flat }) }
function star(x, y, s, c) { pt.push({ k: 'star', x, y, r: s, l: 9, m: 9, c, a: rnd(0, 3) }) }
function dmgText(x, y, v, c) { pt.push({ k: 'txt', x, y, vx: rnd(-.6, .6), vy: -1.6, l: 48, m: 48, t: String(v), c }) }
const ember = y => ({ k: 'ember', x: rnd(0, W), y: y == null ? H + 8 : y, vx: rnd(-.2, .2), vy: -rnd(.4, 1.3), l: (260 + rnd(0, 200)) | 0, m: 300, r: rnd(1, 3), ph: rnd(0, 60), c: ['#ffb74d', '#ff7043', '#ffe082'][(Math.random() * 3) | 0] });
function impact(f, e, d, blocked) {
  const tp = f.atk && f.atk.prevTip, x = e.x - f.face * 20, y = tp ? Combat.clamp(tp.y, e.y - 140, e.y - 30) : e.y - 95 - rnd(0, 30), big = d >= 15;
  if (!blocked) for (let i = 0; i < (big ? 10 : 6); i++) pt.push({ k: 'spark', x, y, vx: f.face * rnd(5, 14), vy: rnd(-5, 2), l: 14 + rnd(0, 6), m: 20, c: i % 2 ? '#fff' : '#ffd54f', g: .25 });   // cono de chispas en la dirección del golpe
  if (blocked) { spark(x, y, 8, ['#4fc3f7', '#fff'], 6, 14); ring(x, y, 46, '#4fc3f7', 4, 12); return }
  spark(x, y, big ? 26 : 14, ['#fff', '#ffd54f', '#ff7043'], big ? 13 : 9, 18);
  star(x, y, big ? 70 : 42, '#fff59d'); ring(x, y, big ? 110 : 70, '#fff', 5, 14);
  const at = f.atk, kick = at && at.type == 'kick';
  pt.push({ k: 'slash', x, y, a: f.face > 0 ? (kick ? .5 : -.45) : (kick ? Math.PI - .5 : Math.PI + .45), R: big ? 120 : 84, w: big ? 18 : 11, cv: kick ? .75 : .55, l: 10, m: 10, c: kick ? '#ffcc80' : '#fff59d' });
  if (big) pt.push({ k: 'lines', x, y, n: 16, r0: 20, len: 96, a: rnd(0, 3), l: 12, m: 12, c: '#fff3b0' });
  if (at && at.up) { for (let i = 0; i < 16; i++) pt.push({ k: 'spark', x: e.x + rnd(-14, 14), y: e.y - 40, vx: rnd(-1.5, 1.5), vy: -rnd(8, 19), l: 18, m: 24, c: i % 2 ? '#fff' : '#ffd54f', g: .5 }); ring(e.x, e.y - 70, 96, '#ffd54f', 6, 16) }
  if (at && at.sw) { dust(e.x, GY + 30, 12, 1.5); ring(e.x, GY + 28, 130, '#ffe0b2', 5, 16, true) }
  dmgText(x + rnd(-14, 14), y - 30, Math.round(d), big ? '#ff5252' : '#fff')
}
function blood(x, y, face, n) { for (let i = 0; i < n; i++) pt.push({ k: 'blood', x, y, vx: face * rnd(1, 8) + rnd(-2, 2), vy: rnd(-9, -1), l: 70, m: 70, r: rnd(2, 5), g: .5, c: ['#b71c1c', '#d50000', '#7f0000'][i % 3] }) }
function hurt(f, e, d, cr) {
  const x = e.x - f.face * 14, y = e.y - 95 - rnd(0, 30);
  if (bld) { blood(x, y, f.face, (d >= 15 || cr ? 22 : 8 + (d | 0)) | 0); if (d >= 12) { pt.push({ k: 'ring', x, y, r: 4, R: 40, l: 8, m: 8, c: '#ff1744', w: 4 }) } }
  if (d >= 5 && e.bru.length < 10) e.bru.push({ x: rnd(-18, 18), y: rnd(35, 150), r: rnd(5, 11), k: Math.random() < .35 ? 'cut' : 'bruise' });
  if (cr) toast('¡CRÍTICO!', e);
  if (d >= 5) grunt(e.ch, d >= 14 || cr ? 'ko' : 'pain');
  if (d >= 14 || cr) { e.kd = 52; e.vy = -9; e.vx = f.face * 9; e.s.stun = 0; sfx('fall') }
  if (d >= 9 && Math.random() < .55) say(e, pick(OUCH)); else if (Math.random() < .2) say(f, pick(TAUNT));
}
function ptUpd() {
  pt = pt.filter(p => {
    p.l--;
    if (p.k == 'ring') { p.r += (p.R - p.r) * .25; return p.l > 0 }
    if (p.k == 'star') return p.l > 0;
    if (p.k == 'suck') { p.x += (p.tx - p.x) * .2; p.y += (p.ty - p.y) * .2; return p.l > 0 }
    p.x += p.vx || 0; p.y += p.vy || 0; if (p.g) p.vy += p.g;
    if (p.k == 'blood' && p.vy > 0 && p.y >= GY + rnd(0, 40)) { if (stains.length < 260) stains.push({ x: p.x, y: p.y, r: p.r * rnd(1, 2.2) }); return false }
    if (p.k == 'spark') p.vx *= .93;
    if (p.k == 'dust') p.r += .35;
    if (p.k == 'ember') p.x += Math.sin((p.l + p.ph) / 20) * .6;
    return p.l > 0
  });
  gh = gh.filter(g => --g.l > 0); Combat.Ribbons.update(); if (uaf && --uaf.t <= 0) uaf = null
}
function drawPt() {
  pt.forEach(p => {
    const a = Math.max(0, p.l / p.m); X.save();
    if (p.k == 'spark') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = Math.min(1, a * 1.5); X.strokeStyle = p.c; X.lineWidth = 3 * a + 1; X.lineCap = 'round'; X.beginPath(); X.moveTo(p.x, p.y); X.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); X.stroke() }
    else if (p.k == 'dust') { X.globalAlpha = a * .45; X.fillStyle = p.c; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 7); X.fill() }
    else if (p.k == 'ring') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = a * .85; X.translate(p.x, p.y); if (p.flat) X.scale(1, .2); const R0 = Math.max(1, p.r), w = Math.max(4, p.w * a + 3) * 1.7, g = X.createRadialGradient(0, 0, Math.max(0, R0 - w), 0, 0, R0 + w); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.55, p.c); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.beginPath(); X.arc(0, 0, R0 + w, 0, 7); X.fill() }
    else if (p.k == 'star') {
      X.globalCompositeOperation = 'lighter'; X.globalAlpha = a; X.translate(p.x, p.y); X.rotate(p.a); const s = p.r * (.4 + .6 * (1 - a)); X.fillStyle = p.c; X.beginPath();
      for (let i = 0; i < 16; i++) { const r = i % 2 ? s * .26 : s, an = i * Math.PI / 8; X.lineTo(Math.cos(an) * r, Math.sin(an) * r) } X.closePath(); X.fill()
    }
    else if (p.k == 'slash') {   // arco de corte con núcleo blanco
      X.globalCompositeOperation = 'lighter'; X.translate(p.x, p.y); X.rotate(p.a); const kk = 1 - a, L = p.R * (.55 + .45 * kk), w = Math.max(1.5, p.w * a), cy = -p.cv * L; X.globalAlpha = Math.min(1, a * 1.7);
      X.fillStyle = p.c; X.beginPath(); X.moveTo(-L, 0); X.quadraticCurveTo(0, cy, L, 0); X.quadraticCurveTo(0, cy + w * 2.4, -L, 0); X.fill();
      X.strokeStyle = '#fff'; X.lineWidth = Math.max(1, w * .3); X.lineCap = 'round'; X.beginPath(); X.moveTo(-L * .9, 0); X.quadraticCurveTo(0, cy + w * 1.1, L * .9, 0); X.stroke()
    }
    else if (p.k == 'lines') {   // líneas de velocidad radiales
      X.globalCompositeOperation = 'lighter'; X.translate(p.x, p.y); X.strokeStyle = p.c; X.lineCap = 'round';
      for (let i = 0; i < p.n; i++) { const an = p.a + i * 6.283 / p.n, r0 = p.r0 * (1 + (1 - a) * 1.4), r1 = r0 + p.len * (.5 + (i % 3) * .25) * (.4 + .6 * (1 - a)); X.globalAlpha = a; X.lineWidth = 1.5 + (i % 2) * 1.5; X.beginPath(); X.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); X.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); X.stroke() }
    }
    else if (p.k == 'gly') { X.globalAlpha = Math.min(1, a * 2); X.font = '30px sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(p.t, p.x, p.y) }
    else if (p.k == 'txt') { X.globalAlpha = Math.min(1, a * 2); X.font = 'bold ' + (24 + (1 - a) * 6 | 0) + 'px Impact,sans-serif'; X.textAlign = 'center'; X.lineJoin = 'round'; X.lineWidth = 5; X.strokeStyle = '#000'; X.strokeText(p.t, p.x, p.y); X.fillStyle = p.c; X.fillText(p.t, p.x, p.y) }
    else if (p.k == 'ember') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = Math.min(1, p.l / 60) * .8; X.fillStyle = p.c; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 7); X.fill() }
    else if (p.k == 'blood' || p.k == 'spit') { X.fillStyle = p.c; X.beginPath(); X.arc(p.x, p.y, p.r * Math.min(1, a * 2 + .3), 0, 7); X.fill(); if (p.k == 'spit') { X.strokeStyle = '#a5d6a7'; X.lineWidth = 1; X.stroke() } }
    else if (p.k == 'suck') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = Math.min(1, (1 - a) * 1.6 + .2); X.strokeStyle = p.c; X.lineWidth = p.r; X.lineCap = 'round'; X.beginPath(); X.moveTo(p.x, p.y); X.lineTo(p.x + (p.x - p.tx) * .22, p.y + (p.y - p.ty) * .22); X.stroke() }
    else if (p.k == 'beam') { X.globalCompositeOperation = 'lighter'; const bw = p.w * (.35 + .65 * a), g = X.createLinearGradient(0, p.y - 420, 0, p.y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.7, p.c); g.addColorStop(1, '#fff'); X.globalAlpha = a * .6; X.fillStyle = g; X.fillRect(p.x - bw / 2, p.y - 360, bw, 360); X.globalAlpha = a * .55; X.fillStyle = '#fff'; X.fillRect(p.x - bw / 9, p.y - 360, bw / 4.5, 360) }
    else if (p.k == 'crack') { X.lineCap = 'round'; X.lineJoin = 'round'; const grow = Math.min(1, (1 - a) * 5 + .15); p.sg.forEach(sg => { const n = Math.max(2, Math.ceil(sg.length * grow)); X.globalAlpha = Math.min(1, a * 1.6); X.strokeStyle = '#140808'; X.lineWidth = 4; X.beginPath(); sg.slice(0, n).forEach((q, i) => i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])); X.stroke(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = p.c; X.lineWidth = 1.6; X.globalAlpha = a * .9; X.stroke(); X.globalCompositeOperation = 'source-over' }) }
    else if (p.k == 'glow') { X.globalCompositeOperation = 'lighter'; X.globalAlpha = a * .55; const g = X.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r); g.addColorStop(0, p.c); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 7); X.fill() }
    X.restore()
  })
}

// Dibuja un retrato en un cuadrado w×w. Si la imagen es mucho más alta que ancha (Rafa, Rosita) recorta la parte de arriba (la cara) en vez de aplastarla.
function dI(im, x, y, w) { const iw = im.naturalWidth, ih = im.naturalHeight; if (ih > iw * 1.15) X.drawImage(im, 0, 0, iw, iw, x, y, w, w); else X.drawImage(im, x, y, w, w) }
// ---------- COMBATE ----------
function comboCall(e) {
  const L = e.cb >= 12 ? ['LEGENDARIO!', '#e040fb'] : e.cb >= 8 ? ['BRUTAL!', '#ff1744'] : e.cb >= 5 ? ['GREAT!', '#ff9100'] : ['NICE!', '#ffd600'];
  dmgText(e.x, e.y - 215, L[0], L[1]); ring(e.x, e.y - 100, 90 + e.cb * 8, L[1], 6, 16); spark(e.x, e.y - 100, 8 + e.cb, [L[1], '#fff'], 9, 18); sfx('ok')
}
function guardBreak(f, e) {
  e.gg = 0; e.s.stun = 55; e.imm = 115; e.hs = 16; e.vx = f.face * 9; e.atk = null; toast('\u00a1GUARDIA ROTA!', e);
  spark(e.x, e.y - 95, 30, ['#4fc3f7', '#fff', '#ffd54f'], 13, 24); ring(e.x, e.y - 95, 150, '#4fc3f7', 10, 20); star(e.x, e.y - 95, 120, '#e1f5fe');
  sfx('hitbig'); shake = Math.max(shake, 15); flashC = '#4fc3f7'; flashT = 5; hstop = Math.max(hstop, 9); rumble(e.i, 260, .7, .9)
}
// ---- efectos de habilidades: carga al lanzar, grietas, columna de luz y estela de proyectiles ----
function crackFx(x, R, c) {
  const sg = [], n = 7 + ((R / 70) | 0), gy = GY + 2;
  for (let i = 0; i < n; i++) { const dir = i % 2 ? 1 : -1, len = rnd(.35, 1) * Math.min(R, 420), pts = [[x, gy + rnd(-2, 4)]]; let cx = x, cy = pts[0][1]; const steps = 7; for (let k = 1; k <= steps; k++) { cx = Math.max(12, Math.min(W - 12, cx + dir * len / steps * rnd(.7, 1.2))); cy = Math.max(gy - 4, Math.min(gy + 44, cy + rnd(-5, 9))); pts.push([cx, cy]) } sg.push(pts) }
  pt.push({ k: 'crack', x, y: gy, l: 46, m: 46, c, sg })
}
function castFx(f, t, o) {
  const c = o && o.col && o.col != '#000' ? o.col : f.ch.c, cx = f.x, cy = f.y - 90;
  for (let i = 0; i < 16; i++) { const a = rnd(0, 6.283), r = rnd(90, 170); pt.push({ k: 'suck', x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * .8, tx: cx, ty: cy, l: 14, m: 14, r: rnd(2, 4), c: i % 3 ? c : '#fff' }) }
  ring(cx, cy, 170, c, 9, 18); ring(f.x, GY, 120, c, 7, 20, 1); pt.push({ k: 'beam', x: f.x, y: GY + 2, l: 18, m: 18, c, w: 44 }); camP = Math.max(camP, .04)
}
function projTrail(p) {
  const c = p.o.col || p.f.ch.c, tr = p.tr || (p.tr = []), sg = p.vx > 0 ? 1 : -1;
  if (!paused && hstop <= 0) { tr.push({ x: p.x, y: p.y }); if (tr.length > 10) tr.shift(); if (Math.random() < .55) pt.push({ k: 'spark', x: p.x - sg * 12, y: p.y + rnd(-14, 14), vx: -sg * rnd(1, 4), vy: rnd(-1.2, 1.2), l: 12, m: 14, c: Math.random() < .4 ? '#fff' : c, g: 0 }) }
  X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = c; const rw = Math.max(10, (p.w || 30) / 2);
  tr.forEach((q, i) => { const k = (i + 1) / tr.length; X.globalAlpha = k * .42; X.beginPath(); X.ellipse(q.x, q.y, rw * (.3 + .7 * k), 16 * (.3 + .7 * k), 0, 0, 7); X.fill() }); X.restore()
}
// ---------- KIT: efectos nuevos (escudo, barrera, vehículos, teletransporte, Omnitrix, pasivas) ----------
const FORMS = [
  { id: 'cuatro', n: '¡Cuatro Brazos!', c: '#e53935' }, { id: 'xlr8', n: '¡XLR8!', c: '#29b6f6' }, { id: 'diamante', n: '¡Diamante!', c: '#80deea' },
  { id: 'fuego', n: '¡Fuego Pantanoso!', c: '#ff6d00' }, { id: 'gris', n: '¡Materia Gris!', c: '#b0bec5' }, { id: 'wifi', n: '¡Ups, era Wi-Fi!', c: '#ff5252' }];
function omni(f) {
  const fm = FORMS[(Math.random() * FORMS.length) | 0]; f.form = { id: fm.id, n: fm.n, c: fm.c, t: 540 }; toast(fm.n, f); ring(f.x, f.y - 90, 130, fm.c, 8, 20); spark(f.x, f.y - 90, 24, [fm.c, '#fff'], 10, 22);
  if (fm.id == 'xlr8') f.boost = Math.max(f.boost, 300);
  else if (fm.id == 'diamante') { f.shield = 18; f.shT = 540 }
  else if (fm.id == 'gris') { f.cd.x = 0; f.cd.z = 0; f.ult = Math.min(100, f.ult + 20); dmgText(f.x, f.y - 190, 'RECARGA', '#b0bec5') }
  else if (fm.id == 'wifi') { f.hp = Math.max(1, f.hp - 5); dmgText(f.x, f.y - 190, 'Sin señal...', '#ff5252') }
}
// Teletransporte: detrás del rival (por defecto) o frente a él (front)
function warp(f, e, o) {
  const to = o.front ? e.x - f.face * 80 : e.x + f.face * 70; spark(f.x, f.y - 90, 18, [o.col || '#fff', '#fff'], 10, 20); ring(f.x, f.y - 90, 90, o.col || '#fff', 6, 14);
  f.x = Math.max(40, Math.min(W - 40, to)); f.face = e.x > f.x ? 1 : -1; f.vx = 0; f.mvx = 0; spark(f.x, f.y - 90, 18, [o.col || '#fff', '#fff'], 10, 20); ring(f.x, f.y - 90, 90, o.col || '#fff', 6, 14); sfx('dodge');
  if (o.boost) f.boost = Math.max(f.boost, o.boost);
  if (o.d) hit(f, e, o.d, o.st || null, {}); else if (o.st) e.s[o.st[0]] = Math.max(e.s[o.st[0]] || 0, o.st[1])
}
// Vehículo / multitud que cruza la pantalla (JP: Uber Premium · Mati: La revolución)
function vehStart(f, e, o) { const dir = e.x >= f.x ? -1 : 1; vehs.push({ f, e, o, dir, x: dir < 0 ? W + 150 : -150, hit: false, t: 0 }); sfx('sp') }
function vehsTick() {
  vehs = vehs.filter(z => {
    const { f, e, o } = z; z.t++; z.x += z.dir * (o.spd || 20); if (z.t % 4 == 0) dust(z.x - z.dir * 50, GY + 2, 1, 1.3);
    if (!z.hit && (z.dir < 0 ? z.x <= e.x + 30 : z.x >= e.x - 30)) {
      z.hit = true;
      if (e.y < GY - 95 && !o.sure) say(e, '¡Esquivé!', 50);
      else { const bk = e.blk; hit(f, e, o.d, o.st || null, Object.assign({}, o, { kd: 1 })); if (!bk) { e.kd = 60; e.vy = -11; e.vx = z.dir * 14 } spark(e.x, e.y - 70, 30, ['#fff', o.col || '#ffd54f', '#ff7043'], 13, 24); ring(e.x, e.y - 70, 150, '#fff', 8, 18); shake = Math.max(shake, 16); sfxN(.4, .3) }
    }
    return z.x > -260 && z.x < W + 260
  })
}
function vehsDraw() {
  vehs.forEach(z => { X.save(); X.translate(z.x, GY + 38); X.font = (z.o.sz || 100) + 'px sans-serif'; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.globalAlpha = .96; X.fillText(z.o.gl, 0, 0); X.restore() })
}
// Barrera de papeleo (Mono): destruye los proyectiles del rival que llegan a ella
function barrierTick() {
  F.forEach(b => {
    if (b.barrier <= 0) return;
    proj.forEach(p => { if (p.f !== b && !p.dead && Math.abs(p.x - (b.x + b.face * 70)) < 42) { p.dead = true; spark(p.x, p.y, 14, ['#fff', '#eceff1'], 8, 16); ring(p.x, p.y, 70, '#eceff1', 5, 12); dmgText(p.x, p.y - 30, '¡Vuelva mañana!', '#eceff1'); sfx('block') } })
  })
}
function barrierDraw() {
  F.forEach(b => {
    if (b.barrier <= 0) return; const x = b.x + b.face * 70, al = Math.min(1, b.barrier / 20);
    X.save(); X.globalAlpha = al * .9; X.translate(x, GY - 70); X.fillStyle = '#f5f5f5'; X.strokeStyle = '#90a4ae'; X.lineWidth = 3;
    for (let i = 0; i < 4; i++) { X.save(); X.translate((i % 2 ? 6 : -6), -60 + i * 38); X.rotate((i - 1.5) * .08); X.fillRect(-26, -20, 52, 40); X.strokeRect(-26, -20, 52, 40); X.fillStyle = '#b0bec5'; X.fillRect(-18, -10, 36, 3); X.fillRect(-18, 0, 28, 3); X.fillStyle = '#f5f5f5'; X.restore() }
    X.font = '30px sans-serif'; X.textAlign = 'center'; X.fillText('📄', 0, 4); X.restore()
  })
}
// Antes de aplicar un golpe: escudo, pasivas defensivas y ofensivas. Devuelve el daño final (-1 = golpe anulado)
function kitPre(f, e, d, o) {
  if (o.ultra || o.noKit) return d;
  if (e.shield > 0) { e.shield -= d; ring(e.x, e.y - 90, 90, '#ffd54f', 6, 12); spark(e.x, e.y - 90, 10, ['#fff', '#ffd54f'], 8, 14); toast(e.shield <= 0 ? '¡Escudo roto!' : '¡Escudo!', e); sfx('block'); if (e.shield <= 0) { e.shield = 0; e.shT = 0 } return -1 }
  const ep = e.ch.pa, fp = f.ch.pa;
  if (ep == 'moneyDodge' && !o.sure && Math.random() < .18) { toast('¡Pago simbólico!', e); pt.push({ k: 'gly', x: e.x, y: e.y - 150, vx: 0, vy: -1.4, l: 40, m: 40, t: '💸' }); return -1 }
  if (ep == 'contacts' && Math.random() < .2) { d *= .5; toast('¡Tengo contactos!', e) }
  if (ep == 'bigHouse' && e.hp > e.mhp * .5) d *= .82;
  if (ep == 'lowRes' && e.hp < e.mhp * .35) d *= .72;
  if (fp == 'heavy' && d >= 8) d *= 1.2;
  if (f.s.blind > 0) d *= .5;
  if (f.form && f.form.id == 'cuatro') d *= 1.4;
  return d
}
// Después de aplicar un golpe (f ataca, e recibe)
function kitPost(f, e, d, bk, o, st) {
  const fp = f.ch.pa, ep = e.ch.pa;
  if (bk) {
    if (ep == 'blockHeal') { e.pb++; e.pbt = 110; if (e.pb >= 2) { e.hp = Math.min(e.mhp, e.hp + 2); dmgText(e.x, e.y - 170, '+2', '#69f0ae'); ring(e.x, e.y - 90, 70, '#69f0ae', 4, 12) } }
    return
  }
  if (o.push) e.vx = f.face * o.push;
  if (fp == 'knock' && d >= 8 && Math.random() < .4) { e.vx = f.face * 16; e.vy = -5; toast('¡Retrocede!', e) }
  if (o.steal) { const t = Math.min(e.ult, o.steal); e.ult -= t; f.ult = Math.min(100, f.ult + t); if (t > 0) { dmgText(e.x, e.y - 190, '-' + Math.round(t) + ' ULTRA', '#ffd54f'); spark(e.x, e.y - 90, 12, ['#ffd54f', '#fff'], 8, 18) } }
  if (ep == 'lightCharge' && (o.light || (st && st[0] == 'burn'))) { e.ult = Math.min(100, e.ult + 14); toast('¡Carga solar!', e); ring(e.x, e.y - 90, 100, '#fff59d', 6, 14) }
  if (ep == 'hitSpeed' && e.hp > 0) { e.boost = Math.max(e.boost, 100); if (e.at % 3 == 0) toast('¡Más rápido!', e) }
  if (fp == 'chain') { f.chain = f.chainT > 0 ? Math.min(5, f.chain + 1) : 1; f.chainT = 110 }
  if (fp == 'rhythm') {
    const dt = f.at - f.lh; f.lh = f.at;
    if (dt >= 20 && dt <= 46) { f.beat = Math.min(4, f.beat + 1); if (f.beat >= 2) { f.boost = Math.max(f.boost, 110); toast('♪ RITMO x' + f.beat, f); pt.push({ k: 'gly', x: f.x, y: f.y - 190, vx: 0, vy: -1.2, l: 36, m: 36, t: '🎵' }) } } else f.beat = 0
  }
}
// Pasivas que se evalúan cada frame
function kitTick(f) {
  if (f.shT > 0 && --f.shT == 0) f.shield = 0;
  if (f.barrier > 0) f.barrier--;
  if (f.form && --f.form.t <= 0) f.form = null;
  if (f.chainT > 0 && --f.chainT == 0) f.chain = 0;
  if (f.pbt > 0 && --f.pbt == 0) f.pb = 0;
  if (f.form && f.at % 14 == 0) spark(f.x, f.y - 90, 2, [f.form.c], 5, 14);
  if (f.shield > 0 && f.at % 10 == 0) ring(f.x, f.y - 90, 70, '#ffd54f', 3, 10);
  if (f.s.blind > 0 && f.at % 14 == 0) pt.push({ k: 'gly', x: f.x, y: f.y - 200, vx: 0, vy: -.6, l: 30, m: 30, t: '💫' });
  f.still = (!f.mv && f.y >= GY && !f.atk && !f.dash) ? f.still + 1 : 0;
  if (f.ch.pa == 'still' && f.still > 120) { f.ult = Math.min(100, f.ult + .1); f.cd.k -= .4; f.cd.x -= .4; f.cd.z -= .4; if (f.at % 24 == 0) { spark(f.x, f.y - 60, 4, ['#69f0ae', '#fff'], 4, 22); pt.push({ k: 'gly', x: f.x + rnd(-20, 20), y: f.y - 150, vx: 0, vy: -1, l: 30, m: 30, t: '🌿' }) } }
}
const kcd = (f, m) => (m[1].cd || 90) * (f.ch.pa == 'ranged' && m[0] == 'P' ? .6 : 1);   // Mamin: ataques a distancia recargan más rápido
const spdMul = f => (f.chainT > 0 ? 1 + .06 * f.chain : 1) * (f.form && f.form.id == 'xlr8' ? 1.25 : 1);
function newAtk(f, type, pw) {
  const a = new Combat.Attack(type, f.ch);
  // v8.0: golpe RÁPIDO (menos daño, arranca y se recupera antes) o FUERTE (más daño, más lento y castigable; la patada fuerte derriba)
  if (type != 'grab' && pw == 'strong') { a.d *= 1.45; a.su += 3; a.rc += 4; a.strong = 1; if (type == 'kick') a.kdf = 1 }
  else if (type != 'grab' && pw == 'fast') { a.d *= .85; a.su = Math.max(3, a.su - 1); a.rc = Math.max(10, a.rc - 2); a.fast = 1 }
  if (f.ch.pa == 'reach' && type != 'grab') { a.reach *= 1.3; a.r = a.reach + Combat.Config.HURT_HALF }
  // Cadena de golpes: 1 (normal) → 2 (más fuerte y rápido) → 3 (FINAL: más lento, pega mucho, derriba y empuja). Hay que encadenar antes de ~0,5 s
  if (type != 'grab' && !f.blk) {
    f.cn = f.cnT > 0 ? (f.cn % 3) + 1 : 1; a.cn = f.cn;
    if (f.y < GY - 6) a.air = 1;
    else if (a.cn == 2) { a.d *= 1.15; a.rc = Math.max(8, a.rc - 2) }
    else if (a.cn == 3) { a.d *= 1.5; a.su += 2; a.rc += 5; a.kdf = 1; a.fin = 1 }
    f.cnT = a.total + 20   // ventana para encadenar: ~0,3 s después de terminar este golpe
  }
  return a
}
function hit(f, e, d, st, o = {}) {
  if (e.xf) { if (Combat.Assist.invulnerable(e) && !o.sure) return; Combat.Assist.cancel(e, AH) }   // transformado: inmune al entrar/salir; si lo golpean en medio, vuelve a Mario
  if (e.dg > 6 && !o.sure) { dodged(f, e); return }
  if (e.kd > 0 && !o.sure) return;   // caído: no se le puede pegar mientras se levanta
  if (e.parry > 0 && !o.sure) { f.s.stun = 50; e.parry = 0; toast('¡PARRY!', e); ring(e.x, e.y - 90, 90, '#fff', 8, 16); spark(e.x, e.y - 90, 16, ['#fff', '#4fc3f7'], 11, 16); hstop = 8; return }
  d = kitPre(f, e, d, o); if (d < 0) return;   // escudo / pasivas (kit.js)
  if (f.form && f.form.id == 'fuego' && !st && !o.ultra) st = ['burn', 120];
  const kdx = o.kd || (f.form && f.form.id == 'cuatro' && d >= 8);
  if (e.dance > 0) { d *= 1.5; e.dance = 0 }
  if (f.bh > 0 && !o.ultra) { d *= 1.3; f.bh = 0; toast('¡CONTRA!', f) }
  const bk = e.blk && !o.sure, hb = e.hp;   // o.sure: golpe garantizado, el bloqueo no lo frena
  let cr = false, ctr = false;
  if (!bk && !o.ultra && !o.sure && e.atk && !e.atk.grab && e.atk.t <= e.atk.su + e.atk.ac && !(e.kd > 0)) { ctr = true; d *= 1.25 }   // contraataque: lo pillas atacando
  if (!bk) {
    e.cb = e.cbt > 0 ? e.cb + 1 : 1; e.cbt = 80; d *= Math.max(.5, 1 - .1 * (e.cb - 1));   // combos: cada golpe seguido pega menos (mín. 50%)
    cr = Math.random() < .08; if (cr) d *= 1.4;
    if (e.cb == 3 || e.cb == 5 || e.cb == 8 || e.cb == 12) comboCall(e)
  }
  if (bk) { e.gg = (e.gg || 0) + Math.min(34, d * 2.2 + 6) * (e.ch.pa == 'cheapBlock' ? .45 : 1); d *= .2; if (e.gg >= 100) guardBreak(f, e) } else {
    e.hs = 12; e.hk = o.kind == 'kick' ? 1 : 0; e.jmp = 0; e.vx = f.face * 7; e.atk = null; e.scr = null; e.scrF = null;
    if (st) { const hard = st[0] == 'stun' || st[0] == 'freeze'; if (!(hard && e.imm > 0)) { e.s[st[0]] = hard ? Math.min(st[1], 70) : st[1]; if (hard) e.imm = 115 } }   // aturdir: máx 70f y luego inmunidad (anti stun-lock)
    if (o.pull) e.x = f.x + f.face * 60; if (o.up) e.vy = -14
  }
  sfx(bk ? 'block' : (d >= 22 || o.ultra) ? 'mega' : d >= 14 ? 'hitbig' : 'hit'); e.hp = Math.max(0, e.hp - d); e.dt = (e.dt || 0) + (hb - e.hp); hitHook(f, e, d, bk, hb, o);
  if (o.drain) { const g = (hb - e.hp) * o.drain; if (g > 0) { f.hp = Math.min(f.mhp, f.hp + g); spark(f.x, f.y - 90, 14, ['#e040fb', '#fff'], 7, 22); dmgText(f.x, f.y - 190, '+' + Math.round(g), '#e040fb') } }
  const heavy = !bk && (d >= 15 || cr), mega = !bk && d >= 22;   // golpe fuerte / golpe brutal
  shake = Math.min(mega ? 20 : heavy ? 17 : 14, d / 2 + 3 + (heavy ? 3 : 0)); camP = Math.max(camP, bk ? .01 : mega ? .2 : heavy ? .14 : d >= 10 ? .06 : .025); camF = { x: e.x, w: bk ? .15 : heavy ? 1 : .35 };
  if (mega) { flashC = '#fff'; flashT = 4 }
  impact(f, e, d, bk); hstop = Math.max(hstop, o.hs != null && !bk ? o.hs : Combat.Juice.hitstopFor(d, { blocked: bk, heavy, mega, kind: o.kind }));   // o.hs: hitstop propio del golpe shakeDir = f.face;
  if (ctr) { toast('\u00a1COUNTER!', e); star(e.x, e.y - 100, 100, '#ff8a80'); ring(e.x, e.y - 95, 130, '#ff5252', 8, 16); hstop = Math.max(hstop, 7); flashC = '#ff5252'; flashT = 3 }
  if (!bk) { hurt(f, e, d, cr); if (kdx && !(e.kd > 0)) { e.kd = 52; e.vy = -9; e.vx = f.face * 9; e.s.stun = 0; sfx('fall') } if (hb > e.mhp * .25 && e.hp <= e.mhp * .25 && e.hp > 0) say(e, LOWHP_CH[e.ch.id] && Math.random() < .65 ? LOWHP_CH[e.ch.id] : pick(LOWHP), 90) }
  if (o.heal) f.hp = Math.min(f.mhp, f.hp + o.heal);
  kitPost(f, e, d, bk, o, st)
}
function cast(f, e, m) {
  const isX = m == f.ch.x; if (m[0] == 'R') m = m[1].pool[(Math.random() * m[1].pool.length) | 0];   // R: habilidad al azar de una lista
  let [t, o] = m; if (f.ch.pa == 'confuse' && 'PADW'.includes(t) && !o.st && Math.random() < .3) { o = Object.assign({}, o, { st: ['invert', 110] }); toast('¡Confusión!', e) }   // Toño: pasiva
  if (o.jump && f.y >= GY) f.vy = -17; if (o.honk) honk(o.honk); toast(o.n, f); castFx(f, t, o); sfx(t == 'H' ? 'heal' : 'sp', t); grunt(f.ch, 'shout'); speak(o.n, f.ch, { force: 1, shout: 1 }); f.cast = 22; f.cp = isX ? 'cast2' : 'cast';
  if (o.heal && t != 'P') { const b = f.hp; f.hp = Math.max(1, Math.min(f.mhp, f.hp + o.heal)); if (t == 'H') { const dv = Math.round(f.hp - b), good = o.heal > 0; spark(f.x, f.y - 90, 20, good ? ['#b9f6ca', '#fff'] : ['#ff5252', '#fff'], 6, 26); ring(f.x, f.y - 90, 120, o.col || '#69f0ae', 6, 22); dmgText(f.x, f.y - 160, (dv > 0 ? '+' : '') + dv, good ? '#69f0ae' : '#ff5252') } }
  if (o.clean) for (const k in f.s) f.s[k] = 0;   // limpia estados (lento, quemado, confundido...)
  if (o.boost) f.boost = o.boost;                  // velocidad x1.5 por un rato
  if (t == 'P') { const nv = o.volley || 1; for (let i = 0; i < nv; i++) proj.push({ x: f.x + f.face * (40 - i * 70), y: f.y - 85 + (nv > 1 ? (i - (nv - 1) / 2) * 30 : 0), vx: f.face * o.v, w: o.w || 30, o, f, e, life: (o.life || (o.back ? 48 : 100)) + i * 5, txt: o.sp == 'indirecta' ? pick(IND) : null }) }
  if (t == 'A') { if (o.tree || o.mansion) trees.push({ t: o.dl, m: o.dl, f, e, o, sx: f.x + f.face * 24, sy: f.y - 175, land: 0 }); else fx.push({ t: o.dl, m: o.dl, f, e, o }) }
  if (t == 'D') f.dash = { v: o.v, t: 22, o, h: 0 };
  if (t == 'W') warp(f, e, o);
  if (t == 'S') { f.shield = o.hp; f.shT = o.t; ring(f.x, f.y - 90, 100, '#ffd54f', 8, 20); star(f.x, f.y - 90, 90, '#fff59d') }
  if (t == 'Y') f.barrier = o.win;
  if (t == 'V') vehStart(f, e, o);
  if (t == 'O') omni(f);
  if (t == 'T') truckStart(f, e, o);   // camión (Juanito)
  if (t == 'C') Combat.Assist.start(f, e, o, AH);   // transformación: Mario → Criss → golpe pesado → Mario
  if (t == 'F') e.s.freeze = o.t;
  if (t == 'Q') { const a = (f.hp / f.mhp + e.hp / e.mhp) / 2; f.hp = a * f.mhp; e.hp = a * e.mhp }
  if (t == 'K') f.parry = o.win || 25;
  if (t == 'Z') f.dance = 120;
  if (t == 'B') { dark = 100; fx.push({ t: 100, m: 100, f, e, o: { d: o.d, r: 300, col: '#000' } }) }
  if (t == 'G' && Math.abs(e.x - f.x) < o.r) { hit(f, e, o.d, null, {}); f.hp = Math.min(f.mhp, f.hp + o.d) }
}
// Hooks que assist.js usa para tocar el juego (así el módulo no depende de variables globales de game.js)
const AH = {
  hit, sfx, ring, star, spark, dust, say, toast,
  shake: n => { shake = Math.max(shake, n) },
  flash: (c, t) => { flashC = c; flashT = t },
  ghost: g => gh.push(g),
  walls: () => [40, W - 40]
};
// ---- estelas del ataque: ribbon de trayectoria (arco de la punta) + afterimages del cuerpo ----
function atkTrail(f, a) {
  const tp = Combat.tipPosition(f, a), kick = a.type == 'kick';
  a.tipX = tp.x; a.tipY = tp.y;
  if (a.isActive) {
    const p0 = a.prevTip || { x: tp.ox + f.face * 14, y: tp.oy };
    Combat.Ribbons.push(p0.x, p0.y, tp.x, tp.y, f.face, kick ? '#ffb74d' : '#fff59d', kick ? 15 : 9, kick ? 20 : 5);
  }
  a.prevTip = tp;
  if (hasAnim(f.ch)) { const rg = atkRig(f); if (rg) Combat.pushAttackGhost(gh, f, rg, rg.layers[rg.layers.length - 1].frame) }
}
// Capas interpoladas (crossfade + lean + squash) del ataque actual; null si la pose la decide otro estado (golpeado, esquive, dash...)
function atkRig(f) {
  const a = f.atk; if (!a || f.kd > 0 || f.dg > 0 || f.hs > 0 || f.s.stun > 0 || f.s.freeze > 0 || f.dash) return null; if (a.type == 'kick' && f.y < GY - 6 && f.ch.A.st.airkick) return null;
  const S = f.ch.A.st; return Combat.attackRig(f, a.sw ? S.sweep : a.up ? S.upper : a.type == 'kick' ? S.kick : S.punch, poseFrame(f, true))
}
function upd(f, e, I) {
  const s = f.s, px = f.x; f.face = e.x > f.x ? 1 : -1; f.at++; f.cast--;
  for (const k in s) if (s[k] > 0) s[k]--;
  if (s.burn > 0) f.hp = Math.max(0, f.hp - .07);
  f.cd.k--; f.cd.x--; f.cd.z--; f.cd.c--; f.cnT--; f.rn--; f.cd.d--; f.dg--; f.bh--; f.hs--; f.parry--; f.boost--; f.kd--; f.imm--; f.cbt--; if (f.cbt <= 0) f.cb = 0; if (f.say) f.say.l--;
  if (bld && f.hp > 0 && f.hp < f.mhp * .3 && f.at % 22 == 0) blood(f.x + rnd(-14, 14), f.y - rnd(40, 120), 0, 1);
  if (!f.blk && f.gg > 0) f.gg = Math.max(0, f.gg - .55);   // la guardia se recupera al soltar el bloqueo
  if (f.dance > 0 && --f.dance == 0) f.boost = 120;
  kitTick(f);
  if (f.xf) { if (s.freeze > 0 || s.stun > 0 || f.kd > 0 || f.hs > 0 || f.dg > 0) Combat.Assist.cancel(f, AH); else Combat.Assist.step(f, e, AH) }   // máquina de la transformación (assist.js)
  const gr = f.y >= GY, can = !(f.dg > 0 || s.stun > 0 || s.freeze > 0 || f.hs > 0 || f.dash || f.dance > 0 || f.kd > 0 || f.xf);
  let L = I.l, Rt = I.r; if (s.invert > 0) [L, Rt] = [Rt, L];
  f.blk = can && gr && (I.b || I.bl) && !f.atk;   // ↓ o R2 = bloqueo
  let cmb = false;
  if (window.comboStep && can && !f.scr) { if (comboStep(f, e, I)) cmb = true }   // combos.js: secuencias de botones (como Mortal Kombat) que lanzan una habilidad
  else if (window.comboRec) comboRec(f, I);
  if (I.ai && I.cmbReq && can && !f.atk && !f.scr && window.comboAI && comboAI(f, e)) cmb = true;
  if (can && (I.hit.p || I.hit.k) && f.ch.cb) {
    f.ib.push({ c: (I.hit.p || f.ch.nk) ? 'p' : 'k', t: f.at }); f.ib = f.ib.filter(q => f.at - q.t < 75).slice(-4);
    const q = f.ib.map(z => z.c).join(''), m = f.ch.cb.filter(c => q.endsWith(c[0])).sort((x, y) => y[0].length - x[0].length)[0];   // gana el combo más largo
    f.cbw = null;
    if (m && f.cd.c <= 0) {
      if (f.ch.cb.some(c => c[0].length > m[0].length && c[0].startsWith(m[0]))) f.cbw = { m, t: f.at };   // hay un combo más largo que empieza igual: espera un instante por si lo completas
      else { f.cd.c = 240; f.ib = []; f.atk = null; cmb = true; cast(f, e, [m[1], m[2]]); star(f.x, f.y - 100, 90, '#e040fb'); ring(f.x, f.y - 90, 130, '#e040fb', 8, 18) }
    }
  }
  if (can && f.cbw && f.at - f.cbw.t >= 24 && f.cd.c <= 0) { const m = f.cbw.m; f.cbw = null; f.cd.c = 240; f.ib = []; f.atk = null; cmb = true; cast(f, e, [m[1], m[2]]); star(f.x, f.y - 100, 90, '#e040fb'); ring(f.x, f.y - 90, 130, '#e040fb', 8, 18) }
  if (can && gr && I.b && !I.bl && !cmb && !f.atk && (I.hit.p || I.hit.k || I.hit.hp || I.hit.hk) && f.ch.A) {   // MK: ↓ + puño = UPPERCUT · ↓ + patada = BARRIDA (los dos derriban)
    const sw = (I.hit.k || I.hit.hk) && !I.hit.p && !I.hit.hp && !f.ch.nk, str = I.hit.hp || I.hit.hk, a = newAtk(f, sw ? 'kick' : 'punch', str ? 'strong' : 'fast');
    if (sw) { a.sw = 1; a.d *= .9; a.rc += 4 } else { a.up = 1; a.d *= 1.3; a.su += 1 }
    a.kdf = 1; f.atk = a; f.blk = false; sfx(sw ? 'kick' : 'punch')
  }
  let wdir = 0; const wsp = f.ch.s * (s.slow > 0 ? .5 : 1) * (f.boost > 0 ? 1.5 : 1) * spdMul(f);   // caminata: dirección deseada y velocidad máx. (la inercia la aplica Locomotion.walk)
  if (can && !f.atk && !f.blk && !cmb) {
    const sp = f.ch.s * (s.slow > 0 ? .5 : 1) * (f.boost > 0 ? 1.5 : 1) * spdMul(f);
    if (s.root <= 0) wdir = (Rt ? 1 : 0) - (L ? 1 : 0);
    // Doble toque ←← / →→: carrera corta hacia el rival o paso atrás con saltito (como los juegos de pelea)
    if (gr && s.root <= 0 && f.rn <= -6) {
      const tap = (s.invert > 0 ? I.hit.l : I.hit.r) ? 1 : (s.invert > 0 ? I.hit.r : I.hit.l) ? -1 : 0;
      if (tap) {
        if (f.tapD == tap && f.at - f.tapT < 20) {
          const fwd = tap == f.face; f.mvx = tap * f.ch.s * (fwd ? 2.6 : 2.2); f.rn = fwd ? 16 : 12; f.tapD = 0; if (!fwd) f.vy = -6;
          dust(f.x, GY + 2, 6, 1.1); ring(f.x, GY + 2, 46, 'rgba(255,255,255,.6)', 3, 12); sfx('dodge')
        } else { f.tapD = tap; f.tapT = f.at }
      }
    }
    if (f.rn > 0 && f.at % 2 == 0 && hasAnim(f.ch)) gh.push({ ch: f.ch, fi: poseFrame(f), x: f.x, y: f.y, face: f.face, l: 11, m: 11 });
    if (I.u && gr && s.root <= 0) { f.vy = Combat.Config.JUMP_V; f.jmp = 1; f.jhold = I.ai ? 18 : 0; dust(f.x, GY + 2, 5, 1); ring(f.x, GY + 2, 38, 'rgba(255,255,255,.7)', 3, 10); f.sq = -.9; sfx('jump') }
    if (I.hit.q && f.ult >= 100 && gr) startUltra(f, e);
    else if (I.hit.d && f.cd.d <= 0 && gr) doDodge(f, L, Rt);
    else if (I.hit.g && gr) { f.atk = newAtk(f, 'grab'); sfx('nav') }
    else if (I.hit.hp || (I.hit.hk && f.ch.nk)) f.atk = newAtk(f, 'punch', 'strong');   // nk: personaje sin patada (Rafa) -> mismo golpe
    else if (I.hit.p || (I.hit.k && f.ch.nk)) f.atk = newAtk(f, 'punch', 'fast');
    else if (I.hit.hk) f.atk = newAtk(f, 'kick', 'strong');
    else if (I.hit.k) f.atk = newAtk(f, 'kick', 'fast');
    else if (I.hit.s && f.cd.k <= 0) { f.cd.k = kcd(f, f.ch.k); cast(f, e, f.ch.k) }
    else if (I.hit.x && f.cd.x <= 0) { f.cd.x = kcd(f, f.ch.x); cast(f, e, f.ch.x) }
    else if (I.hit.z && f.cd.z <= 0 && f.ch.z) { f.cd.z = kcd(f, f.ch.z); cast(f, e, f.ch.z) }
    else if (I.hit.a && f.assist) { f.assist = 0; dog = { x: f.x, dir: f.face, e, f }; toast('¡Tormenta!', f) }
  }
  Combat.Locomotion.walk(f, wdir, wsp, gr); f.x += f.mvx;   // aceleración / fricción (también desliza tras un lunge de ataque)
  if (f.dash) { const d = f.dash; if (hasAnim(f.ch) && f.at % 2 == 0) gh.push({ ch: f.ch, fi: poseFrame(f), x: f.x, y: f.y, face: f.face, l: 14, m: 14 }); f.x += f.face * d.v; if (!d.h && Math.abs(e.x - f.x) < 60) { d.h = 1; hit(f, e, d.o.d, d.o.st || null, { kd: d.o.kd, push: d.o.push }); d.t = Math.min(d.t, 3) } if (--d.t <= 0) f.dash = null }
  if (f.dg > 0) { f.x += f.dgd * (2 + f.dg * .45); if (f.dg % 3 == 0 && hasAnim(f.ch)) gh.push({ ch: f.ch, fi: poseFrame(f), x: f.x, y: f.y, face: f.face, l: 12, m: 12 }) }
  const a = f.atk;
  if (a) {
    const ev = a.step();                                   // STARTUP → ACTIVE → RECOVERY (ver combat.js)
    if (ev.start && !a.grab) { sfx(a.type == 'kick' ? 'kick' : 'punch', a.strong ? 2 : a.fast ? 0 : 1); if (Math.random() < .55) grunt(f.ch, 'atk') }
    if (ev.activeStart) Combat.Locomotion.lunge(f, a);      // el cuerpo entra en el golpe
    if (!a.grab && (a.isActive || (a.phase == 'startup' && a.t >= a.su - 1))) atkTrail(f, a);
    if (a.connects(f, e)) { a.h = 1; if (a.grab) grabHit(f, e); else hit(f, e, a.d, null, { kind: a.type, kd: a.kdf, hs: a.fin ? 10 : a.strong ? 7 : undefined, push: a.fin ? 17 : a.strong ? 10 : undefined }); if (a.fin) { shake = Math.max(shake, 11); ring(e.x, e.y - 90, 110, '#fff', 8, 14); star(e.x, e.y - 90, 70, f.ch.c) } }
    if (a.cn == 3 && ev.start && !a.grab) toast('¡FINAL!', f)
    if (ev.start && a.air && a.type == 'kick') { f.mvx = (f.mvx || 0) + f.face * 3.4; f.vy = Math.max(f.vy, 3.5); dust(f.x, f.y, 3, .6) }   // patada voladora: se lanza hacia el rival
    if (ev.end) { f.atk = null; if (f.scr && window.comboNext) comboNext(f, e, can) }
  }
  Combat.Locomotion.gravity(f, I.u || f.jhold-- > 0); f.y += f.vy;   // salto variable: soltar el botón corta la subida
  if (f.y > GY) { if (f.vy > 4) { f.sq = Math.min(1.7, .7 + f.vy / 14); dust(f.x, GY + 2, f.vy > 13 ? 14 : 8, f.vy > 13 ? 1.7 : 1.2); if (f.vy > 13) ring(f.x, GY + 2, 70, 'rgba(255,255,255,.55)', 4, 14); sfx('land') } f.y = GY; f.vy = 0; f.jmp = 0 }
  f.sq *= .82; if (f.mv && gr && f.at % 9 == 0) dust(f.x - f.face * 12, GY + 2, 2, .7); if (f.mv && gr && f.at % 18 == 0) sfx('step');
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
  } else if (p.o.sp == 'indirecta') {
    X.rotate(-a); const dr = p.vx > 0 ? 1 : -1, tx = p.txt || '...'; X.font = 'bold 13px sans-serif'; const tw = X.measureText(tx).width, bw = tw / 2 + 11;
    X.fillStyle = '#fff'; X.strokeStyle = '#ec407a'; X.lineWidth = 3; X.beginPath(); X.moveTo(-bw + 8, -15); X.lineTo(bw - 8, -15); X.quadraticCurveTo(bw, -15, bw, -7); X.lineTo(bw, 7); X.quadraticCurveTo(bw, 15, bw - 8, 15);
    X.lineTo(-dr * (bw - 14), 15); X.lineTo(-dr * (bw + 8), 26); X.lineTo(-dr * (bw - 28), 15); X.lineTo(-bw + 8, 15); X.quadraticCurveTo(-bw, 15, -bw, 7); X.lineTo(-bw, -7); X.quadraticCurveTo(-bw, -15, -bw + 8, -15); X.closePath(); X.fill(); X.stroke();
    X.fillStyle = '#880e4f'; X.textAlign = 'center'; X.fillText(tx, 0, 4);
    RB.forEach((c, i) => { X.fillStyle = c; X.fillRect(-bw + 6 + i * ((2 * bw - 12) / 7), 9, (2 * bw - 12) / 7 + .5, 3) })
  } else if (p.o.sp == 'handroll') {
    X.fillStyle = '#1b3a2b'; X.strokeStyle = '#0a1a12'; X.lineWidth = 3; X.beginPath(); X.moveTo(-26, 0); X.lineTo(16, -19); X.lineTo(16, 19); X.closePath(); X.fill(); X.stroke();
    X.strokeStyle = 'rgba(120,200,150,.35)'; X.lineWidth = 2; X.beginPath(); X.moveTo(-18, 0); X.lineTo(14, -10); X.stroke();
    X.fillStyle = '#fafafa'; X.strokeStyle = '#bbb'; X.lineWidth = 1.5; X.beginPath(); X.ellipse(16, 0, 8, 19, 0, 0, 7); X.fill(); X.stroke();
    X.fillStyle = '#ff8a65'; X.beginPath(); X.ellipse(20, -6, 7, 6, .3, 0, 7); X.fill();
    X.fillStyle = '#9ccc65'; X.beginPath(); X.ellipse(21, 6, 5, 6, 0, 0, 7); X.fill();
    X.fillStyle = '#76ff03'; X.beginPath(); X.arc(18, 12, 3, 0, 7); X.fill()
  } else if (p.o.gl) {
    if (!'🔪🏀💳🧾📄'.includes(p.o.gl)) X.rotate(-a); X.font = Math.max(34, (p.w || 30) * .8) + 'px sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(p.o.gl, 0, 0)
  } else {
    X.fillStyle = '#1e88e5'; X.strokeStyle = '#0b3d75'; X.lineWidth = 3; X.beginPath(); X.ellipse(0, 0, 30, 15, 0, 0, 7); X.fill(); X.stroke();
    X.fillStyle = '#90caf9'; X.beginPath(); X.ellipse(-4, -2, 20, 8, 0, 0, 7); X.fill();
    X.strokeStyle = '#fff'; X.lineWidth = 6; X.lineCap = 'round'; X.beginPath(); X.moveTo(-8, -9); X.lineTo(10, 0); X.lineTo(-8, 9); X.stroke()
  }
  X.restore()
}
// Árbol (copa hacia arriba cuando ang = 0), centrado en (x, y)
// Mansión de "Herencia Familiar" (dibujada con trazos; (x, by) = centro de la base)
function mansionArt(x, by, sq, al) {
  X.save(); X.globalAlpha = al; X.translate(x, by); X.scale(1.05, sq); X.lineJoin = 'round'; X.lineWidth = 3; X.strokeStyle = '#3e2723';
  const R = (a, b, w, h, c) => { X.fillStyle = c; X.fillRect(a, b, w, h); X.strokeRect(a, b, w, h) };
  R(-150, -150, 300, 150, '#f3e5c8');                                  // cuerpo
  R(-150, -158, 300, 10, '#d7c3a0');                                  // cornisa
  X.fillStyle = '#7b1e1e'; X.beginPath(); X.moveTo(-170, -158); X.lineTo(-96, -226); X.lineTo(96, -226); X.lineTo(170, -158); X.closePath(); X.fill(); X.stroke();   // techo
  R(112, -250, 22, 40, '#8d3a2c'); R(-134, -246, 18, 36, '#8d3a2c');  // chimeneas
  X.fillStyle = '#f3e5c8'; X.beginPath(); X.moveTo(-62, -150); X.lineTo(0, -204); X.lineTo(62, -150); X.closePath(); X.fill(); X.stroke();   // frontón
  X.fillStyle = '#ffd54f'; X.beginPath(); X.arc(0, -168, 8, 0, 7); X.fill(); X.stroke();
  [-132, 78].forEach(wx => [-128, -66].forEach(wy => { R(wx, wy, 54, 46, '#90caf9'); X.beginPath(); X.moveTo(wx + 27, wy); X.lineTo(wx + 27, wy + 46); X.moveTo(wx, wy + 23); X.lineTo(wx + 54, wy + 23); X.stroke(); R(wx - 9, wy, 9, 46, '#2e7d32'); R(wx + 54, wy, 9, 46, '#2e7d32') }));
  R(-36, -86, 72, 86, '#5d4037'); X.fillStyle = '#ffd54f'; X.beginPath(); X.arc(22, -42, 4.5, 0, 7); X.fill(); X.beginPath(); X.moveTo(0, -86); X.lineTo(0, 0); X.stroke();   // puerta
  [-78, -52, 52, 78].forEach(cx => R(cx - 7, -146, 14, 146, '#fafafa'));                              // columnas
  R(-96, -6, 192, 8, '#bdbdbd'); R(-110, 2, 220, 8, '#9e9e9e');                                       // escalones
  X.restore()
}
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
// ---------- TONO: arcoíris e indirectas · JUANITO: camiones ----------
const IND = ['Qué casualidad...', 'Hay gente que...', 'No digo nombres', 'Yo solo digo...', 'Ni te menciono', 'Pa\' quien corresponda', 'Interesante... muy interesante', 'Qué raro, ¿no?'];
const RB = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#5e35b1', '#d81b60'];
function rainbowBurst(f) { const x = f.x + f.face * 75, y = f.y - 85; RB.forEach((c, i) => ring(x, y, 60 + i * 16, c, 8, 18 + i * 2)); spark(x, y, 36, RB, 14, 26); star(x, y, 110, '#fff') }
function honk(n) {   // bocina de camión (dos notas), n veces
  if (!snd) return; const a = ac(); if (!a) return;
  for (let k = 0; k < (n || 1); k++) {
    const t = a.currentTime + k * .42, g = a.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .03); g.gain.setValueAtTime(.22, t + .26); g.gain.exponentialRampToValueAtTime(.0001, t + .34);
    [196, 247, 392].forEach(fr => { const o = a.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(g); o.start(t); o.stop(t + .36) }); g.connect(MG)
  }
}
// Camión de carga mirando a la derecha cuando dir = 1 (x = centro, gy = suelo)
function truckArt(x, gy, dir, sc, wr, al) {
  X.save(); X.globalAlpha = al == null ? 1 : al; X.translate(x, gy); X.scale(dir * sc, sc); X.lineJoin = 'round'; X.lineWidth = 3; X.strokeStyle = '#1b1b1b';
  const R = (a, b, w, h, c) => { X.fillStyle = c; X.fillRect(a, b, w, h); X.strokeRect(a, b, w, h) };
  X.save(); X.globalAlpha *= .35; X.fillStyle = '#000'; X.beginPath(); X.ellipse(0, 2, 175, 10, 0, 0, 7); X.fill(); X.restore();
  R(-158, -142, 236, 116, '#eceff1'); R(-158, -142, 236, 20, '#e64a19'); R(-158, -50, 236, 16, '#e64a19'); R(-166, -28, 270, 12, '#37474f');   // caja y chasis
  X.fillStyle = '#ff8f00'; X.beginPath(); X.moveTo(84, -28); X.lineTo(84, -126); X.lineTo(126, -126); X.lineTo(158, -78); X.lineTo(160, -28); X.closePath(); X.fill(); X.stroke();   // cabina
  X.fillStyle = '#81d4fa'; X.beginPath(); X.moveTo(94, -116); X.lineTo(120, -116); X.lineTo(143, -82); X.lineTo(94, -82); X.closePath(); X.fill(); X.stroke();
  X.fillStyle = 'rgba(255,255,255,.55)'; X.beginPath(); X.moveTo(100, -112); X.lineTo(110, -112); X.lineTo(100, -90); X.closePath(); X.fill();
  R(150, -40, 14, 12, '#455a64'); X.fillStyle = '#fff176'; X.beginPath(); X.arc(156, -52, 7, 0, 7); X.fill(); X.stroke();
  X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(156, -52, 2, 156, -52, 50); g.addColorStop(0, 'rgba(255,241,118,.9)'); g.addColorStop(1, 'rgba(255,241,118,0)'); X.fillStyle = g; X.beginPath(); X.arc(156, -52, 50, 0, 7); X.fill(); X.restore();
  X.save(); X.translate(-40, -84); X.scale(dir, 1); X.textAlign = 'center'; X.fillStyle = '#bf360c'; X.font = 'bold 40px Impact,sans-serif'; X.fillText('PARO', 0, -4); X.font = 'bold 17px Impact,sans-serif'; X.fillText('DE CAMIONEROS', 0, 18); X.restore();
  [-120, -70, 30, 118].forEach(wx => {   // ruedas
    X.save(); X.translate(wx, -20); X.rotate(wr); X.fillStyle = '#212121'; X.beginPath(); X.arc(0, 0, 20, 0, 7); X.fill(); X.stroke(); X.fillStyle = '#bdbdbd'; X.beginPath(); X.arc(0, 0, 9, 0, 7); X.fill();
    X.strokeStyle = '#616161'; X.lineWidth = 2; for (let i = 0; i < 3; i++) { X.rotate(Math.PI / 3); X.beginPath(); X.moveTo(-9, 0); X.lineTo(9, 0); X.stroke() } X.restore()
  });
  X.restore()
}
function truckStart(f, e, o) {
  if (o.mode == 'wall') trucks.push({ mode: 'wall', f, e, o, t: 0, warn: 50, hit: false, hold: 0, dist: 0, p: [] });
  else { const dir = e.x >= f.x ? -1 : 1; trucks.push({ mode: 'run', f, e, o, t: 0, warn: 36, dir, x: dir < 0 ? W + 200 : -200, hit: false, dist: 0 }) }
  honk(1)
}
function truckImpact(e) {
  spark(e.x, e.y - 70, 40, ['#fff', '#ffd54f', '#ff7043'], 15, 28); ring(e.x, e.y - 70, 200, '#ffb300', 10, 22); star(e.x, e.y - 70, 120, '#fff59d'); dust(e.x, GY + 2, 14, 2);
  flashC = '#fff'; flashT = 8; shake = Math.max(shake, 22); sfxN(.5, .4); sfx('fall')
}
function trucksTick() {
  trucks = trucks.filter(z => {
    const { f, e, o } = z; z.t++;
    if (z.t < z.warn) return true;
    if (z.mode == 'run') {
      if (z.t == z.warn) { honk(2); shake = Math.max(shake, 5) }
      z.x += z.dir * 27; z.dist += 27; if (z.t % 3 == 0) dust(z.x - z.dir * 150, GY + 36, 2, 1.4);
      if (!z.hit && (z.x + z.dir * 140 - e.x) * z.dir >= 0) {
        z.hit = true;
        if (e.y < GY - 95 && !o.sure) say(e, '¡Esquivé!', 50);   // saltando se esquiva
        else { const bk = e.blk && !o.sure; hit(f, e, o.d, o.st, o); if (!bk) { e.kd = 70; e.vy = -13; e.vx = z.dir * 15 } truckImpact(e) }
      }
      return z.x > -300 && z.x < W + 300
    }
    // Bloqueo total: dos camiones llegan por los lados y se detienen a cada lado del rival
    if (z.t == z.warn) { z.ex = e.x; honk(2); z.p = [{ s: -1, x: -210, go: 1 }, { s: 1, x: W + 210, go: 1 }] }
    z.dist += 30;
    z.p.forEach(q => {
      const tx = z.ex + q.s * 195;
      if (q.go == 1) {
        q.x += -q.s * 30;
        if ((q.x - tx) * -q.s >= 0) {
          q.x = tx; q.go = 2; dust(q.x - q.s * 140, GY + 12, 12, 2); sfxN(.35, .35); shake = Math.max(shake, 12);
          if (!z.hit) { z.hit = true; e.x = z.ex; hit(f, e, o.d, o.st, o); e.s.stun = Math.max(e.s.stun, 40); truckImpact(e) }
        }
      } else if (q.go == 3) q.x += q.s * 18
    });
    if (z.p.every(q => q.go >= 2)) { z.hold++; if (z.hold > 100) z.p.forEach(q => q.go = 3) }
    return z.p.some(q => q.x > -300 && q.x < W + 300)
  })
}
function trucksDraw() {
  trucks.forEach(z => {
    if (z.t < z.warn) {   // aviso: carril iluminado + señal de peligro en el borde por donde entra
      const pr = z.t / z.warn, bl = Math.sin(z.t * .6) > 0, edges = z.mode == 'wall' ? [-1, 1] : [z.dir < 0 ? 1 : -1];
      X.save(); X.globalAlpha = (.1 + .2 * pr) * (bl ? 1 : .6); X.fillStyle = '#ff6d00'; X.fillRect(0, GY + (z.mode == 'wall' ? -4 : 8), W, 56); X.restore();
      if (z.mode == 'wall') { X.save(); X.translate(z.e.x, GY + 4); X.scale(1, .22); X.globalAlpha = .3 + .5 * pr; X.lineWidth = 8; X.strokeStyle = '#ff6d00'; X.beginPath(); X.arc(0, 0, 130 * (1.2 - .5 * pr), 0, 7); X.stroke(); X.restore() }
      edges.forEach(sd => {
        const sx = sd < 0 ? 48 : W - 48, sy = GY - 80, di = -sd;
        if (bl || pr > .8) {
          X.save(); X.translate(sx, sy); X.fillStyle = '#ffca28'; X.strokeStyle = '#212121'; X.lineWidth = 5; X.lineJoin = 'round'; X.beginPath(); X.moveTo(0, -34); X.lineTo(34, 24); X.lineTo(-34, 24); X.closePath(); X.fill(); X.stroke();
          X.fillStyle = '#212121'; X.font = 'bold 40px Impact,sans-serif'; X.textAlign = 'center'; X.fillText('!', 0, 18); X.restore()
        }
        X.save(); X.strokeStyle = '#ffca28'; X.lineWidth = 6; X.lineCap = 'round'; X.lineJoin = 'round';
        for (let k = 0; k < 3; k++) { const cx = sx + di * (56 + k * 20); X.globalAlpha = (.95 - k * .25) * (bl ? 1 : .6); X.beginPath(); X.moveTo(cx - di * 8, sy - 14); X.lineTo(cx + di * 4, sy); X.lineTo(cx - di * 8, sy + 14); X.stroke() }
        X.restore()
      });
      return
    }
    if (z.mode == 'run') truckArt(z.x, GY + 34, z.dir, 1.1, z.dist * .05);
    else z.p.forEach(q => truckArt(q.x, GY + 14, -q.s, .95, z.dist * .05 * (q.go == 3 ? -1 : 1)))
  })
}
function world() {
  trucksTick(); vehsTick(); barrierTick();
  fx = fx.filter(z => {
    if (--z.t > 0) return true; const { f, e, o } = z;
    if (o.r >= 700 && e.y < GY - 80) say(e, '¡Esquivé!', 50); else if (Math.abs(e.x - f.x) < o.r) hit(f, e, o.pct ? e.hp * o.pct : o.d, o.st, o);
    const bc = o.col && o.col != '#000' ? o.col : '#b388ff'; ring(f.x, GY, Math.min(o.r, 520), bc, 10, 22, 1); ring(f.x, GY, Math.min(o.r, 520) * .55, '#fff', 7, 16, 1); spark(f.x, GY - 20, 18, [bc, '#fff'], 10, 22); crackFx(f.x, o.r, bc); pt.push({ k: 'beam', x: f.x, y: GY + 2, l: 20, m: 20, c: bc, w: 70 });
    if (o.gl) for (let i = 0; i < 12; i++) pt.push({ k: 'gly', x: f.x + rnd(-1, 1) * Math.min(o.r, 280), y: GY - rnd(10, 170), vx: rnd(-1, 1), vy: -rnd(.8, 3), l: 38, m: 38, t: o.gl });
    if (o.rainbow) rainbowBurst(f); flashC = o.col || '#fff'; flashT = 10; shake = Math.max(shake, 8); return false
  });
  trees = trees.filter(z => {
    const { f, e, o } = z;
    if (z.t > 0) {
      if (--z.t == 0) {   // impacto: cae donde esté el rival ahora mismo (no importa si saltó, se alejó o se cubrió)
        z.lx = e.x; z.ly = e.y - 70; hit(f, e, o.d, o.st, o); z.land = 42;
        if (o.mansion) { spark(e.x, e.y - 40, 46, ['#d7ccc8', '#8d6e63', '#ffd54f', '#fff'], 15, 30); dust(e.x - 70, GY + 2, 12, 2); dust(e.x + 70, GY + 2, 12, 2); ring(e.x, GY, 260, '#d7ccc8', 12, 26, 1); flashC = '#fff'; flashT = 10; shake = Math.max(shake, 22); sfxN(.7, .4); sfx('fall') }
        else { spark(e.x, e.y - 60, 30, ['#43a047', '#a5d6a7', '#6d4c41', '#fff'], 13, 26); dust(e.x, GY + 2, 14, 1.6); ring(e.x, GY, 170, '#8d6e63', 9, 22, 1);
        flashC = '#c8e6c9'; flashT = 8; shake = Math.max(shake, 14) }
      }
      return true
    }
    return --z.land > 0
  });
  // choque de proyectiles: parecidos se anulan; si uno es mucho más fuerte, atraviesa al débil pero queda más lento y más flojo
  for (let i = 0; i < proj.length; i++) for (let j = i + 1; j < proj.length; j++) {
    const a = proj[i], b = proj[j]; if (a.dead || b.dead || a.f === b.f) continue;
    if (Math.abs(a.x - b.x) >= (a.w + b.w) / 2 + 22 || Math.abs(a.y - b.y) >= 70) continue;
    const pa = a.o.d * (a.dm || 1), pb = b.o.d * (b.dm || 1), hi = pa >= pb ? a : b, lo = hi === a ? b : a, ph = Math.max(pa, pb), pl = Math.min(pa, pb), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const ca = a.o.col || a.f.ch.c, cb = b.o.col || b.f.ch.c;
    if (ph / Math.max(1, pl) < 1.3) {   // fuerzas parecidas: se anulan
      a.dead = b.dead = true; spark(mx, my, 22, [ca, cb, '#fff'], 11, 20); ring(mx, my, 120, '#fff', 7, 16); ring(mx, my, 70, ca, 5, 12); star(mx, my, 90, '#fff59d'); dmgText(mx, my - 40, '¡CHOQUE!', '#ffd54f');
      sfx('block'); sfxN(.12, .2); hstop = Math.max(hstop, 5); shake = Math.max(shake, 9); camP = Math.max(camP, .05); camF = { x: mx, w: .5 };
    } else {   // gana el más fuerte, pero pierde fuerza y velocidad
      lo.dead = true; hi.dm = (hi.dm || 1) * Math.max(.45, (ph - pl * .7) / ph); hi.vx *= .8; hi.life = Math.max(hi.life, 40);
      spark(lo.x, lo.y, 14, [lo.o.col || lo.f.ch.c, '#fff'], 9, 16); ring(lo.x, lo.y, 80, lo.o.col || lo.f.ch.c, 5, 12); dmgText(mx, my - 40, '¡Rebotado!', '#fff');
      sfx('block'); hstop = Math.max(hstop, 3); shake = Math.max(shake, 6)
    }
  }
  proj = proj.filter(p => {
    if (p.dead) return false;
    if (p.o.hom) { const dr = Math.sign(p.e.x - p.x) || 1; p.vx += (dr * Math.abs(p.o.v) - p.vx) * .07 }
    p.x += p.vx; p.life--; if (p.o.back && p.life == 24) { p.vx = -p.vx * 1.05; ring(p.x, p.y, 50, '#fff', 4, 10) } pt.push({ k: 'glow', x: p.x - p.vx * .5, y: p.y + rnd(-8, 8), vx: 0, vy: 0, l: 12, m: 12, r: 14, c: p.o.col || p.f.ch.c });
    if (Math.abs(p.x - p.e.x) < p.w / 2 + 25 && Math.abs(p.y - (p.e.y - 70)) < 80 && !(p.e.dg > 6)) { hit(p.f, p.e, p.o.d * (p.dm || 1), p.o.st, p.o); if (p.o.boom) { spark(p.x, p.y, 30, ['#f48fb1', '#fff', '#ffd54f'], 14, 24); ring(p.x, p.y, 130, '#f48fb1', 9, 18); star(p.x, p.y, 110, '#fff'); shake = Math.max(shake, 10) } return false }
    return p.life > 0 && p.x > -100 && p.x < W + 100
  });
  if (dog) { dust(dog.x, GY + 2, 1, .8); dog.x += dog.dir * 14; if (Math.abs(dog.x - dog.e.x) < 40) { dog.e.s.freeze = 90; dog = null } else if (dog.x < -50 || dog.x > W + 50) dog = null }
}
function endRound(w) {
  sfx('ko'); speak(w >= 0 ? '¡K.O.!' : '¡Empate!', null, { force: 1, ann: 1 }); rumble(0, 450, .8, .6); rumble(1, 450, .8, .6); trees = []; trucks = []; vehs = []; if (w >= 0) F[w].wins++;
  win = w >= 0 ? { w, t: 0 } : null; if (w >= 0) { say(F[w], pick(WINR), 120); say(F[1 - w], pick(LOSE), 120) }
  msg = w < 0 ? '¡EMPATE!' : F[w].ch.n + ' gana la ronda'; state = 'ko'; stT = 130; bt = 0;
  if (w >= 0 && (F[w].dt || 0) < .01 && F[1 - w].hp <= 0) { perf = true; setTimeout(() => speak('Perfecto', null, { force: 1, ann: 1 }), 600) }
  if (w >= 0) { const l = F[1 - w]; spark(l.x, l.y - 90, 40, ['#fff', '#ffd54f', '#ff7043'], 16, 30); ring(l.x, l.y - 90, 180, '#fff', 10, 24); star(l.x, l.y - 90, 130, '#fff59d'); flashC = '#fff'; flashT = 14; shake = 16 }
  if (w >= 0 && F[1 - w].hp <= 0) { koFr = 16; slowDiv = 3; slowT = 100; camP = Math.max(camP, .22); camF = { x: F[1 - w].x, w: 1 } }   // último golpe: pausa seca y luego cámara lenta
  if (F.some(f => f.wins >= 2)) { msg = F[w].ch.n.toUpperCase() + ' GANA LA RETA'; state = 'over'; stT = 220; slowT = Math.max(slowT, 70); win.q = pick(VICT[F[w].ch.id] || VICT0); setTimeout(() => speak(F[w].ch.n + ' gana la pelea', null, { force: 1, ann: 1 }), 900) }
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
// HD: al dibujar un luchador GRANDE (selección, VS, victoria, portada) se usa la versión de alta resolución (WebP) si existe
function hdImg(ch, i) {
  const c = ch.hdI || (ch.hdI = {}); let im = c[i];
  if (!im) { im = c[i] = new Image(); im.src = 'sprites/' + (ch.dir || ch.id) + '/hd/' + i + '.webp' }
  return im.complete && im.naturalWidth ? im : null
}
// Espejo: el P2 con el mismo luchador se dibuja con otra paleta (hue-rotate; en navegadores sin ctx.filter, un tinte azul)
let TINT = 0;
const FILT = (() => { try { X.save(); X.filter = 'hue-rotate(10deg)'; const ok = X.filter == 'hue-rotate(10deg)'; X.filter = 'none'; X.restore(); return ok } catch (e) { return false } })(), TC = new WeakMap();
function tintOf(img) {
  let c = TC.get(img); if (c) return c;
  c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d');
  g.drawImage(img, 0, 0); g.globalCompositeOperation = 'hue'; g.globalAlpha = .85; g.fillStyle = '#2979ff'; g.fillRect(0, 0, c.width, c.height);
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(img, 0, 0); TC.set(img, c); return c
}
function drawImgT(img, x, y, w, h) {
  if (TINT) { if (FILT) { X.filter = 'hue-rotate(-42deg) saturate(1.3) brightness(1.04)'; X.drawImage(img, x, y, w, h); return } img = tintOf(img) }
  X.drawImage(img, x, y, w, h)
}
const sameCh = () => F.length > 1 && F[0] && F[1] && F[0].ch.id == F[1].ch.id;
// Skin completa en alta calidad (img/skin/<id>.webp) para VS e historia; devuelve false si aún no carga
function skinBig(ch, x, gy, h, face) {
  const im = ch.skI; if (!(im && im.complete && im.naturalWidth)) return false;
  const w = h * im.naturalWidth / im.naturalHeight;
  X.save(); X.translate(x, gy); X.scale(face, 1); X.imageSmoothingQuality = 'medium'; drawImgT(im, -w / 2, -h, w, h); X.restore(); return true
}
function drawFrame(ch, i, x, gy, face, mul, sx, sy, rot, al) {
  if (!frOK(ch, i)) i = ch.A.st.idle[0];
  const A = ch.A, m = A.f[i], k = A.sc * (mul || 1) * (m[3] || 1), fl = A.fl && A.fl.includes(i) ? -1 : 1;   // m[3]: ajuste de escala opcional por frame
  let img = ch.fr[i], w = m[0] * k, h = m[1] * k, ax = m[2] * k, ay = m[4] != null ? m[4] * k : h;
  if ((mul || 1) >= 1.25 && A.hd && A.hd[i]) { const hi = hdImg(ch, i); if (hi) { const q = A.hd[i], kk = k / A.hr; img = hi; w = q[0] * kk; h = q[1] * kk; ax = q[2] * kk; ay = q[3] * kk } }
  X.save(); X.translate(x, gy); if (rot) X.rotate(rot * face); X.scale(face * fl * (sx || 1), sy || 1); if (al != null) X.globalAlpha *= al; X.imageSmoothingEnabled = true; X.imageSmoothingQuality = 'medium'; drawImgT(img, -ax, -ay, w, h); X.restore();
}
// Elige el frame según lo que esté haciendo el luchador
function kdFrame(f) {   // derribo: cae → rebota → tirado → se levanta
  const S = f.ch.A.st; if (f.kd > (f.kd0 || 0)) f.kd0 = f.kd; const t = (f.kd0 || 52) - f.kd;
  if (!S.fall) return S.hit[0];
  if (t < 9) return S.fall[0];
  if (f.kd <= 14 && S.getup) return S.getup[f.kd > 7 ? 0 : 1];
  if (t < 15) return S.bounce[0];
  return S.ko[0];
}
function poseFrame(f, noAtk) {
  const S = f.ch.A.st, s = f.s, a = f.atk, t = f.at, loop = (arr, sp) => arr[((t / sp) | 0) % arr.length];
  if (f.kd > 0) return kdFrame(f);
  f.kd0 = 0;
  if (f.dg > 0) return S.jump[0];
  if (win && F[win.w] === f && win.t > 14 && (state == 'ko' || state == 'over')) return state == 'over' && S.finish ? S.finish[0] : S.cast[0];   // pose de victoria
  if (f.hs > 0 && S.hithigh && !f.ch.A.pr) return (f.hk ? S.hitgut : S.hithigh)[0];
  if (s.stun > 0 && !(f.hs > 0) && S.dizzy) return loop(S.dizzy, 9);
  if (f.hs > 0 || s.stun > 0) return S.hit[0];
  if (s.freeze > 0) return S.idle[0];
  if (f.blk) return (S.cblock || S.block)[0];
  if (f.dash) return S.dash ? S.dash[0] : S.airkick ? S.airkick[0] : S.kick[Math.min(1, S.kick.length - 1)];
  if (a && !noAtk && a.type == 'kick' && f.y < GY - 6 && S.airkick) return S.airkick[0];   // patada voladora
  if (a && !noAtk) {
    const arr = a.sw ? S.sweep : a.up ? S.upper : a.type == 'kick' ? S.kick : S.punch, n = arr.length;
    if (a.t <= a.su) return arr[0];
    if (a.t <= a.su + a.ac + 4) return arr[Math.min(1, n - 1)];
    return arr[n > 2 ? n - 1 : 0];
  }
  if (f.cast > 0) return (S[f.cp] || S.cast)[0];   // cast2 = pose del especial (si el personaje la tiene)
  if (f.y < GY - 6) { const dv = f.mvx * f.face; if (S.jumpf && dv > .6) return S.jumpf[0]; if (S.jumpb && dv < -.6) return S.jumpb[0]; return S.jump[f.vy < 0 ? 0 : S.jump.length - 1] }
  if (f.dance > 0) return loop(S.walk, 4);
  if (f.mv) { const wk = S.walk, bk = (f.mvx || 0) * f.face < -.6 && wk.length > 1, ix = ((t / 5) | 0) % wk.length; return wk[bk ? wk.length - 1 - ix : ix] }
  return loop(S.idle, 14);
}
function hasSprite(ch) { return !!(ch.full && ch.full.complete && ch.full.naturalWidth) }
function sprite(ch, x, gy, h, face) {
  const im = ch.full, w = h * im.naturalWidth / im.naturalHeight;
  X.save(); X.translate(x, gy); X.scale(face, 1); X.drawImage(im, -w / 2, -h, w, h); X.restore()
}
// ---------- SKINS (pixel-art procedural, por personaje) ----------
const SK = {
  mono: { sk: '#d9a47c', top: '#f6dd3b', pants: '#cdbd91', sl: 'S', deco: 'pocket', sh: '#f2f2f2' },
  manu: { sk: '#d9a47c', top: '#5f7a3a', pants: '#56703a', sl: 'L', deco: 'camo', pc: 1, sh: '#eee' },
  mario: { sk: '#e0b08c', top: '#18181c', pants: '#18181c', sl: 'L', deco: 'zip', ps: 1, sh: '#fff' },
  gonza: { sk: '#d4a07a', top: '#6d7a3c', pants: '#5a6b34', sl: 'S', deco: 'vest', pc: 1, knee: 1, sh: '#eee' },
  tata: { sk: '#e0b08c', top: '#4dd0c9', pants: '#e91e8c', sl: 'S', deco: 'stripes', sh: '#37474f' },
  wenley: { sk: '#6b4430', top: '#c62828', pants: '#c62828', sl: 'S', deco: 'stripes', sh: '#c62828' },
  manin: { sk: '#e3b08a', top: '#1c1c22', pants: '#2f5a96', sl: 'S', deco: 'logo', sh: '#222' },
  ale: { sk: '#e8bc98', top: '#1e1e26', pants: '#1a1a22', sl: 'L', deco: 'hood', sh: '#fff' },
  mati: { sk: '#e0b08c', top: '#8d939c', pants: '#767c85', sl: 'L', deco: 'hood', sh: '#fff' },
  alonso: { sk: '#e0ae88', top: '#6a7a42', pants: '#5b6b3a', sl: 'S', deco: 'apron', sh: '#fff' },
  jp: { sk: '#e0ae88', top: '#17171b', pants: '#2b4a7c', sl: 'S', deco: 'logo', sh: '#e8e8e8' },
  benja: { sk: '#d9a47c', top: '#1d1d28', pants: '#232a45', sl: 'L', deco: 'redvest', sh: '#fff' },
  tono: { sk: '#d9a47c', top: '#3b2f2f', pants: '#1d2230', sl: 'L', deco: 'zip', sh: '#222' },
  juanito: { sk: '#c98b62', top: '#555a66', pants: '#2b3340', sl: 'S', deco: 'pocket', sh: '#5d4037' },
  gaston: { sk: '#d9a47c', top: '#4a4a40', pants: '#6d5a3c', sl: 'S', deco: 'vest', sh: '#3e2723' },
  pitu: { sk: '#d9a47c', top: '#8a8d92', pants: '#34506e', sl: 'L', deco: 'hood', sh: '#fff' },
  tiorene: { sk: '#d9a47c', top: '#26364f', pants: '#6b6a4a', sl: 'L', deco: 'vest', sh: '#4e342e' }
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
  p = p || {}; const o = SK[ch.id] || SK.mono, cy = p.cy || 0, ln = p.lean || 0, ext = p.ext || 0, air = p.air, hip = -50 + cy;
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
  return { ph: f.ph || 0, wlk: m && f.y >= GY - 1, ext, kick: !!(a && a.type == 'kick'), air: f.y < GY - 6, cy: f.blk ? 16 : 0, blk: f.blk, lean: f.hs > 0 ? -9 : f.dash ? 8 : 0, dance: f.dance > 0 ? f.dance : 0 }
}
function glowBlob(x, y, r, c, a) {
  X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = Math.max(0, Math.min(1, a)); const g = X.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, c); g.addColorStop(.6, c); g.addColorStop(1, 'rgba(0,0,0,0)'); const g2 = X.createRadialGradient(x, y, 1, x, y, r); g2.addColorStop(0, c); g2.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = g2; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill(); X.restore()
}
function drawF(f) {
  TINT = f.i == 1 && sameCh() ? 1 : 0;
  try {
    const a = f.atk, tr = f.tr || (f.tr = []), mov = (a && a.t > a.su && a.t <= a.su + a.ac + 8) || f.dash || f.cast > 0 || Math.abs(f.vx) > 7 || f.boost > 0;
    if (mov && hasAnim(f.ch) && !(f.kd > 0) && f.hp > 0 && (!tr.length || tr[tr.length - 1].at != f.at)) { const pf = poseFrame(f); tr.push({ x: f.x, y: f.y, i: pf, face: f.face, l: 10, at: f.at }) }
    tr.forEach(g => g.l--); while (tr.length && tr[0].l <= 0) tr.shift();
    tr.forEach(g => { X.save(); X.globalCompositeOperation = 'lighter'; drawFrame(f.ch, g.i, g.x, g.y, g.face, 1, 1, 1, 0, .30 * g.l / 10); X.restore() });
    drawF0(f)
  } finally { TINT = 0 }
}
function drawF0(f) {
  const x = f.x, y = f.y, h = f.blk ? 105 : 140, s = f.s, an = hasAnim(f.ch), sp = hasSprite(f.ch);
  // sombra: se achica y se aclara al saltar
  const air = Math.max(0, GY - y), k = Math.max(.35, 1 - air / 320);
  X.fillStyle = 'rgba(0,0,0,' + (.30 * k) + ')'; X.beginPath(); X.ellipse(x, GY + 1, 50 * k, 13 * k, 0, 0, 7); X.fill();
  X.fillStyle = 'rgba(0,0,0,' + (.42 * k) + ')'; X.beginPath(); X.ellipse(x, GY - 1, 30 * k, 7 * k, 0, 0, 7); X.fill();   // sombra de contacto: los pies quedan metidos en ella
  // aura al lanzar habilidades / dash / boost
  const au = f.cast > 0 || f.dash ? f.ch.c : f.boost > 0 || (win && F[win.w] === f && state != 'go') ? '#ffd600' : null;
  if (au) {
    X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = f.dash ? .5 : Math.min(.6, .2 + Math.max(0, f.cast) / 30);
    const gr = X.createRadialGradient(x, y - 80, 10, x, y - 80, 140); gr.addColorStop(0, au); gr.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(x - 150, y - 230, 300, 300); X.restore()
  }
  // caída al perder el round
  const dead = (state == 'ko' || state == 'over') && f.hp <= 0, koF = dead && an && f.ch.A.st.ko, ang = dead ? (koF ? 0 : Math.min(1, f.kt / 22)) : (f.kd > 0 && !(an && f.ch.A.st.fall) ? (() => { const t = 52 - f.kd; return t < 10 ? t / 10 : t > 40 ? Math.max(0, (52 - t) / 12) : 1 })() : 0);
  X.save(); if (f.hs > 9 && hstop > 0) X.translate(Combat.Juice.victimJitter(hstop, bt), 0);   // la víctima vibra durante el hitstop
  if (win && F[win.w] === f && win.t > 14 && state != 'go') X.translate(0, -Math.abs(Math.sin(win.t / 9)) * 16);
  if (ang > 0) { X.translate(0, -28 * ang); X.translate(x, y); X.rotate(-f.face * ang * 1.45); X.translate(-x, -y) }
  if (f.hs > 6) X.filter = 'brightness(2.5)'; else if (s.freeze > 0) X.filter = 'saturate(.5) sepia(.6) hue-rotate(165deg) brightness(1.25)'; if (f.dg > 0) X.globalAlpha = .42;
  const wnd = f.bru.length > 0 && !(state == 'cine') && perfLv < 2;
  if (wnd) { WX.setTransform(1, 0, 0, 1, 0, 0); WX.clearRect(0, 0, WC.width, WC.height); WX.setTransform(S, 0, 0, S, (WOX - x) * S, (WOY - y) * S); WX.imageSmoothingQuality = 'medium'; var XM = X; X = WX }
  if (an) {
    let rg, sx = 1 + .12 * f.sq, sy = 1 - .12 * f.sq;
    if (air > 8 && !dead) { const st = Math.min(.1, Math.abs(f.vy) * .008); sy += st; sx -= st * .6 }
    if (!f.mv && !f.atk && air < 2 && !dead) sy *= 1 + Math.sin(f.at / 10) * .01;
    const one = f.ch.A.st.walk.length < 2;   // personajes con UN solo frame de caminar: la zancada se hace por código
    if (f.mv && air < 2 && !dead && one && !f.atk && !f.blk && !(f.kd > 0) && !(f.hs > 0)) { const sw = Math.abs(Math.sin(f.at * .34)); sy *= .955 + sw * .075; sx *= 1.03 - sw * .045 }   // caminar con un solo frame: aplasta al apoyar, estira en el aire
    if (f.ch.A.pr && f.hs > 0 && !dead) { X.translate(x, y); X.rotate(-f.face * Math.min(1, f.hs / 12) * .16); X.translate(-x, -y) }   // sin frame de golpe recibido: retroceso
    if (koF) drawFrame(f.ch, f.kt < 8 ? (f.ch.A.st.fall || f.ch.A.st.hit)[0] : f.ch.A.st.ko[0], x, y, f.ch.A.st.fall ? f.face : (f.kt < 8 ? f.face : -f.face), 1, 1, 1)
    else if (!dead && f.xf && state != 'ko' && state != 'over' && Combat.Assist.draw(X, f)) { }   // Mario ⇄ Criss: lo dibuja assist.js
    else if (!dead && (rg = atkRig(f))) rg.layers.forEach(L => drawFrame(f.ch, L.frame, x + f.face * rg.dx, y, f.face, 1, sx * rg.sx, sy * rg.sy, rg.rot, L.alpha))
    else {
      // Movimiento procedural: zancada al caminar, inclinación al correr / saltar, picada en la patada voladora
      let rt = 0, hop = 0; const vm = (f.mvx || 0) * f.face, spN = Math.min(1.6, Math.abs(f.mvx || 0) / Math.max(1, f.ch.s));
      if (!dead && !(f.kd > 0) && !(f.hs > 0)) {
        if (air < 2 && f.mv && !f.atk && !f.blk) { const ph = f.at * .34; hop = -Math.abs(Math.sin(ph)) * (one ? 12 : 6) * spN; rt = (vm > 0 ? .05 : -.035) * spN + Math.sin(ph) * (one ? .055 : .022); sy *= 1 + Math.abs(Math.sin(ph)) * .012 * spN }
        if (f.rn > 0) rt += .13;
        if (air >= 2) { rt = Math.max(-.12, Math.min(.12, vm * .017)); if (f.atk && f.atk.type == 'kick' && f.ch.A.st.airkick) rt = .24 }
      }
      drawFrame(f.ch, dead ? f.ch.A.st.hit[0] : poseFrame(f), x, y + hop, f.face, 1, sx, sy, rt)
    }
  }
  else if (sp) sprite(f.ch, x, y, h + 14, f.face); else skin(f.ch, x, y, 1.1, f.face, skinPose(f));
  if (wnd) X = XM;
  // contusiones, cortes y escupitajos: se pintan DENTRO de la silueta del sprite (source-atop), no encima del fondo
  if (wnd) {
    const W2 = X; X = X0; const fl2 = X.filter; X.filter = 'none';
    WX.save(); WX.globalCompositeOperation = 'source-atop';
    f.bru.forEach(b => {
      const bx = x + b.x * f.face, by = y - b.y, wr = WX; wr.save();
      if (b.k == 'bruise') { const g = wr.createRadialGradient(bx, by, 1, bx, by, b.r * 1.5); g.addColorStop(0, 'rgba(70,25,100,.62)'); g.addColorStop(.55, 'rgba(120,55,140,.42)'); g.addColorStop(1, 'rgba(190,170,60,0)'); wr.fillStyle = g; wr.beginPath(); wr.arc(bx, by, b.r * 1.5, 0, 7); wr.fill() }
      else if (b.k == 'cut') {
        const sd = Math.sin(b.x * 12.9 + b.y * 78.2) * 43758.5, jt = i => ((Math.sin(sd + i * 7.7) * .5 + .5) - .5) * 3.2, P = [];
        for (let k = 0; k < 5; k++) P.push([bx - b.r + k * b.r / 2, by - 3 + k * .9 + (k % 2 ? .8 : -.8) + jt(k) * .5]);
        const pl = dy => { wr.beginPath(); P.forEach((q, i) => i ? wr.lineTo(q[0], q[1] + dy) : wr.moveTo(q[0], q[1] + dy)); wr.stroke() };
        wr.lineCap = 'round'; wr.lineJoin = 'round'; wr.strokeStyle = 'rgba(255,170,160,.38)'; wr.lineWidth = 3.2; pl(0);   // piel inflamada alrededor
        wr.strokeStyle = '#5e0707'; wr.lineWidth = 1.5; pl(0); wr.strokeStyle = 'rgba(235,40,40,.7)'; wr.lineWidth = .8; pl(.3);
        const dx = bx + b.r * .35, dl = 3 + b.r * 1.1; wr.strokeStyle = 'rgba(150,12,12,.85)'; wr.lineWidth = 1.5; wr.beginPath(); wr.moveTo(dx, by + 1); wr.lineTo(dx + .4, by + dl); wr.stroke(); wr.fillStyle = 'rgba(150,12,12,.9)'; wr.beginPath(); wr.arc(dx + .4, by + dl + 1, 1.8, 0, 7); wr.fill()
      }
      else { wr.fillStyle = 'rgba(235,250,225,.8)'; wr.beginPath(); wr.ellipse(bx, by, b.r, b.r * .75, 0, 0, 7); wr.fill(); wr.strokeStyle = 'rgba(150,200,140,.8)'; wr.lineWidth = 1.5; wr.stroke() }
      wr.restore()
    });
    WX.restore(); X.filter = fl2;
    X.drawImage(WC, 0, 0, WC.width, WC.height, x - WOX, y - WOY, WW, WH); X = W2
  }
  X.restore();
  X.lineWidth = 4;
  if (s.freeze > 0) { glowBlob(x, y - h / 2, 85, '#8fd3ff', .3); if (Math.random() < .2) star(x + rnd(-26, 26), y - rnd(20, h), 16, '#e1f5fe') }
  if (s.stun > 0) { X.fillStyle = '#ff0'; X.font = '24px sans-serif'; X.textAlign = 'center'; X.fillText('★ ★', x, y - h - 30) }
  if (s.burn > 0) { X.fillText('🔥', x, y - h - 30); if (Math.random() < .3) pt.push({ k: 'ember', x: x + rnd(-20, 20), y: y - rnd(20, 120), vx: 0, vy: -rnd(.8, 1.8), l: 30, m: 30, r: rnd(2, 4), ph: 0, c: '#ff7043' }) }
  if (s.root > 0) { X.save(); X.strokeStyle = '#4e342e'; X.lineWidth = 3; X.lineCap = 'round'; for (let i = -2; i <= 2; i++) { X.beginPath(); X.moveTo(x + i * 11, y + 2); X.quadraticCurveTo(x + i * 15 + Math.sin(f.at / 6 + i) * 4, y - 14 - Math.abs(i) * 2, x + i * 9, y - 28 + Math.abs(i) * 5); X.stroke() } X.restore() }
  if (s.slow > 0 || s.invert > 0) { X.font = '22px sans-serif'; X.fillText(s.invert > 0 ? '💋' : '🐌', x, y - h - 30) }
  if (f.blk) glowBlob(x + f.face * 24, y - h / 2, 62, '#4fc3f7', .2 + .05 * Math.sin(f.at / 5))
  if ((f.gg || 0) > 6 && f.hp > 0) { const gk = Math.min(1, f.gg / 100), bw = 64; X.save(); X.fillStyle = 'rgba(0,0,0,.6)'; X.beginPath(); X.roundRect(x - bw / 2 - 2, y - h - 20, bw + 4, 9, 4); X.fill(); X.fillStyle = gk > .75 ? '#ff5252' : gk > .45 ? '#ffb300' : '#4fc3f7'; X.beginPath(); X.roundRect(x - bw / 2, y - h - 18, bw * gk, 5, 2.5); X.fill(); X.restore() }
  if (f.parry > 0) glowBlob(x, y - h / 2, 90, '#ffffff', .45 * Math.min(1, f.parry / 12))
  if (f.dance > 0) { X.font = '28px sans-serif'; X.fillText('♪', x + Math.sin(f.dance / 4) * 30, y - h - 30) }
  if (f.say && f.say.l > 0) {   // globo de texto
    const t = f.say.t, by = y - h - 62 - (s.stun > 0 || s.burn > 0 || s.slow > 0 || s.invert > 0 ? 26 : 0); X.save(); X.font = 'bold 17px sans-serif'; X.textAlign = 'center';
    const tw = X.measureText(t).width + 22, cz = CAMZ || 1, hwv = W / 2 / cz, bxw = Math.max(CAMX - hwv + tw / 2 / cz + 4, Math.min(CAMX + hwv - tw / 2 / cz - 4, x)), tyw = Math.max(by + 18, 400 + (194 - 400) / cz - FOOT);
    X.globalAlpha = Math.min(1, f.say.l / 10) * .95; X.translate(x, tyw); X.scale(1 / cz, 1 / cz); const bx = (bxw - x) * cz;
    X.fillStyle = '#fff'; X.strokeStyle = '#111'; X.lineWidth = 3; X.beginPath(); X.roundRect(bx - tw / 2, -42, tw, 32, 10); X.fill(); X.stroke();
    X.beginPath(); X.moveTo(-7, -11); X.lineTo(0, 0); X.lineTo(7, -11); X.fill(); X.fillStyle = '#111'; X.fillText(t, bx, -20); X.restore()
  }
}
function para(x, y, w, h, sk) { X.beginPath(); X.moveTo(x + sk, y); X.lineTo(x + w + sk, y); X.lineTo(x + w, y + h); X.lineTo(x, y + h); X.closePath() }
// ======================================================================
//  v3: ESQUIVE · AGARRE · ULTRA · MODOS (ARCADE / ENTRENAMIENTO) · ESCENARIOS · HD+BLOOM · HUD · VS · VIBRACIÓN
// ======================================================================
const sr = (i, s) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v) };
let mode = 'vs', arc = [], arcI = 0, arcCont = 3, dummy = 0, vsT = 0, stoT = 0, stoP = 0, cin = null, uaf = null, stg = 0, stgOpt = 0;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v != '0' } catch (e) { return d } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v ? '1' : '0') } catch (e) { } };
let vib = lsGet('sfVib', true), bloomOn = lsGet('sfBloom', true);
const DUM = ['Quieto', 'Bloquea', 'Salta', 'CPU', 'Jugador 2'];
const tr = { last: 0, cd: 0, t: 999 };
const STGN = ['Azotea Fénix', 'Cumbre Nevada', 'Puerto en Fiestas', 'Volcán Fénix'];

// ---------- VIBRACIÓN DEL MANDO ----------
function rumble(i, ms, st, wk) {
  if (!vib) return;
  try {
    const g = padFor(i), a = g && (g.vibrationActuator || (g.hapticActuators && g.hapticActuators[0])); if (!a) return;
    if (a.playEffect) a.playEffect('dual-rumble', { startDelay: 0, duration: ms, weakMagnitude: Math.min(1, wk), strongMagnitude: Math.min(1, st) });
    else if (a.pulse) a.pulse(Math.max(st, wk), ms);
  } catch (e) { }
}
// ---------- ENTRADA: mezclar dispositivos (1 jugador) y CPU ----------
function mergeI(a, b) { const o = { hit: {} }; for (const k in a) { if (k == 'hit') continue; o[k] = a[k] || b[k]; o.hit[k] = a.hit[k] || b.hit[k] } return o }
const AI = { prev: {}, mv: 0, mvT: 0, atkT: 30, blkT: 0, dgT: 0 };
function aiInput() {
  const ks = ['l', 'r', 'u', 'b', 'p', 'hp', 'k', 'hk', 'bl', 'mod', 's', 'x', 'z', 'a', 'd', 'g', 'q'], o = { hit: {}, ai: 1 }; ks.forEach(a => o[a] = false);
  const fin = () => { ks.forEach(a => { o.hit[a] = o[a] && !AI.prev[a]; AI.prev[a] = o[a] }); return o };
  if (paused || sc != 'fight' || state != 'go') return fin();
  const me = F[1], en = F[0], dx = en.x - me.x, ad = Math.abs(dx), dir = dx >= 0 ? 1 : -1, lv = mode == 'arcade' ? arcI : 2;
  const move = s => { if (s * dir > 0) o.r = dir > 0, o.l = dir < 0; else if (s * dir < 0) o.l = dir > 0, o.r = dir < 0 };
  if (mode == 'train' && dummy != 3) { if (dummy == 1) o.b = true; else if (dummy == 2 && me.at % 70 == 0) o.u = true; return fin() }
  AI.atkT--; AI.blkT--; AI.dgT--; AI.mvT--;
  const threat = (en.atk && !en.atk.grab && ad < 150 && en.atk.t <= en.atk.su + en.atk.ac) || (en.cast > 0 && ad < 420) || (en.xf && ad < 280) ||
    proj.some(p => p.f === en && Math.abs(p.x - me.x) < 240 && (p.vx > 0) == (me.x > p.x)) || fx.some(z => z.f === en && z.t < 16 && Math.abs(z.f.x - me.x) < z.o.r);
  if (threat && AI.blkT <= 0 && AI.dgT <= 0 && Math.random() < .07 + lv * .05) {
    const r = Math.random();
    if (r < .45 && me.cd.d <= 0) { o.d = true; move(Math.random() < .5 ? -1 : 1); AI.dgT = 40 }
    else if (r < .88) AI.blkT = 16 + ((Math.random() * 14) | 0); else o.u = true
  }
  if (AI.blkT > 0) { o.b = true; return fin() }
  if (me.ult >= 100 && Math.random() < .03 + lv * .01) { o.q = true; return fin() }
  if (AI.mvT <= 0) { AI.mvT = 14 + ((Math.random() * 24) | 0); const r = Math.random(); AI.mv = ad > 125 ? 1 : ad < 62 ? (r < .5 ? -1 : 0) : (r < .6 ? 1 : r < .8 ? 0 : -1); if (lv >= 3 && r < .12) AI.mv = -1 }
  if (AI.mv) move(AI.mv);
  if (ad < 128 && AI.atkT <= 0 && Math.random() < .14 + lv * .03) {
    const r = Math.random(); if (en.blk && ad < 80 && r < .35) o.g = true; else if (r < .3) o.p = true; else if (r < .45) o.hp = true; else if (r < .8) o.k = true; else o.hk = true;
    AI.atkT = Math.max(10, 40 - lv * 5 + ((Math.random() * 20) | 0))
    if (Math.random() < .25) o.cmbReq = true
  }
  else if (me.cd.k <= 0 && Math.random() < .012 + lv * .006) o.s = true;
  else if (me.cd.x <= 0 && ad < 450 && Math.random() < .008 + lv * .005) o.x = true;
  else if (me.cd.z <= 0 && me.ch.z && ad < 450 && Math.random() < .008 + lv * .005) o.z = true;
  else if (me.assist && ad < 500 && Math.random() < .004 + lv * .002) o.a = true;
  else if (me.y >= GY && Math.random() < .004 + lv * .001) o.u = true;
  return fin()
}

// ---------- ESQUIVE ----------
function doDodge(f, L, Rt) {
  f.dg = 20; f.cd.d = 55; f.dgd = Rt && !L ? 1 : L && !Rt ? -1 : -f.face; f.atk = null; dust(f.x, GY + 2, 7, 1.1); sfx('dodge'); rumble(f.i, 40, .05, .25)
}
function dodged(f, e) {
  if (e.ch.pa == 'dodgeSpeed') { e.boost = Math.max(e.boost, 150); toast('¡Orgullo!', e) }
  toast('¡ESQUIVE!', e); e.bh = 120; ring(e.x, e.y - 90, 80, '#81d4fa', 5, 14); spark(e.x, e.y - 90, 10, ['#fff', '#81d4fa'], 8, 14); sfx('dodge'); rumble(e.i, 60, .1, .5)
}
// ---------- AGARRE ----------
function grabHit(f, e) {
  if (e.kd > 0 || e.dg > 6 || e.y < GY - 30) { toast('¡Falló!', f); return }
  const g = f.ch.gr || {};   // agarre propio de cada luchador (kit.js)
  hit(f, e, g.d || 11, null, { sure: 1, grab: 1 });
  e.kd = 52; e.vy = g.up || -12; e.vx = f.face * (g.vx || 11); e.atk = null; e.s.stun = 0; f.cd.d = Math.min(f.cd.d, 0);
  if (g.st) e.s[g.st[0]] = g.st[1];
  toast(g.n ? '¡' + g.n + '!' : '¡AGARRE!', f); sfx('grab'); sfxN(.12, .15); shake = Math.max(shake, 12); rumble(e.i, 160, .8, .4); dust(e.x, GY + 2, 10, 1.4);
  if (g.gl) for (let i = 0; i < 6; i++) pt.push({ k: 'gly', x: e.x + rnd(-40, 40), y: e.y - rnd(40, 160), vx: rnd(-1, 1), vy: -rnd(.6, 2), l: 34, m: 34, t: g.gl })
}
// ---------- HITS: medidor ULTRA, vibración, entrenamiento ----------
function hitHook(f, e, d, bk, hb, o) {
  const dealt = hb - e.hp;
  if (!o.ultra) { f.ult = Math.min(100, f.ult + (bk ? .6 : d * .9 + 1)); e.ult = Math.min(100, e.ult + (bk ? .8 : d * .55 * (1 + (1 - e.hp / e.mhp) * 1.6))) }
  if (!bk && e.dg > 0) e.dg = 0;
  rumble(e.i, bk ? 50 : 70 + d * 7, bk ? .1 : .25 + d / 22, bk ? .25 : .55); if (!bk) rumble(f.i, 40, .05, .35);
  if (mode == 'train' && f.i == 0 && e.i == 1) { if (tr.t > 80) tr.cd = 0; tr.cd += dealt; tr.last = dealt; tr.t = 0 }
}

// ---------- ULTRAS (una por personaje, con su cinemática) ----------
const ULT = {
  mono: { n: 'Paro Indefinido', q: 'Vuelva mañana.', c1: '#eceff1', c2: '#546e7a', st: 'clock', d: 34, status: ['freeze', 70] },
  manu: { n: 'Bosque Nativo', q: '¡Todo es ecológico!', c1: '#69f0ae', c2: '#1b5e20', st: 'leaves', d: 38, status: ['root', 110] },
  mario: { n: 'Trans-Formación Total', q: '¡Fuerza total!', c1: '#ff5252', c2: '#448aff', st: 'rays', d: 42 },
  gonza: { n: 'Corte de Barbero', q: '¡Pa\' la nuca, hermano!', c1: '#eceff1', c2: '#b71c1c', st: 'hearts', glyph: '✂', d: 34, drain: 1, heal: 12 },
  wenley: { n: 'Tsunami de Leche', q: '¿Quieres leche?', c1: '#ffffff', c2: '#4fc3f7', st: 'wave', d: 40, status: ['slow', 150] },
  manin: { n: 'Furia del Sol Inca', q: '¡Por el Inti!', c1: '#ffca28', c2: '#e65100', st: 'sun', d: 40, status: ['burn', 200] },
  ale: { n: 'Concierto Mundial', q: '¡Gracias, Army!', c1: '#f48fb1', c2: '#ce93d8', st: 'hearts', glyph: '♥', d: 36, heal: 15 },
  mati: { n: 'Embargo Total', q: 'Esto va al SII.', c1: '#ffd54f', c2: '#b71c1c', st: 'rain', glyph: '🪙', d: 36, drain: 1 },
  alonso: { n: 'Cena a Oscuras', q: 'Apagón, mi amor.', c1: '#ce93d8', c2: '#1a0033', st: 'lightning', d: 38, status: ['invert', 200] },
  jp: { n: 'Herencia de Vitacura', q: '¡Apellido compuesto!', c1: '#ffd54f', c2: '#4e342e', st: 'rain', glyph: '💳', d: 38, status: ['stun', 60] },
  benja: { n: '¡Es Hora de Héroes!', q: '¡Es hora de...!', c1: '#76ff03', c2: '#1b5e20', st: 'rays', d: 44 },
  rafa: { n: 'Campana Final', q: 'Descansa en paz.', c1: '#ffd54f', c2: '#69f0ae', st: 'bell', d: 36, status: ['stun', 60], heal: 14 },
  tata: { n: 'Golpe Seductor Supremo', q: 'Chakal nomá.', c1: '#f48fb1', c2: '#00acc1', st: 'hearts', glyph: '♥', d: 38, pull: 1, status: ['invert', 200] },
  rosita: { n: 'Banquete de Abuela', q: '¡A comer, mijito!', c1: '#f5b041', c2: '#c2185b', st: 'rain', glyph: '🥟', d: 38, pull: 1, status: ['stun', 50] },
  tono: { n: 'Orgullo Supremo', q: '¡Con orgullo!', c1: '#ff80ab', c2: '#7c4dff', st: 'rain', glyph: '🌈', d: 38, status: ['stun', 50] },
  juanito: { n: 'Paro Nacional', q: '¡Corten la ruta!', c1: '#ffb300', c2: '#37474f', st: 'rain', glyph: '🚚', d: 40, status: ['stun', 60] },
  gaston: { n: 'Eclipse Calvo', q: '¡Me brilla la frente!', c1: '#fff59d', c2: '#5d4037', st: 'rays', d: 40, status: ['stun', 50] },
  pitu: { n: 'Tarjeta Roja Final', q: '¡Expulsado!', c1: '#ef5350', c2: '#263238', st: 'rain', glyph: '🟥', d: 40, status: ['stun', 55] },
  tiorene: { n: 'Asado Dominical', q: '¡Todos a la mesa!', c1: '#ff8a65', c2: '#4e342e', st: 'rain', glyph: '🍖', d: 38, pull: 1, status: ['burn', 140] }
};
for (const id in KIT) if (KIT[id].u) ULT[id] = Object.assign({}, ULT[id], KIT[id].u);   // definitivas del kit (kit.js)
function startUltra(f, e) {
  if (state != 'go' || cin) return; const u = ULT[f.ch.id] || ULT.mario;
  if (f.ch.alt) { const a = f.ch.alt; ensureFrames(a); if (hasAnim(a)) f.ch = a; toast('¡Modo barbero!', f) }   // solo se transforma si los sprites de la forma alterna existen (si no, el personaje se veía como un círculo con cuerpo de bloques)   // Chino: la ultra lo transforma
  f.ult = 0; f.atk = null; f.cast = 0; f.ib = []; cin = { f, e, u, t: 0, N: 120 }; state = 'cine'; sfx('ultra'); rumble(f.i, 700, .6, .6); rumble(e.i, 400, .2, .8)
}
function cineTick() {
  const c = cin; c.t++; if (c.t == 40) { sfx('sp'); grunt(c.f.ch, 'shout'); rumble(c.f.i, 300, .3, .9) } if (c.t == 72) sfxN(.5, .2); if (c.t == c.N - 14) sfx('ultra');
  if (c.t >= c.N) { cin = null; state = 'go'; fireUltra(c) }
}
function fireUltra({ f, e, u }) {
  hit(f, e, u.d, u.status || null, { sure: 1, ultra: 1, drain: u.drain, pull: u.pull, heal: u.heal });
  e.kd = 70; e.vy = -12; e.vx = f.face * 14; uaf = { u, x: e.x, t: 60 };
  flashC = u.c1; flashT = 14; shake = 24; slowDiv = 2; slowT = 36; hstop = 12; cam.z += .12; sfxN(.6, .35); sfx('fall'); rumble(e.i, 600, 1, 1); rumble(f.i, 200, .4, .6);
  ring(e.x, GY, 520, u.c1, 12, 30, 1); ring(e.x, e.y - 90, 240, '#fff', 10, 20); star(e.x, e.y - 90, 220, u.c1); spark(e.x, e.y - 90, 60, [u.c1, u.c2, '#fff'], 18, 34)
}
// Efectos procedurales de cada ultra (se usan en la cinemática y al impactar)
function ultFX(st, t, cx, cy, c1, c2, k, R0, u) {
  const cols = [c1, c2]; X.save(); X.lineCap = 'round'; X.lineJoin = 'round'; X.textAlign = 'center';
  if (st == 'rays' || st == 'sun') {
    X.globalCompositeOperation = 'lighter'; const n = st == 'sun' ? 28 : 20;
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + t * (st == 'sun' ? .012 : -.02), len = R0 * (.7 + sr(i, 1) * .9) * k, w = .05 + sr(i, 2) * .06; X.fillStyle = cols[i % 2]; X.globalAlpha = .55 * k; X.beginPath(); X.moveTo(cx, cy); X.arc(cx, cy, len, a - w, a + w); X.closePath(); X.fill() }
    if (st == 'sun') { const rr = R0 * .45 * k + 1, g = X.createRadialGradient(cx, cy, 2, cx, cy, rr); g.addColorStop(0, '#fff'); g.addColorStop(.4, c1); g.addColorStop(1, 'rgba(0,0,0,0)'); X.globalAlpha = .9; X.fillStyle = g; X.beginPath(); X.arc(cx, cy, rr, 0, 7); X.fill() }
  } else if (st == 'lightning') {
    X.globalCompositeOperation = 'lighter'; X.strokeStyle = c1; X.shadowColor = c1; X.shadowBlur = 14;
    for (let b = 0; b < 5; b++) { const sd = ((t / 3) | 0) * 7 + b; let x = cx + (sr(sd, 1) - .5) * R0 * 1.6, y = cy - R0 * .9; X.globalAlpha = k * (.5 + .5 * sr(sd, 9)); X.lineWidth = 2 + sr(sd, 8) * 5; X.beginPath(); X.moveTo(x, y); for (let s = 1; s <= 8; s++) { x += (sr(sd + s, 2) - .5) * 90 + (cx - x) * .08; y += R0 * 1.4 / 8; X.lineTo(x, y) } X.stroke() }
  } else if (st == 'ice') {
    X.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283 + sr(i, 1) * .3, len = R0 * (.4 + sr(i, 2) * .8) * k, w = .05 + sr(i, 3) * .07; X.fillStyle = cols[i % 2]; X.strokeStyle = '#fff'; X.globalAlpha = .6 * k; X.lineWidth = 2; X.beginPath(); X.moveTo(cx + Math.cos(a - w) * 30, cy + Math.sin(a - w) * 30); X.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); X.lineTo(cx + Math.cos(a + w) * 30, cy + Math.sin(a + w) * 30); X.closePath(); X.fill(); X.stroke() }
  } else if (st == 'leaves') {
    for (let i = 0; i < 60; i++) { const p = ((t * .014 + sr(i, 2)) % 1), x = cx + Math.sin(p * 9 + i) * R0 * (.3 + .8 * sr(i, 3)), y = cy - R0 * .9 + p * R0 * 1.9; X.save(); X.translate(x, y); X.rotate(p * 12 + i); X.globalAlpha = k * .9; X.fillStyle = cols[i % 2]; X.beginPath(); X.ellipse(0, 0, 11, 4, 0, 0, 7); X.fill(); X.restore() }
  } else if (st == 'void') {
    X.globalCompositeOperation = 'lighter';
    for (let r = 0; r < 7; r++) { const p = ((t * .02 + r / 7) % 1); X.globalAlpha = k * p; X.strokeStyle = cols[r % 2]; X.lineWidth = 3 + p * 6; X.beginPath(); X.arc(cx, cy, R0 * (1 - p) + 8, 0, 7); X.stroke() }
    X.globalCompositeOperation = 'source-over'; const rr = R0 * .3 * k + 1, g = X.createRadialGradient(cx, cy, 2, cx, cy, rr); g.addColorStop(0, '#000'); g.addColorStop(.8, '#000'); g.addColorStop(1, c1); X.globalAlpha = k; X.fillStyle = g; X.beginPath(); X.arc(cx, cy, rr, 0, 7); X.fill()
  } else if (st == 'hearts' || st == 'rain') {
    const gl = (u && u.glyph) || '♥', fall = st == 'rain';
    for (let i = 0; i < 30; i++) { const p = ((t * .012 + sr(i, 2)) % 1), x = cx + (sr(i, 1) - .5) * R0 * 2.2 + Math.sin(p * 7 + i) * 14, y = fall ? cy - R0 + p * R0 * 2 : cy + R0 * .8 - p * R0 * 1.8; X.globalAlpha = k * (fall ? .95 : Math.sin(p * 3.14)); X.font = (22 + sr(i, 3) * 28 | 0) + 'px sans-serif'; X.fillStyle = cols[i % 2]; X.fillText(gl, x, y) }
  } else if (st == 'wave') {
    for (let j = 0; j < 5; j++) { X.globalAlpha = k * .4; X.fillStyle = cols[j % 2]; X.beginPath(); X.moveTo(cx - 560, cy + R0 + 80); for (let x = -560; x <= 560; x += 20) X.lineTo(cx + x, cy + R0 * .7 - k * R0 * .9 + j * 26 + Math.sin(x * .02 + t * .12 + j * 1.3) * (18 + j * 5)); X.lineTo(cx + 560, cy + R0 + 80); X.closePath(); X.fill() }
  } else if (st == 'moon' || st == 'bell') {
    X.globalCompositeOperation = 'lighter';
    const rr = R0 * .5 * k + 1, my = cy - R0 * .45, g = X.createRadialGradient(cx, my, 4, cx, my, rr); g.addColorStop(0, st == 'moon' ? '#fff' : '#fff8e1'); g.addColorStop(.5, c1); g.addColorStop(1, 'rgba(0,0,0,0)'); X.globalAlpha = .9 * k; X.fillStyle = g; X.beginPath(); X.arc(cx, my, rr, 0, 7); X.fill();
    for (let r = 0; r < 3; r++) { const p = ((t * .02 + r / 3) % 1); X.globalAlpha = k * (1 - p) * .8; X.strokeStyle = cols[r % 2]; X.lineWidth = 5; X.beginPath(); X.arc(cx, my, R0 * .3 + p * R0, 0, 7); X.stroke() }
    for (let i = 0; i < 30; i++) { X.globalAlpha = k * (.4 + .6 * Math.abs(Math.sin(t * .08 + i))); X.fillStyle = cols[i % 2]; X.fillRect(cx + (sr(i, 1) - .5) * R0 * 2.4, cy + (sr(i, 2) - .5) * R0 * 1.6, 3, 3) }
  } else if (st == 'clock') {
    X.globalCompositeOperation = 'lighter'; X.strokeStyle = c1; X.shadowColor = c1; X.shadowBlur = 12; const rr = R0 * .55 * k + 1; X.globalAlpha = .85 * k; X.lineWidth = 8; X.beginPath(); X.arc(cx, cy, rr, 0, 7); X.stroke(); X.lineWidth = 4;
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; X.beginPath(); X.moveTo(cx + Math.cos(a) * rr * .86, cy + Math.sin(a) * rr * .86); X.lineTo(cx + Math.cos(a) * rr * .96, cy + Math.sin(a) * rr * .96); X.stroke() }
    X.lineWidth = 6; X.beginPath(); X.moveTo(cx, cy); X.lineTo(cx + Math.cos(t * .25) * rr * .8, cy + Math.sin(t * .25) * rr * .8); X.stroke(); X.beginPath(); X.moveTo(cx, cy); X.lineTo(cx + Math.cos(t * .021) * rr * .5, cy + Math.sin(t * .021) * rr * .5); X.stroke()
  }
  X.restore()
}
function figure(ch, pose, x, gy, face, mul, tm) {
  if (hasAnim(ch)) { const S2 = ch.A.st, a = pose == 'cast' && S2.finish ? S2.finish : (S2[pose] || S2.cast), fi = pose == 'punch' ? a[Math.min(1, a.length - 1)] : pose == 'idle' ? a[(((tm || 0) / 12) | 0) % a.length] : a[0]; drawFrame(ch, fi, x, gy, face, mul) }
  else if (hasSprite(ch)) sprite(ch, x, gy, 154 * mul, face);
  else skin(ch, x, gy, 1.1 * mul, face, { ph: 0, ext: pose == 'punch' ? 1 : 0, lean: 0 })
}
// Pantalla de victoria: retrato grande del ganador, su frase y el marcador (aparece al final de la pelea)
function drawVictory() {
  if (state != 'over' || !win || win.t < 128) return;
  const t = win.t, k = Math.min(1, (t - 128) / 18), ez = 1 - (1 - k) * (1 - k) * (1 - k), Wn = F[win.w], L = F[1 - win.w], ch = Wn.ch, left = win.w == 0, px = left ? 290 : W - 290, tx = left ? 560 : 60, pc = PCOL[win.w];
  X.save(); X.globalAlpha = ez; X.fillStyle = '#05050f'; X.fillRect(0, 0, W, H);
  const g = X.createLinearGradient(left ? 0 : W, 0, left ? W : 0, H); g.addColorStop(0, ch.c); g.addColorStop(.65, '#0b0b1a'); g.addColorStop(1, '#05050f'); X.globalAlpha = ez * .9; X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.save(); X.globalAlpha = ez * .13; X.fillStyle = '#fff'; X.translate(px, 300); X.rotate(t * .004); for (let i = 0; i < 14; i++) { X.rotate(Math.PI * 2 / 14); X.beginPath(); X.moveTo(0, 0); X.lineTo(900, -50); X.lineTo(900, 50); X.fill() } X.restore();
  X.globalAlpha = ez; X.fillStyle = 'rgba(0,0,0,.35)'; X.beginPath(); X.ellipse(px, 528, 170, 22, 0, 0, 7); X.fill();
  figure(ch, 'cast', px + (1 - ez) * (left ? -320 : 320), 526, left ? 1 : -1, 2.9, t);
  X.textAlign = left ? 'left' : 'right'; const x0 = left ? tx : W - 60; X.lineJoin = 'round';
  X.font = 'bold 28px Impact,sans-serif'; X.lineWidth = 6; X.strokeStyle = '#000'; X.strokeText('JUGADOR ' + (win.w + 1) + ' · GANADOR', x0, 120); X.fillStyle = pc; X.fillText('JUGADOR ' + (win.w + 1) + ' · GANADOR', x0, 120);
  const nm = ch.n.toUpperCase(); let fs = 110; X.font = 'bold ' + fs + 'px Impact,sans-serif'; while (X.measureText(nm).width > 400 && fs > 50) { fs -= 6; X.font = 'bold ' + fs + 'px Impact,sans-serif' }
  X.lineWidth = 12; X.strokeStyle = '#000'; X.strokeText(nm, x0, 120 + fs * .9); const lg = X.createLinearGradient(0, 120, 0, 120 + fs); lg.addColorStop(0, '#fff59d'); lg.addColorStop(1, '#ff9800'); X.fillStyle = lg; X.fillText(nm, x0, 120 + fs * .9);
  // frase en un globo
  const q = '“' + (win.q || '') + '”', by = 120 + fs * .9 + 36; X.font = 'italic bold 30px sans-serif'; const mw = 380, words = q.split(' '), lines = []; let cur = '';
  words.forEach(w => { const tr = cur ? cur + ' ' + w : w; if (X.measureText(tr).width > mw && cur) { lines.push(cur); cur = w } else cur = tr }); lines.push(cur);
  const bh = lines.length * 38 + 28, bx = left ? tx - 14 : W - 60 - mw - 14, bw = mw + 28; X.fillStyle = 'rgba(0,0,0,.55)'; X.strokeStyle = pc; X.lineWidth = 3; X.beginPath(); X.roundRect(bx, by, bw, bh, 16); X.fill(); X.stroke();
  X.fillStyle = '#fff'; X.textAlign = 'left'; lines.forEach((l, i) => X.fillText(l, bx + 14, by + 40 + i * 38));
  // marcador
  X.textAlign = left ? 'left' : 'right'; X.font = 'bold 24px sans-serif'; X.lineWidth = 5; const sc0 = 'RONDAS  ' + Wn.wins + ' – ' + L.wins + '   vs ' + L.ch.n; X.strokeStyle = '#000'; X.strokeText(sc0, x0, by + bh + 44); X.fillStyle = '#fff'; X.fillText(sc0, x0, by + bh + 44);
  if (stT <= 0) { X.font = 'bold 20px sans-serif'; X.textAlign = 'center'; X.globalAlpha = ez * (.65 + .35 * Math.sin(t * .15)); X.strokeText(overHint(), W / 2, 520); X.fillText(overHint(), W / 2, 520) }
  X.restore()
}
function drawCine() {
  const c = cin, u = c.u, f = c.f, ch = f.ch, t = c.t, N = c.N, face = f.i ? -1 : 1, k = Math.min(1, t / 10, (N - t) / 8), ez = q => 1 - Math.pow(1 - Math.min(1, Math.max(0, q)), 3);
  X.save(); X.globalAlpha = .9 * k; X.fillStyle = '#000'; X.fillRect(0, 0, W, H); X.globalAlpha = k;
  const bg = X.createRadialGradient(W / 2, 270, 20, W / 2, 270, 560); bg.addColorStop(0, u.c1 + '77'); bg.addColorStop(.6, u.c2 + '66'); bg.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = bg; X.fillRect(0, 0, W, H);
  X.save(); X.translate(W / 2, 270); X.globalCompositeOperation = 'lighter'; X.strokeStyle = u.c1;
  for (let i = 0; i < 46; i++) { const a = i / 46 * 6.283 + t * .004, r0 = (sr(i, 3) * 600 + t * 14) % 640 + 80, r1 = r0 + 60 + sr(i, 4) * 140; X.globalAlpha = k * (.15 + .3 * sr(i, 5)); X.lineWidth = 1 + sr(i, 6) * 5; X.beginPath(); X.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * .7); X.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * .7); X.stroke() }
  X.restore(); X.globalAlpha = k;
  ultFX(u.st, t, W / 2, 290, u.c1, u.c2, Math.min(1, t / 45), 300, u);
  X.globalAlpha = k; const sh = t > 36 && t < N - 20 ? (Math.random() - .5) * 4 : 0;
  const fx0 = W / 2 - face * 180 + (1 - ez(t / 22)) * -face * 600;
  X.save(); X.translate(sh, sh); figure(ch, t < 70 ? 'cast' : 'punch', fx0, 452, face, 2.2); X.restore();
  if (t > 50) { const e = c.e; X.globalAlpha = k * ez((t - 50) / 14); figure(e.ch, t > N - 34 ? 'hit' : 'idle', W / 2 + face * 260, 452, -face, 1.45, t) }
  X.globalAlpha = k; const bx = (1 - ez(t / 14)) * W * face * -1;
  X.save(); X.translate(bx, 0); const bgd = X.createLinearGradient(0, 0, W, 0); bgd.addColorStop(0, u.c2); bgd.addColorStop(.5, u.c1); bgd.addColorStop(1, u.c2);
  X.globalAlpha = .92 * k; X.fillStyle = bgd; X.beginPath(); X.moveTo(-40, 104); X.lineTo(W + 40, 84); X.lineTo(W + 40, 176); X.lineTo(-40, 196); X.closePath(); X.fill();
  X.globalAlpha = k; X.textAlign = 'center'; X.lineJoin = 'round'; X.font = 'italic bold 20px sans-serif'; X.fillStyle = '#fff'; X.fillText('— ULTRA · ' + ch.n.toUpperCase() + ' —', W / 2, 124);
  X.font = 'bold 58px Impact,sans-serif'; X.lineWidth = 9; X.strokeStyle = '#000'; X.strokeText(u.n.toUpperCase(), W / 2, 178); X.fillStyle = '#fff'; X.fillText(u.n.toUpperCase(), W / 2, 178); X.restore();
  if (t > 34) { X.globalAlpha = k * ez((t - 34) / 10); X.font = 'italic bold 32px sans-serif'; X.lineWidth = 6; X.strokeStyle = '#000'; X.strokeText('«' + u.q + '»', W / 2, 238); X.fillStyle = u.c1; X.fillText('«' + u.q + '»', W / 2, 238) }
  X.globalAlpha = k; X.fillStyle = '#000'; X.fillRect(0, 0, W, 42 * k); X.fillRect(0, H - 42 * k, W, 42 * k);
  if (t > N - 8) { X.globalAlpha = (t - (N - 8)) / 8; X.fillStyle = '#fff'; X.fillRect(0, 0, W, H) }
  X.restore()
}
function drawUltAfter() { if (!uaf) return; const k = uaf.t / 60; X.save(); X.globalAlpha = Math.min(1, k * 1.5); ultFX(uaf.u.st, 60 - uaf.t + 40, uaf.x, GY - 90, uaf.u.c1, uaf.u.c2, .4 + .6 * k, 260, uaf.u); X.restore() }

// ---------- BLOOM ----------
const BL = [document.createElement('canvas'), document.createElement('canvas')];
BL[0].width = W / 4; BL[0].height = H / 4; BL[1].width = W / 8; BL[1].height = H / 8;
const BM = document.createElement('canvas'); BM.width = 16; BM.height = 9; let bmT = 0, bmL = .4;
function bloom(amt) {
  if (bmT++ % 90 == 0) { try { const g = BM.getContext('2d'); g.drawImage(C, 0, 0, C.width, C.height, 0, 0, 16, 9); const d = g.getImageData(0, 0, 16, 9).data; let t = 0; for (let i = 0; i < d.length; i += 4) t += (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255; bmL = t / 144 } catch (e) { } }
  amt *= Math.max(.12, Math.min(1, 1.25 - bmL * 1.7));
  const a = BL[0].getContext('2d'), b = BL[1].getContext('2d'); a.imageSmoothingEnabled = b.imageSmoothingEnabled = true;
  a.globalCompositeOperation = 'copy'; a.filter = 'contrast(1.5) brightness(.8) saturate(1.3)'; a.drawImage(C, 0, 0, C.width, C.height, 0, 0, BL[0].width, BL[0].height); a.filter = 'none';
  b.globalCompositeOperation = 'copy'; b.drawImage(BL[0], 0, 0, BL[1].width, BL[1].height);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'lighter'; X.imageSmoothingEnabled = true; X.globalAlpha = amt; X.drawImage(BL[1], 0, 0, C.width, C.height); X.globalAlpha = amt * .7; X.drawImage(BL[0], 0, 0, C.width, C.height); X.restore()
}

// ---------- ESCENARIOS (4, con animación) ----------
function mkc() { const c = document.createElement('canvas'); c.width = W * S; c.height = H * S; const g = c.getContext('2d'); g.scale(S, S); return [c, g] }
const grad = (g, y0, y1, a) => { const q = g.createLinearGradient(0, y0, 0, y1); a.forEach(s => q.addColorStop(s[0], s[1])); return q };
function animCity(t) {
  drawClouds(t); X.save(); X.strokeStyle = '#1a0f2e'; X.lineWidth = 2; X.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const x = (t * 38 * (.6 + i * .15) + i * 210) % (W + 120) - 60, y = 110 + i * 24 + Math.sin(t * 2 + i) * 8, w = Math.sin(t * 9 + i * 2) * 6; X.beginPath(); X.moveTo(x - 9, y - w); X.quadraticCurveTo(x - 3, y - 3, x, y); X.quadraticCurveTo(x + 3, y - 3, x + 9, y - w); X.stroke() }
  X.restore()
}
function stageSnow() {
  const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#040a22'], [.5, '#0c2a55'], [.85, '#2c6491'], [1, '#86bcdc']]); g.fillRect(0, 0, W, GY);
  for (let i = 0; i < 130; i++) { g.globalAlpha = rnd(.3, 1); g.fillStyle = '#fff'; g.fillRect(rnd(0, W), rnd(0, GY * .5), 2, 2) } g.globalAlpha = 1;
  const mg = g.createRadialGradient(780, 100, 10, 780, 100, 150); mg.addColorStop(0, 'rgba(220,240,255,.9)'); mg.addColorStop(.25, 'rgba(160,200,255,.3)'); mg.addColorStop(1, 'rgba(100,150,255,0)'); g.fillStyle = mg; g.fillRect(600, 0, 360, 260);
  g.fillStyle = '#f3faff'; g.beginPath(); g.arc(780, 100, 34, 0, 7); g.fill();
  const mt = (base, amp, col, sd) => { const top = base - amp * 1.5, q = grad(g, top, base, [[0, '#f2f9ff'], [.3, '#cfe3f5'], [.34, col], [1, col]]); g.fillStyle = q; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= W + 20; x += 20) g.lineTo(x, base - Math.abs(Math.sin(x * .007 + sd) * amp + Math.sin(x * .019 + sd * 2.1) * amp * .4)); g.lineTo(W, GY); g.closePath(); g.fill() };
  mt(GY - 70, 120, '#2b4a78', 1.3); mt(GY - 40, 85, '#1c3358', 4.2);
  for (let x = -10; x < W; x += rnd(16, 30)) { const h = rnd(40, 90), y = GY - rnd(4, 20); g.fillStyle = '#061a24'; for (let k = 0; k < 3; k++) { const w = h * .22 * (1 + k * .45), yy = y - h + k * h * .28; g.beginPath(); g.moveTo(x, yy - h * .2); g.lineTo(x - w, yy + h * .3); g.lineTo(x + w, yy + h * .3); g.fill() } g.fillRect(x - 2, y - 6, 4, 8) }
  g.fillStyle = '#2a1a14'; g.fillRect(70, GY - 70, 90, 66); g.fillStyle = '#e8f3fb'; g.beginPath(); g.moveTo(58, GY - 68); g.lineTo(115, GY - 112); g.lineTo(172, GY - 68); g.fill(); g.fillStyle = '#ffd27a'; g.fillRect(90, GY - 52, 22, 22); g.fillRect(124, GY - 52, 22, 22);
  const wg = g.createRadialGradient(125, GY - 40, 4, 125, GY - 40, 70); wg.addColorStop(0, 'rgba(255,200,100,.35)'); wg.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = wg; g.fillRect(40, GY - 110, 170, 120);
  g.fillStyle = grad(g, GY, H, [[0, '#e8f3fb'], [.3, '#bcd5e8'], [1, '#6f94b4']]); g.fillRect(0, GY, W, H - GY);
  for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,255,255,' + rnd(.3, .8) + ')'; g.fillRect(rnd(0, W), rnd(GY + 4, H), rnd(2, 6), 1.5) }
  g.fillStyle = grad(g, GY, GY + 16, [[0, 'rgba(20,50,90,.45)'], [1, 'rgba(20,50,90,0)']]); g.fillRect(0, GY, W, 16); return c
}
function animSnow(t) {
  X.save(); X.globalCompositeOperation = 'lighter';
  [['61,245,168', 40], ['79,195,247', 78], ['179,136,255', 112]].forEach(([rgb, y0], j) => {
    const top = x => y0 + Math.sin(x * .011 + t * .5 + j * 2) * 26 + Math.sin(x * .027 - t * .8) * 9, hh = x => 46 + Math.sin(x * .02 + t * .4 + j) * 20;
    X.beginPath(); for (let x = 0; x <= W; x += 24) x ? X.lineTo(x, top(x)) : X.moveTo(x, top(x)); for (let x = W; x >= 0; x -= 24) X.lineTo(x, top(x) + hh(x)); X.closePath();
    const q = X.createLinearGradient(0, y0 - 30, 0, y0 + 100); q.addColorStop(0, 'rgba(' + rgb + ',0)'); q.addColorStop(.3, 'rgba(' + rgb + ',.35)'); q.addColorStop(1, 'rgba(' + rgb + ',0)'); X.fillStyle = q; X.globalAlpha = .65 + .35 * Math.sin(t * .9 + j); X.fill()
  });
  X.globalAlpha = 1; X.fillStyle = '#fff';
  for (let i = 0; i < 110; i++) { const x = (sr(i, 2) * W + t * (14 + 20 * sr(i, 3)) + Math.sin(t + i) * 10) % W, y = (sr(i, 4) * H + t * (40 + 60 * sr(i, 5))) % H; X.globalAlpha = .55 + .4 * sr(i, 7); X.beginPath(); X.arc(x, y, 1 + sr(i, 6) * 2, 0, 7); X.fill() }
  X.restore()
}
const BULBS = Array.from({ length: 24 }, (_, i) => { const x = i * 42 - 12; return [x, 58 + Math.sin(i / 23 * 3.14) * 40 + Math.sin(i * 1.1) * 3, ['#ff5252', '#ffd54f', '#4fc3f7', '#69f0ae', '#e040fb'][i % 5]] });
function stageHarbor() {
  const [c, g] = mkc(), HY = GY - 100; g.fillStyle = grad(g, 0, HY, [[0, '#0a0524'], [.5, '#33145e'], [1, '#c2417e']]); g.fillRect(0, 0, W, HY);
  for (let i = 0; i < 80; i++) { g.globalAlpha = rnd(.2, .8); g.fillStyle = '#fff'; g.fillRect(rnd(0, W), rnd(0, HY * .6), 2, 2) } g.globalAlpha = 1;
  g.fillStyle = grad(g, HY, GY, [[0, '#3a2670'], [1, '#08122e']]); g.fillRect(0, HY, W, GY - HY);
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,170,120,' + rnd(.05, .18) + ')'; g.fillRect(rnd(300, 660), HY + rnd(2, 96), rnd(20, 90), 2) }
  const house = (x, y) => { const w = rnd(12, 20), h = rnd(11, 16), col = ['#ef5350', '#ffca28', '#26c6da', '#ab47bc', '#66bb6a', '#ff7043'][(Math.random() * 6) | 0]; g.fillStyle = col; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x + w / 2, y - 6); g.lineTo(x + w + 2, y); g.fill(); g.fillStyle = '#ffe9a0'; if (Math.random() < .8) g.fillRect(x + 3, y + 4, 4, 4); if (Math.random() < .6) g.fillRect(x + w - 7, y + 4, 4, 4) };
  [0, 1].forEach(sd => { g.fillStyle = '#1a0f33'; g.beginPath(); g.moveTo(sd ? W : 0, HY + 4); for (let x = 0; x <= 430; x += 10) g.lineTo(sd ? W - x : x, HY - 190 * Math.pow(1 - x / 430, 1.2)); g.lineTo(sd ? W - 430 : 430, HY + 4); g.closePath(); g.fill();
    for (let x = 0; x < 410; x += 17) { const top = HY - 190 * Math.pow(1 - x / 430, 1.2); for (let y = top + 8; y < HY - 8; y += 17) if (Math.random() < .78) house(sd ? W - x - 18 : x + rnd(-2, 3), y) } });
  g.fillStyle = '#0b0820'; [[470, 20], [600, 14]].forEach(([x, w]) => { g.beginPath(); g.moveTo(x - w, HY + 34); g.lineTo(x + w, HY + 34); g.lineTo(x + w * .6, HY + 44); g.lineTo(x - w * .6, HY + 44); g.fill(); g.fillRect(x - 1, HY + 8, 2, 26) });
  g.fillStyle = grad(g, GY, H, [[0, '#7a5638'], [.4, '#5a3d28'], [1, '#2e1c12']]); g.fillRect(0, GY, W, H - GY);
  g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = GY + 10; y < H; y += 14 + (y - GY) * .05) g.fillRect(0, y, W, 2); for (let i = 0; i < 70; i++) g.fillRect(rnd(0, W), rnd(GY, H), 2, rnd(8, 18));
  g.fillStyle = grad(g, GY, GY + 14, [[0, 'rgba(0,0,0,.5)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, GY, W, 14);
  [70, W - 70].forEach(x => { g.fillStyle = '#1b1b25'; g.fillRect(x - 3, GY - 120, 6, 122); g.fillRect(x - 16, GY - 124, 32, 6); const q = g.createRadialGradient(x, GY - 112, 2, x, GY - 112, 90); q.addColorStop(0, 'rgba(255,220,140,.7)'); q.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = q; g.fillRect(x - 90, GY - 202, 180, 180); g.fillStyle = '#fff3c0'; g.beginPath(); g.arc(x, GY - 112, 6, 0, 7); g.fill() });
  g.strokeStyle = '#111'; g.lineWidth = 1.5; g.beginPath(); BULBS.forEach((b, i) => i ? g.lineTo(b[0], b[1]) : g.moveTo(b[0], b[1])); g.stroke(); return c
}
function animHarbor(t) {
  const HY = GY - 100; X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) { const x = (sr(i, 2) * W + t * 8 * (.5 + sr(i, 3))) % W, y = HY + 4 + sr(i, 1) * 92; X.globalAlpha = .12 + .12 * Math.sin(t * 2 + i); X.fillStyle = i % 2 ? '#ffd9a0' : '#9fd8ff'; X.fillRect(x, y, 10 + sr(i, 4) * 26, 2) }
  BULBS.forEach((b, i) => { X.globalAlpha = .55 + .4 * Math.sin(t * 3 + i * 1.7); const q = X.createRadialGradient(b[0], b[1], 1, b[0], b[1], 14); q.addColorStop(0, b[2]); q.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = q; X.beginPath(); X.arc(b[0], b[1], 14, 0, 7); X.fill() });
  for (let b = 0; b < 4; b++) {
    const per = 3.6, tt2 = (t + b * .9) % per, id = Math.floor((t + b * .9) / per) + b * 13; if (tt2 > 2.6) continue;
    const cx = 120 + sr(id, 1) * 720, cy = 50 + sr(id, 2) * 130, col = ['#ff5252', '#ffd54f', '#4fc3f7', '#69f0ae', '#e040fb', '#ff9800'][(sr(id, 3) * 6) | 0];
    if (tt2 < .35) { const q = tt2 / .35; X.globalAlpha = .9; X.fillStyle = '#fff'; X.beginPath(); X.arc(cx, GY - 60 + (cy - GY + 60) * q, 2.5, 0, 7); X.fill(); continue }
    const e = tt2 - .35; X.fillStyle = col;
    for (let i = 0; i < 46; i++) { const a = i / 46 * 6.283, v = 40 + sr(i + id, 4) * 40; X.globalAlpha = Math.max(0, 1 - e / 2.25); X.beginPath(); X.arc(cx + Math.cos(a) * v * e * 1.6, cy + Math.sin(a) * v * e * 1.6 + 22 * e * e, 2 + (1 - e / 2.3) * 1.5, 0, 7); X.fill() }
  }
  X.restore()
}
const CRK = Array.from({ length: 16 }, (_, i) => { let x = sr(i, 1) * W, y = GY + 14 + sr(i, 2) * (H - GY - 30); const p = [[x, y]]; for (let k = 0; k < 5; k++) { x += (sr(i + k, 3) - .3) * 60; y += (sr(i + k, 4) - .5) * 16; p.push([x, y]) } return p });
function stageVolcano() {
  const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#0a0206'], [.4, '#3a0a10'], [.75, '#a0260c'], [1, '#ff8a1e']]); g.fillRect(0, 0, W, GY);
  g.fillStyle = '#2a0a0c'; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= W; x += 20) g.lineTo(x, GY - 90 - Math.abs(Math.sin(x * .01 + 2) * 50 + Math.sin(x * .03) * 16)); g.lineTo(W, GY); g.fill();
  g.fillStyle = grad(g, 140, GY, [[0, '#2b1210'], [1, '#10050a']]); g.beginPath(); g.moveTo(110, GY); g.lineTo(405, 168); g.lineTo(430, 150); g.lineTo(530, 150); g.lineTo(555, 168); g.lineTo(850, GY); g.closePath(); g.fill();
  g.lineCap = 'round'; for (let k = 0; k < 6; k++) { let x = 440 + k * 16 + rnd(-6, 6), y = 152; g.strokeStyle = k % 2 ? '#ff6f00' : '#ffb300'; g.lineWidth = rnd(2, 5); g.beginPath(); g.moveTo(x, y); while (y < GY - 10) { x += (x < 480 ? -1 : 1) * rnd(2, 14); y += rnd(14, 28); g.lineTo(x, y) } g.stroke() }
  const cg = g.createRadialGradient(480, 150, 8, 480, 150, 110); cg.addColorStop(0, '#fff2a8'); cg.addColorStop(.35, '#ff9800'); cg.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = cg; g.fillRect(340, 40, 280, 220);
  g.fillStyle = grad(g, GY, H, [[0, '#2a1412'], [.4, '#170b0b'], [1, '#080304']]); g.fillRect(0, GY, W, H - GY);
  g.strokeStyle = '#5a1a08'; g.lineWidth = 3; CRK.forEach(p => { g.beginPath(); p.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke() });
  g.fillStyle = grad(g, GY, GY + 14, [[0, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, GY, W, 14); return c
}
function animVolcano(t) {
  X.save(); X.globalCompositeOperation = 'lighter';
  const pg = .6 + .4 * Math.sin(t * 2.2), q = X.createRadialGradient(480, 150, 8, 480, 150, 160); q.addColorStop(0, 'rgba(255,220,120,' + pg * .7 + ')'); q.addColorStop(1, 'rgba(255,60,0,0)'); X.fillStyle = q; X.fillRect(300, 0, 360, 330);
  X.strokeStyle = '#ff7a1a'; X.lineWidth = 3; CRK.forEach((p, i) => { X.globalAlpha = .25 + .3 * Math.sin(t * 2 + i); X.beginPath(); p.forEach((s, j) => j ? X.lineTo(s[0], s[1]) : X.moveTo(s[0], s[1])); X.stroke() });
  const per = 4.2, e = t % per, id = (t / per) | 0;
  if (e < 2.4) for (let i = 0; i < 22; i++) { const vx = (sr(i + id, 1) - .5) * 160, vy = -150 - sr(i + id, 2) * 130, x = 480 + vx * e, y = 148 + vy * e + 190 * e * e; X.globalAlpha = Math.max(0, 1 - e / 2.4); X.fillStyle = i % 2 ? '#ffb300' : '#ff5722'; X.beginPath(); X.arc(x, y, 3 + sr(i, 5) * 3, 0, 7); X.fill() }
  for (let i = 0; i < 40; i++) { const p = (t * (.1 + sr(i, 3) * .12) + sr(i, 2)) % 1; X.globalAlpha = Math.sin(p * 3.14) * .8; X.fillStyle = i % 2 ? '#ffb74d' : '#ff7043'; X.beginPath(); X.arc(sr(i, 1) * W + Math.sin(t + i) * 12, GY + 30 - p * (GY + 60), 1 + sr(i, 4) * 2, 0, 7); X.fill() }
  X.globalCompositeOperation = 'source-over'; for (let i = 0; i < 7; i++) { const p = (t * .08 + i / 7) % 1; X.globalAlpha = (1 - p) * .25; X.fillStyle = '#3a2a2a'; X.beginPath(); X.arc(480 + Math.sin(p * 5 + i) * 26 + p * 40, 140 - p * 140, 20 + p * 40, 0, 7); X.fill() }
  X.restore()
}

// ---------- HUD NUEVO ----------
function bar(f, i) {
  const w = 330, x = i ? 528 : 102, y = 32, h = 17, sk = i ? -14 : 14, p = f.hp / f.mhp, gp = (f.gh == null ? f.hp : f.gh) / f.mhp, now = performance.now(), full = f.ult >= 100;
  const tag = i == 1 && mode == 'arcade' ? 'CPU' : i == 1 && mode == 'train' ? 'DUMMY' : 'P' + (i + 1);
  para(x - 4, y - 4, w + 8, h + 8, sk); X.fillStyle = '#05050c'; X.fill();
  X.save(); para(x, y, w, h, sk); X.clip(); X.fillStyle = '#1a1a2c'; X.fillRect(x - 20, y, w + 60, h);
  const bw = w + 40, bx0 = x - 20, seg = q => i ? [bx0 + bw * (1 - q), bw * q] : [bx0, bw * q];
  let r = seg(gp); X.fillStyle = '#ff5252'; X.fillRect(r[0], y, r[1], h);
  r = seg(p); const low = p < .25, g = X.createLinearGradient(0, y, 0, y + h);
  if (p > .5) { g.addColorStop(0, '#fffbe6'); g.addColorStop(.5, '#f3d36b'); g.addColorStop(1, '#b8860b') } else if (p > .25) { g.addColorStop(0, '#ffe0b2'); g.addColorStop(.5, '#ffa726'); g.addColorStop(1, '#bf360c') } else { g.addColorStop(0, '#ff8a80'); g.addColorStop(1, '#b71c1c') }
  X.globalAlpha = low ? .7 + .3 * Math.sin(now / 80) : 1; X.fillStyle = g; X.fillRect(r[0], y, r[1], h); X.globalAlpha = 1;
  X.fillStyle = 'rgba(255,255,255,.3)'; X.fillRect(r[0], y, r[1], h * .4); X.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 1; k < 10; k++) X.fillRect(bx0 + bw * k / 10, y, 2, h);
  X.restore(); para(x, y, w, h, sk); X.lineWidth = 2.5; X.strokeStyle = '#c9a94a'; X.stroke(); para(x - 4, y - 4, w + 8, h + 8, sk); X.lineWidth = 1.2; X.strokeStyle = 'rgba(201,169,74,.55)'; X.stroke();
  const px = i ? W - 62 : 62; X.beginPath(); X.arc(px, 46, 37, 0, 7); X.fillStyle = '#05050c'; X.fill();
  head(f, px, 46, 31); X.beginPath(); X.arc(px, 46, 35, 0, 7); X.lineWidth = 4; X.strokeStyle = full ? '#ffd54f' : PCOL[i]; X.stroke();
  if (full) { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .4 + .3 * Math.sin(now / 120); X.lineWidth = 8; X.beginPath(); X.arc(px, 46, 40, 0, 7); X.stroke(); X.restore() }
  X.font = 'bold 21px Impact,sans-serif'; X.textAlign = i ? 'right' : 'left'; X.lineJoin = 'round'; X.lineWidth = 4; X.strokeStyle = '#000';
  const nx = i ? x + w : x + 6, nm = f.ch.n.toUpperCase(); X.strokeText(nm, nx, 27); X.fillStyle = '#fff'; X.fillText(nm, nx, 27);
  const nw = X.measureText(nm).width; X.font = 'bold 12px sans-serif'; X.fillStyle = PCOL[i]; X.lineWidth = 3; const tx = i ? nx - nw - 8 : nx + nw + 8; X.textAlign = i ? 'right' : 'left'; X.strokeText(tag, tx, 24); X.fillText(tag, tx, 24);
  X.font = 'bold 13px sans-serif'; X.textAlign = i ? 'left' : 'right'; X.lineWidth = 3; X.strokeStyle = '#000'; const hx = i ? x + 10 : x + w - 10; X.font = 'bold 11px sans-serif'; X.strokeText(Math.ceil(f.hp), hx, y + 13); X.fillStyle = '#fff'; X.fillText(Math.ceil(f.hp), hx, y + 13);
  // medidor ULTRA
  const uw = 300, ux = i ? W - 36 - uw : 36, uy = 508, uh = 12, up = Math.min(1, f.ult / 100), sk2 = sk * .5;
  para(ux - 2, uy - 2, uw + 4, uh + 4, sk2); X.fillStyle = '#05050c'; X.fill();
  X.save(); para(ux, uy, uw, uh, sk2); X.clip(); X.fillStyle = '#1a1a2c'; X.fillRect(ux - 10, uy, uw + 20, uh);
  const ug = X.createLinearGradient(ux, 0, ux + uw, 0); if (full) { ug.addColorStop(0, '#ffd54f'); ug.addColorStop(.5, '#fff59d'); ug.addColorStop(1, '#ff9800') } else { ug.addColorStop(0, '#29b6f6'); ug.addColorStop(1, '#e040fb') }
  const fw = (uw + 20) * up, fx0 = i ? ux + uw + 10 - fw : ux - 10; X.fillStyle = ug; X.fillRect(fx0, uy, fw, uh); X.fillStyle = 'rgba(255,255,255,.35)'; X.fillRect(fx0, uy, fw, uh * .4);
  if (full) { X.globalCompositeOperation = 'lighter'; X.globalAlpha = .3 + .3 * Math.sin(now / 100); X.fillStyle = '#fff'; X.fillRect(ux - 10, uy, uw + 20, uh) } X.restore();
  X.font = 'bold 11px sans-serif'; X.textAlign = i ? 'right' : 'left'; X.fillStyle = full ? '#ffd54f' : '#9ab'; X.globalAlpha = full ? .7 + .3 * Math.sin(now / 100) : 1; X.fillText(full ? '¡ULTRA!' : 'ULTRA', i ? ux - 8 : ux + uw + 8, uy + 10); X.globalAlpha = 1;
  for (let k = 0; k < 2; k++) {
    const dx = i ? x + 10 + k * 22 : x + w - 10 - k * 22, on = k < f.wins; X.save(); X.translate(dx, 70); X.rotate(.785); X.fillStyle = on ? '#ffd600' : '#3a3a4a'; X.strokeStyle = '#000'; X.lineWidth = 2; X.fillRect(-6, -6, 12, 12); X.strokeRect(-6, -6, 12, 12);
    if (on) { X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgba(255,214,0,.5)'; X.fillRect(-9, -9, 18, 18) } X.restore()
  }
  [[f.cd.k, f.ch.k[1].cd || 90, '#4fc3f7', 'HAB'], [f.cd.x, f.ch.x[1].cd || 480, '#ffb300', 'ESP'], [f.assist ? 0 : 1, 1, '#bbb', 'TORM'], [f.cd.c, 240, '#e040fb', 'COMBO'], [f.cd.d, 55, '#69f0ae', 'ESQ']].forEach((c, j) => {
    const rd = Math.max(0, Math.min(1, 1 - c[0] / c[1])), ready = j == 2 ? !!f.assist : rd >= 1, bx = x + j * 67;
    X.fillStyle = '#12121c'; X.beginPath(); X.roundRect(bx, 77, 60, 8, 3); X.fill(); X.fillStyle = ready ? c[2] : '#666'; X.beginPath(); X.roundRect(bx, 77, 60 * (j == 2 ? (f.assist ? 1 : 0) : rd), 8, 3); X.fill();
    if (ready) { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .3 + .2 * Math.sin(now / 150 + j); X.strokeStyle = c[2]; X.lineWidth = 3; X.beginPath(); X.roundRect(bx - 1, 76, 62, 10, 4); X.stroke(); X.restore() }
    X.font = 'bold 10px sans-serif'; X.textAlign = 'left'; X.fillStyle = ready ? '#fff' : '#889'; X.fillText(c[3], bx + 1, 97)
  })
}
function timerBox() {
  const low = timer <= 10 && state == 'go' && mode != 'train', now = performance.now(); X.save(); X.translate(W / 2, 46);
  if (low) { const s = 1 + (Math.sin(now / 120) * .5 + .5) * .12; X.scale(s, s) }
  X.beginPath(); X.moveTo(-34, -30); X.lineTo(34, -30); X.lineTo(46, -14); X.lineTo(46, 14); X.lineTo(34, 30); X.lineTo(-34, 30); X.lineTo(-46, 14); X.lineTo(-46, -14); X.closePath();
  const g = X.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#2c2c33'); g.addColorStop(1, '#09090c'); X.fillStyle = g; X.fill(); X.lineWidth = 3; X.strokeStyle = low ? '#b3392e' : '#8f7a3a'; X.stroke();
  X.font = 'bold 40px Impact,sans-serif'; X.textAlign = 'center'; X.lineWidth = 4; X.strokeStyle = '#000'; const t = mode == 'train' ? '∞' : String(Math.max(0, timer)); X.strokeText(t, 0, 14); X.fillStyle = low ? '#d98a7c' : '#e6e0d0'; X.fillText(t, 0, 14); X.restore()
}
function drawModeHud() {
  if (mode == 'vs') return; X.save(); X.textAlign = 'center'; X.font = 'bold 15px sans-serif'; X.lineWidth = 4; X.strokeStyle = '#000'; X.lineJoin = 'round';
  const t = mode == 'arcade' ? 'ARCADE · COMBATE ' + (arcI + 1) + ' DE ' + arc.length : 'ENTRENAMIENTO'; X.strokeText(t, W / 2, 92); X.fillStyle = '#a8935a'; X.fillText(t, W / 2, 92);
  if (mode == 'train') { X.fillStyle = 'rgba(0,0,0,.6)'; X.beginPath(); X.roundRect(W / 2 - 250, 494, 500, 34, 8); X.fill(); X.fillStyle = '#fff'; X.font = '14px sans-serif'; X.fillText('Dummy: ' + DUM[dummy] + '  ·  Último golpe: ' + Math.round(tr.last) + '  ·  Daño del combo: ' + Math.round(tr.cd) + '  ·  Pausa: cambiar dummy', W / 2, 516) }
  X.restore()
}
function trainTick() {
  tr.t++; const me = F[0], d = F[1]; me.hp = me.mhp; me.gh = me.hp; me.cd.k = me.cd.x = me.cd.z = me.cd.c = 0; me.ult = Math.min(100, me.ult + .8); timer = 99; tf = 0;
  if (d.hp <= 0 || (tr.t > 100 && d.hp < d.mhp)) { d.hp = d.mhp; d.gh = d.hp }
}
const pauseItems = () => mode == 'train' ? ['Reanudar', 'Reiniciar', 'Mis movimientos', 'Dummy: ' + DUM[dummy], 'Salir'] : PAUSE_ITEMS;

// ---------- PANTALLAS: VS, ARCADE COMPLETO, TÍTULO ----------
// ---------- HISTORIA PREVIA A LA PELEA ----------
function wrapLines(txt, maxW) {
  const out = []; let l = '';
  txt.split(' ').forEach(w => { const t = l ? l + ' ' + w : w; if (X.measureText(t).width > maxW && l) { out.push(l); l = w } else l = t });
  if (l) out.push(l); return out
}
function duelText() {
  const A = F[0].ch, B = F[1].ch, m = c => MOTIVE[c.id] ? c.n + ' ' + MOTIVE[c.id] : '';
  return (A.id == B.id ? 'Dos ' + A.n + ' bajo el mismo reflector: uno de los dos es un impostor. ' : m(A) + ' ' + m(B) + ' ') + STAGE_LINE[stg] + ' Gana quien aguante dos rondas.'
}
function drawDuel() {
  const t = stoT, A = F[0].ch, B = F[1].ch, key = [A.id, B.id].sort().join('|'), rv = RIV[key] || RIV2[key], title = A.id == B.id ? 'Choque de gemelos' : rv ? rv.t : 'Duelo en ' + STGN[stg];
  const bgg = X.createLinearGradient(0, 0, 0, H); bgg.addColorStop(0, '#0a0610'); bgg.addColorStop(1, '#1b0a14'); X.fillStyle = bgg; X.fillRect(0, 0, W, H);
  X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const h1 = ((i * 9301 + 49297) % 233280) / 233280, h2 = ((i * 7919 + 1237) % 10007) / 10007, y = H - ((t * (.4 + h1 * 1.2) + h2 * 600) % (H + 20)); X.globalAlpha = .5; X.fillStyle = i % 2 ? '#ff9a2e' : '#ffd36b'; X.beginPath(); X.arc(h1 * W + Math.sin(t / 30 + i) * 10, y, 1 + h2 * 1.8, 0, 7); X.fill() } X.restore();
  const e = 1 - Math.pow(1 - Math.min(1, t / 16), 3), arcM = mode == 'arcade', yb = arcM ? 212 : 122;
  X.textAlign = 'center'; X.font = 'bold 15px sans-serif'; try { X.letterSpacing = '8px' } catch (er) { } X.fillStyle = '#a8935a'; X.fillText('E L   E N F R E N T A M I E N T O', W / 2 + 4, 30); try { X.letterSpacing = '0px' } catch (er) { }
  [A, B].forEach((ch, i) => {
    const cx = W / 2 + (i ? 1 : -1) * 345 + (i ? 1 : -1) * (1 - e) * 300, gy = 486 + Math.sin(t / 18 + i) * 2; TINT = i == 1 && sameCh() ? 1 : 0;
    X.save(); const rg = X.createRadialGradient(cx, gy - 150, 10, cx, gy - 150, 190); rg.addColorStop(0, ch.c + '55'); rg.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = rg; X.fillRect(cx - 200, gy - 350, 400, 400); X.restore();
    if (!skinBig(ch, cx, gy, 320, i ? -1 : 1) && hasAnim(ch)) drawFrame(ch, ch.A.st.idle[0], cx, gy, i ? -1 : 1, 1.5); TINT = 0
  });
  X.save(); X.globalAlpha = e; X.fillStyle = 'rgba(8,6,14,.82)'; X.strokeStyle = '#a8935a'; X.lineWidth = 2; X.beginPath(); X.roundRect(270, 62, 420, 440, 12); X.fill(); X.stroke(); X.lineJoin = 'round';
  if (arcM) { const ch = ARC_CH[arcI % ARC_CH.length]; X.textAlign = 'center'; X.font = 'bold 15px sans-serif'; try { X.letterSpacing = '2px' } catch (er) { } X.fillStyle = '#ffd54f'; X.fillText(ch.a, W / 2 + 1, 96); try { X.letterSpacing = '0px' } catch (er) { }
    X.textAlign = 'left'; X.font = 'italic 13px sans-serif'; X.fillStyle = '#b8b2a0'; wrapLines(ch.t, 380).forEach((ln, k) => X.fillText(ln, 290, 120 + k * 18)); X.fillStyle = 'rgba(168,147,90,.5)'; X.fillRect(290, yb - 22, 380, 1) }
  X.textAlign = 'center'; X.font = 'italic 900 30px Impact,sans-serif'; X.lineWidth = 6; X.strokeStyle = '#000'; X.strokeText('⚔ ' + title + ' ⚔', W / 2, yb + 22); X.fillStyle = '#ffd54f'; X.fillText('⚔ ' + title + ' ⚔', W / 2, yb + 22);
  X.font = 'bold 22px Impact,sans-serif'; X.lineWidth = 5; const nm = A.n.toUpperCase() + '  VS  ' + B.n.toUpperCase(); X.strokeText(nm, W / 2, yb + 54); X.fillStyle = '#fff'; X.fillText(nm, W / 2, yb + 54);
  X.font = '13px sans-serif'; X.fillStyle = '#a8935a'; X.fillText('📍 ' + STGN[stg] + (arcM ? '  ·  COMBATE ' + (arcI + 1) + ' DE ' + arc.length : ''), W / 2, yb + 76);
  const tx = duelText(), n = Math.min(tx.length, Math.floor(t * 1.8)); X.textAlign = 'left'; X.font = '15px sans-serif'; X.fillStyle = '#eceff1'; wrapLines(tx.slice(0, n), 380).forEach((ln, k) => X.fillText(ln, 290, yb + 110 + k * 21));
  X.restore();
  X.textAlign = 'center'; X.font = '13px sans-serif'; X.fillStyle = '#fff'; X.globalAlpha = .5 + .35 * Math.sin(t / 12); try { X.letterSpacing = '3px' } catch (er) { } X.fillText('PULSA UN BOTÓN PARA PELEAR', W / 2, 524); X.globalAlpha = 1; try { X.letterSpacing = '0px' } catch (er) { }
}
function drawStory() {
  if (stoP == 1) { drawDuel(); return }
  const t = stoT, bgg = X.createLinearGradient(0, 0, 0, H); bgg.addColorStop(0, '#0a0610'); bgg.addColorStop(1, '#1b0a14'); X.fillStyle = bgg; X.fillRect(0, 0, W, H);
  X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const h1 = ((i * 9301 + 49297) % 233280) / 233280, h2 = ((i * 7919 + 1237) % 10007) / 10007, y = H - ((t * (.4 + h1 * 1.2) + h2 * 600) % (H + 20)); X.globalAlpha = .5; X.fillStyle = i % 2 ? '#ff9a2e' : '#ffd36b'; X.beginPath(); X.arc(h1 * W + Math.sin(t / 30 + i) * 10, y, 1 + h2 * 1.8, 0, 7); X.fill() } X.restore();
  const ease = Math.min(1, t / 16), e = 1 - Math.pow(1 - ease, 3);
  X.textAlign = 'center'; X.font = 'bold 15px sans-serif'; try { X.letterSpacing = '9px' } catch (er) { } X.fillStyle = '#a8935a'; X.fillText('L A   H I S T O R I A', W / 2 + 4, 30); try { X.letterSpacing = '0px' } catch (er) { }
  F.forEach((f, i) => {
    const ch = f.ch, st = STORY[ch.id] || { a: '', t: '' }, side = i ? 1 : -1, cx = W / 2 + side * 235 + side * (1 - e) * 420, x0 = cx - 205, y0 = 44;
    X.save(); X.fillStyle = 'rgba(8,6,14,.78)'; X.strokeStyle = ch.c; X.lineWidth = 3; X.beginPath(); X.roundRect(x0, y0, 410, 452, 12); X.fill(); X.stroke();
    const gr = X.createLinearGradient(x0, y0, x0 + 410, y0); gr.addColorStop(i ? 1 : 0, ch.c + 'cc'); gr.addColorStop(i ? 0 : 1, 'rgba(0,0,0,0)'); X.fillStyle = gr; X.fillRect(x0 + 3, y0 + 3, 404, 8);
    X.restore();
    X.save(); X.beginPath(); X.rect(x0 + 2, y0 + 12, 406, 270); X.clip();
    const rg = X.createRadialGradient(cx, y0 + 180, 10, cx, y0 + 180, 200); rg.addColorStop(0, ch.c + '55'); rg.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = rg; X.fillRect(x0, y0, 410, 290);
    TINT = i == 1 && sameCh() ? 1 : 0; if (!skinBig(ch, cx, y0 + 276 + Math.sin(t / 18 + i) * 2, 268, i ? -1 : 1) && hasAnim(ch)) drawFrame(ch, ch.A.st.idle[0], cx, y0 + 276 + Math.sin(t / 18 + i) * 2, i ? -1 : 1, 1.6); TINT = 0;
    X.restore();
    X.textAlign = 'center'; X.font = 'bold 40px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 7; X.strokeStyle = '#000'; X.strokeText(ch.n.toUpperCase(), cx, y0 + 322); X.fillStyle = '#fff'; X.fillText(ch.n.toUpperCase(), cx, y0 + 322);
    X.font = 'italic bold 14px sans-serif'; try { X.letterSpacing = '3px' } catch (er) { } X.fillStyle = '#a8935a'; X.fillText(st.a, cx + 1, y0 + 346); try { X.letterSpacing = '0px' } catch (er) { }
    X.textAlign = 'left'; X.font = '15px sans-serif'; X.fillStyle = '#eceff1'; const n = Math.min(st.t.length, Math.floor(t * 1.8)); wrapLines(st.t.slice(0, n), 372).forEach((ln, k) => X.fillText(ln, x0 + 19, y0 + 378 + k * 20));
    if (n < st.t.length && (t >> 3) % 2) { X.fillStyle = ch.c; X.fillRect(x0 + 19, y0 + 428, 8, 2) }
  });
  X.save(); X.textAlign = 'center'; X.translate(W / 2, 270); X.rotate(-.05); X.font = 'italic 900 60px Impact,sans-serif'; X.lineWidth = 9; X.strokeStyle = '#000'; X.strokeText('VS', 0, 0); const vg = X.createLinearGradient(0, -48, 0, 4); vg.addColorStop(0, '#d8cfae'); vg.addColorStop(1, '#ff6d00'); X.fillStyle = vg; X.fillText('VS', 0, 0); X.restore();
  X.textAlign = 'center'; X.font = '13px sans-serif'; X.fillStyle = '#fff'; X.globalAlpha = .5 + .35 * Math.sin(t / 12); try { X.letterSpacing = '3px' } catch (er) { } X.fillText('PULSA UN BOTÓN PARA CONTINUAR', W / 2, 522); X.globalAlpha = 1; try { X.letterSpacing = '0px' } catch (er) { }
}
function drawVS() {
  const t = vsT, A = F[0].ch, B = F[1].ch, z = 1 - Math.pow(1 - Math.min(1, t / 16), 3);
  X.fillStyle = '#05050f'; X.fillRect(0, 0, W, H);
  [[0, A.c, PCOL[0]], [1, B.c, PCOL[1]]].forEach(([i, col, pc]) => {
    X.save(); X.beginPath(); const o = (1 - z) * 500 * (i ? 1 : -1);
    if (!i) { X.moveTo(0, 0); X.lineTo(W / 2 + 70 + o, 0); X.lineTo(W / 2 - 70 + o, H); X.lineTo(0, H) } else { X.moveTo(W, 0); X.lineTo(W / 2 + 70 + o, 0); X.lineTo(W / 2 - 70 + o, H); X.lineTo(W, H) }
    X.closePath(); X.clip(); const g = X.createLinearGradient(i ? W : 0, 0, W / 2, H); g.addColorStop(0, pc); g.addColorStop(1, col); X.fillStyle = g; X.fillRect(0, 0, W, H); X.fillStyle = 'rgba(6,6,12,.68)'; X.fillRect(0, 0, W, H);
    X.globalAlpha = .05; X.fillStyle = '#fff'; for (let k = -2; k < 18; k++) { const sx = ((k * 90 + t * (i ? -10 : 10)) % (W + 200)); X.beginPath(); X.moveTo(sx, 0); X.lineTo(sx + 26, 0); X.lineTo(sx + 26 - 160, H); X.lineTo(sx - 160, H); X.fill() } X.restore()
  });
  const sk = (t > 22 && t < 32) ? (Math.random() - .5) * 8 : 0; X.save(); X.translate(sk, sk);
  const vsFig = (c, pose, x, face, tm) => { if (c.skI && c.skI.complete && c.skI.naturalWidth) { const pu = 1 + Math.sin(tm / 14) * .008; X.save(); X.translate(x, 478); X.scale(1, pu); X.translate(-x, -478); skinBig(c, x, 482, 425, face); X.restore() } else figure(c, pose, x, 470, face, 2.5, tm) };
  vsFig(A, t > 60 ? 'cast' : 'idle', -200 + z * 450, 1, t); TINT = A === B ? 1 : 0; vsFig(B, t > 70 ? 'cast' : 'idle', W + 200 - z * 450, -1, t); TINT = 0; X.restore();
  X.lineJoin = 'round'; [[A, 0], [B, 1]].forEach(([ch, i]) => {
    const px = i ? W - 36 + (1 - z) * 400 : 36 - (1 - z) * 400; X.textAlign = i ? 'right' : 'left'; X.font = 'bold 66px Impact,sans-serif'; X.lineWidth = 9; X.strokeStyle = '#000'; X.strokeText(ch.n.toUpperCase(), px, 96); X.fillStyle = '#fff'; X.fillText(ch.n.toUpperCase(), px, 96);
    X.font = 'bold 16px sans-serif'; X.lineWidth = 4; const sub = (i == 1 && mode == 'arcade' ? 'CPU · ' : i == 1 && mode == 'train' ? 'DUMMY · ' : 'P' + (i + 1) + ' · ') + 'E1: ' + ch.k[1].n; X.strokeText(sub, px, 124); X.fillStyle = '#d9d2c0'; X.fillText(sub, px, 124); X.fillStyle = '#a8935a'; const s2 = 'E2: ' + ch.x[1].n + ' · E3: ' + ch.z[1].n; X.strokeText(s2, px, 146); X.fillText(s2, px, 146)
  });
  const v = t < 22 ? 0 : Math.min(1, (t - 22) / 8); if (v > 0) { X.save(); X.translate(W / 2, 270); const s = 1 + (1 - v) * 3.2; X.scale(s, s); X.globalAlpha = v; X.textAlign = 'center'; X.font = 'bold 150px Impact,sans-serif'; X.lineWidth = 16; X.strokeStyle = '#2a0505'; X.strokeText('VS', 0, 50); const lg = X.createLinearGradient(0, -60, 0, 60); lg.addColorStop(0, '#d8cfae'); lg.addColorStop(1, '#8c4a22'); X.fillStyle = lg; X.fillText('VS', 0, 50); X.restore() }
  X.fillStyle = 'rgba(0,0,0,.65)'; X.fillRect(0, 496, W, 44); X.textAlign = 'center'; X.fillStyle = '#fff'; X.font = 'bold 20px sans-serif';
  X.fillText('📍 ' + STGN[stg] + (mode == 'arcade' ? '   ·   COMBATE ' + (arcI + 1) + ' DE ' + arc.length : mode == 'train' ? '   ·   ENTRENAMIENTO' : ''), W / 2, 525)
}
function drawArcEnd() {
  X.fillStyle = '#050508'; X.fillRect(0, 0, W, H); const g = X.createRadialGradient(W / 2, 300, 40, W / 2, 300, 520); g.addColorStop(0, 'rgba(140,40,25,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H); drawPt();
  X.textAlign = 'center'; X.lineJoin = 'round'; X.font = 'bold 72px Impact,sans-serif'; X.lineWidth = 10; X.strokeStyle = '#2a0505'; X.strokeText('¡ARCADE COMPLETADO!', W / 2, 100); X.fillStyle = '#a8935a'; X.fillText('¡ARCADE COMPLETADO!', W / 2, 100);
  figure(R[cur[0]], 'cast', W / 2, 450, 1, 2.2, tt); X.font = 'bold 36px Impact,sans-serif'; X.lineWidth = 6; X.strokeStyle = '#000'; X.strokeText(R[cur[0]].n.toUpperCase() + ' derrotó a los ' + arc.length + ' rivales', W / 2, 496); X.fillStyle = '#fff'; X.fillText(R[cur[0]].n.toUpperCase() + ' derrotó a los ' + arc.length + ' rivales', W / 2, 496);
  if ((tt / 30 | 0) % 2 == 0) { X.font = '18px sans-serif'; X.fillStyle = '#ddd'; X.fillText('Pulsa ' + padBtn('p') + ' para volver al menú', W / 2, 526) }
}
const pctS = v => Math.round(v * 100) + '%';
const optItems = () => [['Sonido general', snd ? 'SÍ' : 'NO'], ['Volumen música', pctS(volM), volM], ['Volumen efectos', pctS(volF), volF], ['Gritos de personajes', voz ? 'SÍ' : 'NO'], ['Sangre', bld ? 'ACTIVADA' : 'DESACTIVADA'], ['Vibración del mando', vib ? 'SÍ' : 'NO'], ['Bloom / HD', bloomOn ? 'ACTIVADO' : 'DESACTIVADO'], ['Escenario', stgOpt ? STGN[stgOpt - 1] : 'Aleatorio'], ['Controles (teclas y mando)', ''], ['Movimientos de los luchadores', ''], ['Volver', '']];
const stepV = (v, d, wrap) => { let n = Math.round(v * 10) + d; if (n > 10) n = wrap ? 0 : 10; if (n < 0) n = 0; return n / 10 };
const TDESC = ['Duelo local: dos jugadores con mando', 'Sube de rango venciendo a la CPU', 'Practica combos contra un dummy', 'Sonido, voces, gráficos y controles'];
let tPress = false, ldT = 0, spT = 0, spDone = false;   // spT/spDone: intro "Casa Fénix presenta"
const loaded = () => ldT++ > 420 || R.every(r => r.img.complete && (!r.fr || r.fr.every(i => i.complete)));
const clamp01 = v => Math.max(0, Math.min(1, v));
// ---- Pantalla de título profesional
function tpath(x, y, w, h, sk) { X.beginPath(); X.moveTo(x + sk, y); X.lineTo(x + w, y); X.lineTo(x + w - sk, y + h); X.lineTo(x, y + h); X.closePath() }
function titleStage(op) {
  const gd = X.createLinearGradient(0, 0, 0, H); gd.addColorStop(0, '#030305'); gd.addColorStop(.42, '#0d0b12'); gd.addColorStop(.72, '#200b10'); gd.addColorStop(1, '#09050a'); X.fillStyle = gd; X.fillRect(0, 0, W, H);
  X.save(); X.globalCompositeOperation = 'lighter';
  const gl = X.createRadialGradient(W / 2, 200, 10, W / 2, 200, 420); gl.addColorStop(0, 'rgba(140,38,20,.34)'); gl.addColorStop(.5, 'rgba(100,20,25,.14)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = gl; X.fillRect(0, 0, W, H);
  X.translate(W / 2, 205);
  for (let i = 0; i < 14; i++) { const an = i * (Math.PI * 2 / 14) + tt / 700; X.fillStyle = 'rgba(160,90,60,' + (.035 + .02 * Math.sin(tt / 50 + i)) + ')'; X.beginPath(); X.moveTo(0, 0); X.lineTo(Math.cos(an) * 900, Math.sin(an) * 900); X.lineTo(Math.cos(an + .1) * 900, Math.sin(an + .1) * 900); X.closePath(); X.fill() }
  X.restore();
  // FONDO: los luchadores como una imagen continua, medio opaca, sin marcos (2 filas; la de abajo va centrada y desfasada)
  const nR = R.length, c1 = Math.ceil(nR / 2), c2 = nR - c1, pw = W / c1, ph = H / 2;
  R.forEach((ch, i) => {
    const r2 = i >= c1 ? 1 : 0, j = r2 ? i - c1 : i, cx = (r2 ? (W - c2 * pw) / 2 : 0) + j * pw + pw / 2, y0 = r2 * ph;
    const ek = clamp01((tt - 40 - i * 3) / 30), eo = 1 - Math.pow(1 - ek, 3); if (eo <= 0) return;
    const gy0 = y0 + (1 - eo) * 30, gh = ph, col = ch.c || '#888';
    X.save(); X.globalAlpha *= eo;
    const rg = X.createRadialGradient(cx, gy0 + gh * .55, 4, cx, gy0 + gh * .55, gh * .7); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');   // halo suave de su color (sin bordes)
    X.save(); X.globalAlpha *= .32 + .08 * Math.sin(tt / 45 + i); X.fillStyle = rg; X.fillRect(cx - gh * .7, gy0 - gh * .2, gh * 1.4, gh * 1.4); X.restore();
    const im = ch.skI && ch.skI.complete && ch.skI.naturalWidth ? ch.skI : null, pi = ch.img && ch.img.complete && ch.img.naturalWidth ? ch.img : null;
    X.imageSmoothingQuality = 'medium'; X.globalAlpha *= .55;
    if (im) { const hh = gh * (1.02 + .012 * Math.sin(tt / 38 + i * 1.7)), ww = hh * im.naturalWidth / im.naturalHeight; X.drawImage(im, cx - ww / 2, gy0 + gh - hh, ww, hh) }
    else if (pi) { const d = gh * .6; X.drawImage(pi, cx - d / 2, gy0 + gh - d, d, d) }
    X.restore()
  });
  // oscurecer para que el logo y el menú se lean (más oscuro en el centro)
  X.fillStyle = 'rgba(6,2,8,.42)'; X.fillRect(0, 0, W, H);
  const cg = X.createRadialGradient(W / 2, 300, 60, W / 2, 300, 420); cg.addColorStop(0, 'rgba(0,0,0,.62)'); cg.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = cg; X.fillRect(0, 0, W, H);
  // oscurecer bordes para dar profundidad
  const vg = X.createRadialGradient(W / 2, H * .45, 150, W / 2, H * .45, 640); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.86)'); X.fillStyle = vg; X.fillRect(0, 0, W, H);
  const bt2 = X.createLinearGradient(0, 400, 0, H); bt2.addColorStop(0, 'rgba(0,0,0,0)'); bt2.addColorStop(1, 'rgba(0,0,0,.55)'); X.fillStyle = bt2; X.fillRect(0, 400, W, H - 400);
}
let LGc = null;
function buildLogo() {
  const c = document.createElement('canvas'); c.width = 760 * 2; c.height = 250 * 2; const g = c.getContext('2d'); g.scale(2, 2); g.textAlign = 'center'; g.lineJoin = 'round'; g.textBaseline = 'alphabetic';
  const line = (t, size, y, sp) => {
    g.font = 'italic ' + size + 'px Impact, "Arial Black", sans-serif'; try { g.letterSpacing = sp + 'px' } catch (e) { }
    for (let d = 10; d >= 1; d--) { g.fillStyle = 'rgb(' + (70 - d * 3) + ',' + (8) + ',' + (12) + ')'; g.fillText(t, 380 + d * .7, y + d) }
    g.lineWidth = 14; g.strokeStyle = '#12040a'; g.strokeText(t, 380, y);
    const gr = g.createLinearGradient(0, y - size * .8, 0, y); gr.addColorStop(0, '#fffbd6'); gr.addColorStop(.42, '#ffc21a'); gr.addColorStop(.5, '#8c4a22'); gr.addColorStop(1, '#d42a0c'); g.fillStyle = gr; g.fillText(t, 380, y);
    g.lineWidth = 1.4; g.strokeStyle = 'rgba(255,255,255,.55)'; g.strokeText(t, 380, y - 1)
  };
  line('FÉNIX', 84, 92, 10); line('FIGHT', 122, 214, 6); return c
}
// ---------- INTRO: CASA FÉNIX PRESENTA ----------
function drawSplash() {
  const t = spT, cx = W / 2, e1 = clamp01((t - 20) / 45), e2 = clamp01((t - 85) / 30), fade = 1 - clamp01((t - 190) / 25);
  X.fillStyle = '#05020a'; X.fillRect(0, 0, W, H);
  const g = X.createRadialGradient(cx, 262, 10, cx, 262, 470); g.addColorStop(0, 'rgba(255,110,20,' + (.42 * clamp01(t / 60) * fade) + ')'); g.addColorStop(.55, 'rgba(150,20,40,' + (.18 * clamp01(t / 60) * fade) + ')'); g.addColorStop(1, 'rgba(5,2,10,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.save(); X.globalCompositeOperation = 'lighter';   // brasas que suben
  for (let i = 0; i < 90; i++) {
    const h1 = ((i * 9301 + 49297) % 233280) / 233280, h2 = ((i * 7919 + 1237) % 10007) / 10007, sp = .5 + h1 * 1.9, y = H + 12 - ((t * sp + h2 * 700) % (H + 40)), x = h1 * W + Math.sin(t / 28 + i) * 16, r = .8 + h2 * 2.6;
    X.globalAlpha = clamp01(1 - (H - y) / H * .9) * .85 * clamp01(t / 30) * fade; X.fillStyle = i % 3 ? '#ff9a2e' : '#ffd36b'; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill()
  }
  X.restore();
  X.save(); X.globalAlpha = fade; X.textAlign = 'center';
  // alas de luz que se abren
  X.save(); X.globalCompositeOperation = 'lighter'; X.translate(cx, 232);
  for (let sd = -1; sd <= 1; sd += 2) for (let i = 0; i < 5; i++) {
    const len = (240 - i * 34) * e1, rot = -.05 - i * .13 - (1 - e1) * .5; X.save(); X.scale(sd, 1); X.rotate(rot);
    const gr = X.createLinearGradient(0, 0, Math.max(1, len), 0); gr.addColorStop(0, 'rgba(255,225,120,.85)'); gr.addColorStop(.5, 'rgba(255,110,20,.5)'); gr.addColorStop(1, 'rgba(190,20,40,0)'); X.fillStyle = gr; X.globalAlpha = fade * e1 * .8;
    X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(len * .5, -len * .24 - i * 5, len, -8 - i * 6); X.quadraticCurveTo(len * .55, -len * .06 + 8, 0, 10); X.closePath(); X.fill(); X.restore()
  }
  X.restore();
  // texto
  X.font = 'italic 78px Impact, sans-serif'; try { X.letterSpacing = (4 + (1 - e1) * 34) + 'px' } catch (e) { }
  X.globalAlpha = fade * e1; X.lineJoin = 'round'; X.lineWidth = 9; X.strokeStyle = '#1a0408'; X.shadowColor = 'rgba(255,110,20,.9)'; X.shadowBlur = 28; X.strokeText('CASA FÉNIX', cx, 262);
  const tg = X.createLinearGradient(0, 205, 0, 265); tg.addColorStop(0, '#fff3c4'); tg.addColorStop(.5, '#ffb300'); tg.addColorStop(1, '#e65100'); X.fillStyle = tg; X.shadowBlur = 0; X.fillText('CASA FÉNIX', cx, 262);
  const sw = ((t - 70) % 90) / 90; if (t > 70 && sw < .5) { const sx = cx - 260 + sw / .5 * 520; X.save(); X.beginPath(); X.rect(cx - 260, 195, 520, 80); X.clip(); X.globalCompositeOperation = 'lighter'; const sg = X.createLinearGradient(sx - 40, 0, sx + 40, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = sg; X.fillRect(sx - 40, 195, 80, 80); X.restore() }
  X.globalAlpha = fade * e2; X.fillStyle = '#fff'; X.font = 'bold 15px sans-serif'; try { X.letterSpacing = '12px' } catch (e) { } X.fillText('P R E S E N T A', cx + 6, 312);
  [[-1], [1]].forEach(([d]) => { const x0 = cx + d * 150, gr = X.createLinearGradient(x0, 0, x0 + d * 170 * e2, 0); gr.addColorStop(0, 'rgba(168,147,90,.85)'); gr.addColorStop(1, 'rgba(168,147,90,0)'); X.fillStyle = gr; X.fillRect(Math.min(x0, x0 + d * 170 * e2), 307, 170 * e2, 2) });
  if (t > 40) { X.globalAlpha = fade * (.35 + .25 * Math.sin(t / 14)); X.fillStyle = '#fff'; X.font = '11px sans-serif'; try { X.letterSpacing = '2px' } catch (e) { } X.fillText('PULSA CUALQUIER BOTÓN PARA SALTAR', cx, 506) }
  X.restore();
  if (t < 12) { X.fillStyle = 'rgba(0,0,0,' + (1 - t / 12) + ')'; X.fillRect(0, 0, W, H) }
}
function drawLogo(op) {
  if (!LGc) LGc = buildLogo(); const k = clamp01((tt - 28) / 45), e = 1 - Math.pow(1 - k, 3), by = Math.sin(tt / 40) * 2.5;
  if (op <= 0 || e <= 0) return;
  X.save(); X.translate(W / 2, 112 + by); X.globalAlpha = e * op; const z = 1 + (1 - e) * .7; X.scale(z, z);
  // alas de fénix (resplandor)
  X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = e * op * .5;
  for (let sd = -1; sd <= 1; sd += 2) for (let i = 0; i < 6; i++) {
    const len = 270 - i * 28, rot = -.04 - i * .115 + Math.sin(tt / 34 + i * .4) * .025; X.save(); X.scale(sd, 1); X.translate(120, -6 + i * 4); X.rotate(rot);
    const gr = X.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, 'rgba(255,215,90,.9)'); gr.addColorStop(.45, 'rgba(255,110,20,.55)'); gr.addColorStop(1, 'rgba(190,20,40,0)'); X.fillStyle = gr;
    X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(len * .5, -len * .26 - i * 6, len, -10 - i * 7); X.quadraticCurveTo(len * .55, -len * .08 + 10, 0, 12); X.closePath(); X.fill(); X.restore()
  }
  X.restore();
  // sombra de resplandor + logo con brillo que cruza
  X.save(); X.shadowColor = 'rgba(255,110,20,.85)'; X.shadowBlur = 30; X.drawImage(LGc, -190, -104, 380, 125 * 2 - 0); X.restore();
  const ph = ((tt - 90) % 260) / 260; if (tt > 90 && ph < .45) {
    const t2 = document.createElement('canvas'); t2.width = LGc.width; t2.height = LGc.height; const g = t2.getContext('2d'); g.drawImage(LGc, 0, 0); g.globalCompositeOperation = 'source-atop';
    const sx = -200 + ph / .45 * 1700, gr = g.createLinearGradient(sx, 0, sx + 260, 400); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, t2.width, t2.height);
    X.drawImage(t2, -190, -104, 380, 250)
  }
  X.restore()
}
const PSCOL = { '✕': '#8ab4ff', '○': '#ff7a7a', '□': '#ff9ad5', '△': '#6fe0b0' };   // colores de los botones de PS4
function chips(items, y, cx, sm) {
  X.save(); X.font = 'bold ' + (sm ? 9 : 11) + 'px sans-serif'; X.textAlign = 'left'; try { X.letterSpacing = '1px' } catch (e) { }
  const ws = items.map(([k, t]) => { const kw = X.measureText(k).width + 14, tw = X.measureText(t.toUpperCase()).width; return [kw, tw] }), tot = ws.reduce((a, [k, t]) => a + k + t + (sm ? 16 : 30), 0) - (sm ? 6 : 14); let x = (cx == null ? W / 2 : cx) - tot / 2;
  items.forEach(([k, t], i) => {
    const [kw, tw] = ws[i]; X.fillStyle = 'rgba(255,255,255,.08)'; X.strokeStyle = 'rgba(180,170,150,.28)'; X.lineWidth = 1; X.beginPath(); X.roundRect(x, y - 13, kw, 18, 5); X.fill(); X.stroke();
    X.fillStyle = PSCOL[k] || '#fff'; X.fillText(k, x + 7, y); X.fillStyle = 'rgba(255,255,255,.7)'; X.fillText(t.toUpperCase(), x + kw + 8, y); x += kw + tw + (sm ? 16 : 30)
  }); X.restore()
}
function menuBtn(label, val, bar, x, y, w, h, on) {
  const sk = 12, pulse = .5 + .5 * Math.sin(tt / 14);
  X.save();
  if (on) {
    X.shadowColor = 'rgba(150,30,25,' + (.45 + .25 * pulse) + ')'; X.shadowBlur = 18; const gr = X.createLinearGradient(x, y, x + w, y); gr.addColorStop(0, '#6b1618'); gr.addColorStop(.6, '#471012'); gr.addColorStop(1, '#2a090b'); X.fillStyle = gr; tpath(x - 8, y - 2, w + 16, h + 4, sk); X.fill(); X.shadowBlur = 0;
    X.fillStyle = 'rgba(255,255,255,.07)'; tpath(x - 8, y - 2, w + 16, (h + 4) * .45, sk); X.fill();
    X.strokeStyle = '#8f7a3a'; X.lineWidth = 1.2; tpath(x - 8, y - 2, w + 16, h + 4, sk); X.stroke(); X.fillStyle = '#eee4cf'
  } else {
    X.fillStyle = 'rgba(8,8,10,.72)'; tpath(x, y, w, h, sk); X.fill(); X.strokeStyle = 'rgba(180,170,150,.16)'; X.lineWidth = 1; X.stroke(); X.fillStyle = 'rgba(214,208,196,.8)'
  }
  X.font = 'italic bold ' + (h > 38 ? 21 : 16) + 'px Impact, "Arial Black", sans-serif'; try { X.letterSpacing = '2px' } catch (e) { }
  X.textBaseline = 'middle'; X.textAlign = val !== '' || bar != null ? 'left' : 'center'; const ty = y + h / 2 + 1;
  X.fillText(label.toUpperCase(), val !== '' || bar != null ? x + 22 : x + w / 2, ty);
  if (val !== '') { X.textAlign = 'right'; X.font = 'bold 13px sans-serif'; X.fillText(val, x + w - 20, ty) }
  if (bar != null) { for (let i = 0; i < 10; i++) { X.fillStyle = i < Math.round(bar * 10) ? (on ? '#eee4cf' : '#8f7a3a') : (on ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.1)'); X.fillRect(x + w - 190 + i * 11, ty - 6, 8, 12) } }
  if (on && bar == null && val === '') { X.fillStyle = '#eee4cf'; X.textAlign = 'center'; const o = Math.sin(tt / 8) * 3; X.beginPath(); X.moveTo(x + 14 + o, ty - 7); X.lineTo(x + 24 + o, ty); X.lineTo(x + 14 + o, ty + 7); X.closePath(); X.fill() }
  X.restore()
}
function drawTitle() {
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  if (tt < 40) {   // pantalla de carga
    const n = R.length * 1, d = R.filter(r => r.img.complete && (!r.fr || r.fr.every(i => i.complete))).length, k = d / n;
    X.fillStyle = '#fff'; X.font = 'bold 13px sans-serif'; X.textAlign = 'center'; try { X.letterSpacing = '4px' } catch (e) { } X.fillText('CARGANDO', W / 2, H / 2 - 12);
    X.fillStyle = 'rgba(255,255,255,.15)'; X.fillRect(W / 2 - 100, H / 2, 200, 3); X.fillStyle = '#8f7a3a'; X.fillRect(W / 2 - 100, H / 2, 200 * k, 3); return
  }
  if (!spDone) { drawSplash(); return }
  const op = clamp01((tt - 40) / 50), opts = sc == 'opts'; X.globalAlpha = op; titleStage(op); drawPt(); X.globalAlpha = 1;
  if (opts) {
    X.fillStyle = 'rgba(2,2,4,.84)'; X.fillRect(0, 0, W, H); X.textAlign = 'center'; X.fillStyle = '#a8935a'; X.font = 'italic 38px Impact, sans-serif'; try { X.letterSpacing = '8px' } catch (e) { } X.fillText('OPCIONES', W / 2, 62);
    const g = X.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0); g.addColorStop(0, 'rgba(168,147,90,0)'); g.addColorStop(.5, 'rgba(168,147,90,.85)'); g.addColorStop(1, 'rgba(168,147,90,0)'); X.fillStyle = g; X.fillRect(W / 2 - 200, 74, 400, 2);
    optItems().forEach(([l, v, b], i) => menuBtn(l, v, b, W / 2 - 230, 92 + i * 39, 460, 33, i == oi));
    chips([['D-PAD ↑ ↓', 'Mover'], ['D-PAD ← →', 'Cambiar'], ['✕', 'Elegir'], ['○', 'Volver']], 520); return
  }
  drawLogo(op);
  // subtítulo con líneas
  const sy = 292, k2 = clamp01((tt - 70) / 30); X.globalAlpha = k2; X.textAlign = 'center'; X.fillStyle = '#fff'; X.font = 'bold 14px sans-serif'; try { X.letterSpacing = '6px' } catch (e) { } X.fillText('CASA FÉNIX  ·  PELEA DE AMIGOS', W / 2 + 3, sy);
  [[-1, W / 2 - 215], [1, W / 2 + 215]].forEach(([d, x]) => { const g = X.createLinearGradient(x, 0, x + d * 150, 0); g.addColorStop(0, 'rgba(168,147,90,.85)'); g.addColorStop(1, 'rgba(168,147,90,0)'); X.fillStyle = g; X.fillRect(Math.min(x, x + d * 150), sy - 5, 150, 2) }); X.globalAlpha = 1;
  if (tt < 100) return;
  const mk2 = clamp01((tt - 100) / 25);
  if (!tPress) {   // "pulsa para comenzar" (también activa el audio del navegador)
    X.globalAlpha = mk2; const bl = .55 + .45 * Math.sin(tt / 12); X.textAlign = 'center'; X.fillStyle = 'rgba(0,0,0,.45)'; X.beginPath(); X.roundRect(W / 2 - 190, 346, 380, 44, 22); X.fill();
    X.fillStyle = 'rgba(255,255,255,' + bl + ')'; X.font = 'italic bold 20px Impact, sans-serif'; try { X.letterSpacing = '5px' } catch (e) { } X.fillText('PULSA UN BOTÓN', W / 2 + 2, 375);
    X.fillStyle = 'rgba(255,255,255,.55)'; X.font = '11px sans-serif'; try { X.letterSpacing = '1px' } catch (e) { } X.fillText('Pulsa ✕ en tu mando · activa también el sonido', W / 2, 410); X.globalAlpha = 1;
  } else {
    X.globalAlpha = mk2; ['1 vs 1', 'Arcade (vs CPU)', 'Entrenamiento', 'Opciones'].forEach((t, i) => { const on = i == mi, w = on ? 340 : 316; menuBtn(t, '', null, W / 2 - w / 2 + (on ? 0 : 0), 312 + i * 44, w, 36, on) }); X.globalAlpha = 1;
    X.textAlign = 'center'; X.fillStyle = 'rgba(255,255,255,.75)'; X.font = 'italic 13px sans-serif'; try { X.letterSpacing = '1px' } catch (e) { } X.fillText(TDESC[mi], W / 2, 494);
  }
  chips([['D-PAD ↑ ↓', 'Mover'], ['✕', 'Elegir'], ['○', 'Volver']], 522);
  X.fillStyle = 'rgba(255,255,255,.35)'; X.font = '10px sans-serif'; X.textAlign = 'left'; try { X.letterSpacing = '1px' } catch (e) { } X.fillText('v5.0', 14, 530); X.textAlign = 'right'; X.fillText('© CASA FÉNIX', W - 14, 530)
}
const selHelp = () => mode == 'arcade' ? 'ARCADE: elige tu luchador · ' + padBtn('p') + ' = listo · ' + padBtn('k') + ' = volver' : mode == 'train' ? 'ENTRENAMIENTO: elige tu luchador y luego el dummy · ' + padBtn('p') + ' = listo' : 'Elijan luchador a la vez · ' + padBtn('p') + ' = listo · ' + padBtn('k') + ' = cancelar';
const selBanner = () => mode == 'arcade' ? R[cur[0]].n.toUpperCase() + '  ·  ARCADE' : R[cur[0]].n.toUpperCase() + '  VS  ' + R[cur[1]].n.toUpperCase();
function setupArcade() {
  const pool = R.map((_, i) => i).filter(i => i != cur[0]); for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[pool[i], pool[j]] = [pool[j], pool[i]] }
  arc = pool.slice(0, 5); arcI = 0; arcCont = 3; cur[1] = arc[0]
}
function startMatch(skip) {
  F = [mk(0, R[cur[0]]), mk(1, R[cur[1]])]; round = 1; stains = []; cin = null; uaf = null; tr.last = tr.cd = 0; tr.t = 999;
  stg = pickStage(); startRound(); if (skip) { sc = 'fight'; riv = null } else { sc = 'vs'; vsT = 0; sfx('ultra'); speak(F[0].ch.n + ' contra ' + F[1].ch.n, null, { force: 1, ann: 1 }) }
}
function afterMatch() {
  if (mode == 'arcade') {
    if (F[0].wins >= 2) { if (arcI >= arc.length - 1) { sc = 'arcend'; tt = 0; sfx('ultra'); return } arcI++; cur[1] = arc[arcI]; startMatch(); return }
    if (arcCont > 0) { arcCont--; startMatch(); return }
    sc = 'title'; mi = 0; tt = 140; mode = 'vs'; return
  }
  sc = 'sel'
}
const overHint = () => mode == 'arcade' ? (F[0].wins >= 2 ? 'Pulsa ' + padBtn('p') + ': siguiente rival' : arcCont > 0 ? 'Pulsa ' + padBtn('p') + ': reintentar (' + arcCont + ' continuaciones)' : 'Fin del Arcade · pulsa ' + padBtn('p') + ' para salir') : 'Pulsa ' + padBtn('p') + ' para volver a elegir';

// ---------- ESCENARIO (se dibuja una vez en un canvas aparte) ----------
function buildBG() {
  const c = document.createElement('canvas'); c.width = W * S; c.height = H * S; const g = c.getContext('2d'); g.scale(S, S);
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
const STG = [{ n: STGN[0], bg: BG, anim: animCity }, { n: STGN[1], bg: stageSnow(), anim: animSnow }, { n: STGN[2], bg: stageHarbor(), anim: animHarbor }, { n: STGN[3], bg: stageVolcano(), anim: animVolcano }];

// ---------- ESCENARIOS CON FOTO (v6.1) ----------
// Cada foto está en img/stages/: <clave>.jpg (imagen), <clave>_m.png (máscara: lo transparente es CIELO, que se redibuja animado),
// <clave>_s.png (capa de follaje/ramas que se mece con el viento). Al cargar se compone todo en un canvas.
const cloudSprite = rgb => { const c = document.createElement('canvas'); c.width = 360; c.height = 120; const g = c.getContext('2d');
  [[100, 70, 60], [170, 55, 70], [240, 68, 58], [135, 80, 50], [210, 82, 52], [60, 86, 34], [296, 86, 34]].forEach(([x, y, r]) => { const q = g.createRadialGradient(x, y, 2, x, y, r); q.addColorStop(0, 'rgba(' + rgb + ',.95)'); q.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2) }); return c };
const fogSprite = (() => { const c = document.createElement('canvas'); c.width = 400; c.height = 90; const g = c.getContext('2d'); g.translate(200, 45); g.scale(1, .22);
  const q = g.createRadialGradient(0, 0, 4, 0, 0, 200); q.addColorStop(0, 'rgba(235,240,245,.9)'); q.addColorStop(1, 'rgba(235,240,245,0)'); g.fillStyle = q; g.fillRect(-200, -200, 400, 400); return c })();
const wrapN = (v, m) => ((v % m) + m) % m;
function fxBirds(t, n, y0, y1, col) {
  X.save(); X.strokeStyle = col || '#1a1f2e'; X.lineWidth = 2; X.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = wrapN(t * (30 + i * 9) + i * 190, W + 160) - 80, y = y0 + (y1 - y0) * sr(i, 8) + Math.sin(t * 1.6 + i) * 7, w = Math.sin(t * 9 + i * 2) * 6;
    X.beginPath(); X.moveTo(x - 9, y - w); X.quadraticCurveTo(x - 3, y - 3, x, y); X.quadraticCurveTo(x + 3, y - 3, x + 9, y - w); X.stroke() }
  X.restore()
}
function fxRays(t, rgb, n, k) {
  X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const x0 = 30 + i * (W / n) + Math.sin(t * .25 + i) * 30, w = 36 + 30 * sr(i, 1), q = X.createLinearGradient(x0, 0, x0 + 200, GY);
    q.addColorStop(0, 'rgba(' + rgb + ',' + (k || 1) * (.1 + .05 * Math.sin(t * .6 + i * 2)) + ')'); q.addColorStop(1, 'rgba(' + rgb + ',0)'); X.fillStyle = q;
    X.beginPath(); X.moveTo(x0, -10); X.lineTo(x0 + w, -10); X.lineTo(x0 + w + 240, GY); X.lineTo(x0 + 150, GY); X.closePath(); X.fill() }
  X.restore()
}
function fxDust(t, n, rgb) {
  X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = 'rgb(' + (rgb || '255,244,214') + ')';
  for (let i = 0; i < n; i++) { const x = wrapN(sr(i, 2) * W + t * (4 + 6 * sr(i, 3)) + Math.sin(t * .7 + i) * 14, W), y = wrapN(sr(i, 5) * (GY + 40) - t * (3 + 5 * sr(i, 6)), GY + 40);
    X.globalAlpha = .25 + .35 * Math.sin(t * 1.5 + i * 3) ** 2; X.beginPath(); X.arc(x, y, 1 + sr(i, 7) * 1.4, 0, 7); X.fill() }
  X.restore()
}
function fxLeaves(t, n, cols, wind) {
  X.save();
  for (let i = 0; i < n; i++) { const x = wrapN(sr(i, 1) * W + t * (wind || 14) * (.6 + sr(i, 2)) + Math.sin(t * 1.2 + i) * 22, W + 20) - 10, y = wrapN(sr(i, 3) * (GY + 90) + t * (22 + sr(i, 4) * 26), GY + 90) - 20;
    X.save(); X.translate(x, y); X.rotate(t * (1 + sr(i, 5) * 2) + i); X.scale(1, .45 + .55 * Math.abs(Math.sin(t * 2 + i))); X.fillStyle = cols[i % cols.length];
    X.beginPath(); X.ellipse(0, 0, 4.5 + sr(i, 6) * 2, 2.4, 0, 0, 7); X.fill(); X.restore() }
  X.restore()
}
function fxMist(t, n, a) {
  X.save();
  for (let i = 0; i < n; i++) { const w = 480 + sr(i, 4) * 300, x = wrapN(sr(i, 1) * (W + 700) + t * (5 + 4 * sr(i, 2)), W + 700) - 350, y = GY - 36 + sr(i, 3) * 90;
    X.globalAlpha = (a || .16) * (.65 + .35 * Math.sin(t * .4 + i * 2)); X.drawImage(fogSprite, x, y, w, w * .225) }
  X.restore()
}
function fxButterflies(t, n) {
  X.save();
  for (let i = 0; i < n; i++) { const x = W * (.3 + .4 * sr(i, 1)) + Math.sin(t * .35 + i * 2.1) * 260, y = 250 + sr(i, 2) * 80 + Math.sin(t * .9 + i) * 50 + Math.sin(t * 2.3 + i) * 8, fl = Math.abs(Math.sin(t * 13 + i * 3)), col = ['#ffd54f', '#fff', '#ff9800'][i % 3];
    X.translate(x, y); X.fillStyle = col; X.strokeStyle = 'rgba(0,0,0,.35)'; X.lineWidth = 1; [-1, 1].forEach(s => { X.beginPath(); X.ellipse(s * 3.2 * fl, 0, 3.6 * fl + .6, 5, s * .35, 0, 7); X.fill(); X.stroke() }); X.translate(-x, -y) }
  X.restore()
}
const PANEL = [[498, 377], [616, 303], [951, 227], [870, 304], [658, 401]];
function fxGlint(t) {
  X.save(); X.globalCompositeOperation = 'lighter';
  const sg = X.createRadialGradient(900, 50, 10, 900, 50, 300), pg = .22 + .1 * Math.sin(t * .8); sg.addColorStop(0, 'rgba(255,248,210,' + pg + ')'); sg.addColorStop(1, 'rgba(255,248,210,0)'); X.fillStyle = sg; X.fillRect(500, 0, 460, 330);
  X.save(); X.beginPath(); PANEL.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.clip();
  const ph = (t % 5.5) / 5.5, cx = 420 + ph * 640, q = X.createLinearGradient(cx - 80, 372, cx + 80, 316);
  q.addColorStop(0, 'rgba(255,255,255,0)'); q.addColorStop(.5, 'rgba(255,255,255,.55)'); q.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = q; X.fillRect(460, 200, 520, 230);
  X.restore();
  const sp = Math.max(0, Math.sin(t * 1.5)) ** 5; if (sp > .02) { const [px, py] = PANEL[2], L = 38 * sp; X.globalAlpha = sp; X.strokeStyle = '#fff'; X.lineWidth = 2; X.beginPath(); X.moveTo(px - L, py); X.lineTo(px + L, py); X.moveTo(px, py - L); X.lineTo(px, py + L); X.stroke();
    const sq = X.createRadialGradient(px, py, 1, px, py, 22 * sp + 4); sq.addColorStop(0, 'rgba(255,255,255,.9)'); sq.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = sq; X.beginPath(); X.arc(px, py, 22 * sp + 4, 0, 7); X.fill() }
  X.restore()
}
const STK = 1.4;   // los escenarios con foto se componen a 1,4x (más nítidos con la cámara cerca)
const mkcK = () => { const c = document.createElement('canvas'); c.width = W * S * STK; c.height = H * S * STK; const g = c.getContext('2d'); g.scale(S * STK, S * STK); g.imageSmoothingQuality = 'high'; return [c, g] };
function photoStage(key, name, o) {
  const [c, g] = mkcK(), st = { n: name, bg: c, key, sw: null, ready: false }, cs = cloudSprite(o.cloud || '255,255,255');
  g.fillStyle = '#16141c'; g.fillRect(0, 0, W, H);   // marcador mientras cargan las imágenes
  const ld = s => { const i = new Image(); i.src = s; return i }, base = ld('img/stages/' + key + '.jpg'), msk = ld('img/stages/' + key + '_m.png'), swi = o.sway ? ld('img/stages/' + key + '_s.png') : null, need = swi ? 3 : 2; let n = 0;
  const done = () => {
    if (++n < need) return;
    g.clearRect(0, 0, W, H); g.drawImage(base, 0, 0, W, H); g.globalCompositeOperation = 'destination-in'; g.drawImage(msk, 0, 0, W, H); g.globalCompositeOperation = 'source-over';
    if (swi) { const [c2, g2] = mkcK(); g2.drawImage(base, 0, 0, W, H); g2.globalCompositeOperation = 'destination-in'; g2.drawImage(swi, 0, 0, W, H); st.sw = c2 }
    st.ready = true
  };
  [base, msk, swi].forEach(i => { if (i) { i.onload = done; i.onerror = () => { } } });
  st.pre = t => {   // cielo animado (queda DETRÁS de la foto, se ve por donde la máscara es transparente)
    X.fillStyle = grad(X, 0, GY, [[0, o.sky[0]], [1, o.sky[1]]]); X.fillRect(0, 0, W, H);
    for (let i = 0; i < (o.cl || 0); i++) { const w = 200 + sr(i, 2) * 240, x = wrapN(sr(i, 1) * (W + 500) + t * (o.sp || 6) * (.5 + sr(i, 4)), W + 500) - 250, y = sr(i, 3) * (o.cy || 100) - 30; X.globalAlpha = .55 + .4 * sr(i, 5); X.drawImage(cs, x, y, w, w / 3) }
    X.globalAlpha = 1
  };
  st.anim = t => {
    if (st.sw && o.sway) {   // viento: el follaje se desplaza por franjas, más arriba = más movimiento
      const top = H * .78, hS = 18; for (let y = 0; y < top; y += hS) { const k = 1 - y / top, off = (Math.sin(t * 1.4 + y * .018 + (o.ph || 0)) + .5 * Math.sin(t * 2.7 + y * .03)) * o.sway * (.35 + k);
        X.drawImage(st.sw, 0, y * S * STK, W * S * STK, hS * S * STK, off, y, W, hS) }
    }
    if (window.darkPhoto) darkPhoto(t, o.full); else if (o.fx) o.fx(t);   // dark.js: escenarios oscuros, sin luces ni partículas
    X.fillStyle = 'rgba(8,8,26,' + (o.dim || .1) + ')'; X.fillRect(0, 0, W, o.full ? H : GY)   // oscurece apenas el fondo para que los luchadores resalten
  };
  return st
}
// ---------- ESCENARIOS NUEVOS (dibujados por código) ----------
function stageDojo() {
  const [c, g] = mkc();
  g.fillStyle = grad(g, 0, GY, [[0, '#1a0c08'], [1, '#3a1a10']]); g.fillRect(0, 0, W, GY);
  for (let i = 0; i < 9; i++) { const x = 20 + i * 108, gl = g.createLinearGradient(0, 70, 0, 330); gl.addColorStop(0, 'rgba(255,214,150,.9)'); gl.addColorStop(1, 'rgba(255,160,80,.55)'); g.fillStyle = gl; g.fillRect(x, 70, 90, 260);   // pantallas shoji iluminadas
    g.strokeStyle = '#2a1208'; g.lineWidth = 4; g.strokeRect(x, 70, 90, 260); g.lineWidth = 2; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x + k * 30, 70); g.lineTo(x + k * 30, 330); g.stroke() } for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(x, 70 + k * 43); g.lineTo(x + 90, 70 + k * 43); g.stroke() } }
  g.fillStyle = '#4a1e0e'; g.fillRect(0, 40, W, 30); g.fillRect(0, 330, W, 30); g.fillStyle = '#2a1008'; g.fillRect(0, 36, W, 6); g.fillRect(0, 356, W, 6);
  [0, 330, 640, 960].forEach(x => { g.fillStyle = '#5a2210'; g.fillRect(x - 14, 0, 28, GY); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 6, 0, 8, GY) });   // columnas rojas
  const cx = 480, cy = 238, cg = g.createRadialGradient(cx, cy, 20, cx, cy, 120); cg.addColorStop(0, 'rgba(255,190,80,.5)'); cg.addColorStop(1, 'rgba(255,120,0,0)'); g.fillStyle = cg; g.fillRect(cx - 130, cy - 130, 260, 260);   // estandarte del fénix
  g.fillStyle = '#7a0a10'; g.beginPath(); g.arc(cx, cy, 74, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#d9a73a'; g.stroke();
  g.fillStyle = '#ffb300'; [-1, 1].forEach(s => { g.save(); g.translate(cx, cy + 6); g.scale(s, 1); g.beginPath(); g.moveTo(6, 34); g.quadraticCurveTo(70, 20, 66, -50); g.quadraticCurveTo(44, -20, 30, -34); g.quadraticCurveTo(34, -6, 16, -14); g.quadraticCurveTo(18, 8, 4, 8); g.closePath(); g.fill(); g.restore() });
  g.fillStyle = '#ffe9a8'; g.beginPath(); g.ellipse(cx, cy + 4, 7, 36, 0, 0, 7); g.fill();
  g.fillStyle = grad(g, GY, H, [[0, '#6b3a1c'], [1, '#2a1409']]); g.fillRect(0, GY, W, H - GY);   // tatami / madera
  for (let i = 0; i < 16; i++) { const x = i * 64 - 20; g.strokeStyle = 'rgba(20,8,2,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(480 + (x - 480) * .55, GY); g.lineTo(480 + (x - 480) * 1.9, H); g.stroke() }
  for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(20,8,2,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, GY + 6 + i * i * 3.2); g.lineTo(W, GY + 6 + i * i * 3.2); g.stroke() }
  g.fillStyle = grad(g, GY, GY + 20, [[0, 'rgba(0,0,0,.55)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, GY, W, 20); return c
}
function animDojo(t) {
  X.save(); X.globalCompositeOperation = 'lighter';
  [60, 250, 480, 710, 900].forEach((x, i) => { const fl = .75 + .25 * Math.sin(t * 7 + i * 2) + .1 * Math.sin(t * 17 + i), y = 40 + (i % 2) * 8;   // faroles
    X.strokeStyle = '#2a1008'; X.lineWidth = 2; X.beginPath(); X.moveTo(x, 0); X.lineTo(x, y); X.stroke();
    const q = X.createRadialGradient(x, y + 22, 3, x, y + 22, 90 * fl); q.addColorStop(0, 'rgba(255,170,60,.7)'); q.addColorStop(1, 'rgba(255,90,0,0)'); X.fillStyle = q; X.fillRect(x - 100, y - 70, 200, 200);
    X.fillStyle = 'rgba(255,90,40,' + (.8 * fl) + ')'; X.beginPath(); X.ellipse(x, y + 22, 13, 18, 0, 0, 7); X.fill(); X.fillStyle = 'rgba(255,230,160,' + (.7 * fl) + ')'; X.beginPath(); X.ellipse(x, y + 22, 6, 11, 0, 0, 7); X.fill() });
  for (let i = 0; i < 26; i++) { const p = (t * (.04 + sr(i, 3) * .06) + sr(i, 2)) % 1; X.globalAlpha = Math.sin(p * 3.14) * .55; X.fillStyle = '#ffd9a0'; X.beginPath(); X.arc(sr(i, 1) * W + Math.sin(t + i) * 10, GY - p * 360, 1 + sr(i, 4) * 1.6, 0, 7); X.fill() }
  X.restore()
}
function stageNeon() {
  const [c, g] = mkc();
  g.fillStyle = grad(g, 0, GY, [[0, '#0a0620'], [.55, '#241046'], [1, '#5a1a5e']]); g.fillRect(0, 0, W, GY);
  for (let L = 0; L < 2; L++) { const n = L ? 11 : 16, col = L ? '#120a2a' : '#1c0f3c'; for (let i = 0; i < n; i++) { const w = L ? 96 : 66, x = i * (W / n) - 10 + sr(i, L) * 12, h = (L ? 210 : 150) + sr(i, 5 + L) * (L ? 150 : 110), y = GY - h;   // edificios
      g.fillStyle = col; g.fillRect(x, y, w, h);
      for (let wy = y + 14; wy < GY - 20; wy += 18) for (let wx = x + 8; wx < x + w - 10; wx += 14) if (sr(wx * 3 + wy, i) > (L ? .55 : .72)) { g.fillStyle = sr(wx, wy) > .5 ? 'rgba(255,214,120,.85)' : 'rgba(120,220,255,.8)'; g.fillRect(wx, wy, 7, 9) } } }
  const sign = (x, y, w, h, col, txt, rot) => { g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.shadowColor = col; g.shadowBlur = 22; g.strokeStyle = col; g.lineWidth = 4; g.strokeRect(-w / 2, -h / 2, w, h); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = col; g.font = 'bold ' + (h * .6 | 0) + 'px Impact,sans-serif'; g.textAlign = 'center'; g.fillText(txt, 0, h * .22); g.restore() };
  sign(150, 150, 130, 44, '#ff2d95', 'RAMEN'); sign(790, 120, 150, 46, '#18e6ff', 'FÉNIX'); sign(470, 90, 110, 38, '#ffd400', 'BAR'); sign(880, 250, 40, 100, '#ff2d95', '24H', 0); sign(60, 270, 40, 90, '#18e6ff', '武道', 0);
  g.fillStyle = grad(g, GY, H, [[0, '#15102a'], [.4, '#0c0818'], [1, '#05040c']]); g.fillRect(0, GY, W, H - GY);   // calle mojada
  [[150, '#ff2d95'], [790, '#18e6ff'], [470, '#ffd400']].forEach(([x, col]) => { const q = g.createLinearGradient(0, GY, 0, H); q.addColorStop(0, col + '88'); q.addColorStop(1, col + '00'); g.fillStyle = q; g.fillRect(x - 60, GY, 120, H - GY) });
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(0, GY + 12 + i * i * 1.1); g.lineTo(W, GY + 12 + i * i * 1.1); g.stroke() }
  g.fillStyle = grad(g, GY, GY + 18, [[0, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, GY, W, 18); return c
}
function animNeon(t) {
  X.save(); X.globalCompositeOperation = 'lighter';
  [[150, '255,45,149'], [790, '24,230,255'], [470, '255,212,0']].forEach(([x, col], i) => { const fl = Math.sin(t * 24 + i * 3) > .93 ? .15 : 1; const q = X.createRadialGradient(x, 130, 4, x, 130, 150); q.addColorStop(0, 'rgba(' + col + ',' + .3 * fl + ')'); q.addColorStop(1, 'rgba(' + col + ',0)'); X.fillStyle = q; X.fillRect(x - 160, 0, 320, 330) });
  X.strokeStyle = 'rgba(180,200,255,.5)'; X.lineWidth = 1.2; for (let i = 0; i < 110; i++) { const sp = 7 + sr(i, 2) * 6, x = (sr(i, 1) * (W + 200) - t * 40 * 0 + (t * sp * 22) * 0) , y = ((sr(i, 3) * H + t * 520 * (.7 + sr(i, 2) * .6)) % (H + 40)) - 20, xx = (x - y * .22 + W) % W; X.globalAlpha = .25 + sr(i, 4) * .4; X.beginPath(); X.moveTo(xx, y); X.lineTo(xx - 3.5, y + 18); X.stroke() }
  for (let i = 0; i < 5; i++) { const p = (t * .35 + i * .21) % 1, x = 120 + i * 190 + sr(i, 1) * 40; X.globalAlpha = (1 - p) * .55; X.strokeStyle = i % 2 ? '#18e6ff' : '#ff2d95'; X.lineWidth = 1.4; X.save(); X.translate(x, GY + 40 + (i % 3) * 18); X.scale(1, .22); X.beginPath(); X.arc(0, 0, 8 + p * 40, 0, 7); X.stroke(); X.restore() }
  X.restore()
}
function stageBamboo() {
  const [c, g] = mkc();
  g.fillStyle = grad(g, 0, GY, [[0, '#cfe9d0'], [.55, '#9ccfa6'], [1, '#4f9a6a']]); g.fillRect(0, 0, W, GY);
  const sun = g.createRadialGradient(700, 110, 6, 700, 110, 170); sun.addColorStop(0, 'rgba(255,255,230,1)'); sun.addColorStop(.25, 'rgba(255,250,200,.55)'); sun.addColorStop(1, 'rgba(255,250,200,0)'); g.fillStyle = sun; g.fillRect(500, 0, 400, 330);
  [[.45, '#7fb99a', 190], [.7, '#5f9d7f', 150], [1, '#3f7f64', 110]].forEach(([a, col, h]) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= W; x += 16) g.lineTo(x, GY - h - Math.abs(Math.sin(x * .007 * a + a * 5) * 60 + Math.sin(x * .019 + a) * 18)); g.lineTo(W, GY); g.fill() });
  const stalk = (x, w, h, col, dk) => { g.fillStyle = col; g.fillRect(x, GY - h, w, h); g.fillStyle = dk; g.fillRect(x + w * .72, GY - h, w * .28, h); for (let y = GY - h + 30; y < GY; y += 56 + (x % 13)) { g.fillStyle = dk; g.fillRect(x - 2, y, w + 4, 5) } };
  for (let i = 0; i < 26; i++) stalk(i * 38 - 10 + sr(i, 1) * 18, 9, GY + 40 - sr(i, 2) * 40, '#69ad83', '#4a8a63');   // fondo
  for (let i = 0; i < 14; i++) stalk(i * 74 + sr(i, 3) * 30, 15, GY + 90, '#4f9a6b', '#337a50');
  g.fillStyle = grad(g, GY, H, [[0, '#46783a'], [.5, '#2f5a2c'], [1, '#1c3a1c']]); g.fillRect(0, GY, W, H - GY);
  for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(' + (60 + sr(i, 2) * 40 | 0) + ',' + (110 + sr(i, 3) * 50 | 0) + ',50,.55)'; g.beginPath(); g.ellipse(sr(i, 1) * W, GY + 6 + sr(i, 4) * (H - GY), 22, 4, 0, 0, 7); g.fill() }
  for (let i = 0; i < 4; i++) { g.fillStyle = '#8f8f94'; g.beginPath(); g.ellipse(150 + i * 230, GY + 14, 30, 9, 0, 0, 7); g.fill(); g.fillStyle = '#b4b4ba'; g.beginPath(); g.ellipse(150 + i * 230, GY + 10, 24, 6, 0, 0, 7); g.fill() }
  [[40, 0], [900, 0]].forEach(([x]) => stalk(x, 26, GY + 150, '#3f8a5c', '#256b43'));   // bambúes gruesos del borde
  g.fillStyle = grad(g, GY, GY + 16, [[0, 'rgba(0,0,0,.5)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, GY, W, 16); return c
}
function animBamboo(t) {
  fxRays(t, '255,250,210', 5, .8); fxMist(t, 8, .2); fxLeaves(t, 16, ['#8fbf3c', '#bfe06a', '#5f9d3a'], 16); fxDust(t, 14, '255,255,220')
}
function stageDesert() {
  const [c, g] = mkc();
  g.fillStyle = grad(g, 0, GY, [[0, '#2a1646'], [.35, '#9a3a5e'], [.7, '#ff8a3c'], [1, '#ffd27a']]); g.fillRect(0, 0, W, GY);
  const sun = g.createRadialGradient(480, GY - 40, 8, 480, GY - 40, 220); sun.addColorStop(0, 'rgba(255,250,210,1)'); sun.addColorStop(.18, 'rgba(255,214,120,.9)'); sun.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = sun; g.fillRect(180, 0, 600, GY);
  [['#7a2e4e', .5, 130, 40], ['#5a2040', .8, 95, 70], ['#3a1530', 1, 60, 110]].forEach(([col, a, h, gap], k) => { g.fillStyle = col; for (let i = 0; i < 6; i++) { const w = 120 + sr(i, k) * 120, x = i * 190 - 50 + sr(i, k + 3) * 60, hh = h + sr(i, k + 6) * 70; g.beginPath(); g.moveTo(x, GY); g.lineTo(x + 14, GY - hh); g.lineTo(x + w - 14, GY - hh); g.lineTo(x + w, GY); g.fill() } });   // mesetas
  g.fillStyle = '#2a0f26'; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= W; x += 14) g.lineTo(x, GY - 34 - Math.sin(x * .011) * 22 - Math.sin(x * .031) * 8); g.lineTo(W, GY); g.fill();
  const cactus = (x, s) => { g.fillStyle = '#1b0f20'; g.fillRect(x - 7 * s, GY - 120 * s, 14 * s, 124 * s); g.fillRect(x - 30 * s, GY - 84 * s, 10 * s, 40 * s); g.fillRect(x - 30 * s, GY - 84 * s, 30 * s, 10 * s); g.fillRect(x + 20 * s, GY - 100 * s, 10 * s, 42 * s); g.fillRect(x, GY - 100 * s, 30 * s, 10 * s) };
  cactus(120, 1); cactus(820, 1.15); cactus(930, .7);
  g.fillStyle = grad(g, GY, H, [[0, '#c9763a'], [.4, '#a85a2a'], [1, '#6e3418']]); g.fillRect(0, GY, W, H - GY);
  for (let i = 0; i < 70; i++) { g.strokeStyle = 'rgba(255,200,130,' + (.07 + sr(i, 2) * .1) + ')'; g.lineWidth = 2; g.beginPath(); const y = GY + 6 + sr(i, 3) * (H - GY); g.moveTo(sr(i, 1) * W, y); g.quadraticCurveTo(sr(i, 1) * W + 40, y - 5, sr(i, 1) * W + 90, y); g.stroke() }
  g.fillStyle = grad(g, GY, GY + 16, [[0, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, GY, W, 16); return c
}
function animDesert(t) {
  X.save(); X.globalCompositeOperation = 'lighter'; const q = X.createRadialGradient(480, GY - 40, 10, 480, GY - 40, 260 + 10 * Math.sin(t * 1.5)); q.addColorStop(0, 'rgba(255,230,160,.35)'); q.addColorStop(1, 'rgba(255,120,40,0)'); X.fillStyle = q; X.fillRect(150, 0, 660, GY + 60); X.restore();
  fxBirds(t, 4, 40, 150, '#2a0f26');
  X.save(); X.fillStyle = 'rgba(255,214,150,.5)'; for (let i = 0; i < 46; i++) { const sp = 60 + sr(i, 2) * 90, x = (sr(i, 1) * W + t * sp) % W, y = GY + 10 + sr(i, 3) * 90 + Math.sin(t * 3 + i) * 4; X.globalAlpha = .25 + sr(i, 4) * .4; X.fillRect(x, y, 8 + sr(i, 5) * 14, 1.4) } X.restore();
  X.save(); X.globalAlpha = .06; for (let k = 0; k < 4; k++) { X.fillStyle = '#ffe0a0'; X.fillRect(0, GY - 14 + k * 6 + Math.sin(t * 2 + k) * 3, W, 2) } X.restore()
}

STGN.push('Facultad de Ingeniería', 'Patio de Otoño', 'Patio de Invierno', 'La Casa', 'Dojo Fénix', 'Barrio Neón', 'Bosque de Bambú', 'Desierto del Ocaso');
STG.push(
  photoStage('facultad', STGN[4], { sky: ['#5f98e0', '#cfe5f8'], cl: 6, cy: 60, sp: 7, sway: 1.6, fx: t => { fxBirds(t, 4, 30, 90); fxRays(t, '255,244,200', 4); fxDust(t, 26) } }),
  photoStage('otono', STGN[5], { sky: ['#c8cfdc', '#dfe3ea'], sway: 2, ph: 1, fx: t => { fxLeaves(t, 30, ['#e0832b', '#c9501c', '#e8b83a', '#a86a1e', '#7d8a2a'], 18); fxRays(t, '255,226,170', 3, .6); fxDust(t, 14) } }),
  photoStage('invierno', STGN[6], { sky: ['#c9cbc8', '#dcdcd6'], sway: 1.4, ph: 2, dim: .14, fx: t => { fxMist(t, 8, .2); fxLeaves(t, 9, ['#6b4a2b', '#8a6a3a', '#4f3b24'], 10); fxDust(t, 10, '230,236,245') } }),
  photoStage('casa', STGN[7], { sky: ['#6fa4e6', '#cfe5f8'], sway: 1.8, ph: 3, dim: .2, full: 1, fx: t => { fxButterflies(t, 3); fxLeaves(t, 8, ['#8fbf3c', '#c6d84a'], 12); fxDust(t, 28) } }),
  { n: STGN[8], bg: stageDojo(), anim: animDojo }, { n: STGN[9], bg: stageNeon(), anim: animNeon }, { n: STGN[10], bg: stageBamboo(), anim: animBamboo }, { n: STGN[11], bg: stageDesert(), anim: animDesert },
);
function pickStage() {
  const nStd = STG.length;
  if (stgOpt) return stgOpt - 1;
  return mode == 'arcade' ? arcI % nStd : (Math.random() * nStd) | 0
}
function drawClouds(t) {
  X.save(); X.fillStyle = 'rgba(255,190,150,.16)';
  [[0, 70, 150], [330, 120, 200], [620, 50, 170], [800, 150, 130]].forEach(([o, y, w], i) => {
    const x = ((o + t * (6 + i * 2)) % (W + 400)) - 200; X.beginPath(); X.ellipse(x, y, w, 16, 0, 0, 7); X.ellipse(x + w * .4, y - 10, w * .55, 14, 0, 0, 7); X.ellipse(x - w * .4, y + 4, w * .5, 12, 0, 0, 7); X.fill()
  }); X.restore()
}
// Overlay de depuración (F3): verde = hurtbox, azul = pushbox, rojo = hitbox (sólida cuando está ACTIVA)
function drawDebug() {
  const C0 = Combat.Config; X.save(); X.lineWidth = 2;
  F.forEach(f => {
    X.strokeStyle = '#00e676'; X.strokeRect(f.x - C0.HURT_HALF, f.y - 150, C0.HURT_HALF * 2, 150);
    X.strokeStyle = '#40c4ff'; X.beginPath(); X.moveTo(f.x - C0.PUSH_DIST / 2, f.y + 6); X.lineTo(f.x + C0.PUSH_DIST / 2, f.y + 6); X.stroke();
    const a = f.atk; if (!a) return; const r = a.reachNow(), y0 = f.y - a.mv.tipY - 12;
    X.fillStyle = a.isActive ? 'rgba(255,23,68,.55)' : 'rgba(255,23,68,.12)'; X.strokeStyle = '#ff1744';
    X.fillRect(Math.min(f.x, f.x + f.face * r), y0, Math.abs(r), 24); X.strokeRect(Math.min(f.x, f.x + f.face * a.reach), y0, a.reach, 24);
    X.fillStyle = '#fff'; X.font = '11px monospace'; X.textAlign = 'center'; X.fillText(a.phase + ' ' + a.t + '/' + a.total, f.x, y0 - 6)
  });
  X.restore()
}
function draw() {
  X.setTransform(S, 0, 0, S, 0, 0); X.save(); X.clearRect(0, 0, W, H);
  if (shake > 0 && !paused) { const [ox, oy] = Combat.Juice.shakeOffset(shake, shakeDir); X.translate(ox, oy); shake = Combat.Juice.shakeDecay(shake) }   // decaimiento exponencial + empujón en la dirección del golpe
  if (sc == 'combos') { drawCombos(R[cc], cp); X.restore(); return }
  if (sc == 'ctrl') { drawCtrl(); X.restore(); return }
  if (sc == 'title' || sc == 'opts') { drawTitle(); X.restore(); return }
  if (sc == 'sel') { drawSel(); X.restore(); return }
  if (sc == 'vs') { drawVS(); X.restore(); return }
  if (sc == 'story') { drawStory(); X.restore(); return }
  if (sc == 'arcend') { drawArcEnd(); X.restore(); return }
  const now = performance.now() / 1000;
  // cámara: sigue el punto medio y se acerca cuando los luchadores están cerca
  const mid = (F[0].x + F[1].x) / 2, dist = Math.abs(F[0].x - F[1].x), tz = 1 + (1 - Math.max(0, Math.min(1, (dist - 100) / 700))) * .6;   // cámara tipo MK: más cerca cuando pelean de cerca
  const lo = win && F[1 - win.w].hp <= 0 ? F[1 - win.w] : null, koOn = !!lo && (state == 'ko' || state == 'over') && bt < 60;
  if (!paused) { cam.z += (tz - cam.z) * .06; cam.x += (mid - cam.x) * .08; camP = camP < .002 ? 0 : camP * .9; camF.w *= .9; koK += ((koOn ? 1 : 0) - koK) * (koOn ? .1 : .06) }
  const zz = cam.z + camP + koK * .32, cxT = cam.x + (camF.x - cam.x) * .55 * camF.w, cxK = lo ? cxT + (lo.x - cxT) * koK : cxT;   // zoom total y foco (impacto → víctima, K.O. → perdedor)
  const hw = W / 2 / zz, cx = Math.max(hw, Math.min(W - hw, cxK)); CAMZ = zz; CAMX = cx;
  X.save(); X.translate(W / 2, 400); X.scale(zz, zz); X.translate(-cx, -400);
  const sg_ = STG[stg]; if (sg_.pre) sg_.pre(now); X.drawImage(sg_.bg, 0, 0, W, H); sg_.anim(now);
  X.save(); const dk_ = !!sg_.dk; if (perfLv < 1) { X.globalCompositeOperation = 'saturation'; X.fillStyle = dk_ ? 'rgba(110,110,110,.18)' : 'rgba(110,110,110,.42)'; X.fillRect(0, 0, W, H); X.globalCompositeOperation = 'source-over' } X.fillStyle = dk_ ? 'rgba(4,2,8,.1)' : 'rgba(4,4,10,.4)'; X.fillRect(0, 0, W, H); X.restore();   // tono oscuro y apagado del escenario (el HUD y los luchadores quedan nítidos)
  X.save(); X.translate(0, FOOT);   // mundo de luchadores: pisan el piso, no su borde
  stains.forEach(q => { X.globalAlpha = .75; X.fillStyle = '#6d0000'; X.beginPath(); X.ellipse(q.x, q.y, q.r * 1.7, q.r * .5, 0, 0, 7); X.fill() }); X.globalAlpha = 1;
  // aviso de ataques de área (círculo en el suelo que se llena)
  fx.forEach(z => {
    if (!z.m) return; const pr = 1 - z.t / z.m, R = Math.min(z.o.r, 420), c = z.o.col && z.o.col != '#000' ? z.o.col : '#b388ff';
    X.save(); X.translate(z.f.x, GY + 4); X.scale(1, .22); X.globalAlpha = .12 + .25 * pr; X.fillStyle = c; X.beginPath(); X.arc(0, 0, R * (.4 + .6 * pr), 0, 7); X.fill();
    X.globalAlpha = .6 * pr; X.lineWidth = 6; X.strokeStyle = '#fff'; X.beginPath(); X.arc(0, 0, R * (.4 + .6 * pr), 0, 7); X.stroke();
    X.setLineDash([22, 16]); X.lineDashOffset = -z.t * 3; X.lineWidth = 5; X.globalAlpha = .75 * pr + .15; X.strokeStyle = c; X.beginPath(); X.arc(0, 0, R * (.4 + .6 * pr) * .72, 0, 7); X.stroke(); X.setLineDash([]); X.restore()
  });
  // aviso de la Tala Ilegal: sombra del árbol sobre el rival
  trees.forEach(z => {
    if (z.t <= 0) return; const pr = 1 - z.t / z.m;
    const SR = z.o.mansion ? 150 : 90; X.save(); X.translate(z.e.x, GY + 4); X.scale(1, .22); X.globalAlpha = .15 + .35 * pr; X.fillStyle = '#1b0f0a'; X.beginPath(); X.arc(0, 0, SR * (.45 + .55 * pr), 0, 7); X.fill();
    X.globalAlpha = .6 * pr; X.lineWidth = 6; X.strokeStyle = z.o.mansion ? '#ffcc80' : '#a5d6a7'; X.beginPath(); X.arc(0, 0, SR * (.45 + .55 * pr), 0, 7); X.stroke(); X.restore()
  });
  // estela de dash
  gh.forEach(q => { X.save(); X.globalAlpha = q.l / q.m * .4; if (q.draw) q.draw(X, q); else drawFrame(q.ch, q.fi, q.x, q.y, q.face, 1, q.sx, q.sy, q.rot); X.restore() });
  F.forEach(drawF); Combat.Ribbons.draw(X); if (Combat.debug) drawDebug();
  trucksDraw(); vehsDraw(); barrierDraw();
  trees.forEach(z => {
    const { f, e } = z;
    if (z.o.mansion) {
      if (z.t > 0) { const p = 1 - z.t / z.m, by = -330 + (GY + 330) * p * p; mansionArt(e.x, by, 1, 1) }
      else { const q = 1 - z.land / 42, sq = q < .18 ? 1 - .1 * Math.sin(q / .18 * Math.PI) : 1; mansionArt(z.lx, GY, sq, z.land > 28 ? 1 : Math.max(0, z.land / 28)) }
      return
    }
    if (z.t > 0) {   // vuelo: lo lanza sobre la cabeza, gira y apunta siempre al rival
      const p = 1 - z.t / z.m, k = p * p * (3 - 2 * p), tx = e.x, ty = e.y - 70;
      treeArt(z.sx + (tx - z.sx) * k, z.sy + (ty - z.sy) * k - Math.sin(p * Math.PI) * 120, f.face * (p * 2.5 * Math.PI - .35 * (1 - p)), .8, 1)
    } else {         // caído: se desploma al suelo y se desvanece
      const q = 1 - z.land / 42, fall = Math.min(1, q * 3.2), y = z.ly + (GY - 14 - z.ly) * (1 - (1 - fall) * (1 - fall));
      treeArt(z.lx, y, f.face * Math.PI / 2, .8, Math.min(1, z.land / 14))
    }
  });
  proj.forEach(p => {
    projTrail(p); if (p.o.sp || p.o.gl) { projArt(p); return }
    const c = p.o.col || p.f.ch.c; X.fillStyle = c; X.globalAlpha = .9; X.beginPath(); X.ellipse(p.x, p.y, p.w / 2, 18, 0, 0, 7); X.fill(); X.globalAlpha = 1; X.strokeStyle = '#fff'; X.lineWidth = 2; X.stroke();
    X.save(); X.globalCompositeOperation = 'lighter'; const r = Math.max(p.w / 2, 18) * 1.7, g = X.createRadialGradient(p.x, p.y, 2, p.x, p.y, r); g.addColorStop(0, '#fff'); g.addColorStop(.35, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = g; X.beginPath(); X.arc(p.x, p.y, r, 0, 7); X.fill(); X.restore()
  });
  if (dog) { X.save(); X.font = '44px sans-serif'; X.textAlign = 'center'; X.translate(dog.x, GY); X.scale(dog.dir, 1); X.fillText('🐕', 0, 0); X.restore() }
  drawPt(); drawUltAfter(); X.restore();
  if (!paused) toasts = toasts.filter(t => t.l-- > 0); toasts.forEach(t => {
    X.save(); X.fillStyle = '#fff'; X.strokeStyle = '#000'; X.lineWidth = 4; X.lineJoin = 'round'; X.font = 'bold 20px sans-serif'; X.textAlign = 'center';
    const tw = X.measureText(t.t).width + 16, hwv = W / 2 / zz, px = Math.max(cx - hwv + tw / 2 / zz, Math.min(cx + hwv - tw / 2 / zz, t.f.x));   // dentro de lo que se ve del mapa
    const y = Math.max(400 + (150 - 400) / zz, Math.min(t.f.y + FOOT - 200 - (70 - t.l) * .6, 400 + (210 - 400) / zz));   // bajo el HUD y sobre las cabezas
    X.translate(px, y); X.scale(1 / zz, 1 / zz); X.globalAlpha = Math.min(1, t.l / 15) * .9; X.strokeText(t.t, 0, 0); X.fillText(t.t, 0, 0); X.restore()
  });
  X.restore();
  if (bloomOn && perfLv < 1) bloom(.28);
  // ---- pantalla ----
  if (danger > .05 && sc == 'fight') { const pl = .55 + .45 * Math.sin(performance.now() / 260), vg = X.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); vg.addColorStop(0, 'rgba(255,0,0,0)'); vg.addColorStop(1, 'rgba(200,0,20,' + (.38 * danger * pl) + ')'); X.fillStyle = vg; X.fillRect(0, 0, W, H) }
  if (flashT > 0) { X.globalAlpha = flashT / 14; X.fillStyle = flashC; X.fillRect(0, 0, W, H); X.globalAlpha = 1; if (!paused) flashT-- }
  if (dark > 0) { if (!paused) dark--; X.fillStyle = '#000'; X.fillRect(0, 0, W, H); X.fillStyle = '#fff'; X.font = 'bold 30px sans-serif'; X.textAlign = 'center'; X.fillText('💥 ¡PAM! ¡CRASH! 🍻 💥', W / 2, H / 2) }
  X.drawImage(VIG, 0, 0);
  F.forEach(bar); timerBox(); drawModeHud();
  F.forEach((e, j) => { if (e.cb >= 2 && e.cbt > 0) { X.save(); X.textAlign = 'center'; X.font = 'bold ' + (34 + Math.min(e.cb, 8) * 2) + 'px Impact,sans-serif'; X.lineWidth = 6; X.lineJoin = 'round'; X.strokeStyle = '#000'; const cx = j ? 120 : W - 120; X.strokeText(e.cb + ' HITS', cx, 150); X.fillStyle = '#ffd600'; X.fillText(e.cb + ' HITS', cx, 150);
    const rk = e.cb >= 12 ? ['LEGENDARIO', '#e040fb'] : e.cb >= 8 ? ['BRUTAL', '#ff1744'] : e.cb >= 5 ? ['GREAT', '#ff9100'] : e.cb >= 3 ? ['NICE', '#fff176'] : null;
    if (rk) { X.font = 'italic bold 30px Impact,sans-serif'; X.lineWidth = 5; X.strokeText(rk[0], cx, 184); X.fillStyle = rk[1]; X.fillText(rk[0], cx, 184) } X.restore() } });
  if (F.some(f => f.hp > 0 && f.hp < f.mhp * .2) && state == 'go') { X.globalAlpha = .07 + .05 * Math.sin(now * 6); X.fillStyle = '#f00'; X.fillRect(0, 0, W, H); X.globalAlpha = 1 }
  if (state == 'cine' && cin) { drawCine(); if (bloomOn && perfLv < 1) bloom(.5) }
  const rivOn = state == 'intro' && riv && riv.on; if (rivOn) drawRiv();
  if (state != 'go' && state != 'cine' && !rivOn) {
    const txt = state == 'intro' && stT < 20 ? '¡PELEEN!' : msg, e = Math.min(1, bt / 12), sc2 = 1 + (1 - e) * (1 - e) * 1.4;
    X.fillStyle = 'rgba(0,0,0,' + (.4 * e) + ')'; X.fillRect(0, 98, W, 46);
    X.save(); X.translate(W / 2, 135); X.scale(sc2, sc2); X.globalAlpha = e; X.textAlign = 'center'; X.font = 'bold 38px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 7; X.strokeStyle = '#b71c1c'; X.strokeText(txt, 0, 0);
    const lg = X.createLinearGradient(0, -38, 0, 4); lg.addColorStop(0, '#fff59d'); lg.addColorStop(1, '#ff9800'); X.fillStyle = lg; X.fillText(txt, 0, 0); X.restore();
    if ((state == 'ko' || state == 'over') && bt < 90) {
      const k = Math.min(1, bt / 8), j = bt < 18 ? (Math.random() - .5) * 8 : 0; X.save(); X.translate(W / 2 + j, 180 + j); X.scale(1 + (1 - k) * 1.5, 1 + (1 - k) * 1.5); X.globalAlpha = k * Math.min(1, (90 - bt) / 25) * .92;
      X.textAlign = 'center'; X.font = 'bold 52px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 10; X.strokeStyle = '#000'; X.strokeText('K.O.', 0, 0); X.fillStyle = '#ff1744'; X.fillText('K.O.', 0, 0); X.restore()
    }
    if (perf && state == 'ko' && bt > 22 && bt < 150) {
      const k = Math.min(1, (bt - 22) / 10), gl = .6 + .4 * Math.sin(bt / 4); X.save(); X.translate(W / 2, 266); X.scale(1 + (1 - k) * 1.3, 1 + (1 - k) * 1.3); X.globalAlpha = k * Math.min(1, (150 - bt) / 25) * .9; X.textAlign = 'center'; X.font = 'italic bold 32px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 7; X.strokeStyle = '#000'; X.shadowColor = '#ffd600'; X.shadowBlur = 24 * gl;
      X.strokeText('\u00a1PERFECT!', 0, 0); const pg = X.createLinearGradient(0, -44, 0, 4); pg.addColorStop(0, '#fffde7'); pg.addColorStop(.5, '#ffd600'); pg.addColorStop(1, '#ff6d00'); X.fillStyle = pg; X.fillText('\u00a1PERFECT!', 0, 0); X.restore()
    }
    if (state == 'intro') { X.font = 'italic 20px sans-serif'; X.fillStyle = '#fff'; X.textAlign = 'center'; X.globalAlpha = e; X.fillText(sub, W / 2, 168); X.globalAlpha = 1 }
    if (state == 'over' && win) {
      if (win.t >= 40) { const L = F[1 - win.w], k = Math.min(1, (win.t - 40) / 8), j = (Math.random() - .5) * 3; X.save(); X.translate(W / 2 + j, 182 + j); X.scale(1 + (1 - k) * 1.2, 1 + (1 - k) * 1.2); X.globalAlpha = k * .95; X.textAlign = 'center'; X.font = 'bold 38px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 8; X.strokeStyle = '#000'; const tx = '¡CHÚPALO ' + L.ch.n.toUpperCase() + '!'; X.strokeText(tx, 0, 0); X.fillStyle = '#ffeb3b'; X.fillText(tx, 0, 0); X.restore() }
      if (stT <= 0) { X.font = '20px sans-serif'; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText(overHint(), W / 2, 508) }
    }
  }
  drawVictory();
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
// ---------- PANTALLA DE COMBOS (ver las habilidades ocultas de un personaje) ----------
const TK = { p: ['PUÑO', '#e53935'], k: ['PATADA', '#1e88e5'] }, STL = { blind: 'Ciega', slow: 'Ralentiza', stun: 'Aturde', root: 'Inmoviliza', invert: 'Confunde controles', freeze: 'Congela', burn: 'Quema' }, TYL = { P: 'Proyectil', A: 'Golpe de área', D: 'Embestida', T: 'Camión', H: 'Autocuración', G: 'Agarre' };
function cdesc(t, o) {
  const a = [TYL[t] || 'Habilidad']; if (o.d) a.push('Daño ' + o.d + (o.volley ? ' ×' + o.volley : '')); if (o.heal) a.push('Cura ' + o.heal); if (o.st) a.push(STL[o.st[0]] + ' ' + (o.st[1] / 60).toFixed(1) + ' s');
  if (o.drain) a.push('Roba vida'); if (o.up) a.push('Lanza al aire'); if (o.pull) a.push('Atrae al rival'); if (o.clean) a.push('Limpia estados'); if (o.boost) a.push('Más velocidad'); return a.join(' · ')
}
function drawCombos(ch, p, ip) {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d0d12'); g.addColorStop(1, '#030305'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.textAlign = 'center'; X.fillStyle = PCOL[p]; X.font = 'bold 20px sans-serif'; X.fillText('JUGADOR ' + (p + 1) + ' · MOVIMIENTOS', W / 2, 30);
  portrait(ch, 40, 44, 104, 14, PCOL[p], 4); const K = ch.kit;
  X.textAlign = 'left'; X.fillStyle = '#fff'; X.font = 'bold 34px Impact,sans-serif'; X.fillText(ch.n.toUpperCase(), 162, 80);
  X.font = 'italic 15px sans-serif'; X.fillStyle = '#a8935a'; X.fillText('Estilo: ' + (K ? K.st : ''), 162, 104); X.font = '14px sans-serif'; X.fillStyle = '#bbb'; X.fillText('Vida ' + ch.hp + ' · Velocidad ' + ch.s, 162, 126);
  if (!K) return;
  const key = a => KB[p][a] ? keyName(KB[p][a]) : '', U = ULT[ch.id] || {};
  // El control principal es el mando de PS4: se muestra el botón del mando y, pequeño, la tecla equivalente
  const rows = [
    ['E1', 's', '#b39a5a', K.e[0][1].n, K.e[0][1].tx], ['E2', 'x', '#a8693a', K.e[1][1].n, K.e[1][1].tx], ['E3', 'z', '#a8503a', K.e[2][1].n, K.e[2][1].tx],
    ['AGARRE', 'g', '#6f8f78', K.g.n, K.g.tx], ['ULTRA', 'q', '#8a6aa0', U.n || K.u.n, K.u.tx], ['PASIVA', null, '#5b7f99', K.p.n, K.p.tx]];
  rows.forEach((r, i) => {
    const y = 138 + i * 57; X.fillStyle = 'rgba(255,255,255,.07)'; X.beginPath(); X.roundRect(30, y, 900, 54, 10); X.fill();
    X.fillStyle = r[2]; X.beginPath(); X.roundRect(40, y + 6, 132, 42, 8); X.fill(); X.fillStyle = '#0a0a0c'; X.textAlign = 'center';
    if (r[1]) { X.font = 'bold 11px sans-serif'; X.fillText(r[0], 106, y + 19); X.font = 'bold 20px sans-serif'; X.fillText(padBtn(r[1]), 106, y + 41) }
    else { X.font = 'bold 14px sans-serif'; X.fillText(r[0], 106, y + 33) }
    X.textAlign = 'left'; X.fillStyle = r[2]; X.font = 'bold 20px Impact,sans-serif'; X.fillText(r[3], 186, y + 21); X.fillStyle = '#ddd'; X.font = '12px sans-serif';
    wrapLines(r[4] || '', 730).slice(0, 2).forEach((ln, j) => X.fillText(ln, 186, y + 38 + j * 12))
  });
  X.textAlign = 'center'; X.fillStyle = '#ccc'; X.font = '13px sans-serif';
  X.fillText('□ / △ puño rápido / fuerte · ✕ / ○ patada rápida / fuerte · ↓ + puño = uppercut · ↓ + patada = barrida · R2 = bloqueo', W / 2, 492);
  X.fillStyle = '#9aa'; X.font = '12px sans-serif'; X.fillText('Esquivar: ' + padBtn('d') + ' · Asistencia: ' + padBtn('a') + ' · Pausa: OPTIONS', W / 2, 509);
  X.fillStyle = '#fff'; X.font = 'bold 15px sans-serif'; X.fillText(ip ? '↑↓ página de combos · ' + padBtn('p') + ' / ' + padBtn('k') + ': volver a la pausa' : '↑↓ página de combos · ◀ ▶ cambiar personaje · ' + padBtn('p') + ' / ' + padBtn('k') + ': volver', W / 2, 528)
}
// ---------- PAUSA ----------
const PAUSE_ITEMS = ['Reanudar', 'Reiniciar', 'Mis movimientos', 'Salir'];
function drawPause() {
  if (pcb >= 0) { drawCombos(F[pcb].ch, pcb, 1); return }
  X.fillStyle = 'rgba(0,0,0,.78)'; X.fillRect(0, 0, W, H);
  X.textAlign = 'center'; X.fillStyle = '#a8935a'; X.font = 'bold 64px Impact,sans-serif'; X.fillText('PAUSA', W / 2, 170);
  pauseItems().forEach((t, i) => {
    const y = 196 + i * 58;
    X.fillStyle = i == pi ? '#4a1013' : 'rgba(255,255,255,.06)'; X.fillRect(W / 2 - 170, y, 340, 50); if (i == pi) { X.strokeStyle = '#8f7a3a'; X.lineWidth = 1.5; X.strokeRect(W / 2 - 170, y, 340, 50) }
    X.fillStyle = i == pi ? '#eee4cf' : '#a9a9b0'; X.font = 'bold 28px sans-serif'; X.fillText(t, W / 2, y + 35)
  });
  X.fillStyle = '#bbb'; X.font = '16px sans-serif'; X.fillText('D-PAD ↑↓: mover · ' + padBtn('p') + ': elegir · OPTIONS: reanudar', W / 2, 526);
}
function setPause(v) { if (v == paused) return; paused = v; pi = 0; pcb = -1; sfx('ok') }
function pausePressed() {
  const d = !!(keys.Escape || keys.KeyP || pads().some(g => g.buttons[9] && g.buttons[9].pressed)), h = d && !pz.d; pz.d = d; return h
}
addEventListener('blur', () => { if (sc == 'fight' && state != 'over') setPause(true) });
const COLS = 11, PCOL = ['#b3392e', '#4a7a99'];
// Selección extendida: luchadores + PRÓXIMAMENTE (no elegibles, pero se ven en grande) + casilla ALEATORIO
const SOON = [['Bastián', 'bastian', '#c0762b'], ['César', 'cesar', '#8d7a55']].map(([n, id, c]) => { const im = new Image(); im.src = 'img/soon/' + id + '_p.jpg'; const pv = new Image(); pv.src = 'img/soon/' + id + '_pv.jpg'; return { n, id, c, im, pv, soon: 1 } });
const RANDI = R.length + SOON.length, NSEL = RANDI + 1, rolling = [null, null], soonNo = [0, 0];
function startRoll(p) { rolling[p] = { t: 0, N: 36, fin: (Math.random() * R.length) | 0 }; sfx('ok') }
function rollTick(p) {
  const r = rolling[p]; r.t++;
  if (r.t < r.N) { if (r.t % (r.t < 20 ? 2 : r.t < 28 ? 3 : 5) == 0) { let n; do { n = (Math.random() * R.length) | 0 } while (n == cur[p]); cur[p] = n; sfx('nav') } }
  else { cur[p] = r.fin; rolling[p] = null; lock[p] = 1; sfx('ok'); grunt(R[cur[p]], 'shout'); speak('¡' + R[cur[p]].n + '!', R[cur[p]], { force: 1, shout: 1 }) }
}
// Nombres de los botones del mando (PS4) según el mapa actual, para mostrarlos en pantalla
const PSB = ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'SHARE', 'OPTIONS', 'L3', 'R3', '↑', '↓', '←', '→', 'PS'];
const padB1 = a => padBtn(a).split(' / ')[0];
const rawB = a => ((PM[a] || []).map(b => { const n = +b.slice(1); return b[0] == 'b' ? (n >= 100 ? null : PSB[n] || 'Botón ' + n) : null }).filter(Boolean)[0]) || '—';
function padBtn(a) {
  if ((sc != 'fight' || paused) && (a == 'p' || a == 'k')) return a == 'p' ? '✕' : '○';   // en menús: ✕ confirma, ○ vuelve
  const V = { s: 'p', x: 'hp', z: 'k', q: 'hk' };
  if (a == 'x' && sc != 'fight') return rawB('hp');   // en la selección, △ = aleatorio
  if (V[a]) return rawB('mod') + '+' + rawB(V[a]);   // habilidades: L2 + □ / △ / ✕ · definitiva: L2 + ○
  const L = (PM[a] || []).map(b => { const n = +b.slice(1); return b[0] == 'b' ? (n >= 100 ? null : PSB[n] || 'Botón ' + n) : null }).filter(Boolean);
  return L.length ? L.slice(0, 2).join(' / ') : '—'
}
   // sangre / acero (paleta oscura)
const cut = (x, y, w, h, c) => { X.beginPath(); X.moveTo(x + c, y); X.lineTo(x + w, y); X.lineTo(x + w, y + h - c); X.lineTo(x + w - c, y + h); X.lineTo(x, y + h); X.lineTo(x, y + c); X.closePath() };
const rr = (x, y, w, h, r) => { X.beginPath(); X.roundRect(x, y, w, h, r) };
const bar5 = (x, y, w, lab, v, col) => {
  X.textAlign = 'left'; X.fillStyle = 'rgba(255,255,255,.7)'; X.font = 'bold 9px sans-serif'; try { X.letterSpacing = '1px' } catch (e) { } X.fillText(lab, x, y + 7);
  const bx = x + 74, bw = w - 74, k = clamp01(v);
  X.fillStyle = 'rgba(255,255,255,.10)'; rr(bx, y, bw, 7, 3.5); X.fill();
  const g = X.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, col); g.addColorStop(1, '#cfc8b8');
  X.save(); rr(bx, y, bw, 7, 3.5); X.clip(); X.fillStyle = g; X.fillRect(bx, y, bw * k, 7);
  X.fillStyle = 'rgba(255,255,255,.35)'; X.fillRect(bx, y, bw * k, 2.5);
  X.fillStyle = 'rgba(8,6,22,.9)'; for (let i = 1; i < 10; i++) X.fillRect(bx + bw * i / 10 - .5, y, 1.5, 7); X.restore()
};
function panelFrame(x, y, w, h, col, tag, glow) {
  const cx = x + w / 2;
  X.save(); cut(x, y, w, h, 22); X.fillStyle = 'rgba(8,6,22,.88)'; X.fill(); X.clip();
  const sg = X.createRadialGradient(cx, y + 200, 10, cx, y + 200, 230); sg.addColorStop(0, glow + 'bb'); sg.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = sg; X.fillRect(x, y, w, h);
  X.save(); X.globalCompositeOperation = 'lighter'; X.translate(cx, y + 220); for (let i = 0; i < 9; i++) { const an = i * .7 + selT / 260; X.fillStyle = 'rgba(255,255,255,.035)'; X.beginPath(); X.moveTo(0, 0); X.lineTo(Math.cos(an) * 400, Math.sin(an) * 400); X.lineTo(Math.cos(an + .16) * 400, Math.sin(an + .16) * 400); X.fill() } X.restore();
  // foco de suelo bajo el luchador
  X.save(); X.translate(cx, y + 304); X.scale(1, .2); const fg = X.createRadialGradient(0, 0, 4, 0, 0, 130); fg.addColorStop(0, glow + 'cc'); fg.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = fg; X.fillRect(-130, -130, 260, 260); X.restore();
  // degradado inferior para que se lean los textos
  const bf = X.createLinearGradient(0, y + 300, 0, y + h); bf.addColorStop(0, 'rgba(8,6,22,0)'); bf.addColorStop(.35, 'rgba(8,6,22,.88)'); bf.addColorStop(1, 'rgba(8,6,22,.95)'); X.fillStyle = bf; X.fillRect(x, y + 300, w, h - 300);
  // cabecera
  const hg = X.createLinearGradient(0, y, 0, y + 30); hg.addColorStop(0, '#fff'); hg.addColorStop(.12, col); hg.addColorStop(1, col); X.fillStyle = hg; X.fillRect(x, y, w, 30);
  X.fillStyle = 'rgba(0,0,0,.25)'; X.fillRect(x, y + 28, w, 2);
  X.save(); X.globalAlpha = .18; X.fillStyle = '#fff'; for (let i = -1; i < 12; i++) { X.beginPath(); X.moveTo(x + i * 26, y + 30); X.lineTo(x + i * 26 + 10, y + 30); X.lineTo(x + i * 26 + 22, y); X.lineTo(x + i * 26 + 12, y); X.fill() } X.restore();
  X.textAlign = 'center'; X.font = 'italic 17px Impact, sans-serif'; try { X.letterSpacing = '3px' } catch (e) { }
  X.fillStyle = 'rgba(255,255,255,.35)'; X.fillText(tag, cx, y + 23); X.fillStyle = '#10051a'; X.fillText(tag, cx, y + 22);
  // marco interior fino
  cut(x + 6, y + 36, w - 12, h - 42, 16); X.lineWidth = 1; X.strokeStyle = 'rgba(255,255,255,.07)'; X.stroke();
  X.restore();
  cut(x, y, w, h, 22); X.lineWidth = 2.5; X.strokeStyle = col; X.shadowColor = col; X.shadowBlur = 11 + 5 * Math.sin(selT / 18); X.stroke(); X.shadowBlur = 0
}
function arcPanel(x, y, w, h) {
  panelFrame(x, y, w, h, PCOL[1], 'MODO ARCADE', '#1976d2'); const cx = x + w / 2;
  X.textAlign = 'center'; X.fillStyle = '#fff'; X.font = 'italic 44px Impact, sans-serif'; try { X.letterSpacing = '2px' } catch (e) { } X.fillText('5', cx, y + 100);
  X.font = 'bold 13px sans-serif'; X.fillStyle = '#4fc3f7'; try { X.letterSpacing = '4px' } catch (e) { } X.fillText('COMBATES', cx, y + 122);
  ['Rivales al azar', 'Cada rival es más agresivo', '3 continuaciones', 'Esquive · Agarre · ULTRA', 'activos en todos los combates'].forEach((t, i) => { X.fillStyle = i < 3 ? '#fff' : 'rgba(255,255,255,.55)'; X.font = (i < 3 ? 'bold 14px' : '12px') + ' sans-serif'; try { X.letterSpacing = '1px' } catch (e) { } X.fillText(t, cx, y + 170 + i * 30) })
}
function preview(p, ch, x0, y0, w, h) {
  const col = PCOL[p], lk = lock[p], cx = x0 + w / 2, gy = y0 + 300, face = p ? -1 : 1;
  panelFrame(x0, y0, w, h, col, lk ? 'JUGADOR ' + (p + 1) + '  ·  LISTO' : 'JUGADOR ' + (p + 1), ch.c);
  X.save(); cut(x0, y0, w, h, 22); X.clip();
  X.save(); X.translate(cx, y0 + 190); X.rotate(-Math.PI / 2); X.textAlign = 'center'; X.font = 'italic 92px Impact, sans-serif'; X.fillStyle = 'rgba(255,255,255,.055)'; X.fillText(ch.n.toUpperCase(), 0, p ? -30 : 38); X.restore();
  const bob = Math.sin(selT / (lk ? 5 : 12) + p) * (lk ? 4 : 2.5);
  X.fillStyle = 'rgba(0,0,0,.5)'; X.beginPath(); X.ellipse(cx, gy + 4, 78, 12, 0, 0, 7); X.fill();
  if (ch.pvi && ch.pvi.complete && ch.pvi.naturalWidth) {
    const ph = 262, pw = ph * ch.pvi.naturalWidth / ch.pvi.naturalHeight, px = cx - pw / 2, py = gy + bob - ph + 6;
    X.save(); X.beginPath(); X.roundRect(px, py, pw, ph, 10); X.clip(); X.drawImage(ch.pvi, px, py, pw, ph); X.restore();
    X.beginPath(); X.roundRect(px, py, pw, ph, 10); X.lineWidth = 3; X.strokeStyle = lk ? col : ch.c; X.stroke()
  }
  else if (ch.pv && hasSprite(ch)) sprite(ch, cx, gy + bob, 250, face);
  else if (hasAnim(ch)) {
    const S = ch.A.st, u = selT % 90; let fi = S.idle[((selT / 14) | 0) % S.idle.length];
    if (lk && u < 14) fi = S.punch[Math.min(1, S.punch.length - 1)]; else if (lk && u >= 45 && u < 59) fi = S.kick[Math.min(1, S.kick.length - 1)];
    drawFrame(ch, fi, cx, gy + bob, face, 1.7)
  }
  else if (hasSprite(ch)) sprite(ch, cx, gy + bob, 270, face);
  else skin(ch, cx, gy + bob, 1.7, face, { ph: 0, ext: lk ? (Math.sin(selT / 5) > .6 ? 1 : 0) : 0, lean: 0 });
  // nombre
  X.textAlign = 'center'; X.font = 'italic 38px Impact, sans-serif'; try { X.letterSpacing = '2px' } catch (e) { }
  X.lineJoin = 'round'; X.lineWidth = 7; X.strokeStyle = '#10051a'; X.save(); X.shadowColor = col; X.shadowBlur = 14; X.strokeText(ch.n.toUpperCase(), cx, y0 + 334); X.restore(); const gr = X.createLinearGradient(0, y0 + 306, 0, y0 + 336); gr.addColorStop(0, '#fff'); gr.addColorStop(1, col); X.fillStyle = gr; X.fillText(ch.n.toUpperCase(), cx, y0 + 334);
  // habilidad / especial con etiqueta
  const tagLine = (lab, txt, yy, c, tc) => {
    X.font = 'bold 11px sans-serif'; try { X.letterSpacing = '1px' } catch (e) { }
    const tw = X.measureText(txt).width, lw = 34, sx = cx - (lw + 8 + tw) / 2;
    X.fillStyle = c; rr(sx, yy - 11, lw, 15, 4); X.fill(); X.fillStyle = '#10051a'; X.textAlign = 'center'; X.fillText(lab, sx + lw / 2 + .5, yy);
    X.textAlign = 'left'; X.fillStyle = tc; X.fillText(txt, sx + lw + 8, yy); X.textAlign = 'center'
  };
  tagLine(padB1('s'), ch.k[1].n.toUpperCase(), y0 + 345, '#b39a5a', '#e8dcc0'); tagLine(padB1('x'), ch.x[1].n.toUpperCase(), y0 + 358, '#a8693a', '#e0c4a8'); tagLine(padB1('z'), ch.z[1].n.toUpperCase(), y0 + 371, '#a8503a', '#e0c0b4');
  const e = ch.x[1], pw = e.d || (e.pct ? 25 : 14), bx = x0 + 22, bw = w - 44;
  bar5(bx, y0 + 378, bw, 'VIDA', ch.hp / 115, '#69f0ae'); bar5(bx, y0 + 389, bw, 'VELOCIDAD', ch.s / 5.6, '#4fc3f7'); bar5(bx, y0 + 400, bw, 'PODER ESP.', pw / 28, '#ff7043');
  if (lk) { X.save(); X.globalAlpha = .9; X.textAlign = 'center'; X.translate(cx, y0 + 150); X.rotate(-.18); X.font = 'italic 42px Impact, sans-serif'; X.lineWidth = 7; X.strokeStyle = '#10051a'; X.strokeText('¡LISTO!', 0, 0); X.fillStyle = col; X.fillText('¡LISTO!', 0, 0); X.restore() }
  X.restore()
}
function selStage() {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05030d'); g.addColorStop(1, '#170a28'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  [0, 1].forEach(i => { const x = i ? W : 0, r = X.createRadialGradient(x, 260, 10, x, 260, 520); r.addColorStop(0, (mode == 'arcade' && i ? '#1976d2' : R[cur[i]].c) + '77'); r.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = r; X.fillRect(0, 0, W, H) });
  // suelo en perspectiva
  X.save(); X.globalAlpha = .08; X.strokeStyle = '#b388ff'; X.lineWidth = 1; X.beginPath(); const vy0 = 290;
  for (let i = -12; i <= 12; i++) { X.moveTo(W / 2, vy0); X.lineTo(W / 2 + i * 130, H) }
  for (let k = 0; k < 8; k++) { const t = (k + (selT * .012) % 1) / 8, y = vy0 + (H - vy0) * t * t; X.moveTo(0, y); X.lineTo(W, y) } X.stroke(); X.restore();
  X.save(); X.globalAlpha = .04; X.fillStyle = '#fff'; for (let i = -H; i < W; i += 40) { const o = (selT * .4) % 40; X.beginPath(); X.moveTo(i + o, 0); X.lineTo(i + o + 12, 0); X.lineTo(i + o + 12 + H, H); X.lineTo(i + o + H, H); X.fill() } X.restore();
  // brasas
  X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 32; i++) { const sp = .25 + (i % 5) * .12, x = (i * 97.3 + Math.sin(selT / 60 + i) * 18 + W) % W, y = H - ((i * 61.7 + selT * sp) % (H + 30)) + 10; X.fillStyle = 'rgba(255,190,80,' + (.1 + .06 * (i % 4)) + ')'; X.beginPath(); X.arc(x, y, 1 + (i % 3) * .6, 0, 7); X.fill() } X.restore();
  const vg = X.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 640); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.62)'); X.fillStyle = vg; X.fillRect(0, 0, W, H); drawPt()
}
function vsFace(ch, cx, cy, r, col, cpu) {
  X.save(); X.shadowColor = col; X.shadowBlur = 14 + 4 * Math.sin(selT / 10); X.beginPath(); X.arc(cx, cy, r + 3, 0, 7); X.fillStyle = col; X.fill(); X.restore();
  X.save(); X.beginPath(); X.arc(cx, cy, r, 0, 7); X.clip();
  if (cpu) { X.fillStyle = '#120a2a'; X.fillRect(cx - r, cy - r, r * 2, r * 2); X.fillStyle = col; X.font = 'italic 44px Impact, sans-serif'; X.textAlign = 'center'; X.fillText('?', cx, cy + 16) }
  else { const im = ch.img; if (im.complete && im.naturalWidth) dI(im, cx - r, cy - r, r * 2); else { X.fillStyle = ch.c; X.fillRect(cx - r, cy - r, r * 2, r * 2) } }
  X.restore(); X.beginPath(); X.arc(cx, cy, r, 0, 7); X.lineWidth = 2; X.strokeStyle = '#10051a'; X.stroke()
}
function drawSel() {
  selStage();
  const hk = mode == 'arcade' ? 'ARCADE' : mode == 'train' ? 'ENTRENAMIENTO' : '1 VS 1';
  // cabecera
  X.save();
  [-1, 1].forEach(d => { const x = W / 2 + d * 232, g = X.createLinearGradient(x, 0, x + d * 170, 0); g.addColorStop(0, 'rgba(168,147,90,.85)'); g.addColorStop(1, 'rgba(168,147,90,0)'); X.fillStyle = g; X.fillRect(Math.min(x, x + d * 170), 29, 170, 3); X.fillRect(Math.min(x, x + d * 130), 37, 130, 1.5) });
  X.shadowColor = '#ffb300'; X.shadowBlur = 20; const bg = X.createLinearGradient(0, 12, 0, 52); bg.addColorStop(0, '#ffe082'); bg.addColorStop(.55, '#ffb300'); bg.addColorStop(1, '#ff8f00'); X.fillStyle = bg; tpath(W / 2 - 220, 12, 440, 40, 16); X.fill(); X.shadowBlur = 0;
  X.fillStyle = 'rgba(255,255,255,.35)'; tpath(W / 2 - 220, 12, 440, 15, 16); X.fill();
  X.textAlign = 'center'; X.font = 'italic 25px Impact, sans-serif'; try { X.letterSpacing = '5px' } catch (e) { }
  X.fillStyle = 'rgba(255,255,255,.45)'; X.fillText('ELIGE TU LUCHADOR', W / 2 + 2, 42); X.fillStyle = '#1a0a02'; X.fillText('ELIGE TU LUCHADOR', W / 2 + 2, 41); X.restore();
  const sub = hk + '  ·  ' + (mode == 'arcade' ? padBtn('p') + ' = LISTO · ' + padBtn('k') + ' = VOLVER' : mode == 'train' ? 'ELIGE TU LUCHADOR Y LUEGO EL DUMMY' : 'AMBOS ELIGEN A LA VEZ');
  X.save(); X.font = 'bold 11px sans-serif'; try { X.letterSpacing = '2px' } catch (e) { } const sw = X.measureText(sub).width + 30;
  X.fillStyle = 'rgba(0,0,0,.4)'; rr(W / 2 - sw / 2, 57, sw, 19, 9.5); X.fill(); X.strokeStyle = 'rgba(255,179,0,.35)'; X.lineWidth = 1; X.stroke();
  X.textAlign = 'center'; X.fillStyle = 'rgba(255,255,255,.85)'; X.fillText(sub, W / 2 + 1, 70); X.restore();
  const PW = 262, PY = 80, PH = 412;
  preview(0, R[cur[0]], 12, PY, PW, PH); if (mode == 'arcade') arcPanel(W - 12 - PW, PY, PW, PH); else preview(1, R[cur[1]], W - 12 - PW, PY, PW, PH);
  // cuadrícula
  const TW = 62, TH = 84, TPx = 68, TPy = 94, GX = (W - (COLS * TPx - 6)) / 2, rows = Math.ceil(R.length / COLS), GY0 = 98, pu = .5 + .5 * Math.sin(selT / 8);
  const tile = (r, i, hov) => {
    const x = GX + (i % COLS) * TPx, y = GY0 + ((i / COLS) | 0) * TPy, h0 = cur[0] == i, h1 = cur[1] == i && mode != 'arcade';
    X.save(); if (hov) { X.translate(x + TW / 2, y + TH / 2); X.scale(1.08, 1.08); X.translate(-x - TW / 2, -y - TH / 2) }
    tpath(x, y, TW, TH, 7); const bg = X.createLinearGradient(0, y, 0, y + TH); bg.addColorStop(0, hov ? 'rgba(56,40,112,.98)' : 'rgba(24,17,52,.92)'); bg.addColorStop(1, 'rgba(8,6,22,.96)'); X.fillStyle = bg; X.fill();
    X.save(); X.clip(); portrait(r, x + 5, y + 4, TW - 10, 5, 'rgba(255,255,255,0)', 0);
    if (!hov) { X.fillStyle = 'rgba(6,4,18,.14)'; X.fillRect(x, y, TW, TH) }
    else { const bx = x - 40 + (selT * 1.7) % 150; X.fillStyle = 'rgba(255,255,255,.2)'; X.beginPath(); X.moveTo(bx, y + TH); X.lineTo(bx + 16, y + TH); X.lineTo(bx + 46, y); X.lineTo(bx + 30, y); X.fill() }   // destello que cruza la tarjeta elegida
    const gl_ = X.createLinearGradient(x, y, x + TW * .7, y + TH * .5); gl_.addColorStop(0, 'rgba(255,255,255,.16)'); gl_.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = gl_; X.fillRect(x, y, TW, TH * .55);
    const sh = X.createLinearGradient(0, y + TH - 40, 0, y + TH - 22); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); X.fillStyle = sh; X.fillRect(x, y + TH - 40, TW, 18);
    X.fillStyle = 'rgba(0,0,0,.5)'; X.fillRect(x, y + TH - 22, TW, 22); X.fillStyle = r.c; X.fillRect(x, y + TH - 22, TW, 2);
    X.fillStyle = '#fff'; X.font = 'bold ' + (r.n.length > 7 ? 9 : 11) + 'px sans-serif'; X.textAlign = 'center'; try { X.letterSpacing = '0px' } catch (e) { } X.fillText(r.n.toUpperCase(), x + TW / 2, y + TH - 7);
    X.restore();
    X.lineWidth = 1.4; X.strokeStyle = hov ? 'rgba(255,255,255,.7)' : r.c + '99'; tpath(x, y, TW, TH, 7); X.stroke();
    [[0, h0], [1, h1]].forEach(([pl, on]) => {
      if (!on) return; const o = (pl && h0 ? 5 : 0) + pu * 1.5;
      X.save(); X.shadowColor = PCOL[pl]; X.shadowBlur = 10 + 8 * pu; X.lineWidth = 3; X.strokeStyle = PCOL[pl]; tpath(x - o, y - o, TW + 2 * o, TH + 2 * o, 7); X.stroke(); X.restore();
      const tx = pl ? x + TW - 24 + o : x - o; X.fillStyle = PCOL[pl]; rr(tx, y - o - 11, 24, 15, 4); X.fill(); X.fillStyle = '#10051a'; X.font = 'bold 10px sans-serif'; X.textAlign = 'center'; X.fillText('P' + (pl + 1), tx + 12, y - o);
      if (lock[pl]) { X.globalAlpha = .4; X.fillStyle = PCOL[pl]; tpath(x, y, TW, TH, 7); X.fill(); X.globalAlpha = 1; X.fillStyle = '#10051a'; X.fillRect(x, y + 28, TW, 20); X.fillStyle = PCOL[pl]; X.font = 'bold 11px sans-serif'; X.fillText('LISTO', x + TW / 2, y + 42) }
    });
    X.restore()
  };
  R.forEach((r, i) => { if (!(cur[0] == i || (cur[1] == i && mode != 'arcade'))) tile(r, i, false) });
  R.forEach((r, i) => { if (cur[0] == i || (cur[1] == i && mode != 'arcade')) tile(r, i, true) });
  // marcador VS con retratos
  const vy = GY0 + rows * TPy + 6, cy = vy + 38, off = 112, cpu = mode == 'arcade', a0 = R[cur[0]].n.toUpperCase(), a1 = cpu ? 'CPU' : R[cur[1]].n.toUpperCase();
  [[-1, PCOL[0]], [1, PCOL[1]]].forEach(([d, c]) => { const x1 = W / 2 + d * (off - 40), x2 = W / 2 + d * 38, g = X.createLinearGradient(x1, 0, x2, 0); g.addColorStop(0, c); g.addColorStop(1, 'rgba(255,213,79,.0)'); X.fillStyle = g; X.fillRect(Math.min(x1, x2), cy - 1.5, Math.abs(x2 - x1), 3) });
  vsFace(R[cur[0]], W / 2 - off, cy, 32, PCOL[0], false); vsFace(R[cur[1]], W / 2 + off, cy, 32, PCOL[1], cpu);
  X.textAlign = 'center'; X.font = 'italic 17px Impact, sans-serif'; try { X.letterSpacing = '2px' } catch (e) { }
  X.lineJoin = 'round'; X.lineWidth = 4; X.strokeStyle = '#10051a'; [[a0, -off, PCOL[0]], [a1, off, PCOL[1]]].forEach(([t, dx, c]) => { X.strokeText(t, W / 2 + dx, cy + 54); X.fillStyle = c; X.fillText(t, W / 2 + dx, cy + 54) });
  X.save(); X.translate(W / 2, cy + 14); const bs = 1 + .04 * Math.sin(selT / 7); X.scale(bs, bs); X.font = 'italic 50px Impact, sans-serif'; try { X.letterSpacing = '2px' } catch (e) { }
  X.shadowColor = '#ffb300'; X.shadowBlur = 20; X.lineWidth = 7; X.strokeStyle = '#3a1400'; X.strokeText('VS', 0, 0); X.shadowBlur = 0;
  const vg2 = X.createLinearGradient(0, -34, 0, 4); vg2.addColorStop(0, '#fff8e1'); vg2.addColorStop(1, '#ffb300'); X.fillStyle = vg2; X.fillText('VS', 0, 0); X.restore();
  if (selGo > 0) { X.fillStyle = 'rgba(0,0,0,.78)'; X.fillRect(0, 215, W, 90); const gg = X.createLinearGradient(0, 0, W, 0); gg.addColorStop(0, PCOL[0]); gg.addColorStop(.5, '#ffd54f'); gg.addColorStop(1, PCOL[1]); X.fillStyle = gg; X.fillRect(0, 215, W, 3); X.fillRect(0, 302, W, 3); X.textAlign = 'center'; X.font = 'italic 54px Impact, sans-serif'; try { X.letterSpacing = '4px' } catch (e) { } X.fillStyle = '#fff'; X.fillText(selBanner(), W / 2, 277) }
  // ayudas
  chips([['D-PAD', 'Mover'], ['✕', 'Elegir'], ['□', 'Volver']], 510, 12 + PW / 2, 1); chips([['D-PAD', 'Mover'], ['✕', 'Elegir'], ['□', 'Volver']], 510, W - 12 - PW / 2, 1);
  const np = pads().length; X.textAlign = 'center'; X.font = '10px sans-serif'; X.fillStyle = slot[0] != null && slot[1] != null ? '#69f0ae' : 'rgba(255,213,79,.9)'; try { X.letterSpacing = '1px' } catch (e) { }
  X.fillText('MANDOS: ' + np + ' · P1 ' + (slot[0] != null ? 'OK' : 'pulsa un botón') + ' · P2 ' + (slot[1] != null ? 'OK' : 'pulsa un botón'), W / 2, 506);
  X.fillStyle = 'rgba(255,255,255,.5)'; X.fillText('ESQUIVE ' + padB1('d') + ' · AGARRE ' + padB1('g') + ' · ULTRA ' + padB1('q'), W / 2, 522)
}

// ---------- PANTALLA DE CONTROLES (reasignar teclas y mando) ----------
const CACT = [['l', 'Izquierda'], ['r', 'Derecha'], ['u', 'Saltar'], ['b', 'Agacharse / cubrirse'], ['p', 'Puño rápido  (□)'], ['hp', 'Puño fuerte  (△)'], ['k', 'Patada rápida  (✕)'], ['hk', 'Patada fuerte  (○)'], ['mod', 'Habilidades: mantener + botón  (L2)'], ['g', 'Agarre  (R1)'], ['bl', 'Bloqueo  (R2)'], ['d', 'Esquivar  (L1)'], ['a', 'Asistencia  (R3)'], ['q', 'Definitiva (atajo extra)']];
const CTABS = ['JUGADOR 1 · TECLADO', 'JUGADOR 2 · TECLADO', 'MANDO PS4'], CROWS = CACT.length + 2;
let ci = 0, ctab = 0, cmsg = '', cmsgT = 0, cprev = {};
const KNAME = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Space: 'Espacio', ShiftLeft: 'Shift izq.', ShiftRight: 'Shift der.', ControlLeft: 'Ctrl izq.', ControlRight: 'Ctrl der.', AltLeft: 'Alt izq.', AltRight: 'Alt der.', Comma: ',', Period: '.', Semicolon: ';', Slash: '/', Quote: '\'', Backslash: '\\', BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=', Backquote: '`', Enter: 'Enter', Tab: 'Tab', Backspace: 'Retroceso', NumpadEnter: 'Enter (num)', IntlBackslash: '<' };
const keyName = c => KNAME[c] || (/^Key[A-Z]$/.test(c) ? c.slice(3) : /^Digit\d$/.test(c) ? c.slice(5) : /^Numpad/.test(c) ? 'Num ' + c.slice(6) : c || '—');
const BSTD = ['✕ / A', '○ / B', '□ / X', '△ / Y', 'L1', 'R1', 'L2', 'R2', 'Select', 'Start', 'L3', 'R3', '↑', '↓', '←', '→', 'Home'];
function bindName(b) {
  const n = +b.slice(1);
  if (b[0] == 'b') return n >= 100 ? 'Cruceta ' + ['↑', '→', '↓', '←'][n - 100] : (PSB[n] || 'Botón ' + n);
  const ax = { 0: 'Palanca izq.', 1: 'Palanca izq.', 2: 'Palanca der.', 3: 'Palanca der.' }, sg = b.slice(-1) == '+', k = +b.slice(1, -1);
  return (ax[k] || 'Eje ' + k) + ' ' + (k % 2 ? (sg ? '↓' : '↑') : (sg ? '→' : '←'))
}
function ctrlNav() {   // navegación fija (no depende de los controles reasignados, para no quedarse atrapado)
  const n = { u: !!keys.ArrowUp, d: !!keys.ArrowDown, l: !!keys.ArrowLeft, r: !!keys.ArrowRight, ok: !!keys.Enter, back: !!keys.Escape, rs: !!keys.Backspace };
  pads().forEach(g => {
    const B = i => g.buttons[i] && g.buttons[i].pressed, ax = g.axes[0] || 0, ay = g.axes[1] || 0, hm = hatMask(g);
    n.u = n.u || B(12) || ay < -.6 || !!(hm & 1); n.d = n.d || B(13) || ay > .6 || !!(hm & 4); n.l = n.l || B(14) || ax < -.6 || !!(hm & 8); n.r = n.r || B(15) || ax > .6 || !!(hm & 2);
    n.ok = n.ok || B(0); n.back = n.back || B(1) || B(9)
  });
  const h = {}; for (const k in n) h[k] = n[k] && !cprev[k]; cprev = n; return h
}
function ctrlDefaults() { if (ctab < 2) Object.assign(KB[ctab], KB0[ctab]); else for (const a in PM0) PM[a] = PM0[a].slice(); ctlSave() }
function ctrlAssign(act, code) {
  if (ctab < 2) {
    if (code == 'Escape' || code == 'KeyP') { cmsg = 'Esa tecla está reservada para la pausa'; cmsgT = 150; sfx('back'); return false }
    const kb = KB[ctab], old = kb[act], other = Object.keys(kb).find(a => a != act && kb[a] == code); if (other) kb[other] = old; kb[act] = code
  } else {
    const old = PM[act].slice(); for (const a in PM) if (a != act && PM[a].includes(code)) { PM[a] = PM[a].filter(b => b != code); if (!PM[a].length) PM[a] = old.slice(0, 1) }
    PM[act] = [code]
  }
  ctlSave(); sfx('ok'); return true
}
function ctrlTick() {
  tt++; if (cmsgT > 0) cmsgT--;
  if (bindCap) {   // esperando la tecla o el botón nuevo
    const c = bindCap; c.t++;
    if (c.t > 600) { bindCap = null; return }
    if (c.key) { const code = c.key; c.key = null; if (code == 'Escape') { bindCap = null; ctrlNav(); sfx('back'); return } if (ctab < 2) { bindCap = null; ctrlNav(); ctrlAssign(CACT[ci][0], code); return } }   // en la pestaña del mando se ignoran las teclas (salvo Esc)
    if (ctab == 2) {
      const L = pads(); if (!c.armed) { if (!L.some(g => g.buttons.some(b => b.pressed) || hatMask(g))) { c.armed = true; c.ax = {}; L.forEach(g => c.ax[g.index] = [...g.axes]) } return }
      let found = null; L.forEach(g => {
        if (found) return; const hm = hatMask(g); if (hm) found = 'b' + (100 + [1, 2, 4, 8].findIndex(m => hm & m));
        if (!found) g.buttons.forEach((b, i) => { if (!found && b.pressed) found = 'b' + i });
        if (!found) g.axes.forEach((v, i) => { const b0 = (c.ax[g.index] || [])[i]; if (!found && b0 != null && !(i == 9 && hatSeen[g.index]) && Math.abs(v - b0) > .7) found = 'a' + i + (v > b0 ? '+' : '-') })
      });
      if (found) { bindCap = null; ctrlNav(); ctrlAssign(CACT[ci][0], found) }
    }
    return
  }
  const h = ctrlNav();
  if (h.back) { sc = 'opts'; sfx('back'); ctlSave(); return }
  if (h.u) { ci = (ci + CROWS - 1) % CROWS; sfx('nav') } if (h.d) { ci = (ci + 1) % CROWS; sfx('nav') }
  
  if (h.rs && ci < CACT.length) { if (ctab < 2) KB[ctab][CACT[ci][0]] = KB0[ctab][CACT[ci][0]]; else PM[CACT[ci][0]] = PM0[CACT[ci][0]].slice(); ctlSave(); sfx('back') }
  if (h.ok) {
    if (ci < CACT.length) { bindCap = { t: 0, key: null, armed: ctab != 2, ax: {} }; sfx('nav') }
    else if (ci == CACT.length) { ctrlDefaults(); cmsg = 'Valores restaurados'; cmsgT = 120; sfx('ok') }
    else { sc = 'opts'; sfx('back'); ctlSave() }
  }
}
function drawCtrl() {
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H); const op = clamp01((tt - 0) / 20 + 1); titleStage(1); drawPt();
  X.fillStyle = 'rgba(2,2,4,.8)'; X.fillRect(0, 0, W, H); X.textAlign = 'center'; X.fillStyle = '#a8935a'; X.font = 'italic 34px Impact, sans-serif'; try { X.letterSpacing = '8px' } catch (e) { } X.fillText('CONTROLES', W / 2, 46); try { X.letterSpacing = '0px' } catch (e) { }
  CTABS.forEach((t, i) => { if (i < 2) return; const w = 210, x = W / 2 - w / 2, on = i == ctab; X.fillStyle = on ? (i < 2 ? PCOL[i] : '#a8935a') : 'rgba(255,255,255,.08)'; X.beginPath(); X.roundRect(x, 58, w, 26, 8); X.fill(); X.fillStyle = on ? '#14070a' : 'rgba(255,255,255,.6)'; X.font = 'bold 13px sans-serif'; X.fillText(t, x + w / 2, 76) });
  const rx = W / 2 - 300, rw = 600;
  for (let i = 0; i < CROWS; i++) {
    const y = 94 + i * 24, on = i == ci, act = i < CACT.length;
    X.fillStyle = on ? '#a8935a' : 'rgba(255,255,255,.07)'; X.beginPath(); X.roundRect(rx, y, rw, 23, 6); X.fill();
    X.textAlign = 'left'; X.font = 'bold 15px sans-serif'; X.fillStyle = on ? '#1a0a02' : '#fff';
    if (act) {
      X.fillText(CACT[i][1], rx + 16, y + 17); X.textAlign = 'right';
      const waiting = bindCap && on, v = ctab < 2 ? keyName(KB[ctab][CACT[i][0]]) : PM[CACT[i][0]].map(bindName).join('  ·  ');
      if (waiting) { X.fillStyle = Math.sin(tt / 5) > 0 ? '#b71c1c' : '#1a0a02'; X.fillText(ctab < 2 ? 'Pulsa la nueva tecla...' : 'Pulsa el botón / dirección del mando...', rx + rw - 16, y + 17) }
      else { X.font = 'bold ' + (v.length > 46 ? 11 : v.length > 34 ? 13 : 15) + 'px sans-serif'; X.fillText(v, rx + rw - 16, y + 17) }
    } else { X.textAlign = 'center'; X.fillText(i == CACT.length ? 'Restaurar valores de esta pestaña' : 'Volver', W / 2, y + 17) }
  }
  X.textAlign = 'center'; X.font = '13px sans-serif'; X.fillStyle = cmsgT > 0 ? '#a8935a' : 'rgba(255,255,255,.6)';
  const L = pads(), info = ctab == 2 ? (L.length ? 'Mando detectado: ' + (L[0].id || '').slice(0, 60) + (L.length > 1 ? '  (+' + (L.length - 1) + ')' : '') : 'Sin mando: conéctalo y pulsa un botón') : 'Cambios guardados automáticamente en este navegador';
  X.fillText(cmsgT > 0 ? cmsg : info, W / 2, 497);
  chips([['D-PAD ↑ ↓', 'Elegir acción'], ['✕', 'Reasignar'], ['○', 'Volver']], 522)
}

// ---------- BUCLE ----------
function tick() {
  audioPoke();
  musicTick(); claim(); const I = [inp(0), inp(1)], pp = pausePressed();
  if (sc == 'fight' && mode != 'vs') { const dm = mode == 'train' && dummy == 4; if (!dm) { I[0] = mergeI(I[0], I[1]); I[1] = aiInput() } }
  if (sc == 'fight' && state == 'go' && !paused) Combat.InputBuffer.apply(I, hstop > 0); else Combat.InputBuffer.clear();   // lo pulsado durante el hitstop no se pierde
  if (sc != 'fight') paused = false;
  else if (paused) {
    if (pcb >= 0) { if (I.some(i => i.hit.u || i.hit.b)) { window.cpage ^= 1; sfx('nav'); return } if (pp || I.some(i => i.hit.k || i.hit.p)) pcb = -1; return }
    if (pp || I.some(i => i.hit.k)) { setPause(false); return }
    I.forEach(({ hit: h }, pl) => {
      const n = pauseItems().length; if (h.u) { pi = (pi + n - 1) % n; sfx('nav') } if (h.b) { pi = (pi + 1) % n; sfx('nav') }
      if (h.p) {
        sfx('ok');
        if (pi == 0) paused = false;
        else if (pi == 1) { paused = false; startMatch(1) }
        else if (pi == 2) pcb = mode == 'vs' ? pl : 0;
        else if (mode == 'train' && pi == 3) dummy = (dummy + 1) % DUM.length;
        else { mode = 'vs'; paused = false; sc = 'title'; mi = 0; tt = 140; lock = [0, 0]; selGo = 0; toasts = [] }
      }
    });
    return
  }
  else if (pp && state != 'over') { setPause(true); return }
  if (!(sc == 'fight' && ((slowT > 0 && (slowT - 1) % slowDiv) || (hstop > 0 && state == 'go' && (hstop & 1))))) ptUpd();   // en hitstop las partículas van a media velocidad if (sc != 'fight' ? Math.random() < .35 : Math.random() < .06) pt.push(ember());
  if (sc == 'title') {
    if (!spDone && tt >= 40) {
      spT++; if (spT == 50) sfx('nav');
      if (spT > 215) { spDone = true; tt = 40 }
      else if (spT > 25 && I.some(i => Object.keys(i.hit).some(k => i.hit[k]))) { spDone = true; tPress = true; tt = 140; unlockAudio(); sfx('ok') }
      return
    }
    if (tt >= 40 || loaded()) tt++; mode = 'vs';
    if (!tPress) { if (tt > 60 && I.some(i => Object.keys(i.hit).some(k => i.hit[k]))) { tPress = true; unlockAudio(); sfx('ok'); speak('Fénix Fight', null, { force: 1, ann: 1 }) } return }
    if (tt > 100) I.forEach(({ hit: h }) => {
      const N = 4; if (h.u) { mi = (mi + N - 1) % N; sfx('nav') } if (h.b) { mi = (mi + 1) % N; sfx('nav') }
      if (h.p) { sfx('ok'); if (mi < 3) { mode = ['vs', 'arcade', 'train'][mi]; sc = 'sel'; lock = [0, 0]; selGo = 0; rolling[0] = rolling[1] = null; if (cur[0] >= R.length) cur[0] = 0; if (cur[1] >= R.length) cur[1] = 5 } else { sc = 'opts'; oi = 0 } }
    });
    return;
  }
  if (sc == 'vs') {
    vsT++; if (vsT == 22) { shake = 14; sfxN(.25, .25); rumble(0, 200, .6, .6); rumble(1, 200, .6, .6) }
    if (vsT >= 150 || (vsT > 40 && I.some(i => i.hit.p))) { if (STORY[F[0].ch.id] || STORY[F[1].ch.id]) { sc = 'story'; stoT = 0; stoP = 0; sfx('nav') } else sc = 'fight'; lock = [0, 0] }
    return;
  }
  if (sc == 'story') {   // historia de cada luchador antes de pelear: el 1er botón completa el texto, el 2º empieza la pelea
    stoT++; const len = stoP ? duelText().length : Math.max(...F.map(f => ((STORY[f.ch.id] || { t: '' }).t).length)), fin = stoT * 1.8 > len + 6, press = stoT > 8 && I.some(i => i.hit.p || i.hit.k || i.hit.s);
    if (press && !fin) stoT = Math.ceil(len / 1.8) + 8; else if ((press && fin) || stoT > len / 1.8 + (stoP ? 300 : 260)) { if (!stoP && mode != 'train' && F.length == 2) { stoP = 1; stoT = 0; sfx('nav') } else { sc = 'fight'; sfx('ok') } }
    return
  }
  if (sc == 'arcend') {
    tt++; if (tt % 3 == 0) pt.push({ k: 'spark', x: rnd(0, W), y: -10, vx: rnd(-1, 1), vy: rnd(2, 5), l: 110, m: 116, c: pick(['#ffd54f', '#ff5252', '#4fc3f7', '#69f0ae']), g: .02 });
    if (tt > 30 && I.some(i => i.hit.p)) { sc = 'title'; mi = 0; tt = 140; mode = 'vs'; sfx('ok') }
    return;
  }
  if (sc == 'ctrl') { ctrlTick(); return }
  if (sc == 'opts') {
    tt++;
    I.forEach(({ hit: h }, pl) => {
      const N = 11; if (h.u) { oi = (oi + N - 1) % N; sfx('nav') } if (h.b) { oi = (oi + 1) % N; sfx('nav') }
      const tg = h.p || h.l || h.r, d = h.l ? -1 : 1;
      if (h.k) { sc = 'title'; sfx('back') }
      else if (oi == 0 && tg) { snd = !snd; lsSet('sfSnd', snd); if (snd) unlockAudio(); sfx('ok') }
      else if (oi == 1 && tg) { volM = stepV(volM, d, h.p); lvSet('sfVolM', volM); BGM.volume = bgmVol(); if (volM > 0 && snd && BGM.paused) BGM.play().catch(() => { }); sfx('nav') }
      else if (oi == 2 && tg) { volF = stepV(volF, d, h.p); lvSet('sfVolF', volF); ac(); sfx('hit') }
      else if (oi == 3 && tg) { voz = !voz; lvSet('sfVoz', voz ? 1 : 0); sfx('ok'); if (voz) speak('Hola, soy la voz de Fénix Fight', null, { force: 1, ann: 1 }) }
      else if (oi == 4 && tg) { bld = !bld; lsSet('sfBld', bld); sfx('ok') }
      else if (oi == 5 && tg) { vib = !vib; lsSet('sfVib', vib); sfx('ok'); if (vib) rumble(pl, 250, .7, .7) }
      else if (oi == 6 && tg) { bloomOn = !bloomOn; lsSet('sfBloom', bloomOn); sfx('ok') }
      else if (oi == 7 && tg) { stgOpt = (stgOpt + (h.l ? STG.length : 1)) % (STG.length + 1); sfx('nav') }
      else if (oi == 8 && h.p) { sc = 'ctrl'; ci = 0; ctab = 2; bindCap = null; cmsg = ''; sfx('ok') }
      else if (oi == 9 && h.p) { cp = pl; cc = Math.min(cur[pl], R.length - 1); sc = 'combos'; sfx('ok') }
      else if (oi == 10 && h.p) { sfx('back'); sc = 'title' }
    });
    return;
  }
  if (sc == 'combos') {
    const h = I[cp].hit; if (h.u || h.b) { window.cpage ^= 1; sfx('nav') } if (h.l) { cc = (cc + R.length - 1) % R.length; sfx('nav') } if (h.r) { cc = (cc + 1) % R.length; sfx('nav') } if (h.k || h.p) { sc = 'opts'; sfx('ok') }
    return
  }
  if (sc == 'sel') {
    selT++; const M = mode != 'vs', hits = M ? mergeI(I[0], I[1]).hit : null, lb = lock.slice();
    [0, 1].forEach(p => {
      if (M && p == 1 && !(mode == 'train' && lb[0])) return;
      const i = M ? hits : I[p].hit;
      if (M && p == 0 && mode == 'train' && lb[0]) return;
      if (soonNo[p] > 0) soonNo[p]--;
      if (rolling[p]) { rollTick(p); return }
      if (!lock[p]) {
        if (i.k) { if (M && p == 1) lock[0] = 0; else if (!lock[1 - p] || M) { sc = 'title'; lock = [0, 0]; selGo = 0 } return }
        const c = cur[p] % COLS, r = (cur[p] / COLS) | 0, rows = Math.ceil(NSEL / COLS), rl = q => Math.min(COLS, NSEL - q * COLS); let n = cur[p];
        if (i.l) n = r * COLS + (c + rl(r) - 1) % rl(r);
        if (i.r) n = r * COLS + (c + 1) % rl(r);
        if (i.u) { const q = (r + rows - 1) % rows; n = q * COLS + Math.min(c, rl(q) - 1) }
        if (i.b) { const q = (r + 1) % rows; n = q * COLS + Math.min(c, rl(q) - 1) }
        if (n != cur[p]) { cur[p] = n; sfx('nav'); if (n < R.length) { grunt(R[n], 'atk'); speak(R[n].n, R[n], { force: 1 }) } }
        if (i.x) startRoll(p);   // atajo ALEATORIO: △ (mando) / especial 2
        else if (i.p) {
          if (cur[p] == RANDI) startRoll(p);
          else if (cur[p] >= R.length) { soonNo[p] = 26; sfx('back') }   // PRÓXIMAMENTE: no se puede elegir
          else { lock[p] = 1; sfx('ok'); grunt(R[cur[p]], 'shout'); speak('¡' + R[cur[p]].n + '!', R[cur[p]], { force: 1, shout: 1 }) }
        }
      }
      else if (i.k) { lock[p] = 0 }
    });
    if (sc != 'sel') return;
    const ready = mode == 'arcade' ? lock[0] : lock[0] && lock[1];
    if (ready) { if (++selGo >= 50) { lock = [0, 0]; selGo = 0; if (mode == 'arcade') setupArcade(); startMatch() } } else selGo = 0;
    return;
  }
  if (state == 'cine') { cineTick(); return }
  if (koFr > 0) { koFr--; return }   // pausa de impacto del último golpe del K.O.
  if (slowT > 0) { slowT--; if (slowT % slowDiv) return }   // cámara lenta (K.O. y ultimates)
  if (win && (state == 'ko' || state == 'over')) win.t++;
  if (win && state == 'over') {
    const Wn = F[win.w], L = F[1 - win.w];
    if (win.t % 4 == 0) pt.push({ k: 'spark', x: rnd(0, W), y: -10, vx: rnd(-1, 1), vy: rnd(2, 5), l: 110, m: 116, c: pick(['#ffd54f', '#ff5252', '#4fc3f7', '#69f0ae']), g: .02 });
    if (win.t == 136 && win.q) speak(win.q, Wn.ch, { force: 1 });   // frase de la pantalla de victoria
    if (win.t == 40) { say(Wn, '¡CHÚPALO ' + L.ch.n.toUpperCase() + '!', 190); sfx('sp') }
    if (win.t == 62 || win.t == 80 || win.t == 98) {   // ¡escupitajo! sale de la boca y cae sobre el perdedor
      sfx('spit'); const T = 28, sx = Wn.x + Wn.face * 26, sy = Wn.y - 125;
      for (let i = 0; i < 8; i++) { const ty = L.y - 70 + rnd(-30, 30); pt.push({ k: 'spit', x: sx, y: sy, vx: (L.x + rnd(-15, 15) - sx) / T, vy: (ty - sy - .5 * .3 * T * T) / T, l: T, m: T, r: rnd(2, 4.5), g: .3, c: '#f1f8e9' }) }
      L.bru.push({ k: 'spit', x: rnd(-12, 12), y: rnd(60, 125), r: rnd(7, 12) }); L.s.stun = 0
    }
  }
  F.forEach(f => { if (f.gh > f.hp) f.gh = Math.max(f.hp, f.gh - .4); else f.gh = f.hp; if (state == 'ko' || state == 'over') f.kt++ }); bt++;
  if (state == 'over' && I.some(i => i.hit.p) && stT <= 0) { afterMatch(); return }
  if (state == 'intro' && riv && riv.on) rivTick(I);
  else if (state == 'intro') { if (stT == 70) speak('Ronda ' + round, null, { force: 1, ann: 1 }); if (--stT <= 0) { state = 'go'; sfx('go'); speak('¡Pelea!', null, { force: 1, ann: 1 }) } else if (stT == 19) bt = 0 }
  else if (state == 'go') {
    if (hstop > 0) hstop--;
    else {
      upd(F[0], F[1], I[0]); upd(F[1], F[0], I[1]); Combat.Locomotion.separate(F[0], F[1], 40, W - 40); world();
      if (mode == 'train') trainTick(); else if (state == 'go' && ++tf >= 60) { tf = 0; timer-- }
      const [a, b] = [F[0].hp, F[1].hp];
      if (mode != 'train' && state == 'go' && (a <= 0 || b <= 0 || timer <= 0)) endRound(a == b ? -1 : a > b ? 0 : 1)
    }
  }
  else if (--stT <= 0 && state == 'ko') { round++; startRound() }
  else if (state == 'over') stT--;
}
let last = 0, acc = 0;
let perfAvg = 16.7, perfN = 0;
(function loop(t) { const dtp = Math.min(100, t - last); acc += dtp; last = t;
  perfAvg += (dtp - perfAvg) * .04; if (sc == 'fight' && !paused && ++perfN > 150 && perfN % 45 == 0) { const want = perfAvg > 30 ? 2 : perfAvg > 21 ? 1 : 0; if (want > perfLv) perfLv = want } while (acc >= 1000 / 60) { tick(); acc -= 1000 / 60 } draw(); drawPadDbg(); drawSndHint(); requestAnimationFrame(loop) })(0);
