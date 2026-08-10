/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    success,
    failure

} from "../utils/serviceResult.js";

import {

    getAccessRequestService,
    updateAccessRequestStatusService

} from "./accessRequestService.js";

import ACCESS_REQUEST_STATUS

    from "../constants/accessRequestStatus.js";

import ACCESS_REQUEST_ERRORS

    from "../constants/errors/accessRequestErrors.js";

import PLATFORM_ERRORS

    from "../constants/errors/platformErrors.js";

/*
==========================================================
REJECT ACCESS REQUEST
==========================================================
*/

export async function rejectAccessRequestService(

    contract,

    rejectedBy

) {

    try {

        /*
        ======================================================
        GET REQUEST
        ======================================================
        */

        const requestResult =

            await getAccessRequestService(

                contract.requestId

            );

        if (

            !requestResult.success

        ) {

            return requestResult;

        }

        const request =

            requestResult.data;

        /*
        ======================================================
        VALIDATE STATUS
        ======================================================
        */

        if (

            request.status ===

            ACCESS_REQUEST_STATUS.APPROVED

        ) {

            return failure(

                ACCESS_REQUEST_ERRORS
                    .ACCESS_REQUEST_ALREADY_APPROVED

            );

        }

        if (

            request.status ===

            ACCESS_REQUEST_STATUS.REJECTED

        ) {

            return failure(

                ACCESS_REQUEST_ERRORS
                    .ACCESS_REQUEST_ALREADY_REJECTED

            );

        }

        /*
        ======================================================
        UPDATE REQUEST
        ======================================================
        */

        const updateResult =

            await updateAccessRequestStatusService(

                contract.requestId,

                ACCESS_REQUEST_STATUS.REJECTED,

                rejectedBy

            );

        if (

            !updateResult.success

        ) {

            return updateResult;

        }

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