/*
==========================================================
TRANSPORTATION INTEGRATION SERVICE
==========================================================
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


/*
==========================================================
INTEGRATION TYPE
==========================================================
*/

const INTEGRATION_TYPE = "transportation";


/*
==========================================================
COMPANY CODE CONFIGURATION
==========================================================
*/

const COMPANY_CODE_MIN_LENGTH = 3;
const COMPANY_CODE_MAX_LENGTH = 50;


/*
==========================================================
WIDGET CONFIGURATION
==========================================================
*/

const WIDGET_ID_PREFIX =
    "wgt_";

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
GENERATE WIDGET ID
==========================================================
*/

function generateWidgetId() {

    return (
        WIDGET_ID_PREFIX +
        crypto
            .randomBytes(16)
            .toString("hex")
    );

}


/*
==========================================================
GENERATE API KEY
==========================================================
*/

function generateApiKey() {

    return (
        "sk_live_" +
        crypto
            .randomBytes(32)
            .toString("hex")
    );

}


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
GET API KEY PREFIX
==========================================================
*/

function getApiKeyPrefix(apiKey) {

    return apiKey.slice(0, 16);

}


/*
==========================================================
NORMALIZE COMPANY CODE
==========================================================
*/

function normalizeCompanyCode(companyCode) {

    if (
        typeof companyCode !== "string"
    ) {

        return "";

    }

    return companyCode
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}


/*
==========================================================
VALIDATE COMPANY CODE
==========================================================
*/

