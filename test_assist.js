// Prueba de lógica sin navegador:  node test_assist.js
const assert = require('assert');
const Combat = require('./combat.js'); require('./assist.js');
const { Assist, Timeline, Motion, InputBuffer } = Combat;
const log = []; const H = {
  hit: (f, e, d, st, o) => log.push(['hit', d, o.hs, o.kind]), sfx: n => log.push(['sfx', n]), ring() {}, star() {}, spark() {}, dust() {}, say() {}, toast() {},
  shake() {}, flash() {}, ghost() {}, walls: () => [40, 920]
};
const mk = x => ({ x, y: 440, face: 1, at: 0, atk: 1, dash: null, mvx: 3, cast: 22, xf: null, ch: {}, });
// 1) Timeline
const tl = new Timeline([{ n: 'a', f: 2 }, { n: 'b', f: 3 }]); const seq = [];
for (let i = 0; i < 6; i++) { const ev = tl.step(); seq.push(tl.phase + (ev.enter ? '>' : '') + (ev.done ? '!' : '')) }
assert.deepStrictEqual(seq, ['a', 'b>', 'b', 'b', 'done!', 'done']);
console.log('timeline:', seq.join(' '));
// 2) Motion continuo entre fases (sin teletransporte)
const P = Combat.Assist.Config.POSES, last = k => Motion.sample(P[k], 1), first = k => Motion.sample(P[k], 0);
for (const [a, b] of [['windup', 'strike'], ['strike', 'recover']]) for (const c of ['dx', 'dy', 'rot', 'sx', 'sy']) assert(Math.abs(last(a)[c] - first(b)[c]) < 1e-9, `salto en ${a}->${b} canal ${c}`);
for (const c of ['dx', 'dy', 'rot', 'sx', 'sy']) assert(Math.abs(last('recover')[c] - Motion.NEUTRAL[c]) < 1e-9, 'recover no vuelve a neutral');
let maxStep = 0, prev = Motion.sample(P.strike, 0); for (let i = 1; i <= 8; i++) { const p = Motion.sample(P.strike, i / 8); maxStep = Math.max(maxStep, Math.abs(p.dx - prev.dx)); prev = p }
console.log('strike: max Δdx entre frames =', maxStep.toFixed(1), 'px; pose final', JSON.stringify(Motion.sample(P.strike, 1)));
// 3) Secuencia completa: conecta una vez, vuelve a Mario
const f = mk(300), e = mk(460); e.atk = null; const phases = []; let t = 0, inv = [];
assert(Assist.start(f, e, { d: 18, hitstop: 5 }, H)); assert(!Assist.start(f, e, {}, H), 'no se puede doble-iniciar');
let xs = [];
while (f.xf && t < 300) { f.at++; Assist.step(f, e, H); t++; const ph = Assist.phase(f) || 'fin'; if (phases[phases.length - 1] != ph) phases.push(ph); if (ph == 'strike') xs.push(+f.x.toFixed(1)); inv.push(Assist.invulnerable(f)) }
console.log('fases:', phases.join(' → '), '| frames:', t, '| x en strike:', xs.join(', '));
assert.strictEqual(f.xf, null, 'debe volver a Mario'); assert.strictEqual(t, 16 + 12 + 8 + 16 + 14);
const steps = xs.slice(1).map((v, i) => v - xs[i]); assert(Math.max(...steps) < 32, 'salto de posición > 32 px/frame: ' + steps);
assert.strictEqual(log.filter(l => l[0] == 'hit').length, 1, 'un solo golpe'); const h = log.find(l => l[0] == 'hit'); assert.deepStrictEqual(h, ['hit', 18, 5, 'punch']);
assert(f.x <= e.x - 56 + 1e-6, 'no atraviesa al rival (x=' + f.x + ')'); assert.strictEqual(f.cast, 0);
// 4) Fallo: rival lejos → avanza y no pega
log.length = 0; const f2 = mk(100), e2 = mk(800); Assist.start(f2, e2, {}, H); while (f2.xf) { f2.at++; Assist.step(f2, e2, H) }
assert.strictEqual(log.filter(l => l[0] == 'hit').length, 0); console.log('whiff: avanzó', (f2.x - 100).toFixed(0), 'px sin conectar (adv=150 + deslizamiento)');
// 5) Inmunidad solo en IN/OUT + cancelar
const f3 = mk(300), e3 = mk(600); Assist.start(f3, e3, {}, H); assert(Assist.invulnerable(f3)); for (let i = 0; i < 16 + 2; i++) { f3.at++; Assist.step(f3, e3, H) } assert.strictEqual(Assist.phase(f3), 'windup'); assert(!Assist.invulnerable(f3)); Assist.cancel(f3, H); assert.strictEqual(f3.xf, null);
// 6) Pared: no sale del escenario
const f4 = mk(900), e4 = { x: 940, y: 440 }; Assist.start(f4, e4, {}, H); while (f4.xf) { f4.at++; Assist.step(f4, e4, H) } assert(f4.x <= 920 && f4.x >= 40);
// 7) Rival a la izquierda (face -1)
const f5 = mk(600), e5 = mk(400); f5.face = -1; Assist.start(f5, e5, {}, H); log.length = 0; while (f5.xf) { f5.at++; Assist.step(f5, e5, H) } assert(f5.x < 600 && f5.x >= 400 + 56 - 1e-6 && log.some(l => l[0] == 'hit'));
// 8) InputBuffer
InputBuffer.clear(); const I = [{ hit: { p: false } }, { hit: { p: false } }];
I[0].hit.p = true; InputBuffer.apply(I, true);             // pulsado durante hitstop
const J = [{ hit: { p: false } }, { hit: { p: false } }]; InputBuffer.apply(J, false); assert.strictEqual(J[0].hit.p, true, 'se reinyecta'); assert.strictEqual(J[1].hit.p, false);
const K2 = [{ hit: { p: false } }, { hit: { p: false } }]; InputBuffer.apply(K2, false); assert.strictEqual(K2[0].hit.p, false, 'solo una vez');
console.log('OK: todas las pruebas pasan');
