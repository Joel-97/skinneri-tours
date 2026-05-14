// ======================================================
// GET REVENUE TREND
// ======================================================

export const getRevenueTrend = (
  reservations
) => {

  // ====================================================
  // MONTH LABELS
  // ====================================================

  const monthLabels = {

    "01": "Ene",
    "02": "Feb",
    "03": "Mar",
    "04": "Abr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Ago",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dic"

  };

  // ====================================================
  // GROUPED DATA
  // ====================================================

  const grouped = {};

  reservations.forEach(
    (reservation) => {

      if (!reservation.month)
        return;

      // ================================================
      // MONTH FORMAT
      // ================================================

      const [
        year,
        month
      ] = reservation.month.split(
        "-"
      );

      const key =
        `${year}-${month}`;

      // ================================================
      // INIT
      // ================================================

      if (!grouped[key]) {

        grouped[key] = {

          name:
            monthLabels[month] ||
            month,

          revenue: 0

        };

      }

      // ================================================
      // ADD REVENUE
      // ================================================

      grouped[key].revenue +=
        Number(
          reservation.total || 0
        );

    }
  );

  // ====================================================
  // RETURN SORTED
  // ====================================================

  return Object.entries(grouped)

    .sort(([a], [b]) =>
      a.localeCompare(b)
    )

    .map(([, value]) => ({

      name:
        value.name,

      revenue:
        Number(
          value.revenue.toFixed(2)
        )

    }));

};