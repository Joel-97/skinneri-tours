/**
 * ==========================================================
 * ACTION HANDLER ERROR MESSAGES
 * ==========================================================
 */

const ACTION_HANDLER_ERROR_MESSAGES = Object.freeze({

  /*
  ==========================================================
  GENERAL
  ==========================================================
  */

  UNKNOWN_ERROR:
    "auth.messages.unknownError",

  NETWORK_ERROR:
    "auth.messages.networkError",

  VALIDATION_ERROR:
    "auth.messages.validationError",

  TOO_MANY_REQUESTS:
    "auth.messages.tooManyRequests",

  /*
  ==========================================================
  ACTION HANDLER
  ==========================================================
  */

  INVALID_ACTION_CODE:
    "auth.actionHandler.invalidLink",

  EXPIRED_ACTION_CODE:
    "auth.actionHandler.expiredLink",

  INVALID_OOB_CODE:
    "auth.actionHandler.invalidLink",

  INVALID_LINK:
    "auth.actionHandler.invalidLink",

  EXPIRED_LINK:
    "auth.actionHandler.expiredLink",

  UNSUPPORTED_ACTION:
    "auth.actionHandler.unsupportedAction",

  PASSWORDS_DO_NOT_MATCH:
    "auth.actionHandler.passwordsDoNotMatch",

  WEAK_PASSWORD:
    "auth.register.weakPassword"

});

export default ACTION_HANDLER_ERROR_MESSAGES;