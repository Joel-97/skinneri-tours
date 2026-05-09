import {
  generateProfessionalReportPDF
} from "../core/generateProfessionalReportPDF";

// ======================================================
// GENERATE TRANSPORTATION PDF
// ======================================================

export const generateTransportationPDF = async ({

  company,

  title = "Reporte de Transportes",

  subtitle = "",

  filters = {},

  kpis = [],

  columns = [],

  rows = [],

  fileName = "transportation_report.pdf",

  orientation = "landscape"

}) => {

  try {

    // ==================================================
    // GENERATE PDF
    // ==================================================

    await generateProfessionalReportPDF({

      company,

      title,

      subtitle,

      filters,

      kpis,

      columns,

      rows,

      fileName,

      orientation,

      // ================================================
      // TABLE LAYOUT
      // ================================================

      tableLayout:
        "transportation"

    });

  } catch (error) {

    console.error(

      "Error generating transportation PDF:",

      error

    );

  }

};