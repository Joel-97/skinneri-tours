/**
 * ==========================================================
 * ACCESS REQUEST CONTROLLER
 * ==========================================================
 */

import { onCall } from "firebase-functions/v2/https";

import {

    createAccessRequestService,

    getAccessRequestsService

} from "../services/accessRequestService.js";

import {

    approveAccessRequestService

} from "../services/approveAccessRequestService.js";

import {

    rejectAccessRequestService

} from "../services/rejectAccessRequestService.js";

import {

    validateAccessRequest

} from "../validators/accessRequestValidator.js";

import {

    approveAccessRequestValidator

} from "../validators/approveAccessRequestValidator.js";

import {

    rejectAccessRequestValidator

} from "../validators/rejectAccessRequestValidator.js";

import {

    withCloudFunction

} from "../utils/cloudFunctionResponse.js";

import {

    handleServiceResult

} from "../utils/handleServiceResult.js";

import {

    requireAuth

} from "../utils/requireAuth.js";

/*
==========================================================
GET ACCESS REQUESTS
==========================================================
*/

export const getAccessRequests = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            SERVICE
            ==============================================
            */

            requireAuth(request);

            const result =

                await getAccessRequestsService(

                    request.data

                );

            /*
            ==============================================
            RESPONSE
            ==============================================
            */

            return handleServiceResult(

                result

            );

        }

    )

);

/*
==========================================================
CREATE ACCESS REQUEST
==========================================================
*/

export const createAccessRequest = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            validateAccessRequest(

                request.data

            );

            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const result = await createAccessRequestService(

                request.data

            );

            /*
            ==============================================
            RESPONSE
            ==============================================
            */

            return handleServiceResult(

                result

            );

        }

    )

);

/*
==========================================================
APPROVE ACCESS REQUEST
==========================================================
*/

export const approveAccessRequest = onCall(

    {

        secrets: [

            "RESEND_API_KEY"

        ]

    },

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            approveAccessRequestValidator(

                request.data

            );

            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const auth = requireAuth(request);

            const result =

                await approveAccessRequestService(

                    request.data,

                    auth.uid

                );

            /*
            ==============================================
            RESPONSE
            ==============================================
            */

            return handleServiceResult(

                result

            );

        }

    )

);

/*
==========================================================
REJECT ACCESS REQUEST
==========================================================
*/

export const rejectAccessRequest = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            VALIDATION
            ==============================================
            */

            rejectAccessRequestValidator(

                request.data

            );

            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const auth = requireAuth(request);

            const result =

                await rejectAccessRequestService(

                    request.data,

                    auth.uid

                );

            /*
            ==============================================
            RESPONSE
            ==============================================
            */

            return handleServiceResult(

                result

            );

        }

    )

);