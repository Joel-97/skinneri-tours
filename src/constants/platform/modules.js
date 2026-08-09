/*
==========================================================
SYSTEM MODULES
==========================================================
*/

export const MODULES = {

  transportation: {

    id: "transportation",

    translationKey:

      "modules.transportation.name",

    descriptionKey:

      "modules.transportation.description",

    icon: "truck",

    enabled: true

  },

  adventure: {

    id: "adventure",

    translationKey:

      "modules.adventure.name",

    descriptionKey:

      "modules.adventure.description",

    icon: "mountain",

    enabled: true

  },

  rentals: {

    id: "rentals",

    translationKey:

      "modules.rentals.name",

    descriptionKey:

      "modules.rentals.description",

    icon: "key",

    enabled: true

  },

  hotels: {

    id: "hotels",

    translationKey:

      "modules.hotels.name",

    descriptionKey:

      "modules.hotels.description",

    icon: "hotel",

    enabled: false

  }

};

/*
==========================================================
ACTIVE MODULES
==========================================================
*/

export const ACTIVE_MODULES =

  Object.values(

    MODULES

  ).filter(

    (module) =>

      module.enabled

  );