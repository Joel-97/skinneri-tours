export const drawPDFPageHeader = ({

  doc,

  companyConfig,

  title

}) => {

  // ======================================================
  // PAGE WIDTH
  // ======================================================

  const pageWidth =
    doc.internal.pageSize.width;

  // ======================================================
  // TOP LINE
  // ======================================================

  doc.setDrawColor(
    companyConfig.primaryColor
  );

  doc.setLineWidth(0.8);

  doc.line(
    14,
    10,
    pageWidth - 14,
    10
  );

  // ======================================================
  // COMPANY NAME
  // ======================================================

  doc.setFontSize(9.5);

  doc.setTextColor(45);

  doc.text(
    companyConfig.companyName,
    14,
    18
  );

  // ======================================================
  // REPORT TITLE
  // ======================================================

  doc.setFontSize(9.5);

  doc.setTextColor(120);

  doc.text(
    title,
    pageWidth - 14,
    18,
    {
      align: "right"
    }
  );

};