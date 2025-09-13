import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuYEi15PsLxxQqEg_J_2F3v5w-U8YqFHs",
  authDomain: "fcoapecan-80273.firebaseapp.com",
  projectId: "fcoapecan-80273",
  storageBucket: "fcoapecan-80273.firebasestorage.app",
  messagingSenderId: "58370474834",
  appId: "1:58370474834:web:7125ba087576e81a9c708b",
  measurementId: "G-QTFT5ZHR4Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

let alertRef = null;
const alertSwitch = document.getElementById("alert-switch");
const alertTitle = document.getElementById("alert-title");
const alertMessage = document.getElementById("alert-message");
const alertSave = document.getElementById("alert-save");
const alertSaveText = document.getElementById("alert-save-text");
const alertSaveSpinner = document.getElementById("alert-save-spinner");
const toast = document.getElementById("toast");

function populateAlert(alert) {
  alertSwitch.checked = alert.active;
  alertTitle.value = alert.title;
  alertMessage.textContent = alert.message;
}

function setAlertRef(alertId) {
  alertRef = doc(db, "alert", alertId);
}

function setButtonStatusSaving() {
  alertSave.disabled = true;
  alertSaveSpinner.classList.remove("visually-hidden");
  alertSaveText.textContent = "Saving...";
}

function setButtonStatusDone() {
  alertSave.disabled = false;
  alertSaveSpinner.classList.add("visually-hidden");
  alertSaveText.textContent = "Save";
}

async function loadAlert() {
  const querySnapshot = await getDocs(collection(db, "alert"));
  setAlertRef(querySnapshot.docs[0].id);
  populateAlert(querySnapshot.docs[0].data());
}

loadAlert();

alertSave.addEventListener("click", async function (event) {
  event.preventDefault();
  setButtonStatusSaving();
  await updateDoc(alertRef, {
    active: alertSwitch.checked,
    title: alertTitle.value,
    message: alertMessage.value,
  });
  setButtonStatusDone();
  // const toastElList = document.querySelectorAll(".toast");
  // const toastList = [...toastElList].map(
  //   (toastEl) => new bootstrap.Toast(toastEl, option)
  // );
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();

});
