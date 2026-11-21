import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Tus credenciales reales de Firebase
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

async function insertarDevilman() {
  try {
    const docRef = await addDoc(collection(db, "games"), {
      title: "devilman crybaby",
      imageUrl: "URL de la portada en Firebase Storage",
      gameUrl: "https://.../jugar",
      isActive: true,
      isFeatured: false,
      sortOrder: 1
    });
    
    console.log("🚀 ¡Documento creado con éxito en Firestore! ID:", docRef.id);
  } catch (e) {
    console.error("❌ Error al insertar el documento:", e);
  }
}

insertarDevilman();