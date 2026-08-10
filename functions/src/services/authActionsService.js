/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import crypto from "crypto";

import { db } from "../firebase/admin.js";

import {

    success,
    failure

} from "../utils/serviceResult.js";

import FIRESTORE_COLLECTIONS

    from "../constants/firestoreCollections.js";

import AUTH_ACTION_STATUS

    from "../constants/auth/authActionStatus.js";

import AUTH_ACTION_EXPIRATION

    from "../constants/auth/authActionExpiration.js";

import PLATFORM_ERRORS

    from "../constants/errors/platformErrors.js";

/*
==========================================================
GENERATE TOKEN
==========================================================
*/

function generateToken() {

    return crypto

        .randomBytes(32)

        .toString("hex");

}

/*
==========================================================
GET EXPIRATION DATE
==========================================================
*/

function getExpirationDate(

    action

) {

    const hours =

        AUTH_ACTION_EXPIRATION[action];

    const expiration =

        new Date();

    expiration.setHours(

        expiration.getHours() +

        hours

    );

    return expiration;

}

/*
==========================================================
IS EXPIRED
==========================================================
*/

function isExpired(

    expiresAt

) {

    return (

        expiresAt.toDate

            ? expiresAt.toDate()

            : expiresAt

    ) < new Date();

}

/*
==========================================================
BUILD DOCUMENT
==========================================================
*/

function buildAuthActionDocument({

    action,

    userId,

    email,

    metadata = {}

}) {

    const timestamp =

        new Date();

    return {

        token:

            generateToken(),

        action,

        userId,

        email:

            email
                .trim()
                .toLowerCase(),

        status:

            AUTH_ACTION_STATUS.PENDING,

        metadata,

        createdAt:

            timestamp,

        updatedAt:

            timestamp,

        expiresAt:

            getExpirationDate(

                action

            ),

        usedAt:

            null

    };

}

/*
==========================================================
CREATE AUTH ACTION
==========================================================
*/

export async function createAuthActionService({

    action,

    userId,

    email,

    metadata = {}

}) {

    try {

        const document =

            buildAuthActionDocument({

                action,

                userId,

                email,

                metadata

            });

        const reference =

            await db

                .collection(

                    FIRESTORE_COLLECTIONS.AUTH_ACTIONS

                )

                .add(

                    document

                );

        return success({

            id:

                reference.id,

            token:

                document.token,

            expiresAt:

                document.expiresAt

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
GET AUTH ACTION BY TOKEN
==========================================================
*/

export async function getAuthActionByTokenService(

    token

) {

    try {

        const snapshot =

            await db

                .collection(

                    FIRESTORE_COLLECTIONS.AUTH_ACTIONS

                )

                .where(

                    "token",

                    "==",

                    token

                )

                .limit(1)

                .get();

        if (

            snapshot.empty

        ) {

            return failure(

                PLATFORM_ERRORS.NOT_FOUND

            );

        }

        const document =

            snapshot.docs[0];

        return success({

            id:

                document.id,

            ...document.data()

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
MARK AUTH ACTION AS USED
==========================================================
*/

async function markAuthActionAsUsed(

    documentId

) {

    await db

        .collection(

            FIRESTORE_COLLECTIONS.AUTH_ACTIONS

        )

        .doc(

            documentId

        )

        .update({

            status:

                AUTH_ACTION_STATUS.USED,

            usedAt:

                new Date(),

            updatedAt:

                new Date()

        });

}

/*
==========================================================
CAN USE AUTH ACTION
==========================================================
*/

function canUseAuthAction(

    authAction

) {

    if (

        authAction.status !==

        AUTH_ACTION_STATUS.PENDING

    ) {

        return false;

    }

    if (

        authAction.usedAt

    ) {

        return false;

    }

    if (

        isExpired(

            authAction.expiresAt

        )

    ) {

        return false;

    }

    return true;

}

/*
==========================================================
CONSUME AUTH ACTION
==========================================================
*/

export async function consumeAuthActionService(

    token

) {

    try {

        const result =

            await getAuthActionByTokenService(

                token

            );

        if (

            !result.success

        ) {

            return result;

        }

        const authAction =

            result.data;

        if (

            !canUseAuthAction(

                authAction

            )

        ) {

            return failure(

                PLATFORM_ERRORS.INVALID_ACTION

            );

        }

        await markAuthActionAsUsed(

            authAction.id

        );

        return success(

            authAction

        );

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}