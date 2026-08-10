/*
==========================================================
ACCESS REQUEST STATUS
==========================================================
*/

export const ACCESS_REQUEST_STATUS = {

  PENDING: {

    id: "pending",

    translationKey: "platform.accessRequestStatus.pending.name",

    descriptionKey:
      "platform.accessRequestStatus.pending.description",

    color: "warning"

  },

  APPROVED: {

    id: "approved",

    translationKey: "platform.accessRequestStatus.approved.name",

    descriptionKey:
      "platform.accessRequestStatus.approved.description",

    color: "success"

  },

  REJECTED: {

    id: "rejected",

    translationKey: "platform.accessRequestStatus.rejected.name",

    descriptionKey:
      "platform.accessRequestStatus.rejected.description",

    color: "danger"

  }

};

export const ACTIVE_ACCESS_REQUEST_STATUS =

  Object.values(

    ACCESS_REQUEST_STATUS

  );