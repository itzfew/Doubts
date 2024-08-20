// Import Firebase and Firestore
import firebase from 'firebase/app';
import 'firebase/firestore'; 
import 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_dNTrWIo8fSTub-J4uh_Yjf4Fr_qay3c",
  authDomain: "ind-edu.firebaseapp.com",
  databaseURL: "https://ind-edu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ind-edu",
  storageBucket: "ind-edu.appspot.com",
  messagingSenderId: "60520122150",
  appId: "1:60520122150:web:0205f57353dae6cfc723e7",
  measurementId: "G-XLZRGM88T9"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

// Get Firestore and Auth instances
const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth };
