// ======================================================
// GET TOP DESTINATIONS
// ======================================================

export const getTopDestinations = (
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
  // DESTINATIONS MAP
  // ====================================================

  const destinationsMap = {};

  // ====================================================
  // BUILD
  // ====================================================

  transportationReservations.forEach(

    (reservation) => {

      // ==============================================
      // DESTINATION
      // ==============================================

      const destination =

        reservation.locationToName ||

        "Destino desconocido";

      // ==============================================
      // INIT
      // ==============================================

      if (
        !destinationsMap[
          destination
        ]
      ) {

        destinationsMap[
          destination
        ] = {

          name:
            destination,

          revenue: 0,

          count: 0

        };

      }

      // ==============================================
      // ACCUMULATE
      // ==============================================

      destinationsMap[
        destination
      ].revenue +=

        Number(
          reservation.total || 0
        );

      destinationsMap[
        destination
      ].count += 1;

    }

  );

  // ====================================================
  // FORMAT
  // ====================================================

  return Object.values(
    destinationsMap
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

    .map((destination) => ({

      name:
        destination.name,

      value:
        destination.revenue,

      count:
        destination.count

    }));

};