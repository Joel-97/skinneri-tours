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