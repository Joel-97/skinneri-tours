/**
 * ==========================================================
 * TRANSPORTATION RESERVATION CONTROLLER
 * ==========================================================
 */

import {
    onRequest,
    onCall,
    HttpsError
} from "firebase-functions/v2/https";


import {
    createTransportationReservationService,
    confirmTransportationReservationService
} from "../services/transportationReservationService.js";


import PLATFORM_ERRORS
    from "../constants/errors/platformErrors.js";


import CLOUD_FUNCTION_ERROR_CODES
    from "../constants/cloudFunctionErrorCodes.js";


import CLOUD_FUNCTION_ERROR_MAPPER
    from "../utils/mappers/cloudFunctionErrorMapper.js";


import {
    requireCompanyAdmin
} from "../utils/requireCompanyAdmin.js";


/*
==========================================================
HTTP STATUS FROM CLOUD FUNCTION CODE
==========================================================
*/

function getHttpStatus(code) {

    switch (code) {

        case CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT:

            return 400;


        case CLOUD_FUNCTION_ERROR_CODES.UNAUTHENTICATED:

            return 401;


        case CLOUD_FUNCTION_ERROR_CODES.PERMISSION_DENIED:

            return 403;


        case CLOUD_FUNCTION_ERROR_CODES.NOT_FOUND:

            return 404;


        case CLOUD_FUNCTION_ERROR_CODES.ALREADY_EXISTS:

            return 409;


        case CLOUD_FUNCTION_ERROR_CODES.FAILED_PRECONDITION:

            return 412;


        case CLOUD_FUNCTION_ERROR_CODES.RESOURCE_EXHAUSTED:

            return 429;


        case CLOUD_FUNCTION_ERROR_CODES.INTERNAL:

        default:

            return 500;

    }

}


/*
==========================================================
CREATE TRANSPORTATION RESERVATION
==========================================================
*/

export const createTransportationReservation = onRequest(

    async (request, response) => {

        /*
        ==================================================
        CORS
        ==================================================
        */

        response.set(
            "Access-Control-Allow-Origin",
            "*"
        );


        response.set(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS"
        );


        response.set(
            "Access-Control-Allow-Headers",
            "Content-Type, X-API-Key"
        );


        /*
        ==================================================
        PREFLIGHT
        ==================================================
        */

        if (
            request.method ===
            "OPTIONS"
        ) {

            response
                .status(204)
                .send();

            return;

        }


        /*
        ==================================================
        METHOD
        ==================================================
        */

        if (
            request.method !==
            "POST"
        ) {

            response
                .status(405)
                .json({

                    success: false,

                    error:
                        "METHOD_NOT_ALLOWED",

                    code:
                        "METHOD_NOT_ALLOWED"

                });

            return;

        }


        try {

            /*
            ==================================================
            CONTENT TYPE
            ==================================================
            */

            const contentType =
                request.get(
                    "Content-Type"
                ) || "";


            if (
                !contentType
                    .toLowerCase()
                    .includes(
                        "application/json"
                    )
            ) {

                response
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "Content-Type must be application/json.",

                        code:
                            CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT

                    });

                return;

            }


            /*
            ==================================================
            API KEY
            ==================================================
            */

            const apiKey =
                request.get(
                    "X-API-Key"
                );


            if (
                !apiKey ||
                typeof apiKey !== "string"
            ) {

                response
                    .status(401)
                    .json({

                        success: false,

                        error:
                            "API key is required.",

                        code:
                            CLOUD_FUNCTION_ERROR_CODES.UNAUTHENTICATED

                    });

                return;

            }


            /*
            ==================================================
            DATA
            ==================================================
            */

            const data =
                request.body;


            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {

                response
                    .status(400)
                    .json({

                        success: false,

                        error:
                            PLATFORM_ERRORS.VALIDATION_ERROR,

                        code:
                            CLOUD_FUNCTION_ERROR_CODES.INVALID_ARGUMENT

                    });

                return;

            }


            /*
            ==================================================
            SERVICE
            ==================================================
            */

            const result =
                await createTransportationReservationService({

                    apiKey:
                        apiKey.trim(),

                    data

                });


            /*
            ==================================================
            SERVICE FAILURE
            ==================================================
            */

            if (
                !result.success
            ) {

                const businessCode =
                    result.code ||
                    result.error ||
                    PLATFORM_ERRORS.UNKNOWN_ERROR;


                const cloudFunctionCode =
                    CLOUD_FUNCTION_ERROR_MAPPER[
                        businessCode
                    ]
                    ||
                    CLOUD_FUNCTION_ERROR_MAPPER[
                        result.error
                    ]
                    ||
                    (
                        Object.values(
                            CLOUD_FUNCTION_ERROR_CODES
                        ).includes(
                            businessCode
                        )
                            ? businessCode
                            : CLOUD_FUNCTION_ERROR_CODES.INTERNAL
                    );


                const httpStatus =
                    getHttpStatus(
                        cloudFunctionCode
                    );


                response
                .status(httpStatus)
                .json({

                    success: false,

                    error:
                        result.error ||
                        PLATFORM_ERRORS.UNKNOWN_ERROR,

                    code:
                        businessCode

                });

                return;

            }


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            response
                .status(
                    result.created
                        ? 201
                        : 200
                )
                .json({

                    success: true,

                    data:
                        result.data

                });

        }

        catch (error) {

            console.error(
                "createTransportationReservation error:",
                error
            );


            /*
            ==================================================
            UNEXPECTED ERROR
            ==================================================
            */

            response
                .status(500)
                .json({

                    success: false,

                    error:
                        PLATFORM_ERRORS.UNKNOWN_ERROR,

                    code:
                        CLOUD_FUNCTION_ERROR_CODES.INTERNAL

                });

        }

    }

);


