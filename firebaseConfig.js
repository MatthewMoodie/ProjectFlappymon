import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCb9izNoFt9RlL4C44XZC3cWynM8BXyTkU",
    authDomain: "info-1601-project-2b4bb.firebaseapp.com",
    projectId: "info-1601-project-2b4bb",
    storageBucket: "info-1601-project-2b4bb.appspot.com",
    messagingSenderId: "989604980668",
    appId: "1:989604980668:web:9b60bcfa061c83570fadb9"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export const db = app.firestore();