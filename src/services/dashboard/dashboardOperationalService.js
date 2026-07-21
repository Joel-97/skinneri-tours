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

  staff = []

) {

  /*
  ==========================================================
  TODAY
  ==========================================================
  */

  const today = new Date().toISOString().split("T")[0];

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

    if (

      reservation.dateString === today

    ) {

      metrics.reservationsToday += 1;

      switch (reservation.status) {

        case "completed":

          metrics.completedToday += 1;

          break;

        case "pending":

          metrics.pendingToday += 1;

          break;

        default:

          break;

      }

    }

    if (!reservation.staffId) {

      metrics.unassignedServices += 1;

    }

  });

  /*
  ==========================================================
  STAFF
  ==========================================================
  */

  metrics.activeDrivers = staff.filter(

    (member) =>

      member.status === "active"

  ).length;

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return metrics;

}