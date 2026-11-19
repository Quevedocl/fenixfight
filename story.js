// Historias previas a cada pelea (se muestran después de la pantalla VS). Edítalas libremente:
// a = apodo / título · t = historia (máx. ~230 caracteres para que quepa en la tarjeta)
const STORY = {
  mono: { a: 'EL REY DEL TRÁMITE', t: 'Funcionario municipal de carrera: ha mandado a más de mil vecinos a "volver mañana". Esta noche el único trámite pendiente es tu derrota, y no admite apelación.' },
  manu: { a: 'EL GUARDIÁN DEL BOSQUE', t: 'Planta un árbol por cada pelea que gana y tala otro por cada excusa que escucha. La leña de su parrilla nunca se acaba, y su paciencia tampoco... hasta hoy.' },
  mario: { a: 'EL ROJO INDOMABLE', t: 'Colorín de corazón, jamás se despeina y siempre llega con Criss para dar una mano. Sus peleas se ganan con estilo, color y una buena colación después.' },
  gonza: { a: 'EL BARBERO DE LA POBLA', t: 'Flaite de nacimiento y barbero de vocación: nadie se va de su silla sin un degradé perfecto. Cuando saca las tijeras de verdad, hasta el espejo se asusta.' },
  wenley: { a: 'EL CAMPEÓN DEL CALCIO', t: 'Nunca sale sin su caja de leche: dice que los huesos fuertes ganan peleas. Hoy te ofrece una última oportunidad... ¿quieres leche, o quieres pelea?' },
  manin: { a: 'EL SEÑOR DEL AJÍ', t: 'Cocina con tanto ají que los vecinos lloran a tres cuadras. Su pisco es leyenda y su rocoto, un arma. La furia inca no perdona a nadie.' },
  ale: { a: 'LA ESTRELLA DEL K-POP', t: 'Entre handrolls y lightsticks ensaya coreografías a las tres de la mañana. Dice que pelear también es sincronizarse... con el ritmo de los golpes.' },
  mati: { a: 'EL ABOGADO DEL PUEBLO', t: 'Cobra impuestos hasta en los sueños y siempre tiene una boleta pendiente. Hoy viene a embargar tu orgullo y a expropiar tu victoria.' },
  alonso: { a: 'EL CHEF SEDUCTOR', t: 'Cocina a la luz de las velas y nadie sabe si enamora más el plato o él. Su cuchillo corta, su guiño derrota y su salsa pica más que tus excusas.' },
  jp: { a: 'EL CUICO DE VITACURA', t: 'Apellido compuesto, mocasines impecables y una herencia familiar que incluye una mansión entera. No sabe pelear, pero papá paga todo... incluso la ambulancia.' },
  benja: { a: 'EL DUEÑO DEL OMNITRIX', t: 'Su reloj falla más que el Wi-Fi: a veces sale Cuatrobrazos, a veces sale una tostadora. Aun así, jamás se rinde. Hoy, ¿qué alien tocará?' },
  rafa: { a: 'EL PADRE DE LA COMUNIDAD', t: 'Reza, sana y reparte campanazos. Dice que pelea solo por obligación, pero la fe le sale directo por los puños. Amén.' },
  rosita: { a: 'LA ABUELA TERRIBLE', t: 'La once nunca falta en su casa, ni el rodillo detrás de la puerta. Si no te sentaste a comer, te vas a sentar de un golpe.' },
  tata: { a: 'EL CHAKAL', t: 'Cadenas de oro, moto tuneada y una sola regla: "chakal nomá". En el barrio todos lo respetan; en el ring, también.' },
  tono: { a: 'LA ESTRELLA DEL ORGULLO', t: 'Dueño de las indirectas más filosas de la ciudad y del pañuelo más brillante del desfile. Su mirada derrota más que cualquier golpe.' },
  juanito: { a: 'EL REY DE LA RUTA', t: 'Camionero de corazón y de sindicato: cuando él dice paro, no pasa nadie. Su bocina se escucha antes de que llegue... y su "gracias wapa", después de ganar.' },
  gaston: { a: 'EL BRILLO DE LA CALVA', t: 'Barba tupida, frente reluciente y cero paciencia. Dicen que el sol se refleja en su cabeza y deja ciego al rival antes del primer golpe.' },
  pitu: { a: 'EL ÁRBITRO IMPLACABLE', t: 'Pita todo: la falta, el off-side y hasta tu respiración. Hoy no viene a dirigir la pelea... viene a expulsarte de ella.' },
  tiorene: { a: 'EL TÍO DEL ASADO', t: 'Parrilla en una mano, consejos no pedidos en la otra. Con más años que paciencia, pelea como cocina: lento, seguro y con mucho humo.' }
};

