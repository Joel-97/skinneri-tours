/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import AUTH_ACTION_TYPES

    from "../../constants/auth/authActionTypes.js";

import {

    executeCreatePasswordAction

} from "./createPasswordAction.js";

import PLATFORM_ERRORS

    from "../../constants/errors/platformErrors.js";

import {

    success,
    failure

} from "../../utils/serviceResult.js";

/*
==========================================================
EXECUTE AUTH ACTION
==========================================================
*/

export async function executeAuthAction({

    authAction,

    password

}) {

    switch (

        authAction.action

    ) {

        /*
        ======================================================
        CREATE PASSWORD
        ======================================================
        */

        case AUTH_ACTION_TYPES.CREATE_PASSWORD:

            return await executeCreatePasswordAction({

                authAction,

                password

            });

        /*
        ======================================================
        DEFAULT
        ======================================================
        */

        default:

            return failure(

                PLATFORM_ERRORS.INVALID_ACTION

            );

    }

}