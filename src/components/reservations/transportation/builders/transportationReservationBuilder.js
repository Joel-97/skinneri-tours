/*
==========================================================
TRANSPORTATION RESERVATION BUILDER
==========================================================
*/

import { formatDuration } from "../utils/transportationUtils";

export function buildTransportationReservation({

    data,

    reservationNumber,

    financial,

    settings

}) {

  const {

      staff,

      paymentTypes,

      serviceTypes,

      locations,

      routes,

      vehicles,

      bookingSources,

      payers

  } = settings;

  /*
  ----------------------------------------------------------
  LOOKUPS
  ----------------------------------------------------------
  */

  const selectedStaff =
    staff.find(
      item => item.id === data.staffId
    );

  const selectedPayment =
    paymentTypes.find(
      item => item.id === data.paymentTypeId
    );

  const selectedService =
    serviceTypes.find(
      item => item.id === data.serviceTypeId
    );

  const selectedLocationFrom =
    locations.find(
      item => item.id === data.locationFromId
    );

  const selectedLocationTo =
    locations.find(
      item => item.id === data.locationToId
    );

  const selectedRoute =
    routes.find(
      item => item.id === data.routeId
    );

  const selectedVehicle =
    vehicles.find(
      item => item.id === data.vehicleId
    );

  const selectedBookingSource =
    bookingSources.find(
      item => item.id === data.bookingSourceId
    );

  const selectedPayer =
    payers.find(
      item => item.id === data.payerId
    );

  /*
  ----------------------------------------------------------
  BUILD
  ----------------------------------------------------------
  */

  return {

    ...data,

    reservationNumber,

    subtotal: Number(data.price || 0),

    discountAmount: Number(
      financial.discountAmount.toFixed(2)
    ),

    taxAmount: Number(
      financial.totalTax.toFixed(2)
    ),

    total: Number(
      financial.total.toFixed(2)
    ),

    /*
    ----------------------------------
    SNAPSHOTS
    ----------------------------------
    */

    staffName:
      selectedStaff?.name || "",

    paymentTypeName:
      selectedPayment?.name || "",

    serviceCategory:
      selectedService?.category || "transport",

    serviceTypeName:
      selectedService?.name || "",

    durationMinutes:
      Number(
        selectedService?.durationMinutes || 0
      ),

    durationLabel:
      formatDuration(
        selectedService?.durationMinutes || 0
      ),

    locationFromName:
      selectedLocationFrom?.name || "",

    locationToName:
      selectedLocationTo?.name || "",

    bookingSourceId:
      data.bookingSourceId || "",

    bookingSourceName:
      selectedBookingSource?.name || "",

    payerId:
      data.payerId || "",

    payerName:
      selectedPayer?.name || "",

    routeId:
      data.routeId || "",

    routeCode:
      selectedRoute?.code || "",

    routeName:
      selectedRoute?.name || "",

    vehicleId:
      data.vehicleId || "",

    vehicleName:
      selectedVehicle?.name || "",

    vehiclePlate:
      selectedVehicle?.plate || "",

    vehicleType:
      selectedVehicle?.type || "",

    /*
    ----------------------------------
    FACTURACIÓN
    ----------------------------------
    */

    paymentStatus:
      data.paymentStatus || "",

    reservationBase:
      data.reservationBase || "",

    /*
    ----------------------------------
    REPORTES
    ----------------------------------
    */

    dateString:
      data.date
        ? data.date.slice(0, 10)
        : "",

    month:
      data.date
        ? data.date.slice(0, 7)
        : "",

    year:
      data.date
        ? data.date.slice(0, 4)
        : ""

  };

}