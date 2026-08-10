const roles = {

  /*
  ==========================================================
  PLATFORM
  ==========================================================
  */

  superAdmin: {

    name:
      "Superadministrador",

    description:
      "Acceso completo a toda la plataforma, incluyendo la configuración del sistema, empresas, usuarios, módulos y la administración global."

  },

  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  admin: {

    name:
      "Administrador",

    description:
      "Administra la empresa, sus usuarios, la configuración, los servicios y las operaciones diarias."

  },

  manager: {

    name:
      "Gerente",

    description:
      "Supervisa las operaciones diarias, coordina al personal y administra las actividades de la empresa."

  },

  operator: {

    name:
      "Operador",

    description:
      "Crea y administra reservas, clientes y registros operativos."

  },

  dispatcher: {

    name:
      "Despachador",

    description:
      "Coordina horarios, asigna recursos y supervisa los servicios activos."

  },

  driver: {

    name:
      "Conductor",

    description:
      "Consulta los servicios asignados y actualiza el progreso de los viajes."

  },

  guide: {

    name:
      "Guía",

    description:
      "Gestiona los tours asignados y brinda asistencia a los clientes durante las actividades."

  },

  receptionist: {

    name:
      "Recepcionista",

    description:
      "Atiende consultas de los clientes, gestiona reservas y realiza labores de recepción."

  }

};

export default roles;