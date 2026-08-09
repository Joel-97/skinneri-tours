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

import {

    executeAuthAction

} from "./authActionExecutors/executeAuthAction.js";

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
VALIDATE AUTH ACTION
==========================================================
*/

function validateAuthAction(

    authAction

) {

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

    return success();

}

/*
==========================================================
COMPLETE AUTH ACTION
==========================================================
*/

export async function completeAuthActionService({

    token,

    password

}) {

    try {

        /*
        ======================================================
        GET AUTH ACTION
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
        VALIDATE
        ======================================================
        */

        const validationResult =

            validateAuthAction(

                authAction

            );

        if (

            !validationResult.success

        ) {

            return validationResult;

        }

        /*
        ======================================================
        EXECUTE AUTH ACTION
        ======================================================
        */

        const executionResult =

            await executeAuthAction({

                authAction,

                password

            });

        if (

            !executionResult.success

        ) {

            return executionResult;

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success(

            executionResult.data

        );

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}