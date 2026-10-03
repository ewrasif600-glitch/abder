// dashboard/script.js

import {
  auth,
  googleProvider,
  signInWithRedirect,
  signOut,
  onAuthStateChanged
} from "./firebase-config.js";

/*
|--------------------------------------------------------------------------
| ADMIN ALLOWLIST
|--------------------------------------------------------------------------
*/

const ALLOWED_ADMIN_EMAILS = [
  "asifsheikh60000@gmail.com",
  "ewrasif600@gmail.com",
  "kcarpenter8383@gmail.com"
 
];

/*
|--------------------------------------------------------------------------
| ELEMENTS
|--------------------------------------------------------------------------
*/

const authLoading = document.getElementById("authLoading");
const dashboard = document.getElementById("dashboard");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginError = document.getElementById("loginError");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileImage = document.getElementById("profileImage");
const avatarLetter = document.getElementById("avatarLetter");

const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

let currentUser = null;

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
| AUTH LOADING
|--------------------------------------------------------------------------
*/

function showLoading() {
  if (authLoading) {
    authLoading.hidden = false;
  }

  if (dashboard) {
    dashboard.hidden = true;
  }
}

/*
|--------------------------------------------------------------------------
| SHOW DASHBOARD
|--------------------------------------------------------------------------
*/

function showDashboard(user) {
  currentUser = user;

  if (authLoading) {
    authLoading.hidden = true;
  }

  if (dashboard) {
    dashboard.hidden = false;
  }

  updateProfile(user);
}

/*
|--------------------------------------------------------------------------
| REDIRECT TO LOGIN
|--------------------------------------------------------------------------
*/

function showLoginPage() {
  // Actual login page:
  // /login/index.html

  window.location.replace("../login/");
}

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

function updateProfile(user) {
  if (!user) return;

  const name =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Admin";

  const email =
    user.email ||
    "Administrator";

  /*
  |----------------------------------------------------------------------
  | NAME
  |----------------------------------------------------------------------
  */

  if (profileName) {
    profileName.textContent = name;
  }

  /*
  |----------------------------------------------------------------------
  | EMAIL
  |----------------------------------------------------------------------
  */

  if (profileEmail) {
    profileEmail.textContent = email;
  }

  /*
  |----------------------------------------------------------------------
  | PROFILE IMAGE
  |----------------------------------------------------------------------
  */

  if (user.photoURL && profileImage) {

    profileImage.src = user.photoURL;
    profileImage.hidden = false;

    if (avatarLetter) {
      avatarLetter.hidden = true;
    }

  } else {

    if (profileImage) {
      profileImage.hidden = true;
    }

    if (avatarLetter) {
      avatarLetter.hidden = false;

      avatarLetter.textContent =
        name.charAt(0).toUpperCase();
    }
  }
}

/*
|--------------------------------------------------------------------------
| GOOGLE LOGIN
|--------------------------------------------------------------------------
|
| Eta optional.
| Dashboard page-e login button thakle kaj korbe.
|--------------------------------------------------------------------------
*/

async function loginWithGoogle() {

  if (!loginBtn) return;

  try {

    loginBtn.disabled = true;
    loginBtn.classList.add("loading");

    if (loginError) {
      loginError.hidden = true;
      loginError.textContent = "";
    }

    await signInWithRedirect(
      auth,
      googleProvider
    );

  } catch (error) {

    console.error("Google login error:", error);

    if (loginError) {

      loginError.hidden = false;

      if (error.code === "auth/unauthorized-domain") {

        loginError.textContent =
          "This domain is not authorized in Firebase.";

      } else if (error.code === "auth/operation-not-allowed") {

        loginError.textContent =
          "Google Sign-In is not enabled in Firebase.";

      } else if (error.code === "auth/network-request-failed") {

        loginError.textContent =
          "Network error. Please check your internet connection.";

      } else {

        loginError.textContent =
          error.message ||
          "Login failed. Please try again.";
      }
    }

    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
  }
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

async function logoutAdmin() {

  try {

    if (logoutBtn) {
      logoutBtn.disabled = true;
    }

    await signOut(auth);

    window.location.replace("../login/");

  } catch (error) {

    console.error("Logout error:", error);

    if (logoutBtn) {
      logoutBtn.disabled = false;
    }

    alert("Logout failed. Please try again.");
  }
}

/*
|--------------------------------------------------------------------------
| AUTH GUARD
|--------------------------------------------------------------------------
*/

function startAuthGuard() {

  showLoading();

  onAuthStateChanged(auth, async (user) => {

    console.log(
      "Firebase auth state:",
      user ? user.email : "No user"
    );

    if (!user) {

      currentUser = null;

      showLoginPage();

      return;
    }

    console.log(
      "Authenticated user:",
      user.email
    );

    if (!isAllowedAdmin(user.email)) {

      console.warn(
        "Unauthorized admin account:",
        user.email
      );

      await signOut(auth);

      alert(
        "Your Google account is not authorized to access this admin panel."
      );

      showLoginPage();

      return;
    }

    console.log(
      "Authorized admin:",
      user.email
    );

    showDashboard(user);
  });
}

/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

function openSidebar() {

  if (!sidebar) return;

  sidebar.classList.add("open");

  if (sidebarOverlay) {
    sidebarOverlay.classList.add("show");
  }
}

function closeSidebarMenu() {

  if (!sidebar) return;

  sidebar.classList.remove("open");

  if (sidebarOverlay) {
    sidebarOverlay.classList.remove("show");
  }
}

/*
|--------------------------------------------------------------------------
| EVENT LISTENERS
|--------------------------------------------------------------------------
*/

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    loginWithGoogle
  );
}

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logoutAdmin
  );
}

if (menuToggle) {

  menuToggle.addEventListener(
    "click",
    openSidebar
  );
}

if (closeSidebar) {

  closeSidebar.addEventListener(
    "click",
    closeSidebarMenu
  );
}

if (sidebarOverlay) {

  sidebarOverlay.addEventListener(
    "click",
    closeSidebarMenu
  );
}

document
  .querySelectorAll(".nav-link")
  .forEach(link => {

    link.addEventListener(
      "click",
      closeSidebarMenu
    );

  });

/*
|--------------------------------------------------------------------------
| YEAR
|--------------------------------------------------------------------------
*/

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

/*
|--------------------------------------------------------------------------
| START AUTH GUARD
|--------------------------------------------------------------------------
*/

startAuthGuard();
