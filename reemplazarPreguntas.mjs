import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5-cikJI7ec70WNpl8hzjh6UvC0k36JQg",
  authDomain: "dary-fabbf.firebaseapp.com",
  projectId: "dary-fabbf",
  storageBucket: "dary-fabbf.firebasestorage.app",
  messagingSenderId: "524703111160",
  appId: "1:524703111160:web:4018dd9461e3e779f2a80d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 👇 REEMPLAZA ESTO CON EL ID REAL DE TU DOCUMENTO EN LA COLECCIÓN "games"
const GAME_ID = "7u74UUbUjOGEG20rHYsu";

const QUESTIONS_100 = [
  // BLOQUE 1. APERTURA A LA EXPERIENCIA (O) — 12 ítems
  { id: "O1", system: "big_five", trait: "O", direction: "direct", text: "Tengo una imaginación muy activa." },
  { id: "O2", system: "big_five", trait: "O", direction: "direct", text: "Disfruto explorando ideas abstractas y teóricas." },
  { id: "O3", system: "big_five", trait: "O", direction: "direct", text: "Me conmuevo con facilidad ante una obra de arte, una pieza musical o un texto literario." },
  { id: "O4", system: "big_five", trait: "O", direction: "direct", text: "Me gusta probar actividades nuevas y diferentes." },
  { id: "O5", system: "big_five", trait: "O", direction: "direct", text: "Disfruto reflexionando sobre el significado profundo de las cosas." },
  { id: "O6", system: "big_five", trait: "O", direction: "inverse", text: "Prefiero las rutinas conocidas a las experiencias novedosas." },
  { id: "O7", system: "big_five", trait: "O", direction: "inverse", text: "Las discusiones abstractas me resultan aburridas." },
  { id: "O8", system: "big_five", trait: "O", direction: "inverse", text: "Rara vez me detengo a apreciar la belleza de las cosas." },
  { id: "O9", system: "big_five", trait: "O", direction: "direct", text: "Me siento atraído por ideas poco convencionales." },
  { id: "O10", system: "big_five", trait: "O", direction: "direct", text: "Disfruto de películas o libros que me hacen pensar de forma diferente." },
  { id: "O11", system: "big_five", trait: "O", direction: "inverse", text: "Prefiero mantenerme en lo que ya conozco antes que explorar lo desconocido." },
  { id: "O12", system: "big_five", trait: "O", direction: "direct", text: "Me interesa aprender sobre temas muy diversos, aunque no tengan aplicación práctica inmediata." },

  // BLOQUE 2. RESPONSABILIDAD (C) — 12 ítems
  { id: "C1", system: "big_five", trait: "C", direction: "direct", text: "Cumplo mis compromisos y promesas." },
  { id: "C2", system: "big_five", trait: "C", direction: "direct", text: "Me gusta tener mis cosas organizadas y en su lugar." },
  { id: "C3", system: "big_five", trait: "C", direction: "direct", text: "Suelo terminar las tareas que empiezo." },
  { id: "C4", system: "big_five", trait: "C", direction: "direct", text: "Planifico mis actividades con anticipación." },
  { id: "C5", system: "big_five", trait: "C", direction: "direct", text: "Soy una persona disciplinada y constante." },
  { id: "C6", system: "big_five", trait: "C", direction: "inverse", text: "A menudo dejo las cosas para el último momento." },
  { id: "C7", system: "big_five", trait: "C", direction: "inverse", text: "Mi habitación o espacio de trabajo suele estar desordenado." },
  { id: "C8", system: "big_five", trait: "C", direction: "inverse", text: "Me cuesta seguir un horario o una rutina establecida." },
  { id: "C9", system: "big_five", trait: "C", direction: "inverse", text: "Suelo posponer decisiones importantes hasta que ya no queda tiempo." },
  { id: "C10", system: "big_five", trait: "C", direction: "direct", text: "Reviso mi trabajo para asegurarme de que esté bien hecho." },
  { id: "C11", system: "big_five", trait: "C", direction: "inverse", text: "Me distraigo con facilidad cuando una tarea me resulta tediosa." },
  { id: "C12", system: "big_five", trait: "C", direction: "direct", text: "Cuando asumo una responsabilidad, la llevo hasta el final." },

  // BLOQUE 3. EXTRAVERSIÓN (E) — 12 ítems
  { id: "E1", system: "big_five", trait: "E", direction: "direct", text: "Me siento lleno de energía cuando estoy rodeado de otras personas." },
  { id: "E2", system: "big_five", trait: "E", direction: "direct", text: "Suelo iniciar conversaciones con facilidad en reuniones sociales." },
  { id: "E3", system: "big_five", trait: "E", direction: "direct", text: "Disfruto siendo el centro de atención en un grupo." },
  { id: "E4", system: "big_five", trait: "E", direction: "direct", text: "Me resulta fácil expresar mis ideas y opiniones en voz alta." },
  { id: "E5", system: "big_five", trait: "E", direction: "direct", text: "Disfruto las actividades grupales y las reuniones sociales." },
  { id: "E6", system: "big_five", trait: "E", direction: "direct", text: "Suelo ser el primero en hablar con personas desconocidas en un evento social." },
  { id: "E7", system: "big_five", trait: "E", direction: "inverse", text: "Me siento agotado después de pasar mucho tiempo socializando." },
  { id: "E8", system: "big_five", trait: "E", direction: "inverse", text: "Prefiero escuchar antes que hablar en la mayoría de las situaciones." },
  { id: "E9", system: "big_five", trait: "E", direction: "inverse", text: "Evito las fiestas o eventos con demasiada gente." },
  { id: "E10", system: "big_five", trait: "E", direction: "inverse", text: "Me cuesta romper el hielo con personas que acabo de conocer." },
  { id: "E11", system: "big_five", trait: "E", direction: "inverse", text: "Disfruto más de las actividades tranquilas y en solitario." },
  { id: "E12", system: "big_five", trait: "E", direction: "inverse", text: "Suelo mantenerme en un segundo plano dentro de los grupos." },

  // BLOQUE 4. AMABILIDAD (A) — 12 ítems
  { id: "A1", system: "big_five", trait: "A", direction: "direct", text: "Me preocupo genuinamente por el bienestar de los demás." },
  { id: "A2", system: "big_five", trait: "A", direction: "direct", text: "Suelo confiar en las buenas intenciones de las personas." },
  { id: "A3", system: "big_five", trait: "A", direction: "direct", text: "Me esfuerzo por tratar a todos con empatía y respeto." },
  { id: "A4", system: "big_five", trait: "A", direction: "direct", text: "Disfruto ayudando a otros incluso cuando no obtengo nada a cambio." },
  { id: "A5", system: "big_five", trait: "A", direction: "direct", text: "Busco evitar conflictos innecesarios y mantener la armonía." },
  { id: "A6", system: "big_five", trait: "A", direction: "direct", text: "Perdono con relativa facilidad cuando alguien comete un error conmigo." },
  { id: "A7", system: "big_five", trait: "A", direction: "inverse", text: "A veces puedo ser bastante frío o indiferente ante los problemas ajenos." },
  { id: "A8", system: "big_five", trait: "A", direction: "inverse", text: "Suelo desconfiar de las motivaciones ocultas de la gente." },
  { id: "A9", system: "big_five", trait: "A", direction: "inverse", text: "Me cuesta ceder en una discusión aunque la otra persona tenga parte de razón." },
  { id: "A10", system: "big_five", trait: "A", direction: "inverse", text: "Me cuesta ponerme en el lugar de personas que piensan muy distinto a mí." },
  { id: "A11", system: "big_five", trait: "A", direction: "inverse", text: "Antepondría mis propios intereses antes que ceder por el bien del grupo." },
  { id: "A12", system: "big_five", trait: "A", direction: "inverse", text: "Suelo señalar los defectos de los demás sin mucho tacto." },

  // BLOQUE 5. NEUROTICISMO (N) — 12 ítems
  { id: "N1", system: "big_five", trait: "N", direction: "direct", text: "Me preocupo con facilidad por cosas que podrían salir mal." },
  { id: "N2", system: "big_five", trait: "N", direction: "direct", text: "Suelo sentirme estresado o abrumado ante situaciones de presión." },
  { id: "N3", system: "big_five", trait: "N", direction: "direct", text: "Mi estado de ánimo puede cambiar con relativa rapidez." },
  { id: "N4", system: "big_five", trait: "N", direction: "direct", text: "A menudo me quedo dándole vueltas a errores o problemas pasados." },
  { id: "N5", system: "big_five", trait: "N", direction: "direct", text: "Me irrito o me frustro con facilidad cuando las cosas no salen como esperaba." },
  { id: "N6", system: "big_five", trait: "N", direction: "direct", text: "Siento ansiedad o nerviosismo con frecuencia en mi día a día." },
  { id: "N7", system: "big_five", trait: "N", direction: "inverse", text: "Mantengo la calma incluso en medio de crisis o situaciones difíciles." },
  { id: "N8", system: "big_five", trait: "N", direction: "inverse", text: "Rara vez me siento decaído o con el ánimo bajo." },
  { id: "N9", system: "big_five", trait: "N", direction: "inverse", text: "Me recupero rápidamente después de vivir una situación estresante." },
  { id: "N10", system: "big_five", trait: "N", direction: "inverse", text: "Suelo sentirme seguro y emocionalmente estable la mayor parte del tiempo." },
  { id: "N11", system: "big_five", trait: "N", direction: "inverse", text: "Las críticas o comentarios negativos me afectan poco." },
  { id: "N12", system: "big_five", trait: "N", direction: "inverse", text: "Manejo mis emociones con serenidad sin perder el control." },

  // BLOQUE 6. EXTRAVERSIÓN (E) vs. INTROVERSIÓN (I) — 10 ítems
  { id: "EI1", system: "mbti", dimension: "EI", pole: "E", text: "Recargo mi energía interactuando y conversando con otras personas." },
  { id: "EI2", system: "mbti", dimension: "EI", pole: "E", text: "Pienso con mayor claridad cuando hablo mis ideas en voz alta con alguien." },
  { id: "EI3", system: "mbti", dimension: "EI", pole: "E", text: "Me siento cómodo en ambientes dinámicos con mucha interacción social." },
  { id: "EI4", system: "mbti", dimension: "EI", pole: "E", text: "Suelo ampliar mi círculo social con facilidad y frecuencia." },
  { id: "EI5", system: "mbti", dimension: "EI", pole: "E", text: "Disfruto iniciar conversaciones con personas que no conozco." },
  { id: "EI6", system: "mbti", dimension: "EI", pole: "I", text: "Necesito tiempo a solas para recuperar energía después de mucha actividad social." },
  { id: "EI7", system: "mbti", dimension: "EI", pole: "I", text: "Prefiero procesar mis ideas internamente antes de compartirlas con los demás." },
  { id: "EI8", system: "mbti", dimension: "EI", pole: "I", text: "Disfruto más de conversaciones profundas con una o dos personas que de grupos grandes." },
  { id: "EI9", system: "mbti", dimension: "EI", pole: "I", text: "Me siento cómodo pasando largos periodos concentrado en mi mundo interior." },
  { id: "EI10", system: "mbti", dimension: "EI", pole: "I", text: "Suelo observar y analizar una situación antes de intervenir activamente." },

  // BLOQUE 7. SENSACIÓN (S) vs. INTUICIÓN (N) — 10 ítems
  { id: "SN1", system: "mbti", dimension: "SN", pole: "S", text: "Confío más en los hechos concretos y comprobables que en las corazonadas." },
  { id: "SN2", system: "mbti", dimension: "SN", pole: "S", text: "Presto mucha atención a los detalles prácticos y específicos del presente." },
  { id: "SN3", system: "mbti", dimension: "SN", pole: "S", text: "Prefiero instrucciones claras y paso a paso antes que conceptos generales." },
  { id: "SN4", system: "mbti", dimension: "SN", pole: "S", text: "Valoro más la experiencia práctica que las teorías nuevas." },
  { id: "SN5", system: "mbti", dimension: "SN", pole: "S", text: "Me resulta fácil notar cambios físicos o detalles concretos en mi entorno." },
  { id: "SN6", system: "mbti", dimension: "SN", pole: "N", text: "Me atraen más las posibilidades futuras y lo que podría llegar a ser que lo actual." },
  { id: "SN7", system: "mbti", dimension: "SN", pole: "N", text: "Suelo buscar patrones ocultos, conexiones simbólicas o significados detrás de los hechos." },
  { id: "SN8", system: "mbti", dimension: "SN", pole: "N", text: "Disfruto imaginando escenarios hipotéticos y soluciones innovadoras." },
  { id: "SN9", system: "mbti", dimension: "SN", pole: "N", text: "Prefiero entender el panorama general antes que detenerme en los detalles." },
  { id: "SN10", system: "mbti", dimension: "SN", pole: "N", text: "A menudo tengo ideas repentinas o intuiciones sin necesidad de analizar paso a paso." },

  // BLOQUE 8. PENSAMIENTO (T) vs. SENTIMIENTO (F) — 10 ítems
  { id: "TF1", system: "mbti", dimension: "TF", pole: "T", text: "Tomo decisiones basándome principalmente en la lógica y el análisis objetivo." },
  { id: "TF2", system: "mbti", dimension: "TF", pole: "T", text: "Valoro más la verdad y la justicia imparcial que evitar herir susceptibilidades." },
  { id: "TF3", system: "mbti", dimension: "TF", pole: "T", text: "Cuando alguien tiene un problema, mi primer impulso es buscar una solución práctica." },
  { id: "TF4", system: "mbti", dimension: "TF", pole: "T", text: "Procuro mantenerme objetivo y dejar las emociones fuera al evaluar un argumento." },
  { id: "TF5", system: "mbti", dimension: "TF", pole: "T", text: "Considero que las reglas deben aplicarse por igual sin excepciones personales." },
  { id: "TF6", system: "mbti", dimension: "TF", pole: "F", text: "Al tomar una decisión, considero primero cómo afectará emocionalmente a las personas." },
  { id: "TF7", system: "mbti", dimension: "TF", pole: "F", text: "Valoro más la armonía interpersonal y la empatía que ganar una discusión lógica." },
  { id: "TF8", system: "mbti", dimension: "TF", pole: "F", text: "Cuando alguien me cuenta un problema, priorizo escucharlo y brindarle apoyo emocional." },
  { id: "TF9", system: "mbti", dimension: "TF", pole: "F", text: "Mis decisiones suelen guiarse por mis valores personales y lo que siento correcto." },
  { id: "TF10", system: "mbti", dimension: "TF", pole: "F", text: "Me esfuerzo por adaptar mi trato a las necesidades emocionales de cada persona." },

  // BLOQUE 9. JUICIO (J) vs. PERCEPCIÓN (P) — 10 ítems
  { id: "JP1", system: "mbti", dimension: "JP", pole: "J", text: "Me siento más tranquilo cuando tengo las cosas decididas, cerradas y bajo control." },
  { id: "JP2", system: "mbti", dimension: "JP", pole: "J", text: "Prefiero trabajar con plazos claros, listas y una estructura definida." },
  { id: "JP3", system: "mbti", dimension: "JP", pole: "J", text: "Me gusta terminar mis pendientes antes de dedicarme al descanso o al ocio." },
  { id: "JP4", system: "mbti", dimension: "JP", pole: "J", text: "Los cambios imprevistos de planes suelen generarme incomodidad." },
  { id: "JP5", system: "mbti", dimension: "JP", pole: "J", text: "Prefiero planificar mis viajes o proyectos con bastante antelación." },
  { id: "JP6", system: "mbti", dimension: "JP", pole: "P", text: "Me siento más cómodo manteniendo mis opciones abiertas el mayor tiempo posible." },
  { id: "JP7", system: "mbti", dimension: "JP", pole: "P", text: "Rindo mejor cuando tengo la presión de una fecha límite cercana." },
  { id: "JP8", system: "mbti", dimension: "JP", pole: "P", text: "Disfruto improvisando y adaptándome sobre la marcha cuando surgen imprevistos." },
  { id: "JP9", system: "mbti", dimension: "JP", pole: "P", text: "A menudo empiezo varios proyectos o actividades por curiosidad." },
  { id: "JP10", system: "mbti", dimension: "JP", pole: "P", text: "Prefiero la flexibilidad en mis horarios antes que seguir una agenda estricta." },
];

async function reemplazarPreguntas() {
  try {
    const questionsRef = collection(db, "games", GAME_ID, "questions");

    // 1. Leer y borrar todas las preguntas de prueba existentes
    const existingSnap = await getDocs(questionsRef);
    const deleteBatch = writeBatch(db);
    existingSnap.forEach((docSnap) => {
      deleteBatch.delete(docSnap.ref);
    });
    await deleteBatch.commit();
    console.log(`🗑️  Eliminadas ${existingSnap.size} preguntas anteriores.`);

    // 2. Subir las 100 preguntas reales con orden numérico
    const insertBatch = writeBatch(db);
    QUESTIONS_100.forEach((item, index) => {
      const order = index + 1;
      // ID ordenado (q001 a q100) para mantener el orden natural en consola y consultas
      const docId = `q${String(order).padStart(3, '0')}`;
      const docRef = doc(questionsRef, docId);

      insertBatch.set(docRef, {
        code: item.id,
        order,
        ...item,
      });
    });

    await insertBatch.commit();
    console.log(`✅ ¡Las ${QUESTIONS_100.length} preguntas reales se subieron correctamente!`);
  } catch (error) {
    console.error("❌ Error reemplazando preguntas:", error);
  }
}

reemplazarPreguntas();