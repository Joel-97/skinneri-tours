/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import { onCall }

    from "firebase-functions/v2/https";

import {

    completeAuthActionService

} from "../services/completeAuthActionService.js";

import {

    completeAuthActionValidator

} from "../validators/completeAuthActionValidator.js";

import {

    withCloudFunction

} from "../utils/cloudFunctionResponse.js";

import {

    handleServiceResult

} from "../utils/handleServiceResult.js";

/*
==========================================================
COMPLETE AUTH ACTION
==========================================================
*/

export const completeAuthAction = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            completeAuthActionValidator(

                request.data

            );

            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const result =

                await completeAuthActionService(

                    request.data

                );

            /*
            ==============================================
            RESPONSE
            ==============================================
            */

            return handleServiceResult(

                result

            );

        }

    )

);