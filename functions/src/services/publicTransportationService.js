/**
 * ==========================================================
 * PUBLIC TRANSPORTATION SERVICE
 * ==========================================================
 */

import crypto from "crypto";

import { db } from "../firebase/admin.js";

import FIRESTORE_COLLECTIONS from "../constants/firestoreCollections.js";

import PLATFORM_ERRORS from "../constants/errors/platformErrors.js";

import {
    success,
    created,
    failure
} from "../utils/serviceResult.js";

import {
    generateReservationNumber
} from "../utils/reservationNumber.js";


const INTEGRATION_TYPE = "transportation";

const PUBLIC_BOOKING_SOURCE = "Website";

const PUBLIC_CREATED_BY = "public_api";

const PUBLIC_RESERVATION_STATUS = "pending";

const TRANSPORTATION_CATEGORY = "transportation";


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

    const snapshot =
        await db
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
        id: document.id,
        ...document.data()
    };

}


/*
==========================================================
GET COMPANY
==========================================================
*/

async function getCompany(companyId) {

    const document =
        await db
            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )
            .doc(companyId)
            .get();

    if (!document.exists) {
        return null;
    }

    return {
        id: document.id,
        ...document.data()
    };

}


/*
==========================================================
GET ACTIVE CATALOG
==========================================================
*/

async function getActiveCatalog(
    companyId,
    collectionName
) {

    const snapshot =
        await db
            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )
            .doc(companyId)
            .collection(collectionName)
            .where(
                "isActive",
                "==",
                true
            )
            .get();

    return snapshot.docs.map(
        document => ({
            id: document.id,
            ...document.data()
        })
    );

}


/*
==========================================================
GET ACTIVE SERVICE TYPE BY CODE
==========================================================
*/

async function getActiveServiceTypeByCode(
    companyId,
    serviceTypeCode
) {

    if (
        !serviceTypeCode ||
        typeof serviceTypeCode !== "string"
    ) {

        return null;

    }

    const normalizedCode =
        serviceTypeCode
            .trim()
            .toLowerCase();

    if (!normalizedCode) {
        return null;
    }

    const snapshot =
        await db
            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )
            .doc(companyId)
            .collection(
                FIRESTORE_COLLECTIONS.SERVICE_TYPES
            )
            .where(
                "code",
                "==",
                normalizedCode
            )
            .limit(1)
            .get();

    if (snapshot.empty) {
        return null;
    }

    const document =
        snapshot.docs[0];

    const data =
        document.data();

    if (
        data.isActive !== true
    ) {

        return null;

    }

    if (
        data.category !==
        TRANSPORTATION_CATEGORY
    ) {

        return null;

    }

    return {

        id:
            document.id,

        ...data

    };

}


/*
==========================================================
GET ACTIVE LOCATION BY CODE
==========================================================
*/

async function getActiveLocationByCode(
    companyId,
    locationCode
) {

    if (
        !locationCode ||
        typeof locationCode !== "string"
    ) {

        return null;

    }

    const normalizedCode =
        locationCode
            .trim()
            .toLowerCase();

    if (!normalizedCode) {
        return null;
    }

    const snapshot =
        await db
            .collection(
                FIRESTORE_COLLECTIONS.COMPANIES
            )
            .doc(companyId)
            .collection(
                FIRESTORE_COLLECTIONS.LOCATIONS
            )
            .where(
                "code",
                "==",
                normalizedCode
            )
            .limit(1)
            .get();

    if (snapshot.empty) {
        return null;
    }

    const document =
        snapshot.docs[0];

    const data =
        document.data();

    if (
        data.isActive !== true
    ) {

        return null;

    }

    return {

        id:
            document.id,

        ...data

    };

}


/*
==========================================================
GET TIMEZONE OFFSET
==========================================================
*/

function getTimeZoneOffsetMs(
    date,
    timeZone
) {

    const parts =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone,

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit",

                hourCycle:
                    "h23"
            }
        ).formatToParts(date);

    const values = {};

    for (const part of parts) {

        if (
            part.type !==
            "literal"
        ) {

            values[part.type] =
                part.value;

        }

    }

    const representedAsUtc =
        Date.UTC(
            Number(values.year),
            Number(values.month) - 1,
            Number(values.day),
            Number(values.hour),
            Number(values.minute),
            Number(values.second)
        );

    return (
        representedAsUtc -
        date.getTime()
    );

}


/*
==========================================================
GET LOCAL DATE PARTS
==========================================================
*/

function getLocalDateParts(
    date,
    timeZone
) {

    const parts =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone,

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit",

                hourCycle:
                    "h23"
            }
        ).formatToParts(date);

    const values = {};

    for (const part of parts) {

        if (
            part.type !==
            "literal"
        ) {

            values[part.type] =
                Number(part.value);

        }

    }

    return values;

}


