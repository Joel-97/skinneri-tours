/*
==========================================================
CLIENT PROFILE SERVICE
==========================================================
*/

import { getClientActivity } from "./clientActivityService";

/*
==========================================================
GET CLIENT PROFILE
==========================================================
*/

export async function getClientProfile(

  companyId,

  client

) {

  if (!companyId || !client) {

    return null;

  }

  /*
  ==========================================================
  ACTIVITY
  ==========================================================
  */

  const activity = await getClientActivity(

    companyId,

    client.id

  );

  /*
  ==========================================================
  PROFILE
  ==========================================================
  */

  return {

    client,

    activity,

    stats: null,

    financialSummary: []

  };

}