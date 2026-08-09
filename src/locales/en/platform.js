/*
==========================================================
PLATFORM
==========================================================
*/

const platform = {

  /*
  ==========================================================
  MODULES
  ==========================================================
  */

  modules: {

    transportation: {

      name: "Transportation",

      description:

        "Transportation services management."

    },

    adventures: {

      name: "Adventures",

      description:

        "Tours and adventures management."

    },

    rentals: {

      name: "Rentals",

      description:

        "Rental services management."

    },

    restaurants: {

      name: "Restaurants",

      description:

        "Restaurant management."

    },

    clinics: {

      name: "Clinics",

      description:

        "Clinic management."

    },

    hotels: {

      name: "Hotels",

      description:

        "Hotel management."

    }

  },

  /*
  ==========================================================
  ROLES
  ==========================================================
  */

  roles: {

    superAdmin: {

      name: "Super Administrator",

      description:

        "Full access to the entire platform."

    },

    admin: {

      name: "Administrator",

      description:

        "Manages the company and its users."

    },

    manager: {

      name: "Manager",

      description:

        "Supervises daily operations."

    },

    operator: {

      name: "Operator",

      description:

        "Manages the daily operation."

    },

    dispatcher: {

      name: "Dispatcher",

      description:

        "Coordinates reservations and staff."

    },

    driver: {

      name: "Driver",

      description:

        "Access only to assigned services."

    },

    guide: {

      name: "Guide",

      description:

        "Access only to assigned adventures."

    },

    receptionist: {

      name: "Receptionist",

      description:

        "Handles customer service."

    }

  },

  /*
  ==========================================================
  COMPANY STATUS
  ==========================================================
  */

  companyStatus: {

    pending: {

        name: "Pending",

        description:

        "The company has not been activated yet."

    },

    active: {

        name: "Active",

        description:

        "The company can use the platform."

    },

    inactive: {

        name: "Inactive",

        description:

        "The company is disabled."

    },

    suspended: {

        name: "Suspended",

        description:

        "The company has been temporarily suspended."

    }

  },

  /*
  ==========================================================
  REQUEST STATUS
  ==========================================================
  */

  requestStatus: {

    pending: {

        name: "Pending",

        description:

        "The request is waiting for approval."

    },

    approved: {

        name: "Approved",

        description:

        "The request has been approved."

    },

    rejected: {

        name: "Rejected",

        description:

        "The request has been rejected."

    }

    }

};

export default platform;