/*
==========================================================
IMPORTS
==========================================================
*/

import AUTH_ERRORS from "./authErrors";

/*
==========================================================
AUTH ERROR MESSAGES
==========================================================
*/

const AUTH_ERROR_MESSAGES = {

  /*
  ==========================================================
  LOGIN
  ==========================================================
  */

  [AUTH_ERRORS.INVALID_CREDENTIALS]:
    "auth.login.invalidCredentials",

  [AUTH_ERRORS.INVALID_EMAIL]:
    "auth.login.invalidEmail",

  [AUTH_ERRORS.USER_DISABLED]:
    "auth.login.accountDisabled",

  [AUTH_ERRORS.USER_NOT_FOUND]:
    "auth.login.invalidCredentials",

  /*
  ==========================================================
  REGISTER
  ==========================================================
  */

  [AUTH_ERRORS.EMAIL_ALREADY_IN_USE]:
    "auth.register.emailAlreadyExists",

  [AUTH_ERRORS.WEAK_PASSWORD]:
    "auth.register.weakPassword",

  /*
  ==========================================================
  GENERAL
  ==========================================================
  */

  [AUTH_ERRORS.TOO_MANY_REQUESTS]:
    "auth.messages.tooManyRequests",

  [AUTH_ERRORS.NETWORK_ERROR]:
    "auth.messages.networkError",

  [AUTH_ERRORS.REQUIRES_RECENT_LOGIN]:
    "auth.messages.requiresRecentLogin",

  [AUTH_ERRORS.SESSION_EXPIRED]:
    "auth.messages.sessionExpired",

  [AUTH_ERRORS.UNKNOWN_ERROR]:
    "auth.messages.unknownError"

};

export default AUTH_ERROR_MESSAGES;