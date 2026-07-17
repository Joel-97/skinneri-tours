/*
==========================================================
CLIENT BUILDER
==========================================================
*/

export function buildClient({

  data,

  mode = "create"

}) {

  const now = new Date();

  return {

    /* ======================================================
       GENERAL
    ====================================================== */

    name:
      data.name?.trim() || "",

    nameLower:
      data.name?.trim().toLowerCase() || "",

    email:
      data.email?.trim().toLowerCase() || "",

    emailLower:
      data.email?.trim().toLowerCase() || "",

    phone:
      data.phone?.trim() || "",

    whatsapp:
      data.whatsapp?.trim() || "",

    type:
      data.type || "person",

    status:
      data.status || "active",

    source:
      data.source || "manual",

    /* ======================================================
       COMPANY
    ====================================================== */

    company:
      data.company?.trim() || "",

    identification:
      data.identification?.trim() || "",

    /* ======================================================
       ADDRESS
    ====================================================== */

    country:
      data.country || "",

    province:
      data.province || "",

    city:
      data.city || "",

    address:
      data.address?.trim() || "",

    /* ======================================================
       PREFERENCES
    ====================================================== */

    preferredLanguage:
      data.preferredLanguage || "es",

    /* ======================================================
       TAGS
    ====================================================== */

    tags:
      Array.isArray(data.tags)
        ? data.tags
        : [],

    /* ======================================================
       NOTES
    ====================================================== */

    notes:
      data.notes?.trim() || "",

    /* ======================================================
       SYSTEM
    ====================================================== */

    ...(mode === "create" && {

      createdAt: now

    }),

    updatedAt: now

  };

}