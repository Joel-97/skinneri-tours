/*
==========================================================
IMPORTS
==========================================================
*/

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "../../firebase";

import { FIRESTORE_COLLECTIONS } from "../../constants/shared/firestoreCollections";

import PLATFORM_ERRORS from "../../constants/errors/platformErrors";

import {
  success,
  failure,
  notFound
} from "../../utils/serviceResult";

/*
==========================================================
PRIVATE HELPERS
==========================================================
*/

function getAdminReference(adminId) {

  return doc(

    db,

    FIRESTORE_COLLECTIONS.USERS,

    adminId

  );

}

/*
==========================================================
GET ADMIN BY ID
==========================================================
*/

export async function getAdminById(adminId) {

  try {

    const snapshot = await getDoc(

      getAdminReference(

        adminId

      )

    );

    if (!snapshot.exists()) {

      return notFound(

        PLATFORM_ERRORS.USER_NOT_FOUND

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

      PLATFORM_ERRORS.UNKNOWN_ERROR

    );

  }

}