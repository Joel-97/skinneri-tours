/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    setUserPasswordService

} from "../authService.js";

import {

    consumeAuthActionService

} from "../authActionsService.js";

import {

    success,
    failure

} from "../../utils/serviceResult.js";

/*
==========================================================
EXECUTE CREATE PASSWORD ACTION
==========================================================
*/

export async function executeCreatePasswordAction({

    authAction,

    password

}) {

    try {

        /*
        ======================================================
        SET PASSWORD
        ======================================================
        */

        const passwordResult =

            await setUserPasswordService(

                authAction.userId,

                password

            );

        if (

            !passwordResult.success

        ) {

            return passwordResult;

        }

        /*
        ======================================================
        CONSUME AUTH ACTION
        ======================================================
        */

        const consumeResult =

            await consumeAuthActionService(

                authAction.token

            );

        if (

            !consumeResult.success

        ) {

            return consumeResult;

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success({

            userId:

                authAction.userId,

            email:

                authAction.email

        });

    }

    catch (error) {

        console.error(error);

        return failure(

            error.message

        );

    }

}