import * as XLSX from "xlsx";

import {
    saveAs
} from "file-saver";

import {
    formatDateCustom
} from "../../../../../../services/Tools";

import {
    generateTransportationPDF
} from "../../../../../../pdf/reports/generateTransportationPDF";


export const exportTransportationToExcel = ({
    filteredReservations,
    getStatusLabel
}) => {

    const data =
        filteredReservations.map(
            (reservation, index) => ({

                "#":
                    index + 1,

                "Reserva":
                    reservation.reservationNumber ||
                    "-",

                "Fecha":
                    reservation.serviceDateString ||
                    "-",

                "Cliente":
                    reservation.clientDisplayName ||
                    "-",

                "Email":
                    reservation.clientEmail ||
                    "-",

                "Teléfono":
                    reservation.phone ||
                    "-",

                "Servicio":
                    reservation.serviceDisplayName ||
                    "-",

                "Origen":
                    reservation.originDisplayName ||
                    "-",

                "Destino":
                    reservation.destinationDisplayName ||
                    "-",

                "Pasajeros":
                    Number(
                        reservation.passengers || 0
                    ),

                "Chofer":
                    reservation.driverDisplayName ||
                    "-",

                "Vehículo":
                    reservation.vehicleName ||
                    "-",

                "Placa":
                    reservation.vehiclePlate ||
                    "-",

                "Fuente":
                    reservation.bookingSourceDisplayName ||
                    "-",

                "Pago":
                    reservation.paymentTypeDisplayName ||
                    "-",

                "Estado":
                    getStatusLabel(
                        reservation.status
                    ) ||
                    reservation.statusDisplayName ||
                    "-",

                "Total":
                    reservation.total ??
                    null

            })
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            data
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Reservaciones"
    );


    const buffer =
        XLSX.write(
            workbook,
            {
                bookType:
                    "xlsx",

                type:
                    "array"
            }
        );


    const file =
        new Blob(
            [buffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );


    saveAs(
        file,
        "transportation_reservations.xlsx"
    );

};


export const exportTransportationToPDF = ({
    company,
    filteredReservations,
    totalPassengers,

    startDateFilter,
    endDateFilter,

    statusFilter,
    serviceTypeFilter,
    originFilter,
    destinationFilter,
    driverFilter,
    bookingSourceFilter,
    paymentTypeFilter,

    getStatusLabel
}) => {

    generateTransportationPDF({

        company,

        title:
            "Reservaciones de Transporte",

        subtitle:
            "Detalle de reservaciones de transporte.",

        filters: {

            Desde:
                startDateFilter ||
                "-",

            Hasta:
                endDateFilter ||
                "-",

            Estado:
                getStatusLabel(
                    statusFilter
                ) ||
                "Todos",

            Servicio:
                serviceTypeFilter ||
                "Todos",

            Origen:
                originFilter ||
                "Todos",

            Destino:
                destinationFilter ||
                "Todos",

            Chofer:
                driverFilter ||
                "Todos",

            Fuente:
                bookingSourceFilter ||
                "Todas",

            Pago:
                paymentTypeFilter ||
                "Todos"

        },

        kpis: [

            {
                label:
                    "Reservaciones",

                value:
                    filteredReservations.length

            },

            {
                label:
                    "Pasajeros",

                value:
                    totalPassengers

            }

        ],

        columns: [

            "#",
            "Reserva",
            "Fecha",
            "Cliente",
            "Servicio",
            "Origen",
            "Destino",
            "Pax",
            "Chofer",
            "Estado"

        ],

        rows:
            filteredReservations.map(
                (reservation, index) => [

                    index + 1,

                    reservation.reservationNumber ||
                        "-",

                    formatDateCustom(
                        reservation.serviceDateString
                    ),

                    reservation.clientDisplayName ||
                        "-",

                    reservation.serviceDisplayName ||
                        "-",

                    reservation.originDisplayName ||
                        "-",

                    reservation.destinationDisplayName ||
                        "-",

                    reservation.passengers ||
                        0,

                    reservation.driverDisplayName ||
                        "-",

                    getStatusLabel(
                        reservation.status
                    ) ||
                    reservation.statusDisplayName ||
                    "-"

                ]
            ),

        fileName:
            "transportation_reservations.pdf"

    });

};