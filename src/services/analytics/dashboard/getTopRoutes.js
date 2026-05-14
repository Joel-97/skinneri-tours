// ======================================================
// GET TOP ROUTES
// ======================================================

export const getTopRoutes = (
  reservations = []
) => {

  // ====================================================
  // ONLY TRANSPORTATION
  // ====================================================

  const transportationReservations =
    reservations.filter(

      (reservation) =>

        reservation.serviceCategory ===
        "transportation"

    );

  // ====================================================
  // ROUTES MAP
  // ====================================================

  const routesMap = {};

  // ====================================================
  // BUILD ROUTES
  // ====================================================

  transportationReservations.forEach(

    (reservation) => {

      // ==============================================
      // LOCATIONS
      // ==============================================

      const from =

        reservation.locationFromName ||

        "Origen desconocido";

      const to =

        reservation.locationToName ||

        "Destino desconocido";

      // ==============================================
      // ROUTE NAME
      // ==============================================

      const routeName =
        `${from} → ${to}`;

      // ==============================================
      // INIT
      // ==============================================

      if (
        !routesMap[
          routeName
        ]
      ) {

        routesMap[
          routeName
        ] = {

          name:
            routeName,

          revenue: 0,

          count: 0

        };

      }

      // ==============================================
      // ACCUMULATE
      // ==============================================

      routesMap[
        routeName
      ].revenue +=

        Number(
          reservation.total || 0
        );

      routesMap[
        routeName
      ].count += 1;

    }

  );

  // ====================================================
  // FORMAT
  // ====================================================

  return Object.values(
    routesMap
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
    // MAP
    // ==============================================

    .map((route) => ({

      name:
        route.name,

      subtitle:
        `${route.count} viajes`,

      value:
        `$${route.revenue.toFixed(2)}`

    }));

};