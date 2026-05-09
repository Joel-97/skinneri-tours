import {  generateProfessionalReportPDF } from "../core/generateProfessionalReportPDF";
import { formatDateCustom } from "../../services/Tools";

export const generateCommissionPDF = async ({

  company,
  commissions = [],
  totals = {},
  filters = {}

}) => {

  // ======================================================
  // ROWS
  // ======================================================

  const rows = commissions.map(
    (c, i) => [

      i + 1,

      formatDateCustom(
        c.dateStr
      ),

      c.beneficiaryName || "-",

      c.type === "percentage"
        ? "Porcentaje"
        : "Monto fijo",

      `$${Number(
        c.baseAmount || 0
      ).toFixed(2)}`,

      `$${Number(
        c.amount || 0
      ).toFixed(2)}`,

      c.status === "paid"
        ? "Pagado"
        : "Pendiente"

    ]
  );

  // ======================================================
  // GENERATE PDF
  // ======================================================

   await generateProfessionalReportPDF({

    // ======================================================
    // GENERAL
    // ======================================================

    company,

    orientation: "portrait",

    title:
      "Reporte de Comisiones",

    subtitle:
      "Reporte financiero de comisiones.",

    fileName:
      "commission_report.pdf",

    // ======================================================
    // FILTERS
    // ======================================================

    filters: {

      Desde:
        filters.startDateFilter || "-",

      Hasta:
        filters.endDateFilter || "-"

    },

    // ======================================================
    // KPIS
    // ======================================================

    kpis: [

      {
        label: "Total",
        value:
          `$${Number(
            totals.total || 0
          ).toFixed(2)}`
      },

      {
        label: "Pendiente",
        value:
          `$${Number(
            totals.pending || 0
          ).toFixed(2)}`
      },

      {
        label: "Pagado",
        value:
          `$${Number(
            totals.paid || 0
          ).toFixed(2)}`
      }

    ],

    // ======================================================
    // TABLE
    // ======================================================

    columns: [

      "#",

      "Fecha",

      "Comisionista",

      "Tipo",

      "Base",

      "Comisión",

      "Estado"

    ],

    rows

  });

};