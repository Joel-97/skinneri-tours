/**
 * ==========================================================
 * EMAIL DOMAIN SERVICE
 * ==========================================================
 */

import {
    db
} from "../../firebase/admin.js";

import {
    success,
    failure
} from "../../utils/serviceResult.js";

import {
    getResendClient
} from "../clients/resendClient.js";

import {
    getUserService
} from "../../services/userService.js";

import {
    getCompanyService
} from "../../services/companyService.js";

import FIRESTORE_COLLECTIONS
from "../../constants/firestoreCollections.js";

import PLATFORM_ERRORS
from "../../constants/errors/platformErrors.js";


/*
============================================================
NORMALIZE DOMAIN
============================================================
*/

function normalizeDomain(
    domain
) {

    if (!domain) {

        return "";

    }

    return domain

        .trim()

        .toLowerCase()

        .replace(
            /^https?:\/\//,
            ""
        )

        .replace(
            /^www\./,
            ""
        )

        .replace(
            /\/$/,
            ""
        );

}


/*
============================================================
GET COMPANY ID FROM USER
============================================================
*/

async function getCompanyId(
    userId
) {

    if (!userId) {

        return failure(

            PLATFORM_ERRORS.USER_NOT_FOUND

        );

    }


    const userResult =

        await getUserService(

            userId

        );


    if (

        !userResult.success

    ) {

        return userResult;

    }


    const user =

        userResult.data;


    if (!user.companyId) {

        return failure(

            "company_required"

        );

    }


    return success({

        companyId:

            user.companyId

    });

}


/*
============================================================
GET COMPANY
============================================================
*/

async function getCompany(
    companyId
) {

    const companyResult =

        await getCompanyService(

            companyId

        );


    if (

        !companyResult.success

    ) {

        return companyResult;

    }


    return success(

        companyResult.data

    );

}


/*
============================================================
GET EMAIL SETTINGS
============================================================
*/

function getEmailSettings(
    company
) {

    return (

        company?.emailSettings ||

        {}

    );

}


/*
============================================================
BUILD DNS RECORDS
============================================================
*/

function buildDnsRecords(
    records = []
) {

    if (

        !Array.isArray(records)

    ) {

        return [];

    }


    return records

        .map(

            record => ({

                record:

                    record?.record ??

                    null,

                name:

                    record?.name ??

                    null,

                type:

                    record?.type ??

                    null,

                value:

                    record?.value ??

                    null,

                ttl:

                    record?.ttl ??

                    null,

                priority:

                    record?.priority ??

                    null,

                status:

                    record?.status ??

                    "not_started"

            })

        )

        .filter(

            record =>

                record.name &&

                record.type &&

                record.value

        );

}


/*
============================================================
UPDATE EMAIL SETTINGS
============================================================
*/

async function updateEmailSettings(
    companyId,
    emailSettings
) {

    if (!companyId) {

        throw new Error(
            "companyId is required."
        );

    }

    if (!emailSettings) {

        throw new Error(
            "emailSettings is required."
        );

    }


    /*
    ======================================================
    UPDATE
    ======================================================
    */

    await db

        .collection(
            FIRESTORE_COLLECTIONS.COMPANIES
        )

        .doc(
            companyId
        )

        .update({

            emailSettings

        });


    /*
    ======================================================
    READ AFTER UPDATE
    ======================================================
    */

    const updatedDocument =

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
    VERIFY DOCUMENT
    ======================================================
    */

    if (
        !updatedDocument.exists
    ) {

        throw new Error(
            "Company document not found after update."
        );

    }

    const updatedData =
        updatedDocument.data();

}


/*
============================================================
GET FULL RESEND DOMAIN
============================================================
*/

async function getFullResendDomain(
    resend,
    domainId
) {

    if (!domainId) {

        return failure(
            "resend_domain_id_missing"
        );

    }


    const {
        data,
        error
    } = await resend.domains.get(
        domainId
    );


    if (error) {

        return failure(
            error.message
        );

    }


    if (!data) {

        return failure(
            "resend_domain_not_found"
        );

    }


    return success(
        data
    );

}


/*
============================================================
FIND EXISTING RESEND DOMAIN
============================================================
*/

