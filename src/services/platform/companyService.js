/*
==========================================================
IMPORTS
==========================================================
*/

import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../firebase";

import { FIRESTORE_COLLECTIONS } from "../../constants/shared/firestoreCollections";

import PLATFORM_ERRORS from "../../constants/errors/platformErrors";

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

function getCompanyReference(companyId) {

  return doc(

    db,

    FIRESTORE_COLLECTIONS.COMPANIES,

    companyId

  );

}

async function updateCompanyDocument(
  companyId,
  data
) {

  await updateDoc(

    getCompanyReference(companyId),

    {

      ...data,

      updatedAt: serverTimestamp()

    }

  );

}

/*
==========================================================
CREATE COMPANY
==========================================================
*/

export async function createCompany(company) {

  try {

    /*
    ======================================================
    CHECK DUPLICATE NAME
    ======================================================
    */

    const companyQuery = query(

      collection(

        db,

        FIRESTORE_COLLECTIONS.COMPANIES

      ),

      where(

        "name",

        "==",

        company.name

      )

    );

    const snapshot = await getDocs(companyQuery);

    if (!snapshot.empty) {

      return failure(

        PLATFORM_ERRORS.COMPANY_ALREADY_EXISTS

      );

    }

    /*
    ======================================================
    CREATE DOCUMENT
    ======================================================
    */

    const documentData = {

      ...company,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp()

    };

    /*
    ======================================================
    SAVE
    ======================================================
    */

    const reference = await addDoc(

      collection(

        db,

        FIRESTORE_COLLECTIONS.COMPANIES

      ),

      documentData

    );

    return created(

      reference.id

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
GET COMPANIES
==========================================================
*/

export async function getCompanies() {

  try {

    const companyQuery = query(

      collection(

        db,

        FIRESTORE_COLLECTIONS.COMPANIES

      ),

      orderBy(

        "name"

      )

    );

    const snapshot = await getDocs(companyQuery);

    const companies = snapshot.docs.map(document => ({

      id: document.id,

      ...document.data()

    }));

    return success(

      companies

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
GET COMPANY BY ID
==========================================================
*/

export async function getCompanyById(companyId) {

  try {

    const snapshot = await getDoc(

      getCompanyReference(

        companyId

      )

    );

    if (!snapshot.exists()) {

      return notFound(

        PLATFORM_ERRORS.COMPANY_NOT_FOUND

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
UPDATE COMPANY
==========================================================
*/

export async function updateCompany(
  companyId,
  data
) {

  try {

    await updateCompanyDocument(

      companyId,

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
UPDATE COMPANY STATUS
==========================================================
*/

export async function updateCompanyStatus(
  companyId,
  status
) {

  try {

    await updateCompanyDocument(

      companyId,

      {

        status

      }

    );

    /*
    ======================================================
    FUTURE

    - Audit log
    - Notifications
    - Session invalidation

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
UPDATE COMPANY MODULES
==========================================================
*/

export async function updateCompanyModules(
  companyId,
  enabledModules
) {

  try {

    await updateCompanyDocument(

      companyId,

      {

        enabledModules

      }

    );

    /*
    ======================================================
    FUTURE

    - Initialize module
    - Create default settings
    - Clear cache

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
DELETE COMPANY
==========================================================
*/

export async function deleteCompany(companyId) {

  try {

    await deleteDoc(

      getCompanyReference(

        companyId

      )

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