/*
==========================================================
PARSE RESERVATION DATE

RULES:

1. Without timezone:
   Interpret as company local time.

2. With Z:
   Interpret as UTC.

3. With explicit offset:
   Respect the supplied offset.

Examples:

2026-10-10T14:00:00
    -> 14:00 company local time

2026-10-10T14:00:00-06:00
    -> explicit -06:00

2026-10-10T14:00:00Z
    -> explicit UTC
==========================================================
*/

function parseReservationDate(
    value,
    timeZone
) {

    if (
        typeof value !== "string" ||
        !value.trim()
    ) {

        return null;

    }

    const normalizedValue =
        value.trim();


    /*
    ------------------------------------------------------
    EXPLICIT TIMEZONE
    ------------------------------------------------------
    */

    const hasExplicitTimeZone =
        /(?:Z|[+-]\d{2}:?\d{2})$/i
            .test(
                normalizedValue
            );

    if (hasExplicitTimeZone) {

        const explicitDate =
            new Date(
                normalizedValue
            );

        if (
            Number.isNaN(
                explicitDate.getTime()
            )
        ) {

            return null;

        }

        return explicitDate;

    }


    /*
    ------------------------------------------------------
    LOCAL DATETIME
    ------------------------------------------------------

    Expected format:

    YYYY-MM-DDTHH:mm

    or

    YYYY-MM-DDTHH:mm:ss

    or

    YYYY-MM-DDTHH:mm:ss.SSS
    ------------------------------------------------------
    */

    const match =
        normalizedValue.match(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
        );

    if (!match) {
        return null;
    }


    const year =
        Number(match[1]);

    const month =
        Number(match[2]);

    const day =
        Number(match[3]);

    const hour =
        Number(match[4]);

    const minute =
        Number(match[5]);

    const second =
        Number(match[6] || 0);

    const millisecond =
        Number(
            (match[7] || "0")
                .padEnd(3, "0")
        );


    /*
    ------------------------------------------------------
    VALIDATE BASIC DATE COMPONENTS
    ------------------------------------------------------
    */

    const localAsUtc =
        Date.UTC(
            year,
            month - 1,
            day,
            hour,
            minute,
            second,
            millisecond
        );

    const basicDate =
        new Date(
            localAsUtc
        );

    if (
        basicDate.getUTCFullYear() !== year ||
        basicDate.getUTCMonth() !== month - 1 ||
        basicDate.getUTCDate() !== day ||
        basicDate.getUTCHours() !== hour ||
        basicDate.getUTCMinutes() !== minute ||
        basicDate.getUTCSeconds() !== second ||
        basicDate.getUTCMilliseconds() !== millisecond
    ) {

        return null;

    }


    /*
    ------------------------------------------------------
    RESOLVE COMPANY TIMEZONE
    ------------------------------------------------------
    */

    const resolvedTimeZone =
        typeof timeZone === "string" &&
        timeZone.trim()
            ? timeZone.trim()
            : "UTC";


    /*
    ------------------------------------------------------
    VALIDATE IANA TIMEZONE
    ------------------------------------------------------
    */

    try {

        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    resolvedTimeZone
            }
        ).format(
            basicDate
        );

    }
    catch (error) {

        return null;

    }


    /*
    ------------------------------------------------------
    CONVERT LOCAL TIME TO UTC
    ------------------------------------------------------

    localAsUtc represents the requested wall-clock time
    as if it were UTC.

    We then subtract the timezone offset to obtain the
    real UTC instant.
    ------------------------------------------------------
    */

    let timestamp =
        localAsUtc;


    for (
        let index = 0;
        index < 3;
        index += 1
    ) {

        const offset =
            getTimeZoneOffsetMs(
                new Date(timestamp),
                resolvedTimeZone
            );

        timestamp =
            localAsUtc -
            offset;

    }


    const result =
        new Date(
            timestamp
        );


    if (
        Number.isNaN(
            result.getTime()
        )
    ) {

        return null;

    }


    /*
    ------------------------------------------------------
    ROUND-TRIP VALIDATION
    ------------------------------------------------------

    This catches nonexistent local times caused by DST
    transitions.
    ------------------------------------------------------
    */

    const localParts =
        getLocalDateParts(
            result,
            resolvedTimeZone
        );


    if (
        localParts.year !== year ||
        localParts.month !== month ||
        localParts.day !== day ||
        localParts.hour !== hour ||
        localParts.minute !== minute ||
        localParts.second !== second
    ) {

        return null;

    }


    return result;

}


/*
==========================================================
VALIDATE PUBLIC RESERVATION DATA
==========================================================
*/

