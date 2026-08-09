/*
==========================================================
COMPANY STATUS
==========================================================
*/

export const COMPANY_STATUS = {

  pending: {

    id: "pending",

    translationKey:

      "platform.companyStatus.pending.name",

    descriptionKey:

      "platform.companyStatus.pending.description",

    color: "warning"

  },

  active: {

    id: "active",

    translationKey:

      "platform.companyStatus.active.name",

    descriptionKey:

      "platform.companyStatus.active.description",

    color: "success"

  },

  inactive: {

    id: "inactive",

    translationKey:

      "platform.companyStatus.inactive.name",

    descriptionKey:

      "platform.companyStatus.inactive.description",

    color: "secondary"

  },

  suspended: {

    id: "suspended",

    translationKey:

      "platform.companyStatus.suspended.name",

    descriptionKey:

      "platform.companyStatus.suspended.description",

    color: "danger"

  }

};

/*
==========================================================
ACTIVE COMPANY STATUS
==========================================================
*/

export const ACTIVE_COMPANY_STATUS =

  Object.values(

    COMPANY_STATUS

  );