import { db } from "../../firebase";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  updateCompanyData
} from "./companyProfileOld";

// ======================================================
// GET UPDATED COMPANY
// ======================================================

const getUpdatedCompany = async (
  companyId
) => {

  const companyRef = doc(

    db,

    "companies",

    companyId

  );

  const companySnap =
    await getDoc(companyRef);

  if (!companySnap.exists()) {

    throw new Error(
      "Company not found"
    );

  }

  return companySnap.data();

};

// ======================================================
// UPLOAD COMPANY LOGO
// ======================================================

export const uploadCompanyLogo = async ({

  companyId,
  file

}) => {

  try {

    if (!file) {

      throw new Error(
        "File is required"
      );

    }

    // ==================================================
    // STORAGE
    // ==================================================

    const storage =
      getStorage();

    // ==================================================
    // CLEAN FILE NAME
    // ==================================================

    const cleanFileName =
      file.name.replace(
        /\s+/g,
        "_"
      );

    // ==================================================
    // STORAGE REF
    // ==================================================

    const storageRef = ref(

      storage,

      `companies/${companyId}/logo/${Date.now()}_${cleanFileName}`

    );

    // ==================================================
    // UPLOAD FILE
    // ==================================================

    await uploadBytes(
      storageRef,
      file
    );

    // ==================================================
    // DOWNLOAD URL
    // ==================================================

    const downloadURL =
      await getDownloadURL(
        storageRef
      );

    // ==================================================
    // UPDATE COMPANY
    // ==================================================

    await updateCompanyData(

      companyId,

      {
        logoURL: downloadURL
      }

    );

    // ==================================================
    // RETURN UPDATED COMPANY
    // ==================================================

    return await getUpdatedCompany(
      companyId
    );

  } catch (error) {

    console.error(

      "Error uploading logo:",

      error

    );

    throw error;

  }

};

// ======================================================
// REMOVE COMPANY LOGO
// ======================================================

export const removeCompanyLogo = async ({

  companyId,
  logoURL

}) => {

  try {

    // ==================================================
    // STORAGE
    // ==================================================

    const storage =
      getStorage();

    // ==================================================
    // DELETE FILE FROM STORAGE
    // ==================================================

    if (logoURL) {

      const logoRef = ref(
        storage,
        logoURL
      );

      await deleteObject(
        logoRef
      );

    }

    // ==================================================
    // CLEAR LOGO URL
    // ==================================================

    await updateCompanyData(

      companyId,

      {
        logoURL: ""
      }

    );

    // ==================================================
    // RETURN UPDATED COMPANY
    // ==================================================

    return await getUpdatedCompany(
      companyId
    );

  } catch (error) {

    console.error(

      "Error removing logo:",

      error

    );

    throw error;

  }

};