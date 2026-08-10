/**
 * ==========================================================
 * SERVICE RESULT
 * ==========================================================
 */

import CLOUD_FUNCTION_ERROR_CODES from "../constants/cloudFunctionErrorCodes.js";

/*
==========================================================
SUCCESS
==========================================================
*/

export function success(data = null) {

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

export function created(data = null) {

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

    code = CLOUD_FUNCTION_ERROR_CODES.FAILED_PRECONDITION,

    error = null

) {

    return {

        success: false,

        created: false,

        data: null,

        error,

        code

    };

}
