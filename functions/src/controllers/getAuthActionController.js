/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import { onCall }

    from "firebase-functions/v2/https";

import {

    getAuthActionService

} from "../services/getAuthActionService.js";

import {

    getAuthActionValidator

} from "../validators/getAuthActionValidator.js";

import {

    withCloudFunction

} from "../utils/cloudFunctionResponse.js";

import {

    handleServiceResult

} from "../utils/handleServiceResult.js";

/*
==========================================================
GET AUTH ACTION
==========================================================
*/

export const getAuthAction = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            getAuthActionValidator(

                request.data

            );

            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const result =

                await getAuthActionService(

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