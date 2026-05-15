import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3mrOQjL3oHG49nXmTJjPnmtijtSupWfE",
  authDomain: "sleek-2db55.firebaseapp.com",
  projectId: "sleek-2db55",
  storageBucket: "sleek-2db55.firebasestorage.app",
  messagingSenderId: "1076518713789",
  appId: "1:1076518713789:web:2fb3f3e9c6a3939ce4fad4",
};

const app = initializeApp(firebaseConfig);
console.log(app.name);
export { app };
