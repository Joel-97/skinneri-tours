const auth = {

  /*
  ==========================================================
  REGISTER
  ==========================================================
  */

  register: {

    title:
      "Crear cuenta",

    subtitle:
      "Solicita acceso a la plataforma Skinneri.",

    displayName:
      "Nombre completo",

    email:
      "Correo electrónico",

    password:
      "Contraseña",

    confirmPassword:
      "Confirmar contraseña",

    submit:
      "Solicitar acceso",

    alreadyAccount:
      "¿Ya tienes una cuenta?",

    login:
      "Iniciar sesión",

    accessRequestCreated:
      "Su solicitud de acceso ha sido enviada correctamente.",

    accessRequestAlreadyExists:
      "Ya existe una solicitud de acceso pendiente con este correo electrónico.",

    passwordsDoNotMatch:
      "Las contraseñas no coinciden.",

    emailAlreadyExists:
      "Ya existe una cuenta registrada con este correo electrónico.",

    weakPassword:
      "La contraseña es demasiado débil.",

    approvalInformation: 
      "Tu solicitud será revisada por un administrador. Una vez aprobada, recibirás un correo electrónico con un enlace para crear tu contraseña y activar tu cuenta.",

    requestSubmitted:
      "Tu solicitud de acceso fue enviada correctamente. Un administrador la revisará y recibirás una notificación cuando sea procesada."

  },

  /*
  ==========================================================
  LOGIN
  ==========================================================
  */

  login: {

    title:
      "Bienvenido",

    subtitle:
      "Inicie sesión para acceder a su cuenta.",

    email:
      "Correo electrónico",

    password:
      "Contraseña",

    submit:
      "Iniciar sesión",

    forgotPassword:
      "¿Olvidó su contraseña?",

    noAccount:
      "¿No tiene una cuenta?",

    register:
      "Solicitar acceso",

    invalidCredentials:
      "Correo electrónico o contraseña incorrectos.",

    invalidEmail:
      "Ingrese un correo electrónico válido.",

    accountPending:
      "Su solicitud de acceso aún está pendiente de aprobación.",

    accountRejected:
      "Su solicitud de acceso fue rechazada.",

    accountDisabled:
      "Su cuenta ha sido deshabilitada."

  },

  /*
  ==========================================================
  PENDING APPROVAL
  ==========================================================
  */

  pending: {

    title:
      "Solicitud en revisión",

    subtitle:
      "Su solicitud de acceso está siendo revisada por un administrador. Podrá iniciar sesión una vez que su cuenta sea aprobada.",

    refresh:
      "Actualizar",

    logout:
      "Cerrar sesión"

  },

  /*
  ==========================================================
  REJECTED
  ==========================================================
  */

  rejected: {

    title:
      "Solicitud rechazada",

    subtitle:
      "Su solicitud de acceso fue rechazada. Si considera que se trata de un error, comuníquese con el administrador para obtener más información.",

    logout:
      "Cerrar sesión"

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
      "Bienvenido a Skinneri",

    subtitle:
      "Cree una contraseña para activar su cuenta.",

    loading:
      "Validando invitación...",

    /*
    ========================================================
    RESET PASSWORD
    ========================================================
    */

    password:
      "Contraseña",

    confirmPassword:
      "Confirmar contraseña",

    createPassword:
      "Crear contraseña",

    passwordsDoNotMatch:
      "Las contraseñas no coinciden.",

    passwordCreated:
      "La contraseña fue creada correctamente.",

    /*
    ========================================================
    SUCCESS
    ========================================================
    */

    successTitle:
      "Cuenta activada",

    successSubtitle:
      "Su cuenta ha sido activada correctamente.",

    redirecting:
      "Será redirigido al inicio de sesión en unos segundos.",

    login:
      "Ir al inicio de sesión",

    /*
    ========================================================
    ERRORS
    ========================================================
    */

    invalidLink:
      "Este enlace no es válido.",

    expiredLink:
      "Este enlace ha expirado.",

    unsupportedAction:
      "La acción solicitada no es compatible.",

    genericError:
      "No fue posible completar la operación."

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
      "Gestione su empresa desde un solo lugar",

    version:
      "Versión 1.2"

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
      "Enviando...",

    success:
      "Operación realizada correctamente.",

    unknownError:
      "Ha ocurrido un error inesperado.",

    validationError:
      "Verifique la información ingresada.",

    networkError:
      "No fue posible conectarse con el servidor. Inténtelo nuevamente.",

    tooManyRequests:
      "Se han realizado demasiados intentos. Inténtelo nuevamente más tarde.",

    requiresRecentLogin:
      "Por motivos de seguridad, vuelva a iniciar sesión para continuar.",

    sessionExpired:
      "Su sesión ha expirado. Inicie sesión nuevamente."

  }

};

export default auth;