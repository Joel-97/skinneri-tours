/*
==========================================================
IMPORTS
==========================================================
*/

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../firebase";

import { FIRESTORE_COLLECTIONS } from "../../constants/shared/firestoreCollections";

import { ACCESS_REQUEST_STATUS } from "../../constants/platform/accessRequestStatus";

import PLATFORM_ERRORS from "../../constants/errors/platformErrors";

import {
  success,
  created,
  failure,
  notFound
} from "../../utils/serviceResult";

import {
  validateAccessRequest
} from "../../validators/platform/accessRequestValidator";

import {
  callCloudFunction
} from "../cloud/cloudFunctionService";

import {
  createCompany
} from "./companyService";

import {
  createUser
} from "./userService";

/*
==========================================================
PRIVATE HELPERS
==========================================================
*/

function getAccessRequestReference(requestId) {

  return doc(

    db,

    FIRESTORE_COLLECTIONS.ACCESS_REQUESTS,

    requestId

  );

}

async function updateAccessRequestDocument(
  requestId,
  data
) {

  await updateDoc(

    getAccessRequestReference(requestId),

    {

      ...data,

      updatedAt: serverTimestamp()

    }

  );

}

/*
==========================================================
CREATE ACCESS REQUEST
==========================================================
*/

export async function createAccessRequest(request) {

  try {

    return await callCloudFunction(

      "createAccessRequest",

      request

    );

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}

/*
==========================================================
GET ACCESS REQUESTS
==========================================================
*/

export async function getAccessRequests() {

  try {

    const requestQuery = query(

      collection(

        db,

        FIRESTORE_COLLECTIONS.ACCESS_REQUESTS

      ),

      orderBy(

        "requestedAt",

        "desc"

      )

    );

    const snapshot = await getDocs(

      requestQuery

    );

    const requests = snapshot.docs.map(document => ({

      id: document.id,

      ...document.data()

    }));

    return success(

      requests

    );

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}

/*
==========================================================
GET PENDING ACCESS REQUESTS
==========================================================
*/

export async function getPendingAccessRequests() {

  try {

    const requestQuery = query(

      collection(

        db,

        FIRESTORE_COLLECTIONS.ACCESS_REQUESTS

      ),

      where(

        "status",

        "==",

        ACCESS_REQUEST_STATUS.PENDING.id

      ),

      orderBy(

        "requestedAt",

        "desc"

      )

    );

    const snapshot = await getDocs(

      requestQuery

    );

    const requests = snapshot.docs.map(document => ({

      id: document.id,

      ...document.data()

    }));

    return success(

      requests

    );

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}

/*
==========================================================
GET ACCESS REQUEST
==========================================================
*/

export async function getAccessRequest(requestId) {

  try {

    const snapshot = await getDoc(

      getAccessRequestReference(

        requestId

      )

    );

    if (!snapshot.exists()) {

      return notFound(

        PLATFORM_ERRORS.ACCESS_REQUEST_NOT_FOUND

      );

    }

    return success({

      id: snapshot.id,

      ...snapshot.data()

    });

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}

/*
==========================================================
APPROVE ACCESS REQUEST
==========================================================
*/

export async function approveAccessRequest(contract) {

  try {

    return await callCloudFunction(

      "approveAccessRequest",

      contract

    );

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}

/*
==========================================================
REJECT ACCESS REQUEST
==========================================================
*/

export async function rejectAccessRequest(contract) {

  try {

    return await callCloudFunction(

      "rejectAccessRequest",

      contract

    );

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}

/*
==========================================================
UPDATE ACCESS REQUEST
==========================================================
*/

export async function updateAccessRequest(

  requestId,

  data

) {

  try {

    await updateAccessRequestDocument(

      requestId,

      data

    );

    return success();

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}

/*
==========================================================
DELETE ACCESS REQUEST
==========================================================
*/

export async function deleteAccessRequest(

  requestId

) {

  try {

    await deleteDoc(

      getAccessRequestReference(

        requestId

      )

    );

    return success();

  }

  catch (error) {

    console.error(error);

    return failure(

      error.message

    );

  }

}