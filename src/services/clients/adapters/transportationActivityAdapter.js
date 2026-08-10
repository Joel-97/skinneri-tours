/*
==========================================================
TRANSPORTATION ACTIVITY ADAPTER
==========================================================
*/

import { activityCategories } from "../../../config/activityCategories";

/**
 * Convierte una reserva de Transportation en una actividad
 * genérica que puede consumir el CRM.
 */

export function transportationActivityAdapter(reservation) {

  /*
  ==========================================================
  CATEGORY
  ==========================================================
  */

  const category =

    activityCategories.transportation || {};

  return {

    /* ======================================================
       IDENTIFICATION
    ====================================================== */

    id: reservation.id,

    module: "transportation",

    type: "transportation",

    /* ======================================================
       CATEGORY
    ====================================================== */

    category: "transportation",

    label:

      category.label ||

      "Transportation",

    color:

      category.color ||

      "#2563EB",

    /* ======================================================
       CONTENT
    ====================================================== */

    title:

      reservation.serviceTypeName ||

      "Servicio de transporte",

    subtitle:

      reservation.locationFromName &&

      reservation.locationToName

        ? `${reservation.locationFromName} → ${reservation.locationToName}`

        : "",

    /* ======================================================
       DATE
    ====================================================== */

    date:

      reservation.date ||

      reservation.start ||

      reservation.createdAt ||

      null,

    /* ======================================================
       STATUS
    ====================================================== */

    status:

      reservation.status ||

      "",

    /* ======================================================
       FINANCIAL
    ====================================================== */

    total:

      reservation.total ||

      0,

    currencyCode:

      reservation.currency ||

      "",

    currencySymbol:

      reservation.symbol ||

      "",

    /* ======================================================
       EXTRA
    ====================================================== */

    reservationNumber:

      reservation.reservationNumber ||

      "",

    /* ======================================================
       ORIGINAL DOCUMENT
    ====================================================== */

    raw: reservation

  };

}