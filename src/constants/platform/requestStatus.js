/*
==========================================================
ACCESS REQUEST STATUS
==========================================================
*/

export const REQUEST_STATUS = {

  pending: {

    id: "pending",

    translationKey:

      "platform.requestStatus.pending.name",

    descriptionKey:

      "platform.requestStatus.pending.description",

    color: "warning"

  },

  approved: {

    id: "approved",

    translationKey:

      "platform.requestStatus.approved.name",

    descriptionKey:

      "platform.requestStatus.approved.description",

    color: "success"

  },

  rejected: {

    id: "rejected",

    translationKey:

      "platform.requestStatus.rejected.name",

    descriptionKey:

      "platform.requestStatus.rejected.description",

    color: "danger"

  }

};

/*
==========================================================
ACTIVE REQUEST STATUS
==========================================================
*/

export const ACTIVE_REQUEST_STATUS =

  Object.values(

    REQUEST_STATUS

  );