function validatePublicReservationData(
    data
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return PLATFORM_ERRORS.VALIDATION_ERROR;

    }


    const requiredFields = [

        "serviceTypeCode",

        "locationFromCode",

        "locationToCode",

        "date",

        "passengers",

        "clientName",

        "clientEmail",

        "phone"

    ];


    for (
        const field of requiredFields
    ) {

        if (
            data[field] === undefined ||
            data[field] === null ||
            data[field] === ""
        ) {

            return PLATFORM_ERRORS.VALIDATION_ERROR;

        }

    }


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

        return PLATFORM_ERRORS.VALIDATION_ERROR;

    }


    if (
        typeof data.clientName !== "string" ||
        !data.clientName.trim()
    ) {

        return PLATFORM_ERRORS.VALIDATION_ERROR;

    }


    if (
        typeof data.clientEmail !== "string" ||
        !data.clientEmail.trim()
    ) {

        return PLATFORM_ERRORS.VALIDATION_ERROR;

    }


    if (
        typeof data.phone !== "string" ||
        !data.phone.trim()
    ) {

        return PLATFORM_ERRORS.VALIDATION_ERROR;

    }


    return null;

}


/*
==========================================================
BUILD PUBLIC RESERVATION
==========================================================
*/

function buildPublicReservation({

    data,

    reservationNumber,

    serviceType,

    locationFrom,

    locationTo,

    reservationDate

}) {

    const timestamp =
        new Date();


    return {

        /*
        --------------------------------------------------
        RESERVATION
        --------------------------------------------------
        */

        reservationNumber,

        status:
            PUBLIC_RESERVATION_STATUS,


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
        LOCATIONS
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
            null,

        clientName:
            data.clientName.trim(),

        clientEmail:
            data.clientEmail.trim(),

        phone:
            data.phone.trim(),


        /*
        --------------------------------------------------
        FLIGHT
        --------------------------------------------------
        */

        flightNumber:
            typeof data.flightNumber === "string"
                ? data.flightNumber.trim()
                : "",


        /*
        --------------------------------------------------
        NOTES
        --------------------------------------------------
        */

        notes:
            typeof data.notes === "string"
                ? data.notes.trim()
                : "",


        /*
        --------------------------------------------------
        PUBLIC SOURCE
        --------------------------------------------------
        */

        bookingSourceName:
            PUBLIC_BOOKING_SOURCE,


        /*
        --------------------------------------------------
        ADMINISTRATIVE FIELDS
        --------------------------------------------------
        */

        price:
            null,

        currency:
            null,

        subtotal:
            null,

        discountAmount:
            0,

        taxAmount:
            0,

        total:
            null,

        driverId:
            "",

        driverName:
            "",

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
        METADATA
        --------------------------------------------------
        */

        createdBy:
            PUBLIC_CREATED_BY,

        updatedBy:
            PUBLIC_CREATED_BY,

        createdAt:
            timestamp,

        updatedAt:
            timestamp

    };

}


/*
==========================================================
GET PUBLIC TRANSPORTATION CONFIGURATION
==========================================================
*/

