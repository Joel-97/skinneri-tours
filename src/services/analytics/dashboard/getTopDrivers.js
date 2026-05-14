// ======================================================
// GET TOP DRIVERS
// ======================================================

export const getTopDrivers = (
  reservations
) => {

  const grouped = {};

  reservations

    .filter(
      (reservation) =>
        reservation.module ===
        "transportation"
    )

    .forEach(
      (reservation) => {

        const driver =
          reservation.driverName ||
          "Sin asignar";

        if (!grouped[driver]) {

          grouped[driver] = 0;

        }

        grouped[driver] +=
          Number(
            reservation.total || 0
          );

      }
    );

  return Object.entries(grouped)

    .map(([name, total]) => ({

      name,

      subtitle:
        "Ingresos generados",

      value:
        `$${total.toFixed(2)}`

    }))

    .sort(
      (a, b) => {

        const valueA =
          Number(
            a.value.replace(
              "$",
              ""
            )
          );

        const valueB =
          Number(
            b.value.replace(
              "$",
              ""
            )
          );

        return valueB - valueA;

      }
    )

    .slice(0, 5);

};