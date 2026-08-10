/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    db,
    auth

} from "../firebase/admin.js";

import {

    created,
    success,
    failure

} from "../utils/serviceResult.js";

import FIRESTORE_COLLECTIONS

    from "../constants/firestoreCollections.js";

import USER_STATUS

    from "../constants/userStatus.js";

import PLATFORM_ERRORS

    from "../constants/errors/platformErrors.js";

/*
==========================================================
NORMALIZE
==========================================================
*/

function normalize(value) {

    return value

        .trim()

        .toLowerCase();

}

/*
==========================================================
GENERATE TEMPORARY PASSWORD
==========================================================
*/

function generateTemporaryPassword() {

    return (

        Math.random().toString(36).slice(-10) +

        "A1!"

    );

}

/*
==========================================================
CHECK DUPLICATE USER
==========================================================
*/

async function existsUser(email) {

    try {

        await auth.getUserByEmail(

            normalize(email)

        );

        return true;

    }

    catch (error) {

        if (

            error.code ===

            "auth/user-not-found"

        ) {

            return false;

        }

        throw error;

    }

}

/*
==========================================================
CREATE AUTH USER
==========================================================
*/

async function createAuthUser(user) {

    return await auth.createUser({

        displayName:

            user.displayName.trim(),

        email:

            normalize(user.email),

        password:

            generateTemporaryPassword()

    });

}

/*
==========================================================
BUILD USER DOCUMENT
==========================================================
*/

function buildUserDocument(
    uid,
    user
) {

    const timestamp = new Date();

    return {

        uid,

        displayName:

            user.displayName.trim(),

        email:

            normalize(user.email),

        companyId:

            user.companyId,

        role:

            user.role,

        status:

            USER_STATUS.ACTIVE,

        createdAt:

            timestamp,

        updatedAt:

            timestamp,

        approvedAt:

            timestamp,

        lastLoginAt:

            null

    };

}

/*
==========================================================
CREATE USER DOCUMENT
==========================================================
*/

async function createUserDocument(
    userDocument
) {

    await db

        .collection(

            FIRESTORE_COLLECTIONS.USERS

        )

        .doc(

            userDocument.uid

        )

        .set(

            userDocument

        );

}

/*
==========================================================
DELETE USER DOCUMENT
==========================================================
*/

async function deleteUserDocument(
    uid
) {

    await db

        .collection(

            FIRESTORE_COLLECTIONS.USERS

        )

        .doc(

            uid

        )

        .delete();

}

/*
==========================================================
CREATE USER
==========================================================
*/

export async function createUserService(
    user
) {

    let authUser = null;

    try {

        /*
        ======================================================
        DUPLICATE USER
        ======================================================
        */

        const exists = await existsUser(

            user.email

        );

        if (exists) {

            return failure(

                PLATFORM_ERRORS.USER_ALREADY_EXISTS

            );

        }

        /*
        ======================================================
        CREATE AUTH USER
        ======================================================
        */

        authUser = await createAuthUser(

            user

        );

        /*
        ======================================================
        BUILD DOCUMENT
        ======================================================
        */

        const userDocument =

            buildUserDocument(

                authUser.uid,

                user

            );

        /*
        ======================================================
        CREATE DOCUMENT
        ======================================================
        */

        await createUserDocument(

            userDocument

        );

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return created({

            id: authUser.uid

        });

    }

    catch (error) {

        /*
        ======================================================
        ROLLBACK
        ======================================================
        */

        if (authUser) {

            try {

                await auth.deleteUser(

                    authUser.uid

                );

            }

            catch (rollbackError) {

                console.error(

                    rollbackError

                );

            }

        }

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}

/*
==========================================================
DELETE USER
==========================================================
*/

export async function deleteUserService(
    uid
) {

    try {

        /*
        ======================================================
        DELETE FIRESTORE DOCUMENT
        ======================================================
        */

        await deleteUserDocument(

            uid

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

/**
 * ==========================================================
 * GET USER
 * ==========================================================
 */

export async function getUserService(
    uid
) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!uid) {

            return failure(

                PLATFORM_ERRORS.USER_NOT_FOUND

            );

        }


        /*
        ======================================================
        DOCUMENT
        ======================================================
        */

        const document =

            await db

                .collection(

                    FIRESTORE_COLLECTIONS.USERS

                )

                .doc(

                    uid

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

                PLATFORM_ERRORS.USER_NOT_FOUND

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

    catch (error) {

        console.error(

            error

        );

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}