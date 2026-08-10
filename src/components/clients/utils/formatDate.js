/*
==========================================================
FORMAT DATE
==========================================================
*/

export const formatDate = (value) => {

  if (!value) return "";

  let date;

  /*
  ==========================================================
  FIRESTORE TIMESTAMP
  ==========================================================
  */

  if (typeof value?.toDate === "function") {

    date = value.toDate();

  }

  /*
  ==========================================================
  FIRESTORE SERIALIZED
  ==========================================================
  */

  else if (value?.seconds) {

    date = new Date(value.seconds * 1000);

  }

  /*
  ==========================================================
  JAVASCRIPT DATE
  ==========================================================
  */

  else if (value instanceof Date) {

    date = value;

  }

  /*
  ==========================================================
  STRING
  ==========================================================
  */

  else {

    date = new Date(value);

  }

  /*
  ==========================================================
  INVALID DATE
  ==========================================================
  */

  if (Number.isNaN(date.getTime())) {

    return "";

  }

  /*
  ==========================================================
  FORMAT DD-MM-YYYY
  ==========================================================
  */

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}-${month}-${year}`;

};