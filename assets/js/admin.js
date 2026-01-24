import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
  Timestamp,
  updateDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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
const auth = getAuth(app);

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
const boardSave = document.getElementById("board-save");
const boardSaveText = document.getElementById("board-save-text");
const boardSaveSpinner = document.getElementById("board-save-spinner");
const eventSave = document.getElementById("event-save");
const eventSaveText = document.getElementById("event-save-text");
const eventSaveSpinner = document.getElementById("event-save-spinner");
const eventName = document.getElementById("event-name");
const eventDescription = document.getElementById("event-description");
const eventLink = document.getElementById("event-link");
const eventDate = document.getElementById("event-date");
const eventList = document.getElementById("event-list");
const eventModalLabel = document.getElementById("eventModalLabel");
const eventModalElement = document.getElementById("eventModal");
const addEventButton = document.querySelector('[data-bs-target="#eventModal"]');
const toast = document.getElementById("toast");
const adminDashboard = document.getElementById("admin-dashboard");
const adminLogin = document.getElementById("admin-login");
const adminLoginButton = document.getElementById("admin-login-button");
const adminUserAvatar = document.getElementById("admin-user-avatar");
const adminUserName = document.getElementById("admin-user-name");
const adminLogout = document.getElementById("admin-logout");
let isAdmin = false;
let authPromptInFlight = false;
let adminDataLoaded = false;
let adminDataLoading = false;
let editingEventId = null;
let eventModalInstance = null;

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
  alertMessage.value = alert.message;
}

function setAlertRef(alertId) {
  alertRef = doc(db, "alert", alertId);
}

function setButtonStatusSaving(button, spinner, textElement, textContent) {
  button.disabled = true;
  spinner.classList.remove("visually-hidden");
  textElement.textContent = textContent;
}

function setButtonStatusDone(button, spinner, textElement, textContent) {
  button.disabled = false;
  spinner.classList.add("visually-hidden");
  textElement.textContent = textContent;
}

async function loadAlert() {
  const querySnapshot = await getDocs(collection(db, "alert"));
  setAlertRef(querySnapshot.docs[0].id);
  populateAlert(querySnapshot.docs[0].data());
}

async function updateAlert() {
  await updateDoc(alertRef, {
    title: alertTitle.value,
    message: alertMessage.value,
  });
}

async function updateAlertStatus() {
  await updateDoc(alertRef, {
    active: alertSwitch.checked,
  });
}

