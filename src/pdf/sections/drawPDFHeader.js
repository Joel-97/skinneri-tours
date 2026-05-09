export const drawPDFHeader = ({

  doc,

  companyConfig,

  title,

  subtitle,

  currentY,

  logoBase64

}) => {

  // ======================================================
  // PAGE WIDTH
  // ======================================================

  const pageWidth =
    doc.internal.pageSize.getWidth();

  // ======================================================
  // TOP LINE
  // ======================================================

  doc.setDrawColor(
    companyConfig.primaryColor
  );

  doc.setLineWidth(1);

  doc.line(
    14,
    currentY,
    pageWidth - 14,
    currentY
  );

  currentY += 10;

  // ======================================================
  // LOGO / AVATAR
  // ======================================================

  const logoSize = 18;

  if (logoBase64) {

    try {

      doc.addImage(

        logoBase64,

        "PNG",

        14,

        currentY + 5,

        logoSize,

        logoSize

      );

    } catch (error) {

      console.error(
        "Error rendering logo:",
        error
      );

      // ================================================
      // FALLBACK AVATAR
      // ================================================

      doc.setFillColor(
        companyConfig.primaryColor
      );

      doc.roundedRect(
        14,
        currentY,
        logoSize,
        logoSize,
        4,
        4,
        "F"
      );

      doc.setFontSize(18);

      doc.setTextColor(255);

      doc.text(

        (
          companyConfig.companyName?.[0] ||
          "C"
        ).toUpperCase(),

        20,

        currentY + 12

      );

    }

  } else {

    // ==================================================
    // FALLBACK AVATAR
    // ==================================================

    doc.setFillColor(
      companyConfig.primaryColor
    );

    doc.roundedRect(
      14,
      currentY,
      logoSize,
      logoSize,
      4,
      4,
      "F"
    );

    doc.setFontSize(18);

    doc.setTextColor(255);

    doc.text(

      (
        companyConfig.companyName?.[0] ||
        "C"
      ).toUpperCase(),

      20,

      currentY + 12

    );

  }

  // ======================================================
  // COMPANY INFO
  // ======================================================

  const infoX = 38;

  doc.setFontSize(20);

  doc.setTextColor(
    companyConfig.primaryColor
  );

  doc.text(

    companyConfig.companyName,

    infoX,

    currentY + 8

  );

  currentY += 16;

  doc.setFontSize(10);

  doc.setTextColor(110);

  [
    companyConfig.email,
    companyConfig.phone,
    companyConfig.website
  ]
    .filter(Boolean)
    .forEach((line) => {

      doc.text(

        line,

        infoX,

        currentY

      );

      currentY += 5;

    });

  // ======================================================
  // REPORT INFO
  // ======================================================

  const rightX =
    pageWidth - 14;

  const topInfoY =
    currentY - 18;

  doc.setFontSize(11);

  doc.setTextColor(120);

  doc.text(

    title,

    rightX,

    topInfoY,

    {
      align: "right"
    }

  );

  doc.setFontSize(10);

  doc.text(

    `Generado:`,

    rightX,

    topInfoY + 7,

    {
      align: "right"
    }

  );

  doc.text(

    new Date().toLocaleDateString(),

    rightX,

    topInfoY + 13,

    {
      align: "right"
    }

  );

  // ======================================================
  // DIVIDER
  // ======================================================

  currentY += 6;

  doc.setDrawColor(225);

  doc.setLineWidth(0.5);

  doc.line(
    14,
    currentY,
    pageWidth - 14,
    currentY
  );

  currentY += 12;

  // ======================================================
  // REPORT TITLE
  // ======================================================

  doc.setFontSize(24);

  doc.setTextColor(20);

  doc.text(

    title,

    14,

    currentY

  );

  currentY += 10;

  // ======================================================
  // SUBTITLE
  // ======================================================

  if (subtitle) {

    doc.setFontSize(11);

    doc.setTextColor(120);

    doc.text(

      subtitle,

      14,

      currentY

    );

    currentY += 10;

  }

  return currentY;

};