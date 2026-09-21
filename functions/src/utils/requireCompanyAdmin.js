/**
 * ==========================================================
 * REQUIRE COMPANY ADMIN
 * ==========================================================
 */

import {

    HttpsError

} from "firebase-functions/v2/https";

import {

    db

} from "../firebase/admin.js";

import FIRESTORE_COLLECTIONS

    from "../constants/firestoreCollections.js";

import { USER_ROLES } from "../constants/userRoles.js";


/*
==========================================================
REQUIRE COMPANY ADMIN
==========================================================
*/

export async function requireCompanyAdmin(

    request

) {

    /*
    ======================================================
    AUTHENTICATION
    ======================================================
    */

    if (

        !request.auth

    ) {

        throw new HttpsError(

            "unauthenticated",

            "Authentication is required."

        );

    }


    const uid =

        request.auth.uid;


    /*
    ======================================================
    GET USER
    ======================================================
    */

    const userDocument =

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
    USER NOT FOUND
    ======================================================
    */

    if (

        !userDocument.exists

    ) {

        throw new HttpsError(

            "permission-denied",

            "User profile not found."

        );

    }


    const user =

        userDocument.data();


    /*
    ======================================================
    SUPER ADMIN
    ======================================================
    */

    if (

        user.role ===

        USER_ROLES.SUPER_ADMIN

    ) {

        return {

            uid,

            role:

                user.role,

            companyId:

                null,

            isSuperAdmin:

                true

        };

    }


    /*
    ======================================================
    COMPANY ADMIN
    ======================================================
    */

    if (

        user.role !==

        USER_ROLES.ADMIN

    ) {

        throw new HttpsError(

            "permission-denied",

            "Administrator permissions are required."

        );

    }


    /*
    ======================================================
    COMPANY REQUIRED
    ======================================================
    */

    if (

        !user.companyId

    ) {

        throw new HttpsError(

            "failed-precondition",

            "User is not associated with a company."

        );

    }


    /*
    ======================================================
    RESULT
    ======================================================
    */

    return {

        uid,

        role:

            user.role,

        companyId:

            user.companyId,

        isSuperAdmin:

            false

    };

}