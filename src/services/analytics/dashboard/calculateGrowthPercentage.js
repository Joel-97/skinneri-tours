// ======================================================
// CALCULATE GROWTH PERCENTAGE
// ======================================================

export const calculateGrowthPercentage = (

  currentValue,

  previousValue

) => {

  // ====================================================
  // VALIDATION
  // ====================================================

  if (previousValue === 0) {

    if (currentValue > 0)
      return 100;

    return 0;

  }

  // ====================================================
  // CALCULATION
  // ====================================================

  return Math.round(

    (
      (
        currentValue -
        previousValue
      ) /

      previousValue
    ) * 100

  );

};