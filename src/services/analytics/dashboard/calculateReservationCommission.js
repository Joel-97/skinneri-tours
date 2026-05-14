// ======================================================
// CALCULATE RESERVATION COMMISSION
// ======================================================

export const calculateReservationCommission = (

  reservation

) => {

  // ====================================================
  // VALIDATION
  // ====================================================

  if (
    !reservation.commissionEnabled
  ) {

    return 0;

  }

  const subtotal =
    Number(
      reservation.subtotal || 0
    );

  const commissionType =
    reservation.commissionType;

  const commissionValue =
    Number(
      reservation.commissionValue || 0
    );

  // ====================================================
  // PERCENTAGE
  // ====================================================

  if (
    commissionType ===
    "percentage"
  ) {

    return (
      subtotal *
      (
        commissionValue / 100
      )
    );

  }

  // ====================================================
  // FIXED
  // ====================================================

  if (
    commissionType ===
    "fixed"
  ) {

    return commissionValue;

  }

  // ====================================================
  // DEFAULT
  // ====================================================

  return 0;

};