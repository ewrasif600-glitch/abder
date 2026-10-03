import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";



const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const addUserBtn = document.getElementById("addUserBtn");
const emailInput = document.getElementById("newUserEmail");
const passInput = document.getElementById("newUserPass");
const userTable = document.getElementById("userTable").querySelector("tbody");

// Add new admin
addUserBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    alert("Please enter email and password!");
    return;
  }

  const refCode = btoa(email + Date.now()); // generate unique ref
  const refLink = `https://yourwebsite.com/order.html?r=${refCoe}`;

  push(ref(db, "admins"), { email, password, refLink })
    .then(() => {
      alert(`Admin added successfully!\nRef Link:\n${refLink}`);
      emailInput.value = "";
      passInput.value = "";
    })
    .catch(err => alert("Error: " + err.message));
});

// Show all admins
const adminsRef = ref(db, "admins");
onValue(adminsRef, (snapshot) => {
  const data = snapshot.val();
  userTable.innerHTML = "";

  Object.keys(data || {}).forEach(key => {
    const admin = data[key];
    userTable.innerHTML += `
      <tr>
        <td>${admin.email}</td>
        <td>${admin.password}</td>
        <td><a href="${admin.refLink}" target="_blank">Ref Link</a></td>
      </tr>
    `;
  });
});
