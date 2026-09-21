/*
 * ==========================================================
 * TRANSPORTATION RESERVATION SERVICE
 * ==========================================================
 */

import crypto from "crypto";

import { db } from "../firebase/admin.js";

import {
    created,
    success,
    failure
} from "../utils/serviceResult.js";

import FIRESTORE_COLLECTIONS
    from "../constants/firestoreCollections.js";

import PLATFORM_ERRORS
    from "../constants/errors/platformErrors.js";

import {
    generateReservationNumber
} from "../utils/reservationNumber.js";


/*
==========================================================
INTEGRATION TYPE
==========================================================
*/

const INTEGRATION_TYPE = "transportation";


/*
==========================================================
PUBLIC BOOKING SOURCE
==========================================================
*/

const PUBLIC_BOOKING_SOURCE_NAME = "Website";


/*
==========================================================
HASH API KEY
==========================================================
*/

function hashApiKey(apiKey) {

    return crypto

        .createHash("sha256")

        .update(apiKey)

        .digest("hex");

}


/*
==========================================================
GET INTEGRATION BY API KEY
==========================================================
*/

async function getIntegrationByApiKey(apiKey) {

    const apiKeyHash =
        hashApiKey(apiKey);


    const snapshot = await db

        .collection(
            FIRESTORE_COLLECTIONS.INTEGRATIONS
        )

        .where(
            "apiKeyHash",
            "==",
            apiKeyHash
        )

        .where(
            "type",
            "==",
            INTEGRATION_TYPE
        )

        .where(
            "status",
            "==",
            "active"
        )

        .limit(1)

        .get();


    if (snapshot.empty) {

        return null;

    }


    const document =
        snapshot.docs[0];


    return {

        id:
            document.id,

        ...document.data()

    };

}


/*
==========================================================
GET COMPANY
==========================================================
*/

async function getCompany(

    companyId

) {

    const document =
        await db

            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )

            .doc(
                companyId
            )

            .get();


    if (!document.exists) {

        return null;

    }


    return {

        id:
            document.id,

        ...document.data()

    };

}


/*
==========================================================
GET COMPANY DOCUMENT
==========================================================
*/

async function getCompanyDocument(

    companyId,

    collectionName,

    documentId

) {

    const document =
        await db

            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )

            .doc(
                companyId
            )

            .collection(
                collectionName
            )

            .doc(
                documentId
            )

            .get();


    if (!document.exists) {

        return null;

    }


    return {

        id:
            document.id,

        ...document.data()

    };

}


/*
==========================================================
GET WEBSITE BOOKING SOURCE
==========================================================
*/

async function getWebsiteBookingSource(

    companyId

) {

    /*
    ======================================================
    BOOKING SOURCES
    ======================================================

    The public API determines the booking source internally.

    The external client never sends bookingSourceId.

    We look for the active booking source named:

        Website

    inside:

        companies/{companyId}/bookingSources
    ======================================================
    */

    const snapshot =
        await db

            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )

            .doc(
                companyId
            )

            .collection(
                FIRESTORE_COLLECTIONS.BOOKING_SOURCES
            )

            .get();


    if (snapshot.empty) {

        return null;

    }


    const expectedName =
        PUBLIC_BOOKING_SOURCE_NAME
            .trim()
            .toLowerCase();


    /*
    ======================================================
    FIND ACTIVE WEBSITE SOURCE
    ======================================================
    */

    const document =
        snapshot.docs.find(

            doc => {

                const data =
                    doc.data();


                const name =
                    typeof data.name === "string"

                        ? data.name
                            .trim()
                            .toLowerCase()

                        : "";


                const isActive =
                    data.isActive !== false;


                return (

                    isActive &&

                    name ===
                        expectedName

                );

            }

        );


    if (!document) {

        return null;

    }


    return {

        id:
            document.id,

        ...document.data()

    };

}


/*
==========================================================
VALIDATE SERVICE TYPE
==========================================================
*/

async function validateServiceType(

    companyId,

    serviceTypeId

) {

    if (!serviceTypeId) {

        return null;

    }


    const serviceType =
        await getCompanyDocument(

            companyId,

            FIRESTORE_COLLECTIONS.SERVICE_TYPES,

            serviceTypeId

        );


    if (!serviceType) {

        return null;

    }


    if (
        serviceType.isActive === false
    ) {

        return null;

    }


    if (

        serviceType.category &&

        serviceType.category !==
            "transportation"

    ) {

        return null;

    }


    return serviceType;

}


