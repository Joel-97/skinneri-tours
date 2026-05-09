export const TABLE_LAYOUTS = {

  // ======================================================
  // DEFAULT
  // ======================================================

  default: {

    fontSize: 7.8,

    headerFontSize: 8,

    marginTop: 28,

    paddingTop: 3,
    paddingRight: 1.5,
    paddingBottom: 3,
    paddingLeft: 1.5,

    enableStatusBadges: false,

    columnStyles: {}

  },

  // ======================================================
  // COMMISSIONS
  // ======================================================

  commissions: {

    fontSize: 8,

    headerFontSize: 8.2,

    marginTop: 28,

    paddingTop: 4,
    paddingRight: 2,
    paddingBottom: 4,
    paddingLeft: 2,

    enableStatusBadges: true,

    badgeWidth: 24,

    badgeHeight: 6,

    badgeFontSize: 6.8,

    columnStyles: {

      // #

      0: {

        halign: "center",

        cellWidth: 12,

        textColor: [120, 120, 120]

      },

      // FECHA

      1: {

        cellWidth: 30

      },

      // COMISIONISTA

      2: {

        cellWidth: 52

      },

      // TIPO

      3: {

        cellWidth: 28

      },

      // BASE

      4: {

        halign: "right",

        cellWidth: 26

      },

      // COMISIÓN

      5: {

        halign: "right",

        fontStyle: "bold",

        cellWidth: 30

      },

      // ESTADO

      6: {

        halign: "center",

        cellWidth: 34

      }

    }

  },

  // ======================================================
  // TRANSPORTATION
  // ======================================================

  transportation: {

    tableWidth: "auto",

    styles: {

      fontSize: 10,

      cellPadding: {
        top: 5,
        right: 4,
        bottom: 5,
        left: 4
      }

    },

    headStyles: {

      fontSize: 10,

      fontStyle: "bold"

    },

    columnStyles: {

      0: { cellWidth: 14 }, // #

      1: { cellWidth: 54 }, // Cliente

      2: { cellWidth: 32 }, // Fecha

      3: { cellWidth: 34 }, // Chofer

      4: { cellWidth: 34 }, // Pago

      5: { cellWidth: 28 }, // Subtotal

      6: { cellWidth: 24 }, // Desc.

      7: { cellWidth: 24 }, // Imp.

      8: { cellWidth: 34 }  // Total

    }

  }

};