/*
==========================================================
IMPORTS
==========================================================
*/

import { HttpsError } from "firebase-functions/v2/https";

/*
==========================================================
APPROVE ACCESS REQUEST VALIDATOR
==========================================================
*/

export function approveAccessRequestValidator(data = {}) {

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

    /*
    ======================================================
    CREATE COMPANY
    ======================================================
    */

    if (

        typeof data.createCompany !== "boolean"

    ) {

        throw new HttpsError(

            "invalid-argument",

            "createCompany is required."

        );

    }

    /*
    ======================================================
    COMPANY
    ======================================================
    */

    if (
        data.createCompany === true
    ) {

        if (

            !data.companyName ||

            typeof data.companyName !== "string"

        ) {

            throw new HttpsError(

                "invalid-argument",

                "companyName is required."

            );

        }

        if (

            !Array.isArray(

                data.enabledModules

            )

        ) {

            throw new HttpsError(

                "invalid-argument",

                "enabledModules is required."

            );

        }

    }

    else {

        if (

            !data.companyId ||

            typeof data.companyId !== "string"

        ) {

            throw new HttpsError(

                "invalid-argument",

                "companyId is required."

            );

        }

    }

    /*
    ======================================================
    ROLE
    ======================================================
    */

    if (

        !data.role ||

        typeof data.role !== "string"

    ) {

        throw new HttpsError(

            "invalid-argument",

            "role is required."

        );

    }

}