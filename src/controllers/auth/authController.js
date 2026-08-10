/*
==========================================================
IMPORTS
==========================================================
*/

import {
  signIn,
  signOutUser,
  sendPasswordReset,
  updateUserPassword,
  getCurrentUser,
  subscribeToAuthState,
} from "../../services/auth/authService";

/*
==========================================================
LOGIN
==========================================================
*/

export async function login(email, password) {
  return await signIn(
    email,
    password
  );
}

/*
==========================================================
LOGOUT
==========================================================
*/

export async function logout() {
  return await signOutUser();
}

/*
==========================================================
PASSWORD RESET
==========================================================
*/

export async function resetPassword(email) {
  return await sendPasswordReset(
    email
  );
}

/*
==========================================================
UPDATE PASSWORD
==========================================================
*/

export async function changePassword(newPassword) {
  return await updateUserPassword(
    newPassword
  );
}

/*
==========================================================
CURRENT USER
==========================================================
*/

export function currentUser() {
  return getCurrentUser();
}

/*
==========================================================
AUTH STATE
==========================================================
*/

export function onAuthState(callback) {
  return subscribeToAuthState(
    callback
  );
}