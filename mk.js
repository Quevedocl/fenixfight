// MK-STYLE LAYER v1 (HUD, logo, anuncios). Se carga después de game.js y sobreescribe funciones.
(function () {
  const steel = (x, y, w, h) => { const g = X.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#6b6f78'); g.addColorStop(.5, '#2a2c33'); g.addColorStop(1, '#0d0e12'); return g };
  // ---- HUD estilo MK: barras desde el centro, marco metálico, medidor de súper de 3 niveles
  window.bar = function (f, i) {
    const w = 360, h = 22, y = 26, x = i ? W / 2 + 62 : W / 2 - 62 - w, p = Math.max(0, f.hp / f.mhp), gp = Math.max(0, (f.gh == null ? f.hp : f.gh) / f.mhp), now = performance.now();
    X.save();
    X.fillStyle = steel(x, y - 5, w, h + 10); X.fillRect(x - 5, y - 5, w + 10, h + 10);
    X.fillStyle = '#120405'; X.fillRect(x, y, w, h);
    const seg = q => i ? [x + w * (1 - q), w * q] : [x, w * q];
    let r = seg(gp); X.fillStyle = '#7d6e48'; X.fillRect(r[0], y, r[1], h);                     // daño reciente
    r = seg(p); const g = X.createLinearGradient(0, y, 0, y + h);
    if (p > .3) { g.addColorStop(0, '#c8b47e'); g.addColorStop(.5, '#8f7842'); g.addColorStop(1, '#3f3114') } else { g.addColorStop(0, '#b03a2c'); g.addColorStop(1, '#4a0a0a') }
    X.globalAlpha = p < .3 ? .75 + .25 * Math.sin(now / 70) : 1; X.fillStyle = g; X.fillRect(r[0], y, r[1], h); X.globalAlpha = 1;
    X.fillStyle = 'rgba(255,255,255,.12)'; X.fillRect(r[0], y, r[1], h * .35);
    X.strokeStyle = '#000'; X.lineWidth = 2; X.strokeRect(x, y, w, h); X.strokeStyle = '#8f7a3a'; X.lineWidth = 1.5; X.strokeRect(x - 5, y - 5, w + 10, h + 10);
    // gemas de victoria de ronda (rombos)
    const wins = f.wins | 0;
    for (let k = 0; k < 2; k++) { const dx = i ? x + w - 10 - k * 18 : x + 10 + k * 18; X.fillStyle = k < wins ? '#b8964a' : '#1a1a1e'; X.beginPath(); X.moveTo(dx, y + h + 9); X.lineTo(dx + 7, y + h + 16); X.lineTo(dx, y + h + 23); X.lineTo(dx - 7, y + h + 16); X.fill(); X.strokeStyle = '#8f7a3a'; X.stroke() }
    // nombre
    X.font = 'bold 22px Impact,sans-serif'; X.textAlign = i ? 'right' : 'left'; X.lineJoin = 'round'; X.lineWidth = 5; X.strokeStyle = '#000'; try { X.letterSpacing = '2px' } catch (e) { }
    const nx = i ? x + w : x, nm = f.ch.n.toUpperCase(); X.strokeText(nm, nx, y + h + 28); const ng = X.createLinearGradient(0, y + h + 10, 0, y + h + 30); ng.addColorStop(0, '#e6e0d0'); ng.addColorStop(1, '#8f7a3a'); X.fillStyle = ng; X.fillText(nm, nx, y + h + 28);
    try { X.letterSpacing = '0px' } catch (e) { }
    // retrato en medallón
    const px = i ? x + w + 46 : x - 46; X.beginPath(); X.arc(px, y + 11, 30, 0, 7); X.fillStyle = '#05050c'; X.fill(); head(f, px, y + 11, 26);
    X.beginPath(); X.arc(px, y + 11, 29, 0, 7); X.lineWidth = 4; X.strokeStyle = '#8f7a3a'; X.stroke();
    // súper: 3 niveles
    const u = Math.min(100, f.ult || 0), sx = i ? x + w - 3 * 70 : x, sy = y + h + 36;
    for (let k = 0; k < 3; k++) {
      const bx = i ? x + w - (k + 1) * 70 + 4 : x + k * 70, fill = Math.max(0, Math.min(1, (u - k * 33.4) / 33.4));
      X.fillStyle = '#0a0c14'; X.fillRect(bx, sy, 66, 7); X.fillStyle = fill >= 1 ? (.6 + .4 * Math.sin(now / 90) > .8 ? '#a9c4d3' : '#648aa3') : '#32506a'; X.fillRect(i ? bx + 66 * (1 - fill) : bx, sy, 66 * fill, 7);
      X.strokeStyle = '#8f7a3a'; X.lineWidth = 1; X.strokeRect(bx, sy, 66, 7)
    }
    // recarga de los 3 especiales (E1 / E2 / E3)
    [[f.cd.k, kcd(f, f.ch.k), '#a8935a', padB1('s')], [f.cd.x, kcd(f, f.ch.x), '#9c6238', padB1('x')], [f.cd.z, f.ch.z ? kcd(f, f.ch.z) : 1, '#8f3d32', padB1('z')]].forEach((c, j) => {
      const rd = Math.max(0, Math.min(1, 1 - c[0] / c[1])), ready = rd >= 1, bx = i ? x + w - (j + 1) * 70 + 4 : x + j * 70, by = sy + 12;
      X.fillStyle = '#08090c'; X.fillRect(bx, by, 66, 6); X.fillStyle = ready ? c[2] : '#3a3d45'; X.fillRect(i ? bx + 66 * (1 - rd) : bx, by, 66 * rd, 6);
      X.strokeStyle = ready ? c[2] : '#2c2e35'; X.lineWidth = 1; X.strokeRect(bx, by, 66, 6);
      X.font = 'bold 9px sans-serif'; X.textAlign = i ? 'right' : 'left'; X.fillStyle = ready ? '#d8d0bc' : '#6a6d76'; X.fillText(c[3], i ? bx + 66 : bx, by + 16)
    });
    X.restore()
  };
  // ---- Logo estilo MK (original: fénix, no dragón)
  const oldLogo = window.drawLogo;
  window.drawLogo = function (op) {
    const k = clamp01((tt - 28) / 45), e = 1 - Math.pow(1 - k, 3); if (op <= 0 || e <= 0) return; const now = performance.now() / 1000;
    X.save(); X.translate(W / 2, 120); X.globalAlpha = e * op; const z = 1 + (1 - e) * .8; X.scale(z, z);
    const gl = X.createRadialGradient(0, 0, 10, 0, 0, 260); gl.addColorStop(0, 'rgba(140,30,12,.4)'); gl.addColorStop(1, 'rgba(255,0,0,0)'); X.fillStyle = gl; X.fillRect(-300, -140, 600, 280);
    X.fillStyle = '#3d0a0d'; X.beginPath(); X.arc(0, 0, 86, 0, 7); X.fill(); X.strokeStyle = '#8f7a3a'; X.lineWidth = 6; X.stroke();   // medallón
    X.fillStyle = '#a07a2e'; for (let s = -1; s <= 1; s += 2) { X.beginPath(); X.moveTo(s * 10, 40); for (let j = 0; j < 5; j++) X.quadraticCurveTo(s * (30 + j * 18), 30 - j * 22 - 6 * Math.sin(now * 3 + j), s * (46 + j * 12), 6 - j * 26); X.lineTo(s * 12, -10); X.fill() }
    X.fillStyle = '#c9b88a'; X.beginPath(); X.moveTo(0, -60); X.quadraticCurveTo(24, -20, 0, 50); X.quadraticCurveTo(-24, -20, 0, -60); X.fill();
    X.font = 'italic 900 78px Impact,sans-serif'; X.textAlign = 'center'; X.lineJoin = 'round'; X.lineWidth = 12; X.strokeStyle = '#000'; try { X.letterSpacing = '6px' } catch (e) { }
    const tg = X.createLinearGradient(0, 60, 0, 130); tg.addColorStop(0, '#e2dac4'); tg.addColorStop(.5, '#a38a4a'); tg.addColorStop(1, '#3a0d08'); X.strokeText('FÉNIX FIGHT', 0, 128); X.fillStyle = tg; X.fillText('FÉNIX FIGHT', 0, 128);
    X.font = 'bold 18px sans-serif'; X.lineWidth = 4; X.fillStyle = '#9a2a24'; try { X.letterSpacing = '12px' } catch (e) { } X.strokeText('ULTIMATE EDITION', 0, 156); X.fillText('ULTIMATE EDITION', 0, 156);
    X.restore()
  };
  // ---- Anuncios sobre el juego: FINISH HIM / FLAWLESS VICTORY, brasas y viñeta
  const oldDraw = window.draw; let koT = 0, emb = Array.from({ length: 50 }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, v: .3 + Math.random() * .9, s: 1 + Math.random() * 2 }));
  window.draw = function () {
    oldDraw(); if (sc != 'fight') return;
    X.save(); X.setTransform(S, 0, 0, S, 0, 0);
    const v = X.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * .95); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.68)'); X.fillStyle = v; X.fillRect(0, 0, W, H); X.fillStyle = 'rgba(4,4,10,.14)'; X.fillRect(0, 0, W, H);
    X.globalCompositeOperation = 'lighter'; emb.forEach(p => { p.y -= p.v; p.x += Math.sin(p.y / 30) * .4; if (p.y < 0) { p.y = H; p.x = Math.random() * W } X.globalAlpha = .35; X.fillStyle = '#9a4a28'; X.fillRect(p.x, p.y, p.s, p.s) }); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
    koT = state == 'ko' ? koT + 1 : 0;
    const big = (t, c, k) => { X.save(); X.translate(W / 2, 224); X.scale(k, k); X.globalAlpha = .92; X.font = 'italic 900 46px Impact,sans-serif'; X.textAlign = 'center'; X.lineJoin = 'round'; X.lineWidth = 10; X.strokeStyle = '#000'; try { X.letterSpacing = '4px' } catch (e) { } X.strokeText(t, 0, 0); X.fillStyle = c; X.fillText(t, 0, 0); X.restore() };
    if (state == 'ko' && koT > 20 && koT < 110) big('FINISH HIM!', '#d50000', 1 + Math.min(1, (koT - 20) / 10) * .2 - .2 + .05 * Math.sin(koT / 3));
    if ((state == 'ko' || state == 'over') && perf && koT > 110 || state == 'over' && perf) big('FLAWLESS VICTORY', '#c9b27a', 1);
    X.restore()
  };
})();

