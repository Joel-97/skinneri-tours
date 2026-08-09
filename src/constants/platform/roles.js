/*
==========================================================
SYSTEM ROLES
==========================================================
*/

export const ROLES = Object.freeze({

  /*
  ==========================================================
  PLATFORM
  ==========================================================
  */

  SUPER_ADMIN: {

    id: "superadmin",

    translationKey:
      "roles.superAdmin.name",

    descriptionKey:
      "roles.superAdmin.description",

    level: 100,

    companyScoped: false

  },

  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  ADMIN: {

    id: "admin",

    translationKey:
      "roles.admin.name",

    descriptionKey:
      "roles.admin.description",

    level: 90,

    companyScoped: true

  },

  MANAGER: {

    id: "manager",

    translationKey:
      "roles.manager.name",

    descriptionKey:
      "roles.manager.description",

    level: 80,

    companyScoped: true

  },

  OPERATOR: {

    id: "operator",

    translationKey:
      "roles.operator.name",

    descriptionKey:
      "roles.operator.description",

    level: 70,

    companyScoped: true

  },

  DISPATCHER: {

    id: "dispatcher",

    translationKey:
      "roles.dispatcher.name",

    descriptionKey:
      "roles.dispatcher.description",

    level: 60,

    companyScoped: true

  },

  DRIVER: {

    id: "driver",

    translationKey:
      "roles.driver.name",

    descriptionKey:
      "roles.driver.description",

    level: 50,

    companyScoped: true

  },

  GUIDE: {

    id: "guide",

    translationKey:
      "roles.guide.name",

    descriptionKey:
      "roles.guide.description",

    level: 50,

    companyScoped: true

  },

  RECEPTIONIST: {

    id: "receptionist",

    translationKey:
      "roles.receptionist.name",

    descriptionKey:
      "roles.receptionist.description",

    level: 40,

    companyScoped: true

  }

});

/*
==========================================================
ACTIVE ROLES
==========================================================
*/

export const ACTIVE_ROLES =

  Object.values(

    ROLES

  );

/*
==========================================================
COMPANY ROLES
==========================================================
*/

export const COMPANY_ROLES =

  ACTIVE_ROLES.filter(

    role => role.companyScoped

  );

/*
==========================================================
PLATFORM ROLES
==========================================================
*/

export const PLATFORM_ROLES =

  ACTIVE_ROLES.filter(

    role => !role.companyScoped

  );