// Retratos HD originales (img/hd/<id>.webp) para selección, VS e historia
const HDFULL = [];   // el resto usa las skins nuevas (img/skin/<id>.webp)

// ================= MÁS HISTORIA PARA LOS COMBATES =================
// Por qué cada luchador está en el torneo de la Casa Fénix (se usa en la pantalla "El enfrentamiento")
const MOTIVE = {
  mono: "quiere el trofeo para archivarlo en la oficina... bajo llave.",
  manu: "busca la leña eterna de la Casa Fénix para su parrilla.",
  mario: "viene a defender el rojo y a invitar la colación.",
  gonza: "apostó su silla de barbero a que sale campeón.",
  wenley: "prometió entregar la copa a los huesos fuertes.",
  manin: "necesita el premio para abrir la picantería más grande de Lima.",
  ale: "quiere subir el trofeo al escenario de su próximo comeback.",
  mati: "viene a cobrar una deuda vieja con el torneo.",
  alonso: "viene por una cena con velas... y por la gloria.",
  jp: "papá le prometió el auto nuevo si vuelve con la copa.",
  benja: "cree que el trofeo es la pieza que le falta al Omnitrix.",
  rafa: "pelea por una causa: arreglar el techo de la parroquia.",
  rosita: "juró que nadie en su barrio se queda sin comer.",
  tata: "quiere ganar para tunear la moto con luces nuevas.",
  tono: "quiere la copa como accesorio del próximo desfile.",
  juanito: "viene a cerrar la ruta con el trofeo en la cabina.",
  gaston: "quiere una copa que refleje la luz de su calva.",
  pitu: "vino a arbitrar el torneo... y de paso a ganarlo.",
  tiorene: "viene a demostrar que a su edad todavía sale la parrilla."
};
const STAGE_LINE = [
  "La azotea Fénix está en silencio; abajo, la ciudad entera apuesta a ciegas.",
  "La Cumbre Nevada no perdona: aquí hasta el aliento se congela antes del primer golpe.",
  "El Puerto está en fiestas, pero esta noche el único baile será a golpes.",
  "El Volcán Fénix ruge bajo sus pies: quien caiga, se cocina."
];
// Capítulos del modo Arcade (5 combates)
const ARC_CH = [
  { a: "CAPÍTULO 1 · LA INVITACIÓN", t: "Un sobre dorado llegó a cada barrio: el torneo de la Casa Fénix reparte gloria y asado de por vida. Primera parada, la azotea." },
  { a: "CAPÍTULO 2 · NIEVE Y RENCORES", t: "Los favoritos suben a la cumbre. Hace tanto frío que hasta los rencores se congelan... y después se descongelan a golpes." },
  { a: "CAPÍTULO 3 · EL PUERTO NO PERDONA", t: "Hay fiesta en el muelle y nadie sabe quién invitó a quién. Lo único seguro es que alguien termina en el agua." },
  { a: "CAPÍTULO 4 · EL VOLCÁN DESPIERTA", t: "Solo quedan los que aguantan el calor. Se dice que el volcán late más fuerte cuando hay una pelea de verdad." },
  { a: "CAPÍTULO 5 · LA FINAL DE LA CASA FÉNIX", t: "Un último rival entre tú y la copa. Las luces se apagan, el barrio entero contiene el aliento y suena la campana." }
];
// Frases de cada uno para los duelos que no tienen guion propio: o = abre, r = responde, c = cierra
const DUELO_FRASES = {
  mono: { o: "¿Trae el formulario 27-B?", r: "Le falta un timbre.", c: "Vuelva mañana." },
  manu: { o: "Planté un árbol por tu derrota.", r: "La leña ya está cortada.", c: "Prepara la parrilla." },
  mario: { o: "¡Con estilo y sin despeinarme!", r: "Buen intento, pero no.", c: "Después te invito una colación." },
  gonza: { o: "¿Pa' cuándo ese degradé, po?", r: "Qué miedo, po.", c: "Siéntate, que te arreglo." },
  wenley: { o: "¿Leche o pelea?", r: "Los huesos fuertes ganan.", c: "Toma tu leche." },
  manin: { o: "Mi rocoto te deja sin voz.", r: "Esto pica más que mi ají.", c: "Furia inca, sin perdón." },
  ale: { o: "Esto va al ritmo de mi coreo.", r: "Sincroniza o pierde.", c: "¡Comeback incoming!" },
  mati: { o: "Tengo una boleta con tu nombre.", r: "Eso se puede embargar.", c: "Pague en caja." },
  alonso: { o: "Esta noche cocino tu derrota.", r: "Mi salsa pica más que eso.", c: "Con una sonrisa, mi amor." },
  jp: { o: "Mi papá paga todo, ¿sabías?", r: "Eso no estaba en el contrato.", c: "Llama a mi chofer." },
  benja: { o: "Esta vez sí funciona... creo.", r: "¡Es hora de transformarse!", c: "¿Esa era una tostadora?" },
  rafa: { o: "Que Dios te acompañe, hijo.", r: "La fe me sale por los puños.", c: "Amén." },
  rosita: { o: "Siéntate a comer primero.", r: "Mijito, yo ya vi de todo.", c: "Y eso que no usé el rodillo." },
  tata: { o: "Chakal nomá, hermano.", r: "Tamo en la nuestra.", c: "Ni te sentí." },
  tono: { o: "Mi mirada ya te derrotó.", r: "Qué indirecta más directa.", c: "Brillo, mi amor." },
  juanito: { o: "Hay paro: no pasa nadie.", r: "Gracias, wapa.", c: "Bocinazo y a casa." },
  gaston: { o: "Cuidado: el sol me ayuda.", r: "No mires directo, te ciego.", c: "Brillo eterno." },
  pitu: { o: "Falta, tarjeta y expulsión.", r: "Eso fue offside.", c: "Fin del partido." },
  tiorene: { o: "Con humo se arregla todo.", r: "En mis tiempos se peleaba mejor.", c: "Pásame el carbón." }
};
// Más duelos con guion propio (clave = ids ordenados alfabéticamente)
const RIV2 = {
  "alonso|mati": { t: "Carisma vs expropiación", l: [["mati", "Alonso, expropio tu carisma."], ["alonso", "Nadie expropia lo inevitable."]] },
  "gaston|gonza": { t: "Tijeras vs calva", l: [["gonza", "Gastón, esa calva es un lienzo en blanco."], ["gaston", "Acércate y quedas ciego, Chino."], ["gonza", "Ya, pero primero el degradé."]] },
  "mati|mono": { t: "Boleta vs timbre", l: [["mati", "Mono, tienes una deuda de mil timbres."], ["mono", "Eso se tramita en la ventanilla 4... mañana."], ["mati", "Embargo inmediato."]] },
  "rosita|wenley": { t: "Leche vs once", l: [["rosita", "Wenley, ¿tomaste once o solo leche?"], ["wenley", "Leche, doña Rosita. Huesos fuertes."], ["rosita", "Con pan y palta, mijito. Siéntate."]] },
  "manin|rafa": { t: "Rocoto bendito", l: [["rafa", "Manín, bendije tu rocoto, no te asustes."], ["manin", "Padre, ahora pica con culpa."], ["rafa", "Es el sabor de la penitencia."]] },
  "alonso|manin": { t: "Cocinas enfrentadas", l: [["alonso", "Manín, tu ají arruina mis salsas finas."], ["manin", "Tu salsa no despierta ni a un gato."], ["alonso", "Esta cocina se define a golpes."]] },
  "ale|tono": { t: "Dos estrellas, un escenario", l: [["ale", "Toño, el escenario es mío esta noche."], ["tono", "Mi pañuelo hace mejor coreografía."], ["ale", "Entonces sincronicemos... los golpes."]] },
  "benja|jp": { t: "Omnitrix vs mansión", l: [["benja", "JP, necesito tu mansión para probar el reloj."], ["jp", "No toques nada. Papá lo paga todo."], ["benja", "Eso... suena a invitación."]] },
  "juanito|pitu": { t: "Bocinazo vs pitazo", l: [["pitu", "Juanito, falta por bocinazo en zona escolar."], ["juanito", "Yo tengo paro, no cobro tarjetas."], ["pitu", "Roja directa, camionero."]] },
  "manu|mono": { t: "Permiso de tala", l: [["manu", "Mono, ¿salió el permiso pa' talar?"], ["mono", "Falta el timbre del timbre, Manu."], ["manu", "Entonces hablo con la motosierra."]] },
  "manu|tata": { t: "Chakal en el bosque", l: [["tata", "Manu, tu bosque es pa' mi moto."], ["manu", "Aquí se respeta el árbol, Tata."], ["tata", "Chakal nomá, don."]] },
  "mario|tiorene": { t: "Rojo vs parrilla", l: [["mario", "Tío René, ¿me presta el carbón?"], ["tiorene", "Primero la colación, Marrio. Es la ley."], ["mario", "Trato hecho. Con estilo."]] },
  "gonza|rosita": { t: "Degradé vs rodillo", l: [["gonza", "Doña Rosita, ¿le arreglo ese moño?"], ["rosita", "Mijito, ni con tus tijeras te acercas."], ["gonza", "Qué miedo, po."]] },
  "jp|mati": { t: "Herencia vs impuestos", l: [["mati", "JP, tu herencia paga impuesto de derrota."], ["jp", "Papá tiene un abogado mejor que tú."], ["mati", "Pero yo tengo la boleta."]] },
  "rafa|rosita": { t: "Fe vs rodillo", l: [["rosita", "Padre, aquí ya hay quien rece por usted."], ["rafa", "Doña Rosita, usted es mi cruz."], ["rosita", "Y el rodillo, su penitencia."]] },
  "ale|rosita": { t: "K-pop vs once", l: [["rosita", "Ale, ¿tú no te sentaste a comer?"], ["ale", "Ensayo, doña. Hoy hay comeback."], ["rosita", "Con el estómago vacío no hay coreografía."]] },
  "gaston|jp": { t: "Frente vs mocasines", l: [["gaston", "JP, tus mocasines brillan menos que mi frente."], ["jp", "Mi mansión tiene lámparas más finas."], ["gaston", "Entonces te ciego con mi brillo."]] },
  "benja|wenley": { t: "Alien vs leche", l: [["wenley", "Benja, ¿qué alien sale hoy?"], ["benja", "Si sale la tostadora, me rindo."], ["wenley", "Mejor toma leche, por si acaso."]] },
  "tata|tiorene": { t: "Moto vs parrilla", l: [["tiorene", "Tata, esa moto hace más humo que mi parrilla."], ["tata", "Chakal nomá, tío."], ["tiorene", "En mis tiempos las motos no hablaban."]] },
  "gonza|tata": { t: "Chakal en la silla", l: [["gonza", "Tata, ese pelo necesita un degradé urgente."], ["tata", "Chakal nomá, barbero."], ["gonza", "Siéntate o te siento yo."]] },
  "mono|tiorene": { t: "Trámite vs asado", l: [["tiorene", "Mono, ¿hay permiso pa' hacer humo?"], ["mono", "Falta el timbre del humo."], ["tiorene", "Entonces invito a todo el municipio."]] },
  "alonso|jp": { t: "Chef vs cuico", l: [["alonso", "JP, ¿cena pa' dos en tu mansión?"], ["jp", "Si cocinas tú... y papá paga."], ["alonso", "Mi guiño ya te cobró."]] },
  "pitu|tono": { t: "Pitazo vs indirecta", l: [["pitu", "Toño, te pito por tirar indirectas."], ["tono", "Esa tarjeta no combina con tu traje."], ["pitu", "Roja por mal gusto."]] },
  "benja|tono": { t: "Omnitrix y brillo", l: [["tono", "Benja, ese reloj no combina con tu look."], ["benja", "Es un Omnitrix, Toño, no un accesorio."], ["tono", "Todo es accesorio, mi amor."]] },
  "manin|tata": { t: "Ají vs chakal", l: [["tata", "Manín, ¿ese ají es pa' mi empanada?"], ["manin", "Si lo aguantas, chakal."], ["tata", "Chakal nomá... ¡pica!"]] }
};
// Frase propia de cada luchador cuando queda casi vencido (el juego la mezcla con las frases genéricas)
const LOWHP_CH = {
  mono: "Esto requiere... apelación.", manu: "El bosque me da fuerzas.", mario: "Los rojos no se rinden.", gonza: "Aún me queda un degradé.",
  wenley: "Necesito... más leche.", manin: "Mi furia inca despierta.", ale: "Esto es el bridge del comeback.", mati: "Voy a apelar este golpe.",
  alonso: "La salsa secreta no se rinde.", jp: "Que alguien llame a papá.", benja: "¡Vamos, Omnitrix, ahora o nunca!", rafa: "Dios, dame un poco más.",
  rosita: "Con el rodillo no te salvas.", tata: "Chakal nomá... no cae.", tono: "Aún queda brillo.", juanito: "Aguanta, camión.",
  gaston: "El brillo vuelve más fuerte.", pitu: "Esto no terminó: hay alargue.", tiorene: "Que prendan el carbón de nuevo."
};
