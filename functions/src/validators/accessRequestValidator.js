/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import { HttpsError } from "firebase-functions/v2/https";

import ACCESS_REQUEST_STATUS

    from "../constants/accessRequestStatus.js";

/*
==========================================================
VALIDATE EMAIL
==========================================================
*/

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(

            email

        );

}

/*
==========================================================
VALIDATE ACCESS REQUEST
==========================================================
*/

export function validateAccessRequest(request = {}) {

    /*
    ==========================================================
    EMAIL
    ==========================================================
    */

    if (

        !request.email?.trim()

    ) {

        throw new HttpsError(

            "invalid-argument",

            "email is required."

        );

    }

    if (

        !validateEmail(

            request.email

        )

    ) {

        throw new HttpsError(

            "invalid-argument",

            "invalid email."

        );

    }

    /*
    ==========================================================
    DISPLAY NAME
    ==========================================================
    */

    if (

        !request.displayName?.trim()

    ) {

        throw new HttpsError(

            "invalid-argument",

            "displayName is required."

        );

    }

    /*
    ==========================================================
    STATUS
    ==========================================================
    */

    if (

        request.status &&

        !Object.values(

            ACCESS_REQUEST_STATUS

        ).includes(

            request.status

        )

    ) {

        throw new HttpsError(

            "invalid-argument",

            "invalid status."

        );

    }

}