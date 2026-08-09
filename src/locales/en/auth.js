const auth = {

  /*
  ==========================================================
  REGISTER
  ==========================================================
  */

  register: {

    title:
      "Create account",

    subtitle:
      "Request access to the Skinneri platform.",

    displayName:
      "Full name",

    email:
      "Email address",

    password:
      "Password",

    confirmPassword:
      "Confirm password",

    submit:
      "Request access",

    alreadyAccount:
      "Already have an account?",

    login:
      "Sign in",

    accessRequestCreated:
      "Your access request has been submitted successfully.",

    accessRequestAlreadyExists:
      "There is already a pending access request associated with this email address.",

    passwordsDoNotMatch:
      "Passwords do not match.",

    emailAlreadyExists:
      "An account already exists with this email address.",

    weakPassword:
      "The password is too weak.",

    approvalInformation: "Your request will be reviewed by an administrator. Once approved, you will receive an email with a link to create your password and activate your account.",

    requestSubmitted:
      "Your access request has been submitted successfully. An administrator will review it and you'll be notified once it has been processed."

  },

  /*
  ==========================================================
  LOGIN
  ==========================================================
  */

  login: {

    title:
      "Welcome",

    subtitle:
      "Sign in to access your account.",

    email:
      "Email address",

    password:
      "Password",

    submit:
      "Sign in",

    forgotPassword:
      "Forgot your password?",

    noAccount:
      "Don't have an account?",

    register:
      "Request access",

    invalidCredentials:
      "Invalid email address or password.",

    invalidEmail:
      "Please enter a valid email address.",

    accountPending:
      "Your access request is still pending approval.",

    accountRejected:
      "Your access request has been rejected.",

    accountDisabled:
      "Your account has been disabled."

  },

  /*
  ==========================================================
  PENDING APPROVAL
  ==========================================================
  */

  pending: {

    title:
      "Request Pending",

    subtitle:
      "Your access request is currently under review. You will be able to sign in once an administrator approves your account.",

    refresh:
      "Refresh",

    logout:
      "Sign out"

  },

  /*
  ==========================================================
  REJECTED
  ==========================================================
  */

  rejected: {

    title:
      "Request Rejected",

    subtitle:
      "Your access request has been rejected. Please contact your administrator for more information.",

    logout:
      "Sign out"

  },

    /*
  ==========================================================
  ACTION HANDLER
  ==========================================================
  */

  actionHandler: {

    /*
    ========================================================
    GENERAL
    ========================================================
    */

    title:
      "Welcome to Skinneri",

    subtitle:
      "Create a password to activate your account.",

    loading:
      "Validating invitation...",

    /*
    ========================================================
    RESET PASSWORD
    ========================================================
    */

    password:
      "Password",

    confirmPassword:
      "Confirm password",

    createPassword:
      "Create password",

    passwordsDoNotMatch:
      "Passwords do not match.",

    passwordCreated:
      "Your password has been created successfully.",

    /*
    ========================================================
    SUCCESS
    ========================================================
    */

    successTitle:
      "Account activated",

    successSubtitle:
      "Your account has been activated successfully.",

    redirecting:
      "You will be redirected to the sign in page shortly.",

    login:
      "Go to sign in",

    /*
    ========================================================
    ERRORS
    ========================================================
    */

    invalidLink:
      "This link is invalid.",

    expiredLink:
      "This link has expired.",

    unsupportedAction:
      "The requested action is not supported.",

    genericError:
      "The operation could not be completed."

  },

  /*
  ==========================================================
  AUTH LAYOUT
  ==========================================================
  */

  layout: {

    title:
      "Skinneri",

    description:
      "Manage your business from one place",

    version:
      "Version 1.0"

  },

  /*
  ==========================================================
  MESSAGES
  ==========================================================
  */

  messages: {

    /*
    ========================================================
    GENERAL
    ========================================================
    */

    loading:
      "Submitting...",

    success:
      "Operation completed successfully.",

    unknownError:
      "An unexpected error has occurred.",

    validationError:
      "Please verify the information provided.",

    networkError:
      "Unable to connect to the server. Please try again.",

    tooManyRequests:
      "Too many attempts. Please try again later.",

    requiresRecentLogin:
      "For security reasons, please sign in again before continuing.",

    sessionExpired:
      "Your session has expired. Please sign in again."

  }

};

export default auth;