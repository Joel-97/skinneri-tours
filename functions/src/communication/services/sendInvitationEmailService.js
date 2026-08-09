/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    success,
    failure

} from "../../utils/serviceResult.js";

import {

    createAuthActionService

} from "../../services/authActionsService.js";

import AUTH_ACTION_TYPES

    from "../../constants/auth/authActionTypes.js";

import {

    sendEmail

} from "./communicationService.js";

import {

    buildInvitationTemplateES

} from "../template/skinneriTemplates.js";

import SKINNERI_BRANDING

    from "../constants/skinneriBranding.js";

/*
==========================================================
BUILD INVITATION URL
==========================================================
*/

function buildInvitationUrl(

    token

) {

    const url =

        new URL(

            "/auth/action",

            SKINNERI_BRANDING.website

        );

    url.searchParams.set(

        "token",

        token

    );

    return url.toString();

}

/*
==========================================================
SEND INVITATION EMAIL
==========================================================
*/

export async function sendInvitationEmailService({

    userId,

    email,

    companyName

}) {

    try {

        /*
        ======================================================
        CREATE AUTH ACTION
        ======================================================
        */

        const authActionResult =

            await createAuthActionService({

                action:

                    AUTH_ACTION_TYPES.CREATE_PASSWORD,

                userId,

                email,

                metadata: {

                    companyName

                }

            });

        if (

            !authActionResult.success

        ) {

            return authActionResult;

        }

        /*
        ======================================================
        INVITATION URL
        ======================================================
        */

        const invitationLink =

            buildInvitationUrl(

                authActionResult.data.token

            );

        /*
        ======================================================
        TEMPLATE
        ======================================================
        */

        const template =

            buildInvitationTemplateES({

                companyName,

                invitationLink

            });

        /*
        ======================================================
        SEND EMAIL
        ======================================================
        */

        const emailResult =

            await sendEmail({

                from:

                    `Skinneri <${SKINNERI_BRANDING.emails.noReply}>`,

                to:

                    email,

                subject:

                    template.subject,

                html:

                    template.html,

                text:

                    template.text,

                replyTo:

                    SKINNERI_BRANDING.emails.support

            });

        if (

            !emailResult.success

        ) {

            return emailResult;

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success({

            emailId:

                emailResult.data?.id ?? null,

            authActionId:

                authActionResult.data.id,

            token:

                authActionResult.data.token,

            invitationLink

        });

    }

    catch (error) {

        console.error(error);

        return failure(

            error.message

        );

    }

}