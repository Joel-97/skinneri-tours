import {
  getFunctions,
  httpsCallable
} from "firebase/functions";

import {
  app
} from "../../firebase";


/* ======================================================
   FIREBASE FUNCTIONS
====================================================== */

const functions = getFunctions(
  app
);


/* ======================================================
   SEND RESERVATION CONFIRMATION
====================================================== */

export async function sendReservationConfirmation(
  reservationId,
  language
) {

  if (!reservationId) {

    const error =
      new Error(
        "reservation_required"
      );

    error.code =
      "reservation_required";

    throw error;

  }


  if (!language) {

    const error =
      new Error(
        "language_required"
      );

    error.code =
      "language_required";

    throw error;

  }


  const sendReservationConfirmationFunction =
    httpsCallable(
      functions,
      "sendReservationConfirmation"
    );


  const result =
    await sendReservationConfirmationFunction({

      reservationId,

      language

    });


  return result.data;

}