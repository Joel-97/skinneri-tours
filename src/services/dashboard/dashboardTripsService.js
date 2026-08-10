/*
==========================================================
DASHBOARD TRIPS SERVICE
==========================================================
*/

/*
==========================================================
GET DASHBOARD TRIPS
==========================================================
*/

export function getDashboardTrips(

  reservations = []

) {

  /*
  ==========================================================
  TODAY
  ==========================================================
  */

  const today = new Date();

  today.setHours(

    0,
    0,
    0,
    0

  );

  /*
  ==========================================================
  INITIAL DATA
  ==========================================================
  */

  const metrics = {

    today: [],

    upcoming: [],

    completed: [],

    cancelled: [],

    pending: [],

    confirmed: [],

    delayed: [],

    nextTrip: null

  };

  /*
  ==========================================================
  PROCESS RESERVATIONS
  ==========================================================
  */

  reservations.forEach((reservation) => {

    if (!reservation.date) {

      return;

    }

    const reservationDate =

      reservation.date.toDate
        ? reservation.date.toDate()
        : new Date(reservation.date);

    /*
    ========================================================
    STATUS
    ========================================================
    */

    switch (reservation.status) {

      case "confirmed":

        metrics.confirmed.push(

          reservation

        );

        break;

      case "pending":

        metrics.pending.push(

          reservation

        );

        break;

      case "cancelled":

        metrics.cancelled.push(

          reservation

        );

        break;

      case "completed":

        metrics.completed.push(

          reservation

        );

        break;

      default:

        break;

    }

    /*
    ========================================================
    TODAY
    ========================================================
    */

    const reservationDay =

      new Date(reservationDate);

    reservationDay.setHours(

      0,
      0,
      0,
      0

    );

    if (

      reservationDay.getTime() ===

      today.getTime()

    ) {

      metrics.today.push(

        reservation

      );

    }

    /*
    ========================================================
    UPCOMING
    ========================================================
    */

    if (

      reservationDate >= today

    ) {

      metrics.upcoming.push(

        reservation

      );

    }

    /*
    ========================================================
    DELAYED

    V1:
    Una reserva pendiente cuya fecha
    ya pasó.

    ========================================================
    */

    if (

      reservation.status === "pending" &&

      reservationDate < today

    ) {

      metrics.delayed.push(

        reservation

      );

    }

  });

  /*
  ==========================================================
  SORT UPCOMING
  ==========================================================
  */

  metrics.upcoming.sort(

    (a, b) =>

      a.date.seconds -

      b.date.seconds

  );

  /*
  ==========================================================
  NEXT TRIP
  ==========================================================
  */

  metrics.nextTrip =

    metrics.upcoming.length > 0

      ? metrics.upcoming[0]

      : null;

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return metrics;

}