export async function getPublicTransportationConfigurationService({
    apiKey
}) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        if (
            !apiKey ||
            typeof apiKey !== "string"
        ) {

            return failure(
                PLATFORM_ERRORS.VALIDATION_ERROR
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


        if (!integration) {

            return failure(
                PLATFORM_ERRORS.PERMISSION_DENIED
            );

        }


        /*
        ======================================================
        COMPANY
        ======================================================
        */

        const company =
            await getCompany(
                integration.companyId
            );


        if (!company) {

            return failure(
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
                PLATFORM_ERRORS.PERMISSION_DENIED
            );

        }


        /*
        ======================================================
        CATALOGS
        ======================================================
        */

        const [
            serviceTypes,
            locations
        ] = await Promise.all([

            getActiveCatalog(
                integration.companyId,
                FIRESTORE_COLLECTIONS.SERVICE_TYPES
            ),

            getActiveCatalog(
                integration.companyId,
                FIRESTORE_COLLECTIONS.LOCATIONS
            )

        ]);


        /*
        ======================================================
        TRANSPORTATION SERVICE TYPES ONLY
        ======================================================
        */

        const transportationServiceTypes =
            serviceTypes.filter(
                serviceType =>
                    serviceType.category ===
                    TRANSPORTATION_CATEGORY
            );


        /*
        ======================================================
        PUBLIC CONFIGURATION
        ======================================================
        */

        return success({

            companyCode:
                integration.companyCode || null,

            company:
                buildPublicCompany(
                    company
                ),

            serviceTypes:
                buildPublicServiceTypes(
                    transportationServiceTypes
                ),

            locations:
                buildPublicLocations(
                    locations
                )

        });

    }

    catch (error) {

        console.error(
            error
        );

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}


/*
==========================================================
BUILD PUBLIC COMPANY
==========================================================
*/

function buildPublicCompany(
    company
) {

    return {

        name:
            company.name || "",

        legalName:
            company.legalName || "",

        logoURL:
            company.logoURL || "",

        primaryColor:
            company.primaryColor || "",

        phone:
            company.phone || "",

        email:
            company.email || "",

        website:
            company.website || "",

        timezone:
            company.timezone || "",

        country:
            company.country || "",

        city:
            company.city || "",

        province:
            company.province || ""

    };

}


/*
==========================================================
BUILD PUBLIC SERVICE TYPES
==========================================================
*/

function buildPublicServiceTypes(
    serviceTypes
) {

    return serviceTypes

        .filter(
            serviceType =>
                typeof serviceType.code === "string" &&
                serviceType.code.trim() !== ""
        )

        .map(
            serviceType => ({

                code:
                    serviceType.code,

                name:
                    serviceType.name || ""

            })
        );

}


/*
==========================================================
BUILD PUBLIC LOCATIONS
==========================================================
*/

function buildPublicLocations(
    locations
) {

    return locations

        .filter(
            location =>
                typeof location.code === "string" &&
                location.code.trim() !== ""
        )

        .map(
            location => ({

                code:
                    location.code,

                name:
                    location.name || ""

            })
        );

}


/*
==========================================================
CREATE PUBLIC TRANSPORTATION RESERVATION
==========================================================
*/

export async function createPublicTransportationReservationService({

    apiKey,

    data

}) {

    try {

        /*
        ======================================================
        VALIDATION
        ======================================================
        */

        const validationError =
            validatePublicReservationData(
                data
            );


        if (validationError) {

            return failure(
                validationError
            );

        }


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
                PLATFORM_ERRORS.PERMISSION_DENIED
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


        if (!integration) {

            return failure(
                PLATFORM_ERRORS.PERMISSION_DENIED
            );

        }


        /*
        ======================================================
        COMPANY
        ======================================================
        */

        const company =
            await getCompany(
                integration.companyId
            );


        if (!company) {

            return failure(
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
                PLATFORM_ERRORS.PERMISSION_DENIED
            );

        }


        /*
        ======================================================
        RESERVATION DATE

        IMPORTANT:

        A date without timezone is interpreted using the
        company's configured timezone.

        Example:

        company.timezone =
            "America/Costa_Rica"

        data.date =
            "2026-10-10T14:00:00"

        Result:
            14:00 Costa Rica
            = 20:00 UTC

        ======================================================
        */

        const reservationDate =
            parseReservationDate(
                data.date,
                company.timezone || "UTC"
            );


        if (!reservationDate) {

            return failure(
                PLATFORM_ERRORS.VALIDATION_ERROR
            );

        }


        /*
        ======================================================
        SERVICE TYPE BY CODE
        ======================================================
        */

        const serviceType =
            await getActiveServiceTypeByCode(
                integration.companyId,
                data.serviceTypeCode
            );


        if (!serviceType) {

            return failure(
                PLATFORM_ERRORS.SERVICE_TYPE_NOT_FOUND ||
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ======================================================
        LOCATION FROM BY CODE
        ======================================================
        */

        const locationFrom =
            await getActiveLocationByCode(
                integration.companyId,
                data.locationFromCode
            );


        if (!locationFrom) {

            return failure(
                PLATFORM_ERRORS.LOCATION_NOT_FOUND ||
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ======================================================
        LOCATION TO BY CODE
        ======================================================
        */

        const locationTo =
            await getActiveLocationByCode(
                integration.companyId,
                data.locationToCode
            );


        if (!locationTo) {

            return failure(
                PLATFORM_ERRORS.LOCATION_NOT_FOUND ||
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ======================================================
        GENERATE RESERVATION NUMBER
        ======================================================
        */

        const reservationNumber =
            await generateReservationNumber(
                integration.companyId,
                "transportation"
            );


        /*
        ======================================================
        BUILD RESERVATION
        ======================================================
        */

        const reservation =
            buildPublicReservation({

                data,

                reservationNumber,

                serviceType,

                locationFrom,

                locationTo,

                reservationDate

            });


        /*
        ======================================================
        SAVE RESERVATION
        ======================================================
        */

        const reference =
            await db

                .collection(
                    FIRESTORE_COLLECTIONS.COMPANIES
                )

                .doc(
                    integration.companyId
                )

                .collection(
                    FIRESTORE_COLLECTIONS.TRANSPORTATION
                )

                .add(
                    reservation
                );


        /*
        ======================================================
        RESPONSE
        ======================================================
        */

        return created({

            reservationId:
                reference.id,

            reservationNumber,

            status:
                PUBLIC_RESERVATION_STATUS

        });

    }

    catch (error) {

        console.error(
            error
        );

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}