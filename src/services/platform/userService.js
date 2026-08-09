/*
==========================================================
IMPORTS
==========================================================
*/

import {
  collection,
  setDoc,
  getDoc,
  getDocs,
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

import PLATFORM_ERRORS from "../../constants/errors/platformErrors";

import { USER_STATUS } from "../../constants/platform/userStatus";

import {
  success,
  created,
  failure,
  notFound
} from "../../utils/serviceResult";

/*
==========================================================
PRIVATE HELPERS
==========================================================
*/

function getUserReference(userId) {

  return doc(

    db,

    FIRESTORE_COLLECTIONS.USERS,

    userId

  );

}

async function updateUserDocument(
  userId,
  data
) {

  await updateDoc(

    getUserReference(userId),

    {

      ...data,

      updatedAt: serverTimestamp()

    }

  );

}

/*
==========================================================
CREATE USER
==========================================================
*/

export async function createUser(
  userId,
  user
) {

  try {

    /*
    ======================================================
    CHECK DUPLICATE EMAIL
    ======================================================
    */

    const userQuery = query(
      collection(
        db,
        FIRESTORE_COLLECTIONS.USERS
      ),
      where(
        "email",
        "==",
        user.email
      )
    );

    const snapshot = await getDocs(userQuery);

    if (!snapshot.empty) {

      return failure(

        PLATFORM_ERRORS.USER_ALREADY_EXISTS

      );

    }

    /*
    ======================================================
    CREATE DOCUMENT
    ======================================================
    */

    const documentData = {

      uid: userId,

      ...user,

      status:

        user.status ||

        USER_STATUS.ACTIVE.id,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),

      approvedAt: serverTimestamp(),

      lastLoginAt: null

    };

    /*
    ======================================================
    SAVE
    ======================================================
    */

    await setDoc(

      getUserReference(userId),

      documentData

    );

    return created(

      userId

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
GET USERS
==========================================================
*/

export async function getUsers() {

  try {

    const userQuery = query(

      collection(

        db,

        FIRESTORE_COLLECTIONS.USERS

      ),

      orderBy(

        "displayName"

      )

    );

    const snapshot = await getDocs(userQuery);

    const users = snapshot.docs.map(document => ({

      id: document.id,

      ...document.data()

    }));

    return success(

      users

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
GET COMPANY USERS
==========================================================
*/

export async function getCompanyUsers(companyId) {

  try {

    const userQuery = query(

      collection(

        db,

        FIRESTORE_COLLECTIONS.USERS

      ),

      where(

        "companyId",

        "==",

        companyId

      ),

      orderBy(

        "displayName"

      )

    );

    const snapshot = await getDocs(userQuery);

    const users = snapshot.docs.map(document => ({

      id: document.id,

      ...document.data()

    }));

    return success(

      users

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
GET USER
==========================================================
*/

export async function getUser(userId) {

  try {

    const snapshot = await getDoc(

      getUserReference(

        userId

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

/*
==========================================================
UPDATE USER
==========================================================
*/

export async function updateUser(
  userId,
  data
) {

  try {

    await updateUserDocument(

      userId,

      data

    );

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
UPDATE USER ROLE
==========================================================
*/

export async function updateUserRole(
  userId,
  role
) {

  try {

    await updateUserDocument(

      userId,

      {

        role

      }

    );

    /*
    ======================================================
    FUTURE

    - Audit log
    - Notify user
    - Refresh permissions

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

/*
==========================================================
UPDATE USER STATUS
==========================================================
*/

export async function updateUserStatus(
  userId,
  status
) {

  try {

    await updateUserDocument(

      userId,

      {

        status

      }

    );

    /*
    ======================================================
    FUTURE

    - Audit log
    - Revoke sessions
    - Notifications

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

/*
==========================================================
UPDATE LAST LOGIN
==========================================================
*/

export async function updateLastLogin(userId) {

  try {

    await updateUserDocument(

      userId,

      {

        lastLoginAt: serverTimestamp()

      }

    );

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
DELETE USER
==========================================================
*/

export async function deleteUser(userId) {

  try {

    await deleteDoc(

      getUserReference(

        userId

      )

    );

    /*
    ======================================================
    FUTURE

    - Audit log
    - Remove permissions
    - Remove sessions

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