// ---- FASE 2: selección y VS estilo MK (solo 1v1)
(function () {
  const emb = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: .25 + Math.random(), s: 1 + Math.random() * 2.2 }));
  const embers = a => { X.save(); X.globalCompositeOperation = 'lighter'; emb.forEach(p => { p.y -= p.v; p.x += Math.sin(p.y / 28) * .4; if (p.y < 0) { p.y = H; p.x = Math.random() * W } X.globalAlpha = a; X.fillStyle = '#9a4a28'; X.fillRect(p.x, p.y, p.s, p.s) }); X.restore() };
  const frame = () => {   // marco metálico con esquinas
    const g = X.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#8a8d96'); g.addColorStop(.5, '#2c2e35'); g.addColorStop(1, '#8a8d96');
    X.save(); X.strokeStyle = g; X.lineWidth = 10; X.strokeRect(5, 5, W - 10, H - 10); X.strokeStyle = '#8f7a3a'; X.lineWidth = 2; X.strokeRect(13, 13, W - 26, H - 26);
    X.fillStyle = '#8f7a3a'; [[13, 13], [W - 13, 13], [13, H - 13], [W - 13, H - 13]].forEach(([x, y]) => { X.beginPath(); X.moveTo(x, y - 14); X.lineTo(x + 14, y); X.lineTo(x, y + 14); X.lineTo(x - 14, y); X.fill() }); X.restore()
  };
  const vig = () => { const v = X.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, H * .95); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.72)'); X.fillStyle = v; X.fillRect(0, 0, W, H) };
  // ---- SELECCIÓN estilo MKXL: luchadores enormes que se deslizan, círculos de habilidades y cuadrícula de 2 filas abajo
  const selA = [{ id: -1, t: 99, lk: 0, lt: 99 }, { id: -1, t: 99, lk: 0, lt: 99 }];
  // Selección: el luchador se muestra EN MOVIMIENTO (animación de espera, y de vez en cuando golpea, patea o lanza su especial).
  const showPose = (ch, k) => {
    const S = ch.A.st, T = k % 260, seq = (arr, t0, len) => arr[Math.min(arr.length - 1, (((T - t0) / len) * arr.length) | 0)];
    if (T >= 90 && T < 112 && S.punch) return seq(S.punch, 90, 22);
    if (T >= 150 && T < 174 && S.kick) return seq(S.kick, 150, 24);
    if (T >= 205 && T < 235) return (S.cast2 && T >= 222 ? S.cast2 : S.cast)[0];
    if (T >= 40 && T < 90 && S.walk) return S.walk[((k / 8) | 0) % S.walk.length];
    return S.idle[((k / 13) | 0) % S.idle.length]
  };
  const bigArt = (ch, x, gy, h, face, pose, k) => {
    const sk = ch.skI;
    if (sk && sk.complete && sk.naturalWidth) {   // skin HD con movimiento: respira, se balancea, y de vez en cuando golpea / lanza
      // Movimiento propio del personaje (no del "papel"): la imagen se divide en franjas y cada zona del cuerpo se mueve distinto
      // con los pies clavados al piso: respira, cambia el peso de pie, mira a los lados, se aburre (suspira, se encorva) y a veces
      // se estira o da un saltito de impaciencia. Cada luchador tiene su propia fase para que no se muevan todos a la vez.
      const t = (k || selT), ph = [...ch.id].reduce((q, c) => q + c.charCodeAt(0), 0) * 37, T = (t + ph) % 720, w = h * sk.naturalWidth / sk.naturalHeight;
      const E = (a, b) => T >= a && T < b ? Math.sin((T - a) / (b - a) * Math.PI) : 0;   // campana suave 0→1→0 dentro de [a,b)
      const breath = Math.sin(t / 34 + ph), sway = Math.sin(t / 61 + ph * .7);
      const lookL = E(150, 250), lookR = E(330, 430), sigh = E(500, 580), hop = E(640, 668), shiver = E(60, 110);
      const stretch = E(600, 640), cast = pose ? Math.sin(t / 5) * .5 + .5 : 0;
      let src = sk; if (TINT) { if (FILT) X.filter = 'hue-rotate(-42deg) saturate(1.3) brightness(1.04)'; else src = tintOf(sk) }
      const N = 56, sh = sk.naturalHeight / N, dh = h / N, lift = hop * 9 + cast * 6;
      X.save(); X.translate(x, gy - lift); X.imageSmoothingQuality = 'high';
      for (let i = 0; i < N; i++) {
        const v = 1 - (i + .5) / N;   // 0 = pies · 1 = cabeza
        let dx = sway * 5.5 * Math.pow(v, 1.4) + (lookR - lookL) * 4.5 * Math.pow(Math.max(0, v - .72) / .28, 1.2);   // peso del cuerpo + giro de cabeza
        dx += sigh * 7 * Math.max(0, v - .45) + stretch * -5 * Math.max(0, v - .5) + shiver * Math.sin(t * 1.3) * 1.3 * (v > .3 && v < .7 ? 1 : 0);
        let dy = -breath * 2.6 * Math.exp(-Math.pow((v - .62) / .22, 2)) * 1.0 + sigh * 5 * Math.max(0, v - .55) - stretch * 5 * Math.max(0, v - .6);   // pecho que se infla; hombros que caen al suspirar
        dy += breath * -1.2 * v;
        const wx = 1 + breath * .006 * Math.exp(-Math.pow((v - .62) / .2, 2)) + cast * .02;
        X.save(); X.translate(dx * face, dy); X.scale(face * wx, 1);
        X.drawImage(src, 0, i * sh, sk.naturalWidth, sh + .6, -w / 2, -h + i * dh, w, dh + 1);
        X.restore()
      }
      X.restore(); if (TINT && FILT) X.filter = 'none'; return
    }
    if (hasAnim(ch)) {
      const S = ch.A.st, fi = pose ? S[pose][0] : showPose(ch, k || selT), br = Math.sin(selT / 17);
      drawFrame(ch, fi, x, gy, face, h / (ch.A.f[S.idle[0]][1] * ch.A.sc), 1, 1 + br * .012); return
    }
    const hd = ch.hdFull;
    if (!pose && hd && hd.complete && hd.naturalWidth) { const w = h * hd.naturalWidth / hd.naturalHeight; X.save(); X.translate(x, gy); X.scale(face, 1); X.imageSmoothingQuality = 'high'; drawImgT(hd, -w / 2, -h, w, h); X.restore(); return }
    if (hasSprite(ch)) sprite(ch, x, gy, h, face); else skin(ch, x, gy, h / 150, face, { ph: 0, ext: 0, lean: 0 })
  };
  const circle = (x, y, r, lab, col, on, glyph) => {
    X.save(); X.beginPath(); X.arc(x, y, r, 0, 7); const g = X.createRadialGradient(x, y - r * .4, 2, x, y, r); g.addColorStop(0, on ? '#2a1d14' : '#1a1b20'); g.addColorStop(1, '#07080b'); X.fillStyle = g; X.fill();
    if (on) { X.shadowColor = col; X.shadowBlur = 16 + 6 * Math.sin(selT / 6) }
    X.lineWidth = on ? 3.5 : 2; X.strokeStyle = on ? col : 'rgba(143,122,58,.55)'; X.stroke(); X.shadowBlur = 0;
    X.fillStyle = on ? '#fff' : 'rgba(255,255,255,.65)'; X.textAlign = 'center'; X.font = 'bold ' + (lab.length > 3 ? 10 : 12) + 'px Impact,sans-serif'; try { X.letterSpacing = '1px' } catch (e) { } X.fillText(lab, x + .5, y + 4); try { X.letterSpacing = '0px' } catch (e) { } X.restore()
  };
  const RANDCH = { n: 'Aleatorio', c: '#ffd54f', rand: 1 }, selCh = i => i < R.length ? R[i] : i == RANDI ? RANDCH : SOON[i - R.length];
  const soonCard = q => {   // foto con los bordes difuminados para que se funda con el fondo oscuro (se calcula una vez)
    if (q.cv) return q.cv; if (!(q.pv.complete && q.pv.naturalWidth)) return null;
    const w = q.pv.naturalWidth, h = q.pv.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(q.pv, 0, 0); g.globalCompositeOperation = 'destination-in';
    const gx = g.createLinearGradient(0, 0, w, 0), gy = g.createLinearGradient(0, 0, 0, h); [[0, 0], [.14, 1], [.86, 1], [1, 0]].forEach(([o, a]) => { gx.addColorStop(o, 'rgba(0,0,0,' + a + ')'); gy.addColorStop(o, 'rgba(0,0,0,' + a + ')') });
    g.fillStyle = gx; g.fillRect(0, 0, w, h); g.fillStyle = gy; g.fillRect(0, 0, w, h); return q.cv = c
  };
  const soonArt = (q, x, gy, h, k) => {
    const cv = soonCard(q); if (!cv) return; const w = h * cv.width / cv.height, br = Math.sin(k / 15);
    X.save(); X.translate(x, gy); X.scale(1 + br * .004, 1 + br * .01); X.imageSmoothingQuality = 'high'; X.drawImage(cv, -w / 2, -h, w, h); X.restore()
  };
  const randArt = (x, gy, h, k) => {
    X.save(); X.textAlign = 'center'; X.translate(x, gy - h * .5); X.rotate(Math.sin(k / 12) * .06); X.font = 'italic 900 ' + (h * .62 | 0) + 'px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 12; X.strokeStyle = '#000'; X.shadowColor = '#ffd54f'; X.shadowBlur = 24;
    X.strokeText('?', 0, h * .2); const g = X.createLinearGradient(0, -h * .3, 0, h * .3); g.addColorStop(0, '#fff59d'); g.addColorStop(1, '#ff9800'); X.fillStyle = g; X.fillText('?', 0, h * .2); X.restore()
  };
  window.drawSel = function () {
    const t = selT, arc = mode == 'arcade';
    // fondo: oscuro, con focos de color tras cada luchador, rayos y niebla
    const bg = X.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#07060b'); bg.addColorStop(.6, '#120a12'); bg.addColorStop(1, '#050408'); X.fillStyle = bg; X.fillRect(0, 0, W, H);
    [0, 1].forEach(p => { const ch = arc && p ? null : selCh(cur[p]), x = p ? 660 : 300, c = ch ? ch.c : '#1976d2', rg = X.createRadialGradient(x, 250, 10, x, 250, 330); rg.addColorStop(0, c + '30'); rg.addColorStop(.6, c + '0e'); rg.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = rg; X.fillRect(0, 0, W, H) });
    X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const a = (i - 2.5) * .22 + Math.sin(t / 90 + i) * .03; X.save(); X.translate(W / 2, -40); X.rotate(a); const g2 = X.createLinearGradient(0, 0, 0, 520); g2.addColorStop(0, 'rgba(200,175,140,.04)'); g2.addColorStop(1, 'rgba(200,175,140,0)'); X.fillStyle = g2; X.fillRect(-26, 0, 52, 520); X.restore() } X.restore();
    // suelo reflectante
    const fl = X.createLinearGradient(0, 385, 0, 436); fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(1, 'rgba(0,0,0,.6)'); X.fillStyle = fl; X.fillRect(0, 385, W, 51);
    // luchadores
    [0, 1].forEach(p => {
      if (arc && p) return; const ch = selCh(cur[p]), a = selA[p], face = p ? -1 : 1, lk = lock[p], sn = !!(ch.soon || ch.rand);
      if (a.id != cur[p]) { a.id = cur[p]; a.t = 0 } a.t++;
      if (lk && !a.lk) a.lt = 0; a.lk = lk; a.lt++;
      const e = 1 - Math.pow(1 - Math.min(1, a.t / 14), 3), cx = (p ? 660 : 300) + (1 - e) * (p ? 70 : -70), bob = Math.sin(t / 13 + p * 2) * 2.2;
      X.fillStyle = 'rgba(0,0,0,.55)'; X.beginPath(); X.ellipse(cx, 408, 92, 13, 0, 0, 7); X.fill();
      TINT = p == 1 && cur[0] == cur[1] ? 1 : 0; X.save(); X.globalAlpha = Math.max(0, e); (ch.soon ? soonArt(ch, cx, 410 + bob * .3, 340, t) : ch.rand ? randArt(cx, 408, 300, t) : bigArt(ch, cx, 408 + bob * .3, 336, face, lk && a.lt < 44 && ch.A ? (ch.A.st.cast2 && a.lt > 22 ? 'cast2' : 'cast') : null, a.t)); X.restore();
      TINT = 0; if (a.t < 8) { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .35 * (1 - a.t / 8); X.fillStyle = '#fff'; X.fillRect(cx - 150, 80, 300, 340); X.restore() }
      if (lk && a.lt < 22) { X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = PCOL[p]; X.lineWidth = 6 * (1 - a.lt / 22) + 1; X.globalAlpha = 1 - a.lt / 22; X.beginPath(); X.ellipse(cx, 410, 40 + a.lt * 8, 8 + a.lt * 1.6, 0, 0, 7); X.stroke(); X.restore() }
      if (lk) { X.save(); X.translate(cx, 120); X.rotate(-.12); const k = Math.min(1, a.lt / 8); X.scale(1 + (1 - k) * 1.2, 1 + (1 - k) * 1.2); X.globalAlpha = k; X.textAlign = 'center'; X.font = 'italic 40px Impact,sans-serif'; X.lineWidth = 7; X.strokeStyle = '#10051a'; X.lineJoin = 'round'; X.strokeText('¡LISTO!', 0, 0); X.fillStyle = PCOL[p]; X.fillText('¡LISTO!', 0, 0); X.restore() }
      // nombre, apodo y mini-estadísticas
      const nx = p ? W - 26 : 26, al = p ? 'right' : 'left', st = (typeof STORY != 'undefined' && STORY[ch.id]) || { a: '' }, ne = Math.min(1, a.t / 10);
      X.save(); X.globalAlpha = ne; X.textAlign = al; X.font = 'italic 900 44px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 8; X.strokeStyle = '#000'; try { X.letterSpacing = '2px' } catch (er) { }
      X.save(); X.shadowColor = ch.c; X.shadowBlur = 14; X.strokeText(ch.n.toUpperCase(), nx, 392); X.restore(); const ng = X.createLinearGradient(0, 355, 0, 395); ng.addColorStop(0, '#fff'); ng.addColorStop(1, '#d9d9e4'); X.fillStyle = ng; X.fillText(ch.n.toUpperCase(), nx, 392);
      try { X.letterSpacing = '3px' } catch (er) { } X.font = 'italic bold 11px sans-serif'; X.fillStyle = '#a8935a'; X.fillText(st.a, nx, 409); try { X.letterSpacing = '0px' } catch (er) { }
      if (sn) {   // PRÓXIMAMENTE / ALEATORIO: sin estadísticas ni habilidades
        X.restore(); X.save(); X.textAlign = al; const sh = soonNo[p] > 0 ? Math.sin(soonNo[p] * 1.4) * 6 : 0, hot = soonNo[p] > 0;
        X.font = 'italic bold 11px sans-serif'; X.fillStyle = '#a8935a'; try { X.letterSpacing = '3px' } catch (er) { } X.fillText(ch.rand ? 'SORPRESA' : 'NUEVO LUCHADOR', nx, 409);
        X.font = 'italic 900 21px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 5; X.strokeStyle = '#000'; try { X.letterSpacing = '1px' } catch (er) { }
        const tx = ch.rand ? 'AL AZAR' : 'PRÓXIMAMENTE', ty = 466; X.globalAlpha = hot ? 1 : .75 + .25 * Math.sin(t / 9); X.strokeText(tx, nx + sh, ty); X.fillStyle = hot ? '#ff5252' : ch.rand ? '#ffd54f' : '#d9c98a'; X.fillText(tx, nx + sh, ty); X.globalAlpha = 1;
        X.font = 'bold 9px sans-serif'; X.fillStyle = 'rgba(255,255,255,.75)'; try { X.letterSpacing = '0px' } catch (er) { }
        X.fillText(ch.rand ? 'PULSA ' + padBtn('p') + ' PARA ELEGIR' : 'HABILIDADES: PRÓXIMAMENTE', nx, 486); X.fillText(ch.rand ? padBtn('x') + ' = ALEATORIO EN CUALQUIER CASILLA' : 'AÚN NO SE PUEDE ELEGIR', nx, 499); try { X.letterSpacing = '0px' } catch (er) { } X.restore(); return
      }
      const pw = ch.x[1].d || (ch.x[1].pct ? 25 : 14), bx = p ? W - 26 - 170 : 26; bar5(bx, 417, 170, 'VIDA', ch.hp / 115, '#6f8f78'); bar5(bx, 427, 170, 'VELOCIDAD', ch.s / 5.6, '#5b7f99'); bar5(bx, 437, 170, 'PODER', pw / 28, '#a8503a');
      X.restore();
      // "elige variación": HAB / ESP / ULTRA (el resaltado rota solo)
      const hi = ((t / 110) | 0) % 4, ux = ULT[ch.id] || { n: 'Ultra' }, names = [ch.k[1].n, ch.x[1].n, ch.z[1].n, ux.n], labs = [padB1('s'), padB1('x'), padB1('z'), 'ULT'], cols = ['#a8935a', '#9c6238', '#8f3d32', '#75598c'];
      for (let k = 0; k < 4; k++) { const cxk = p ? W - 44 - k * 44 : 44 + k * 44; circle(cxk, 472, 19, labs[k], cols[k], k == hi) }
      X.save(); X.textAlign = al; X.font = 'bold 11px sans-serif'; try { X.letterSpacing = '1px' } catch (er) { } X.fillStyle = cols[hi]; X.fillText(['ESPECIAL 1', 'ESPECIAL 2', 'ESPECIAL 3', 'ULTRA'][hi], nx, 506); X.fillStyle = '#fff'; X.fillText(names[hi].toUpperCase(), nx, 520); X.restore()
    });
    if (arc) arcPanel(W - 12 - 262, 66, 262, 340);
    // cabecera
    const hk = arc ? 'ARCADE' : mode == 'train' ? 'ENTRENAMIENTO' : '1 VS 1', g = X.createLinearGradient(0, 8, 0, 48); g.addColorStop(0, '#7b7f89'); g.addColorStop(.5, '#2a2c33'); g.addColorStop(1, '#0c0d11');
    X.beginPath(); X.moveTo(W / 2 - 230, 8); X.lineTo(W / 2 + 230, 8); X.lineTo(W / 2 + 208, 48); X.lineTo(W / 2 - 208, 48); X.closePath(); X.fillStyle = g; X.fill(); X.strokeStyle = '#8f7a3a'; X.lineWidth = 2; X.stroke();
    X.textAlign = 'center'; X.font = 'italic 900 25px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 6; X.strokeStyle = '#000'; try { X.letterSpacing = '6px' } catch (er) { }
    const tg = X.createLinearGradient(0, 16, 0, 42); tg.addColorStop(0, '#e2dac4'); tg.addColorStop(1, '#8c7440'); X.strokeText('ELIGE TU LUCHADOR', W / 2, 38); X.fillStyle = tg; X.fillText('ELIGE TU LUCHADOR', W / 2, 38); try { X.letterSpacing = '0px' } catch (er) { }
    X.font = 'bold 10px sans-serif'; X.fillStyle = 'rgba(255,255,255,.75)'; try { X.letterSpacing = '2px' } catch (er) { } X.fillText(hk + '  ·  ' + (arc ? padBtn('p') + ' = LISTO · ' + padBtn('k') + ' = VOLVER' : mode == 'train' ? 'ELIGE TU LUCHADOR Y LUEGO EL DUMMY' : 'AMBOS ELIGEN A LA VEZ'), W / 2, 62); try { X.letterSpacing = '0px' } catch (er) { }
    // cuadrícula inferior (2 filas)
    const TW = 44, GP = 4, GX = (W - (COLS * TW + (COLS - 1) * GP)) / 2, GY1 = 446, pu = .5 + .5 * Math.sin(t / 8);
    const tile = (r, i, hov) => {
      const x = GX + (i % COLS) * (TW + GP), y = GY1 + ((i / COLS) | 0) * (TW + GP), h0 = cur[0] == i, h1 = cur[1] == i && !arc;
      X.save(); if (hov) { X.translate(x + TW / 2, y + TW / 2); X.scale(1.14, 1.14); X.translate(-x - TW / 2, -y - TW / 2) }
      X.fillStyle = '#0a0a10'; X.fillRect(x - 1, y - 1, TW + 2, TW + 2);
      if (r.soon) {
        if (r.im.complete && r.im.naturalWidth) { X.save(); X.beginPath(); X.rect(x, y, TW, TW); X.clip(); X.drawImage(r.im, x, y, TW, TW); X.fillStyle = 'rgba(0,0,0,.45)'; X.fillRect(x, y, TW, TW); X.restore() }
        X.strokeStyle = hov ? '#fff' : 'rgba(143,122,58,.55)'; X.lineWidth = hov ? 2 : 1.2; X.setLineDash(hov ? [] : [3, 3]); X.strokeRect(x, y, TW, TW); X.setLineDash([]);
        X.textAlign = 'center'; X.fillStyle = '#d9c98a'; X.font = 'bold 7px sans-serif'; X.strokeStyle = '#000'; X.lineWidth = 2.5; X.lineJoin = 'round';
        ['PRÓXIMA', 'MENTE'].forEach((tx, j) => { X.strokeText(tx, x + TW / 2, y + 24 + j * 8); X.fillText(tx, x + TW / 2, y + 24 + j * 8) });
        X.font = 'bold 6px sans-serif'; X.fillStyle = '#fff'; X.strokeText(r.n.toUpperCase(), x + TW / 2, y + 9); X.fillText(r.n.toUpperCase(), x + TW / 2, y + 9)
      } else if (r.rand) {
        const g2 = X.createLinearGradient(x, y, x, y + TW); g2.addColorStop(0, '#3a2a10'); g2.addColorStop(1, '#14100a'); X.fillStyle = g2; X.fillRect(x, y, TW, TW);
        X.strokeStyle = hov ? '#fff' : 'rgba(255,213,79,.7)'; X.lineWidth = hov ? 2 : 1.2; X.strokeRect(x, y, TW, TW);
        X.textAlign = 'center'; X.font = 'italic 900 28px Impact,sans-serif'; X.lineJoin = 'round'; X.lineWidth = 4; X.strokeStyle = '#000'; X.strokeText('?', x + TW / 2, y + 28); X.fillStyle = '#ffd54f'; X.fillText('?', x + TW / 2, y + 28);
        X.font = 'bold 6px sans-serif'; X.fillStyle = '#fff'; X.fillText('ALEATORIO', x + TW / 2, y + TW - 5)
      } else portrait(r, x, y, TW, 2, hov ? '#fff' : 'rgba(143,122,58,.7)', hov ? 2 : 1.2);
      if (!hov) { X.fillStyle = 'rgba(0,0,0,.22)'; X.fillRect(x, y, TW, TW) }
      else { const bx = x - 30 + (t * 1.6) % 110; X.save(); X.beginPath(); X.rect(x, y, TW, TW); X.clip(); X.fillStyle = 'rgba(255,255,255,.28)'; X.beginPath(); X.moveTo(bx, y + TW); X.lineTo(bx + 10, y + TW); X.lineTo(bx + 30, y); X.lineTo(bx + 20, y); X.fill(); X.restore() }
      [[0, h0], [1, h1]].forEach(([pl, on]) => {
        if (!on) return; const o = (pl && h0 ? 3 : 0) + pu * 1.2; X.save(); X.shadowColor = PCOL[pl]; X.shadowBlur = 10 + 6 * pu; X.lineWidth = 2.6; X.strokeStyle = PCOL[pl]; X.strokeRect(x - o, y - o, TW + 2 * o, TW + 2 * o); X.restore();
        const tx = pl ? x + TW - 16 + o : x - o; X.fillStyle = PCOL[pl]; rr(tx, y - o - 11, 16, 11, 3); X.fill(); X.fillStyle = '#10051a'; X.font = 'bold 8px sans-serif'; X.textAlign = 'center'; X.fillText('P' + (pl + 1), tx + 8, y - o - 2.5);
        if (lock[pl]) { X.globalAlpha = .4; X.fillStyle = PCOL[pl]; X.fillRect(x, y, TW, TW); X.globalAlpha = 1 }
      }); X.restore()
    };
    const ALL = R.concat(SOON, [RANDCH]), on = i => cur[0] == i || (cur[1] == i && !arc);
    ALL.forEach((r, i) => { if (!on(i)) tile(r, i, false) }); ALL.forEach((r, i) => { if (on(i)) tile(r, i, true) });
    X.textAlign = 'center'; X.font = '10px sans-serif'; X.fillStyle = 'rgba(255,255,255,.5)'; X.fillText(padBtn('p') + ' ELEGIR   ·   ' + padBtn('k') + ' VOLVER   ·   ' + padBtn('x') + ' ALEATORIO', W / 2, 425);
    X.save(); vig(); embers(.4); X.restore()
  };
  const oldVS = window.drawVS;
  window.drawVS = function () {
    oldVS(); X.save(); X.setTransform(S, 0, 0, S, 0, 0); const t = vsT;
    vig(); embers(.5); frame();
    if (t > 22 && t < 34) { X.fillStyle = 'rgba(255,255,255,' + (.7 * (1 - (t - 22) / 12)) + ')'; X.fillRect(0, 0, W, H) }   // flash al aparecer VS
    // placa inferior metálica con el escenario
    const g = X.createLinearGradient(0, 490, 0, 540); g.addColorStop(0, '#5b5f68'); g.addColorStop(.4, '#1c1d23'); g.addColorStop(1, '#08090c'); X.fillStyle = g; X.fillRect(18, 494, W - 36, 38);
    X.fillStyle = '#8f7a3a'; X.fillRect(18, 494, W - 36, 2); X.textAlign = 'center'; X.font = 'bold 19px Impact,sans-serif'; try { X.letterSpacing = '4px' } catch (e) { } X.fillStyle = '#fff'; X.fillText('📍 ' + STGN[stg].toUpperCase() + '   ·   PREPÁRATE', W / 2, 520);
    try { X.letterSpacing = '0px' } catch (e) { } X.restore()
  };
})();

