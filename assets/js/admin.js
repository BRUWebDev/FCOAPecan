import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
  writeBatch,
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
let presidentName = document.getElementById("board-president-name");
let treasurerName = document.getElementById("board-treasurer-name");
let secretaryName = document.getElementById("board-secretary-name");
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

async function updateAlert() {
  await updateDoc(alertRef, {
    active: alertSwitch.checked,
    title: alertTitle.value,
    message: alertMessage.value,
  });
}

function populateBoardMember(id, boardMember) {
  switch (id) {
    case "president":
      presidentName.value = boardMember.name;
      break;
    case "treasurer":
      treasurerName.value = boardMember.name;
      break;
    case "secretary":
      secretaryName.value = boardMember.name;
  }
}

async function loadBoard() {
  const querySnapshot = await getDocs(collection(db, "board"));
  querySnapshot.forEach((doc) => {
    populateBoardMember(doc.id, doc.data());
  });
}

loadBoard();

async function updateBoard() {
  const batch = writeBatch(db);

  const presidentRef = doc(db, "board", "president");
  batch.update(presidentRef, { name: presidentName.value });
  const treasurerRef = doc(db, "board", "treasurer");
  batch.update(treasurerRef, { name: treasurerName.value });
  const secretaryRef = doc(db, "board", "secretary");
  batch.update(secretaryRef, { name: secretaryName.value });
  await batch.commit();
}

alertSave.addEventListener("click", async function (event) {
  event.preventDefault();
  setButtonStatusSaving();
  updateAlert();
  updateBoard();
  setButtonStatusDone();
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
});