async function findResendDomain(
    resend,
    normalizedDomain
) {

    const {

        data,

        error

    } = await resend.domains.list();


    if (error) {

        return failure(

            error.message

        );

    }


    const domains =

        Array.isArray(data?.data)

            ? data.data

            : [];


    const existingDomain =

        domains.find(

            item =>

                normalizeDomain(

                    item?.name

                ) === normalizedDomain

        );


    if (!existingDomain) {

        return success(

            null

        );

    }


    /*
    ======================================================
    GET FULL DOMAIN DETAILS
    ======================================================
    */

    return (

        await getFullResendDomain(

            resend,

            existingDomain.id

        )

    );

}


/*
============================================================
CREATE EMAIL DOMAIN
============================================================
*/

export async function createEmailDomainService({

    userId,

    domain

}) {

    try {

        /*
        ==================================================
        VALIDATION
        ==================================================
        */

        const normalizedDomain =

            normalizeDomain(

                domain

            );


        if (!normalizedDomain) {

            return failure(

                "domain_required"

            );

        }


        /*
        ==================================================
        COMPANY ID
        ==================================================
        */

        const companyIdResult =

            await getCompanyId(

                userId

            );


        if (

            !companyIdResult.success

        ) {

            return companyIdResult;

        }


        const companyId =

            companyIdResult.data.companyId;


        /*
        ==================================================
        COMPANY
        ==================================================
        */

        const companyResult =

            await getCompany(

                companyId

            );


        if (

            !companyResult.success

        ) {

            return companyResult;

        }


        const company =

            companyResult.data;


        /*
        ==================================================
        EXISTING EMAIL SETTINGS
        ==================================================
        */

        const emailSettings =

            getEmailSettings(

                company

            );


        /*
        ==================================================
        ALREADY VERIFIED LOCALLY
        ==================================================
        */

        if (

            emailSettings.domainStatus ===

            "verified" &&

            emailSettings.domain ===

            normalizedDomain

        ) {

            return success({

                domain:

                    normalizedDomain,

                status:

                    "verified",

                resendDomainId:

                    emailSettings

                        .domainVerification

                        ?.resendDomainId ||

                    null,

                records:

                    emailSettings

                        .domainVerification

                        ?.records ||

                    []

            });

        }


        /*
        ==================================================
        RESEND
        ==================================================
        */

        const resend =

            getResendClient();


        /*
        ==================================================
        FIND EXISTING DOMAIN IN RESEND
        ==================================================
        */

        let domainData =

            null;


        const existingDomainResult =

            await findResendDomain(

                resend,

                normalizedDomain

            );


        if (

            !existingDomainResult.success

        ) {

            return existingDomainResult;

        }


        domainData =

            existingDomainResult.data;


        /*
        ==================================================
        CREATE DOMAIN
        ==================================================
        */

        if (!domainData) {

            const {

                data,

                error

            } = await resend.domains.create({

                name:

                    normalizedDomain

            });


            /*
            ==================================================
            RESEND CREATE ERROR
            ==================================================
            */

            if (error) {

                /*
                ==================================================
                DOMAIN MAY HAVE BEEN CREATED CONCURRENTLY
                ==================================================
                */

                const existingDomainResultAfterError =

                    await findResendDomain(

                        resend,

                        normalizedDomain

                    );


                if (

                    existingDomainResultAfterError.success &&

                    existingDomainResultAfterError.data

                ) {

                    domainData =

                        existingDomainResultAfterError.data;

                }

                else {

                    return failure(

                        error.message

                    );

                }

            }

            else {

                /*
                ==================================================
                GET FULL DOMAIN DETAILS
                ==================================================
                */

                if (

                    data?.id

                ) {

                    const fullDomainResult =

                        await getFullResendDomain(

                            resend,

                            data.id

                        );


                    if (

                        fullDomainResult.success

                    ) {

                        domainData =

                            fullDomainResult.data;

                    }

                    else {

                        return fullDomainResult;

                    }

                }

                else {

                    /*
                    ==================================================
                    FALLBACK
                    ==================================================
                    */

                    console.warn(

                        "RESEND CREATE DOMAIN DID NOT RETURN AN ID. " +

                        "TRYING TO FIND THE DOMAIN AGAIN."

                    );


                    const retryFindResult =

                        await findResendDomain(

                            resend,

                            normalizedDomain

                        );


                    if (

                        retryFindResult.success &&

                        retryFindResult.data

                    ) {

                        domainData =

                            retryFindResult.data;

                    }

                    else {

                        return failure(

                            "resend_domain_id_missing"

                        );

                    }

                }

            }

        }


        /*
        ==================================================
        DOMAIN DATA VALIDATION
        ==================================================
        */

        if (

            !domainData?.id

        ) {

            return failure(

                "resend_domain_id_missing"

            );

        }


        /*
        ==================================================
        DNS RECORDS
        ==================================================
        */

        const records =

            buildDnsRecords(

                domainData?.records

            );


        /*
        ==================================================
        VALIDATE DNS RECORDS
        ==================================================
        */

        if (

            records.length === 0

        ) {

            return failure(

                "resend_dns_records_missing"

            );

        }

        /*
        ==================================================
        EMAIL SETTINGS
        ==================================================
        */

        const previousDomainVerification =

            emailSettings

                .domainVerification ||

            {};


        const updatedEmailSettings = {

            ...emailSettings,

            sendingMode:

                "custom_domain",

            domain:

                normalizedDomain,

            domainStatus:

                domainData?.status ||

                "pending",

            domainVerification: {

                ...previousDomainVerification,

                resendDomainId:

                    domainData.id,

                records,

                verifiedAt:

                    domainData?.status ===

                    "verified"

                        ? (

                            previousDomainVerification

                                ?.verifiedAt ||

                            new Date()

                        )

                        : null

            }

        };


        /*
        ==================================================
        SAVE
        ==================================================
        */

        await updateEmailSettings(

            companyId,

            updatedEmailSettings

        );


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            domain:

                normalizedDomain,

            status:

                domainData?.status ||

                "pending",

            resendDomainId:

                domainData.id,

            records

        });

    }

    catch (error) {

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}


