import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, Auth, signInAnonymously, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from "firebase/auth";

export interface ScorecardData {
  scores: Record<string, Record<string, Record<string, number>>>;
}

const APP_ID = "44fe43ff-804a-4758-b75a-7728048ab5b0";
const provider = new GoogleAuthProvider();

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;
let currentUser: User | null = null;

// Initialize Firebase lazily
export async function tryInitFirebase(): Promise<{ auth: Auth; db: Firestore } | null> {
  if (firebaseApp && firestoreDb && firebaseAuth) {
    return { auth: firebaseAuth, db: firestoreDb };
  }

  try {
    const response = await fetch("./firebase-applet-config.json");
    if (!response.ok) {
      throw new Error(`Config request failed: ${response.status}`);
    }
    const config = await response.json();
    
    if (!config.apiKey || !config.projectId) {
      throw new Error("Invalid config schema");
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);

    console.log("Firebase Applet integration initialized successfully!");
    return { auth: firebaseAuth, db: firestoreDb };
  } catch (err: any) {
    console.warn("Continuing with local persistence fallback. Remote connection idle:", err.message);
    return null;
  }
}

export async function signInWithGoogle() {
  const connection = await tryInitFirebase();
  if (!connection) return null;
  return signInWithPopup(connection.auth, provider);
}

// Global score store interface
export function getLocalScorecard(): ScorecardData {
  const local = localStorage.getItem("japanese_learning_scorecard");
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // Ignored
    }
  }
  return { scores: {} };
}

export function saveLocalScorecard(data: ScorecardData) {
  localStorage.setItem("japanese_learning_scorecard", JSON.stringify(data));
}

// Sync scores up to Firestore if authenticated
export async function syncScorecardToCloud(data: ScorecardData): Promise<boolean> {
  const connection = await tryInitFirebase();
  if (!connection) return false;

  const { db, auth } = connection;

  try {
    const user = auth.currentUser;
    
    if (user) {
      const docRef = doc(db, "artifacts", APP_ID, "users", user.uid, "scorecard", "data");
      await setDoc(docRef, { scores: data.scores }, { merge: true });
      console.log("Scorecard successfully synchronized with Firebase Cloud Storage.");
      return true;
    }
    // Return false if not authenticated, remaining in offline-first mode
    return false;
  } catch (error: any) {
    console.error("Firestore synchronization failed, remaining offline-first. Details:", error.message);
    return false;
  }
}

// Fetch score from Firebase if authenticated, and merge with local values
export async function fetchScorecardFromCloud(): Promise<ScorecardData | null> {
  const connection = await tryInitFirebase();
  if (!connection) return null;

  const { db, auth } = connection;

  try {
    const user = auth.currentUser;

    if (user) {
      const docRef = doc(db, "artifacts", APP_ID, "users", user.uid, "scorecard", "data");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const raw = snap.data() as ScorecardData;
        if (raw && raw.scores) {
          return raw;
        }
      }
    }
    // Return null if not authenticated, letting the app continue offline-first without an error
    return null;
  } catch (error: any) {
    console.error("Failed to fetch cloud scorecard:", error.message);
    return null;
  }
}
