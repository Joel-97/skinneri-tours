/**
 * ==========================================================
 * PLATFORM ERRORS
 * ==========================================================
 */

export const PLATFORM_ERRORS = Object.freeze({

    /*
    =======================================================
    GENERAL
    =======================================================
    */

    UNKNOWN_ERROR:
        "UNKNOWN_ERROR",

    INTERNAL_ERROR:
        "INTERNAL_ERROR",

    VALIDATION_ERROR:
        "VALIDATION_ERROR",

    PERMISSION_DENIED:
        "PERMISSION_DENIED",

    /*
    =======================================================
    COMPANY
    =======================================================
    */

    COMPANY_ALREADY_EXISTS:
        "COMPANY_ALREADY_EXISTS",

    /*
    =======================================================
    USER
    =======================================================
    */

    USER_ALREADY_EXISTS:
        "USER_ALREADY_EXISTS",

    /*
    =======================================================
    INTEGRATION
    =======================================================
    */

    INTEGRATION_ALREADY_EXISTS:
        "INTEGRATION_ALREADY_EXISTS",

    API_KEY_REQUIRED:
        "API_KEY_REQUIRED",

    INVALID_API_KEY:
        "INVALID_API_KEY",

    /*
    =======================================================
    TRANSPORTATION
    =======================================================
    */

    SERVICE_TYPE_NOT_FOUND:
        "SERVICE_TYPE_NOT_FOUND",

    LOCATION_NOT_FOUND:
        "LOCATION_NOT_FOUND"

});

export default PLATFORM_ERRORS;