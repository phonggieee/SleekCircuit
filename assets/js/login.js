import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

let emailElement = document.getElementById("email");
let passwordElement = document.getElementById("password");
let loginButton = document.getElementById("login-btn");
let emailErrorElement = document.getElementById("email-error");
let passwordErrorElement = document.getElementById("password-error");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

loginButton.addEventListener("click", handleLogin);

const googleBtn = document.getElementById("google-signin-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    alert("This feature is in development.");
  });
}

function handleLogin(event) {
  event.preventDefault();
  let email = emailElement.value.trim();
  let password = passwordElement.value.trim();

  if (loginValidate(email, password) === true) {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Login successful:", user);
        localStorage.setItem("cartUserEmail", user.email || "");
        window.location.href = "index.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login failed:", errorCode, errorMessage);
        passwordErrorElement.textContent =
          "(*) Email or password is incorrect.";
      });
  }
}

function loginValidate(email, password) {
  let isValid = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailErrorElement.textContent = "";
  passwordErrorElement.textContent = "";

  if (!emailRegex.test(email)) {
    emailErrorElement.textContent = "(*) Invalid email format.";
    isValid = false;
  }
  if (password === "") {
    passwordErrorElement.textContent =
      "(*) Password must be at least 6 characters.";
    isValid = false;
  }
  return isValid;
}
