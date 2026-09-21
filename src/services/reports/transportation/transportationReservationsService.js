import {
  getTransportation
} from "../../transportation/transportationService";


// ==========================================================
// DATE HELPERS
// ==========================================================

export const normalizeReportDate = (value) => {

  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  if (
    typeof value === "object" &&
    typeof value.seconds === "number"
  ) {
    return new Date(
      value.seconds * 1000
    );
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate;

};


// ==========================================================
// FORMAT DATE
// ==========================================================

export const formatReportDate = (date) => {

  if (!date) {
    return "";
  }

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

  return `${year}-${month}-${day}`;

};


// ==========================================================
// DRIVER NAME
// ==========================================================

export const getReservationDriverName = (
  reservation
) => {

  return (
    reservation?.driverName ||
    reservation?.staffName ||
    ""
  );

};


// ==========================================================
// NORMALIZE RESERVATION
// ==========================================================

export const normalizeTransportationReservation = (
  reservation
) => {

  const serviceDate =
    normalizeReportDate(
      reservation?.date
    );

  const createdDate =
    normalizeReportDate(
      reservation?.createdAt
    );

  return {

    ...reservation,

    serviceDate,

    serviceDateString:
      reservation?.dateString ||
      formatReportDate(
        serviceDate
      ),

    createdDate,

    createdDateString:
      formatReportDate(
        createdDate
      ),

    driverDisplayName:
      getReservationDriverName(
        reservation
      ),

    serviceDisplayName:
      reservation?.serviceTypeName ||
      "-",

    originDisplayName:
      reservation?.locationFromName ||
      "-",

    destinationDisplayName:
      reservation?.locationToName ||
      "-",

    bookingSourceDisplayName:
      reservation?.bookingSourceName ||
      "-",

    paymentTypeDisplayName:
      reservation?.paymentTypeName ||
      "-",

    clientDisplayName:
      reservation?.clientName ||
      "-",

    statusDisplayName:
      reservation?.status ||
      "-"

  };

};


// ==========================================================
// GET RESERVATIONS
// ==========================================================

export const getTransportationReservations = async (
  companyId
) => {

  if (!companyId) {

    throw new Error(
      "El companyId es requerido."
    );

  }

  const reservations =
    await getTransportation(
      companyId
    );

  return (
    reservations || []
  ).map(
    normalizeTransportationReservation
  );

};


// ==========================================================
// FILTER RESERVATIONS
// ==========================================================

export const filterTransportationReservations = (
  reservations,
  filters = {}
) => {

  const {

    startDate = "",

    endDate = "",

    searchTerm = "",

    status = "",

    serviceType = "",

    origin = "",

    destination = "",

    driver = "",

    bookingSource = "",

    paymentType = ""

  } = filters;


  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();


  return reservations.filter(
    (reservation) => {

      const serviceDate =
        reservation
          .serviceDateString ||
        "";


      const matchesDate =

        (
          !startDate ||
          serviceDate >= startDate
        )

        &&

        (
          !endDate ||
          serviceDate <= endDate
        );


      const searchableText = [

        reservation
          .reservationNumber,

        reservation
          .clientName,

        reservation
          .clientEmail,

        reservation
          .phone,

        reservation
          .flightNumber,

        reservation
          .driverDisplayName,

        reservation
          .vehicleName,

        reservation
          .vehiclePlate,

        reservation
          .serviceTypeName,

        reservation
          .locationFromName,

        reservation
          .locationToName,

        reservation
          .bookingSourceName,

        reservation
          .paymentTypeName

      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        );


      const matchesStatus =
        !status ||
        reservation.status ===
          status;


      const matchesService =
        !serviceType ||
        reservation.serviceTypeName ===
          serviceType;


      const matchesOrigin =
        !origin ||
        reservation.locationFromName ===
          origin;


      const matchesDestination =
        !destination ||
        reservation.locationToName ===
          destination;


      const matchesDriver =
        !driver ||
        reservation.driverDisplayName ===
          driver;


      const matchesBookingSource =
        !bookingSource ||
        reservation.bookingSourceName ===
          bookingSource;


      const matchesPayment =
        !paymentType ||
        reservation.paymentTypeName ===
          paymentType;


      return (

        matchesDate &&

        matchesSearch &&

        matchesStatus &&

        matchesService &&

        matchesOrigin &&

        matchesDestination &&

        matchesDriver &&

        matchesBookingSource &&

        matchesPayment

      );

    }
  );

};


// ==========================================================
// SORT RESERVATIONS
// ==========================================================

export const sortTransportationReservations = (
  reservations,
  sortConfig
) => {

  if (!sortConfig?.key) {

    return [
      ...reservations
    ];

  }


  const {

    key,

    direction = "desc"

  } = sortConfig;


  return [
    ...reservations
  ].sort(
    (a, b) => {

      let aValue =
        a[key];

      let bValue =
        b[key];


      if (key === "date") {

        aValue =
          a.serviceDate;

        bValue =
          b.serviceDate;

      }


      if (
        aValue instanceof Date
      ) {

        aValue =
          aValue.getTime();

      }


      if (
        bValue instanceof Date
      ) {

        bValue =
          bValue.getTime();

      }


      if (
        aValue === null ||
        aValue === undefined
      ) {

        aValue = "";

      }


      if (
        bValue === null ||
        bValue === undefined
      ) {

        bValue = "";

      }


      if (
        typeof aValue ===
          "string" &&
        typeof bValue ===
          "string"
      ) {

        aValue =
          aValue.toLowerCase();

        bValue =
          bValue.toLowerCase();

      }


      if (
        aValue < bValue
      ) {

        return (
          direction === "asc"
            ? -1
            : 1
        );

      }


      if (
        aValue > bValue
      ) {

        return (
          direction === "asc"
            ? 1
            : -1
        );

      }


      return 0;

    }
  );

};


// ==========================================================
// FILTER OPTIONS
// ==========================================================

export const getTransportationReservationFilterOptions = (
  reservations
) => {

  const uniqueValues = (
    values
  ) => {

    return [
      ...new Set(
        values.filter(
          Boolean
        )
      )
    ].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b)
        )
    );

  };


  return {

    statuses:
      uniqueValues(
        reservations.map(
          (reservation) =>
            reservation.status
        )
      ),

    serviceTypes:
      uniqueValues(
        reservations.map(
          (reservation) =>
            reservation
              .serviceTypeName
        )
      ),

    origins:
      uniqueValues(
        reservations.map(
          (reservation) =>
            reservation
              .locationFromName
        )
      ),

    destinations:
      uniqueValues(
        reservations.map(
          (reservation) =>
            reservation
              .locationToName
        )
      ),

    drivers:
      uniqueValues(
        reservations.map(
          (reservation) =>
            reservation
              .driverDisplayName
        )
      ),

    bookingSources:
      uniqueValues(
        reservations.map(
          (reservation) =>
            reservation
              .bookingSourceName
        )
      ),

    paymentTypes:
      uniqueValues(
        reservations.map(
          (reservation) =>
            reservation
              .paymentTypeName
        )
      )

  };

};