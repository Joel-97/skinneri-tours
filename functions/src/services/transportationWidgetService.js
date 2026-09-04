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


/*
==========================================================
DEFAULT APPEARANCE
==========================================================
*/

const DEFAULT_WIDGET_APPEARANCE =
    Object.freeze({

        primaryColor:
            "#2563EB",

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
    COLORS
    ------------------------------------------------------
    */

    const colorFields = [

        "primaryColor",

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
GET TRANSPORTATION WIDGET CONFIGURATION
==========================================================
*/

export async function
getTransportationWidgetConfigurationService({

    companyId,

    widgetId

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
        APPEARANCE
        ==================================================
        */

        const appearance = {

            ...DEFAULT_WIDGET_APPEARANCE,

            ...(widget.appearance || {})

        };


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

            appearance

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

            primaryColor:
                normalizeColor(
                    appearance.primaryColor,
                    DEFAULT_WIDGET_APPEARANCE
                        .primaryColor
                ),

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