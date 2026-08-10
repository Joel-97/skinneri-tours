import {
  sendReservationConfirmation
} from "../../services/communication/reservationEmailService";


/* ======================================================
   SEND RESERVATION CONFIRMATION
====================================================== */

export async function sendReservationConfirmationController({

  reservationId,

  language

}) {

  return await sendReservationConfirmation(

    reservationId,

    language

  );

}