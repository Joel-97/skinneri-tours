/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    verifyPasswordResetCode,
    confirmPasswordReset

} from "firebase/auth";

import {

    auth

} from "../../firebase";

import {

    success,
    failure

} from "../../utils/serviceResult";

/*
==========================================================
ERRORS
==========================================================
*/

const FIREBASE_ERRORS = Object.freeze({

    "auth/expired-action-code":

        "EXPIRED_ACTION_CODE",

    "auth/invalid-action-code":

        "INVALID_ACTION_CODE",

    "auth/invalid-oob-code":

        "INVALID_ACTION_CODE",

    "auth/user-disabled":

        "ACCOUNT_DISABLED",

    "auth/user-not-found":

        "USER_NOT_FOUND",

    "auth/weak-password":

        "WEAK_PASSWORD"

});

/*
==========================================================
MAP ERROR
==========================================================
*/

function mapFirebaseError(error) {

    return (

        FIREBASE_ERRORS[

            error.code

        ] ||

        "UNKNOWN_ERROR"

    );

}

/*
==========================================================
VERIFY PASSWORD RESET CODE
==========================================================
*/

export async function verifyActionCodeService(

    oobCode

) {

    try {

        const email =

            await verifyPasswordResetCode(

                auth,

                oobCode

            );

        return success({

            email

        });

    }

    catch (error) {

        console.error(error);

        return failure(

            mapFirebaseError(

                error

            )

        );

    }

}

/*
==========================================================
CONFIRM PASSWORD RESET
==========================================================
*/

export async function confirmPasswordResetService({

    oobCode,

    password

}) {

    try {

        await confirmPasswordReset(

            auth,

            oobCode,

            password

        );

        return success();

    }

    catch (error) {

        return failure(

            mapFirebaseError(

                error

            )

        );

    }

}