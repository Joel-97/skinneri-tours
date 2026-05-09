import jsPDF from "jspdf";
import { getCompanyPDFConfig } from "./companyPdfConfig";
import { drawPDFHeader } from "../sections/drawPDFHeader";
import { drawPDFFooter } from "../sections/drawPDFFooter";
import { drawPDFKPIs } from "../sections/drawPDFKPIs";
import { drawPDFTable } from "../tables/drawPDFTable";
import { loadImageAsBase64 } from "../utils/loadImageAsBase64";

// ======================================================
// GENERATE PROFESSIONAL REPORT PDF
// ======================================================

export const generateProfessionalReportPDF = async ({

  company,

  title = "Report",

  subtitle = "",

  filters = {},

  kpis = [],

  columns = [],

  rows = [],

  tableLayout = "default",

  fileName = "report.pdf",

  orientation = "portrait"
}) => {

  try {

    // ==================================================
    // INIT PDF
    // ==================================================

    const doc =
      new jsPDF({

        orientation,

        unit: "mm",

        format: "a4"

      });

    const companyConfig =
      getCompanyPDFConfig(
        company
      );

    let currentY = 20;

    // ==================================================
    // LOAD LOGO
    // ==================================================

    let logoBase64 = null;

    if (company?.logoURL) {

      try {

        logoBase64 =
          await loadImageAsBase64(
            company.logoURL
          );

      } catch (error) {

        console.error(

          "Error loading logo:",

          error

        );

      }

    }

    // ==================================================
    // HEADER
    // ==================================================

    currentY = drawPDFHeader({

      doc,

      companyConfig,

      title,

      subtitle,

      currentY,

      logoBase64

    });

    // ==================================================
    // FILTERS
    // ==================================================

    if (
      Object.keys(filters).length > 0
    ) {

      Object.entries(filters)
        .forEach(([key, value]) => {

          doc.setFontSize(10);

          doc.setTextColor(120);

          doc.text(

            `${key}: ${value || "-"}`,

            14,

            currentY

          );

          currentY += 5;

        });

      currentY += 3;

    }

    // ==================================================
    // KPI CARDS
    // ==================================================

    currentY = drawPDFKPIs({

      doc,

      companyConfig,

      kpis,

      currentY,

      pageWidth:
        doc.internal.pageSize.width

    });

    // ==================================================
    // TABLE
    // ======================================================

    drawPDFTable({

      doc,

      companyConfig,

      title,

      currentY,

      columns,

      rows,

      pageWidth:
        doc.internal.pageSize.width,

      tableLayout,

      orientation

    });

    // ==================================================
    // FOOTER
    // ======================================================

    // drawPDFFooter({

    //   doc

    // });

    // ==================================================
    // SAVE PDF
    // ==================================================

    doc.save(fileName);

  } catch (error) {

    console.error("Error generating PDF:", error);

  }

};