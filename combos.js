// FÉNIX FIGHT - COMBOS POR SECUENCIA DE BOTONES (combos.js) — estilo Mortal Kombat
// Se carga después de game.js. 5 combos por luchador: 3 movimientos con dirección (↓ → □ ...) que lanzan una habilidad,
// y 2 cadenas de botones (□ □ △ ...) que encadenan golpes y rematan con una habilidad. Sin menús: solo se ejecutan con el mando/teclado.
// Para editar: CMB_DATA (secuencias y nombres) y BAL (equilibrio de personajes) abajo.
(() => {
'use strict';
const CMB_DATA = {"mario": {"s": ["← → △", "↓ ↓ □", "↓ → ✕", "✕ ○ △", "△ □ ✕ □"], "n": ["Tacón Giratorio", "Beso de Reina", "Aquí Mando Doble", "Pasarela Express", "Marcha de Gala"], "h4": "ppK", "f4": 1, "h5": "pkPK", "f5": 2}, "tono": {"s": ["→ ↓ ○", "↓ ← □", "↓ → △", "✕ □ □", "✕ ○ △ △"], "n": ["Besito Doble", "Diva en Escena", "Cambio de Look Exprés", "Desfile Sorpresa", "Gala del Orgullo"], "h4": "ppK", "f4": 0, "h5": "kpPK", "f5": 2}, "rafa": {"s": ["↓ ← △", "↓ → ✕", "→ ↓ ○", "□ □ △", "✕ □ □ ○"], "n": ["Bendición en Cascada", "Exorcismo Total", "Biblia Giratoria", "Rosario de Golpes", "Domingo de Misa"], "h4": "ppP", "f4": 0, "h5": "pPpP", "f5": 2}, "jp": {"s": ["↓ ← □", "↓ → ○", "← → ✕", "○ □ ○", "○ □ △ △"], "n": ["Límite Ilimitado", "Nube Perfumada", "Uber Black", "Reunión de Directorio", "Herencia en Efectivo"], "h4": "pkP", "f4": 0, "h5": "pPkK", "f5": 2}, "gonza": {"s": ["← → ○", "→ ↓ ✕", "↓ ↓ △", "✕ ○ ✕", "□ ✕ □ △"], "n": ["Pelado Militar", "Carga de Cuartel", "Navaja Boomerang", "Degradé Exprés", "Corte de Honor"], "h4": "ppK", "f4": 0, "h5": "pkPK", "f5": 2}, "manu": {"s": ["↓ ← □", "← → ○", "→ ↓ ✕", "□ □ △", "✕ △ ✕ □"], "n": ["Raíces Profundas", "Bosque Violento", "Tala Directa", "Podadora Furiosa", "Selva Salvaje"], "h4": "pPk", "f4": 0, "h5": "pkPK", "f5": 1}, "mono": {"s": ["↓ ↓ □", "↓ → ○", "↓ ← ✕", "○ △ □", "✕ ✕ △ □"], "n": ["Formulario en Triplicado", "Sello de Pausa", "Rechazo Oficial", "Ventanilla Cerrada", "Horario de Atención"], "h4": "ppP", "f4": 0, "h5": "pkPK", "f5": 2}, "ale": {"s": ["↓ → ○", "↓ ↓ ✕", "← → □", "△ ○ △", "✕ ✕ ○ △"], "n": ["Dance Break Remix", "Lightstick Doble", "Fanservice Total", "Coreo Exprés", "Concierto Relámpago"], "h4": "pkP", "f4": 1, "h5": "pkpK", "f5": 0}, "alonso": {"s": ["↓ ↓ ✕", "→ ↓ △", "↓ ← □", "□ ○ □", "✕ ✕ △ □"], "n": ["Guiño Letal", "Cita a Medianoche", "Descontrol Total", "Coqueteo Veloz", "Noche Interminable"], "h4": "pkpK", "f4": 0, "h5": "pkpK", "f5": 1}, "rosita": {"s": ["→ ↓ ✕", "← → ○", "↓ ← □", "✕ ✕ △", "□ ○ △ △"], "n": ["Sopaipilla Triple", "Té de Abuela", "Chancla Voladora", "Delantal Furioso", "Once Completo"], "h4": "ppP", "f4": 0, "h5": "pPpK", "f5": 2}, "tata": {"s": ["↓ → ✕", "→ ↓ △", "← → ○", "□ ✕ △", "△ ✕ ○ □"], "n": ["Guiño Fatal", "Músculo en Tensión", "Nube de Colonia", "Paso de Galán", "Chakal Supremo"], "h4": "ppK", "f4": 0, "h5": "pPkK", "f5": 2}, "tiorene": {"s": ["↓ ↓ ✕", "↓ ← △", "→ ↓ □", "□ △ ✕", "○ ○ △ □"], "n": ["Llamada Urgente", "Pituto Protector", "Ascenso Fulminante", "Reunión de Pasillo", "Cóctel de Contactos"], "h4": "ppP", "f4": 0, "h5": "pPkK", "f5": 2}, "gaston": {"s": ["↓ ↓ ○", "→ ↓ ✕", "↓ ← △", "○ □ ✕", "△ □ ○ △"], "n": ["Destello Calvo", "Láser Doble", "Cabezazo Brillante", "Pulido Relámpago", "Eclipse Menor"], "h4": "ppK", "f4": 0, "h5": "pkPK", "f5": 2}, "pitu": {"s": ["↓ ↓ □", "↓ → ○", "↓ ← △", "△ ○ △", "✕ ✕ △ □"], "n": ["Aviso de Desalojo", "Reunión Sorpresa", "Tarjeta Roja Directa", "Autoridad Total", "Dueño de Casa"], "h4": "pPk", "f4": 0, "h5": "pkPK", "f5": 2}, "wenley": {"s": ["↓ ← ○", "↓ → △", "↓ ↓ ✕", "□ ✕ ○", "□ ○ □ △"], "n": ["Triple Doble", "Mate Aéreo", "Leche Fría", "Alley-Oop", "Clavada Final"], "h4": "ppK", "f4": 0, "h5": "pkPK", "f5": 1}, "benja": {"s": ["← → □", "→ ↓ ○", "↓ → △", "✕ □ ✕", "✕ □ △ ✕"], "n": ["Omnitrix Turbo", "Cuatro Puños", "Flash Alienígena", "Transformación Exprés", "Hora de Héroes Mini"], "h4": "ppP", "f4": 1, "h5": "pkPK", "f5": 2}, "juanito": {"s": ["← → ○", "→ ↓ △", "↓ → ✕", "△ □ ○", "△ □ □ ○"], "n": ["Bocinazo Doble", "Camión en Reversa", "Embestida de Ruta", "Peaje Obligatorio", "Paro Carretero"], "h4": "pPK", "f4": 0, "h5": "PkPK", "f5": 1}, "manin": {"s": ["→ ↓ △", "↓ ← □", "↓ ↓ ○", "□ ✕ ✕", "△ ○ △ ✕"], "n": ["Cevichazo Doble", "Giro Andino Plus", "Ají Explosivo", "Receta Veloz", "Banquete Inca"], "h4": "ppK", "f4": 0, "h5": "pkPK", "f5": 2}, "mati": {"s": ["→ ↓ □", "↓ → ○", "↓ ↓ ✕", "△ ✕ ○", "□ ○ ✕ △"], "n": ["Expropiación Exprés", "Marcha Masiva", "Asamblea Extraordinaria", "Pliego de Peticiones", "Huelga General"], "h4": "ppP", "f4": 0, "h5": "pkPK", "f5": 1}};

const TOK = { '□': 'p', '△': 'hp', '✕': 'k', '○': 'hk', '→': 'F', '←': 'B', '↓': 'D', '↑': 'U' };
const GAP = 26, SPAN = 95;   // frames máximos entre dos pulsaciones y de toda la secuencia (60 = 1 s)
const HIT = { p: ['punch', 'fast'], P: ['punch', 'strong'], k: ['kick', 'fast'], K: ['kick', 'strong'] };
const BASE_D = { punch: 6, kick: 9 };

// ---------- construir los combos de cada luchador ----------
R.forEach(r => {
  const D = CMB_DATA[r.id]; if (!D || !r.kit) return;
  const E = [r.k, r.x, r.z], mk = (i, ref, name, o) => { const b = E[ref]; return [b[0], Object.assign({}, b[1], o || {}, { n: name })] };
  const up = (ref, name, m, extra) => { const b = E[ref], o = Object.assign({}, extra || {}); if (b[1].d) o.d = Math.round(b[1].d * m); return mk(0, ref, name, o) };
  const st = r.id == 'gaston' ? { st: ['blind', 90] } : null;
  const list = [];
  for (let i = 0; i < 3; i++) list.push({ id: r.id + i, seq: D.s[i], n: D.n[i], hits: '', fin: up(i, D.n[i], 1.15, i == 0 && st ? st : null), cd: 220 + i * 40, kind: 'skill' });
  list.push({ id: r.id + 3, seq: D.s[3], n: D.n[3], hits: D.h4, fin: up(D.f4, D.n[3], .6), fb: E[D.f4][1].n, cd: 260, kind: 'string' });
  list.push({ id: r.id + 4, seq: D.s[4], n: D.n[4], hits: D.h5, fin: up(D.f5, D.n[4], 1.0, st), fb: E[D.f5][1].n, cd: 420, kind: 'string' });
  list.forEach(c => {
    c.tk = c.seq.split(' ').map(t => TOK[t]);
    let d = c.fin[1].d || 0; for (const h of c.hits) d += BASE_D[HIT[h][0]] * (HIT[h][1] == 'strong' ? 1.45 : .85) * (c.kind == 'string' ? 1.1 : 1); c.dmg = Math.round(d);
    c.tx = c.kind == 'skill' ? 'Lanza «' + (E[+c.id.slice(-1)][1].n) + '» potenciada.' : c.hits.length + ' golpes seguidos y remata con «' + c.fb + '».';
  });
  r.cmb = list;
});

// ---------- detector ----------
window.comboRec = (f, I) => { rec(f, I) };
function rec(f, I) {
  const h = f.cmbH, add = k => h.push({ k, t: f.at }); let btn = false;
  if (I.hit[f.face > 0 ? 'r' : 'l']) add('F'); if (I.hit[f.face > 0 ? 'l' : 'r']) add('B'); if (I.hit.b) add('D'); if (I.hit.u) add('U');
  ['p', 'hp', 'k', 'hk'].forEach(b => { if (I.hit[b]) { add(b); btn = true } });
  while (h.length && f.at - h[0].t > SPAN) h.shift(); if (h.length > 8) h.splice(0, h.length - 8);
  return btn
}
window.comboStep = (f, e, I) => {
  if (!f.ch.cmb || f.y < GY - 6) { rec(f, I); return false }
  if (!rec(f, I)) return false;
  const h = f.cmbH;
  for (const c of f.ch.cmb.slice().sort((a, b) => b.tk.length - a.tk.length)) {
    const n = c.tk.length; if (h.length < n || (f.ccd[c.id] || 0) > f.at) continue;
    const seg = h.slice(-n); if (seg.some((q, i) => q.k != c.tk[i])) continue;
    if (seg.some((q, i) => i && q.t - seg[i - 1].t > GAP) || seg[n - 1].t - seg[0].t > SPAN) continue;
    h.length = 0; run(f, e, c); return true
  }
  return false
};
window.comboAI = (f, e) => {
  const ad = Math.abs(f.x - e.x), ok = f.ch.cmb && f.ch.cmb.filter(c => (f.ccd[c.id] || 0) <= f.at && (c.kind == 'string' ? ad < 150 : ad < 520));
  if (!ok || !ok.length) return false; run(f, e, ok[(Math.random() * ok.length) | 0]); return true
};
function scAtk(f, ch) {
  let [type, pw] = HIT[ch]; if (f.ch.nk) type = 'punch';
  const a = new Combat.Attack(type, f.ch); if (f.ch.pa == 'reach') { a.reach *= 1.3; a.r = a.reach + Combat.Config.HURT_HALF }
  a.su = Math.max(3, a.su - 2); a.rc = Math.max(5, a.rc - 5); a.scr = 1;
  if (pw == 'strong') { a.d *= 1.45; a.su += 2; a.strong = 1 } else a.d *= .85;
  return a
}
function run(f, e, c) {
  f.ccd[c.id] = f.at + c.cd; f.atk = null; f.cn = 0; f.cnT = 0;
  star(f.x, f.y - 100, 80, f.ch.c); ring(f.x, f.y - 90, 120, f.ch.c, 6, 16);
  if (c.hits) {
    toast(c.n, f); grunt(f.ch, 'shout');
    f.scr = c.hits.split(''); f.scrF = c.fin; const q = f.scr.length; f.scrN = q;
    f.atk = scAtk(f, f.scr.shift())
  } else cast(f, e, c.fin)
}
window.comboNext = (f, e, can) => {
  if (!can) { f.scr = null; f.scrF = null; return }
  if (f.scr.length) { const ch = f.scr.shift(), a = scAtk(f, ch); if (!f.scr.length) { a.kdf = 1; a.d *= 1.15; a.fin = 1 } f.atk = a; return }
  const fin = f.scrF; f.scr = null; f.scrF = null; if (fin) cast(f, e, fin)
};

// ---------- equilibrio de personajes ----------
const BAL = {
  rosita: { hp: 125, take: .88 },   // difícil de derrotar
  wenley: { reach: 1.2 },           // muchísimo alcance (se suma a su pasiva)
  alonso: { s: 1.2, fast: 1 },      // rápido
  pitu: { hp: 108, give: 1.08 },    // equilibrado y dominante
  juanito: { give: 1.15, slow: 1 }  // pega durísimo pero lento
};
R.forEach(r => { const b = BAL[r.id]; if (!b) return; if (b.hp) r.hp = b.hp; if (b.s) r.s = +(r.s * b.s).toFixed(2) });
const _kitPre = kitPre;
kitPre = function (f, e, d, o) {
  d = _kitPre(f, e, d, o); if (d <= 0) return d;
  const bf = BAL[f.ch.id], be = BAL[e.ch.id]; if (bf && bf.give) d *= bf.give; if (be && be.take) d *= be.take; return d
};
const _newAtk = newAtk;
newAtk = function (f, type, pw) {
  const a = _newAtk(f, type, pw), b = BAL[f.ch.id]; if (!b || type == 'grab') return a;
  if (b.reach) { a.reach *= b.reach; a.r = a.reach + Combat.Config.HURT_HALF }
  if (b.fast) { a.su = Math.max(3, a.su - 1); a.rc = Math.max(8, a.rc - 2) }
  if (b.slow) { a.su += 3; a.rc += 3 }
  return a
};

// ---------- pantalla de combos (segunda página de "Mis movimientos") ----------
const GL = { '□': '#d98bb5', '△': '#6fcf97', '✕': '#6fa8dc', '○': '#e06666' };
window.cpage = 0;
const _dc = drawCombos;
drawCombos = function (ch, p, ip) {
  if (!window.cpage) { _dc(ch, p, ip); return }
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d0d12'); g.addColorStop(1, '#030305'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.textAlign = 'center'; X.fillStyle = PCOL[p]; X.font = 'bold 20px sans-serif'; X.fillText('JUGADOR ' + (p + 1) + ' · COMBOS', W / 2, 30);
  portrait(ch, 40, 44, 104, 14, PCOL[p], 4);
  X.textAlign = 'left'; X.fillStyle = '#fff'; X.font = 'bold 34px Impact,sans-serif'; X.fillText(ch.n.toUpperCase(), 162, 80);
  X.font = 'italic 14px sans-serif'; X.fillStyle = '#a8935a'; X.fillText('Pulsa los botones en orden y rápido (sin L2). Cada combo tiene su propia recarga.', 162, 104);
  X.fillStyle = '#bbb'; X.font = '13px sans-serif'; X.fillText('Dirección: → hacia el rival · ← hacia atrás · ↓ agacharse', 162, 124);
  (ch.cmb || []).forEach((c, i) => {
    const y = 140 + i * 62; X.fillStyle = 'rgba(255,255,255,.07)'; X.beginPath(); X.roundRect(30, y, 900, 58, 10); X.fill();
    let x = 46; c.seq.split(' ').forEach(t => {
      X.beginPath(); X.arc(x + 15, y + 29, 15, 0, 7);
      if (GL[t]) { X.fillStyle = '#14141a'; X.fill(); X.lineWidth = 3; X.strokeStyle = GL[t]; X.stroke(); X.fillStyle = GL[t] } else { X.fillStyle = '#2a2a33'; X.fill(); X.fillStyle = '#ddd' }
      X.textAlign = 'center'; X.font = 'bold 17px sans-serif'; X.fillText(t, x + 15, y + 35); x += 36
    });
    X.textAlign = 'left'; X.fillStyle = '#e8dcc0'; X.font = 'bold 22px Impact,sans-serif'; X.fillText(c.n, 214, y + 25);
    X.fillStyle = '#ccc'; X.font = '12px sans-serif'; X.fillText(c.tx, 214, y + 45);
    X.textAlign = 'right'; X.fillStyle = '#c98a6a'; X.font = 'bold 15px sans-serif'; X.fillText('~' + c.dmg + ' daño', 915, y + 24); X.fillStyle = '#889'; X.font = '11px sans-serif'; X.fillText('recarga ' + (c.cd / 60).toFixed(1) + ' s', 915, y + 44)
  });
  X.textAlign = 'center'; X.fillStyle = '#9aa'; X.font = '12px sans-serif';
  X.fillText('□ puño rápido · △ puño fuerte · ✕ patada rápida · ○ patada fuerte · L2 + □/△/✕ habilidades · L2 + ○ definitiva · R1 agarre · R2 bloqueo', W / 2, 500);
  X.fillStyle = '#fff'; X.font = 'bold 14px sans-serif'; X.fillText('↑↓ cambiar página · ' + (ip ? padBtn('p') + ' / ' + padBtn('k') + ': volver a la pausa' : '◀ ▶ cambiar personaje · ' + padBtn('p') + ' / ' + padBtn('k') + ': volver'), W / 2, 526)
};
})();
