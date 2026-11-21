import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5-cikJI7ec70WNpl8hzjh6UvC0k36JQg",
  authDomain: "dary-fabbf.firebaseapp.com",
  projectId: "dary-fabbf",
  storageBucket: "dary-fabbf.firebasestorage.app",
  messagingSenderId: "524703111160",
  appId: "1:524703111160:web:4018dd9461e3e779f2a80d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);