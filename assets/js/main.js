import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  getFirestore,
  Timestamp,
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

const eventsContainer = document.getElementById("events-container");

function populateAlert(alert) {
  if (alert.active) {
    const alertContainer = document.getElementById("alert-container");
    alertContainer.innerHTML = `
        <div class="alert alert-accent mx-4" role="alert">
          <h4 id="alert-title" class="alert-heading">${alert.title}</h4>
          <p id="alert-message">${alert.message}</p>
        </div>`;
  }
}

async function loadAlert() {
  const querySnapshot = await getDocs(collection(db, "alert"));
  console.log(querySnapshot.docs[0].data());
  populateAlert(querySnapshot.docs[0].data());
}

loadAlert();

function populateBoardMember(id, boardMember) {
  switch (id) {
    case "president":
      document.getElementById("board-president-name").textContent =
        boardMember.name;
      break;
    case "treasurer":
      document.getElementById("board-treasurer-name").textContent =
        boardMember.name;
      break;
    case "secretary":
      document.getElementById("board-secretary-name").textContent =
        boardMember.name;
  }
}

async function loadBoard() {
  const querySnapshot = await getDocs(collection(db, "board"));
  querySnapshot.forEach((doc) => {
    populateBoardMember(doc.id, doc.data());
  });
}

loadBoard();

function populateEvent(event) {
  const eventContainer = document.getElementById("event-list");
  const eventHtml = document.createElement("li");
  eventHtml.classList.add("list-group-item", "card-event", "mb-3");

  let linkHtml = "";
  if (event.link != "") {
    linkHtml = `
      <div class="col-12 col-md-2 d-flex align-items-center justify-content-center">
        <a class="btn btn-event rounded-pill w-100" href="${event.link}" target="_blank">Learn More</a>
      </div>`;
  }

  eventHtml.innerHTML = `
    <div class="row text-color">
      <div class="col-2 mt-1">
        <div class="d-block">
          <h2>${event.date.getUTCDate()}</h2>
          <h6 class="text-heading">${months[event.date.getUTCMonth()]} ${event.date.getUTCFullYear()}</h6>
        </div>
      </div>
      <div class="col-10 col-md-8 mt-1">
        <div class="d-block">
          <h4 class="text-heading">${event.name}</h4>
          <p>${event.description}</p>
        </div>
      </div>
      ${linkHtml}
    </div>`;
  eventContainer.appendChild(eventHtml);
}

async function loadEvents() {
  const eventCollectionRef = collection(db, "event");
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const q = query(
    eventCollectionRef,
    where("date", ">=", Timestamp.fromDate(startOfToday)),
    orderBy("date"),
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    if (eventsContainer) {
      eventsContainer.classList.add("d-none");
    }
    return;
  }
  if (eventsContainer) {
    eventsContainer.classList.remove("d-none");
  }
  querySnapshot.forEach((doc) => {
    let event = doc.data();
    const timestamp = new Timestamp(event.date.seconds, event.date.nanoseconds);
    event.date = timestamp.toDate();
    populateEvent(event);
  });
}

loadEvents();
