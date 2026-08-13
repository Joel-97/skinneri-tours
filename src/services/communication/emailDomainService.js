/**
 * ==========================================================
 * EMAIL DOMAIN SERVICE
 * ==========================================================
 */

import {
    getFunctions,
    httpsCallable
} from "firebase/functions";

import {
    app
} from "../../firebase";


/**
 * ==========================================================
 * FIREBASE FUNCTIONS
 * ==========================================================
 */

const functions = getFunctions(
    app,
    "us-central1"
);


/**
 * ==========================================================
 * CREATE EMAIL DOMAIN
 * ==========================================================
 */

export async function createEmailDomain(
    domain
) {

    if (!domain) {

        const error =

            new Error(
                "domain_required"
            );

        error.code =
            "domain_required";

        throw error;

    }


    const createEmailDomainFunction =

        httpsCallable(
            functions,
            "createEmailDomain"
        );


    const result =

        await createEmailDomainFunction({

            domain

        });

    return result.data;

}


/**
 * ==========================================================
 * GET EMAIL DOMAIN STATUS
 * ==========================================================
 */

export async function getEmailDomainStatus() {

    const getEmailDomainStatusFunction =

        httpsCallable(
            functions,
            "getEmailDomainStatus"
        );


    const result =

        await getEmailDomainStatusFunction();


    return result.data;

}


/**
 * ==========================================================
 * VERIFY EMAIL DOMAIN
 * ==========================================================
 */

export async function verifyEmailDomain() {

    const verifyEmailDomainFunction =

        httpsCallable(
            functions,
            "verifyEmailDomain"
        );


    const result =

        await verifyEmailDomainFunction();


    return result.data;

}