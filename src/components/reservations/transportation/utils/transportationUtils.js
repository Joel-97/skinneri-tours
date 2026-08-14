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

  let date;

  /*
  ---------------------------------------------------------
  FIRESTORE TIMESTAMP
  ---------------------------------------------------------
  */

  if (

    value.seconds !== undefined &&

    typeof value.toDate === "function"

  ) {

    date = value.toDate();

  }

  /*
  ---------------------------------------------------------
  DATE
  ---------------------------------------------------------
  */

  else if (value instanceof Date) {

    date = value;

  }

  /*
  ---------------------------------------------------------
  STRING
  ---------------------------------------------------------
  */

  else if (typeof value === "string") {

    date = new Date(value);

  }

  else {

    return "";

  }

  /*
  ---------------------------------------------------------
  VALIDATE
  ---------------------------------------------------------
  */

  if (Number.isNaN(date.getTime())) {

    return "";

  }

  /*
  ---------------------------------------------------------
  LOCAL DATE
  ---------------------------------------------------------
  */

  const year =

    date.getFullYear();

  const month =

    String(

      date.getMonth() + 1

    ).padStart(2, "0");

  const day =

    String(

      date.getDate()

    ).padStart(2, "0");

  const hours =

    String(

      date.getHours()

    ).padStart(2, "0");

  const minutes =

    String(

      date.getMinutes()

    ).padStart(2, "0");

  return (

    `${year}-${month}-${day}` +

    `T${hours}:${minutes}`

  );

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

  const hours = Math.floor(

    totalMinutes / 60

  );

  const remainingMinutes =

    totalMinutes % 60;

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

export function buildCreateForm(

  reservation = {}

) {

  return {

    ...emptyForm,

    ...reservation,

    date:
      formatDate(
        reservation?.date
      ),

    end:
      formatDate(
        reservation?.end
      ),

    activeTaxIds:
      reservation?.activeTaxIds || [],

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

export function buildEditForm(

  reservation

) {

  return {

    ...emptyForm,

    ...reservation,

    date:
      formatDate(
        reservation?.date
      ),

    end:
      formatDate(
        reservation?.end
      ),

    activeTaxIds:
      reservation?.activeTaxIds || []

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

    label:
      item[labelField] || ""

  }));

}