// FÉNIX FIGHT - ESCENARIOS OSCUROS Y MALIGNOS (dark.js)
// Se carga DESPUÉS de game.js y ANTES de mk.js. Reemplaza los escenarios dibujados por código por versiones sombrías
// (sin nieve, sin estrellas, sin luces de colores, sin fuegos artificiales) y oscurece los escenarios con foto.
// Todo el "feeling" se ajusta en DK (abajo): intensidad de la niebla, de la viñeta y del tinte de los escenarios con foto.
(() => {
  const DK = {
    fog: 1,          // 0 = sin niebla · 1 = normal · 1.5 = muy densa
    photoTint: 'rgb(120,62,72)',   // tinte (multiplicado) sobre los escenarios con foto
    photoSat: .8,    // cuánto se apaga el color de las fotos (0 = nada, 1 = blanco y negro)
    photoVig: .75    // oscuridad de los bordes en las fotos
  };
  window.DK = DK;

  // ---------- utilidades ----------
  const mistSprite = (rgb, a) => {   // mancha de niebla suave (se dibuja escalada, nunca es un punto de luz)
    const c = document.createElement('canvas'); c.width = 480; c.height = 120; const g = c.getContext('2d');
    for (let i = 0; i < 26; i++) {
      const x = 50 + Math.random() * 380, y = 28 + Math.random() * 64, r = 38 + Math.random() * 62, q = g.createRadialGradient(x, y, 2, x, y, r);
      q.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); q.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    return c
  };
  const SPR = {
    ash: mistSprite('40,34,40', .5), blood: mistSprite('70,8,14', .45), grey: mistSprite('70,74,84', .4),
    green: mistSprite('26,46,40', .5), rust: mistSprite('80,34,18', .4), smoke: mistSprite('12,10,14', .6)
  };
  function fog(t, spr, n, a, yBase, ySpread, wBase, speed) {
    X.save();
    for (let i = 0; i < n; i++) {
      const w = wBase * (.7 + sr(i, 4) * .6), span = W + w * 1.5, x = wrapN(sr(i, 1) * span + t * speed * (.5 + sr(i, 2)), span) - w * .75, y = yBase + sr(i, 3) * ySpread;
      X.globalAlpha = Math.min(1, a * DK.fog) * (.7 + .3 * Math.sin(t * .35 + i * 2)); X.drawImage(spr, x, y, w, w * .25)
    }
    X.restore()
  }
  const vignette = (g, a) => {
    const r = g.createRadialGradient(W / 2, H * .55, H * .22, W / 2, H * .55, H * .98); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,' + a + ')');
    g.fillStyle = r; g.fillRect(0, 0, W, H)
  };
  const floorShadow = (g, a) => { g.fillStyle = grad(g, GY, GY + 22, [[0, 'rgba(0,0,0,' + (a || .6) + ')'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, GY, W, 22) };
  const jag = (g, x0, x1, base, hMin, hMax, col, step) => {   // silueta irregular (ruinas / montañas rotas)
    g.fillStyle = col; g.beginPath(); g.moveTo(x0, base);
    for (let x = x0; x <= x1; x += step) g.lineTo(x, base - hMin - Math.random() * (hMax - hMin)); g.lineTo(x1, base); g.fill()
  };
  const deadTree = (g, x, y, len, ang, w, d, col) => {
    if (d <= 0 || len < 5) return; const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    g.strokeStyle = col; g.lineWidth = Math.max(1, w); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    deadTree(g, x2, y2, len * rnd(.66, .82), ang + rnd(.2, .75), w * .68, d - 1, col); deadTree(g, x2, y2, len * rnd(.6, .78), ang - rnd(.2, .75), w * .68, d - 1, col)
  };
  const stain = (g, n, y0, col) => {   // charcos de sangre seca en el suelo
    for (let i = 0; i < n; i++) { const x = Math.random() * W, y = y0 + 8 + Math.random() * (H - y0 - 14), r = 6 + Math.random() * 26; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, r * 1.8, r * .38, 0, 0, 7); g.fill() }
  };
  const crack = (g, x, y, n, col, lw) => {
    g.strokeStyle = col; g.lineWidth = lw || 1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y);
    for (let i = 0; i < n; i++) { x += rnd(-26, 30); y += rnd(-4, 9); g.lineTo(x, y) } g.stroke()
  };
  const skull = (g, x, y, s) => {
    g.fillStyle = '#6f6656'; g.beginPath(); g.ellipse(x, y, 9 * s, 8 * s, 0, 0, 7); g.fill(); g.fillRect(x - 5 * s, y + 4 * s, 10 * s, 6 * s);
    g.fillStyle = '#08040a'; g.beginPath(); g.ellipse(x - 3.4 * s, y, 2.4 * s, 2.8 * s, 0, 0, 7); g.ellipse(x + 3.4 * s, y, 2.4 * s, 2.8 * s, 0, 0, 7); g.fill(); g.fillRect(x - 3 * s, y + 6 * s, 1.4 * s, 4 * s); g.fillRect(x + 1.6 * s, y + 6 * s, 1.4 * s, 4 * s)
  };
  const bloodMoon = (g, mx, my, r, glow) => {
    let q = g.createRadialGradient(mx, my, r * .4, mx, my, r * 4.2); q.addColorStop(0, 'rgba(150,18,22,' + glow + ')'); q.addColorStop(.35, 'rgba(80,8,16,' + glow * .45 + ')'); q.addColorStop(1, 'rgba(30,0,8,0)');
    g.fillStyle = q; g.fillRect(mx - r * 4.2, my - r * 4.2, r * 8.4, r * 8.4);
    g.fillStyle = '#6e1216'; g.beginPath(); g.arc(mx, my, r, 0, 7); g.fill();
    g.fillStyle = 'rgba(20,2,6,.35)'; [[-.3, -.2, .22], [.25, .15, .3], [-.05, .4, .15], [.35, -.35, .12]].forEach(([a, b, c]) => { g.beginPath(); g.arc(mx + a * r, my + b * r, c * r, 0, 7); g.fill() })
  };
  const cloudBands = (g, y0, y1, col, n) => {
    g.fillStyle = col; for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * (i / n) + Math.random() * 14, x = Math.random() * W, w = 260 + Math.random() * 420; g.beginPath(); g.ellipse(x, y, w, 7 + Math.random() * 13, 0, 0, 7); g.fill() }
  };
  const crow = (t, i, y0, y1, sp) => {   // cuervos: silueta negra, sin brillo
    const x = wrapN(t * sp + i * 270, W + 160) - 80, y = y0 + (y1 - y0) * sr(i, 8) + Math.sin(t * 1.3 + i) * 8, w = Math.sin(t * 7 + i * 2) * 7;
    X.save(); X.strokeStyle = '#050206'; X.lineWidth = 2.4; X.lineCap = 'round'; X.beginPath(); X.moveTo(x - 11, y - w); X.quadraticCurveTo(x - 4, y - 4, x, y); X.quadraticCurveTo(x + 4, y - 4, x + 11, y - w); X.stroke(); X.restore()
  };

  // ---------- 1. AZOTEA MALDITA ----------
  function stAzotea() {
    const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#0a0410'], [.5, '#2d0a16'], [1, '#7a1a1c']]); g.fillRect(0, 0, W, GY);
    bloodMoon(g, 690, 118, 58, .9); cloudBands(g, 40, 220, 'rgba(8,2,8,.55)', 9);
    jag(g, 0, W, GY - 20, 90, 260, '#1a0b12', 36);
    for (let i = 0; i < 12; i++) { const x = i * 84 + Math.random() * 30, w = 50 + Math.random() * 40, h = 120 + Math.random() * 190; g.fillStyle = '#12080e'; g.beginPath(); g.moveTo(x, GY - 20); g.lineTo(x, GY - 20 - h); g.lineTo(x + w * .4, GY - 20 - h - Math.random() * 18); g.lineTo(x + w * .7, GY - 20 - h + Math.random() * 14); g.lineTo(x + w, GY - 20 - h + Math.random() * 30); g.lineTo(x + w, GY - 20); g.fill();
      g.fillStyle = '#050205'; for (let k = 0; k < 6; k++) { g.fillRect(x + 6 + Math.random() * (w - 18), GY - 20 - h + 14 + Math.random() * (h - 30), 6, 9) } }   // ventanas rotas (negras)
    g.strokeStyle = '#06020a'; g.lineWidth = 2; [[120, 150], [610, 190], [880, 120]].forEach(([x, h]) => { g.beginPath(); g.moveTo(x, GY - 20); g.lineTo(x, GY - 20 - h - 40); g.stroke(); g.beginPath(); g.moveTo(x - 16, GY - 20 - h); g.lineTo(x + 16, GY - 20 - h); g.stroke() });   // antenas
    g.fillStyle = grad(g, GY - 60, GY, [[0, 'rgba(70,14,16,0)'], [1, 'rgba(70,14,16,.22)']]); g.fillRect(0, GY - 60, W, 60);
    // barandal retorcido
    g.strokeStyle = '#0a0508'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, GY - 46); for (let x = 0; x <= W; x += 40) g.lineTo(x, GY - 46 + Math.sin(x * .05) * 4 + (x % 240 < 40 ? 14 : 0)); g.stroke();
    for (let x = 14; x < W; x += 40) { if (Math.random() < .18) continue; g.fillStyle = '#0a0508'; g.fillRect(x, GY - 52, 4, 52 - Math.random() * 14) }
    g.fillStyle = grad(g, GY, H, [[0, '#2c2230'], [.4, '#1b141e'], [1, '#0a070d']]); g.fillRect(0, GY, W, H - GY);   // concreto sucio
    for (let i = 0; i < 10; i++) crack(g, Math.random() * W, GY + 14 + Math.random() * 80, 7, 'rgba(0,0,0,.75)', 1.6);
    stain(g, 14, GY, 'rgba(70,6,10,.5)'); floorShadow(g, .7); vignette(g, .42); return c
  }
  function anAzotea(t) {
    fog(t, SPR.blood, 7, .28, 70, 130, 560, 7); fog(t, SPR.smoke, 6, .3, GY - 140, 150, 520, 5);
    for (let i = 0; i < 4; i++) crow(t, i, 50, 190, 22 + i * 5);
    fog(t, SPR.ash, 6, .3, GY - 10, 80, 600, 9)
  }

  // ---------- 2. CUMBRE MALDITA ----------
  function stCumbre() {
    const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#07091a'], [.5, '#271326'], [1, '#6a1a26']]); g.fillRect(0, 0, W, GY);
    bloodMoon(g, 230, 130, 46, .85); cloudBands(g, 30, 200, 'rgba(6,3,10,.6)', 9);
    const mt = (base, hMin, hMax, col, cap) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= W + 40; x += 24) { const h = hMin + (hMax - hMin) * Math.abs(Math.sin(x * .006 + base) * .7 + Math.sin(x * .017 + base * 2) * .3) + Math.random() * 14; g.lineTo(x, base - h) } g.lineTo(W, GY); g.fill();
      void cap };
    mt(GY - 50, 70, 230, '#262836', '#7a7f92'); mt(GY - 20, 40, 130, '#14121c', null);
    for (let x = 0; x < W; x += 12 + Math.random() * 16) { const h = 40 + Math.random() * 80, y = GY - 6 - Math.random() * 10; g.fillStyle = '#040306'; for (let k = 0; k < 3; k++) { const w = h * .2 * (1 + k * .4), yy = y - h + k * h * .26; g.beginPath(); g.moveTo(x, yy - h * .18); g.lineTo(x - w, yy + h * .3); g.lineTo(x + w, yy + h * .3); g.fill() } g.fillRect(x - 2, y - 6, 4, 10) }   // pinos negros
    deadTree(g, 90, GY + 6, 70, -Math.PI / 2 - .1, 7, 6, '#050306'); deadTree(g, 880, GY + 6, 82, -Math.PI / 2 + .12, 8, 6, '#050306'); deadTree(g, 760, GY + 6, 48, -Math.PI / 2, 5, 5, '#07050a');
    g.fillStyle = '#07050a'; g.fillRect(300, GY - 62, 96, 60); g.beginPath(); g.moveTo(288, GY - 60); g.lineTo(348, GY - 100); g.lineTo(408, GY - 60); g.fill(); g.fillStyle = '#020104'; g.fillRect(332, GY - 40, 20, 40);   // cabaña abandonada, sin luz
    g.fillStyle = grad(g, GY, H, [[0, '#4c4e5c'], [.3, '#2a2b36'], [1, '#101016']]); g.fillRect(0, GY, W, H - GY);   // nieve sucia, casi negra
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(0,0,0,' + (.2 + Math.random() * .3) + ')'; g.fillRect(Math.random() * W, GY + 4 + Math.random() * (H - GY), 4 + Math.random() * 14, 2) }
    stain(g, 18, GY, 'rgba(80,6,10,.55)'); floorShadow(g, .7); vignette(g, .45); return c
  }
  function anCumbre(t) {
    fog(t, SPR.grey, 7, .3, GY - 120, 140, 620, 7); fog(t, SPR.blood, 5, .2, 90, 120, 520, 5); fog(t, SPR.grey, 7, .34, GY - 10, 90, 640, 11)
  }

  // ---------- 3. PUERTO FANTASMA ----------
  function stPuerto() {
    const HY = GY - 90; const [c, g] = mkc(); g.fillStyle = grad(g, 0, HY, [[0, '#070716'], [.5, '#2a1033'], [1, '#6a1c34']]); g.fillRect(0, 0, W, HY);
    bloodMoon(g, 560, 110, 52, .9); cloudBands(g, 40, 200, 'rgba(6,2,10,.55)', 8);
    g.fillStyle = grad(g, HY, GY, [[0, '#34173a'], [1, '#0a0612']]); g.fillRect(0, HY, W, GY - HY);   // agua negra
    g.fillStyle = 'rgba(120,16,24,.22)'; for (let i = 0; i < 28; i++) g.fillRect(560 - 30 + Math.random() * 60 - i * 1.5, HY + 3 + i * 3.1, 20 + Math.random() * 56 - i, 2);   // reflejo de la luna
    g.fillStyle = '#05030a'; g.beginPath(); g.moveTo(0, HY + 36); g.lineTo(30, HY - 34); g.lineTo(220, HY - 22); g.lineTo(330, HY + 22); g.lineTo(300, HY + 40); g.fill();   // casco de barco hundido
    g.strokeStyle = '#05030a'; g.lineWidth = 3; g.beginPath(); g.moveTo(110, HY - 30); g.lineTo(100, HY - 190); g.moveTo(190, HY - 26); g.lineTo(196, HY - 150); g.stroke();
    g.fillStyle = 'rgba(8,4,12,.9)'; g.beginPath(); g.moveTo(100, HY - 186); g.lineTo(60, HY - 110); g.lineTo(84, HY - 96); g.lineTo(70, HY - 50); g.lineTo(104, HY - 70); g.fill();   // vela rota
    [[640, 14], [790, 11]].forEach(([x, h]) => { g.fillStyle = '#04030a'; g.fillRect(x, HY - h * 4, 3, h * 4 + 20); g.fillRect(x - 14, HY - h * 4, 30, 3) });   // postes
    for (let i = 0; i < 8; i++) { g.fillStyle = '#060309'; g.fillRect(i * 126 + 20, HY + 24, 8, 44) }   // pilotes
    g.fillStyle = grad(g, GY, H, [[0, '#4a3022'], [.4, '#2a1a14'], [1, '#0c0808']]); g.fillRect(0, GY, W, H - GY);   // muelle podrido
    g.fillStyle = 'rgba(0,0,0,.6)'; for (let y = GY + 8; y < H; y += 13 + (y - GY) * .05) g.fillRect(0, y, W, 2);
    for (let i = 0; i < 50; i++) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(Math.random() * W, GY + Math.random() * (H - GY), 2, 6 + Math.random() * 12) }
    for (let i = 0; i < 6; i++) { g.fillStyle = '#020104'; g.fillRect(40 + i * 170 + Math.random() * 30, GY + 20 + Math.random() * 50, 30 + Math.random() * 40, 5) }   // tablas rotas
    stain(g, 12, GY, 'rgba(70,6,10,.5)'); floorShadow(g, .7); vignette(g, .45); return c
  }
  function anPuerto(t) {
    X.save(); const HY = GY - 90; X.strokeStyle = 'rgba(90,70,90,.22)'; X.lineWidth = 1.4;
    for (let i = 0; i < 16; i++) { const y = HY + 8 + sr(i, 1) * 78, x = wrapN(sr(i, 2) * W + t * 6 * (.4 + sr(i, 3)), W + 80) - 40, w = 40 + sr(i, 4) * 70; X.beginPath(); X.moveTo(x, y); X.quadraticCurveTo(x + w / 2, y + 2.5, x + w, y); X.stroke() }
    X.restore(); fog(t, SPR.green, 8, .32, GY - 150, 150, 600, 8); fog(t, SPR.ash, 6, .3, GY - 10, 90, 640, 10)
  }

  // ---------- 4. INFIERNO (antes Volcán) ----------
  const CR2 = Array.from({ length: 18 }, (_, i) => { let x = sr(i, 1) * W, y = GY + 12 + sr(i, 2) * (H - GY - 26); const p = [[x, y]]; for (let k = 0; k < 6; k++) { x += (sr(i + k, 3) - .35) * 62; y += (sr(i + k, 4) - .5) * 15; p.push([x, y]) } return p });
  function stInfierno() {
    const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#0c0206'], [.45, '#3a0a10'], [.8, '#8a1c0e'], [1, '#c4400e']]); g.fillRect(0, 0, W, GY);
    cloudBands(g, 40, 260, 'rgba(8,1,3,.6)', 11);
    jag(g, 0, W, GY - 10, 60, 150, '#1c070a', 28);
    g.fillStyle = grad(g, 120, GY, [[0, '#1c0a0d'], [1, '#0c0407']]); g.beginPath(); g.moveTo(90, GY); g.lineTo(400, 156); g.lineTo(432, 138); g.lineTo(528, 138); g.lineTo(560, 156); g.lineTo(870, GY); g.closePath(); g.fill();
    g.strokeStyle = '#6a1a08'; g.lineWidth = 2.4; g.lineCap = 'round'; for (let k = 0; k < 5; k++) { let x = 450 + k * 16, y = 142; g.beginPath(); g.moveTo(x, y); while (y < GY - 10) { x += (x < 480 ? -1 : 1) * Math.random() * 12; y += 14 + Math.random() * 14; g.lineTo(x, y) } g.stroke() }   // ríos de lava apagados
    g.fillStyle = grad(g, GY, H, [[0, '#2e1612'], [.4, '#1a0c0c'], [1, '#080304']]); g.fillRect(0, GY, W, H - GY);
    g.strokeStyle = '#7a1c0a'; g.lineWidth = 3; CR2.forEach(p => { g.beginPath(); p.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke() });
    for (let i = 0; i < 6; i++) skull(g, 60 + i * 170 + Math.random() * 40, GY + 36 + Math.random() * 60, .7 + Math.random() * .4);
    floorShadow(g, .7); vignette(g, .42); return c
  }
  function anInfierno(t) {
    X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round';
    const pg = .5 + .5 * Math.sin(t * 1.3); let q = X.createRadialGradient(480, 140, 8, 480, 140, 150); q.addColorStop(0, 'rgba(150,26,10,' + (.22 + .16 * pg) + ')'); q.addColorStop(1, 'rgba(90,0,0,0)'); X.fillStyle = q; X.fillRect(300, 0, 360, 320);   // respira, no parpadea
    X.strokeStyle = 'rgb(150,26,8)'; X.lineWidth = 2.6; CR2.forEach((p, i) => { X.globalAlpha = .12 + .22 * (.5 + .5 * Math.sin(t * .9 + i * 1.7)); X.beginPath(); p.forEach((s, j) => j ? X.lineTo(s[0], s[1]) : X.moveTo(s[0], s[1])); X.stroke() });
    X.restore(); fog(t, SPR.smoke, 7, .4, 40, 220, 600, 6); fog(t, SPR.blood, 6, .32, GY - 80, 110, 620, 8)
  }

  // ---------- 5. TEMPLO PROFANADO (antes Dojo) ----------
  function stTemplo() {
    const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#12060c'], [1, '#2e0e12']]); g.fillRect(0, 0, W, GY);
    for (let i = 0; i < 7; i++) { const x = 40 + i * 140, wg = g.createLinearGradient(0, 70, 0, 330); wg.addColorStop(0, 'rgba(120,20,40,.7)'); wg.addColorStop(1, 'rgba(50,8,22,.75)'); g.fillStyle = wg; g.fillRect(x, 70, 96, 262);
      g.strokeStyle = '#030102'; g.lineWidth = 5; g.strokeRect(x, 70, 96, 262); g.lineWidth = 2.5; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x + k * 32, 70); g.lineTo(x + k * 32, 332); g.stroke() } g.beginPath(); g.moveTo(x, 70 + 87); g.lineTo(x + 96, 70 + 87); g.moveTo(x, 70 + 175); g.lineTo(x + 96, 70 + 175); g.stroke();
      g.strokeStyle = '#030102'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); const a = x + Math.random() * 96, b = 70 + Math.random() * 262; g.moveTo(a, b); g.lineTo(a + rnd(-30, 30), b + rnd(-30, 30)); g.stroke() } }   // celosías rotas
    g.fillStyle = '#240c10'; g.fillRect(0, 36, W, 34); g.fillRect(0, 332, W, 28); g.fillStyle = '#030102'; g.fillRect(0, 32, W, 6); g.fillRect(0, 356, W, 5);
    [0, 270, 690, 960].forEach(x => { g.fillStyle = '#2c1014'; g.fillRect(x - 17, 0, 34, GY); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x + 4, 0, 11, GY) });   // columnas oscuras
    const cx = 480, cy = 214; let q = g.createRadialGradient(cx, cy, 20, cx, cy, 170); q.addColorStop(0, 'rgba(90,8,14,.4)'); q.addColorStop(1, 'rgba(50,0,6,0)'); g.fillStyle = q; g.fillRect(cx - 170, cy - 170, 340, 340);
    g.fillStyle = '#0a0204'; g.beginPath(); g.arc(cx, cy, 78, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#3a0a0e'; g.stroke();   // emblema profanado: ojo/garra
    g.fillStyle = '#5a0a10'; [-1, 1].forEach(s => { g.save(); g.translate(cx, cy + 6); g.scale(s, 1); g.beginPath(); g.moveTo(6, 36); g.quadraticCurveTo(70, 20, 66, -52); g.quadraticCurveTo(44, -20, 30, -8); g.quadraticCurveTo(20, 10, 6, 36); g.fill(); g.restore() });
    g.fillStyle = '#7a1218'; g.beginPath(); g.ellipse(cx, cy + 2, 6, 34, 0, 0, 7); g.fill();
    g.fillStyle = grad(g, GY, H, [[0, '#38201c'], [.4, '#1e100e'], [1, '#080404']]); g.fillRect(0, GY, W, H - GY);   // piedra / madera podrida
    for (let i = 0; i < 16; i++) { const x = i * 64 - 20; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(480 + (x - 480) * .55, GY); g.lineTo(480 + (x - 480) * 1.9, H); g.stroke() }
    for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, GY + 6 + i * i * 3.2); g.lineTo(W, GY + 6 + i * i * 3.2); g.stroke() }
    for (let i = 0; i < 6; i++) crack(g, Math.random() * W, GY + 14 + Math.random() * 80, 6, 'rgba(0,0,0,.8)', 1.6);
    stain(g, 16, GY, 'rgba(80,6,10,.55)'); floorShadow(g, .7); vignette(g, .45); return c
  }
  function anTemplo(t) {
    [[90, 56], [380, 70], [580, 66], [850, 60]].forEach(([x, len], i) => {   // estandartes rasgados que se mecen
      const sw = Math.sin(t * .9 + i * 1.7) * 7; X.save(); X.translate(x, 36); X.fillStyle = '#240609'; X.beginPath(); X.moveTo(-17, 0); X.lineTo(17, 0); X.lineTo(15 + sw, len); X.lineTo(8 + sw, len - 14); X.lineTo(0 + sw, len + 10); X.lineTo(-8 + sw, len - 10); X.lineTo(-16 + sw, len); X.closePath(); X.fill(); X.fillStyle = '#0b0204'; X.fillRect(-20, -2, 40, 5); X.restore()
    });
    fog(t, SPR.blood, 7, .26, 90, 160, 560, 6); fog(t, SPR.ash, 6, .32, GY - 20, 90, 620, 9)
  }

  // ---------- 6. CALLEJÓN MALDITO (antes Barrio Neón) ----------
  function stCallejon() {
    const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#0a0610'], [1, '#2a1220']]); g.fillRect(0, 0, W, GY);
    for (let L = 0; L < 2; L++) { const n = L ? 9 : 13, col = L ? '#241520' : '#33202e'; for (let i = 0; i < n; i++) { const w = L ? 118 : 82, x = i * (W / n) - 10 + Math.random() * 14, h = (L ? 250 : 190) + Math.random() * (L ? 120 : 90), y = GY - h; g.fillStyle = col; g.fillRect(x, y, w, h);
        g.fillStyle = 'rgba(0,0,0,.6)'; for (let wy = y + 16; wy < GY - 24; wy += 22) for (let wx = x + 10; wx < x + w - 12; wx += 18) if (Math.random() > .35) g.fillRect(wx, wy, 9, 13);   // ventanas apagadas
        if (Math.random() < .6) { g.strokeStyle = '#0c060c'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + w * .15, y + h * (.3 + k * .18)); g.lineTo(x + w * .85, y + h * (.3 + k * .18)); g.stroke() } g.beginPath(); g.moveTo(x + w * .15, y + h * .3); g.lineTo(x + w * .15, y + h * .66); g.moveTo(x + w * .85, y + h * .3); g.lineTo(x + w * .85, y + h * .66); g.stroke() } } }   // escaleras de incendio
    g.fillStyle = '#050204'; g.fillRect(430, 80, 110, 38); g.strokeStyle = '#1a0a0e'; g.lineWidth = 3; g.strokeRect(430, 80, 110, 38); g.fillStyle = '#2a0a0e'; g.font = 'bold 26px Impact,sans-serif'; g.textAlign = 'center'; g.fillText('B  R', 485, 108);   // cartel muerto
    g.fillStyle = grad(g, GY - 120, GY, [[0, 'rgba(90,20,30,0)'], [1, 'rgba(90,20,30,.35)']]); g.fillRect(0, GY - 120, W, 120);
    [[70, 130], [860, 150]].forEach(([x, h]) => { g.fillStyle = '#060306'; g.fillRect(x - 3, GY - h, 6, h); g.fillRect(x - 22, GY - h, 44, 10); g.fillRect(x - 22, GY - h - 6, 3, 8) });   // postes con focos rotos
    g.fillStyle = '#070408'; g.fillRect(600, GY - 70, 110, 70); g.fillRect(590, GY - 78, 130, 10); g.fillStyle = '#0e070a'; g.fillRect(150, GY - 44, 70, 44); g.fillRect(142, GY - 52, 86, 9);   // contenedores
    g.fillStyle = grad(g, GY, H, [[0, '#241a26'], [.4, '#140e18'], [1, '#08050a']]); g.fillRect(0, GY, W, H - GY);   // calle mojada
    for (let i = 0; i < 8; i++) { const x = Math.random() * W, y = GY + 16 + Math.random() * 80; g.fillStyle = 'rgba(70,14,20,.25)'; g.beginPath(); g.ellipse(x, y, 40 + Math.random() * 60, 6 + Math.random() * 5, 0, 0, 7); g.fill() }
    stain(g, 18, GY, 'rgba(80,6,10,.5)'); g.strokeStyle = 'rgba(255,255,255,.04)'; g.lineWidth = 2; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(0, GY + 12 + i * i * 1.1); g.lineTo(W, GY + 12 + i * i * 1.1); g.stroke() }
    floorShadow(g, .7); vignette(g, .48); return c
  }
  function anCallejon(t) {
    X.save(); X.strokeStyle = 'rgba(70,60,80,.28)'; X.lineWidth = 1.2; for (let i = 0; i < 80; i++) { const x = sr(i, 1) * (W + 60), y = wrapN(sr(i, 3) * H + t * (260 + sr(i, 2) * 160), H + 40) - 20; X.beginPath(); X.moveTo(x, y); X.lineTo(x - 3, y + 14); X.stroke() } X.restore();   // llovizna fría
    [[66, GY - 160], [884, GY - 40], [640, GY - 76]].forEach(([x, y], i) => { for (let k = 0; k < 4; k++) { const p = (t * .22 + k * .25 + i * .3) % 1; X.save(); X.globalAlpha = (1 - p) * .28; X.fillStyle = '#4a4650'; X.beginPath(); X.arc(x + Math.sin(p * 5 + i) * 10, y - p * 90, 9 + p * 26, 0, 7); X.fill(); X.restore() } });   // vapor de las tuberías
    fog(t, SPR.ash, 7, .3, GY - 100, 110, 600, 8); fog(t, SPR.blood, 5, .2, GY - 10, 90, 620, 11)
  }

  // ---------- 7. BOSQUE MUERTO (antes Bosque de Bambú) ----------
  function stBosque() {
    const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#060a0c'], [.5, '#14241f'], [1, '#34503f']]); g.fillRect(0, 0, W, GY);
    bloodMoon(g, 740, 120, 44, .75); cloudBands(g, 40, 200, 'rgba(2,4,4,.5)', 8);
    jag(g, 0, W, GY, 80, 190, '#16241f', 22);
    const stalk = (x, w, h, col, dk) => { g.fillStyle = col; g.fillRect(x, GY - h, w, h + 40); g.fillStyle = dk; g.fillRect(x + w * .7, GY - h, w * .3, h + 40); for (let y = GY - h + 28; y < GY; y += 50 + (x % 18)) { g.fillStyle = '#020303'; g.fillRect(x - 1, y, w + 2, 3) } if (Math.random() < .5) { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); const yy = GY - h * (.4 + Math.random() * .4); g.moveTo(x + w / 2, yy); g.lineTo(x + w / 2 + rnd(-40, 40), yy - rnd(10, 40)); g.stroke() } };
    for (let i = 0; i < 28; i++) stalk(i * 36 - 10 + Math.random() * 16, 8, GY + 20 - Math.random() * 60, '#26402f', '#14241a');
    for (let i = 0; i < 13; i++) stalk(i * 76 + Math.random() * 28, 14, GY + 90, '#1a2e22', '#0c1810');
    deadTree(g, 150, GY + 8, 64, -Math.PI / 2 + .08, 7, 6, '#030504'); deadTree(g, 820, GY + 8, 70, -Math.PI / 2 - .1, 8, 6, '#030504');
    g.fillStyle = grad(g, GY, H, [[0, '#34302a'], [.5, '#1a1814'], [1, '#080806']]); g.fillRect(0, GY, W, H - GY);   // barro negro
    for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(' + (14 + Math.random() * 14 | 0) + ',' + (20 + Math.random() * 14 | 0) + ',14,.6)'; g.beginPath(); g.ellipse(Math.random() * W, GY + 6 + Math.random() * (H - GY), 3 + Math.random() * 8, 1 + Math.random() * 2, 0, 0, 7); g.fill() }
    for (let i = 0; i < 5; i++) { g.strokeStyle = '#030403'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); const x = 60 + i * 200 + Math.random() * 60, y = GY + 24 + Math.random() * 60; g.moveTo(x, y); g.quadraticCurveTo(x + 40, y - 22, x + 80, y + 4); g.stroke() }   // raíces
    skull(g, 330, GY + 70, .8); skull(g, 640, GY + 48, .7);
    stain(g, 10, GY, 'rgba(60,6,10,.5)'); floorShadow(g, .7); vignette(g, .5); return c
  }
  function anBosque(t) {
    fog(t, SPR.green, 8, .36, GY - 170, 170, 640, 7); fog(t, SPR.green, 7, .34, GY - 20, 100, 660, 10);
    X.save(); for (let i = 0; i < 10; i++) { const x = wrapN(sr(i, 1) * W + t * (10 + sr(i, 2) * 10) + Math.sin(t + i) * 20, W + 20) - 10, y = wrapN(sr(i, 3) * (GY + 90) + t * (16 + sr(i, 4) * 16), GY + 90) - 20; X.save(); X.translate(x, y); X.rotate(t + i); X.fillStyle = '#1a120c'; X.beginPath(); X.ellipse(0, 0, 5, 2.4, 0, 0, 7); X.fill(); X.restore() } X.restore()   // hojas muertas
  }

  // ---------- 8. DESIERTO DE HUESOS (antes Desierto del Ocaso) ----------
  function stDesierto() {
    const [c, g] = mkc(); g.fillStyle = grad(g, 0, GY, [[0, '#0a0310'], [.4, '#38081a'], [.75, '#8a1a14'], [1, '#c4480e']]); g.fillRect(0, 0, W, GY);
    const sx = 480, sy = GY - 80; let q = g.createRadialGradient(sx, sy, 30, sx, sy, 300); q.addColorStop(0, 'rgba(150,26,14,.55)'); q.addColorStop(.4, 'rgba(80,10,10,.25)'); q.addColorStop(1, 'rgba(40,0,6,0)'); g.fillStyle = q; g.fillRect(sx - 300, sy - 300, 600, 600);
    g.fillStyle = '#050102'; g.beginPath(); g.arc(sx, sy, 62, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(160,24,16,.55)'; g.stroke();   // eclipse: sol negro
    cloudBands(g, 40, 230, 'rgba(6,1,4,.5)', 8);
    [['#3a0e14', 130, 40], ['#240a10', 95, 70], ['#12060a', 60, 110]].forEach(([col, h, gap]) => { g.fillStyle = col; for (let i = 0; i < 6; i++) { const w = 120 + Math.random() * 120, x = i * (W / 5.4) + Math.random() * 50 - gap; g.beginPath(); g.moveTo(x, GY); g.lineTo(x + 14, GY - h); g.lineTo(x + w - 14, GY - h + 6); g.lineTo(x + w, GY); g.fill() } });
    g.fillStyle = '#12060a'; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= W; x += 14) g.lineTo(x, GY - 30 - Math.sin(x * .011) * 20 - Math.sin(x * .031) * 7); g.lineTo(W, GY); g.fill();
    g.strokeStyle = '#5c5444'; g.lineWidth = 6; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(780, GY + 4); g.quadraticCurveTo(740 + i * 14, GY - 70 - i * 6, 800 + i * 26, GY - 90 + i * 8); g.stroke() }   // costillar gigante
    g.strokeStyle = '#4a4336'; g.lineWidth = 7; g.beginPath(); g.moveTo(770, GY + 6); g.lineTo(770, GY - 10); g.stroke();
    deadTree(g, 140, GY + 6, 56, -Math.PI / 2 + .1, 6, 5, '#050102');
    g.fillStyle = grad(g, GY, H, [[0, '#5a2018'], [.4, '#341410'], [1, '#100606']]); g.fillRect(0, GY, W, H - GY);   // arena oscura
    for (let i = 0; i < 60; i++) { g.strokeStyle = 'rgba(0,0,0,' + (.1 + Math.random() * .16) + ')'; g.lineWidth = 2; g.beginPath(); const y = GY + 6 + Math.random() * (H - GY); g.moveTo(Math.random() * W, y); g.lineTo(Math.random() * W, y + 6); g.stroke() }
    for (let i = 0; i < 7; i++) skull(g, 50 + i * 140 + Math.random() * 50, GY + 30 + Math.random() * 70, .7 + Math.random() * .5);
    for (let i = 0; i < 12; i++) { g.strokeStyle = '#5c5444'; g.lineWidth = 3; g.lineCap = 'round'; const x = Math.random() * W, y = GY + 20 + Math.random() * 90; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-22, 22), y + rnd(-5, 5)); g.stroke() }   // huesos
    stain(g, 10, GY, 'rgba(70,4,8,.5)'); floorShadow(g, .7); vignette(g, .45); return c
  }
  function anDesierto(t) {
    X.save(); const sx = 480, sy = GY - 80, p = .5 + .5 * Math.sin(t * .8); X.strokeStyle = 'rgba(170,26,16,' + (.35 + .2 * p) + ')'; X.lineWidth = 4; X.beginPath(); X.arc(sx, sy, 63, 0, 7); X.stroke(); X.restore();   // corona del eclipse
    fog(t, SPR.rust, 8, .32, GY - 90, 110, 640, 18); fog(t, SPR.smoke, 5, .26, 40, 150, 560, 6); for (let i = 0; i < 3; i++) crow(t, i, 60, 150, 16 + i * 4)
  }

  // ---------- registro: sustituye los escenarios por código (0-3 y 8-11) ----------
  const DEF = [
    [0, 'Azotea Maldita', stAzotea, anAzotea], [1, 'Cumbre Maldita', stCumbre, anCumbre], [2, 'Puerto Fantasma', stPuerto, anPuerto], [3, 'El Infierno', stInfierno, anInfierno],
    [8, 'Templo Profanado', stTemplo, anTemplo], [9, 'Callejón Maldito', stCallejon, anCallejon], [10, 'Bosque Muerto', stBosque, anBosque], [11, 'Desierto de Huesos', stDesierto, anDesierto]
  ];
  DEF.forEach(([i, n, mk, an]) => { if (!STG[i]) return; STGN[i] = n; STG[i] = { n, bg: mk(), anim: an, dk: 1 } });

  // ---------- escenarios con foto (4-7): se oscurecen, sin luces ni partículas ----------
  // photoStage() llama a darkPhoto(t) en lugar de sus efectos de luz (mariposas, rayos de sol, polvo brillante, pájaros claros).
  window.darkPhoto = (t, full) => {
    X.save(); X.globalCompositeOperation = 'saturation'; X.fillStyle = 'rgba(128,128,128,' + DK.photoSat + ')'; X.fillRect(0, 0, W, H);
    X.globalCompositeOperation = 'multiply'; X.fillStyle = DK.photoTint; X.fillRect(0, 0, W, H); X.globalCompositeOperation = 'source-over';
    const vg = X.createRadialGradient(W / 2, H * .5, H * .2, W / 2, H * .5, H * .95); vg.addColorStop(0, 'rgba(0,0,0,.25)'); vg.addColorStop(1, 'rgba(0,0,0,' + DK.photoVig + ')'); X.fillStyle = vg; X.fillRect(0, 0, W, H);
    X.restore(); fog(t, SPR.blood, 6, .3, 120, 160, 560, 6); fog(t, SPR.ash, 6, .34, GY - 40, 110, 620, 9)
  };
  [4, 5, 6, 7].forEach((i, k) => { if (STG[i]) STGN[i] = ['Facultad Abandonada', 'Patio Marchito', 'Patio del Invierno Eterno', 'La Casa Maldita'][k] ; if (STG[i]) STG[i].n = STGN[i] });
})();
