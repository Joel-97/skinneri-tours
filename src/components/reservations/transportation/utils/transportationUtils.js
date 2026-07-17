/*
==========================================================
TRANSPORTATION UTILS
==========================================================
*/

import {
  generateReservationNumber
} from "../../../../services/Tools";

import { emptyForm } from "../constants/transportationConstants";

/*
==========================================================
FORMAT DATE
Convierte cualquier fecha al formato YYYY-MM-DDTHH:mm
==========================================================
*/

export function formatDate(value) {
  if (!value) return "";

  // Firestore Timestamp
  if (value.seconds) {
    return new Date(value.seconds * 1000)
      .toISOString()
      .slice(0, 16);
  }

  // String
  if (typeof value === "string") {
    return value.slice(0, 16);
  }

  // Date
  return new Date(value)
    .toISOString()
    .slice(0, 16);
}

/*
==========================================================
FORMAT DURATION
Convierte minutos a:
30m
1h
1h 30m
==========================================================
*/

export function formatDuration(minutes = 0) {

  const totalMinutes = Number(minutes);

  if (!totalMinutes) {
    return "";
  }

  const hours = Math.floor(totalMinutes / 60);

  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/*
==========================================================
BUILD CREATE FORM
Inicializa el formulario para crear una reserva.
==========================================================
*/

export function buildCreateForm(reservation = {}) {

  return {

    ...emptyForm,

    ...reservation,

    date: formatDate(reservation?.date),

    endDate: formatDate(reservation?.endDate),

    activeTaxIds: reservation?.activeTaxIds || [],

    reservationNumber:
      reservation?.reservationNumber ||
      generateReservationNumber()

  };

}

/*
==========================================================
BUILD EDIT FORM
Inicializa el formulario cuando se edita.
==========================================================
*/

export function buildEditForm(reservation) {

  return {

      ...emptyForm,

      ...reservation,

      date: formatDate(reservation?.date),

      endDate: formatDate(reservation?.endDate),

      activeTaxIds: reservation?.activeTaxIds || []

  };

}

/*
==========================================================
BUILD OPTIONS
Convierte catálogos en opciones para componentes Select.
==========================================================
*/

export function buildOptions(
    items = [],
    labelField = "name"
) {

    return items.map(item => ({

        value: item.id,
        label: item[labelField] || ""

    }));

}