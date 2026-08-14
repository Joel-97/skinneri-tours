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
  NOW
  ==========================================================
  */

  const now = new Date();

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

    /*
    ========================================================
    RESERVATION DATE
    ========================================================
    */

    const reservationDate =

      reservation.date?.toDate

        ? reservation.date.toDate()

        : new Date(reservation.date);

    /*
    ========================================================
    INVALID DATE
    ========================================================
    */

    if (

      Number.isNaN(

        reservationDate.getTime()

      )

    ) {

      return;

    }

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

    Any reservation whose start date belongs
    to the current calendar day.

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

    A service is upcoming when:

    - Its start date/time has not passed.
    - It is not cancelled.
    - It is not completed.

    The reservation.date field represents
    the start of the service.

    ========================================================
    */

    const isUpcomingStatus =

      reservation.status !== "cancelled" &&

      reservation.status !== "completed";

    if (

      reservationDate >= now &&

      isUpcomingStatus

    ) {

      metrics.upcoming.push(

        reservation

      );

    }

    /*
    ========================================================
    DELAYED
    ========================================================

    A pending reservation whose scheduled
    start date/time has already passed.

    ========================================================
    */

    if (

      reservation.status === "pending" &&

      reservationDate < now

    ) {

      metrics.delayed.push(

        reservation

      );

    }

  });

  /*
  ==========================================================
  SORT TODAY
  ==========================================================
  */

  metrics.today.sort(

    (a, b) => {

      const dateA =

        a.date?.toDate

          ? a.date.toDate()

          : new Date(a.date);

      const dateB =

        b.date?.toDate

          ? b.date.toDate()

          : new Date(b.date);

      return (

        dateA.getTime() -

        dateB.getTime()

      );

    }

  );

  /*
  ==========================================================
  SORT UPCOMING
  ==========================================================
  */

  metrics.upcoming.sort(

    (a, b) => {

      const dateA =

        a.date?.toDate

          ? a.date.toDate()

          : new Date(a.date);

      const dateB =

        b.date?.toDate

          ? b.date.toDate()

          : new Date(b.date);

      return (

        dateA.getTime() -

        dateB.getTime()

      );

    }

  );

  /*
  ==========================================================
  SORT DELAYED
  ==========================================================
  */

  metrics.delayed.sort(

    (a, b) => {

      const dateA =

        a.date?.toDate

          ? a.date.toDate()

          : new Date(a.date);

      const dateB =

        b.date?.toDate

          ? b.date.toDate()

          : new Date(b.date);

      return (

        dateA.getTime() -

        dateB.getTime()

      );

    }

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