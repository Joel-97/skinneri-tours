/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    auth

} from "../firebase/admin.js";

import {

    success,
    failure

} from "../utils/serviceResult.js";

import PLATFORM_ERRORS

    from "../constants/errors/platformErrors.js";

/*
==========================================================
ACTION CODE SETTINGS
==========================================================
*/

const ACTION_CODE_SETTINGS = {

    url:

        process.env.APP_URL ||

        "https://skinneri.com/auth/action",

    handleCodeInApp: false

};

/*
==========================================================
DELETE AUTH USER
==========================================================
*/

export async function deleteAuthUserService(

    uid

) {

    try {

        await auth.deleteUser(

            uid

        );

        return success();

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
DELETE PLATFORM USER
==========================================================
*/

export async function deletePlatformUserService(

    uid,

    deleteUserService

) {

    try {

        /*
        ======================================================
        DELETE FIRESTORE USER
        ======================================================
        */

        const userResult =

            await deleteUserService(

                uid

            );

        if (

            !userResult.success

        ) {

            return userResult;

        }

        /*
        ======================================================
        DELETE AUTH USER
        ======================================================
        */

        const authResult =

            await deleteAuthUserService(

                uid

            );

        if (

            !authResult.success

        ) {

            return authResult;

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success();

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
DISABLE AUTH USER
==========================================================
*/

export async function disableAuthUserService(

    uid

) {

    try {

        await auth.updateUser(

            uid,

            {

                disabled: true

            }

        );

        return success();

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
ENABLE AUTH USER
==========================================================
*/

export async function enableAuthUserService(

    uid

) {

    try {

        await auth.updateUser(

            uid,

            {

                disabled: false

            }

        );

        return success();

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
GET AUTH USER
==========================================================
*/

export async function getAuthUserService(

    uid

) {

    try {

        const user = await auth.getUser(

            uid

        );

        return success(

            user

        );

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
GET AUTH USER BY EMAIL
==========================================================
*/

export async function getAuthUserByEmailService(

    email

) {

    try {

        const user = await auth.getUserByEmail(

            email.trim().toLowerCase()

        );

        return success(

            user

        );

    }

    catch (error) {

        if (

            error.code ===

            "auth/user-not-found"

        ) {

            return failure(

                PLATFORM_ERRORS.USER_NOT_FOUND

            );

        }

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
GENERATE PASSWORD RESET LINK
==========================================================
*/

export async function generatePasswordResetLinkService(

    email

) {

    try {

        const link =

            await auth.generatePasswordResetLink(

                email.trim().toLowerCase(),

                ACTION_CODE_SETTINGS

            );

        return success({

            link

        });

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
SET USER PASSWORD
==========================================================
*/

export async function setUserPasswordService(

    uid,

    password

) {

    try {

        /*
        ======================================================
        UPDATE PASSWORD
        ======================================================
        */

        await auth.updateUser(

            uid,

            {

                password

            }

        );

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success();

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}