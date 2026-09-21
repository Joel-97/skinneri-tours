/*
==========================================================
TRANSPORTATION WIDGET SERVICE
==========================================================
*/

import { db } from "../firebase/admin.js";

import {
    success,
    failure
} from "../utils/serviceResult.js";

import FIRESTORE_COLLECTIONS
    from "../constants/firestoreCollections.js";

import PLATFORM_ERRORS
    from "../constants/errors/platformErrors.js";


/*
==========================================================
CONSTANTS
==========================================================
*/

const INTEGRATION_TYPE =
    "transportation";


const TRANSPORTATION_CATEGORY =
    "transportation";


/*
==========================================================
DEFAULT APPEARANCE
==========================================================
*/

/*
The primaryColor is intentionally NOT stored here.

The primaryColor belongs to the company and is inherited
by the Widget from:

companies/{companyId}.primaryColor
*/

const DEFAULT_WIDGET_APPEARANCE =
    Object.freeze({

        backgroundColor:
            "#FFFFFF",

        textColor:
            "#111827",

        fieldBackgroundColor:
            "#FFFFFF",

        borderRadius:
            8,

        fontFamily:
            "Inter",

        buttonStyle:
            "filled"

    });


/*
==========================================================
ALLOWED FONT FAMILIES
==========================================================
*/

const ALLOWED_FONT_FAMILIES =
    Object.freeze([

        "Inter",

        "Arial",

        "Helvetica",

        "system-ui"

    ]);


/*
==========================================================
ALLOWED BUTTON STYLES
==========================================================
*/

const ALLOWED_BUTTON_STYLES =
    Object.freeze([

        "filled",

        "outline"

    ]);


/*
==========================================================
COLOR VALIDATION
==========================================================
*/

function isValidColor(
    value
) {

    if (
        typeof value !==
        "string"
    ) {

        return false;

    }


    return /^#[0-9A-Fa-f]{6}$/
        .test(
            value.trim()
        );

}


/*
==========================================================
NORMALIZE COLOR
==========================================================
*/

