/*
 * ==========================================================
 * TRANSPORTATION INTEGRATION CONTROLLER
 * ==========================================================
 */

import {
    onCall,
    onRequest
} from "firebase-functions/v2/https";


/*
 * ==========================================================
 * TRANSPORTATION INTEGRATION SERVICES
 * ==========================================================
 */

import {
    createTransportationIntegrationService,
    getTransportationIntegrationService,
    rotateTransportationIntegrationApiKeyService,
    updateTransportationIntegrationCompanyCodeService,
    updateTransportationIntegrationStatusService,
    migrateTransportationIntegrationWidgetService
} from "../services/transportationIntegrationService.js";


/*
 * ==========================================================
 * TRANSPORTATION WIDGET SERVICES
 * ==========================================================
 */

import {
    getTransportationWidgetConfigurationService,
    updateTransportationWidgetAppearanceService
} from "../services/transportationWidgetService.js";


/*
 * ==========================================================
 * TRANSPORTATION WIDGET RESERVATION SERVICE
 * ==========================================================
 */

import {
    createTransportationWidgetReservationService
} from "../services/transportationWidgetReservationService.js";


/*
 * ==========================================================
 * PUBLIC TRANSPORTATION SERVICES
 * ==========================================================
 */

import {
    getPublicTransportationConfigurationService,
    createPublicTransportationReservationService
} from "../services/publicTransportationService.js";


/*
 * ==========================================================
 * CLOUD FUNCTION RESPONSE
 * ==========================================================
 */

import {
    withCloudFunction
} from "../utils/cloudFunctionResponse.js";


/*
 * ==========================================================
 * SERVICE RESULT HANDLER
 * ==========================================================
 */

import {
    handleServiceResult
} from "../utils/handleServiceResult.js";


/*
 * ==========================================================
 * COMPANY ADMIN
 * ==========================================================
 */

import {
    requireCompanyAdmin
} from "../utils/requireCompanyAdmin.js";


/*
 * ==========================================================
 * PLATFORM ERRORS
 * ==========================================================
 */

import PLATFORM_ERRORS
    from "../constants/errors/platformErrors.js";


/*
 * ==========================================================
 * CREATE TRANSPORTATION INTEGRATION
 * ==========================================================
 */

