// login/login.js

import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "../dashboard/firebase-config.js";

/*
|--------------------------------------------------------------------------
| ADMIN ALLOWLIST
|--------------------------------------------------------------------------
*/

const ALLOWED_ADMIN_EMAILS = [
  "asifsheikh60000@gmail.com",
  "kcarpenter8383@gmail.com",
  "ewrasif600@gmail.com"
];

/*
|--------------------------------------------------------------------------
| ELEMENTS
|--------------------------------------------------------------------------
*/

const loginButton =
  document.getElementById("googleLoginBtn");

const errorMessage =
  document.getElementById("error-msg");

/*
|--------------------------------------------------------------------------
| ADMIN CHECK
|--------------------------------------------------------------------------
*/

function isAllowedAdmin(email) {

  if (!email) return false;

  return ALLOWED_ADMIN_EMAILS
    .map(email => email.toLowerCase().trim())
    .includes(email.toLowerCase().trim());
}

/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

function showError(message) {

  if (!errorMessage) return;

  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {

  if (!errorMessage) return;

  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

/*
|--------------------------------------------------------------------------
| BUTTON LOADING
|--------------------------------------------------------------------------
*/

function setLoading(loading) {

  if (!loginButton) return;

  loginButton.disabled = loading;

  if (loading) {

    loginButton.classList.add("loading");

    const text =
      loginButton.querySelector(".btn-text");

    if (text) {
      text.textContent = "Authenticating...";
    }

  } else {

    loginButton.classList.remove("loading");

    const text =
      loginButton.querySelector(".btn-text");

    if (text) {
      text.textContent = "Authenticate via Google";
    }
  }
}

/*
|--------------------------------------------------------------------------
| DASHBOARD REDIRECT
|--------------------------------------------------------------------------
*/

function goToDashboard() {

  console.log(
    "Authorized login. Opening dashboard..."
  );

  window.location.replace(
    "../dashboard/index.html"
  );
}

/*
|--------------------------------------------------------------------------
| GOOGLE LOGIN
|--------------------------------------------------------------------------
*/

async function loginWithGoogle() {

  hideError();
  setLoading(true);

  try {

    console.log(
      "Starting Google popup login..."
    );

    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );

    const user = result.user;

    console.log(
      "Google login successful:",
      user.email
    );

    /*
    |--------------------------------------------------------------------------
    | ADMIN EMAIL CHECK
    |--------------------------------------------------------------------------
    */

    if (!isAllowedAdmin(user.email)) {

      console.warn(
        "Unauthorized account:",
        user.email
      );

      await signOut(auth);

      showError(
        "This Google account is not authorized to access this admin panel."
      );

      setLoading(false);

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHORIZED
    |--------------------------------------------------------------------------
    */

    console.log(
      "Authorized admin:",
      user.email
    );

    goToDashboard();

  } catch (error) {

    console.error(
      "Google login error:",
      error
    );

    console.error(
      "Firebase error code:",
      error.code
    );

    console.error(
      "Firebase error message:",
      error.message
    );

    let message =
      "Authentication failed. Please try again.";

    switch (error.code) {

      case "auth/popup-closed-by-user":

        message =
          "Google login window was closed before authentication completed.";

        break;

      case "auth/popup-blocked":

        message =
          "Your browser blocked the Google login popup. Please allow popups for this site.";

        break;

      case "auth/unauthorized-domain":

        message =
          "127.0.0.1 is not authorized in Firebase.";

        break;

      case "auth/operation-not-allowed":

        message =
          "Google Sign-In is not enabled in Firebase.";

        break;

      case "auth/network-request-failed":

        message =
          "Network error. Please check your internet connection.";

        break;

      case "auth/account-exists-with-different-credential":

        message =
          "This Google account already exists with another sign-in method.";

        break;

      default:

        if (error.message) {
          message = error.message;
        }
    }

    showError(message);

    setLoading(false);
  }
}

/*
|--------------------------------------------------------------------------
| EXISTING AUTH SESSION
|--------------------------------------------------------------------------
*/

onAuthStateChanged(auth, (user) => {

  console.log(
    "Auth state:",
    user ? user.email : "No user"
  );

  if (!user) {
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK ADMIN
  |--------------------------------------------------------------------------
  */

  if (isAllowedAdmin(user.email)) {

    console.log(
      "Existing authorized session:",
      user.email
    );

    goToDashboard();

  } else {

    console.warn(
      "Existing account is not authorized:",
      user.email
    );

    signOut(auth);
  }
});

/*
|--------------------------------------------------------------------------
| LOGIN BUTTON
|--------------------------------------------------------------------------
*/

if (loginButton) {

  loginButton.addEventListener(
    "click",
    loginWithGoogle
  );
}

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

setLoading(false);