/*
==========================================================
VALIDATE LOCATION
==========================================================
*/

async function validateLocation(

    companyId,

    locationId

) {

    if (!locationId) {

        return null;

    }


    const location =
        await getCompanyDocument(

            companyId,

            FIRESTORE_COLLECTIONS.LOCATIONS,

            locationId

        );


    if (!location) {

        return null;

    }


    if (
        location.isActive === false
    ) {

        return null;

    }


    return location;

}


/*
==========================================================
VALIDATE DATE
==========================================================
*/

function validateDate(

    value

) {

    if (!value) {

        return false;

    }


    const date =
        new Date(value);


    return (

        !Number.isNaN(
            date.getTime()
        )

    );

}


/*
==========================================================
VALIDATE EMAIL
==========================================================
*/

function validateEmail(

    email

) {

    if (!email) {

        return false;

    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(
            email.trim()
        );

}


/*
==========================================================
VALIDATE REQUIRED DATA
==========================================================
*/

function validateReservationData(

    data

) {

    if (!data) {

        return "VALIDATION_ERROR";

    }


    if (!data.clientName?.trim()) {

        return "CLIENT_NAME_REQUIRED";

    }


    if (!data.clientEmail?.trim()) {

        return "CLIENT_EMAIL_REQUIRED";

    }


    if (

        !validateEmail(
            data.clientEmail
        )

    ) {

        return "INVALID_EMAIL";

    }


    if (!data.serviceTypeId) {

        return "SERVICE_TYPE_REQUIRED";

    }


    if (!data.locationFromId) {

        return "LOCATION_FROM_REQUIRED";

    }


    if (!data.locationToId) {

        return "LOCATION_TO_REQUIRED";

    }


    if (!data.date) {

        return "DATE_REQUIRED";

    }


    if (

        !validateDate(
            data.date
        )

    ) {

        return "INVALID_DATE";

    }


    const passengers =
        Number(data.passengers);


    if (

        !Number.isInteger(passengers) ||

        passengers < 1

    ) {

        return "INVALID_PASSENGERS";

    }


    return null;

}


/*
==========================================================
BUILD RESERVATION
==========================================================
*/

function buildReservation({

    data,

    companyId,

    serviceType,

    locationFrom,

    locationTo,

    bookingSource,

    reservationNumber

}) {

    const timestamp =
        new Date();


    const reservationDate =
        new Date(
            data.date
        );


    const dateString =
        data.date.substring(
            0,
            10
        );


    return {

        /*
        ==================================================
        CLIENT
        ==================================================
        */

        clientId:
            null,

        clientName:
            data.clientName.trim(),

        clientEmail:
            data.clientEmail.trim(),

        phone:
            data.phone?.trim() || "",


        /*
        ==================================================
        SERVICE
        ==================================================
        */

        serviceTypeId:
            serviceType.id,

        serviceTypeName:
            serviceType.name || "",

        serviceCategory:
            "transportation",

        service:
            "",


        /*
        ==================================================
        LOCATIONS
        ==================================================
        */

        locationFromId:
            locationFrom.id,

        locationFromName:
            locationFrom.name || "",

        locationToId:
            locationTo.id,

        locationToName:
            locationTo.name || "",


        /*
        ==================================================
        DATE
        ==================================================
        */

        date:
            reservationDate,

        end:
            null,


        /*
        ==================================================
        STATUS
        ==================================================
        */

        status:
            "pending",


        /*
        ==================================================
        PASSENGERS
        ==================================================
        */

        passengers:
            Number(data.passengers),

        flightNumber:
            data.flightNumber?.trim() || "",


        /*
        ==================================================
        ROUTE
        ==================================================
        */

        routeId:
            "",

        routeCode:
            "",

        routeName:
            "",


        /*
        ==================================================
        VEHICLE
        ==================================================
        */

        vehicleId:
            "",

        vehicleName:
            "",

        vehiclePlate:
            "",

        vehicleType:
            "",


        /*
        ==================================================
        DRIVER
        ==================================================
        */

        driverId:
            "",

        driverName:
            "",


        /*
        ==================================================
        BOOKING SOURCE
        ==================================================
        */

        bookingSourceId:
            bookingSource.id,

        bookingSourceName:
            bookingSource.name ||
            PUBLIC_BOOKING_SOURCE_NAME,


        /*
        ==================================================
        FINANCIAL
        ==================================================
        */

        payerId:
            "",

        payerName:
            "",

        paymentTypeId:
            "",

        paymentTypeName:
            "",

        paymentStatus:
            "",

        reservationBase:
            "",

        currency:
            serviceType.currency || "",

        symbol:
            serviceType.symbol || "",

        price:
            0,

        discountId:
            "",

        discountAmount:
            0,

        activeTaxIds:
            [],

        taxAmount:
            0,

        subtotal:
            0,

        total:
            0,


        /*
        ==================================================
        COMMISSION
        ==================================================
        */

        commissionEnabled:
            false,

        commissionType:
            "percentage",

        commissionValue:
            0,

        commissionBeneficiaryId:
            "",

        commissionBeneficiaryName:
            "",

        commissionBeneficiaryType:
            "",

        commissionId:
            null,

        commissionAmount:
            0,


        /*
        ==================================================
        NOTES
        ==================================================
        */

        notes:
            data.notes?.trim() || "",


        /*
        ==================================================
        INTEGRATION
        ==================================================
        */

        integrationType:
            INTEGRATION_TYPE,

        integrationCompanyId:
            companyId,


        /*
        ==================================================
        RESERVATION
        ==================================================
        */

        reservationNumber,


        /*
        ==================================================
        REPORTING
        ==================================================
        */

        dateString,

        month:
            dateString.substring(
                0,
                7
            ),

        year:
            dateString.substring(
                0,
                4
            ),


        /*
        ==================================================
        METADATA
        ==================================================
        */

        createdBy:
            "public_api",

        updatedBy:
            "public_api",

        createdAt:
            timestamp,

        updatedAt:
            timestamp

    };

}


/*
==========================================================
CREATE TRANSPORTATION RESERVATION
==========================================================
*/

export async function createTransportationReservationService({

    apiKey,

    data

}) {

    try {

        /*
        ======================================================
        API KEY
        ======================================================
        */

        if (

            !apiKey ||

            typeof apiKey !== "string"

        ) {

            return failure(

                PLATFORM_ERRORS.API_KEY_REQUIRED,

                PLATFORM_ERRORS.API_KEY_REQUIRED

            );

        }


        /*
        ======================================================
        FIND INTEGRATION
        ======================================================
        */

        const integration =
            await getIntegrationByApiKey(

                apiKey.trim()

            );


        /*
        ======================================================
        INVALID API KEY
        ======================================================
        */

        if (!integration) {

            return failure(

                PLATFORM_ERRORS.INVALID_API_KEY,

                PLATFORM_ERRORS.INVALID_API_KEY

            );

        }


        /*
        ======================================================
        COMPANY ID
        ======================================================
        */

        const companyId =
            integration.companyId;


        if (!companyId) {

            return failure(

                PLATFORM_ERRORS.INVALID_API_KEY,

                PLATFORM_ERRORS.INVALID_API_KEY

            );

        }


        /*
        ======================================================
        COMPANY
        ======================================================
        */

        const company =
            await getCompany(
                companyId
            );


        if (!company) {

            return failure(

                PLATFORM_ERRORS.NOT_FOUND,

                PLATFORM_ERRORS.NOT_FOUND

            );

        }


        /*
        ======================================================
        COMPANY STATUS
        ======================================================
        */

        if (
            company.status !== "active"
        ) {

            return failure(

                PLATFORM_ERRORS.PERMISSION_DENIED,

                PLATFORM_ERRORS.PERMISSION_DENIED

            );

        }


        /*
        ======================================================
        VALIDATE DATA
        ======================================================
        */

        const validationError =
            validateReservationData(
                data
            );


        if (validationError) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                validationError

            );

        }


        /*
        ======================================================
        SERVICE TYPE
        ======================================================
        */

        const serviceType =
            await validateServiceType(

                companyId,

                data.serviceTypeId

            );


        if (!serviceType) {

            return failure(

                PLATFORM_ERRORS.SERVICE_TYPE_NOT_FOUND,

                PLATFORM_ERRORS.SERVICE_TYPE_NOT_FOUND

            );

        }


        /*
        ======================================================
        LOCATION FROM
        ======================================================
        */

        const locationFrom =
            await validateLocation(

                companyId,

                data.locationFromId

            );


        if (!locationFrom) {

            return failure(

                PLATFORM_ERRORS.LOCATION_NOT_FOUND,

                PLATFORM_ERRORS.LOCATION_NOT_FOUND

            );

        }


        /*
        ======================================================
        LOCATION TO
        ======================================================
        */

        const locationTo =
            await validateLocation(

                companyId,

                data.locationToId

            );


        if (!locationTo) {

            return failure(

                PLATFORM_ERRORS.LOCATION_NOT_FOUND,

                PLATFORM_ERRORS.LOCATION_NOT_FOUND

            );

        }


        /*
        ======================================================
        BOOKING SOURCE
        ======================================================
        */

        const bookingSource =
            await getWebsiteBookingSource(

                companyId

            );


        /*
        ======================================================
        WEBSITE BOOKING SOURCE REQUIRED
        ======================================================
        */

        if (!bookingSource) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "BOOKING_SOURCE_NOT_FOUND"

            );

        }


        /*
        ======================================================
        RESERVATION NUMBER
        ======================================================
        */

        const reservationNumber =
            generateReservationNumber(

                "transportation"

            );


        /*
        ======================================================
        BUILD
        ======================================================
        */

        const reservation =
            buildReservation({

                data,

                companyId,

                serviceType,

                locationFrom,

                locationTo,

                bookingSource,

                reservationNumber

            });


        /*
        ======================================================
        SAVE
        ======================================================
        */

        const reference =
            await db

                .collection(
                    FIRESTORE_COLLECTIONS.COMPANIES
                )

                .doc(
                    companyId
                )

                .collection(
                    FIRESTORE_COLLECTIONS.TRANSPORTATION
                )

                .add(
                    reservation
                );


        /*
        ======================================================
        RESULT
        ======================================================
        */

        return created({

            reservationId:
                reference.id,

            reservationNumber,

            status:
                "pending"

        });

    }

    catch (error) {

        console.error(
            "createTransportationReservationService error:",
            error
        );


        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR,

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}