export const createTransportationIntegration = onCall(

    withCloudFunction(

        async (request) => {

            const auth =
                await requireCompanyAdmin(
                    request
                );


            const targetCompanyId =
                auth.isSuperAdmin
                    ? request.data?.companyId
                    : auth.companyId;


            if (!targetCompanyId) {

                throw new Error(
                    "companyId is required."
                );

            }


            const companyCode =
                request.data?.companyCode;


            const result =
                await createTransportationIntegrationService({

                    companyId:
                        targetCompanyId,

                    uid:
                        auth.uid,

                    companyCode

                });


            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * GET TRANSPORTATION INTEGRATION
 * ==========================================================
 */

export const getTransportationIntegration = onCall(

    withCloudFunction(

        async (request) => {

            const auth =
                await requireCompanyAdmin(
                    request
                );


            const targetCompanyId =
                auth.isSuperAdmin
                    ? request.data?.companyId
                    : auth.companyId;


            if (!targetCompanyId) {

                throw new Error(
                    "companyId is required."
                );

            }


            const result =
                await getTransportationIntegrationService({

                    companyId:
                        targetCompanyId

                });


            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * ROTATE TRANSPORTATION INTEGRATION API KEY
 * ==========================================================
 */

export const rotateTransportationIntegrationApiKey = onCall(

    withCloudFunction(

        async (request) => {

            const auth =
                await requireCompanyAdmin(
                    request
                );


            const targetCompanyId =
                auth.isSuperAdmin
                    ? request.data?.companyId
                    : auth.companyId;


            if (!targetCompanyId) {

                throw new Error(
                    "companyId is required."
                );

            }


            const result =
                await rotateTransportationIntegrationApiKeyService({

                    companyId:
                        targetCompanyId

                });


            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * UPDATE TRANSPORTATION INTEGRATION COMPANY CODE
 * ==========================================================
 */

export const updateTransportationIntegrationCompanyCode = onCall(

    withCloudFunction(

        async (request) => {

            const auth =
                await requireCompanyAdmin(
                    request
                );


            const targetCompanyId =
                auth.isSuperAdmin
                    ? request.data?.companyId
                    : auth.companyId;


            if (!targetCompanyId) {

                throw new Error(
                    "companyId is required."
                );

            }


            const companyCode =
                request.data?.companyCode;


            const result =
                await updateTransportationIntegrationCompanyCodeService({

                    companyId:
                        targetCompanyId,

                    companyCode

                });


            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * UPDATE TRANSPORTATION INTEGRATION STATUS
 * ==========================================================
 */

export const updateTransportationIntegrationStatus = onCall(

    withCloudFunction(

        async (request) => {

            const auth =
                await requireCompanyAdmin(
                    request
                );


            const targetCompanyId =
                auth.isSuperAdmin
                    ? request.data?.companyId
                    : auth.companyId;


            if (!targetCompanyId) {

                throw new Error(
                    "companyId is required."
                );

            }


            const status =
                request.data?.status;


            if (
                status !== "active" &&
                status !== "inactive"
            ) {

                throw new Error(
                    "Invalid integration status."
                );

            }


            const result =
                await updateTransportationIntegrationStatusService({

                    companyId:
                        targetCompanyId,

                    status

                });


            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * MIGRATE TRANSPORTATION INTEGRATION WIDGET
 * ==========================================================
 */

export const migrateTransportationIntegrationWidget = onCall(

    withCloudFunction(

        async (request) => {

            const auth =
                await requireCompanyAdmin(
                    request
                );


            const targetCompanyId =
                auth.isSuperAdmin
                    ? request.data?.companyId
                    : auth.companyId;


            if (!targetCompanyId) {

                throw new Error(
                    "companyId is required."
                );

            }


            const result =
                await migrateTransportationIntegrationWidgetService({

                    companyId:
                        targetCompanyId,

                    uid:
                        auth.uid

                });


            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * GET TRANSPORTATION WIDGET CONFIGURATION
 * ==========================================================
 *
 * PUBLIC CALLABLE FUNCTION
 *
 * Authentication:
 *
 * Not required.
 *
 * The Widget ID is public.
 *
 * The backend resolves:
 *
 * transportationWidgets/{widgetId}
 *          ↓
 *       companyId
 *          ↓
 *       company
 *
 * The service validates the Widget, integration and company.
 *
 * ==========================================================
 */

export const getTransportationWidgetConfiguration = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==================================================
            WIDGET ID
            ==================================================
            */

            const widgetId =
                request.data?.widgetId;


            /*
            ==================================================
            VALIDATION
            ==================================================
            */

            if (
                !widgetId ||
                typeof widgetId !== "string" ||
                !widgetId.trim()
            ) {

                throw new Error(
                    "widgetId is required."
                );

            }


            /*
            ==================================================
            SERVICE
            ==================================================
            */

            const result =
                await getTransportationWidgetConfigurationService({

                    widgetId:
                        widgetId.trim()

                });


            /*
            ==================================================
            RESULT
            ==================================================
            */

            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * CREATE TRANSPORTATION WIDGET RESERVATION
 * ==========================================================
 *
 * PUBLIC CALLABLE FUNCTION
 *
 * Authentication:
 *
 * Not required.
 *
 * The Widget ID is public.
 *
 * The service validates:
 *
 * 1. Widget
 * 2. Widget status
 * 3. Integration
 * 4. Integration type
 * 5. Integration status
 * 6. Company
 * 7. Company status
 * 8. Service type
 * 9. Pickup location
 * 10. Destination
 * 11. Reservation data
 *
 * The public client cannot control:
 *
 * - price
 * - currency
 * - payment type
 * - driver
 * - vehicle
 * - commissions
 * - taxes
 * - internal staff
 * - financial fields
 *
 * ==========================================================
 */

export const createTransportationWidgetReservation = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==================================================
            REQUEST DATA
            ==================================================
            */

            const data =
                request.data;


            /*
            ==================================================
            VALIDATION
            ==================================================
            */

            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {

                throw new Error(
                    "Invalid request data."
                );

            }


            /*
            ==================================================
            WIDGET ID
            ==================================================
            */

            const widgetId =
                data.widgetId;


            if (
                !widgetId ||
                typeof widgetId !== "string" ||
                !widgetId.trim()
            ) {

                throw new Error(
                    "widgetId is required."
                );

            }


            /*
            ==================================================
            SERVICE
            ==================================================
            */

            const result =
                await createTransportationWidgetReservationService({

                    widgetId:
                        widgetId.trim(),

                    data

                });


            /*
            ==================================================
            RESULT
            ==================================================
            */

            return handleServiceResult(
                result
            );

        }

    )

);


/*
 * ==========================================================
 * UPDATE TRANSPORTATION WIDGET APPEARANCE
 * ==========================================================
 */

export const updateTransportationWidgetAppearance = onCall(

    withCloudFunction(

        async (request) => {

            /*
            ==================================================
            AUTHENTICATION
            ==================================================
            */

            const auth =
                await requireCompanyAdmin(
                    request
                );


            /*
            ==================================================
            COMPANY
            ==================================================
            */

            const targetCompanyId =
                auth.isSuperAdmin
                    ? request.data?.companyId
                    : auth.companyId;


            if (!targetCompanyId) {

                throw new Error(
                    "companyId is required."
                );

            }


            /*
            ==================================================
            WIDGET ID
            ==================================================
            */

            const widgetId =
                request.data?.widgetId;


            /*
            ==================================================
            APPEARANCE
            ==================================================
            */

            const appearance =
                request.data?.appearance;


            /*
            ==================================================
            SERVICE
            ==================================================
            */

            const result =
                await updateTransportationWidgetAppearanceService({

                    companyId:
                        targetCompanyId,

                    widgetId,

                    appearance

                });


            /*
            ==================================================
            RESULT
            ==================================================
            */

            return handleServiceResult(
                result
            );

        }

    )

);


/**
 * ==========================================================
 * GET PUBLIC TRANSPORTATION CONFIGURATION
 * ==========================================================
 *
 * PUBLIC HTTP ENDPOINT
 *
 * Authentication:
 *
 * X-API-Key
 *
 * Method:
 *
 * GET
 *
 * ==========================================================
 */

export const getPublicTransportationConfiguration = onRequest(

    {
        cors: true
    },

    async (
        request,
        response
    ) => {

        /*
        ======================================================
        PREFLIGHT
        ======================================================
        */

        if (
            request.method === "OPTIONS"
        ) {

            response
                .status(204)
                .send();

            return;

        }


        /*
        ======================================================
        METHOD
        ======================================================
        */

        if (
            request.method !== "GET"
        ) {

            sendPublicError(
                response,
                405,
                "METHOD_NOT_ALLOWED"
            );

            return;

        }


        /*
        ======================================================
        API KEY
        ======================================================
        */

        const apiKey =
            request.get(
                "X-API-Key"
            );


        if (
            !apiKey ||
            typeof apiKey !== "string" ||
            !apiKey.trim()
        ) {

            sendPublicError(
                response,
                401,
                "API_KEY_REQUIRED"
            );

            return;

        }


        try {

            const result =
                await getPublicTransportationConfigurationService({

                    apiKey:
                        apiKey.trim()

                });


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            if (
                result.success
            ) {

                response
                    .status(200)
                    .json({

                        success: true,

                        data:
                            result.data

                    });

                return;

            }


            /*
            ==================================================
            SERVICE ERROR
            ==================================================
            */

            const statusCode =
                getPublicHttpStatusCode(
                    result.code
                );


            sendPublicError(
                response,
                statusCode,
                result.code ||
                    PLATFORM_ERRORS.UNKNOWN_ERROR
            );

        }

        catch (error) {

            console.error(
                "getPublicTransportationConfiguration error:",
                error
            );


            sendPublicError(
                response,
                500,
                PLATFORM_ERRORS.UNKNOWN_ERROR
            );

        }

    }

);


/**
 * ==========================================================
 * CREATE PUBLIC TRANSPORTATION RESERVATION
 * ==========================================================
 *
 * PUBLIC HTTP ENDPOINT
 *
 * Authentication:
 *
 * X-API-Key
 *
 * Method:
 *
 * POST
 *
 * ==========================================================
 */

export const createPublicTransportationReservation = onRequest(

    {
        cors: true
    },

    async (
        request,
        response
    ) => {

        /*
        ======================================================
        PREFLIGHT
        ======================================================
        */

        if (
            request.method === "OPTIONS"
        ) {

            response
                .status(204)
                .send();

            return;

        }


        /*
        ======================================================
        METHOD
        ======================================================
        */

        if (
            request.method !== "POST"
        ) {

            sendPublicError(
                response,
                405,
                "METHOD_NOT_ALLOWED"
            );

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

                sendPublicError(
                    response,
                    400,
                    "INVALID_CONTENT_TYPE"
                );

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
                typeof apiKey !== "string" ||
                !apiKey.trim()
            ) {

                sendPublicError(
                    response,
                    401,
                    "API_KEY_REQUIRED"
                );

                return;

            }


            /*
            ==================================================
            REQUEST BODY
            ==================================================
            */

            const data =
                request.body;


            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {

                sendPublicError(
                    response,
                    400,
                    "INVALID_REQUEST_BODY"
                );

                return;

            }


            /*
            ==================================================
            SERVICE
            ==================================================
            */

            const result =
                await createPublicTransportationReservationService({

                    apiKey:
                        apiKey.trim(),

                    data

                });


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            if (
                result.success
            ) {

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

                return;

            }


            /*
            ==================================================
            SERVICE ERROR
            ==================================================
            */

            const statusCode =
                getPublicHttpStatusCode(
                    result.code
                );


            sendPublicError(
                response,
                statusCode,
                result.code ||
                    PLATFORM_ERRORS.UNKNOWN_ERROR
            );

        }

        catch (error) {

            console.error(
                "createPublicTransportationReservation error:",
                error
            );


            sendPublicError(
                response,
                500,
                PLATFORM_ERRORS.UNKNOWN_ERROR
            );

        }

    }

);


/**
 * ==========================================================
 * SEND PUBLIC ERROR
 * ==========================================================
 */

function sendPublicError(
    response,
    statusCode,
    code
) {

    const errorCode =
        code ||
        PLATFORM_ERRORS.UNKNOWN_ERROR;


    response
        .status(
            statusCode
        )
        .json({

            success: false,

            error:
                errorCode,

            code:
                errorCode

        });

}


/**
 * ==========================================================
 * PUBLIC HTTP STATUS CODE
 * ==========================================================
 */

function getPublicHttpStatusCode(
    code
) {

    switch (code) {

        /*
        ------------------------------------------------------
        BAD REQUEST
        ------------------------------------------------------
        */

        case PLATFORM_ERRORS.VALIDATION_ERROR:

            return 400;


        /*
        ------------------------------------------------------
        FORBIDDEN
        ------------------------------------------------------
        */

        case PLATFORM_ERRORS.PERMISSION_DENIED:

            return 403;


        /*
        ------------------------------------------------------
        NOT FOUND
        ------------------------------------------------------
        */

        case PLATFORM_ERRORS.NOT_FOUND:

            return 404;


        case PLATFORM_ERRORS.SERVICE_TYPE_NOT_FOUND:

            return 404;


        case PLATFORM_ERRORS.LOCATION_NOT_FOUND:

            return 404;


        /*
        ------------------------------------------------------
        CONFLICT
        ------------------------------------------------------
        */

        case PLATFORM_ERRORS.COMPANY_ALREADY_EXISTS:

            return 409;


        case PLATFORM_ERRORS.USER_ALREADY_EXISTS:

            return 409;


        case PLATFORM_ERRORS.INTEGRATION_ALREADY_EXISTS:

            return 409;


        /*
        ------------------------------------------------------
        PRECONDITION FAILED
        ------------------------------------------------------
        */

        case PLATFORM_ERRORS.RESERVATION_INVALID_STATE:

            return 412;


        /*
        ------------------------------------------------------
        INTERNAL ERROR
        ------------------------------------------------------
        */

        case PLATFORM_ERRORS.UNKNOWN_ERROR:

            return 500;


        case PLATFORM_ERRORS.INTERNAL_ERROR:

            return 500;


        /*
        ------------------------------------------------------
        DEFAULT
        ------------------------------------------------------
        */

        default:

            return 500;

    }

}