/*
============================================================
GET RESEND DOMAIN STATUS
============================================================
*/

export async function getEmailDomainStatusService({

    userId

}) {

    try {

        /*
        ==================================================
        COMPANY
        ==================================================
        */

        const companyIdResult =

            await getCompanyId(

                userId

            );


        if (

            !companyIdResult.success

        ) {

            return companyIdResult;

        }


        const companyId =

            companyIdResult.data.companyId;


        /*
        ==================================================
        COMPANY
        ==================================================
        */

        const companyResult =

            await getCompany(

                companyId

            );


        if (

            !companyResult.success

        ) {

            return companyResult;

        }


        const company =

            companyResult.data;


        const emailSettings =

            getEmailSettings(

                company

            );


        /*
        ==================================================
        DOMAIN VERIFICATION
        ==================================================
        */

        const domainVerification =

            emailSettings

                .domainVerification;


        if (

            !domainVerification

                ?.resendDomainId

        ) {

            return failure(

                "email_domain_not_configured"

            );

        }


        /*
        ==================================================
        RESEND
        ==================================================
        */

        const resend =

            getResendClient();


        const {

            data,

            error

        } = await resend.domains.get(

            domainVerification

                .resendDomainId

        );


        if (error) {

            return failure(

                error.message

            );

        }


        /*
        ==================================================
        RECORDS
        ==================================================
        */

        const records =

            buildDnsRecords(

                data?.records

            );


        /*
        ==================================================
        UPDATE LOCAL STATUS
        ==================================================
        */

        const updatedEmailSettings = {

            ...emailSettings,

            domainStatus:

                data?.status ||

                emailSettings.domainStatus,

            domainVerification: {

                ...domainVerification,

                resendDomainId:

                    data?.id ||

                    domainVerification

                        .resendDomainId,

                records:

                    records.length > 0

                        ? records

                        : (

                            domainVerification

                                .records ||

                            []

                        ),

                verifiedAt:

                    data?.status ===

                    "verified"

                        ? (

                            domainVerification

                                ?.verifiedAt ||

                            new Date()

                        )

                        : null

            }

        };


        await updateEmailSettings(

            companyId,

            updatedEmailSettings

        );


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            domain:

                data?.name ||

                emailSettings.domain,

            status:

                data?.status ||

                "not_started",

            resendDomainId:

                data?.id ||

                domainVerification

                    .resendDomainId,

            records:

                records.length > 0

                    ? records

                    : (

                        domainVerification

                            .records ||

                        []

                    )

        });

    }

    catch (error) {

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}


/**
 * ==========================================================
 * VERIFY RESEND DOMAIN
 * ==========================================================
 */

