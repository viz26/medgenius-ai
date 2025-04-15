import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Debug: Check if environment variables are loaded
const envVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('Firebase Config Status:', Object.entries(envVars).reduce((acc, [key, value]) => {
  acc[key] = value ? 'Present' : 'Missing';
  return acc;
}, {}));

// Validate required config
if (!envVars.apiKey || !envVars.authDomain || !envVars.projectId) {
  console.error('Missing required Firebase configuration. Please check your environment variables.');
}

const firebaseConfig = envVars;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure auth persistence and error handling
auth.useDeviceLanguage();

console.log('Firebase initialized successfully');

// Add necessary headers for development
if (import.meta.env.DEV) {
  // Add CSP header with updated rules
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = `
    default-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.google.com https://*.firebaseapp.com;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://*.googleapis.com https://apis.google.com https://*.google.com https://*.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.gstatic.com;
    img-src 'self' data: https://*.googleusercontent.com https://*.google.com https://*.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://api.openai.com;
    frame-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.google.com https://*.gstatic.com https://*.firebaseapp.com;
  `.replace(/\s+/g, ' ').trim();
  document.head.appendChild(cspMeta);
}

export { auth, db, googleProvider }; 