import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
    formatFinancialDate,
    formatFinancialCurrency,
    normalizeCurrencyCode,
    getFinancialClientName,
    getFinancialServiceName,
    getFinancialGrossSales,
    getFinancialDiscount,
    getFinancialTax,
    getFinancialCommission,
    getFinancialTotal
} from "./transportationFinancialUtils";


/*
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

const getReportCurrency = (
    reservations = [],
    filters = {}
) => {
    if (filters.currency) {
        return normalizeCurrencyCode(
            filters.currency
        );
    }

    const currencies = [
        ...new Set(
            reservations
                .map((item) =>
                    normalizeCurrencyCode(
                        item.currency
                    )
                )
                .filter(Boolean)
        )
    ];

    if (currencies.length === 1) {
        return currencies[0];
    }

    return null;
};


const formatExportNumber = (
    value
) => {
    const number = Number(value || 0);

    return Number.isFinite(number)
        ? Number(number.toFixed(2))
        : 0;
};


const getExportFileDate = () => {
    const now = new Date();

    const year =
        now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


/*
 * ---------------------------------------------------------
 * EXCEL
 * ---------------------------------------------------------
 */

export const exportTransportationFinancialToExcel = async ({
    reservations = [],
    summary = {},
    filters = {}
}) => {
    const workbook =
        XLSX.utils.book_new();

    const currency =
        getReportCurrency(
            reservations,
            filters
        );

    /*
     * -----------------------------------------------------
     * DETAIL SHEET
     * -----------------------------------------------------
     */

    const detailRows =
        reservations.map(
            (reservation) => ({
                Reserva:
                    reservation.reservationNumber ||
                    "",

                Fecha:
                    formatFinancialDate(
                        reservation.serviceDate
                    ),

                Cliente:
                    getFinancialClientName(
                        reservation
                    ),

                Servicio:
                    getFinancialServiceName(
                        reservation
                    ),

                Moneda:
                    normalizeCurrencyCode(
                        reservation.currency
                    ),

                Base:
                    formatExportNumber(
                        getFinancialGrossSales(
                            reservation
                        )
                    ),

                Descuento:
                    formatExportNumber(
                        getFinancialDiscount(
                            reservation
                        )
                    ),

                Impuesto:
                    formatExportNumber(
                        getFinancialTax(
                            reservation
                        )
                    ),

                Comisión:
                    formatExportNumber(
                        getFinancialCommission(
                            reservation
                        )
                    ),

                Total:
                    formatExportNumber(
                        getFinancialTotal(
                            reservation
                        )
                    )
            })
        );


    const detailWorksheet =
        XLSX.utils.json_to_sheet(
            detailRows
        );


    detailWorksheet["!cols"] = [
        { wch: 20 },
        { wch: 14 },
        { wch: 28 },
        { wch: 28 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        detailWorksheet,
        "Detalle"
    );


    /*
     * -----------------------------------------------------
     * SUMMARY SHEET
     * -----------------------------------------------------
     */

    const summaryRows = [
        {
            Indicador:
                "Reservaciones",

            Valor:
                Number(
                    summary.reservationCount || 0
                )
        },

        {
            Indicador:
                "Pasajeros",

            Valor:
                Number(
                    summary.passengerCount || 0
                )
        },

        {
            Indicador:
                "Ventas brutas",

            Valor:
                formatExportNumber(
                    summary.grossSales
                )
        },

        {
            Indicador:
                "Descuentos",

            Valor:
                formatExportNumber(
                    summary.discounts
                )
        },

        {
            Indicador:
                "Base imponible",

            Valor:
                formatExportNumber(
                    summary.taxableAmount
                )
        },

        {
            Indicador:
                "Impuestos",

            Valor:
                formatExportNumber(
                    summary.taxes
                )
        },

        {
            Indicador:
                "Comisiones",

            Valor:
                formatExportNumber(
                    summary.commissions
                )
        },

        {
            Indicador:
                "Total",

            Valor:
                formatExportNumber(
                    summary.total
                )
        }
    ];


    if (currency) {
        summaryRows.push({
            Indicador:
                "Moneda",

            Valor:
                currency
        });
    }


    const summaryWorksheet =
        XLSX.utils.json_to_sheet(
            summaryRows
        );


    summaryWorksheet["!cols"] = [
        { wch: 25 },
        { wch: 20 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        summaryWorksheet,
        "Resumen"
    );


    /*
     * -----------------------------------------------------
     * FILTERS SHEET
     * -----------------------------------------------------
     */

    const filterRows = [
        {
            Filtro: "Desde",
            Valor: filters.startDate || "Todos"
        },
        {
            Filtro: "Hasta",
            Valor: filters.endDate || "Todos"
        },
        {
            Filtro: "Moneda",
            Valor: filters.currency || "Todas"
        },
        {
            Filtro: "Servicio",
            Valor: filters.serviceType || "Todos"
        },
        {
            Filtro: "Origen",
            Valor: filters.origin || "Todos"
        },
        {
            Filtro: "Destino",
            Valor: filters.destination || "Todos"
        },
        {
            Filtro: "Chofer",
            Valor: filters.driver || "Todos"
        },
        {
            Filtro: "Fuente",
            Valor: filters.bookingSource || "Todas"
        },
        {
            Filtro: "Pagador",
            Valor: filters.payer || "Todos"
        },
        {
            Filtro: "Estado",
            Valor: filters.status || "Todos"
        },
        {
            Filtro: "Búsqueda",
            Valor: filters.searchTerm || "Ninguna"
        }
    ];


    const filtersWorksheet =
        XLSX.utils.json_to_sheet(
            filterRows
        );


    filtersWorksheet["!cols"] = [
        { wch: 20 },
        { wch: 35 }
    ];


    XLSX.utils.book_append_sheet(
        workbook,
        filtersWorksheet,
        "Filtros"
    );


    /*
     * -----------------------------------------------------
     * DOWNLOAD
     * -----------------------------------------------------
     */

    const fileName =
        `reporte-financiero-transporte-${getExportFileDate()}.xlsx`;


    XLSX.writeFile(
        workbook,
        fileName
    );
};


/*
 * ---------------------------------------------------------
 * PDF
 * ---------------------------------------------------------
 */

export const exportTransportationFinancialToPDF = async ({
    reservations = [],
    summary = {},
    filters = {}
}) => {
    const document =
        new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });


    const currency =
        getReportCurrency(
            reservations,
            filters
        );


    /*
     * -----------------------------------------------------
     * HEADER
     * -----------------------------------------------------
     */

    document.setFontSize(18);

    document.text(
        "Reporte Financiero de Transporte",
        14,
        15
    );


    document.setFontSize(9);

    document.text(
        `Generado: ${new Date().toLocaleString(
            "es-CR"
        )}`,
        14,
        21
    );


    if (filters.startDate || filters.endDate) {
        document.text(
            `Periodo: ${
                filters.startDate || "Inicio"
            } - ${
                filters.endDate || "Actual"
            }`,
            14,
            27
        );
    }


    /*
     * -----------------------------------------------------
     * SUMMARY
     * -----------------------------------------------------
     */

    const summaryY =
        filters.startDate || filters.endDate
            ? 34
            : 27;


    const summaryData = [
        [
            "Reservaciones",
            String(
                summary.reservationCount || 0
            )
        ],
        [
            "Pasajeros",
            String(
                summary.passengerCount || 0
            )
        ],
        [
            "Ventas brutas",
            formatFinancialCurrency(
                summary.grossSales,
                currency || "USD"
            )
        ],
        [
            "Descuentos",
            formatFinancialCurrency(
                summary.discounts,
                currency || "USD"
            )
        ],
        [
            "Impuestos",
            formatFinancialCurrency(
                summary.taxes,
                currency || "USD"
            )
        ],
        [
            "Comisiones",
            formatFinancialCurrency(
                summary.commissions,
                currency || "USD"
            )
        ],
        [
            "Total",
            formatFinancialCurrency(
                summary.total,
                currency || "USD"
            )
        ]
    ];


    autoTable(
        document,
        {
            startY: summaryY,

            head: [
                [
                    "Indicador",
                    "Valor"
                ]
            ],

            body: summaryData,

            theme: "grid",

            styles: {
                fontSize: 8,
                cellPadding: 2
            },

            headStyles: {
                fillColor: [
                    8,
                    32,
                    75
                ],
                textColor: 255
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


    /*
     * -----------------------------------------------------
     * DETAIL TABLE
     * -----------------------------------------------------
     */

    const detailStartY =
        document.lastAutoTable.finalY + 8;


    const tableRows =
        reservations.map(
            (reservation) => {
                const rowCurrency =
                    normalizeCurrencyCode(
                        reservation.currency
                    );

                return [
                    reservation.reservationNumber ||
                        "—",

                    formatFinancialDate(
                        reservation.serviceDate
                    ),

                    getFinancialClientName(
                        reservation
                    ),

                    getFinancialServiceName(
                        reservation
                    ),

                    rowCurrency,

                    formatFinancialCurrency(
                        getFinancialGrossSales(
                            reservation
                        ),
                        rowCurrency
                    ),

                    formatFinancialCurrency(
                        getFinancialDiscount(
                            reservation
                        ),
                        rowCurrency
                    ),

                    formatFinancialCurrency(
                        getFinancialTax(
                            reservation
                        ),
                        rowCurrency
                    ),

                    formatFinancialCurrency(
                        getFinancialCommission(
                            reservation
                        ),
                        rowCurrency
                    ),

                    formatFinancialCurrency(
                        getFinancialTotal(
                            reservation
                        ),
                        rowCurrency
                    )
                ];
            }
        );


    autoTable(
        document,
        {
            startY: detailStartY,

            head: [
                [
                    "Reserva",
                    "Fecha",
                    "Cliente",
                    "Servicio",
                    "Moneda",
                    "Base",
                    "Descuento",
                    "Impuesto",
                    "Comisión",
                    "Total"
                ]
            ],

            body: tableRows,

            theme: "striped",

            styles: {
                fontSize: 7,
                cellPadding: 2,
                overflow: "linebreak"
            },

            headStyles: {
                fillColor: [
                    8,
                    32,
                    75
                ],
                textColor: 255
            },

            columnStyles: {
                0: {
                    cellWidth: 25
                },

                1: {
                    cellWidth: 20
                },

                2: {
                    cellWidth: 35
                },

                3: {
                    cellWidth: 35
                },

                4: {
                    cellWidth: 15
                },

                5: {
                    cellWidth: 25
                },

                6: {
                    cellWidth: 25
                },

                7: {
                    cellWidth: 25
                },

                8: {
                    cellWidth: 25
                },

                9: {
                    cellWidth: 25
                }
            },

            didDrawPage: (
                data
            ) => {
                document.setFontSize(7);

                document.text(
                    `Página ${
                        document.internal.getNumberOfPages()
                    }`,
                    document.internal.pageSize
                        .getWidth() - 25,
                    document.internal.pageSize
                        .getHeight() - 8
                );
            }
        }
    );


    /*
     * -----------------------------------------------------
     * DOWNLOAD
     * -----------------------------------------------------
     */

    const fileName =
        `reporte-financiero-transporte-${getExportFileDate()}.pdf`;


    document.save(
        fileName
    );
};


export default {
    exportTransportationFinancialToExcel,
    exportTransportationFinancialToPDF
};