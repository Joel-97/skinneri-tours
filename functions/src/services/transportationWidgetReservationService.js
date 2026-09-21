/*
==========================================================
TRANSPORTATION WIDGET RESERVATION SERVICE
==========================================================
*/

/*
==========================================================
IMPORTS
==========================================================
*/

import { db } from "../firebase/admin.js";

import {
    success,
    failure,
    created
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
CONSTANTS
==========================================================
*/

const INTEGRATION_TYPE =
    "transportation";

const TRANSPORTATION_CATEGORY =
    "transportation";

const PUBLIC_BOOKING_SOURCE =
    "Website";

const PUBLIC_CREATED_BY =
    "public_api";

const PUBLIC_RESERVATION_STATUS =
    "pending";


/*
==========================================================
GET WIDGET BY ID
==========================================================
*/

async function getWidgetById(
    widgetId
) {

    if (
        typeof widgetId !== "string" ||
        !widgetId.trim()
    ) {

        return null;

    }


    const normalizedWidgetId =
        widgetId.trim();


    const reference =
        db
            .collection(
                FIRESTORE_COLLECTIONS
                    .TRANSPORTATION_WIDGETS
            )
            .doc(
                normalizedWidgetId
            );


    const snapshot =
        await reference.get();


    if (
        !snapshot.exists
    ) {

        return null;

    }


    return {

        id:
            snapshot.id,

        ref:
            reference,

        ...snapshot.data()

    };

}


/*
==========================================================
GET INTEGRATION BY ID
==========================================================
*/

async function getIntegrationById(
    integrationId
) {

    if (
        !integrationId
    ) {

        return null;

    }


    const reference =
        db
            .collection(
                FIRESTORE_COLLECTIONS
                    .INTEGRATIONS
            )
            .doc(
                integrationId
            );


    const snapshot =
        await reference.get();


    if (
        !snapshot.exists
    ) {

        return null;

    }


    return {

        id:
            snapshot.id,

        ...snapshot.data()

    };

}


/*
==========================================================
GET COMPANY BY ID
==========================================================
*/

async function getCompanyById(
    companyId
) {

    if (
        !companyId
    ) {

        return null;

    }


    const reference =
        db
            .collection(
                FIRESTORE_COLLECTIONS
                    .COMPANIES
            )
            .doc(
                companyId
            );


    const snapshot =
        await reference.get();


    if (
        !snapshot.exists
    ) {

        return null;

    }


    return {

        id:
            snapshot.id,

        ...snapshot.data()

    };

}


/*
==========================================================
GET SERVICE TYPE BY CODE
==========================================================
*/

/*
The public Widget uses service codes instead of Firestore
document IDs.

This prevents the Widget from depending on internal
Firestore document identifiers.
*/

async function getActiveServiceTypeByCode(
    companyId,
    serviceTypeCode
) {

    if (
        !companyId ||
        typeof serviceTypeCode !== "string" ||
        !serviceTypeCode.trim()
    ) {

        return null;

    }


    const normalizedCode =
        serviceTypeCode
            .trim()
            .toLowerCase();


    const snapshot =
        await db
            .collection(
                FIRESTORE_COLLECTIONS
                    .COMPANIES
            )
            .doc(
                companyId
            )
            .collection(
                FIRESTORE_COLLECTIONS
                    .SERVICE_TYPES
            )
            .where(
                "code",
                "==",
                normalizedCode
            )
            .where(
                "isActive",
                "==",
                true
            )
            .limit(1)
            .get();


    if (
        snapshot.empty
    ) {

        return null;

    }


    const document =
        snapshot.docs[0];


    const serviceType =
        document.data();


    if (
        serviceType.category !==
        TRANSPORTATION_CATEGORY
    ) {

        return null;

    }


    return {

        id:
            document.id,

        ...serviceType

    };

}


/*
==========================================================
GET LOCATION BY CODE
==========================================================
*/

async function getActiveLocationByCode(
    companyId,
    locationCode
) {

    if (
        !companyId ||
        typeof locationCode !== "string" ||
        !locationCode.trim()
    ) {

        return null;

    }


    const normalizedCode =
        locationCode
            .trim()
            .toLowerCase();


    const snapshot =
        await db
            .collection(
                FIRESTORE_COLLECTIONS
                    .COMPANIES
            )
            .doc(
                companyId
            )
            .collection(
                FIRESTORE_COLLECTIONS
                    .LOCATIONS
            )
            .where(
                "code",
                "==",
                normalizedCode
            )
            .where(
                "isActive",
                "==",
                true
            )
            .limit(1)
            .get();


    if (
        snapshot.empty
    ) {

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
GET ACTIVE BOOKING SOURCE BY NAME
==========================================================
*/

/*
The public Widget does not receive or control the booking
source ID.

The backend resolves the configured active booking source
named "Website" for the company and stores its Firestore
document ID in the reservation.
*/

async function getActiveBookingSourceByName(
    companyId,
    bookingSourceName
) {

    if (
        !companyId ||
        typeof bookingSourceName !== "string" ||
        !bookingSourceName.trim()
    ) {

        return null;

    }


    const snapshot =
        await db
            .collection(
                FIRESTORE_COLLECTIONS
                    .COMPANIES
            )
            .doc(
                companyId
            )
            .collection(
                FIRESTORE_COLLECTIONS
                    .BOOKING_SOURCES
            )
            .where(
                "isActive",
                "==",
                true
            )
            .get();


    if (
        snapshot.empty
    ) {

        return null;

    }


    const normalizedName =
        bookingSourceName
            .trim()
            .toLowerCase();


    const document =
        snapshot.docs.find(
            item => {

                const source =
                    item.data();

                return (
                    typeof source.name ===
                        "string" &&
                    source.name
                        .trim()
                        .toLowerCase() ===
                        normalizedName
                );

            }
        );


    if (
        !document
    ) {

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
VALIDATE STRING
==========================================================
*/

function isValidRequiredString(
    value
) {

    return (
        typeof value === "string" &&
        value.trim() !== ""
    );

}


/*
==========================================================
VALIDATE EMAIL
==========================================================
*/

function isValidEmail(
    email
) {

    if (
        typeof email !== "string"
    ) {

        return false;

    }


    const normalizedEmail =
        email.trim();


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            normalizedEmail
        );

}


/*
==========================================================
VALIDATE RESERVATION DATA
==========================================================
*/

function validateReservationData(
    data
) {

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    WIDGET ID
    ------------------------------------------------------
    */

    if (
        !isValidRequiredString(
            data.widgetId
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    SERVICE TYPE
    ------------------------------------------------------
    */

    if (
        !isValidRequiredString(
            data.serviceTypeCode
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    PICKUP LOCATION
    ------------------------------------------------------
    */

    if (
        !isValidRequiredString(
            data.locationFromCode
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    DESTINATION
    ------------------------------------------------------
    */

    if (
        !isValidRequiredString(
            data.locationToCode
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    DIFFERENT LOCATIONS
    ------------------------------------------------------
    */

    if (
        data.locationFromCode
            .trim()
            .toLowerCase() ===
        data.locationToCode
            .trim()
            .toLowerCase()
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    DATE
    ------------------------------------------------------
    */

    if (
        !isValidRequiredString(
            data.date
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    const reservationDate =
        new Date(
            data.date
        );


    if (
        Number.isNaN(
            reservationDate.getTime()
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    PASSENGERS
    ------------------------------------------------------
    */

    const passengers =
        Number(
            data.passengers
        );


    if (
        !Number.isInteger(
            passengers
        ) ||
        passengers <= 0
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    CLIENT NAME
    ------------------------------------------------------
    */

    if (
        !isValidRequiredString(
            data.clientName
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    CLIENT EMAIL
    ------------------------------------------------------
    */

    if (
        !isValidEmail(
            data.clientEmail
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    PHONE
    ------------------------------------------------------
    */

    if (
        !isValidRequiredString(
            data.phone
        )
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    /*
    ------------------------------------------------------
    OPTIONAL FIELDS
    ------------------------------------------------------
    */

    if (
        data.flightNumber !== undefined &&
        data.flightNumber !== null &&
        typeof data.flightNumber !== "string"
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    if (
        data.notes !== undefined &&
        data.notes !== null &&
        typeof data.notes !== "string"
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }


    return {

        valid: true,

        code: null

    };

}


/*
==========================================================
BUILD RESERVATION
==========================================================
*/

function buildReservation({

    data,

    company,

    serviceType,

    locationFrom,

    locationTo,

    bookingSource,

    reservationNumber,

    reservationId

}) {

    const now =
        new Date();


    const reservationDate =
        new Date(
            data.date
        );


    return {

        /*
        --------------------------------------------------
        IDENTIFICATION
        --------------------------------------------------
        */

        id:
            reservationId,

        reservationNumber,


        /*
        --------------------------------------------------
        STATUS
        --------------------------------------------------
        */

        status:
            PUBLIC_RESERVATION_STATUS,


        /*
        --------------------------------------------------
        COMPANY
        --------------------------------------------------
        */

        companyId:
            company.id,


        /*
        --------------------------------------------------
        SERVICE
        --------------------------------------------------
        */

        serviceTypeId:
            serviceType.id,

        serviceTypeName:
            serviceType.name || "",

        serviceCategory:
            serviceType.category ||
            TRANSPORTATION_CATEGORY,


        /*
        --------------------------------------------------
        ROUTE / LOCATIONS
        --------------------------------------------------
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
        --------------------------------------------------
        DATE
        --------------------------------------------------
        */

        date:
            reservationDate,

        dateString:
            reservationDate
                .toISOString()
                .slice(
                    0,
                    10
                ),


        /*
        --------------------------------------------------
        PASSENGERS
        --------------------------------------------------
        */

        passengers:
            Number(
                data.passengers
            ),


        /*
        --------------------------------------------------
        CLIENT
        --------------------------------------------------
        */

        clientId:
            "",

        clientName:
            data.clientName
                .trim(),

        clientEmail:
            data.clientEmail
                .trim(),

        phone:
            data.phone
                .trim(),


        /*
        --------------------------------------------------
        OPTIONAL INFORMATION
        --------------------------------------------------
        */

        flightNumber:
            typeof data.flightNumber ===
            "string"
                ? data.flightNumber.trim()
                : "",

        notes:
            typeof data.notes ===
            "string"
                ? data.notes.trim()
                : "",


        /*
        --------------------------------------------------
        BOOKING SOURCE
        --------------------------------------------------
        */

        bookingSourceId:
            bookingSource.id,

        bookingSourceName:
            bookingSource.name ||
            PUBLIC_BOOKING_SOURCE,


        /*
        --------------------------------------------------
        FINANCIAL
        --------------------------------------------------
        */

        price:
            null,

        currency:
            "",

        paymentTypeId:
            "",

        paymentTypeName:
            "",

        discountAmount:
            0,

        commissionAmount:
            0,


        /*
        --------------------------------------------------
        DRIVER
        --------------------------------------------------
        */

        driverId:
            "",

        driverName:
            "",


        /*
        --------------------------------------------------
        VEHICLE
        --------------------------------------------------
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
        --------------------------------------------------
        STAFF / OPERATIONS
        --------------------------------------------------
        */

        staffId:
            "",

        staffName:
            "",


        /*
        --------------------------------------------------
        PUBLIC API
        --------------------------------------------------
        */

        createdBy:
            PUBLIC_CREATED_BY,

        updatedBy:
            PUBLIC_CREATED_BY,


        /*
        --------------------------------------------------
        TIMESTAMPS
        --------------------------------------------------
        */

        createdAt:
            now,

        updatedAt:
            now

    };

}


/*
==========================================================
CREATE TRANSPORTATION WIDGET RESERVATION
==========================================================
*/

/*
==========================================================
PUBLIC SERVICE
==========================================================

This service is intentionally unauthenticated.

The Widget ID is public.

Security is provided by validating:

1. Widget existence
2. Widget status
3. Integration existence
4. Integration type
5. Integration/company relationship
6. Integration/widget relationship
7. Company existence
8. Company status
9. Booking source
10. Service type
11. Location
12. Reservation data

The public client never controls financial or operational
fields.
*/

export async function
createTransportationWidgetReservationService({

    widgetId,

    data = {}

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        const requestData = {

            ...data,

            widgetId:
                widgetId ||
                data.widgetId

        };


        const validation =
            validateReservationData(
                requestData
            );


        if (
            !validation.valid
        ) {

            return failure(

                validation.code

            );

        }


        /*
        ==================================================
        GET WIDGET
        ==================================================
        */

        const widget =
            await getWidgetById(
                requestData.widgetId
            );


        if (
            !widget
        ) {

            return failure(

                PLATFORM_ERRORS
                    .NOT_FOUND

            );

        }


        /*
        ==================================================
        WIDGET STATUS
        ==================================================
        */

        if (
            widget.status !==
            "active"
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        WIDGET COMPANY
        ==================================================
        */

        if (
            !widget.companyId
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        WIDGET INTEGRATION
        ==================================================
        */

        if (
            !widget.integrationId
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        GET INTEGRATION
        ==================================================
        */

        const integration =
            await getIntegrationById(
                widget.integrationId
            );


        if (
            !integration
        ) {

            return failure(

                PLATFORM_ERRORS
                    .NOT_FOUND

            );

        }


        /*
        ==================================================
        INTEGRATION TYPE
        ==================================================
        */

        if (
            integration.type !==
            INTEGRATION_TYPE
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        INTEGRATION STATUS
        ==================================================
        */

        if (
            integration.status !==
            "active"
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        INTEGRATION COMPANY
        ==================================================
        */

        if (
            integration.companyId !==
            widget.companyId
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        INTEGRATION WIDGET
        ==================================================
        */

        if (
            integration.widgetId !==
            widget.widgetId
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        GET COMPANY
        ==================================================
        */

        const company =
            await getCompanyById(
                widget.companyId
            );


        if (
            !company
        ) {

            return failure(

                PLATFORM_ERRORS
                    .NOT_FOUND

            );

        }


        /*
        ==================================================
        COMPANY STATUS
        ==================================================
        */

        if (
            company.status !==
            "active"
        ) {

            return failure(

                PLATFORM_ERRORS
                    .PERMISSION_DENIED

            );

        }


        /*
        ==================================================
        GET BOOKING SOURCE
        ==================================================
        */

        const bookingSource =
            await getActiveBookingSourceByName(

                widget.companyId,

                PUBLIC_BOOKING_SOURCE

            );


        if (
            !bookingSource
        ) {

            return failure(

                PLATFORM_ERRORS
                    .NOT_FOUND

            );

        }


        /*
        ==================================================
        GET SERVICE TYPE
        ==================================================
        */

        const serviceType =
            await getActiveServiceTypeByCode(

                widget.companyId,

                requestData
                    .serviceTypeCode

            );


        if (
            !serviceType
        ) {

            return failure(

                PLATFORM_ERRORS
                    .NOT_FOUND

            );

        }


        /*
        ==================================================
        GET PICKUP LOCATION
        ==================================================
        */

        const locationFrom =
            await getActiveLocationByCode(

                widget.companyId,

                requestData
                    .locationFromCode

            );


        if (
            !locationFrom
        ) {

            return failure(

                PLATFORM_ERRORS
                    .NOT_FOUND

            );

        }


        /*
        ==================================================
        GET DESTINATION
        ==================================================
        */

        const locationTo =
            await getActiveLocationByCode(

                widget.companyId,

                requestData
                    .locationToCode

            );


        if (
            !locationTo
        ) {

            return failure(

                PLATFORM_ERRORS
                    .NOT_FOUND

            );

        }


        /*
        ==================================================
        PREVENT SAME LOCATION
        ==================================================
        */

        if (
            locationFrom.id ===
            locationTo.id
        ) {

            return failure(

                PLATFORM_ERRORS
                    .VALIDATION_ERROR

            );

        }


        /*
        ==================================================
        GENERATE RESERVATION ID
        ==================================================
        */

        const reservationReference =
            db
                .collection(
                    FIRESTORE_COLLECTIONS
                        .COMPANIES
                )
                .doc(
                    widget.companyId
                )
                .collection(
                    FIRESTORE_COLLECTIONS
                        .TRANSPORTATION
                )
                .doc();


        const reservationId =
            reservationReference.id;


        /*
        ==================================================
        GENERATE RESERVATION NUMBER
        ==================================================
        */

        const reservationNumber =
            await generateReservationNumber(

                widget.companyId,

                "transportation"

            );


        /*
        ==================================================
        BUILD RESERVATION
        ==================================================
        */

        const reservation =
            buildReservation({

                data:
                    requestData,

                company,

                serviceType,

                locationFrom,

                locationTo,

                bookingSource,

                reservationNumber,

                reservationId

            });


        /*
        ==================================================
        SAVE RESERVATION
        ==================================================
        */

        await reservationReference.set(
            reservation
        );


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return created({

            reservationId,

            reservationNumber,

            status:
                PUBLIC_RESERVATION_STATUS

        });

    }

    catch (error) {

        console.error(
            "createTransportationWidgetReservationService error:",
            error
        );


        return failure(

            PLATFORM_ERRORS
                .UNKNOWN_ERROR

        );

    }

}


/*
==========================================================
EXPORT DEFAULT
==========================================================
*/

export default {

    createTransportationWidgetReservationService

};