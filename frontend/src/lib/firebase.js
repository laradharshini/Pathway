import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAZsQE3nu-4zyNXYJ_lVnCs9y4SgUUPFkE",
    authDomain: "sahayak-teachers-ai.firebaseapp.com",
    projectId: "sahayak-teachers-ai",
    storageBucket: "sahayak-teachers-ai.firebasestorage.app",
    messagingSenderId: "593732670134",
    appId: "1:593732670134:web:799093276a75d99ed28c17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
