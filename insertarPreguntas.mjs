import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';

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

async function subir90PreguntasDePrueba() {
  try {
    const batch = writeBatch(db);
    // Apuntamos a la subcolección: games/{GAME_ID}/questions
    const questionsRef = collection(db, "games", GAME_ID, "questions");

    for (let i = 1; i <= 90; i++) {
      // Creamos un ID ordenado (q01, q02... q90) para que luego se lean en orden
      const docId = `q${String(i).padStart(2, '0')}`;
      const docRef = doc(questionsRef, docId);

      batch.set(docRef, {
        order: i,
        text: `Pregunta de prueba #${i}`,
        // Dejamos listo un campo 'dimension' para cuando calcules el MBTI (E/I, S/N, T/F, J/P)
        dimension: i % 4 === 1 ? 'EI' : i % 4 === 2 ? 'SN' : i % 4 === 3 ? 'TF' : 'JP'
      });
    }

    await batch.commit();
    console.log("🚀 ¡Las 90 preguntas de prueba se subieron en un segundo!");
  } catch (error) {
    console.error("❌ Error subiendo preguntas:", error);
  }
}

subir90PreguntasDePrueba();