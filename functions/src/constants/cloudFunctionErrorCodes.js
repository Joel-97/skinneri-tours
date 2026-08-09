/**
 * ==========================================================
 * CLOUD FUNCTION ERROR CODES
 * ==========================================================
 *
 * Official Firebase Callable Function Error Codes.
 *
 * https://firebase.google.com/docs/reference/functions/firebase-functions.https.httpserror
 */

export const CLOUD_FUNCTION_ERROR_CODES = Object.freeze({

    /* ======================================================
       GENERAL
    ====================================================== */

    INTERNAL: "internal",

    UNKNOWN: "unknown",

    CANCELLED: "cancelled",

    DATA_LOSS: "data-loss",

    /* ======================================================
       AUTHENTICATION
    ====================================================== */

    UNAUTHENTICATED: "unauthenticated",

    PERMISSION_DENIED: "permission-denied",

    /* ======================================================
       VALIDATION
    ====================================================== */

    INVALID_ARGUMENT: "invalid-argument",

    FAILED_PRECONDITION: "failed-precondition",

    OUT_OF_RANGE: "out-of-range",

    /* ======================================================
       RESOURCES
    ====================================================== */

    NOT_FOUND: "not-found",

    ALREADY_EXISTS: "already-exists",

    RESOURCE_EXHAUSTED: "resource-exhausted",

    ABORTED: "aborted",

    /* ======================================================
       EXECUTION
    ====================================================== */

    DEADLINE_EXCEEDED: "deadline-exceeded",

    UNAVAILABLE: "unavailable",

    UNIMPLEMENTED: "unimplemented"

});

export default CLOUD_FUNCTION_ERROR_CODES;