import autoTable from "jspdf-autotable";

import {
  drawPDFPageHeader
} from "../sections/drawPDFPageHeader";

import {
  TABLE_LAYOUTS
} from "./tableLayouts";

export const drawPDFTable = ({

  doc,
  companyConfig,
  title,
  currentY,
  columns,
  rows,
  pageWidth,
  tableLayout = "default"

}) => {

  // ======================================================
  // SAFE PAGE WIDTH
  // ======================================================

  const safePageWidth =
    pageWidth ||
    doc.internal.pageSize.width;

  // ======================================================
  // GET LAYOUT
  // ======================================================

  const layout =
    TABLE_LAYOUTS[tableLayout] ||
    TABLE_LAYOUTS.default;

  // ======================================================
  // DETECT STATUS COLUMN
  // ======================================================

  const statusColumnIndex =
    columns.findIndex(
      (col) =>
        String(col)
          .toLowerCase()
          .includes("estado")
    );

  // ======================================================
  // TABLE
  // ======================================================

  autoTable(doc, {

    startY: currentY,

    head: [columns],

    body: rows,

    theme: "plain",

    margin: {

      top:
        layout.marginTop || 28,

      left: 14,

      right: 14,

      bottom: 18

    },

    // ======================================================
    // GLOBAL STYLES
    // ======================================================

    styles: {

      fontSize:
        layout.fontSize || 7.8,

      textColor: [24, 24, 27],

      lineWidth: 0,

      valign: "middle",

      overflow: "linebreak",

      cellPadding: {

        top:
          layout.paddingTop || 3,

        right:
          layout.paddingRight || 1.5,

        bottom:
          layout.paddingBottom || 3,

        left:
          layout.paddingLeft || 1.5

      }

    },

    // ======================================================
    // HEADER STYLES
    // ======================================================

    headStyles: {

      fillColor: [255, 255, 255],

      textColor: [17, 24, 39],

      fontStyle: "bold",

      fontSize:
        layout.headerFontSize || 8

    },

    // ======================================================
    // COLUMN STYLES
    // ======================================================

    columnStyles:
      layout.columnStyles || {},

    // ======================================================
    // CUSTOM DRAW
    // ======================================================

    didDrawCell: (data) => {

      const {
        cell,
        column,
        section
      } = data;

      // ======================================================
      // HEADER BORDER
      // ======================================================

      if (section === "head") {

        doc.setDrawColor(
          220,
          220,
          220
        );

        doc.setLineWidth(0.4);

        doc.line(

          cell.x,

          cell.y + cell.height,

          cell.x + cell.width,

          cell.y + cell.height

        );

      }

      // ======================================================
      // BODY DIVIDERS
      // ======================================================

      if (section === "body") {

        doc.setDrawColor(
          245,
          245,
          245
        );

        doc.setLineWidth(0.25);

        doc.line(

          cell.x,

          cell.y + cell.height,

          cell.x + cell.width,

          cell.y + cell.height

        );

      }

      // ======================================================
      // STATUS BADGES
      // ======================================================

      if (

        layout.enableStatusBadges &&

        statusColumnIndex !== -1 &&

        section === "body" &&

        column.index ===
        statusColumnIndex

      ) {

        const value =
          String(cell.raw || "")
            .toLowerCase();

        let bgColor =
          [229, 231, 235];

        let textColor =
          [75, 85, 99];

        if (
          value.includes("pagado")
        ) {

          bgColor =
            [220, 252, 231];

          textColor =
            [22, 163, 74];

        }

        if (
          value.includes("pendiente")
        ) {

          bgColor =
            [254, 243, 199];

          textColor =
            [217, 119, 6];

        }

        const badgeWidth =
          layout.badgeWidth || 22;

        const badgeHeight =
          layout.badgeHeight || 5.5;

        const badgeX =
          cell.x +
          (cell.width / 2) -
          (badgeWidth / 2);

        const badgeY =
          cell.y + 3.5;

        doc.setFillColor(
          ...bgColor
        );

        doc.roundedRect(

          badgeX,

          badgeY,

          badgeWidth,

          badgeHeight,

          2,

          2,

          "F"

        );

        doc.setTextColor(
          ...textColor
        );

        doc.setFontSize(
          layout.badgeFontSize || 6.8
        );

        doc.text(

          String(cell.raw),

          badgeX + 4,

          badgeY + 3.8

        );

      }

    },

    // ======================================================
    // REMOVE STATUS TEXT
    // ======================================================

    didParseCell: (data) => {

      if (

        layout.enableStatusBadges &&

        statusColumnIndex !== -1 &&

        data.section === "body" &&

        data.column.index ===
        statusColumnIndex

      ) {

        data.cell.text = [];

      }

    },

    // ======================================================
    // PAGE DRAW
    // ======================================================

    didDrawPage: (data) => {

      const pageNumber =
        data.pageNumber;

      // ======================================================
      // PAGE HEADER
      // ======================================================

      if (pageNumber > 1) {

        drawPDFPageHeader({

          doc,

          companyConfig,

          title

        });

      }

      // ======================================================
      // FOOTER
      // ======================================================

      const pageHeight =
        doc.internal.pageSize.height;

      const currentPageWidth =
        doc.internal.pageSize.width;

      doc.setFontSize(8.5);

      doc.setTextColor(150);

      // GENERATED DATE

      doc.text(

        `Generado el ${new Date().toLocaleString()}`,

        14,

        pageHeight - 14

      );

      // PAGE NUMBER

      const totalPages =
        doc.internal.getNumberOfPages();

      doc.text(

        `Página ${pageNumber} de ${totalPages}`,

        currentPageWidth - 45,

        pageHeight - 14

      );

    }

  });

};