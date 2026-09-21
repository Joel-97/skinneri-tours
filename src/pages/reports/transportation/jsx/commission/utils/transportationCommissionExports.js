/* ==========================================================
   TRANSPORTATION COMMISSION EXPORTS
========================================================== */

import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";


import {
    formatCommissionCurrency,
    formatCommissionDate,
    normalizeCommissionCurrency,
    normalizeCommissionNumber,
    buildCommissionExportRow,
    buildCommissionExportSummary
} from "./transportationCommissionUtils";


/* ==========================================================
   CONSTANTS
========================================================== */

const REPORT_TITLE =
    "Reporte de Comisiones";


const DEFAULT_CURRENCY =
    "USD";


/* ==========================================================
   INTERNAL HELPERS
========================================================== */

const getCurrency = (
    currency,
    reservations = []
) => {

    const normalized =
        normalizeCommissionCurrency(
            currency
        );


    if (normalized) {
        return normalized;
    }


    const reservationCurrency =
        reservations.find(
            (reservation) =>
                reservation?.currency
        )?.currency;


    return (
        normalizeCommissionCurrency(
            reservationCurrency
        ) ||
        DEFAULT_CURRENCY
    );
};


const getFileDate = () => {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
};


const buildFileName = (
    extension
) => {

    return `reporte-comisiones-${getFileDate()}.${extension}`;
};


/* ==========================================================
   EXCEL
========================================================== */

export const exportTransportationCommissionToExcel = async ({
    reservations = [],
    summary = {},
    filters = {},
    currency = DEFAULT_CURRENCY
} = {}) => {

    const safeReservations =
        Array.isArray(
            reservations
        )
            ? reservations
            : [];


    const reportCurrency =
        getCurrency(
            currency,
            safeReservations
        );


    /* ======================================================
       DETAIL DATA
    ====================================================== */

    const detailRows =
        safeReservations.map(
            buildCommissionExportRow
        );


    /* ======================================================
       SUMMARY DATA
    ====================================================== */

    const summaryData =
        buildCommissionExportSummary(
            summary,
            reportCurrency
        );


    const summaryRows = [
        {
            "Métrica":
                "Reservaciones",

            "Valor":
                summaryData[
                    "Reservaciones"
                ]
        },

        {
            "Métrica":
                "Pasajeros",

            "Valor":
                summaryData[
                    "Pasajeros"
                ]
        },

        {
            "Métrica":
                "Ventas brutas",

            "Valor":
                summaryData[
                    "Ventas brutas"
                ]
        },

        {
            "Métrica":
                "Descuentos",

            "Valor":
                summaryData[
                    "Descuentos"
                ]
        },

        {
            "Métrica":
                "Total",

            "Valor":
                summaryData[
                    "Total"
                ]
        },

        {
            "Métrica":
                "Comisiones",

            "Valor":
                summaryData[
                    "Comisiones"
                ]
        },

        {
            "Métrica":
                "Tasa efectiva",

            "Valor":
                `${normalizeCommissionNumber(
                    summaryData[
                        "Tasa efectiva"
                    ]
                ).toFixed(2)}%`
        },

        {
            "Métrica":
                "Moneda",

            "Valor":
                reportCurrency
        }
    ];


    /* ======================================================
       FILTER INFORMATION
    ====================================================== */

    const filterRows = [];


    if (
        filters?.startDate
    ) {

        filterRows.push({

            "Filtro":
                "Fecha inicial",

            "Valor":
                formatCommissionDate(
                    filters.startDate
                )

        });

    }


    if (
        filters?.endDate
    ) {

        filterRows.push({

            "Filtro":
                "Fecha final",

            "Valor":
                formatCommissionDate(
                    filters.endDate
                )

        });

    }


    if (
        filters?.serviceType
    ) {

        filterRows.push({

            "Filtro":
                "Servicio",

            "Valor":
                filters.serviceType

        });

    }


    if (
        filters?.origin
    ) {

        filterRows.push({

            "Filtro":
                "Origen",

            "Valor":
                filters.origin

        });

    }


    if (
        filters?.destination
    ) {

        filterRows.push({

            "Filtro":
                "Destino",

            "Valor":
                filters.destination

        });

    }


    if (
        filters?.driver
    ) {

        filterRows.push({

            "Filtro":
                "Conductor",

            "Valor":
                filters.driver

        });

    }


    if (
        filters?.bookingSource
    ) {

        filterRows.push({

            "Filtro":
                "Fuente de reserva",

            "Valor":
                filters.bookingSource

        });

    }


    if (
        filters?.commissionType
    ) {

        filterRows.push({

            "Filtro":
                "Tipo de comisión",

            "Valor":
                filters.commissionType

        });

    }


    if (
        filters?.status
    ) {

        filterRows.push({

            "Filtro":
                "Estado",

            "Valor":
                filters.status

        });

    }


    /* ======================================================
       WORKBOOK
    ====================================================== */

    const workbook =
        XLSX.utils.book_new();


    /* ======================================================
       SUMMARY SHEET
    ====================================================== */

    const summarySheetData = [

        [
            REPORT_TITLE
        ],

        [],

        [
            "Métrica",
            "Valor"
        ],

        ...summaryRows

    ];


    if (
        filterRows.length > 0
    ) {

        summarySheetData.push(
            [],
            [
                "Filtros aplicados"
            ],
            [
                "Filtro",
                "Valor"
            ],
            ...filterRows
        );

    }


    const summarySheet =
        XLSX.utils.aoa_to_sheet(
            summarySheetData
        );


    summarySheet["!cols"] = [
        {
            width: 28
        },
        {
            width: 28
        }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Resumen"
    );


    /* ======================================================
       DETAIL SHEET
    ====================================================== */

    const detailSheet =
        XLSX.utils.json_to_sheet(
            detailRows
        );


    detailSheet["!cols"] = [
        {
            width: 14
        },
        {
            width: 18
        },
        {
            width: 25
        },
        {
            width: 24
        },
        {
            width: 22
        },
        {
            width: 22
        },
        {
            width: 22
        },
        {
            width: 15
        },
        {
            width: 18
        },
        {
            width: 16
        },
        {
            width: 16
        },
        {
            width: 12
        },
        {
            width: 16
        }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        detailSheet,
        "Detalle"
    );


    /* ======================================================
       WRITE FILE
    ====================================================== */

    XLSX.writeFile(
        workbook,
        buildFileName(
            "xlsx"
        )
    );
};


