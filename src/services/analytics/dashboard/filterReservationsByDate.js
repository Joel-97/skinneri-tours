// ======================================================
// FILTER RESERVATIONS BY DATE
// ======================================================

export const filterReservationsByDate = (

  reservations,

  dateFilter

) => {

  // ====================================================
  // CURRENT DATE
  // ====================================================

  const now =
    new Date();

  return reservations.filter(
    (reservation) => {

      // ================================================
      // VALIDATION
      // ================================================

      if (!reservation.date)
        return false;

      const reservationDate =
        reservation.date.toDate
          ? reservation.date.toDate()
          : new Date(
              reservation.date
            );

      // ================================================
      // TODAY
      // ================================================

      if (
        dateFilter === "today"
      ) {

        return (
          reservationDate
            .toDateString() ===
          now.toDateString()
        );

      }

      // ================================================
      // WEEK
      // ================================================

      if (
        dateFilter === "week"
      ) {

        const weekAgo =
          new Date();

        weekAgo.setDate(
          now.getDate() - 7
        );

        return (
          reservationDate >=
          weekAgo
        );

      }

      // ================================================
      // MONTH
      // ================================================

      if (
        dateFilter === "month"
      ) {

        return (

          reservationDate.getMonth() ===
            now.getMonth() &&

          reservationDate.getFullYear() ===
            now.getFullYear()

        );

      }

      // ================================================
      // QUARTER
      // ================================================

      if (
        dateFilter === "quarter"
      ) {

        const currentQuarter =
          Math.floor(
            now.getMonth() / 3
          );

        const reservationQuarter =
          Math.floor(
            reservationDate.getMonth() / 3
          );

        return (

          currentQuarter ===
            reservationQuarter &&

          reservationDate.getFullYear() ===
            now.getFullYear()

        );

      }

      // ================================================
      // YEAR
      // ================================================

      if (
        dateFilter === "year"
      ) {

        return (
          reservationDate.getFullYear() ===
          now.getFullYear()
        );

      }

      // ================================================
      // DEFAULT
      // ================================================

      return true;

    }
  );

};