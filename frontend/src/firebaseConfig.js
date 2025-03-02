// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2vMyMqbhxa6sX1x-MhFKD7Dnq1hs5w7w",
  authDomain: "final-sda-stalker.firebaseapp.com",
  projectId: "final-sda-stalker",
  storageBucket: "final-sda-stalker.firebasestorage.app",
  messagingSenderId: "1097208339323",
  appId: "1:1097208339323:web:dd6460b3f180a38406fbde",
  measurementId: "G-FSY979TMJN"
};

// Initialize Firebase and export the app instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db};