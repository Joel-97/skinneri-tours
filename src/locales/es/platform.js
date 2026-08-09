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

      name: "Transporte",

      description:

        "Administración de servicios de transporte."

    },

    adventures: {

      name: "Aventuras",

      description:

        "Administración de tours y aventuras."

    },

    rentals: {

      name: "Rentas",

      description:

        "Administración de alquileres."

    },

    restaurants: {

      name: "Restaurantes",

      description:

        "Administración de restaurantes."

    },

    clinics: {

      name: "Clínicas",

      description:

        "Administración de clínicas."

    },

    hotels: {

      name: "Hoteles",

      description:

        "Administración de hoteles."

    }

  },

  /*
  ==========================================================
  ROLES
  ==========================================================
  */

  roles: {

    superAdmin: {

      name: "Super Administrador",

      description:

        "Acceso completo a toda la plataforma."

    },

    admin: {

      name: "Administrador",

      description:

        "Administra la empresa y sus usuarios."

    },

    manager: {

      name: "Gerente",

      description:

        "Supervisa la operación diaria."

    },

    operator: {

      name: "Operador",

      description:

        "Gestiona la operación del sistema."

    },

    dispatcher: {

      name: "Despachador",

      description:

        "Coordina reservas y personal."

    },

    driver: {

      name: "Chofer",

      description:

        "Acceso únicamente a sus servicios."

    },

    guide: {

      name: "Guía",

      description:

        "Acceso únicamente a sus aventuras."

    },

    receptionist: {

      name: "Recepcionista",

      description:

        "Gestiona la atención al cliente."

    },

  },

  /*
  ==========================================================
  COMPANY STATUS
  ==========================================================
  */

  companyStatus: {

    pending: {

        name: "Pendiente",

        description:

        "La empresa aún no ha sido activada."

    },

    active: {

        name: "Activa",

        description:

        "La empresa puede utilizar la plataforma."

    },

    inactive: {

        name: "Inactiva",

        description:

        "La empresa se encuentra deshabilitada."

    },

    suspended: {

        name: "Suspendida",

        description:

        "La empresa fue suspendida temporalmente."

    }

  },

  /*
  ==========================================================
  REQUEST STATUS
  ==========================================================
  */

  requestStatus: {

    pending: {

        name: "Pendiente",

        description:

        "La solicitud está esperando aprobación."

    },

    approved: {

        name: "Aprobada",

        description:

        "La solicitud fue aprobada."

    },

    rejected: {

        name: "Rechazada",

        description:

        "La solicitud fue rechazada."

    }

    }

};

export default platform;