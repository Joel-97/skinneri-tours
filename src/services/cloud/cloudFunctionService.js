/**
 * ==========================================================
 * CLOUD FUNCTION SERVICE
 * ==========================================================
 */

import {

    httpsCallable

} from "firebase/functions";

import functions

    from "../../firebase/functions";

/*
==========================================================
CALL CLOUD FUNCTION
==========================================================
*/

export async function callCloudFunction(

    functionName,

    data = {}

) {

    try {

        const callable = httpsCallable(

            functions,

            functionName

        );

        const result = await callable(

            data

        );

        return result.data;

    }

    catch (error) {

        console.error(

            `[Cloud Function] ${functionName}`,

            error

        );

        throw error;

    }

}