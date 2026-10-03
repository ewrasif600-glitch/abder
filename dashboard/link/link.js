// dashboard/link/script.js

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


/*
|--------------------------------------------------------------------------
| FIREBASE CONFIG
|--------------------------------------------------------------------------
*/

const firebaseConfig = {
  apiKey: "AIzaSyCgJA67XUBtysxdEl_6tKl0Tebpr2zkbuw",
  authDomain: "abder-b11b9.firebaseapp.com",
  projectId: "abder-b11b9",
  storageBucket: "abder-b11b9.firebasestorage.app",
  messagingSenderId: "163440280492",
  appId: "1:163440280492:web:203a19b2dc0b79ab313009",
  measurementId: "G-SG3T0841FJ"
};

/*
|--------------------------------------------------------------------------
| INITIALIZE FIREBASE
|--------------------------------------------------------------------------
*/

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);


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
| DOM ELEMENTS
|--------------------------------------------------------------------------
*/

const linkNameInput =
  document.getElementById("linkName");

const linkURLInput =
  document.getElementById("linkURL");

const addBtn =
  document.getElementById("addBtn");

const linkTable =
  document.querySelector("#linkTable tbody");

const logoutBtn =
  document.getElementById("logoutBtn");


/*
|--------------------------------------------------------------------------
| ADMIN CHECK
|--------------------------------------------------------------------------
*/

function isAllowedAdmin(email) {

  if (!email) {
    return false;
  }

  return ALLOWED_ADMIN_EMAILS
    .map(item => item.toLowerCase().trim())
    .includes(email.toLowerCase().trim());
}


/*
|--------------------------------------------------------------------------
| LOGIN PAGE PATH
|--------------------------------------------------------------------------
|
| Actual structure:
|
| root/
| ├── dashboard/
| │   └── link/
| │       └── script.js
| │
| └── login/
|     └── index.html
|
| So from dashboard/link/:
| ../../login/
|
|--------------------------------------------------------------------------
*/

function goToLogin() {

  window.location.replace(
    "../../login/"
  );
}


/*
|--------------------------------------------------------------------------
| DASHBOARD PATH
|--------------------------------------------------------------------------
*/

function goToDashboard() {

  window.location.replace(
    "../"
  );
}


/*
|--------------------------------------------------------------------------
| AUTH CHECK
|--------------------------------------------------------------------------
*/

let authReady = false;

onAuthStateChanged(auth, async (user) => {

  console.log(
    "Link page auth state:",
    user ? user.email : "No user"
  );

  /*
   * Firebase auth initial state
   */

  if (!user) {

    console.warn(
      "No authenticated user. Redirecting to login..."
    );

    goToLogin();

    return;
  }


  /*
   * Check admin email
   */

  if (!isAllowedAdmin(user.email)) {

    console.warn(
      "Unauthorized account:",
      user.email
    );

    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }

    alert(
      "Your Google account is not authorized to access this admin panel."
    );

    goToLogin();

    return;
  }


  /*
   * Authorized admin
   */

  console.log(
    "Authorized admin on Link page:",
    user.email
  );

  authReady = true;
});


/*
|--------------------------------------------------------------------------
| MODERN POPUP
|--------------------------------------------------------------------------
*/

function showPopup(
  message,
  type = "success"
) {

  const popup =
    document.createElement("div");

  popup.className =
    `popup-notification ${type}`;

  popup.textContent = message;


  Object.assign(
    popup.style,
    {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 20px",
      backgroundColor:
        type === "success"
          ? "#4caf50"
          : "#f44336",
      color: "#fff",
      borderRadius: "8px",
      boxShadow:
        "0 4px 15px rgba(0,0,0,0.2)",
      zIndex: "9999",
      fontFamily:
        "Poppins, sans-serif",
      fontSize: "14px",
      opacity: "0",
      transform: "translateY(-20px)",
      transition:
        "opacity 0.3s, transform 0.3s"
    }
  );


  document.body.appendChild(popup);


  setTimeout(() => {

    popup.style.opacity = "1";
    popup.style.transform =
      "translateY(0)";

  }, 10);


  setTimeout(() => {

    popup.style.opacity = "0";

    popup.style.transform =
      "translateY(-20px)";

    setTimeout(() => {
      popup.remove();
    }, 300);

  }, 2500);
}


/*
|--------------------------------------------------------------------------
| CONFIRMATION MODAL
|--------------------------------------------------------------------------
*/

