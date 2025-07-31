import { authenticateUser, getAuthStatus } from "../services/index.service.js";
import { displayMessage, clearMessage } from "./dom.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");

  // Redirect to operations.html if already authenticated
  if (getAuthStatus()) {
    window.location.href = "src/views/operations.html";
    return; // Stop execution if redirected
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      clearMessage(loginError);

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      if (authenticateUser(username, password)) {
        window.location.href = "src/views/operations.html"; // Redirect on successful login
      } else {
        displayMessage(loginError, "Invalid username or password.", true);
      }
    });
  }
});
