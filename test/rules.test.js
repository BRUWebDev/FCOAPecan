// test/rules.test.js
const assert = require("assert");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} = require("@firebase/rules-unit-testing");
const fs = require("fs");
const { getFirestore, collection, doc, setDoc, getDocs } = require("firebase/firestore");

const PROJECT_ID = "fcoapecan-test"; // arbitrary for emulator

let testEnv;

/**
 * Helper to get a Firestore client that mimics an authenticated user (or unauthenticated).
 * @param {Object|null} auth - {uid, email} or null for unauthenticated
 */
function getAuthedFirestore(auth) {
  if (!auth) {
    return testEnv.unauthenticatedContext().firestore();
  }
  return testEnv
    .authenticatedContext(auth.uid, { email: auth.email })
    .firestore();
}

describe("Firestore security rules", function () {
  this.timeout(10000);

  before(async function () {
    this.timeout(20000);
    try {
      const rules = fs.readFileSync("firestore.rules", "utf8");

      testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
          rules,
          // NOTE: don't set host/port here unless you know an emulator is already running at that host/port.
          // If you set host+port, ensure the emulator is actually running there.
        },
      });

      // seed adminUsers bypassing security rules
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, "adminUsers", "admin-uid"), {
          email: "admin@example.com",
          active: true,
        });
        await setDoc(doc(db, "adminUsers", "inactive-uid"), {
          email: "inactive@example.com",
          active: false,
        });
      });
    } catch (err) {
      console.error(
        "Failed to initialize test environment. Are you running the Firestore emulator?",
      );
      console.error(err && err.stack ? err.stack : err);
      throw err; // rethrow so mocha reports a clear failure
    }
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    } else {
      console.warn("testEnv was not initialized; skipping cleanup.");
    }
  });

  it("allows unauthenticated reads of alert/event/board", async () => {
    const db = getAuthedFirestore(null);
    // use getDocs + collection for a read attempt
    await assertSucceeds(getDocs(collection(db, "alert")));
    await assertSucceeds(getDocs(collection(db, "event")));
    await assertSucceeds(getDocs(collection(db, "board")));
  });

  it("denies unauthenticated writes to alert", async () => {
    const db = getAuthedFirestore(null);
    await assertFails(
      setDoc(doc(db, "alert", "foo"), {
        title: "X",
        message: "Y",
        active: false,
      }),
    );
  });

  it("denies authenticated non-admin writes to event", async () => {
    const db = getAuthedFirestore({
      uid: "regular-uid",
      email: "user@example.com",
    });
    await assertFails(
      setDoc(doc(db, "event", "ev1"), { name: "Party", date: Date.now() }),
    );
  });

  it("allows authenticated admin writes to event", async () => {
    const db = getAuthedFirestore({
      uid: "admin-uid",
      email: "admin@example.com",
    });
    await assertSucceeds(
      setDoc(doc(db, "event", "ev-admin"), {
        name: "Board Meeting",
        date: Date.now(),
      }),
    );
  });

  it("denies authenticated inactive admin writes", async () => {
    const db = getAuthedFirestore({
      uid: "inactive-uid",
      email: "inactive@example.com",
    });
    await assertFails(
      setDoc(doc(db, "event", "ev-inactive"), {
        name: "ShouldFail",
        date: Date.now(),
      }),
    );
  });
});
