import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

let emailElement = document.getElementById("email");
let passwordElement = document.getElementById("password");
let confirmPasswordElement = document.getElementById("confirm-password");
let emailErrorElement = document.getElementById("email-error");
let passwordErrorElement = document.getElementById("password-error");
let confirmPasswordErrorElement = document.getElementById(
  "confirm-password-error",
);
let registerButton = document.getElementById("register-btn");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Giữ lại
function registerValidate(email, password, confirmPassword) {
  let isValid = true;
  emailErrorElement.textContent = "";
  passwordErrorElement.textContent = "";
  confirmPasswordErrorElement.textContent = "";

  if (!email) {
    emailErrorElement.textContent = "(*) Email is required.";
    emailElement.classList.add("invalid");
    isValid = false;
  } else if (!emailRegex.test(email)) {
    emailErrorElement.textContent = "(*) Invalid email address.";
    emailElement.classList.add("invalid");
    isValid = false;
  } else {
    emailErrorElement.textContent = "";
    emailElement.classList.remove("invalid");
  }

  if (password.length < 8) {
    passwordErrorElement.textContent =
      "(*) Password must be at least 8 characters.";
    isValid = false;
  }
  if (password !== confirmPassword || confirmPassword === "") {
    confirmPasswordErrorElement.textContent = "(*) Passwords do not match.";
    isValid = false;
  }

  return isValid;
}

function handleRegister(event) {
  event.preventDefault();
  let email = emailElement.value.trim();
  let password = passwordElement.value.trim();
  let confirmPassword = confirmPasswordElement.value.trim();

  if (registerValidate(email, password, confirmPassword) === true) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Register successful:", user);
        window.location.href = "login.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Register failed:", errorCode, errorMessage);
        passwordErrorElement.textContent =
          "(*) Email or password is incorrect.";
      });
  }
}
registerButton.addEventListener("click", handleRegister);
