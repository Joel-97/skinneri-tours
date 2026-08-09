/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
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

        const resend =

            getResendClient();

        const result =

            await resend.emails.send({

                from,

                to,

                subject,

                html,

                text,

                reply_to:

                    replyTo,

                attachments

            });

        console.log(

            "RESEND RESPONSE:",

            result

        );

        if (

            result.error

        ) {

            console.error(

                "RESEND ERROR:",

                result.error

            );

            return failure(

                result.error.message

            );

        }

        return success(

            result.data

        );

    }

    catch (error) {

        console.error(

            "SEND EMAIL ERROR:",

            error

        );

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}