function normalizeColor(
    value,
    fallback
) {

    if (
        typeof value !==
        "string"
    ) {

        return fallback;

    }


    const normalized =
        value.trim()
            .toUpperCase();


    if (
        !isValidColor(
            normalized
        )
    ) {

        return fallback;

    }


    return normalized;

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


    const companyReference =
        db
            .collection(
                FIRESTORE_COLLECTIONS
                    .COMPANIES
            )
            .doc(
                companyId
            );


    const snapshot =
        await companyReference.get();


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
GET ACTIVE CATALOG
==========================================================
*/

/*
This function reads only active documents from the
company catalog.

It is used by the public Widget configuration so that
the Widget never receives inactive services or locations.
*/

async function getActiveCatalog(
    companyId,
    collectionName
) {

    if (
        !companyId ||
        !collectionName
    ) {

        return [];

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
                collectionName
            )
            .where(
                "isActive",
                "==",
                true
            )
            .get();


    return snapshot.docs.map(
        document => ({

            id:
                document.id,

            ...document.data()

        })
    );

}


/*
==========================================================
BUILD PUBLIC SERVICE TYPES
==========================================================
*/

/*
Only expose fields required by the public Widget.

Private/internal service configuration is intentionally
not returned.
*/

function buildPublicServiceTypes(
    serviceTypes
) {

    return serviceTypes

        .filter(
            serviceType =>

                serviceType.category ===
                TRANSPORTATION_CATEGORY &&

                typeof serviceType.code ===
                "string" &&

                serviceType.code.trim() !== ""

        )

        .map(
            serviceType => ({

                code:
                    serviceType.code
                        .trim()
                        .toLowerCase(),

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

/*
Only expose the public code and name.

Internal fields remain inside Firestore.
*/

function buildPublicLocations(
    locations
) {

    return locations

        .filter(
            location =>

                typeof location.code ===
                "string" &&

                location.code.trim() !== ""

        )

        .map(
            location => ({

                code:
                    location.code
                        .trim()
                        .toLowerCase(),

                name:
                    location.name || ""

            })
        );

}


/*
==========================================================
BUILD PUBLIC COMPANY
==========================================================
*/

/*
The Widget needs company branding.

The primaryColor is included because it belongs to the
company and must be inherited by the Widget.

No private company information is exposed here.
*/

function buildPublicCompany(
    company
) {

    return {

        name:
            typeof company.name ===
                "string"

                ? company.name

                : "",


        logoURL:
            typeof company.logoURL ===
                "string"

                ? company.logoURL

                : "",


        primaryColor:
            normalizeColor(
                company.primaryColor,
                "#2563EB"
            )

    };

}


/*
==========================================================
VALIDATE APPEARANCE
==========================================================
*/

function validateAppearance(
    appearance
) {

    if (
        !appearance ||
        typeof appearance !==
            "object" ||
        Array.isArray(
            appearance
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
    BORDER RADIUS
    ------------------------------------------------------
    */

    const borderRadius =
        Number(
            appearance.borderRadius
        );


    if (
        !Number.isFinite(
            borderRadius
        ) ||
        borderRadius < 0 ||
        borderRadius > 24
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
    FONT
    ------------------------------------------------------
    */

    if (
        !ALLOWED_FONT_FAMILIES
            .includes(
                appearance.fontFamily
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
    BUTTON STYLE
    ------------------------------------------------------
    */

    if (
        !ALLOWED_BUTTON_STYLES
            .includes(
                appearance.buttonStyle
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
    WIDGET COLORS
    ------------------------------------------------------

    primaryColor is intentionally excluded.

    It belongs to the company.
    ------------------------------------------------------
    */

    const colorFields = [

        "backgroundColor",

        "textColor",

        "fieldBackgroundColor"

    ];


    for (
        const field
        of colorFields
    ) {

        if (
            !isValidColor(
                appearance[field]
            )
        ) {

            return {

                valid: false,

                code:
                    PLATFORM_ERRORS
                        .VALIDATION_ERROR

            };

        }

    }


    return {

        valid: true,

        code: null

    };

}


/*
==========================================================
GET WIDGET BY ID
==========================================================
*/

async function getWidgetById(
    widgetId
) {

    const normalizedWidgetId =
        typeof widgetId ===
            "string"

            ? widgetId.trim()

            : "";


    if (
        !normalizedWidgetId
    ) {

        return null;

    }


    const widgetReference =
        db
            .collection(
                FIRESTORE_COLLECTIONS
                    .TRANSPORTATION_WIDGETS
            )
            .doc(
                normalizedWidgetId
            );


    const snapshot =
        await widgetReference.get();


    if (
        !snapshot.exists
    ) {

        return null;

    }


    return {

        id:
            snapshot.id,

        ref:
            widgetReference,

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
VERIFY WIDGET OWNERSHIP
==========================================================
*/

async function verifyWidgetOwnership({

    widget,

    companyId

}) {

    if (
        !widget
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .NOT_FOUND

        };

    }


    /*
    ------------------------------------------------------
    COMPANY
    ------------------------------------------------------
    */

    if (
        widget.companyId !==
        companyId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION
    ------------------------------------------------------
    */

    if (
        !widget.integrationId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    const integration =
        await getIntegrationById(
            widget.integrationId
        );


    if (
        !integration
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .NOT_FOUND

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION TYPE
    ------------------------------------------------------
    */

    if (
        integration.type !==
        INTEGRATION_TYPE
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION COMPANY
    ------------------------------------------------------
    */

    if (
        integration.companyId !==
        companyId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION WIDGET
    ------------------------------------------------------
    */

    if (
        integration.widgetId !==
        widget.widgetId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    return {

        valid: true,

        code: null,

        integration

    };

}


/*
==========================================================
VERIFY PUBLIC WIDGET
==========================================================
*/

async function verifyPublicWidget(
    widget
) {

    if (
        !widget
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .NOT_FOUND

        };

    }


    /*
    ------------------------------------------------------
    COMPANY
    ------------------------------------------------------
    */

    if (
        !widget.companyId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION ID
    ------------------------------------------------------
    */

    if (
        !widget.integrationId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    GET INTEGRATION
    ------------------------------------------------------
    */

    const integration =
        await getIntegrationById(
            widget.integrationId
        );


    if (
        !integration
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .NOT_FOUND

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION TYPE
    ------------------------------------------------------
    */

    if (
        integration.type !==
        INTEGRATION_TYPE
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION COMPANY
    ------------------------------------------------------
    */

    if (
        integration.companyId !==
        widget.companyId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION WIDGET
    ------------------------------------------------------
    */

    if (
        integration.widgetId !==
        widget.widgetId
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    INTEGRATION STATUS
    ------------------------------------------------------
    */

    if (
        integration.status !==
        "active"
    ) {

        return {

            valid: false,

            code:
                PLATFORM_ERRORS
                    .PERMISSION_DENIED

        };

    }


    /*
    ------------------------------------------------------
    SUCCESS
    ------------------------------------------------------
    */

    return {

        valid: true,

        code: null,

        integration

    };

}


/*
==========================================================
GET TRANSPORTATION WIDGET CONFIGURATION
==========================================================
*/

/*
PUBLIC SERVICE

Input:

{
    widgetId
}

The company is resolved internally through:

transportationWidgets/{widgetId}
        ↓
companyId
        ↓
companies/{companyId}

The service also returns:

- company branding
- company primaryColor
- active transportation service types
- active locations
- widget appearance
*/

export async function
getTransportationWidgetConfigurationService({

    widgetId

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            typeof widgetId !==
                "string" ||
            !widgetId.trim()
        ) {

            return failure(

                PLATFORM_ERRORS
                    .VALIDATION_ERROR

            );

        }


        /*
        ==================================================
        GET WIDGET
        ==================================================
        */

        const widget =
            await getWidgetById(
                widgetId
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
        VERIFY PUBLIC WIDGET
        ==================================================
        */

        const validation =
            await verifyPublicWidget(
                widget
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
        GET ACTIVE CATALOG
        ==================================================
        */

        const [
            serviceTypes,
            locations
        ] = await Promise.all([

            getActiveCatalog(
                widget.companyId,
                FIRESTORE_COLLECTIONS
                    .SERVICE_TYPES
            ),

            getActiveCatalog(
                widget.companyId,
                FIRESTORE_COLLECTIONS
                    .LOCATIONS
            )

        ]);


        /*
        ==================================================
        TRANSPORTATION SERVICES
        ==================================================
        */

        const transportationServiceTypes =
            serviceTypes.filter(
                serviceType =>

                    serviceType.category ===
                    TRANSPORTATION_CATEGORY

            );


        /*
        ==================================================
        COMPANY BRANDING
        ==================================================
        */

        const publicCompany =
            buildPublicCompany(
                company
            );


        /*
        ==================================================
        APPEARANCE
        ==================================================
        */

        /*
        IMPORTANT:

        primaryColor always comes from the company.

        Any old primaryColor stored inside the Widget
        is intentionally ignored.
        */

        const appearance = {

            ...DEFAULT_WIDGET_APPEARANCE,

            ...(widget.appearance || {}),

            primaryColor:
                publicCompany.primaryColor

        };


        /*
        ==================================================
        PUBLIC SERVICE TYPES
        ==================================================
        */

        const publicServiceTypes =
            buildPublicServiceTypes(
                transportationServiceTypes
            );


        /*
        ==================================================
        PUBLIC LOCATIONS
        ==================================================
        */

        const publicLocations =
            buildPublicLocations(
                locations
            );


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            widgetId:
                widget.widgetId,

            companyId:
                widget.companyId,

            integrationId:
                widget.integrationId,

            type:
                widget.type,

            status:
                widget.status,

            company:
                publicCompany,

            appearance,

            serviceTypes:
                publicServiceTypes,

            locations:
                publicLocations

        });

    }

    catch (error) {

        console.error(
            "getTransportationWidgetConfigurationService error:",
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
UPDATE TRANSPORTATION WIDGET APPEARANCE
==========================================================
*/

/*
ADMINISTRATIVE SERVICE

The following values belong to the Widget:

- backgroundColor
- textColor
- fieldBackgroundColor
- borderRadius
- fontFamily
- buttonStyle

primaryColor does NOT belong here.

It is inherited from the company.
*/

export async function
updateTransportationWidgetAppearanceService({

    companyId,

    widgetId,

    appearance

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            !companyId ||
            typeof widgetId !==
                "string" ||
            !widgetId.trim()
        ) {

            return failure(

                PLATFORM_ERRORS
                    .VALIDATION_ERROR

            );

        }


        /*
        ==================================================
        VALIDATE APPEARANCE
        ==================================================
        */

        const appearanceValidation =
            validateAppearance(
                appearance
            );


        if (
            !appearanceValidation.valid
        ) {

            return failure(
                appearanceValidation.code
            );

        }


        /*
        ==================================================
        GET WIDGET
        ==================================================
        */

        const widget =
            await getWidgetById(
                widgetId
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
        VERIFY OWNERSHIP
        ==================================================
        */

        const ownership =
            await verifyWidgetOwnership({

                widget,

                companyId

            });


        if (
            !ownership.valid
        ) {

            return failure(
                ownership.code
            );

        }


        /*
        ==================================================
        STATUS
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
        NORMALIZE APPEARANCE
        ==================================================
        */

        const normalizedAppearance = {

            backgroundColor:
                normalizeColor(
                    appearance.backgroundColor,
                    DEFAULT_WIDGET_APPEARANCE
                        .backgroundColor
                ),

            textColor:
                normalizeColor(
                    appearance.textColor,
                    DEFAULT_WIDGET_APPEARANCE
                        .textColor
                ),

            fieldBackgroundColor:
                normalizeColor(
                    appearance.fieldBackgroundColor,
                    DEFAULT_WIDGET_APPEARANCE
                        .fieldBackgroundColor
                ),

            borderRadius:
                Number(
                    appearance.borderRadius
                ),

            fontFamily:
                appearance.fontFamily,

            buttonStyle:
                appearance.buttonStyle

        };


        /*
        ==================================================
        UPDATE FIRESTORE
        ==================================================
        */

        await widget.ref.update({

            appearance:
                normalizedAppearance,

            updatedAt:
                new Date()

        });


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            widgetId:
                widget.widgetId,

            companyId:
                widget.companyId,

            appearance:
                normalizedAppearance

        });

    }

    catch (error) {

        console.error(
            "updateTransportationWidgetAppearanceService error:",
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

    getTransportationWidgetConfigurationService,

    updateTransportationWidgetAppearanceService

};