function showConfirm(message) {

  return new Promise((resolve) => {

    const overlay =
      document.createElement("div");

    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;


    const modal =
      document.createElement("div");

    modal.style.cssText = `
      background: #fff;
      padding: 20px 30px;
      border-radius: 10px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      font-family: Poppins, sans-serif;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;


    modal.innerHTML = `
      <p style="
        margin-bottom:20px;
        font-size:16px;
      ">
        ${message}
      </p>

      <button
        id="confirmYes"
        style="
          padding:8px 16px;
          margin-right:10px;
          background:#4caf50;
          color:#fff;
          border:none;
          border-radius:5px;
          cursor:pointer;
        "
      >
        Yes
      </button>

      <button
        id="confirmNo"
        style="
          padding:8px 16px;
          background:#f44336;
          color:#fff;
          border:none;
          border-radius:5px;
          cursor:pointer;
        "
      >
        No
      </button>
    `;


    overlay.appendChild(modal);

    document.body.appendChild(overlay);


    document
      .getElementById("confirmYes")
      .onclick = () => {

        overlay.remove();

        resolve(true);
      };


    document
      .getElementById("confirmNo")
      .onclick = () => {

        overlay.remove();

        resolve(false);
      };

  });
}


/*
|--------------------------------------------------------------------------
| ADD LINK
|--------------------------------------------------------------------------
*/

if (addBtn) {

  addBtn.addEventListener(
    "click",
    async () => {

      /*
       * Make sure auth is ready
       */

      if (!authReady) {

        showPopup(
          "Please wait for authentication...",
          "error"
        );

        return;
      }


      const name =
        linkNameInput.value.trim();

      let url =
        linkURLInput.value.trim();


      /*
       * Validation
       */

      if (!name || !url) {

        showPopup(
          "Enter both name and URL",
          "error"
        );

        return;
      }


      /*
       * Add https automatically
       */

      if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
      ) {

        url =
          "https://" + url;
      }


      try {

        await push(
          ref(db, "links"),
          {
            name: name,
            url: url,
            createdAt: Date.now()
          }
        );


        /*
         * Clear fields
         */

        linkNameInput.value = "";

        linkURLInput.value = "";


        showPopup(
          "Link added successfully!",
          "success"
        );

      } catch (error) {

        console.error(
          "Add link error:",
          error
        );

        showPopup(
          "Failed to add link.",
          "error"
        );
      }

    }
  );

}


/*
|--------------------------------------------------------------------------
| DISPLAY LINKS
|--------------------------------------------------------------------------
*/

onValue(
  ref(db, "links"),
  (snapshot) => {

    if (!linkTable) {
      return;
    }


    linkTable.innerHTML = "";


    snapshot.forEach((child) => {

      const data =
        child.val() || {};

      const name =
        data.name || "";

      const url =
        data.url || "";

      const key =
        child.key;


      const row =
        document.createElement("tr");


      /*
       * IMPORTANT:
       * innerHTML diye user data directly inject na kore
       * DOM elements create kora hocche.
       */

      const nameCell =
        document.createElement("td");

      nameCell.textContent =
        name;


      const urlCell =
        document.createElement("td");


      const link =
        document.createElement("a");

      link.href = url;

      link.textContent = url;

      link.target = "_blank";

      link.rel =
        "noopener noreferrer";


      urlCell.appendChild(link);


      const actionCell =
        document.createElement("td");


      const deleteBtn =
        document.createElement("button");

      deleteBtn.className =
        "delete";

      deleteBtn.dataset.id =
        key;

      deleteBtn.textContent =
        "Delete";


      actionCell.appendChild(
        deleteBtn
      );


      row.appendChild(
        nameCell
      );

      row.appendChild(
        urlCell
      );

      row.appendChild(
        actionCell
      );


      linkTable.appendChild(
        row
      );


      /*
       * DELETE
       */

      deleteBtn.addEventListener(
        "click",
        async () => {

          const confirmed =
            await showConfirm(
              "Are you sure you want to delete this link?"
            );


          if (!confirmed) {
            return;
          }


          try {

            await remove(
              ref(
                db,
                `links/${key}`
              )
            );


            showPopup(
              "Link deleted successfully!",
              "success"
            );

          } catch (error) {

            console.error(
              "Delete link error:",
              error
            );

            showPopup(
              "Failed to delete link.",
              "error"
            );
          }

        }
      );

    });

  },
  (error) => {

    console.error(
      "Database read error:",
      error
    );

    showPopup(
      "Unable to load links.",
      "error"
    );
  }
);


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        logoutBtn.disabled = true;

        await signOut(auth);


        /*
         * Link page location:
         *
         * /dashboard/link/
         *
         * Login:
         *
         * /login/
         *
         * Therefore:
         *
         * ../../login/
         */

        window.location.replace(
          "../../login/"
        );

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

        logoutBtn.disabled = false;

        showPopup(
          "Logout failed. Please try again.",
          "error"
        );
      }

    }
  );

}
