// firebase/auth.js
export function logout() {
  localStorage.removeItem("adminToken");
  alert("You have been logged out!");
  window.location.href = "../login/"; 
}
