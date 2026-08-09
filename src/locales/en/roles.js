const roles = {

  /*
  ==========================================================
  PLATFORM
  ==========================================================
  */

  superAdmin: {

    name:
      "Super Administrator",

    description:
      "Full access to the entire platform, including system configuration, companies, users, modules, and global administration."

  },

  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  admin: {

    name:
      "Administrator",

    description:
      "Manages the company, its users, settings, services, and daily operations."

  },

  manager: {

    name:
      "Manager",

    description:
      "Oversees daily operations, supervises staff, and manages business activities."

  },

  operator: {

    name:
      "Operator",

    description:
      "Creates and manages reservations, clients, and operational records."

  },

  dispatcher: {

    name:
      "Dispatcher",

    description:
      "Coordinates schedules, assigns resources, and monitors active services."

  },

  driver: {

    name:
      "Driver",

    description:
      "Views assigned services and updates trip progress."

  },

  guide: {

    name:
      "Guide",

    description:
      "Manages assigned tours and assists customers during activities."

  },

  receptionist: {

    name:
      "Receptionist",

    description:
      "Handles customer inquiries, bookings, and front desk operations."

  }

};

export default roles;