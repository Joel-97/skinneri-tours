/**
 * ==========================================================
 * SKINNERI BACKEND
 * ==========================================================
 */


/**
 * ==========================================================
 * ACCESS REQUESTS
 * ==========================================================
 */

export {

    createAccessRequest,

    getAccessRequests,

    approveAccessRequest,

    rejectAccessRequest

} from "./controllers/accessRequestController.js";


/**
 * ==========================================================
 * AUTH ACTIONS
 * ==========================================================
 */

export {

    completeAuthAction

} from "./controllers/completeAuthActionController.js";


export {

    getAuthAction

} from "./controllers/getAuthActionController.js";


/**
 * ==========================================================
 * RESERVATION EMAIL
 * ==========================================================
 */

export {

    sendReservationConfirmation

} from "./controllers/reservationEmailController.js";


/**
 * ==========================================================
 * EMAIL DOMAIN
 * ==========================================================
 */

export {

    createEmailDomain,

    getEmailDomainStatus,

    verifyEmailDomain

} from "./controllers/emailDomainController.js";


/**
 * ==========================================================
 * TRANSPORTATION INTEGRATIONS
 * ==========================================================
 */

export {

    createTransportationIntegration,

    getTransportationIntegration,

    updateTransportationIntegrationCompanyCode,

    updateTransportationIntegrationStatus,

    getPublicTransportationConfiguration,

    rotateTransportationIntegrationApiKey,

    migrateTransportationIntegrationWidget,

    getTransportationWidgetConfiguration,

    updateTransportationWidgetAppearance

} from "./controllers/transportationIntegrationController.js";


/**
 * ==========================================================
 * TRANSPORTATION RESERVATION API
 * ==========================================================
 */

export {

    createPublicTransportationReservation

} from "./controllers/transportationIntegrationController.js";


/**
 * ==========================================================
 * INTERNAL TRANSPORTATION RESERVATIONS
 * ==========================================================
 */

export {

    createTransportationReservation,

    confirmTransportationReservation

} from "./controllers/transportationReservationController.js";