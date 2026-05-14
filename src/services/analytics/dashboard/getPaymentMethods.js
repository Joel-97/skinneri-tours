// ======================================================
// GET PAYMENT METHODS
// ======================================================

export const getPaymentMethods = (
  reservations
) => {

  // ====================================================
  // GROUP METHODS
  // ====================================================

  const methodsMap = {};

  reservations.forEach(
    (reservation) => {

      const method =
        reservation.paymentTypeName ||
        "Sin definir";

      if (!methodsMap[method]) {

        methodsMap[method] = 0;

      }

      methodsMap[method] +=
        Number(
          reservation.total || 0
        );

    }
  );

  // ====================================================
  // TOTAL
  // ====================================================

  const total =
    Object.values(
      methodsMap
    ).reduce(

      (sum, value) =>
        sum + value,

      0

    );

  // ====================================================
  // RETURN
  // ====================================================

  return Object.entries(
    methodsMap
  )

    .map(([name, value]) => {

      const percentage =
        total > 0

          ? (
              (
                value / total
              ) * 100
            ).toFixed(1)

          : 0;

      return {

        name,

        value:
          Number(
            value.toFixed(2)
          ),

        percentage

      };

    })

    .sort(
      (a, b) =>
        b.value - a.value
    );

};