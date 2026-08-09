/*
==========================================================
IMPORTS
==========================================================
*/

import {

    HttpsError

} from "firebase-functions/v2/https";

/*
==========================================================
REJECT ACCESS REQUEST VALIDATOR
==========================================================
*/

export function rejectAccessRequestValidator(

    data = {}

) {

    /*
    ======================================================
    REQUEST ID
    ======================================================
    */

    if (

        !data.requestId ||

        typeof data.requestId !== "string"

    ) {

        throw new HttpsError(

            "invalid-argument",

            "requestId is required."

        );

    }

}