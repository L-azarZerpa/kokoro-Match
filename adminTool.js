// adminTool.js
import 'dotenv/config';
import fs from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function commitInChunks(items, buildOp) {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    const slice = items.slice(i, i + CHUNK_SIZE);
    slice.forEach((item, idx) => buildOp(batch, item, i + idx));
    await batch.commit();
  }
}

async function upsertTestsCollection({ collectionName = 'tests', tests = [] }) {
  for (const testItem of tests) {
    const { id, questions = [], ...testData } = testItem;

    await setDoc(doc(db, collectionName, id), testData, { merge: true });

    if (questions.length > 0) {
      await commitInChunks(questions, (batch, q, idx) => {
        const order = q.order ?? idx + 1;
        const qId = q.id ?? `q_${String(order).padStart(3, '0')}`;
        const qRef = doc(db, collectionName, id, 'questions', qId);
        const { id: _ignoredId, ...qPayload } = q;

        batch.set(qRef, {
          order,
          ...qPayload,
        });
      });
    }

    console.log(`Guardado ${collectionName}/${id} (${questions.length} preguntas).`);
  }
}

async function upsertGameCharacters({ gameId, characters = [] }) {
  await commitInChunks(characters, (batch, character) => {
    const { id, ...characterData } = character;
    if (!id) {
      throw new Error('Cada personaje en el JSON debe tener un campo "id".');
    }

    const charRef = doc(db, 'games', gameId, 'characters', id);
    batch.set(charRef, characterData, { merge: true });
  });

  console.log(`Guardados ${characters.length} personajes en games/${gameId}/characters.`);
}

async function run() {
  console.log('1. Entrando a run()...');

  const GAME_ID = '7u74UUbUjOGEG20rHYsu';
  const rawCharacters = JSON.parse(
    await fs.readFile(new URL('./devilman_characters.json', import.meta.url), 'utf8')
  );
  console.log('2. JSON de personajes leído. Cantidad:', rawCharacters.length);

  console.log(`3. Subiendo personajes a games/${GAME_ID}/characters...`);
  await upsertGameCharacters({
    gameId: GAME_ID,
    characters: rawCharacters,
  });

  console.log('4. Proceso terminado.');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});