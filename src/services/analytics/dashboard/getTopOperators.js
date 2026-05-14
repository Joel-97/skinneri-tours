// ======================================================
// GET TOP OPERATORS
// ======================================================

export const getTopOperators = (
  reservations = []
) => {

  // ====================================================
  // ONLY ADVENTURES
  // ====================================================

  const adventures =
    reservations.filter(

      (reservation) =>

        reservation.serviceCategory ===
        "adventure"

    );

  // ====================================================
  // OPERATORS MAP
  // ====================================================

  const operatorsMap = {};

  // ====================================================
  // BUILD
  // ====================================================

  adventures.forEach((reservation) => {

    // ==============================================
    // OPERATOR NAME
    // ==============================================

    const operatorName =

      reservation.operatorName ||

      reservation.commissionBeneficiaryName ||

      "Sin operador";

    // ==============================================
    // INIT
    // ==============================================

    if (
      !operatorsMap[
        operatorName
      ]
    ) {

      operatorsMap[
        operatorName
      ] = {

        name:
          operatorName,

        revenue: 0,

        count: 0

      };

    }

    // ==============================================
    // ACCUMULATE
    // ==============================================

    operatorsMap[
      operatorName
    ].revenue +=

      Number(
        reservation.total || 0
      );

    operatorsMap[
      operatorName
    ].count += 1;

  });

  // ====================================================
  // FORMAT
  // ====================================================

  return Object.values(
    operatorsMap
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

    .map((operator) => ({

      name:
        operator.name,

      subtitle:
        `${operator.count} reservas`,

      value:
        `$${operator.revenue.toFixed(2)}`

    }));

};