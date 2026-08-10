/*
==========================================================
AUTH ACTION TYPES
==========================================================
*/

const AUTH_ACTION_TYPES = Object.freeze({

    /*
    ======================================================
    ACCOUNT
    ======================================================
    */

    CREATE_PASSWORD:

        "CREATE_PASSWORD",

    RESET_PASSWORD:

        "RESET_PASSWORD",

    VERIFY_EMAIL:

        "VERIFY_EMAIL",

    CHANGE_EMAIL:

        "CHANGE_EMAIL",

    /*
    ======================================================
    ACCESS
    ======================================================
    */

    INVITATION:

        "INVITATION",

    /*
    ======================================================
    SECURITY
    ======================================================
    */

    MFA_SETUP:

        "MFA_SETUP"

});

export default AUTH_ACTION_TYPES;