// ---- FASE 3: RAYOS X en golpes brutales + REMATE FINAL caricaturesco (solo 1v1)
(function () {
  let xr = null, xrCool = 0, rem = null; const fin = { f: false, l: false };
  addEventListener('keydown', e => { if (e.code == 'KeyF') fin.f = true; if (e.code == 'KeyL') fin.l = true });
  const oldHit = window.hit;
  window.hit = function (f, e, d, st, o) {
    const hp0 = e.hp; const r = oldHit.apply(this, arguments);
    if (typeof sc !== 'undefined' && sc == 'fight' && state == 'fight' && !xr && xrCool <= 0 && hp0 - e.hp >= 14 && e.hp > 0 && (f.ult || 0) >= 34) {
      f.ult -= 34; e.hp = Math.max(1, e.hp - 8); xr = { e, t: 0, N: 46 }; xrCool = 360; hstop = Math.max(hstop || 0, 46);   // congela el combate mientras dura
    }
    return r
  };
  const bone = (x, y, s, t) => {
    X.save(); X.translate(x, y); X.scale(s, s); X.lineCap = 'round'; X.strokeStyle = '#e8f6ff'; X.fillStyle = '#e8f6ff'; X.shadowColor = '#4fc3f7'; X.shadowBlur = 14;
    const ln = (a, b, c, d, w) => { X.lineWidth = w; X.beginPath(); X.moveTo(a, b); X.lineTo(c, d); X.stroke() };
    X.beginPath(); X.arc(0, -118, 14, 0, 7); X.fill(); X.fillStyle = '#0a1a2a'; X.fillRect(-8, -121, 5, 6); X.fillRect(3, -121, 5, 6);   // cráneo
    ln(0, -104, 0, -20, 6); for (let i = 0; i < 5; i++) { ln(0, -96 + i * 10, -22 + i, -90 + i * 10, 3); ln(0, -96 + i * 10, 22 - i, -90 + i * 10, 3) }   // columna y costillas
    ln(-18, -20, 18, -20, 6); ln(-10, -20, -14, 36, 6); ln(10, -20, 14, 36, 6); ln(-14, 36, -14, 82, 5); ln(14, 36, 14, 82, 5);   // pelvis y piernas
    ln(-22, -98, -34, -52, 5); ln(22, -98, 34, -52, 5); ln(-34, -52, -40, -18, 4); ln(34, -52, 40, -18, 4);                          // brazos
    if (t > 14) { X.strokeStyle = '#ff3b30'; X.shadowColor = '#f00'; X.lineWidth = 4; const k = Math.min(1, (t - 14) / 8); ln(-14, 36, -14 + 8 * k, 36 + 14 * k, 4); ln(0, -60, 7 * k, -60 + 12 * k, 4) }   // fractura
    X.restore()
  };
  const oldDraw = window.draw;
  window.draw = function () {
    oldDraw(); if (xrCool > 0) xrCool--;
    if (typeof sc === 'undefined' || sc != 'fight') { xr = null; rem = null; return }
    X.save(); X.setTransform(S, 0, 0, S, 0, 0);
    if (xr) {
      const t = xr.t++, k = Math.min(1, t / 6, (xr.N - t) / 8), e = xr.e, sx = W / 2 + (e.x - cam.x) * cam.z, sy = GY + 30;
      X.fillStyle = 'rgba(2,12,30,' + .78 * k + ')'; X.fillRect(0, 0, W, H);
      X.globalAlpha = k; const g = X.createRadialGradient(sx, sy - 90, 10, sx, sy - 90, 240); g.addColorStop(0, 'rgba(79,195,247,.55)'); g.addColorStop(1, 'rgba(79,195,247,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
      bone(sx, sy, 1.5 * cam.z, t); if (t > 14 && t < 20) { X.fillStyle = 'rgba(255,255,255,.7)'; X.fillRect(0, 0, W, H) }
      X.fillStyle = '#fff'; X.font = 'italic 900 40px Impact,sans-serif'; X.textAlign = 'center'; X.lineWidth = 8; X.strokeStyle = '#003'; X.strokeText('RAYOS X', W / 2, 90); X.fillText('RAYOS X', W / 2, 90); X.globalAlpha = 1;
      if (xr.t >= xr.N) xr = null
    }
    // REMATE FINAL: el ganador lo activa con F (teclado) / L (P2) / botón Y del mando durante el aviso
    if (state == 'over' && win && win.w >= 0) {
      if (!rem) { rem = { t: 0, on: false, w: 0 }; fin.f = fin.l = false }
      const L = F[1 - win.w], pad = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(g => g && g.buttons[3] && g.buttons[3].pressed);
      if (!rem.on) { rem.w++; if ((win.w == 0 ? fin.f : fin.l) || pad) rem.on = true; else if (rem.w < 160) {
        X.font = 'italic 900 28px Impact,sans-serif'; X.textAlign = 'center'; X.lineJoin = 'round'; X.lineWidth = 6; X.strokeStyle = '#000'; X.fillStyle = '#ffd54f'; const m = '¡REMATE FINAL!  PULSA △'; X.globalAlpha = .7 + .3 * Math.sin(rem.w / 5); X.strokeText(m, W / 2, 176); X.fillText(m, W / 2, 176); X.globalAlpha = 1 } }
      if (rem.on) { const t = rem.t++;
      if (t > 14 && t < 150) {
        const k = Math.min(1, (t - 14) / 10), sx = W / 2 + (L.x - cam.x) * cam.z, sy = GY - 60;
        X.save(); X.globalAlpha = k * .55; X.fillStyle = '#000'; X.fillRect(0, 0, W, H); X.restore();
        for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283, r = Math.min(260, (t - 14) * 7) * (.5 + (i % 3) * .25); X.globalAlpha = Math.max(0, 1 - (t - 14) / 130); X.fillStyle = i % 2 ? '#ffd54f' : '#ff5252'; X.save(); X.translate(sx + Math.cos(a) * r, sy + Math.sin(a) * r * .7 - t * .6); X.rotate(t / 10 + i); X.beginPath(); for (let j = 0; j < 10; j++) { const rr = j % 2 ? 6 : 14; X.lineTo(Math.cos(j * .628) * rr, Math.sin(j * .628) * rr) } X.fill(); X.restore() }
        X.globalAlpha = 1; X.save(); X.translate(W / 2, 168); const s = 1 + Math.max(0, 1 - (t - 14) / 8) * 1.4; X.scale(s, s); X.rotate(-.04); X.font = 'italic 900 56px Impact,sans-serif'; X.textAlign = 'center'; X.lineJoin = 'round'; X.lineWidth = 11; X.strokeStyle = '#000'; try { X.letterSpacing = '4px' } catch (e) { } X.strokeText('¡REMATE FINAL!', 0, 0); X.fillStyle = '#ff1744'; X.fillText('¡REMATE FINAL!', 0, 0); X.restore();
        X.font = 'bold 26px Impact,sans-serif'; X.textAlign = 'center'; X.lineWidth = 6; X.strokeStyle = '#000'; try { X.letterSpacing = '3px' } catch (e) { } const nm = F[win.w].ch.n.toUpperCase() + ' LE DA SU MERECIDO A ' + L.ch.n.toUpperCase(); X.strokeText(nm, W / 2, 208); X.fillStyle = '#fff'; X.fillText(nm, W / 2, 208); try { X.letterSpacing = '0px' } catch (e) { }
      } }
    } else rem = null;
    X.restore()
  };
})();
