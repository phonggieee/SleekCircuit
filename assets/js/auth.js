import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { app } from "./firebase_config.js";

const auth = getAuth(app);
export function getCurrentUser() {
  return auth.currentUser;
}

export { auth };