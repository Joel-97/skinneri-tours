import {
  httpsCallable
} from "firebase/functions";

import {
  functions
} from "../../firebase";


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