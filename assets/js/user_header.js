import { auth } from "./auth.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

function getUsernameFromEmail(email) {
  if (!email) return "";
  return email.split("@")[0] || "";
}

function setUserHeader(user) {
  const userWidget = document.getElementById("user-widget");
  const usernameElement = document.getElementById("user-name");
  const avatarElement = document.getElementById("user-avatar");
  const loginButton = document.querySelector(".btn-login");
  const registerButton = document.querySelector(".btn-register");
  const accountEmail = document.getElementById("account-email");
  const accountUsername = document.getElementById("account-username");
  const accountUid = document.getElementById("account-uid");

  if (!userWidget) {
    return;
  }

  if (user && user.email) {
    const username = getUsernameFromEmail(user.email);
    if (usernameElement) {
      usernameElement.textContent = username;
    }
    if (avatarElement) {
      avatarElement.textContent = username.slice(0, 1).toUpperCase();
    }
    if (accountEmail) {
      accountEmail.textContent = user.email;
    }
    if (accountUsername) {
      accountUsername.textContent = username;
    }
    if (accountUid) {
      accountUid.textContent = user.uid;
    }
    userWidget.hidden = false;
    if (loginButton) loginButton.style.display = "none";
    if (registerButton) registerButton.style.display = "none";
  } else {
    userWidget.hidden = true;
    if (loginButton) loginButton.style.display = "";
    if (registerButton) registerButton.style.display = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const userWidget = document.getElementById("user-widget");
  if (userWidget) {
    userWidget.hidden = true;
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }
});

onAuthStateChanged(auth, (user) => {
  setUserHeader(user);
  const accountPage = document.getElementById("account-details-page");
  if (accountPage && !user) {
    window.location.href = "login.html";
  }
});
