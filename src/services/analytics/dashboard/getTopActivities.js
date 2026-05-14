// ======================================================
// GET TOP ACTIVITIES
// ======================================================

export const getTopActivities = (
  reservations = []
) => {

  // ====================================================
  // ONLY ADVENTURES
  // ====================================================

  console.log(

  "ALL RESERVATIONS",

  reservations

);

const adventures =
  reservations.filter(

    (reservation) => {

      console.log(

        "CATEGORY",

        reservation.serviceCategory

      );

      return (

        reservation.serviceCategory ===
        "adventure"

      );

    }

  );

  // ====================================================
  // GROUP MAP
  // ====================================================

  const activitiesMap = {};

  // ====================================================
  // BUILD
  // ====================================================

  adventures.forEach((reservation) => {

    console.log("reservation", reservation);

    const activityName =

      reservation.serviceTypeName ||

      "Sin actividad";

    // ==============================================
    // INIT
    // ==============================================

    if (
      !activitiesMap[
        activityName
      ]
    ) {

      activitiesMap[
        activityName
      ] = {

        name:
          activityName,

        revenue: 0,

        count: 0

      };

    }

    // ==============================================
    // ACCUMULATE
    // ==============================================

    activitiesMap[
      activityName
    ].revenue +=

      Number(
        reservation.total || 0
      );

    activitiesMap[
      activityName
    ].count += 1;

  });

  // ====================================================
  // CONVERT ARRAY
  // ====================================================

  return Object.values(
    activitiesMap
  )

    // ==============================================
    // SORT
    // ==============================================

    .sort(

      (a, b) =>

        b.revenue -
        a.revenue

    )

    // ==============================================
    // TOP 5
    // ==============================================

    .slice(0, 5)

    // ==============================================
    // FORMAT
    // ==============================================

    .map((activity) => ({

      name:
        activity.name,

      subtitle:
        `${activity.count} reservas`,

      value:
        `$${activity.revenue.toFixed(2)}`

    }));

};