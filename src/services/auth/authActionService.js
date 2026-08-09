/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    httpsCallable

} from "firebase/functions";

import {

    functions

} from "../../firebase";

import {

    failure

} from "../../utils/serviceResult";

/*
==========================================================
GET AUTH ACTION
==========================================================
*/

export async function getAuthActionService({

    token

}) {

    try {

        /*
        ======================================================
        CLOUD FUNCTION
        ======================================================
        */

        const callable =

            httpsCallable(

                functions,

                "getAuthAction"

            );

        /*
        ======================================================
        EXECUTE
        ======================================================
        */

        const response =

            await callable({

                token

            });

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return response.data;

    }

    catch (error) {

        console.error(error);

        return failure(

            error.message

        );

    }

}

/*
==========================================================
COMPLETE AUTH ACTION
==========================================================
*/

export async function completeAuthActionService({

    token,

    password

}) {

    try {

        /*
        ======================================================
        CLOUD FUNCTION
        ======================================================
        */

        const callable =

            httpsCallable(

                functions,

                "completeAuthAction"

            );

        /*
        ======================================================
        EXECUTE
        ======================================================
        */

        const response =

            await callable({

                token,

                password

            });

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return response.data;

    }

    catch (error) {

        console.error(error);

        return failure(

            error.message

        );

    }

}