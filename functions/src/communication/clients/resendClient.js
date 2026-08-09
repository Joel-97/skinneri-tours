/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import { Resend } from "resend";

/*
==========================================================
CLIENT
==========================================================
*/

let resendClient = null;

/*
==========================================================
GET RESEND CLIENT
==========================================================
*/

export function getResendClient() {

    if (

        !resendClient

    ) {

        const apiKey =

            process.env.RESEND_API_KEY;

        if (

            !apiKey

        ) {

            throw new Error(

                "Missing RESEND_API_KEY environment variable."

            );

        }

        resendClient =

            new Resend(

                apiKey

            );

    }

    return resendClient;

}