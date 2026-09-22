import { db, admin } from "../firebase/admin.js";

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


/* ==========================================================
   COLLECTION
   ========================================================== */

const companiesCollection = () =>
    db.collection(
        FIRESTORE_COLLECTIONS.COMPANIES
    );


/* ==========================================================
   HELPERS
   ========================================================== */

const normalize = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase();


const isValidCompanyId = (companyId) =>
    Boolean(
        normalize(companyId)
    );


const isValidCompany = (company) =>
    Boolean(
        company &&
        normalize(company.name)
    );


const logFirestoreError = (
    operation,
    error
) => {

    console.error(
        `[companyService] ${operation}`,
        {
            code:
                error?.code ?? null,

            message:
                error?.message ?? null,

            details:
                error?.details ?? null,

            status:
                error?.status ?? null,

            projectId:
                admin
                    ?.app()
                    ?.options
                    ?.projectId ?? null
        }
    );
};


/* ==========================================================
   CHECK DUPLICATE
   ========================================================== */

async function existsCompany(
    companyName
) {

    const name =
        normalize(companyName);

    if (!name) {
        return false;
    }

    const snapshot =
        await companiesCollection()
            .where(
                "name",
                "==",
                name
            )
            .limit(1)
            .get();

    return !snapshot.empty;
}


/* ==========================================================
   BUILD DOCUMENT
   ========================================================== */

const buildCompanyDocument = (
    company
) => {

    const timestamp =
        new Date();

    return {

        name:
            normalize(
                company.name
            ),

        enabledModules:
            company.enabledModules ||
            {},

        status:
            COMPANY_STATUS.ACTIVE,

        createdAt:
            timestamp,

        updatedAt:
            timestamp
    };
};


/* ==========================================================
   CREATE COMPANY
   ========================================================== */

export async function createCompanyService(
    company
) {

    try {

        if (
            !isValidCompany(
                company
            )
        ) {

            return failure(
                PLATFORM_ERRORS.INVALID_DATA
            );
        }


        const exists =
            await existsCompany(
                company.name
            );


        if (exists) {

            return failure(
                PLATFORM_ERRORS.COMPANY_ALREADY_EXISTS
            );
        }


        const reference =
            await companiesCollection()
                .add(
                    buildCompanyDocument(
                        company
                    )
                );


        return created(
            reference.id
        );

    } catch (error) {

        logFirestoreError(
            "createCompanyService",
            error
        );

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );
    }
}


/* ==========================================================
   DELETE COMPANY
   ========================================================== */

export async function deleteCompanyService(
    companyId
) {

    try {

        if (
            !isValidCompanyId(
                companyId
            )
        ) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );
        }


        const reference =
            companiesCollection()
                .doc(
                    companyId
                );


        const document =
            await reference.get();


        if (!document.exists) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );
        }


        await reference.delete();


        return success();

    } catch (error) {

        logFirestoreError(
            "deleteCompanyService",
            error
        );

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );
    }
}


/* ==========================================================
   GET COMPANY
   ========================================================== */

export async function getCompanyService(
    companyId
) {

    try {

        if (
            !isValidCompanyId(
                companyId
            )
        ) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );
        }


        const document =
            await companiesCollection()
                .doc(
                    companyId
                )
                .get();


        if (!document.exists) {

            return failure(
                PLATFORM_ERRORS.NOT_FOUND
            );
        }


        return success({

            id:
                document.id,

            ...document.data()

        });

    } catch (error) {

        logFirestoreError(
            "getCompanyService",
            error
        );

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );
    }
}