function populateEvent(event) {
  const eventHTML = document.createElement("li");
  eventHTML.classList.add("list-group-item", "card-event", "mb-3");
  eventHTML.dataset.id = event.id;
  eventHTML.innerHTML = `
    <div class="row text-color">
      <div class="col-2 mt-1">
        <div class="d-block">
          <h2>${event.date.getUTCDate()}</h2>
          <h5 class="text-heading">${months[event.date.getUTCMonth()]} ${event.date.getUTCFullYear()}</h5>
        </div>
      </div>
      <div class="col-10 col-lg-9 mt-1">
        <div class="d-block">
          <h4 class="text-heading">${event.name}</h4>
          <p>${event.description}</p>
          <p><b>Link:</b> <a href="${event.link}" target="_blank">${event.link}</a></p>
        </div>
      </div>
      <div class="col-12 col-lg-1 my-1 d-flex flex-column justify-content-center gap-1 gap-lg-3">
        <button type="button" class="btn btn-warning btn-event-action js-event-edit">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button type="button" class="btn btn-danger btn-event-action js-event-delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
  eventList.appendChild(eventHTML);
}

async function createEvent() {
  const event = {
    name: eventName.value,
    description: eventDescription.value,
    link: eventLink.value,
    date: Timestamp.fromDate(eventDate.valueAsDate),
  };
  await addDoc(collection(db, "event"), event);
}

async function deleteEventById(eventId) {
  await deleteDoc(doc(db, "event", eventId));
}

async function deletePastEvents() {
  if (!ensureAdmin()) {
    return;
  }
  const now = new Date();
  const pastQuery = query(
    collection(db, "event"),
    where("date", "<", Timestamp.fromDate(now)),
  );
  const snapshot = await getDocs(pastQuery);
  if (snapshot.empty) {
    return;
  }
  const deletions = snapshot.docs.map((eventDoc) =>
    deleteDoc(doc(db, "event", eventDoc.id)),
  );
  await Promise.all(deletions);
}

async function loadEvents() {
  eventList.innerHTML = "";
  const eventCollectionRef = collection(db, "event");
  const now = new Date();
  const q = query(
    eventCollectionRef,
    where("date", ">=", Timestamp.fromDate(now)),
    orderBy("date"),
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    let event = doc.data();
    const timestamp = new Timestamp(event.date.seconds, event.date.nanoseconds);
    event.date = timestamp.toDate();
    populateEvent({ id: doc.id, ...event });
  });
}

function setEventFormEnabled(enabled) {
  eventName.disabled = !enabled;
  eventDescription.disabled = !enabled;
  eventLink.disabled = !enabled;
  eventDate.disabled = !enabled;
  eventSave.disabled = !enabled;
}

function openEventModalForCreate() {
  editingEventId = null;
  if (eventModalLabel) {
    eventModalLabel.textContent = "Add Event";
  }
  eventSaveText.textContent = "Save Event";
  eventName.value = "";
  eventDescription.value = "";
  eventLink.value = "";
  eventDate.value = "";
  setEventFormEnabled(true);
}

async function openEventModalForEdit(eventId) {
  editingEventId = eventId;
  if (eventModalLabel) {
    eventModalLabel.textContent = "Edit Event";
  }
  eventSaveText.textContent = "Update Event";
  setEventFormEnabled(false);
  try {
    const snap = await getDoc(doc(db, "event", eventId));
    if (!snap.exists()) {
      editingEventId = null;
      createToast("Event not found.", false);
      return;
    }
    const data = snap.data();
    eventName.value = data.name || "";
    eventDescription.value = data.description || "";
    eventLink.value = data.link || "";
    if (data.date && typeof data.date.toDate === "function") {
      const jsDate = data.date.toDate();
      eventDate.value = jsDate.toISOString().slice(0, 10);
    } else {
      eventDate.value = "";
    }
    eventModalInstance = bootstrap.Modal.getOrCreateInstance(eventModalElement);
    eventModalInstance.show();
  } catch (error) {
    editingEventId = null;
    createToast(error.message, false);
  } finally {
    setEventFormEnabled(true);
  }
}

function closeEventModal() {
  eventModalInstance = bootstrap.Modal.getOrCreateInstance(eventModalElement);
  eventModalInstance.hide();
}

async function updateEvent(eventId) {
  const payload = {
    name: eventName.value,
    description: eventDescription.value,
    link: eventLink.value,
    date: Timestamp.fromDate(eventDate.valueAsDate),
  };
  await updateDoc(doc(db, "event", eventId), payload);
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

function createToast(message, success) {
  if (success) {
    toast.classList.remove("text-bg-danger");
    toast.classList.add("text-bg-success");
  } else {
    toast.classList.remove("text-bg-success");
    toast.classList.add("text-bg-danger");
  }
  const toastMessage = document.getElementById("toast-message");
  toastMessage.innerHTML = message;
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

const adminControls = [
  alertSwitch,
  alertTitle,
  alertMessage,
  alertSave,
  boardSave,
  eventSave,
  eventName,
  eventDescription,
  eventLink,
  eventDate,
];

function setAdminUiEnabled(enabled) {
  adminControls.forEach((control) => {
    if (control) {
      control.disabled = !enabled;
    }
  });
}

function setAdminVisibility(showDashboard) {
  if (adminDashboard) {
    adminDashboard.classList.toggle("d-none", !showDashboard);
  }
  if (adminLogin) {
    adminLogin.classList.toggle("d-none", showDashboard);
  }
}

async function initializeAdminDashboard() {
  if (adminDataLoaded || adminDataLoading) {
    return;
  }
  adminDataLoading = true;
  setAdminUiEnabled(false);
  setAdminVisibility(false);
  try {
    await loadAlert();
    await deletePastEvents();
    await loadEvents();
    await loadBoard();
    adminDataLoaded = true;
    setAdminUiEnabled(true);
    setAdminVisibility(true);
  } catch (error) {
    adminDataLoaded = false;
    createToast(error.message, false);
    setAdminUiEnabled(false);
    setAdminVisibility(false);
  } finally {
    adminDataLoading = false;
  }
}

function promptLogin() {
  if (authPromptInFlight) {
    return;
  }
  authPromptInFlight = true;
  signInWithPopup(auth, provider)
    .catch((error) => {
      setAdminUiEnabled(false);
      setAdminVisibility(false);
      createToast(error.message, false);
    })
    .finally(() => {
      authPromptInFlight = false;
    });
}

async function checkAdmin(user) {
  try {
    const adminRef = doc(db, "adminUsers", user.uid);
    const adminSnap = await getDoc(adminRef);
    const adminData = adminSnap.exists() ? adminSnap.data() : null;
    isAdmin = !!(adminData && adminData.active === true);
    if (isAdmin) {
      if (adminUserAvatar) {
        adminUserAvatar.src = user.photoURL || "";
      }
      if (adminUserName) {
        adminUserName.textContent = user.displayName || user.email || "Admin";
      }
      await initializeAdminDashboard();
      return;
    }
    adminDataLoaded = false;
    setAdminUiEnabled(false);
    setAdminVisibility(false);
    createToast("Not authorized", false);
  } catch (error) {
    isAdmin = false;
    adminDataLoaded = false;
    setAdminUiEnabled(false);
    setAdminVisibility(false);
    createToast(error.message, false);
  }
}

function ensureAdmin() {
  if (!isAdmin) {
    createToast("Not authorized", false);
    return false;
  }
  return true;
}

alertSwitch.addEventListener("change", async function (_) {
  try {
    if (!ensureAdmin()) {
      return;
    }
    await updateAlertStatus();
    createToast("Updated alert status successfully.", true);
  } catch (error) {
    createToast(error.message, false);
  }
});

alertSave.addEventListener("click", async function (event) {
  event.preventDefault();
  if (!ensureAdmin()) {
    return;
  }
  setButtonStatusSaving(
    alertSave,
    alertSaveSpinner,
    alertSaveText,
    "Saving Alert...",
  );
  try {
    await updateAlert();
    createToast("Updated alert successfully.", true);
  } catch (error) {
    createToast(error.message, false);
  } finally {
    setButtonStatusDone(
      alertSave,
      alertSaveSpinner,
      alertSaveText,
      "Save Alert",
    );
  }
});

boardSave.addEventListener("click", async function (event) {
  event.preventDefault();
  if (!ensureAdmin()) {
    return;
  }
  setButtonStatusSaving(
    boardSave,
    boardSaveSpinner,
    boardSaveText,
    "Saving Board...",
  );
  try {
    await updateBoard();
    createToast("Updated board successfully.", true);
  } catch (error) {
    createToast(error.message, false);
  } finally {
    setButtonStatusDone(
      boardSave,
      boardSaveSpinner,
      boardSaveText,
      "Save Board",
    );
  }
});

eventSave.addEventListener("click", async function (event) {
  event.preventDefault();
  if (!ensureAdmin()) {
    return;
  }
  setButtonStatusSaving(
    eventSave,
    eventSaveSpinner,
    eventSaveText,
    "Saving Event...",
  );
  try {
    if (editingEventId) {
      await updateEvent(editingEventId);
      createToast("Updated event successfully.", true);
    } else {
      await createEvent();
      createToast("Created event successfully.", true);
    }
    closeEventModal();
    editingEventId = null;
    eventName.value = "";
    eventDescription.value = "";
    eventLink.value = "";
    eventDate.value = "";
    await loadEvents();
  } catch (error) {
    createToast(error.message, false);
  } finally {
    setButtonStatusDone(
      eventSave,
      eventSaveSpinner,
      eventSaveText,
      editingEventId ? "Update Event" : "Save Event",
    );
  }
});

eventList.addEventListener("click", async function (event) {
  const editButton = event.target.closest(".js-event-edit");
  const deleteButton = event.target.closest(".js-event-delete");
  if (!editButton && !deleteButton) {
    return;
  }

  const eventItem = event.target.closest("[data-id]");
  const eventId = eventItem ? eventItem.dataset.id : null;
  if (editButton) {
    if (!ensureAdmin()) {
      return;
    }
    if (!eventId) {
      createToast("Could not determine which event to edit.", false);
      return;
    }
    await openEventModalForEdit(eventId);
    return;
  }
  if (!ensureAdmin()) {
    return;
  }
  if (!eventId || !eventItem) {
    createToast("Event not found.", false);
    return;
  }
  const confirmed = window.confirm("Delete this event?");
  if (!confirmed) {
    return;
  }
  if (deleteButton) {
    deleteButton.disabled = true;
  }
  try {
    await deleteEventById(eventId);
    await loadEvents();
    createToast("Deleted event successfully.", true);
  } catch (error) {
    createToast(error.message, false);
  } finally {
    if (deleteButton) {
      deleteButton.disabled = false;
    }
  }
});

if (addEventButton) {
  addEventButton.addEventListener("click", () => {
    openEventModalForCreate();
  });
}

setAdminUiEnabled(false);
setAdminVisibility(false);
onAuthStateChanged(auth, (user) => {
  if (user) {
    checkAdmin(user);
    return;
  }

  adminDataLoaded = false;
  if (adminUserAvatar) {
    adminUserAvatar.src = "";
  }
  if (adminUserName) {
    adminUserName.textContent = "";
  }
  setAdminUiEnabled(false);
  setAdminVisibility(false);
});

if (adminLoginButton) {
  adminLoginButton.addEventListener("click", () => {
    promptLogin();
  });
}

if (adminLogout) {
  adminLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      createToast(error.message, false);
    }
  });
}
