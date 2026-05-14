// ======================================================
// GET RECENT ACTIVITY
// ======================================================

export const getRecentActivity = (
  reservations
) => {

  return reservations

    .sort(
      (a, b) =>
        b.createdAt?.seconds -
        a.createdAt?.seconds
    )

    .slice(0, 5)

    .map((reservation) => ({

      title:
        `Nueva reserva de ${
          reservation.clientName ||
          "Cliente"
        }`,

      time:
        "Recientemente"

    }));

};