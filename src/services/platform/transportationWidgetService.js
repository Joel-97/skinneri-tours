/*
==========================================================
TRANSPORTATION WIDGET SERVICE
==========================================================
*/

import {
  getFunctions,
  httpsCallable
} from "firebase/functions";

import { app } from "../../firebase";


/*
==========================================================
FIREBASE FUNCTIONS
==========================================================
*/

const functions = getFunctions(app);


/*
==========================================================
GET WIDGET CONFIGURATION
==========================================================
*/

export async function getTransportationWidgetConfiguration(
  widgetId
) {

  if (!widgetId) {

    throw new Error(
      "widgetId is required."
    );

  }


  const functionCall = httpsCallable(
    functions,
    "getTransportationWidgetConfiguration"
  );


  const response =
    await functionCall({

      widgetId

    });


  return response.data;

}


/*
==========================================================
UPDATE WIDGET APPEARANCE
==========================================================
*/

export async function updateTransportationWidgetAppearance(
  widgetId,
  appearance
) {

  if (!widgetId) {

    throw new Error(
      "widgetId is required."
    );

  }


  if (!appearance) {

    throw new Error(
      "appearance is required."
    );

  }


  const functionCall = httpsCallable(
    functions,
    "updateTransportationWidgetAppearance"
  );


  const response =
    await functionCall({

      widgetId,

      appearance

    });


  return response.data;

}


/*
==========================================================
EXPORT
==========================================================
*/

export default {

  getTransportationWidgetConfiguration,

  updateTransportationWidgetAppearance

};