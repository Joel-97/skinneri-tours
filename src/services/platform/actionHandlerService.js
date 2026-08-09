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

        console.log("====================================");
        console.log("VERIFY PASSWORD RESET CODE");
        console.log("====================================");
        console.log("oobCode:", oobCode);

        const email =

            await verifyPasswordResetCode(

                auth,

                oobCode

            );

        console.log("Email:", email);

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

        console.log("====================================");
        console.log("CONFIRM PASSWORD RESET");
        console.log("====================================");
        console.log("oobCode:", oobCode);

        await confirmPasswordReset(

            auth,

            oobCode,

            password

        );

        console.log("Password updated.");

        return success();

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