import AUTH_ERRORS from "../constants/errors/authErrors";

/*
==========================================================
MAP FIREBASE AUTH ERROR
==========================================================
*/

export default function mapFirebaseAuthError(errorCode) {

  switch (errorCode) {

    case "auth/invalid-credential":
      return AUTH_ERRORS.INVALID_CREDENTIALS;

    case "auth/invalid-email":
      return AUTH_ERRORS.INVALID_EMAIL;

    case "auth/user-disabled":
      return AUTH_ERRORS.USER_DISABLED;

    case "auth/user-not-found":
      return AUTH_ERRORS.USER_NOT_FOUND;

    case "auth/email-already-in-use":
      return AUTH_ERRORS.EMAIL_ALREADY_IN_USE;

    case "auth/weak-password":
      return AUTH_ERRORS.WEAK_PASSWORD;

    case "auth/too-many-requests":
      return AUTH_ERRORS.TOO_MANY_REQUESTS;

    case "auth/network-request-failed":
      return AUTH_ERRORS.NETWORK_ERROR;

    case "auth/requires-recent-login":
      return AUTH_ERRORS.REQUIRES_RECENT_LOGIN;

    default:
      return AUTH_ERRORS.UNKNOWN_ERROR;

  }

}