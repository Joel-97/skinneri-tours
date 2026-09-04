/**
 * ==========================================================
 * COMMUNICATION SERVICE
 * ==========================================================
 */

/*
==========================================================
IMPORTS
==========================================================
*/

import {

    getResendClient

} from "../clients/resendClient.js";

import {

    success,
    failure

} from "../../utils/serviceResult.js";

import PLATFORM_ERRORS

    from "../../constants/errors/platformErrors.js";


/*
==========================================================
SEND EMAIL
==========================================================
*/

export async function sendEmail({

    from,

    to,

    subject,

    html,

    text = "",

    replyTo = null,

    attachments = []

}) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!from) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "EMAIL_FROM_REQUIRED"

            );

        }


        if (!to) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "EMAIL_TO_REQUIRED"

            );

        }


        if (!subject) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "EMAIL_SUBJECT_REQUIRED"

            );

        }


        if (!html) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "EMAIL_HTML_REQUIRED"

            );

        }


        /*
        ======================================================
        RESEND CLIENT
        ======================================================
        */

        const resend =

            getResendClient();


        /*
        ======================================================
        EMAIL PAYLOAD
        ======================================================

        Build the payload explicitly so that optional values
        are only sent when they actually exist.
        ======================================================
        */

        const emailPayload = {

            from,

            to,

            subject,

            html,

            text,

            attachments

        };


        /*
        ======================================================
        REPLY TO
        ======================================================
        */

        if (replyTo) {

            emailPayload.replyTo =

                replyTo;

        }


        /*
        ======================================================
        SEND THROUGH RESEND
        ======================================================
        */

        const result =

            await resend.emails.send(

                emailPayload

            );


        /*
        ======================================================
        LOG RESEND RESPONSE
        ======================================================
        */

        console.log(

            "RESEND RESPONSE:",

            result

        );


        /*
        ======================================================
        RESEND ERROR
        ======================================================
        */

        if (

            result?.error

        ) {

            console.error(

                "RESEND ERROR:",

                result.error

            );


            /*
            --------------------------------------------------
            IMPORTANT

            Keep the Firebase/platform error code valid,
            while preserving the actual Resend message.
            --------------------------------------------------
            */

            return failure(

                PLATFORM_ERRORS.INTERNAL_ERROR,

                result.error.message
                    ||
                    "RESEND_EMAIL_SEND_FAILED"

            );

        }


        /*
        ======================================================
        SUCCESS
        ======================================================
        */

        return success(

            result?.data || null

        );

    }

    catch (error) {

        /*
        ======================================================
        LOG COMPLETE ERROR
        ======================================================
        */

        console.error(

            "SEND EMAIL ERROR:",

            error

        );


        /*
        ======================================================
        LOG ERROR DETAILS
        ======================================================
        */

        console.error(

            "SEND EMAIL ERROR MESSAGE:",

            error?.message

        );


        console.error(

            "SEND EMAIL ERROR CODE:",

            error?.code

        );


        /*
        ======================================================
        RETURN CONTROLLED FAILURE
        ======================================================

        Do not discard the original error message.

        The code remains a valid platform error while the
        message allows the controller/logs to expose what
        actually failed.
        ======================================================
        */

        return failure(

            PLATFORM_ERRORS.INTERNAL_ERROR,

            error?.message
                ||
                "RESEND_EMAIL_SEND_FAILED"

        );

    }

}