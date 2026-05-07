import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { db, storage } from "../../firebase";

/* -------------------------------------------------- */
/* CONSTANTS */
/* -------------------------------------------------- */

const MAX_TEMPLATES = 5;

/* -------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------- */

const getTemplatesCollection = (
  companyId
) => {

  return collection(
    db,
    "companies",
    companyId,
    "signTemplates"
  );
};

const getTemplateDocument = (
  companyId,
  templateId
) => {

  return doc(
    db,
    "companies",
    companyId,
    "signTemplates",
    templateId
  );
};

/* -------------------------------------------------- */
/* STORAGE HELPERS */
/* -------------------------------------------------- */

const getTemplateImagePath = (
  companyId,
  fileName
) => {

  return `companies/${companyId}/sign-images/${fileName}`;
};

/* -------------------------------------------------- */
/* CREATE TEMPLATE */
/* -------------------------------------------------- */

export const createSignTemplate =
  async ({
    companyId,
    user,
    template,
    templateName,
  }) => {

    const templatesRef =
      getTemplatesCollection(
        companyId
      );

    /*
    -----------------------------------
    GET CURRENT TEMPLATES
    -----------------------------------
    */

    const snapshot =
      await getDocs(
        templatesRef
      );

    /*
    -----------------------------------
    VALIDATE LIMIT
    -----------------------------------
    */

    if (
      snapshot.size >=
      MAX_TEMPLATES
    ) {

      throw new Error(
        "Se ha alcanzado el límite de plantillas"
      );
    }

    /*
    -----------------------------------
    PAYLOAD
    -----------------------------------
    */

    const payload = {
      name:
        templateName ||
        "Untitled Template",

      canvas:
        template?.canvas || {},

      layers:
        template?.layers || [],

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),

      createdBy:
        user?.uid || "",
    };

    /*
    -----------------------------------
    CREATE DOCUMENT
    -----------------------------------
    */

    const docRef =
      await addDoc(
        templatesRef,
        payload
      );

    /*
    -----------------------------------
    RETURN ID
    -----------------------------------
    */

    return docRef.id;
  };

/* -------------------------------------------------- */
/* UPDATE TEMPLATE */
/* -------------------------------------------------- */

export const updateSignTemplate =
  async ({
    companyId,
    templateId,
    template,
    templateName,
  }) => {

    const templateRef =
      getTemplateDocument(
        companyId,
        templateId
      );

    /*
    -----------------------------------
    PAYLOAD
    -----------------------------------
    */

    const payload = {
      name:
        templateName ||
        "Untitled Template",

      canvas:
        template?.canvas || {},

      layers:
        template?.layers || [],

      updatedAt:
        serverTimestamp(),
    };

    /*
    -----------------------------------
    UPDATE DOCUMENT
    -----------------------------------
    */

    await updateDoc(
      templateRef,
      payload
    );
  };

/* -------------------------------------------------- */
/* DELETE TEMPLATE */
/* -------------------------------------------------- */

export const deleteSignTemplate =
  async (
    companyId,
    templateId
  ) => {

    const templateRef =
      getTemplateDocument(
        companyId,
        templateId
      );

    /*
    -----------------------------------
    DELETE DOCUMENT
    -----------------------------------
    */

    await deleteDoc(
      templateRef
    );
  };

/* -------------------------------------------------- */
/* GET ALL TEMPLATES */
/* -------------------------------------------------- */

export const getSignTemplates =
  async (companyId) => {

    const templatesRef =
      getTemplatesCollection(
        companyId
      );

    const snapshot =
      await getDocs(
        templatesRef
      );

    return snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );
  };

/* -------------------------------------------------- */
/* GET SINGLE TEMPLATE */
/* -------------------------------------------------- */

export const getSingleSignTemplate =
  async (
    companyId,
    templateId
  ) => {

    const templateRef =
      getTemplateDocument(
        companyId,
        templateId
      );

    const snapshot =
      await getDoc(
        templateRef
      );

    if (
      !snapshot.exists()
    ) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  };

/* -------------------------------------------------- */
/* UPLOAD TEMPLATE IMAGE */
/* -------------------------------------------------- */

export const uploadTemplateImage =
  async ({
    companyId,
    file,
  }) => {

    /*
    -----------------------------------
    FILE NAME
    -----------------------------------
    */

    const fileName =
      `${Date.now()}-${file.name}`;

    /*
    -----------------------------------
    STORAGE PATH
    -----------------------------------
    */

    const storagePath =
      getTemplateImagePath(
        companyId,
        fileName
      );

    /*
    -----------------------------------
    STORAGE REF
    -----------------------------------
    */

    const storageRef = ref(
      storage,
      storagePath
    );

    /*
    -----------------------------------
    UPLOAD FILE
    -----------------------------------
    */

    await uploadBytes(
      storageRef,
      file
    );

    /*
    -----------------------------------
    GET DOWNLOAD URL
    -----------------------------------
    */

    const downloadURL =
      await getDownloadURL(
        storageRef
      );

    /*
    -----------------------------------
    RETURN
    -----------------------------------
    */

    return {
      url: downloadURL,

      path: storagePath,
    };
  };

/* -------------------------------------------------- */
/* DELETE TEMPLATE IMAGE */
/* -------------------------------------------------- */

export const deleteTemplateImage =
  async (storagePath) => {

    if (!storagePath) {
      return;
    }

    const storageRef = ref(
      storage,
      storagePath
    );

    await deleteObject(
      storageRef
    );
  };