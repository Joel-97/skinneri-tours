/**
 * ==========================================================
 * HANDLE SERVICE RESULT
 * ==========================================================
 */

import { HttpsError } from "firebase-functions/v2/https";

import CLOUD_FUNCTION_ERROR_CODES from "../constants/cloudFunctionErrorCodes.js";

import CLOUD_FUNCTION_ERROR_MAPPER from "./mappers/cloudFunctionErrorMapper.js";

/*
==========================================================
HANDLE SERVICE RESULT
==========================================================
*/

export function handleServiceResult(result) {

    if (result.success) {

        return result;

    }

    const code =

        result.code

        ||

        CLOUD_FUNCTION_ERROR_MAPPER[result.error]

        ||

        CLOUD_FUNCTION_ERROR_CODES.INTERNAL;

    throw new HttpsError(

        code,

        result.error

    );

}