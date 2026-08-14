/*
==========================================================
DASHBOARD OPERATIONAL SERVICE
==========================================================
*/

/*
==========================================================
GET DASHBOARD OPERATIONAL METRICS
==========================================================
*/

export function getDashboardOperationalMetrics(

  reservations = [],

  drivers = []

) {

  /*
  ==========================================================
  TODAY
  ==========================================================
  */

  const now = new Date();

  const today =

    `${now.getFullYear()}-` +

    `${String(

      now.getMonth() + 1

    ).padStart(2, "0")}-` +

    `${String(

      now.getDate()

    ).padStart(2, "0")}`;

  /*
  ==========================================================
  INITIAL DATA
  ==========================================================
  */

  const metrics = {

    reservationsToday: 0,

    unassignedServices: 0,

    activeDrivers: 0,

    completedToday: 0,

    pendingToday: 0

  };

  /*
  ==========================================================
  RESERVATIONS
  ==========================================================
  */

  reservations.forEach((reservation) => {

    /*
    ========================================================
    RESERVATION DATE
    ========================================================
    */

    let reservationDate = null;

    if (reservation.date?.toDate) {

      reservationDate =

        reservation.date.toDate();

    }

    else if (reservation.date) {

      reservationDate =

        new Date(reservation.date);

    }

    /*
    ========================================================
    INVALID DATE
    ========================================================
    */

    if (

      !reservationDate ||

      Number.isNaN(

        reservationDate.getTime()

      )

    ) {

      return;

    }

    /*
    ========================================================
    LOCAL DATE
    ========================================================
    */

    const reservationDateString =

      `${reservationDate.getFullYear()}-` +

      `${String(

        reservationDate.getMonth() + 1

      ).padStart(2, "0")}-` +

      `${String(

        reservationDate.getDate()

      ).padStart(2, "0")}`;

    /*
    ========================================================
    TODAY
    ========================================================
    */

    if (

      reservationDateString === today

    ) {

      metrics.reservationsToday += 1;

      /*
      ------------------------------------------------------
      COMPLETED TODAY
      ------------------------------------------------------
      */

      if (

        reservation.status === "completed"

      ) {

        metrics.completedToday += 1;

      }

      /*
      ------------------------------------------------------
      PENDING TODAY
      ------------------------------------------------------
      */

      if (

        reservation.status === "pending"

      ) {

        metrics.pendingToday += 1;

      }

    }

    /*
    ========================================================
    UNASSIGNED SERVICES
    ========================================================

    A service is considered unassigned when
    it does not have a driver assigned.

    Current reservation structure:

    driverId
    driverName

    ========================================================
    */

    if (!reservation.driverId) {

      metrics.unassignedServices += 1;

    }

  });

  /*
  ==========================================================
  DRIVERS
  ==========================================================
  */

  metrics.activeDrivers = drivers.filter(

    (driver) =>

      driver.isActive === true

  ).length;

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return metrics;

}