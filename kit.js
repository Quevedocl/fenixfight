// FÉNIX FIGHT - KIT DE MOVIMIENTOS (reemplaza las habilidades y combos antiguos)
// Cada luchador tiene: estilo, 3 especiales (E1 = U / ;, E2 = I / /, E3 = Y / N), agarre (H / Enter), definitiva (O / M) y pasiva.
// Se carga ANTES de game.js. game.js lee KIT[id] y lo conecta al motor (cast, grabHit, ULT, hooks de pasivas).
//
// Formato de un especial: [tipo, { n: nombre, cd: recarga en frames (60 = 1 s), d: daño, ... , tx: texto de la pantalla de movimientos }]
//   Tipos: P proyectil · A golpe de área · D embestida · W teletransporte (detrás o delante del rival) · H cura/velocidad
//          S escudo · K contragolpe (provocación) · Y barrera de papeleo · V vehículo/multitud que cruza la pantalla
//          T camión · O Omnitrix (transformación aleatoria)
//   Opciones útiles: st:['stun'|'slow'|'root'|'burn'|'invert'|'freeze'|'blind', frames] · gl: emoji del proyectil/efecto · push: empuje · kd: derriba
//                    up: lanza al aire · pull: atrae · volley: n proyectiles · steal: roba % de ULTRA · light: es luz (carga a Gastón)
// Agarre g: { n, d, vx (lanzamiento), st, gl, tx } · Definitiva u: se mezcla sobre ULT (game.js) · Pasiva p: { id, n, tx }
const KIT = {
  mario: {
    st: 'velocidad y presión',
    e: [['D', { n: 'Tacones de acero', cd: 140, d: 13, v: 30, kd: 1, tx: 'Una patada giratoria rapidísima.' }],
      ['P', { n: 'Actitud de reina', cd: 330, d: 5, v: 15, w: 40, st: ['stun', 60], gl: '💋', col: '#ff4081', tx: 'Lanza un beso que aturde al rival de pura impresión.' }],
      ['A', { n: 'Aquí mando yo', cd: 420, d: 15, r: 135, dl: 7, kd: 1, push: 20, col: '#ff80ab', gl: '👠', tx: 'Combinación de golpes rápidos que termina con un empujón.' }]],
    g: { n: 'Rechazo absoluto', d: 12, vx: 26, tx: 'Toma al enemigo y lo lanza lejos.' },
    u: { n: 'Marcha del Orgullo', q: '¡Con brillo!', c1: '#ff80ab', c2: '#ffd54f', st: 'rain', glyph: '✨', d: 42, tx: 'Entrada triunfal con una lluvia de efectos brillantes que golpea a todos los enemigos cercanos.' },
    p: { id: 'dodgeSpeed', n: 'Orgullo indestructible', tx: 'Después de esquivar un ataque, obtiene velocidad extra.' }
  },
  tono: {
    st: 'engaño y contraataques',
    e: [['P', { n: 'Besito traicionero', cd: 150, d: 8, v: 17, w: 36, gl: '💋', col: '#f06292', tx: 'Lanza un beso energético que alcanza al enemigo a distancia.' }],
      ['K', { n: 'Diva dramática', cd: 360, win: 70, col: '#ba68c8', tx: 'Pose exagerada: si el rival cae en la provocación y ataca, pierde su oportunidad (queda aturdido).' }],
      ['W', { n: 'Cambio de look', cd: 420, d: 12, st: ['stun', 25], col: '#e040fb', gl: '👗', tx: 'Giro acrobático: aparece detrás del contrincante y lo golpea.' }]],
    g: { n: 'Abrazo mortal', d: 12, vx: 8, st: ['stun', 30], tx: 'Abraza al rival y lo arroja al suelo.' },
    u: { n: 'Noche de Gala', q: '¡Luces, cámara, pelea!', c1: '#ff80ab', c2: '#7c4dff', st: 'rain', glyph: '🪩', d: 40, status: ['stun', 50], tx: 'Luces de discoteca y una coreografía explosiva que termina con un golpe espectacular.' },
    p: { id: 'confuse', n: 'El espectáculo', tx: 'Sus movimientos especiales tienen una pequeña posibilidad de confundir al rival.' }
  },
  rafa: {
    st: 'control y resistencia',
    e: [['P', { n: 'Agua bendita', cd: 160, d: 6, v: 15, w: 40, push: 22, gl: '💧', col: '#4fc3f7', tx: 'Lanza agua bendita que hace retroceder al rival.' }],
      ['A', { n: 'Exorcismo', cd: 420, d: 4, r: 300, dl: 16, st: ['root', 80], col: '#e1f5fe', gl: '⛓️', tx: 'Cadenas espirituales inmovilizan brevemente al enemigo.' }],
      ['A', { n: '¡Ave María!', cd: 450, d: 17, r: 140, dl: 14, kd: 1, col: '#ffd54f', gl: '📖', tx: 'Golpea con una Biblia gigante.' }]],
    g: { n: 'Confesión obligatoria', d: 10, vx: 3, st: ['stun', 45], tx: 'Obliga al enemigo a arrodillarse y le da un coscorrón.' },
    u: { n: 'Juicio Final', q: 'Descansa en paz.', c1: '#fff8e1', c2: '#4fc3f7', st: 'rays', d: 44, status: ['stun', 60], tx: 'Un enorme vitral celestial y una luz divina caen sobre el enemigo.' },
    p: { id: 'blockHeal', n: 'Fe inquebrantable', tx: 'Recupera una pequeña cantidad de vida cuando bloquea ataques consecutivos.' }
  },
  jp: {
    st: 'distancia y recursos',
    e: [['P', { n: 'Tarjeta Black', cd: 150, d: 8, v: 19, w: 36, st: ['stun', 25], gl: '💳', col: '#212121', tx: 'Arroja una tarjeta de crédito que golpea al rival.' }],
      ['A', { n: 'Qué ordinario', cd: 360, d: 4, r: 200, dl: 9, st: ['slow', 150], col: '#d7ccc8', gl: '🤧', tx: 'Saca un pañuelo perfumado: una nube que ralentiza al enemigo.' }],
      ['V', { n: 'Uber Premium', cd: 480, d: 17, gl: '🚘', sz: 120, spd: 26, tx: 'Aparece un automóvil de lujo que atropella al contrincante (se esquiva saltando).' }]],
    g: { n: 'No me toques', d: 10, vx: 22, gl: '💂', tx: 'Llama a un guardia que saca al enemigo de encima.' },
    u: { n: 'Herencia Familiar', q: '¡Apellido compuesto!', c1: '#ffd54f', c2: '#4e342e', st: 'rain', glyph: '💸', d: 40, status: ['stun', 60], tx: 'Aparece una mansión y una lluvia de dinero aplasta al rival.' },
    p: { id: 'moneyDodge', n: 'Pago simbólico', tx: 'Tiene una probabilidad de evitar un golpe pagando simbólicamente con dinero.' }
  },
  gonza: {
    st: 'técnico y agresivo',
    e: [['A', { n: 'Corte militar', cd: 150, d: 13, r: 135, dl: 8, kd: 1, col: '#b0bec5', gl: '✂️', tx: 'Un corte con una máquina de afeitar gigante.' }],
      ['D', { n: 'Orden de combate', cd: 330, d: 13, v: 28, st: ['stun', 25], tx: 'Grita una orden militar y carga contra el enemigo.' }],
      ['P', { n: 'Navajazo de precisión', cd: 420, d: 12, v: 22, w: 36, back: 1, gl: '🔪', col: '#cfd8dc', tx: 'Lanza una navaja de barbero que vuelve como un búmeran.' }]],
    g: { n: 'Corte de emergencia', d: 11, vx: 6, st: ['stun', 45], gl: '✂️', tx: 'Atrapa al enemigo y le hace un corte de pelo forzado.' },
    u: { n: 'Peluquería de Campaña', q: '¡Pa\' la nuca, hermano!', c1: '#eceff1', c2: '#b71c1c', st: 'rain', glyph: '✂️', d: 40, status: ['stun', 50], tx: 'Aparece una silla de barbero militar y ejecuta cortes y golpes a velocidad absurda (se transforma en barbero).' },
    p: { id: 'chain', n: 'Disciplina militar', tx: 'Cada ataque consecutivo aumenta ligeramente su velocidad.' }
  },
  manu: {
    st: 'control del escenario',
    e: [['A', { n: 'Raíces invasoras', cd: 180, d: 6, r: 210, dl: 10, st: ['root', 100], col: '#2e7d32', gl: '🌿', tx: 'Raíces salen del suelo y atrapan los pies del enemigo.' }],
      ['A', { n: 'Reforestación violenta', cd: 400, d: 16, r: 140, dl: 18, up: 1, col: '#43a047', gl: '🌳', tx: 'Hace crecer un árbol debajo del contrincante y lo lanza por los aires.' }],
      ['P', { n: 'Extinción', cd: 420, d: 9, v: 24, w: 70, push: 20, gl: '💦', col: '#29b6f6', tx: 'Dispara un potente chorro de agua para empujar al rival.' }]],
    g: { n: 'Abrazo del bosque', d: 12, vx: 4, st: ['stun', 30], gl: '🌲', tx: 'Unas ramas envuelven al enemigo y lo azotan contra el suelo.' },
    u: { n: 'La Naturaleza Reclama', q: '¡Todo es ecológico!', c1: '#69f0ae', c2: '#1b5e20', st: 'leaves', d: 40, status: ['root', 110], tx: 'El escenario se transforma en un bosque y enormes raíces golpean al adversario.' },
    p: { id: 'still', n: 'Fotosíntesis', tx: 'Recupera energía (ULTRA y recargas) cuando permanece quieto unos segundos.' }
  },
  mono: {
    st: 'trampas y burocracia',
    e: [['P', { n: 'Trámite pendiente', cd: 170, d: 4, v: 15, w: 36, volley: 3, gl: '📄', col: '#eceff1', tx: 'Lanza una montaña de documentos que golpea al rival.' }],
      ['Y', { n: 'Vuelva mañana', cd: 420, win: 160, tx: 'Crea una barrera de papeleo que bloquea proyectiles.' }],
      ['A', { n: 'Permiso rechazado', cd: 440, d: 9, r: 140, dl: 14, st: ['stun', 50], col: '#e53935', gl: '🛑', tx: 'Coloca un sello gigante sobre el enemigo y lo deja aturdido.' }]],
    g: { n: 'Atención al público', d: 11, vx: 24, gl: '🏢', tx: 'Lo toma y lo lanza fuera de la oficina.' },
    u: { n: 'Municipalidad en Paro', q: 'Vuelva mañana.', c1: '#eceff1', c2: '#546e7a', st: 'rain', glyph: '🖨️', d: 40, status: ['stun', 60], tx: 'Aparecen funcionarios, escritorios, archivadores y una impresora gigante que aplasta al rival.' },
    p: { id: 'cheapBlock', n: 'Reglamento interno', tx: 'Sus bloqueos consumen menos energía (la guardia se rompe mucho más difícil).' }
  },
  ale: {
    st: 'ritmo y movilidad',
    e: [['A', { n: 'Dance Break', cd: 150, d: 11, r: 130, dl: 7, kd: 1, col: '#f48fb1', gl: '🎵', tx: 'Ejecuta un paso de baile que golpea al enemigo.' }],
      ['P', { n: 'Lightstick explosivo', cd: 330, d: 12, v: 19, w: 40, boom: 1, gl: '🪄', col: '#f48fb1', tx: 'Lanza un lightstick que explota al impactar.' }],
      ['W', { n: 'Fanservice', cd: 420, front: 1, st: ['slow', 100], boost: 100, gl: '😘', col: '#f8bbd0', tx: 'Hace una pose que distrae al rival y permite acercarse rápidamente.' }]],
    g: { n: 'Coreografía obligatoria', d: 11, vx: 12, st: ['stun', 40], gl: '🎶', tx: 'Obliga al enemigo a bailar y termina lanzándolo.' },
    u: { n: 'World Tour', q: '¡Gracias, Army!', c1: '#f48fb1', c2: '#ce93d8', st: 'hearts', glyph: '🎶', d: 38, heal: 12, tx: 'Luces, pantallas y bailarines hacen una coreografía mientras golpean al rival.' },
    p: { id: 'rhythm', n: 'Sentido del ritmo', tx: 'Si conecta ataques siguiendo el ritmo (golpes a intervalos regulares), aumenta su velocidad.' }
  },
  alonso: {
    st: 'velocidad y provocación',
    e: [['P', { n: 'Mirada irresistible', cd: 170, d: 4, v: 18, w: 40, st: ['slow', 130], gl: '😏', col: '#ce93d8', tx: 'Lanza una mirada que ralentiza al rival.' }],
      ['D', { n: 'Cita inesperada', cd: 330, d: 15, v: 34, tx: 'Se acerca rápidamente y conecta una combinación de golpes.' }],
      ['H', { n: 'Descontrol hormonal', cd: 540, boost: 240, col: '#e53935', tx: 'Entra en un estado de velocidad extrema durante unos segundos.' }]],
    g: { n: 'No te vayas todavía', d: 12, vx: 18, gl: '💞', tx: 'Atrapa al enemigo y lo hace girar antes de lanzarlo.' },
    u: { n: 'Cita de 5 Minutos', q: 'Apagón, mi amor.', c1: '#ce93d8', c2: '#880e4f', st: 'hearts', glyph: '❤️', d: 42, status: ['stun', 50], tx: 'Una habitación romántica, música dramática y una secuencia de golpes que termina con un corazón gigante explotando.' },
    p: { id: 'hitSpeed', n: 'Galán herido', tx: 'Después de recibir daño, aumenta temporalmente su velocidad.' }
  },
  rosita: {
    st: 'tanque y recuperación',
    e: [['P', { n: 'Sopaipillazo', cd: 160, d: 9, v: 15, w: 50, st: ['stun', 30], sp: 'sopa', col: '#f5b041', tx: 'Lanza una sopaipilla gigante como proyectil.' }],
      ['H', { n: 'Té con cariño', cd: 480, heal: 14, clean: 1, gl: '🍵', col: '#a5d6a7', tx: 'Toma una taza de té y recupera vida.' }],
      ['P', { n: 'Chancletazo', cd: 400, d: 11, v: 14, w: 46, hom: 1, life: 150, sp: 'chancla', col: '#a1887f', tx: 'Lanza una chancla que persigue al enemigo.' }]],
    g: { n: 'Ven para acá, mijito', d: 11, vx: 5, st: ['stun', 30], gl: '👂', tx: 'Lo toma de la oreja y lo tira al suelo.' },
    u: { n: 'Once Familiar', q: '¡A comer, mijito!', c1: '#f5b041', c2: '#c2185b', st: 'rain', glyph: '🥟', d: 40, pull: 1, status: ['stun', 50], tx: 'Una mesa gigantesca llena de sopaipillas cae sobre el enemigo.' },
    p: { id: 'hpBonus', n: 'Abuela fuerte', tx: 'Comienza cada ronda con un poco más de vida que los demás.' }
  },
  tata: {
    st: 'fuerza y carisma',
    e: [['P', { n: 'Guiño mortal', cd: 160, d: 6, v: 19, w: 36, st: ['stun', 40], gl: '😉', col: '#26c6da', tx: 'Lanza un guiño que aturde.' }],
      ['A', { n: 'Flexión de músculos', cd: 330, d: 12, r: 175, dl: 8, push: 22, col: '#ffb74d', gl: '💪', tx: 'Pose muscular que genera una onda expansiva.' }],
      ['A', { n: 'Perfume de seducción', cd: 420, d: 4, r: 200, dl: 10, st: ['slow', 150], col: '#f48fb1', gl: '🌸', tx: 'Libera una nube de perfume que ralentiza al enemigo.' }]],
    g: { n: 'Abrazo de galán', d: 13, vx: 24, up: -15, tx: 'Levanta al rival y lo arroja con una sola mano.' },
    u: { n: 'El Hombre Perfecto', q: 'Chakal nomá.', c1: '#ffffff', c2: '#00acc1', st: 'rays', d: 42, status: ['blind', 180], tx: 'Camina en cámara lenta, se quita los lentes de sol y un destello de belleza impacta al rival (lo encandila).' },
    p: { id: 'knock', n: 'Carisma bruto', tx: 'Sus ataques fuertes tienen mayor probabilidad de hacer retroceder al rival.' }
  },
  tiorene: {
    st: 'apoyo y control',
    e: [['A', { n: 'Contacto arriba', cd: 170, d: 9, r: 120, dl: 14, push: 24, col: '#ffcc80', gl: '📞', tx: 'Llama por teléfono y aparece un asistente que empuja al enemigo.' }],
      ['S', { n: 'Favorcito', cd: 540, hp: 14, t: 420, col: '#ffd54f', gl: '🤝', tx: 'Obtiene un escudo temporal gracias a sus contactos.' }],
      ['A', { n: 'Ascenso inesperado', cd: 420, d: 14, r: 130, dl: 12, up: 1, col: '#90a4ae', gl: '🪜', tx: 'Aparece una escalera corporativa que golpea al rival.' }]],
    g: { n: 'Reunión urgente', d: 11, vx: 20, gl: '🪑', tx: 'Sienta al enemigo en una silla y lo manda a volar.' },
    u: { n: 'Tengo Contactos', q: '¡Todos a la mesa!', c1: '#ffcc80', c2: '#4e342e', st: 'rain', glyph: '🤵', d: 40, status: ['stun', 60], tx: 'Varias autoridades entran en escena y ejecutan una paliza coordinada.' },
    p: { id: 'contacts', n: 'Buena onda', tx: 'Tiene una pequeña posibilidad de reducir el daño recibido gracias a sus contactos.' }
  },
  gaston: {
    st: 'daño y aturdimiento',
    e: [['A', { n: 'Reflejo solar', cd: 200, d: 4, r: 270, dl: 8, st: ['blind', 150], light: 1, col: '#fff59d', gl: '☀️', tx: 'Su cabeza refleja la luz y ciega al enemigo (el rival ciego pega la mitad).' }],
      ['P', { n: 'Láser capilar', cd: 330, d: 12, v: 32, w: 36, light: 1, col: '#fff59d', tx: 'Dispara un rayo de luz desde su cabeza.' }],
      ['D', { n: 'Cabeza de acero', cd: 420, d: 15, v: 28, st: ['stun', 30], kd: 1, tx: 'Embiste al enemigo con un cabezazo.' }]],
    g: { n: 'Pulido profesional', d: 10, vx: 5, st: ['blind', 120], gl: '✨', tx: 'Toma al rival y lo deja desorientado con un brillo cegador.' },
    u: { n: 'Eclipse de Gastón', q: '¡Me brilla la frente!', c1: '#fff59d', c2: '#5d4037', st: 'rays', d: 42, status: ['blind', 200], tx: 'Aparece un sol gigantesco, Gastón inclina la cabeza y un rayo de luz atraviesa toda la pantalla.' },
    p: { id: 'lightCharge', n: 'Panel solar', tx: 'Cuando recibe luz o ataques de fuego, carga su medidor especial más rápido.' }
  },
  pitu: {
    st: 'dominio y autoridad',
    e: [['P', { n: 'Se acabó el arriendo', cd: 160, d: 8, v: 17, w: 40, st: ['stun', 25], gl: '🧾', col: '#fff176', tx: 'Lanza una cuenta de gastos comunes que golpea al enemigo.' }],
      ['A', { n: 'Reunión obligatoria', cd: 420, d: 3, r: 280, dl: 10, st: ['root', 130], col: '#4fc3f7', gl: '🗣️', tx: 'Crea una zona donde el rival no puede escapar fácilmente.' }],
      ['A', { n: 'Expulsión inmediata', cd: 440, d: 13, r: 125, dl: 12, push: 26, kd: 1, col: '#8d6e63', gl: '🚪', tx: 'Invoca una puerta que se cierra sobre el enemigo y lo empuja.' }]],
    g: { n: '¡A ordenar la pieza!', d: 12, vx: 20, gl: '🛋️', tx: 'Lo toma y lo lanza contra un montón de muebles.' },
    u: { n: 'Dueño y Señor', q: '¡Reglas de convivencia!', c1: '#4fc3f7', c2: '#263238', st: 'rain', glyph: '🛋️', d: 42, status: ['stun', 55], tx: 'Aparece la casa de estudiantes y activa todas las reglas: muebles, camas y electrodomésticos salen disparados.' },
    p: { id: 'bigHouse', n: 'Jefe de la casa', tx: 'Recibe menos daño mientras tenga más del 50% de vida.' }
  },
  wenley: {
    st: 'alcance y fuerza',
    e: [['P', { n: 'Triple mortal', cd: 170, d: 11, v: 20, w: 44, gl: '🏀', col: '#ff7043', tx: 'Lanza un balón de básquetbol que golpea al rival.' }],
      ['A', { n: 'Mate devastador', cd: 400, d: 17, r: 150, dl: 20, kd: 1, jump: 1, col: '#ff7043', gl: '🏀', tx: 'Salta y realiza una clavada directamente sobre el enemigo.' }],
      ['P', { n: '¿Quieres leche?', cd: 420, d: 10, v: 26, w: 70, push: 18, gl: '🥛', col: '#ffffff', tx: 'Aparece un envase gigante de leche que dispara un chorro a presión.' }]],
    g: { n: 'Poste humano', d: 12, vx: 18, up: -17, tx: 'Levanta al enemigo por encima de su cabeza y lo lanza.' },
    u: { n: 'NBA de la Leche', q: '¿Quieres leche?', c1: '#ffffff', c2: '#d32f2f', st: 'rain', glyph: '🏀', d: 42, status: ['slow', 150], tx: 'Una cancha de básquetbol y una lluvia de balones y envases de leche. Termina con un mate espectacular.' },
    p: { id: 'reach', n: 'Brazos largos', tx: 'Tiene mayor alcance de ataque que el resto de personajes.' }
  },
  benja: {
    st: 'transformación y versatilidad',
    e: [['O', { n: 'Omnitrix', cd: 260, tx: 'Selecciona al azar una transformación que cambia sus siguientes ataques (cuatro brazos, XLR8, diamante, fuego, materia gris... o Wi-Fi).' }],
      ['A', { n: 'Cuatro Brazos', cd: 330, d: 16, r: 140, dl: 8, kd: 1, col: '#e53935', gl: '👊', tx: 'Realiza un combo de cuatro puñetazos.' }],
      ['W', { n: 'XLR8', cd: 420, d: 14, boost: 90, st: ['stun', 20], col: '#29b6f6', gl: '💨', tx: 'Se desplaza a una velocidad increíble y golpea por detrás.' }]],
    g: { n: 'Alienígena sorpresa', d: 12, vx: 18, up: -16, gl: '🛸', tx: 'Aparece una mano alienígena que levanta y lanza al enemigo.' },
    u: { n: 'Alien X', q: '¡Es hora de...!', c1: '#76ff03', c2: '#1b5e20', st: 'void', d: 44, status: ['freeze', 90], tx: 'Una transformación cósmica: el tiempo se detiene antes de lanzar al rival por los aires.' },
    p: { id: 'form', n: 'Omnitrix defectuoso', tx: 'Sus habilidades tienen efectos variables según la transformación activa.' }
  },
  juanito: {
    st: 'fuerza bruta',
    e: [['A', { n: 'Bocina de camión', cd: 190, d: 5, r: 270, dl: 8, st: ['stun', 40], col: '#ffb300', gl: '📯', honk: 2, tx: 'Lanza una onda sonora que aturde.' }],
      ['T', { n: 'Retroceso', cd: 420, d: 18, st: ['stun', 40], mode: 'run', col: '#ffb300', tx: 'Aparece un camión que retrocede y atropella al enemigo (se esquiva saltando).' }],
      ['D', { n: 'Carga pesada', cd: 400, d: 16, v: 30, push: 18, kd: 1, tx: 'Se lanza hacia adelante como un camión sin frenos.' }]],
    g: { n: 'Carga y descarga', d: 12, vx: 20, up: -13, tx: 'Levanta al enemigo y lo arroja como un paquete.' },
    u: { n: 'Ruta 5 Mortal', q: '¡Corten la ruta!', c1: '#ffb300', c2: '#37474f', st: 'rain', glyph: '🚚', d: 44, status: ['stun', 60], tx: 'Un camión atraviesa la pantalla y se lleva al rival por delante.' },
    p: { id: 'heavy', n: 'Peso pesado', tx: 'Sus golpes fuertes hacen mucho daño (+20%), pero es más lento.' }
  },
  manin: {
    st: 'técnica y velocidad',
    e: [['P', { n: 'Cevichazo', cd: 150, d: 8, v: 17, w: 44, st: ['slow', 60], gl: '🍲', col: '#ffcc80', tx: 'Lanza un plato de ceviche que salpica al rival.' }],
      ['A', { n: 'Giro andino', cd: 330, d: 12, r: 215, dl: 6, kd: 1, col: '#e65100', gl: '🌀', tx: 'Patada giratoria que alcanza una gran distancia.' }],
      ['A', { n: 'Picante extremo', cd: 420, d: 6, r: 210, dl: 10, st: ['stun', 45], col: '#d84315', gl: '🌶️', tx: 'Lanza una nube de ají que hace toser al enemigo.' }]],
    g: { n: 'Receta secreta', d: 12, vx: 8, st: ['stun', 30], gl: '🥄', tx: 'Lo toma y lo hace girar como ingrediente de una preparación.' },
    u: { n: 'Banquete Peruano', q: '¡Por el Inti!', c1: '#ffca28', c2: '#e65100', st: 'rain', glyph: '🍽️', d: 40, status: ['burn', 200], tx: 'Una mesa gigantesca llena de comida y los platos vuelan hacia el rival.' },
    p: { id: 'ranged', n: 'Mano rápida', tx: 'Sus ataques a distancia recargan más rápido.' }
  },
  mati: {
    st: 'control de masas y resistencia',
    e: [['A', { n: 'Expropiación', cd: 200, d: 4, r: 150, dl: 8, steal: 30, col: '#ffd54f', gl: '💰', tx: 'Le quita temporalmente un porcentaje de energía (ULTRA) al rival y se la queda.' }],
      ['V', { n: 'La revolución', cd: 420, d: 13, gl: '✊👥✊', sz: 64, spd: 11, tx: 'Invoca una multitud que avanza golpeando al enemigo (se esquiva saltando).' }],
      ['A', { n: 'Asamblea obligatoria', cd: 440, d: 3, r: 210, dl: 12, st: ['root', 110], col: '#e53935', gl: '🗣️', tx: 'Crea una zona de discusión que inmoviliza al contrincante.' }]],
    g: { n: 'Distribución equitativa', d: 10, vx: 28, tx: 'Toma al enemigo y lo lanza al otro lado de la pantalla.' },
    u: { n: '¡El Pueblo Unido!', q: 'Jamás será vencido.', c1: '#ef5350', c2: '#b71c1c', st: 'rain', glyph: '✊', d: 42, status: ['stun', 55], tx: 'Decenas de manifestantes rodean al enemigo y lo lanzan por los aires.' },
    p: { id: 'lowRes', n: 'Resistencia', tx: 'Mientras tenga poca vida, aumenta su resistencia.' }
  }
};
// Ajustes de estadísticas por personaje (vida y velocidad) ligados a sus pasivas
const KITSTAT = { rosita: { hp: 112 }, juanito: { s: 4.3 } };
