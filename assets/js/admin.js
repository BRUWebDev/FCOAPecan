import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

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
const eventList = document.getElementById("event-list");

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

function populateEvent(event) {
  console.log(event);
  const eventHTML = document.createElement("li");
  eventHTML.classList.add("list-group-item", "card-event", "mb-3");
  eventHTML.innerHTML = `
    <div class="row text-color">
      <div class="col-2 mt-1">
        <div class="d-block">
          <h2>${event.date.getDate()}</h2>
          <h5 class="text-heading">${months[event.date.getMonth()]} ${event.date.getFullYear()}</h5>
        </div>
      </div>
      <div class="col-10 col-md-8 mt-1">
        <div class="d-block">
          <h4 class="text-heading">${event.name}</h4>
          <p>${event.description}</p>
          <p><b>Link:</b> <a href="${event.link}" target="_blank">${event.link}</a></p>
        </div>
      </div>
    </div>`;
  eventList.appendChild(eventHTML);
}

async function loadEvents() {
  const querySnapshot = await getDocs(collection(db, "event"));
  querySnapshot.forEach((doc) => {
    let event = doc.data();
    const timestamp = new Timestamp(event.date.seconds, event.date.nanoseconds);
    event.date = timestamp.toDate();
    populateEvent(event);
  });
}

loadEvents();

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

const auth = getAuth();
signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
