/*
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import { db } from "../firebase/admin.js";

import {
    success,
    created,
    failure
} from "../utils/serviceResult.js";

import FIRESTORE_COLLECTIONS
    from "../constants/firestoreCollections.js";

import ACCESS_REQUEST_STATUS
    from "../constants/accessRequestStatus.js";

import ACCESS_REQUEST_ERRORS
    from "../constants/errors/accessRequestErrors.js";

import PLATFORM_ERRORS
    from "../constants/errors/platformErrors.js";

/*
==========================================================
CHECK DUPLICATE REQUEST
==========================================================
*/

async function existsPendingAccessRequest(email) {

    const snapshot = await db

        .collection(

            FIRESTORE_COLLECTIONS.ACCESS_REQUESTS

        )

        .where(

            "email",

            "==",

            email

        )

        .where(

            "status",

            "==",

            ACCESS_REQUEST_STATUS.PENDING

        )

        .limit(1)

        .get();

    return !snapshot.empty;

}

/*
==========================================================
BUILD ACCESS REQUEST DOCUMENT
==========================================================
*/

function buildAccessRequestDocument(request) {

    const timestamp = new Date();

    return {

        displayName:

            request.displayName.trim(),

        email:

            request.email.trim().toLowerCase(),

        companyId:

            null,

        status:

            ACCESS_REQUEST_STATUS.PENDING,

        approvedAt:

            null,

        approvedBy:

            null,

        rejectedAt:

            null,

        rejectedBy:

            null,

        requestedAt:

            timestamp,

        createdAt:

            timestamp,

        updatedAt:

            timestamp

    };

}

/*
==========================================================
MAP ACCESS REQUEST
==========================================================
*/

function mapAccessRequest(document) {

    const data = document.data();

    /*
    ======================================================
    FORMAT TIMESTAMP
    ======================================================
    */

    const toISOString = (value) => {

        if (!value) {

            return null;

        }

        if (

            typeof value.toDate === "function"

        ) {

            return value

                .toDate()

                .toISOString();

        }

        if (

            value instanceof Date

        ) {

            return value

                .toISOString();

        }

        return value;

    };

    return {

        id:

            document.id,

        displayName:

            data.displayName,

        email:

            data.email,

        companyId:

            data.companyId,

        status:

            data.status,

        requestedAt:

            toISOString(

                data.requestedAt

            ),

        approvedAt:

            toISOString(

                data.approvedAt

            ),

        approvedBy:

            data.approvedBy,

        rejectedAt:

            toISOString(

                data.rejectedAt

            ),

        rejectedBy:

            data.rejectedBy,

        createdAt:

            toISOString(

                data.createdAt

            ),

        updatedAt:

            toISOString(

                data.updatedAt

            )

    };

}

/*
==========================================================
GET ACCESS REQUESTS
==========================================================
*/

async function getAccessRequests(filters = {}) {

    const {

        status = null

    } = filters;

    let query = db

        .collection(

            FIRESTORE_COLLECTIONS.ACCESS_REQUESTS

        );

    /*
    ======================================================
    STATUS
    ======================================================
    */

    if (

        status != null &&

        status !== "all"

    ) {

        query = query.where(

            "status",

            "==",

            status

        );

    }

    /*
    ======================================================
    ORDER
    ======================================================
    */

    const snapshot = await query

        .orderBy(

            "createdAt",

            "desc"

        )

        .get();

    return snapshot.docs.map(

        mapAccessRequest

    );

}

/*
==========================================================
CREATE ACCESS REQUEST DOCUMENT
==========================================================
*/

async function createAccessRequestDocument(

    accessRequestDocument

) {

    const reference = await db

        .collection(

            FIRESTORE_COLLECTIONS.ACCESS_REQUESTS

        )

        .add(

            accessRequestDocument

        );

    return reference.id;

}

/*
==========================================================
CREATE ACCESS REQUEST
==========================================================
*/

export async function createAccessRequestService(request) {

    try {

        /*
        ======================================================
        DUPLICATE REQUEST
        ======================================================
        */

        const exists = await existsPendingAccessRequest(

            request.email

        );

        if (exists) {

            return failure(

                ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_ALREADY_EXISTS

            );

        }

        /*
        ======================================================
        BUILD DOCUMENT
        ======================================================
        */

        const accessRequestDocument =

            buildAccessRequestDocument(

                request

            );

        /*
        ======================================================
        CREATE DOCUMENT
        ======================================================
        */

        const accessRequestId =

            await createAccessRequestDocument(

                accessRequestDocument

            );

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return created(

            accessRequestId

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
GET ACCESS REQUESTS
==========================================================
*/

export async function getAccessRequestsService(

    filters = {}

) {

    try {

        const requests =

            await getAccessRequests(

                filters

            );

        return success(

            requests

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
GET ACCESS REQUEST
==========================================================
*/

export async function getAccessRequestService(

    requestId

) {

    try {

        const snapshot = await db

            .collection(

                FIRESTORE_COLLECTIONS.ACCESS_REQUESTS

            )

            .doc(

                requestId

            )

            .get();

        /*
        ======================================================
        NOT FOUND
        ======================================================
        */

        if (!snapshot.exists) {

            return failure(

                ACCESS_REQUEST_ERRORS.ACCESS_REQUEST_NOT_FOUND

            );

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success(

            mapAccessRequest(

                snapshot

            )

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
UPDATE ACCESS REQUEST STATUS
==========================================================
*/

export async function updateAccessRequestStatusService(

    requestId,

    status,

    performedBy,

    companyId = null

) {

    try {

        const timestamp = new Date();

        const updateData = {

            status,

            updatedAt: timestamp

        };

        /*
        ======================================================
        APPROVED
        ======================================================
        */

        if (

            status ===

            ACCESS_REQUEST_STATUS.APPROVED

        ) {

            updateData.companyId = companyId;

            updateData.approvedBy = performedBy;

            updateData.approvedAt = timestamp;

        }

        /*
        ======================================================
        REJECTED
        ======================================================
        */

        if (

            status ===

            ACCESS_REQUEST_STATUS.REJECTED

        ) {

            updateData.rejectedBy = performedBy;

            updateData.rejectedAt = timestamp;

        }

        await db

            .collection(

                FIRESTORE_COLLECTIONS.ACCESS_REQUESTS

            )

            .doc(

                requestId

            )

            .update(

                updateData

            );

        /*
        ======================================================
        RESULT
        ======================================================
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