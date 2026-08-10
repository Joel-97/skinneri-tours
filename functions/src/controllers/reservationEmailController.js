/**
 * ==========================================================
 * RESERVATION EMAIL CONTROLLER
 * ==========================================================
 */

import { onCall } from "firebase-functions/v2/https";

import {
    sendReservationEmailService
} from "../communication/services/sendReservationEmailService.js";

import {
    withCloudFunction
} from "../utils/cloudFunctionResponse.js";

import {
    handleServiceResult
} from "../utils/handleServiceResult.js";

import {
    requireAuth
} from "../utils/requireAuth.js";


/**
 * ==========================================================
 * SEND RESERVATION CONFIRMATION
 * ==========================================================
 */

export const sendReservationConfirmation = onCall(

    {
        secrets: [

            "RESEND_API_KEY"

        ]

    },

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            AUTHENTICATION
            ==============================================
            */

            const auth =

                requireAuth(

                    request

                );


            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const result =

                await sendReservationEmailService(

                    request.data,

                    auth.uid

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