/*
==========================================================
CONFIRM TRANSPORTATION RESERVATION
==========================================================
*/

export async function confirmTransportationReservationService({

    companyId,

    reservationId,

    uid

}) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (!companyId) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "COMPANY_ID_REQUIRED"

            );

        }


        if (!reservationId) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "RESERVATION_ID_REQUIRED"

            );

        }


        if (!uid) {

            return failure(

                PLATFORM_ERRORS.VALIDATION_ERROR,

                "USER_ID_REQUIRED"

            );

        }


        /*
        ======================================================
        GET RESERVATION
        ======================================================
        */

        const reference =
            db

                .collection(
                    FIRESTORE_COLLECTIONS.COMPANIES
                )

                .doc(
                    companyId
                )

                .collection(
                    FIRESTORE_COLLECTIONS.TRANSPORTATION
                )

                .doc(
                    reservationId
                );


        const document =
            await reference.get();


        /*
        ======================================================
        RESERVATION NOT FOUND
        ======================================================
        */

        if (!document.exists) {

            return failure(

                PLATFORM_ERRORS.NOT_FOUND,

                PLATFORM_ERRORS.NOT_FOUND

            );

        }


        const reservation =
            document.data();


        /*
        ======================================================
        STATUS VALIDATION
        ======================================================
        */

        if (
            reservation.status !== "pending"
        ) {

            return failure(

                PLATFORM_ERRORS.RESERVATION_INVALID_STATE,

                "RESERVATION_NOT_PENDING"

            );

        }


        /*
        ======================================================
        UPDATE
        ======================================================
        */

        const timestamp =
            new Date();


        await reference.update({

            status:
                "confirmed",

            updatedBy:
                uid,

            updatedAt:
                timestamp

        });


        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success({

            reservationId,

            reservationNumber:
                reservation.reservationNumber || "",

            status:
                "confirmed"

        });

    }

    catch (error) {

        console.error(
            "confirmTransportationReservationService error:",
            error
        );


        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR,

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}