/* ==========================================================
   PDF
========================================================== */

export const exportTransportationCommissionToPDF = async ({
    reservations = [],
    summary = {},
    filters = {},
    currency = DEFAULT_CURRENCY
} = {}) => {

    const safeReservations =
        Array.isArray(
            reservations
        )
            ? reservations
            : [];


    const reportCurrency =
        getCurrency(
            currency,
            safeReservations
        );


    const doc =
        new jsPDF({
            orientation:
                "landscape",

            unit:
                "mm",

            format:
                "a4"
        });


    /* ======================================================
       HEADER
    ====================================================== */

    doc.setFontSize(
        16
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        REPORT_TITLE,
        14,
        16
    );


    doc.setFontSize(
        9
    );

    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.text(
        `Moneda: ${reportCurrency}`,
        14,
        23
    );


    doc.text(
        `Generado: ${getFileDate()}`,
        14,
        29
    );


    /* ======================================================
       SUMMARY
    ====================================================== */

    const summaryBody = [

        [
            "Reservaciones",
            String(
                normalizeCommissionNumber(
                    summary.reservationCount
                )
            )
        ],

        [
            "Pasajeros",
            String(
                normalizeCommissionNumber(
                    summary.passengerCount
                )
            )
        ],

        [
            "Ventas brutas",
            formatCommissionCurrency(
                summary.grossSales,
                reportCurrency
            )
        ],

        [
            "Descuentos",
            formatCommissionCurrency(
                summary.discounts,
                reportCurrency
            )
        ],

        [
            "Total",
            formatCommissionCurrency(
                summary.total,
                reportCurrency
            )
        ],

        [
            "Comisiones",
            formatCommissionCurrency(
                summary.commissions,
                reportCurrency
            )
        ],

        [
            "Tasa efectiva",
            `${normalizeCommissionNumber(
                summary.commissionRate
            ).toFixed(2)}%`
        ]

    ];


    autoTable(
        doc,
        {
            startY: 35,

            head: [
                [
                    "Resumen",
                    "Valor"
                ]
            ],

            body:
                summaryBody,

            theme:
                "grid",

            styles: {
                fontSize: 8,
                cellPadding: 2.5
            },

            headStyles: {
                fontStyle:
                    "bold"
            },

            columnStyles: {
                0: {
                    cellWidth: 45
                },

                1: {
                    cellWidth: 45
                }
            }
        }
    );


    /* ======================================================
       DETAIL TABLE
    ====================================================== */

    const startY =
        (
            doc.lastAutoTable?.finalY ||
            35
        ) + 10;


    const detailBody =
        safeReservations.map(
            (reservation) => {

                const currencyCode =
                    normalizeCommissionCurrency(
                        reservation.currency
                    ) ||
                    reportCurrency;


                const commissionType =
                    String(
                        reservation.commissionType ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const commissionValue =
                    commissionType ===
                    "percentage"
                        ? `${normalizeCommissionNumber(
                            reservation.commissionValue
                        ).toFixed(2)}%`
                        : formatCommissionCurrency(
                            reservation.commissionValue,
                            currencyCode
                        );


                return [

                    formatCommissionDate(
                        reservation.serviceDate
                    ),

                    reservation.reservationDisplayNumber ||
                    reservation.reservationNumber ||
                    reservation.id ||
                    "-",

                    reservation.clientDisplayName ||
                    reservation.clientName ||
                    "-",

                    reservation.serviceDisplayName ||
                    reservation.serviceTypeName ||
                    "-",

                    reservation.driverDisplayName ||
                    reservation.driverName ||
                    "-",

                    reservation.locationFromDisplayName ||
                    reservation.locationFromName ||
                    "-",

                    reservation.locationToDisplayName ||
                    reservation.locationToName ||
                    "-",

                    formatCommissionCurrency(
                        reservation.subtotal,
                        currencyCode
                    ),

                    commissionValue,

                    formatCommissionCurrency(
                        reservation.commissionAmount,
                        currencyCode
                    ),

                    currencyCode,

                    reservation.statusDisplayName ||
                    reservation.statusName ||
                    reservation.status ||
                    "-"

                ];

            }
        );


    autoTable(
        doc,
        {
            startY,

            head: [
                [
                    "Fecha",
                    "Reservación",
                    "Cliente",
                    "Servicio",
                    "Conductor",
                    "Origen",
                    "Destino",
                    "Subtotal",
                    "Valor comisión",
                    "Comisión",
                    "Moneda",
                    "Estado"
                ]
            ],

            body:
                detailBody,

            theme:
                "grid",

            styles: {
                fontSize: 6.5,
                cellPadding: 1.8,
                overflow:
                    "linebreak"
            },

            headStyles: {
                fontSize: 7,
                fontStyle:
                    "bold"
            },

            margin: {
                left: 8,
                right: 8
            }
        }
    );


    /* ======================================================
       FOOTER
    ====================================================== */

    const pageCount =
        doc.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= pageCount;
        page += 1
    ) {

        doc.setPage(
            page
        );


        const pageHeight =
            doc.internal.pageSize.height;


        doc.setFontSize(
            7
        );

        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            `Página ${page} de ${pageCount}`,
            14,
            pageHeight - 8
        );

    }


    /* ======================================================
       SAVE
    ====================================================== */

    doc.save(
        buildFileName(
            "pdf"
        )
    );
};


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    exportTransportationCommissionToExcel,

    exportTransportationCommissionToPDF

};