/*
==========================================================
IMPORTS
==========================================================
*/

import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../../firebase";

import {
  success,
  failure,
} from "../../utils/serviceResult";

import mapFirebaseAuthError from "../../utils/mapFirebaseAuthError";

/*
==========================================================
SIGN IN
==========================================================
*/

export async function signIn(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return success(credential.user);
  } catch (error) {
    return failure(
      mapFirebaseAuthError(error.code)
    );
  }
}

/*
==========================================================
SIGN OUT
==========================================================
*/

export async function signOutUser() {
  try {
    await signOut(auth);

    return success();
  } catch (error) {
    return failure(
      mapFirebaseAuthError(error.code)
    );
  }
}

/*
==========================================================
SEND PASSWORD RESET
==========================================================
*/

export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(
      auth,
      email
    );

    return success();
  } catch (error) {
    return failure(
      mapFirebaseAuthError(error.code)
    );
  }
}

/*
==========================================================
UPDATE PASSWORD
==========================================================
*/

export async function updateUserPassword(newPassword) {
  try {
    await updatePassword(
      auth.currentUser,
      newPassword
    );

    return success();
  } catch (error) {
    return failure(
      mapFirebaseAuthError(error.code)
    );
  }
}

/*
==========================================================
CURRENT USER
==========================================================
*/

export function getCurrentUser() {
  return auth.currentUser;
}

/*
==========================================================
AUTH STATE
==========================================================
*/

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(
    auth,
    callback
  );
}