/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    callCloudFunction

} from "../cloud/cloudFunctionService";

/*
==========================================================
CREATE ACCESS REQUEST
==========================================================
*/

export async function createAccessRequestCloud(

    request

) {

    return await callCloudFunction(

        "createAccessRequest",

        request

    );

}