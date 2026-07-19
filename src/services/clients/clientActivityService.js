/*
==========================================================
CLIENT ACTIVITY SERVICE
==========================================================
*/

import { getClientTransportation } from "./queries/transportationQuery";

import { transportationActivityAdapter } from "./adapters/transportationActivityAdapter";

/*
==========================================================
GET CLIENT ACTIVITY
==========================================================
*/

export async function getClientActivity(

  companyId,
  clientId

) {

  if (!companyId || !clientId) {

    return [];

  }

  /*
  ==========================================================
  LOAD MODULES
  ==========================================================
  */

  const [

    transportation

  ] = await Promise.all([

    getClientTransportation(

      companyId,

      clientId

    )

  ]);

  /*
  ==========================================================
  ADAPT MODULES
  ==========================================================
  */

  const activity = [

    ...transportation.map(

      transportationActivityAdapter

    )

  ];

  /*
  ==========================================================
  SORT
  ==========================================================
  */

  activity.sort(

    (a, b) => {

      const first = a.date?.toDate
        ? a.date.toDate()
        : new Date(a.date);

      const second = b.date?.toDate
        ? b.date.toDate()
        : new Date(b.date);

      return second - first;

    }

  );

  return activity;

}