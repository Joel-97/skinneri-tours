/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    success,
    failure

} from "../utils/serviceResult.js";

import {

    getAuthActionByTokenService

} from "./authActionsService.js";

import AUTH_ACTION_STATUS

    from "../constants/auth/authActionStatus.js";

import PLATFORM_ERRORS

    from "../constants/errors/platformErrors.js";

/*
==========================================================
IS EXPIRED
==========================================================
*/

function isExpired(

    expiresAt

) {

    const expirationDate =

        expiresAt.toDate

            ? expiresAt.toDate()

            : expiresAt;

    return (

        expirationDate < new Date()

    );

}

/*
==========================================================
GET AUTH ACTION
==========================================================
*/

export async function getAuthActionService({

    token

}) {

    try {

        /*
        ======================================================
        GET ACTION
        ======================================================
        */

        const authActionResult =

            await getAuthActionByTokenService(

                token

            );

        if (

            !authActionResult.success

        ) {

            return authActionResult;

        }

        const authAction =

            authActionResult.data;

        /*
        ======================================================
        STATUS
        ======================================================
        */

        if (

            authAction.status !==

            AUTH_ACTION_STATUS.PENDING

        ) {

            return failure(

                PLATFORM_ERRORS.INVALID_ACTION

            );

        }

        /*
        ======================================================
        USED
        ======================================================
        */

        if (

            authAction.usedAt

        ) {

            return failure(

                PLATFORM_ERRORS.INVALID_ACTION

            );

        }

        /*
        ======================================================
        EXPIRATION
        ======================================================
        */

        if (

            isExpired(

                authAction.expiresAt

            )

        ) {

            return failure(

                PLATFORM_ERRORS.INVALID_ACTION

            );

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success({

            email:

                authAction.email,

            action:

                authAction.action

        });

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}