function validateCompanyCode(companyCode) {

    const normalizedCode =
        normalizeCompanyCode(
            companyCode
        );

    if (!normalizedCode) {

        return {

            valid:
                false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }

    if (
        normalizedCode.length <
        COMPANY_CODE_MIN_LENGTH
    ) {

        return {

            valid:
                false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }

    if (
        normalizedCode.length >
        COMPANY_CODE_MAX_LENGTH
    ) {

        return {

            valid:
                false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }

    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
            .test(normalizedCode)
    ) {

        return {

            valid:
                false,

            code:
                PLATFORM_ERRORS
                    .VALIDATION_ERROR

        };

    }

    return {

        valid:
            true,

        code:
            normalizedCode

    };

}


/*
==========================================================
BUILD INTEGRATION DOCUMENT
==========================================================
*/

function buildIntegrationDocument({

    companyId,

    companyCode,

    apiKeyHash,

    apiKeyPrefix,

    widgetId,

    createdBy

}) {

    const timestamp =
        new Date();

    return {

        companyId,

        type:
            INTEGRATION_TYPE,

        companyCode,

        widgetId,

        apiKeyHash,

        apiKeyPrefix,

        status:
            "active",

        createdBy,

        createdAt:
            timestamp,

        updatedAt:
            timestamp

    };

}


/*
==========================================================
BUILD WIDGET DOCUMENT
==========================================================
*/

function buildWidgetDocument({

    widgetId,

    companyId,

    integrationId,

    createdBy

}) {

    const timestamp =
        new Date();

    return {

        widgetId,

        companyId,

        integrationId,

        type:
            INTEGRATION_TYPE,

        status:
            "active",

        appearance: {

            ...DEFAULT_WIDGET_APPEARANCE

        },

        createdBy,

        createdAt:
            timestamp,

        updatedAt:
            timestamp

    };

}


/*
==========================================================
GET EXISTING INTEGRATION
==========================================================
*/

async function getExistingIntegration(
    companyId
) {

    const snapshot =
        await db

            .collection(
                FIRESTORE_COLLECTIONS
                    .INTEGRATIONS
            )

            .where(
                "companyId",
                "==",
                companyId
            )

            .where(
                "type",
                "==",
                INTEGRATION_TYPE
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
GET INTEGRATION BY COMPANY CODE
==========================================================
*/

async function getIntegrationByCompanyCode(
    companyCode
) {

    const snapshot =
        await db

            .collection(
                FIRESTORE_COLLECTIONS
                    .INTEGRATIONS
            )

            .where(
                "companyCode",
                "==",
                companyCode
            )

            .where(
                "type",
                "==",
                INTEGRATION_TYPE
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
GET TRANSPORTATION INTEGRATION BY WIDGET ID
==========================================================
*/

export async function
getTransportationIntegrationByWidgetIdService({

    widgetId

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (
            typeof widgetId !== "string" ||
            !widgetId.trim()
        ) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }

        const normalizedWidgetId =
            widgetId.trim();


        /*
        ==================================================
        QUERY
        ==================================================
        */

        const snapshot =
            await db

                .collection(
                    FIRESTORE_COLLECTIONS
                        .INTEGRATIONS
                )

                .where(
                    "widgetId",
                    "==",
                    normalizedWidgetId
                )

                .where(
                    "type",
                    "==",
                    INTEGRATION_TYPE
                )

                .limit(1)

                .get();


        /*
        ==================================================
        NOT FOUND
        ==================================================
        */

        if (
            snapshot.empty
        ) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        const document =
            snapshot.docs[0];

        return success({

            id:
                document.id,

            ...document.data()

        });

    }

    catch (error) {

        console.error(error);

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}


/*
==========================================================
CREATE TRANSPORTATION INTEGRATION
==========================================================
*/

export async function
createTransportationIntegrationService({

    companyId,

    uid,

    companyCode

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!companyId) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        VALIDATE COMPANY CODE
        ==================================================
        */

        const companyCodeValidation =
            validateCompanyCode(
                companyCode
            );

        if (
            !companyCodeValidation.valid
        ) {

            return failure(
                companyCodeValidation.code
            );

        }

        const normalizedCompanyCode =
            companyCodeValidation.code;


        /*
        ==================================================
        CHECK EXISTING COMPANY INTEGRATION
        ==================================================
        */

        const existing =
            await getExistingIntegration(
                companyId
            );

        if (existing) {

            return failure(
                PLATFORM_ERRORS
                    .INTEGRATION_ALREADY_EXISTS
            );

        }


        /*
        ==================================================
        CHECK COMPANY CODE UNIQUENESS
        ==================================================
        */

        const existingCompanyCode =
            await getIntegrationByCompanyCode(
                normalizedCompanyCode
            );

        if (
            existingCompanyCode
        ) {

            return failure(
                PLATFORM_ERRORS
                    .INTEGRATION_ALREADY_EXISTS
            );

        }


        /*
        ==================================================
        GENERATE API KEY
        ==================================================
        */

        const apiKey =
            generateApiKey();

        const apiKeyHash =
            hashApiKey(
                apiKey
            );

        const apiKeyPrefix =
            getApiKeyPrefix(
                apiKey
            );


        /*
        ==================================================
        GENERATE WIDGET ID
        ==================================================
        */

        const widgetId =
            generateWidgetId();


        /*
        ==================================================
        BUILD INTEGRATION DOCUMENT
        ==================================================
        */

        const integrationReference =
            db

                .collection(
                    FIRESTORE_COLLECTIONS
                        .INTEGRATIONS
                )

                .doc();

        const integrationDocument =
            buildIntegrationDocument({

                companyId,

                companyCode:
                    normalizedCompanyCode,

                apiKeyHash,

                apiKeyPrefix,

                widgetId,

                createdBy:
                    uid

            });


        /*
        ==================================================
        BUILD WIDGET DOCUMENT
        ==================================================
        */

        /*
        The widget uses its public ID as
        its Firestore document ID.
        */

        const widgetReference =
            db

                .collection(
                    FIRESTORE_COLLECTIONS
                        .TRANSPORTATION_WIDGETS
                )

                .doc(
                    widgetId
                );

        const widgetDocument =
            buildWidgetDocument({

                widgetId,

                companyId,

                integrationId:
                    integrationReference.id,

                createdBy:
                    uid

            });


        /*
        ==================================================
        SAVE INTEGRATION + WIDGET
        ==================================================
        */

        /*
        Both documents are created in the same
        Firestore batch.

        This prevents creating an integration
        without its corresponding widget.
        */

        const batch =
            db.batch();

        batch.set(
            integrationReference,
            integrationDocument
        );

        batch.set(
            widgetReference,
            widgetDocument
        );

        await batch.commit();


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return created({

            id:
                integrationReference.id,

            type:
                INTEGRATION_TYPE,

            companyCode:
                normalizedCompanyCode,

            widgetId,

            status:
                "active",

            apiKey

        });

    }

    catch (error) {

        console.error(error);

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}


/*
==========================================================
MIGRATE TRANSPORTATION INTEGRATION WIDGET
==========================================================
*/

export async function
migrateTransportationIntegrationWidgetService({

    companyId,

    uid

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!companyId) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        RUN TRANSACTION
        ==================================================
        */

        const result =
            await db.runTransaction(
                async (transaction) => {

                    /*
                    ==========================================
                    GET EXISTING INTEGRATION
                    ==========================================
                    */

                    const integrationQuery =
                        db

                            .collection(
                                FIRESTORE_COLLECTIONS
                                    .INTEGRATIONS
                            )

                            .where(
                                "companyId",
                                "==",
                                companyId
                            )

                            .where(
                                "type",
                                "==",
                                INTEGRATION_TYPE
                            )

                            .limit(1);


                    const integrationSnapshot =
                        await transaction.get(
                            integrationQuery
                        );


                    /*
                    ==========================================
                    INTEGRATION NOT FOUND
                    ==========================================
                    */

                    if (
                        integrationSnapshot.empty
                    ) {

                        return {

                            found:
                                false

                        };

                    }


                    /*
                    ==========================================
                    GET INTEGRATION
                    ==========================================
                    */

                    const integrationDocument =
                        integrationSnapshot.docs[0];

                    const integrationId =
                        integrationDocument.id;

                    const integrationData =
                        integrationDocument.data();


                    /*
                    ==========================================
                    EXISTING WIDGET ID
                    ==========================================
                    */

                    const existingWidgetId =
                        typeof integrationData.widgetId === "string"
                            ? integrationData.widgetId.trim()
                            : "";


                    /*
                    ==========================================
                    GENERATE WIDGET ID IF NECESSARY
                    ==========================================
                    */

                    const widgetId =
                        existingWidgetId ||
                        generateWidgetId();


                    /*
                    ==========================================
                    WIDGET REFERENCE
                    ==========================================
                    */

                    const widgetReference =
                        db

                            .collection(
                                FIRESTORE_COLLECTIONS
                                    .TRANSPORTATION_WIDGETS
                            )

                            .doc(
                                widgetId
                            );


                    /*
                    ==========================================
                    GET EXISTING WIDGET
                    ==========================================
                    */

                    const widgetDocument =
                        await transaction.get(
                            widgetReference
                        );


                    /*
                    ==========================================
                    CREATE WIDGET
                    ==========================================
                    */

                    if (
                        !widgetDocument.exists
                    ) {

                        const widgetDocumentData =
                            buildWidgetDocument({

                                widgetId,

                                companyId,

                                integrationId,

                                createdBy:
                                    uid ||
                                    integrationData.createdBy ||
                                    null

                            });


                        transaction.set(
                            widgetReference,
                            widgetDocumentData
                        );

                    }
                    else {

                        /*
                        ======================================
                        VALIDATE EXISTING WIDGET
                        ======================================
                        */

                        const existingWidgetData =
                            widgetDocument.data();


                        if (
                            existingWidgetData.companyId !==
                                companyId ||
                            existingWidgetData.integrationId !==
                                integrationId
                        ) {

                            throw new Error(
                                "The existing transportation widget does not belong to this integration."
                            );

                        }

                    }


                    /*
                    ==========================================
                    UPDATE INTEGRATION WITH WIDGET ID
                    ==========================================
                    */

                    const integrationUpdated =
                        existingWidgetId !== widgetId;


                    if (
                        integrationUpdated
                    ) {

                        transaction.update(
                            integrationDocument.ref,
                            {

                                widgetId,

                                updatedAt:
                                    new Date()

                            }
                        );

                    }


                    /*
                    ==========================================
                    TRANSACTION RESULT
                    ==========================================
                    */

                    return {

                        found:
                            true,

                        integrationId,

                        widgetId,

                        widgetCreated:
                            !widgetDocument.exists,

                        integrationUpdated

                    };

                }
            );


        /*
        ==================================================
        INTEGRATION NOT FOUND
        ==================================================
        */

        if (
            !result.found
        ) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            integrationId:
                result.integrationId,

            widgetId:
                result.widgetId,

            widgetCreated:
                result.widgetCreated,

            integrationUpdated:
                result.integrationUpdated

        });

    }

    catch (error) {

        console.error(error);

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}


/*
==========================================================
ROTATE TRANSPORTATION INTEGRATION API KEY
==========================================================
*/

export async function
rotateTransportationIntegrationApiKeyService({

    companyId

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!companyId) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        GET EXISTING INTEGRATION
        ==================================================
        */

        const integration =
            await getExistingIntegration(
                companyId
            );

        if (!integration) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        GENERATE NEW API KEY
        ==================================================
        */

        const apiKey =
            generateApiKey();

        const apiKeyHash =
            hashApiKey(
                apiKey
            );

        const apiKeyPrefix =
            getApiKeyPrefix(
                apiKey
            );


        /*
        ==================================================
        UPDATE CREDENTIALS
        ==================================================

        The previous API key becomes invalid immediately
        because only the new hash remains stored.
        ==================================================
        */

        await db

            .collection(
                FIRESTORE_COLLECTIONS
                    .INTEGRATIONS
            )

            .doc(
                integration.id
            )

            .update({

                apiKeyHash,

                apiKeyPrefix,

                updatedAt:
                    new Date()

            });


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            id:
                integration.id,

            type:
                integration.type,

            companyCode:
                integration.companyCode ||
                null,

            widgetId:
                integration.widgetId ||
                null,

            status:
                integration.status,

            apiKeyPrefix,

            apiKey

        });

    }

    catch (error) {

        console.error(error);

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}


/*
==========================================================
GET TRANSPORTATION INTEGRATION
==========================================================
*/

export async function
getTransportationIntegrationService({

    companyId

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!companyId) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        GET INTEGRATION
        ==================================================
        */

        const integration =
            await getExistingIntegration(
                companyId
            );

        if (!integration) {

            return success({

                exists:
                    false

            });

        }


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            exists:
                true,

            id:
                integration.id,

            type:
                integration.type,

            companyCode:
                integration.companyCode ||
                null,

            widgetId:
                integration.widgetId ||
                null,

            status:
                integration.status,

            apiKeyPrefix:
                integration.apiKeyPrefix,

            createdAt:
                integration.createdAt,

            updatedAt:
                integration.updatedAt

        });

    }

    catch (error) {

        console.error(error);

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}