export async function verifyEmailDomainService({
    userId
}) {

    try {

        /*
        ==================================================
        COMPANY ID
        ==================================================
        */

        const companyIdResult =
            await getCompanyId(
                userId
            );


        if (
            !companyIdResult.success
        ) {

            return companyIdResult;

        }


        const companyId =
            companyIdResult.data.companyId;


        /*
        ==================================================
        COMPANY
        ==================================================
        */

        const companyResult =
            await getCompany(
                companyId
            );


        if (
            !companyResult.success
        ) {

            return companyResult;

        }


        const company =
            companyResult.data;


        const emailSettings =
            getEmailSettings(
                company
            );


        /*
        ==================================================
        RESEND DOMAIN ID
        ==================================================
        */

        const domainVerification =
            emailSettings
                .domainVerification;


        const domainId =
            domainVerification
                ?.resendDomainId;


        if (!domainId) {

            return failure(
                "email_domain_not_configured"
            );

        }


        /*
        ==================================================
        RESEND
        ==================================================
        */

        const resend =
            getResendClient();


        /*
        ==================================================
        START VERIFICATION
        ==================================================
        */

        const {
            data: verifyData,
            error: verifyError
        } = await resend.domains.verify(
            domainId
        );


        /*
        ==================================================
        VERIFY ERROR
        ==================================================
        */

        if (verifyError) {

            return failure(
                verifyError.message ||
                "email_domain_verification_failed"
            );

        }

        /*
        ==================================================
        POLLING CONFIGURATION
        ==================================================
        */

        const MAX_ATTEMPTS = 5;

        const WAIT_TIME = 3000;


        /*
        ==================================================
        DOMAIN STATUS
        ==================================================
        */

        let domainData = null;

        let domainResult = null;


        /*
        ==================================================
        CHECK DOMAIN STATUS
        ==================================================
        */

        for (
            let attempt = 1;
            attempt <= MAX_ATTEMPTS;
            attempt++
        ) {

            /*
            ==================================================
            WAIT BEFORE CHECKING
            ==================================================
            */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        WAIT_TIME
                    )
            );


            /*
            ==================================================
            GET UPDATED DOMAIN
            ==================================================
            */

            domainResult =
                await getFullResendDomain(
                    resend,
                    domainId
                );


            if (
                !domainResult.success
            ) {

                return domainResult;

            }


            domainData =
                domainResult.data;

        }


        /*
        ==================================================
        SAFETY CHECK
        ==================================================
        */

        if (!domainData) {

            return failure(
                "resend_domain_not_found"
            );

        }


        /*
        ==================================================
        RECORDS
        ==================================================
        */

        const records =
            buildDnsRecords(
                domainData?.records
            );


        /*
        ==================================================
        STATUS
        ==================================================
        */

        const currentStatus =
            domainData?.status ||
            "pending";


        /*
        ==================================================
        VERIFIED AT
        ==================================================
        */

        let verifiedAt =
            domainVerification
                ?.verifiedAt ||
            null;


        if (
            currentStatus ===
                "verified" &&
            !verifiedAt
        ) {

            verifiedAt =
                new Date();

        }


        if (
            currentStatus !==
            "verified"
        ) {

            verifiedAt =
                null;

        }


        /*
        ==================================================
        LOCAL SETTINGS
        ==================================================
        */

        const updatedEmailSettings = {

            ...emailSettings,

            domainStatus:
                currentStatus,

            domainVerification: {

                ...domainVerification,

                resendDomainId:
                    domainData?.id ||
                    domainId,

                records:
                    records.length > 0
                        ? records
                        : (
                            domainVerification
                                ?.records ||
                            []
                        ),

                verifiedAt

            }

        };


        /*
        ==================================================
        SAVE
        ==================================================
        */


        await updateEmailSettings(
            companyId,
            updatedEmailSettings
        );


        /*
        ==================================================
        RESULT
        ==================================================
        */

        return success({

            domain:
                domainData?.name ||
                emailSettings.domain,

            status:
                currentStatus,

            resendDomainId:
                domainData?.id ||
                domainId,

            records:
                records.length > 0
                    ? records
                    : (
                        domainVerification
                            ?.records ||
                        []
                    ),

            verifiedAt

        });

    }

    catch (error) {

        return failure(
            PLATFORM_ERRORS.UNKNOWN_ERROR
        );

    }

}