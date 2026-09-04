/*
==========================================================
TRANSPORTATION INTEGRATION SERVICE
==========================================================
*/

import {
  getFunctions,
  httpsCallable
} from "firebase/functions";

import { app } from "../../firebase";


/*
==========================================================
FUNCTIONS
==========================================================
*/

const functions = getFunctions(app);


/*
==========================================================
CREATE INTEGRATION
==========================================================
*/

export async function createTransportationIntegration(
  companyId
) {

  const functionCall = httpsCallable(

    functions,

    "createTransportationIntegration"

  );

  const response = await functionCall({

    companyId

  });

  return response.data;

}


/*
==========================================================
GET INTEGRATION
==========================================================
*/

export async function getTransportationIntegration(
  companyId
) {

  const functionCall = httpsCallable(

    functions,

    "getTransportationIntegration"

  );

  const response = await functionCall({

    companyId

  });

  return response.data;

}


/*
==========================================================
ROTATE API KEY
==========================================================
*/

export async function rotateTransportationIntegrationApiKey(
  companyId
) {

  const functionCall = httpsCallable(

    functions,

    "rotateTransportationIntegrationApiKey"

  );

  const response = await functionCall({

    companyId

  });

  return response.data;

}


/*
==========================================================
UPDATE INTEGRATION STATUS
==========================================================
*/

export async function updateTransportationIntegrationStatus(

  companyId,

  status

) {

  const functionCall = httpsCallable(

    functions,

    "updateTransportationIntegrationStatus"

  );

  const response = await functionCall({

    companyId,

    status

  });

  return response.data;

}


export async function migrateTransportationIntegrationWidget(
  companyId
) {
  const functionCall = httpsCallable(
    functions,
    "migrateTransportationIntegrationWidget"
  );

  const response = await functionCall({
    companyId
  });

  return response.data;
}