/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import { db } from "../firebase/admin.js";

import {
    created,
    success,
    failure
} from "../utils/serviceResult.js";

import FIRESTORE_COLLECTIONS
    from "../constants/firestoreCollections.js";

import COMPANY_STATUS
    from "../constants/companyStatus.js";

import PLATFORM_ERRORS
    from "../constants/errors/platformErrors.js";

/*
==========================================================
NORMALIZE
==========================================================
*/

function normalize(value) {

    return value

        .trim()

        .toLowerCase();

}

/*
==========================================================
CHECK DUPLICATE COMPANY
==========================================================
*/

async function existsCompany(
    companyName
) {

    const snapshot = await db

        .collection(

            FIRESTORE_COLLECTIONS.COMPANIES

        )

        .where(

            "name",

            "==",

            normalize(companyName)

        )

        .limit(1)

        .get();

    return !snapshot.empty;

}

/*
==========================================================
BUILD COMPANY DOCUMENT
==========================================================
*/

function buildCompanyDocument(
    company
) {

    const timestamp = new Date();

    return {

        name:

            normalize(company.name),

        enabledModules:

            company.enabledModules,

        status:

            COMPANY_STATUS.ACTIVE,

        createdAt:

            timestamp,

        updatedAt:

            timestamp

    };

}

/*
==========================================================
CREATE COMPANY DOCUMENT
==========================================================
*/

async function createCompanyDocument(
    companyDocument
) {

    const reference = await db

        .collection(

            FIRESTORE_COLLECTIONS.COMPANIES

        )

        .add(

            companyDocument

        );

    return reference.id;

}

/*
==========================================================
CREATE COMPANY
==========================================================
*/

export async function createCompanyService(
    company
) {

    try {

        /*
        ======================================================
        DUPLICATE COMPANY
        ======================================================
        */

        const exists = await existsCompany(

            company.name

        );

        if (exists) {

            return failure(

                PLATFORM_ERRORS.COMPANY_ALREADY_EXISTS

            );

        }

        /*
        ======================================================
        BUILD DOCUMENT
        ======================================================
        */

        const companyDocument =

            buildCompanyDocument(

                company

            );

        /*
        ======================================================
        CREATE DOCUMENT
        ======================================================
        */

        const companyId =

            await createCompanyDocument(

                companyDocument

            );

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return created(

            companyId

        );

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
DELETE COMPANY
==========================================================
*/

export async function deleteCompanyService(
    companyId
) {

    try {

        await db

            .collection(

                FIRESTORE_COLLECTIONS.COMPANIES

            )

            .doc(

                companyId

            )

            .delete();

        return success();

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
GET COMPANY
==========================================================
*/

export async function getCompanyService(

    companyId

) {

    try {

        /*
        ======================================================
        DOCUMENT
        ======================================================
        */

        const document =

            await db

                .collection(

                    FIRESTORE_COLLECTIONS.COMPANIES

                )

                .doc(

                    companyId

                )

                .get();

        /*
        ======================================================
        NOT FOUND
        ======================================================
        */

        if (

            !document.exists

        ) {

            return failure(

                PLATFORM_ERRORS.NOT_FOUND

            );

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

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