/*
==========================================================
CONFIRM TRANSPORTATION RESERVATION
==========================================================
*/

export const confirmTransportationReservation = onCall(

    async (request) => {

        try {

            /*
            ==================================================
            REQUIRE COMPANY ADMIN
            ==================================================

            requireCompanyAdmin() receives the complete
            callable request.

            It handles:

            - authentication
            - user lookup
            - admin validation
            - super admin detection
            - company association
            ==================================================
            */

            const adminContext =
                await requireCompanyAdmin(
                    request
                );


            /*
            ==================================================
            COMPANY ID
            ==================================================

            Normal admin:
                companyId comes from user profile.

            Super admin:
                companyId must come from request.data.
            ==================================================
            */

            const requestedCompanyId =
                typeof request.data?.companyId === "string"
                    ? request.data.companyId.trim()
                    : "";


            const companyId =
                adminContext.isSuperAdmin
                    ? requestedCompanyId
                    : adminContext.companyId;


            /*
            ==================================================
            COMPANY REQUIRED
            ==================================================
            */

            if (!companyId) {

                throw new HttpsError(

                    "failed-precondition",

                    "Company ID is required."

                );

            }


            /*
            ==================================================
            RESERVATION ID
            ==================================================
            */

            const reservationId =
                request.data?.reservationId;


            if (
                !reservationId ||
                typeof reservationId !== "string"
            ) {

                throw new HttpsError(

                    "invalid-argument",

                    "RESERVATION_ID_REQUIRED"

                );

            }


            /*
            ==================================================
            SERVICE
            ==================================================
            */

            const result =
                await confirmTransportationReservationService({

                    companyId,

                    reservationId:
                        reservationId.trim(),

                    uid:
                        request.auth.uid

                });


            /*
            ==================================================
            SERVICE FAILURE
            ==================================================
            */

            if (
                !result.success
            ) {

                /*
                ------------------------------------------------
                BUSINESS ERROR CODE
                ------------------------------------------------

                Examples:

                INVALID_API_KEY
                RESERVATION_NOT_FOUND
                RESERVATION_INVALID_STATE

                These are application-level codes and may not
                be valid Firebase HttpsError codes.
                ------------------------------------------------
                */

                const businessCode =
                    result.code
                    ||
                    result.error
                    ||
                    PLATFORM_ERRORS.UNKNOWN_ERROR;


                /*
                ------------------------------------------------
                MAP BUSINESS ERROR TO FIREBASE CODE
                ------------------------------------------------
                */

                const mappedCode =
                    CLOUD_FUNCTION_ERROR_MAPPER[
                        businessCode
                    ]
                    ||
                    CLOUD_FUNCTION_ERROR_MAPPER[
                        result.error
                    ];


                /*
                ------------------------------------------------
                DETERMINE FIREBASE CODE
                ------------------------------------------------

                If the mapper contains the business error,
                use the mapped Firebase code.

                If the service already returned a valid
                Firebase code, preserve it.

                Otherwise use INTERNAL.
                ------------------------------------------------
                */

                const normalizedCode =

                    mappedCode

                    ||

                    (
                        Object.values(
                            CLOUD_FUNCTION_ERROR_CODES
                        ).includes(
                            businessCode
                        )
                            ? businessCode
                            : CLOUD_FUNCTION_ERROR_CODES.INTERNAL
                    );


                /*
                ------------------------------------------------
                THROW FIREBASE HTTPS ERROR
                ------------------------------------------------
                */

                throw new HttpsError(

                    normalizedCode,

                    businessCode

                );

            }


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            return {

                success: true,

                data:
                    result.data

            };

        }

        catch (error) {

            console.error(
                "confirmTransportationReservation error:",
                error
            );


            /*
            ==================================================
            PRESERVE HTTPS ERRORS
            ==================================================

            If requireCompanyAdmin() or this controller
            already generated an HttpsError, return it
            unchanged.

            This preserves the correct Firebase error code.
            ==================================================
            */

            if (
                error instanceof HttpsError
            ) {

                throw error;

            }


            /*
            ==================================================
            NORMALIZE UNKNOWN ERRORS
            ==================================================
            */

            const businessCode =
                error?.code
                ||
                error?.message
                ||
                PLATFORM_ERRORS.UNKNOWN_ERROR;


            /*
            ------------------------------------------------
            MAP APPLICATION ERROR
            ------------------------------------------------
            */

            const mappedCode =
                CLOUD_FUNCTION_ERROR_MAPPER[
                    businessCode
                ];


            /*
            ------------------------------------------------
            DETERMINE FIREBASE CODE
            ------------------------------------------------
            */

            const normalizedCode =

                mappedCode

                ||

                (
                    Object.values(
                        CLOUD_FUNCTION_ERROR_CODES
                    ).includes(
                        businessCode
                    )
                        ? businessCode
                        : CLOUD_FUNCTION_ERROR_CODES.INTERNAL
                );


            /*
            ==================================================
            THROW FIREBASE HTTPS ERROR
            ==================================================
            */

            throw new HttpsError(

                normalizedCode,

                error?.message
                    ||
                    PLATFORM_ERRORS.UNKNOWN_ERROR

            );

        }

    }

);