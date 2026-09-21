/**
 * ==========================================================
 * SERVICE RESULT
 * ==========================================================
 */

import CLOUD_FUNCTION_ERROR_CODES
    from "../constants/cloudFunctionErrorCodes.js";


/*
==========================================================
SUCCESS
==========================================================
*/

export function success(

    data = null

) {

    return {

        success: true,

        created: false,

        data,

        error: null,

        code: null

    };

}


/*
==========================================================
CREATED
==========================================================
*/

export function created(

    data = null

) {

    return {

        success: true,

        created: true,

        data,

        error: null,

        code: null

    };

}


/*
==========================================================
FAILURE
==========================================================
*/

export function failure(

    code =
        CLOUD_FUNCTION_ERROR_CODES.FAILED_PRECONDITION,

    error = null

) {

    /*
    ======================================================
    ERROR MESSAGE
    ======================================================

    If a specific error message/code is provided, use it.

    Otherwise, use the main error code as the error value.

    Example:

        failure(
            "INVALID_API_KEY"
        )

    becomes:

        error: "INVALID_API_KEY"
        code:  "INVALID_API_KEY"

    This keeps service results consistent and prevents
    consumers from converting a known business error into
    UNKNOWN_ERROR.
    ======================================================
    */

    const resolvedError =
        error ||
        code;


    return {

        success: false,

        created: false,

        data: null,

        error:
            resolvedError,

        code:
            code

    };

}