/*
==========================================================
UPDATE INTEGRATION COMPANY CODE
==========================================================
*/

export async function
updateTransportationIntegrationCompanyCodeService({

    companyId,

    companyCode

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!companyId) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        VALIDATE COMPANY CODE
        ==================================================
        */

        const companyCodeValidation =
            validateCompanyCode(
                companyCode
            );

        if (
            !companyCodeValidation.valid
        ) {

            return failure(
                companyCodeValidation.code
            );

        }

        const normalizedCompanyCode =
            companyCodeValidation.code;


        /*
        ==================================================
        GET EXISTING INTEGRATION
        ==================================================
        */

        const integration =
            await getExistingIntegration(
                companyId
            );

        if (!integration) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        CHECK COMPANY CODE UNIQUENESS
        ==================================================
        */

        const existingCompanyCode =
            await getIntegrationByCompanyCode(
                normalizedCompanyCode
            );

        if (
            existingCompanyCode &&
            existingCompanyCode.id !==
                integration.id
        ) {

            return failure(
                PLATFORM_ERRORS
                    .INTEGRATION_ALREADY_EXISTS
            );

        }


        /*
        ==================================================
        UPDATE
        ==================================================
        */

        await db

            .collection(
                FIRESTORE_COLLECTIONS
                    .INTEGRATIONS
            )

            .doc(
                integration.id
            )

            .update({

                companyCode:
                    normalizedCompanyCode,

                updatedAt:
                    new Date()

            });


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            companyCode:
                normalizedCompanyCode

        });

    }

    catch (error) {

        console.error(error);

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}


/*
==========================================================
UPDATE INTEGRATION STATUS
==========================================================
*/

export async function
updateTransportationIntegrationStatusService({

    companyId,

    status

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        if (!companyId) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        GET EXISTING INTEGRATION
        ==================================================
        */

        const integration =
            await getExistingIntegration(
                companyId
            );

        if (!integration) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );

        }


        /*
        ==================================================
        UPDATE
        ==================================================
        */

        await db

            .collection(
                FIRESTORE_COLLECTIONS
                    .INTEGRATIONS
            )

            .doc(
                integration.id
            )

            .update({

                status,

                updatedAt:
                    new Date()

            });


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success();

    }

    catch (error) {

        console.error(error);

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}