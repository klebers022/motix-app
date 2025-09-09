import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // ADICIONE ESTA LINHA

const firebaseConfig = {
  apiKey: "AIzaSyCoIqo1CPjTBHmwgK2RlPmD6Lhy3RpNWsw",
  authDomain: "motix-e1d90.firebaseapp.com",
  projectId: "motix-e1d90",
  storageBucket: "motix-e1d90.firebasestorage.app",
  messagingSenderId: "757932393161",
  appId: "1:757932393161:web:d6bcaec4cf1bfa510c4318",
  measurementId: "G-8DDYQT1YFV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // ADICIONE ESTA LINHA

export { auth }; // ADICIONE ESTA LINHA