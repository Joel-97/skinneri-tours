const superAdmin = {

  /*
  ==========================================================
  ACCESS REQUESTS
  ==========================================================
  */

  accessRequests: {

    /*
    ========================================================
    PAGE
    ========================================================
    */

    title:
      "Solicitudes de acceso",

    subtitle:
      "Revise y administre las solicitudes de acceso enviadas por nuevos usuarios.",

    /*
    ========================================================
    FILTERS
    ========================================================
    */

    search:
      "Buscar",

    searchPlaceholder:
      "Buscar por nombre o correo electrónico...",

    all:
      "Todas",

    pending:
      "Pendientes",

    approved:
      "Aprobadas",

    rejected:
      "Rechazadas",

    /*
    ========================================================
    TABLE
    ========================================================
    */

    table: {

      name:
        "Nombre",

      email:
        "Correo electrónico",

      requestedAt:
        "Fecha",

      status:
        "Estado",

      actions:
        "Acciones"

    },

    /*
    ========================================================
    DETAILS
    ========================================================
    */

    details: {

      title:
        "Detalle de la solicitud",

      summary:
        "Resumen",

      applicant:
        "Solicitante",

      company:
        "Empresa",

      companyName:
        "Nombre de la empresa",

      createCompany:
        "Crear nueva empresa",

      existingCompany:
        "Seleccionar empresa existente",

      role:
        "Rol",

      enabledModules:
        "Módulos habilitados",

      email:
        "Correo electrónico",

      status:
        "Estado"

    },

    /*
    ========================================================
    ACTIONS
    ========================================================
    */

    actions: {

      view:
        "Ver",

      approve:
        "Aprobar",

      reject:
        "Rechazar",

      cancel:
        "Cancelar",

      save:
        "Guardar"

    },

    /*
    ========================================================
    STATUS
    ========================================================
    */

    status: {

      pending:
        "Pendiente",

      approved:
        "Aprobada",

      rejected:
        "Rechazada"

    },

    /*
    ========================================================
    REJECT
    ========================================================
    */

    reject: {

      title:
        "Rechazar solicitud",

      description:
        "¿Está seguro de que desea rechazar esta solicitud de acceso? Esta acción no se puede deshacer."

    },

    /*
    ========================================================
    EMPTY
    ========================================================
    */

    empty:
      "No hay solicitudes de acceso."

  }

};

export default superAdmin;