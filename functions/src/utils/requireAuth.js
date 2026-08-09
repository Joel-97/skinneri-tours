/**
 * ==========================================================
 * REQUIRE AUTH
 * ==========================================================
 */

import {

    HttpsError

} from "firebase-functions/v2/https";

/*
==========================================================
REQUIRE AUTH
==========================================================
*/

export function requireAuth(request) {

    if (

        !request.auth

    ) {

        throw new HttpsError(

            "unauthenticated",

            "Authentication is required."

        );

    }

    return request.auth;

}