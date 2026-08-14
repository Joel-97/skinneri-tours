/**
 * ==========================================================
 * SEND RESERVATION EMAIL SERVICE
 * ==========================================================
 */

import {
    db
} from "../../firebase/admin.js";

import {
    success,
    failure
} from "../../utils/serviceResult.js";

import {
    getUserService
} from "../../services/userService.js";

import {
    getCompanyService
} from "../../services/companyService.js";

import {
    sendEmail
} from "./communicationService.js";

import {
    buildReservationConfirmationTemplate
} from "../template/companyTemplates.js";

import SKINNERI_BRANDING
from "../constants/skinneriBranding.js";

import FIRESTORE_COLLECTIONS
from "../../constants/firestoreCollections.js";

import PLATFORM_ERRORS
from "../../constants/errors/platformErrors.js";


/**
 * ==========================================================
 * GET TRANSPORTATION RESERVATION
 * ==========================================================
 */

async function getTransportationReservation(
    companyId,
    reservationId
) {

    const document =

        await db

            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )

            .doc(
                companyId
            )

            .collection(
                FIRESTORE_COLLECTIONS.TRANSPORTATION
            )

            .doc(
                reservationId
            )

            .get();


    /*
    ======================================================
    NOT FOUND
    ======================================================
    */

    if (

        !document.exists

    ) {

        return failure(

            PLATFORM_ERRORS.NOT_FOUND

        );

    }


    /*
    ======================================================
    RESULT
    ======================================================
    */

    return success({

        id:

            document.id,

        ...document.data()

    });

}


/**
 * ==========================================================
 * RESOLVE SENDING MODE
 * ==========================================================
 *
 * Backward compatibility:
 *
 * - If sendingMode exists, use it.
 * - If not, a verified domain is treated as custom_domain.
 * - Otherwise, use platform.
 *
 * ==========================================================
 */

function resolveSendingMode(
    emailSettings
) {

    /*
    ======================================================
    EXPLICIT MODE
    ======================================================
    */

    if (

        emailSettings?.sendingMode ===
        "custom_domain"

    ) {

        return "custom_domain";

    }


    if (

        emailSettings?.sendingMode ===
        "platform"

    ) {

        return "platform";

    }


    /*
    ======================================================
    LEGACY CONFIGURATION
    ======================================================
    */

    if (

        emailSettings?.domainStatus ===
        "verified"

    ) {

        return "custom_domain";

    }


    /*
    ======================================================
    DEFAULT
    ======================================================
    */

    return "platform";

}


/**
 * ==========================================================
 * BUILD CUSTOM DOMAIN SENDER
 * ==========================================================
 */

function buildCustomDomainSender(
    emailSettings
) {

    if (

        !emailSettings ||

        !emailSettings.fromName ||

        !emailSettings.fromEmail

    ) {

        return null;

    }


    return (

        `${emailSettings.fromName} ` +

        `<${emailSettings.fromEmail}>`

    );

}


/**
 * ==========================================================
 * BUILD PLATFORM SENDER
 * ==========================================================
 *
 * The email is sent through Skinneri's verified sender.
 *
 * The company's email is used as Reply-To so that replies
 * from the customer reach the company directly.
 *
 * ==========================================================
 */

function buildPlatformSender(
    emailSettings
) {

    const platformEmail =

        SKINNERI_BRANDING
            ?.emails
            ?.noReply;


    if (

        !platformEmail ||

        !emailSettings?.fromName

    ) {

        return null;

    }


    return (

        `${emailSettings.fromName} ` +

        `via Skinneri ` +

        `<${platformEmail}>`

    );

}


/**
 * ==========================================================
 * BUILD SENDER
 * ==========================================================
 */

function buildSender(
    emailSettings,
    sendingMode
) {

    if (

        sendingMode ===
        "custom_domain"

    ) {

        return buildCustomDomainSender(

            emailSettings

        );

    }


    return buildPlatformSender(

        emailSettings

    );

}


/**
 * ==========================================================
 * BUILD REPLY TO
 * ==========================================================
 */

