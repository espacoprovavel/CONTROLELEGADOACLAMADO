// ============================================================
//  Inicialização do Firebase (Auth + Firestore)
//  Plano Spark (gratuito). Sem Cloud Functions, sem backend.
// ============================================================
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Os valores vêm do ficheiro .env (ver .env.example). Se não
// existir .env, caímos para os valores do projeto de exemplo
// para que a app arranque na mesma em desenvolvimento.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCNMb3CiXCvjvGxOo5Zbvy5Gy2wLCplMVE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'controle-legado-aclamado.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'controle-legado-aclamado',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'controle-legado-aclamado.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '238679731860',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:238679731860:web:16991c0f00a24fdd114e81',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuração do Cloudinary (anexos)
export const CLOUDINARY = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlhbrckt6',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'legado_documentos',
};

export default app;
