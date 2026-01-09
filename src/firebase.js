import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REEMPLAZA ESTO CON LOS DATOS DE TU CONSOLA DE FIREBASE (Paso 1)
const firebaseConfig = {
  apiKey: "AIzaSyDKJhSx4GctH-GlHbOesHp_4bbxlkeNtnI",
  authDomain: "personal-os-sync-147d2.firebaseapp.com",
  projectId: "personal-os-sync-147d2",
  storageBucket: "personal-os-sync-147d2.firebasestorage.app",
  messagingSenderId: "789672051942",
  appId: "1:789672051942:web:bae5dd00e653f7d089a727"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
