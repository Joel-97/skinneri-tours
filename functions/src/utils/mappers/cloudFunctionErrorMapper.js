/**
 * ==========================================================
 * CLOUD FUNCTION ERROR MAPPER
 * ==========================================================
 */

import CLOUD_FUNCTION_ERROR_CODES
    from "../../constants/cloudFunctionErrorCodes.js";

import PLATFORM_ERRORS
    from "../../constants/errors/platformErrors.js";

import AUTH_ERRORS
    from "../../constants/errors/authErrors.js";

import ACCESS_REQUEST_ERRORS
    from "../../constants/errors/accessRequestErrors.js";


const CLOUD_FUNCTION_ERROR_MAPPER = Object.freeze({

    /*
    ======================================================
    PLATFORM
    ======================================================
    */

    [PLATFORM_ERRORS.UNKNOWN_ERROR]:
        CLOUD_FUNCTION_ERROR_CODES.INTERNAL,

    [PLATFORM_ERRORS.INTERNAL_ERROR]:
        CLOUD_FUNCTION_ERROR_CODES.INTERNAL,

    [PLATFORM_ERRORS.VALIDATION_ERROR]:
        CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT,

    [PLATFORM_ERRORS.PERMISSION_DENIED]:
        CLOUD_FUNCTION_ERROR_CODES.PERMISSION_DENIED,

    [PLATFORM_ERRORS.COMPANY_ALREADY_EXISTS]:
        CLOUD_FUNCTION_ERROR_CODES.ALREADY_EXISTS,

    [PLATFORM_ERRORS.USER_ALREADY_EXISTS]:
        CLOUD_FUNCTION_ERROR_CODES.ALREADY_EXISTS,


    /*
    ======================================================
    INTEGRATION
    ======================================================
    */

    [PLATFORM_ERRORS.INTEGRATION_ALREADY_EXISTS]:
        CLOUD_FUNCTION_ERROR_CODES.ALREADY_EXISTS,


    /*
    ======================================================
    TRANSPORTATION API
    ======================================================
    */

    /*
    ------------------------------------------------------
    API KEY REQUIRED
    ------------------------------------------------------
    */

    [PLATFORM_ERRORS.API_KEY_REQUIRED || "API_KEY_REQUIRED"]:
        CLOUD_FUNCTION_ERROR_CODES.UNAUTHENTICATED,


    /*
    ------------------------------------------------------
    INVALID API KEY
    ------------------------------------------------------
    */

    [PLATFORM_ERRORS.INVALID_API_KEY || "INVALID_API_KEY"]:
        CLOUD_FUNCTION_ERROR_CODES.UNAUTHENTICATED,


    /*
    ------------------------------------------------------
    SERVICE TYPE NOT FOUND
    ------------------------------------------------------
    */

    [PLATFORM_ERRORS.SERVICE_TYPE_NOT_FOUND || "SERVICE_TYPE_NOT_FOUND"]:
        CLOUD_FUNCTION_ERROR_CODES.NOT_FOUND,


    /*
    ------------------------------------------------------
    LOCATION NOT FOUND
    ------------------------------------------------------
    */

    [PLATFORM_ERRORS.LOCATION_NOT_FOUND || "LOCATION_NOT_FOUND"]:
        CLOUD_FUNCTION_ERROR_CODES.NOT_FOUND,


    /*
    ------------------------------------------------------
    RESERVATION NOT FOUND
    ------------------------------------------------------
    */

    [PLATFORM_ERRORS.RESERVATION_NOT_FOUND || "RESERVATION_NOT_FOUND"]:
        CLOUD_FUNCTION_ERROR_CODES.NOT_FOUND,


    /*
    ------------------------------------------------------
    COMPANY NOT FOUND
    ------------------------------------------------------
    */

    [PLATFORM_ERRORS.COMPANY_NOT_FOUND || "COMPANY_NOT_FOUND"]:
        CLOUD_FUNCTION_ERROR_CODES.NOT_FOUND,


    /*
    ------------------------------------------------------
    RESERVATION INVALID STATE
    ------------------------------------------------------
    */

    [PLATFORM_ERRORS.RESERVATION_INVALID_STATE || "RESERVATION_INVALID_STATE"]:
        CLOUD_FUNCTION_ERROR_CODES.FAILED_PRECONDITION,


    /*
    ======================================================
    AUTH
    ======================================================
    */

    [AUTH_ERRORS.USER_NOT_FOUND]:
        CLOUD_FUNCTION_ERROR_CODES.NOT_FOUND,

    [AUTH_ERRORS.EMAIL_ALREADY_EXISTS]:
        CLOUD_FUNCTION_ERROR_CODES.ALREADY_EXISTS,

    [AUTH_ERRORS.INVALID_CREDENTIALS]:
        CLOUD_FUNCTION_ERROR_CODES.UNAUTHENTICATED,

    [AUTH_ERRORS.USER_DISABLED]:
        CLOUD_FUNCTION_ERROR_CODES.PERMISSION_DENIED,

    [AUTH_ERRORS.REQUIRES_RECENT_LOGIN]:
        CLOUD_FUNCTION_ERROR_CODES.PERMISSION_DENIED,

    [AUTH_ERRORS.UNAUTHORIZED]:
        CLOUD_FUNCTION_ERROR_CODES.PERMISSION_DENIED,


    /*
    ======================================================
    ACCESS REQUEST
    ======================================================
    */

    [ACCESS_REQUEST_ERRORS.DISPLAY_NAME_REQUIRED]:
        CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT,

    [ACCESS_REQUEST_ERRORS.EMAIL_REQUIRED]:
        CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT,

    [ACCESS_REQUEST_ERRORS.INVALID_EMAIL]:
        CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT,

    [ACCESS_REQUEST_ERRORS.INVALID_STATUS]:
        CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT,

    [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_ALREADY_EXISTS]:
        CLOUD_FUNCTION_ERROR_CODES.ALREADY_EXISTS,

    [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_NOT_FOUND]:
        CLOUD_FUNCTION_ERROR_CODES.NOT_FOUND,

    [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_ALREADY_APPROVED]:
        CLOUD_FUNCTION_ERROR_CODES.FAILED_PRECONDITION,

    [ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_ALREADY_REJECTED]:
        CLOUD_FUNCTION_ERROR_CODES.FAILED_PRECONDITION

});


export default CLOUD_FUNCTION_ERROR_MAPPER;