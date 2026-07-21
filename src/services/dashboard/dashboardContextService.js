/*
==========================================================
DASHBOARD CONTEXT SERVICE
==========================================================
*/

import {

  loadCollection

} from "../../utils/firestore/loadCollection";

/*
==========================================================
GET DASHBOARD CONTEXT
==========================================================
*/

export async function getDashboardContext(

  companyId

) {

  /*
  ==========================================================
  VALIDATION
  ==========================================================
  */

  if (!companyId) {

    return {

      reservations: [],

      drivers: [],

      vehicles: [],

      clients: []

    };

  }

  /*
  ==========================================================
  LOAD CONTEXT
  ==========================================================
  */

  const [

    reservations,

    drivers,

    vehicles,

    clients

  ] = await Promise.all([

    loadCollection(

      companyId,

      "transportation"

    ),

    loadCollection(

      companyId,

      "drivers"

    ),

    loadCollection(

      companyId,

      "vehicles"

    ),

    loadCollection(

      companyId,

      "clients"

    )

  ]);

  /*
  ==========================================================
  CONTEXT
  ==========================================================
  */

  return {

    reservations,

    drivers,

    vehicles,

    clients

  };

}