function buildReplyTo(
    emailSettings
) {

    return (

        emailSettings?.replyTo ||

        emailSettings?.fromEmail ||

        null

    );

}


/**
 * ==========================================================
 * SEND RESERVATION EMAIL
 * ==========================================================
 */

export async function sendReservationEmailService(

    data,

    userId

) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        const reservationId =

            data?.reservationId;

        const language =

            data?.language || "en";


        if (!reservationId) {

            return failure(

                "reservation_id_required"

            );

        }


        if (

            !["en", "es"].includes(

                language

            )

        ) {

            return failure(

                "unsupported_language"

            );

        }


        if (!userId) {

            return failure(

                PLATFORM_ERRORS.USER_NOT_FOUND

            );

        }


        /*
        ======================================================
        USER
        ======================================================
        */

        const userResult =

            await getUserService(

                userId

            );


        if (

            !userResult.success

        ) {

            return userResult;

        }


        const user =

            userResult.data;


        /*
        ======================================================
        COMPANY ID
        ======================================================
        */

        const companyId =

            user.companyId;


        if (!companyId) {

            return failure(

                "company_required"

            );

        }


        /*
        ======================================================
        COMPANY
        ======================================================
        */

        const companyResult =

            await getCompanyService(

                companyId

            );


        if (

            !companyResult.success

        ) {

            return companyResult;

        }


        const company =

            companyResult.data;


        /*
        ======================================================
        EMAIL SETTINGS
        ======================================================
        */

        const emailSettings =

            company.emailSettings;


        if (!emailSettings) {

            return failure(

                "email_settings_not_configured"

            );

        }


        /*
        ======================================================
        EMAIL ENABLED
        ======================================================
        */

        if (

            emailSettings.enabled === false

        ) {

            return failure(

                "email_sending_disabled"

            );

        }


        /*
        ======================================================
        SENDING MODE
        ======================================================
        */

        const sendingMode =

            resolveSendingMode(

                emailSettings

            );


        /*
        ======================================================
        CUSTOM DOMAIN VALIDATION
        ======================================================
        */

        if (

            sendingMode ===
            "custom_domain"

        ) {

            if (

                emailSettings.domainStatus !==
                "verified"

            ) {

                return failure(

                    "email_domain_not_verified"

                );

            }

        }


        /*
        ======================================================
        SENDER
        ======================================================
        */

        const from =

            buildSender(

                emailSettings,

                sendingMode

            );


        if (!from) {

            return failure(

                "email_sender_not_configured"

            );

        }


        /*
        ======================================================
        REPLY TO
        ======================================================
        */

        const replyTo =

            buildReplyTo(

                emailSettings

            );


        if (!replyTo) {

            return failure(

                "email_reply_to_not_configured"

            );

        }


        /*
        ======================================================
        RESERVATION
        ======================================================
        */

        const reservationResult =

            await getTransportationReservation(

                companyId,

                reservationId

            );


        if (

            !reservationResult.success

        ) {

            return reservationResult;

        }


        const reservation =

            reservationResult.data;


        /*
        ======================================================
        CLIENT EMAIL
        ======================================================
        */

        if (

            !reservation.clientEmail

        ) {

            return failure(

                "reservation_client_email_required"

            );

        }


        /*
        ======================================================
        TEMPLATE
        ======================================================
        */

        const template =

            buildReservationConfirmationTemplate({

                company,

                reservation,

                language

            });


        /*
        ======================================================
        SEND
        ======================================================
        */

        const emailResult =

            await sendEmail({

                from,

                to:

                    reservation.clientEmail,

                subject:

                    template.subject,

                html:

                    template.html,

                text:

                    template.text,

                replyTo

            });


        /*
        ======================================================
        SEND ERROR
        ======================================================
        */

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

                emailResult.data?.id ??

                null,

            reservationId,

            recipient:

                reservation.clientEmail,

            language,

            sendingMode

        });

    }

    catch (error) {

        console.error(

            "SEND RESERVATION EMAIL ERROR:",

            error

        );

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}