/**
 * ==========================================================
 * EMAIL DOMAIN CONTROLLER
 * ==========================================================
 */

import {
    onCall
} from "firebase-functions/v2/https";

import {
    createEmailDomainService,
    getEmailDomainStatusService,
    verifyEmailDomainService
} from "../communication/services/emailDomainService.js";

import {
    withCloudFunction
} from "../utils/cloudFunctionResponse.js";

import {
    handleServiceResult
} from "../utils/handleServiceResult.js";

import {
    requireAuth
} from "../utils/requireAuth.js";


/**
 * ==========================================================
 * CREATE EMAIL DOMAIN
 * ==========================================================
 */

export const createEmailDomain = onCall(

    {
        secrets: [

            "RESEND_API_KEY"

        ]
    },

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            AUTHENTICATION
            ==============================================
            */

            const auth =

                requireAuth(

                    request

                );


            /*
            ==============================================
            DATA
            ==============================================
            */

            const domain =

                request.data?.domain;

            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const result =

                await createEmailDomainService({

                    userId:

                        auth.uid,

                    domain

                });


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


/**
 * ==========================================================
 * GET EMAIL DOMAIN STATUS
 * ==========================================================
 */

export const getEmailDomainStatus = onCall(

    {
        secrets: [

            "RESEND_API_KEY"

        ]
    },

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            AUTHENTICATION
            ==============================================
            */

            const auth =

                requireAuth(

                    request

                );


            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const result =

                await getEmailDomainStatusService({

                    userId:

                        auth.uid

                });


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


/**
 * ==========================================================
 * VERIFY EMAIL DOMAIN
 * ==========================================================
 */

export const verifyEmailDomain = onCall(

    {
        secrets: [

            "RESEND_API_KEY"

        ]
    },

    withCloudFunction(

        async (request) => {

            /*
            ==============================================
            AUTHENTICATION
            ==============================================
            */

            const auth =

                requireAuth(

                    request

                );


            /*
            ==============================================
            SERVICE
            ==============================================
            */

            const result =

                await verifyEmailDomainService({

                    userId:

                        auth.uid

                });


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