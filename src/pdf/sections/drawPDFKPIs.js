export const drawPDFKPIs = ({

  doc,
  companyConfig,
  kpis,
  currentY

}) => {

  if (!kpis?.length)
    return currentY;

  // ======================================================
  // SAFE PAGE WIDTH
  // ======================================================

  const pageWidth =
    doc.internal.pageSize.width;

  // ======================================================
  // CONFIG
  // ======================================================

  const startX = 14;

  const gap = 6;

  const usableWidth =
    pageWidth - 28;

  let cardWidth =
    (
      usableWidth
      - (gap * (kpis.length - 1))
    ) / kpis.length;

  // ======================================================
  // MIN WIDTH
  // ======================================================

  if (
    !cardWidth ||
    cardWidth < 30
  ) {

    cardWidth = 30;

  }

  const cardHeight = 22;

  // ======================================================
  // DRAW KPI CARDS
  // ======================================================

  kpis.forEach((kpi, index) => {

    const x =
      startX +
      (index * (cardWidth + gap));

    // ======================================================
    // PREVENT OVERFLOW
    // ======================================================

    if (
      x + cardWidth >
      pageWidth - 14
    ) {
      return;
    }

    // ======================================================
    // CARD BG
    // ======================================================

    doc.setFillColor(
      248,
      250,
      252
    );

    doc.roundedRect(
      x,
      currentY,
      cardWidth,
      cardHeight,
      2,
      2,
      "F"
    );

    // ======================================================
    // FIRST CARD ACCENT
    // ======================================================

    if (index === 0) {

      doc.setFillColor(
        companyConfig.primaryColor
      );

      doc.rect(
        x,
        currentY,
        2,
        cardHeight,
        "F"
      );

    }

    // ======================================================
    // LABEL
    // ======================================================

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(
      String(kpi.label || ""),
      x + 6,
      currentY + 7
    );

    // ======================================================
    // VALUE
    // ======================================================

    doc.setFontSize(13);

    if (index === 0) {

      doc.setTextColor(
        companyConfig.primaryColor
      );

    } else {

      doc.setTextColor(25);

    }

    doc.text(
      String(kpi.value || ""),
      x + 6,
      currentY + 16
    );

  });

  // ======================================================
  // RETURN
  // ======================================================

  return currentY + 30;

};