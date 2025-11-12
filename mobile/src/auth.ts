// src/auth.ts
import { signInAnonymously } from "firebase/auth";
import { auth } from "./firebaseConfig";

let signing: Promise<string> | null = null;

export async function getUserId(): Promise<string> {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  if (!signing) {
    signing = signInAnonymously(auth).then((cred) => cred.user.uid);
  }
  return signing;
}
