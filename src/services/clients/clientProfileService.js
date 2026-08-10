/*
==========================================================
CLIENT PROFILE SERVICE
==========================================================
*/

import { getClientActivity } from "./clientActivityService";
import { getClientFinancialSummary } from "./clientFinancialSummaryService";

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
  FINANCIAL SUMMARY
  ==========================================================
  */

  const financialSummary = getClientFinancialSummary(

    activity

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

    financialSummary

  };

}