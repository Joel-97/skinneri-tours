export const drawPDFFooter = ({
  doc
}) => {

  const pageHeight =  doc.internal.pageSize.height;
  const pageWidth =  doc.internal.pageSize.width;

  doc.setFontSize(9);

  doc.setTextColor(140);

  // ======================================================
  // GENERATED DATE
  // ======================================================

  doc.text(
    `Generado el ${new Date().toLocaleString()}`,
    14,
    pageHeight - 10
  );

  // ======================================================
  // PAGE NUMBER
  // ======================================================

  const pageNumber =
    doc.getCurrentPageInfo().pageNumber;

  doc.text(
    `Página ${pageNumber}`,
    pageWidth - 35,
    pageHeight - 10
  );

};