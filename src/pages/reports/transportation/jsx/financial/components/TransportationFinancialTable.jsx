import DataTable
    from "../../../../../../components/general/dataTable";

import {
    formatFinancialDate
} from "../utils/transportationFinancialUtils";


const TransportationFinancialTable = ({
    data = [],
    columns = [],
    loading = false,
    hasFilters = false
}) => {

    /* =========================================================
       ROW RENDER

       IMPORTANT:
       DataTable ya crea el <tr>.

       Por eso este renderRow debe devolver únicamente
       los <td> correspondientes a las columnas.
    ========================================================= */

    const renderRow = (
        reservation
    ) => {

        const currency =
            reservation.currency ||
            "USD";


        /*
         * -----------------------------------------------------
         * SERVICE DATE
         * -----------------------------------------------------
         *
         * Preferimos la fecha ya formateada por el hook.
         *
         * Si no existe, usamos serviceDate y la pasamos
         * por formatFinancialDate para evitar intentar
         * renderizar un objeto Date directamente.
         */

        const serviceDate =
            reservation.serviceDateFormatted ||
            (
                reservation.serviceDate
                    ? formatFinancialDate(
                        reservation.serviceDate
                    )
                    : "—"
            );


        return (
            <>

                {/* =================================================
                    RESERVATION
                ================================================== */}

                <td>

                    <span className="transportation-financial-reservation-number">

                        {
                            reservation.reservationNumber ||
                            "—"
                        }

                    </span>

                </td>


                {/* =================================================
                    SERVICE DATE
                ================================================== */}

                <td>

                    <span className="transportation-financial-date">

                        {
                            serviceDate || "—"
                        }

                    </span>

                </td>


                {/* =================================================
                    CLIENT
                ================================================== */}

                <td>

                    <div className="transportation-financial-client-cell">

                        <span className="transportation-financial-client-name">

                            {
                                reservation.clientDisplayName ||
                                reservation.clientName ||
                                "Sin cliente"
                            }

                        </span>


                        {
                            reservation.clientEmail && (

                                <span className="transportation-financial-client-email">

                                    {
                                        reservation.clientEmail
                                    }

                                </span>

                            )
                        }

                    </div>

                </td>


                {/* =================================================
                    SERVICE
                ================================================== */}

                <td>

                    <span className="transportation-financial-service-name">

                        {
                            reservation.serviceDisplayName ||
                            reservation.serviceTypeName ||
                            "Sin servicio"
                        }

                    </span>

                </td>


                {/* =================================================
                    SUBTOTAL / BASE
                ================================================== */}

                <td className="transportation-financial-amount">

                    {
                        formatCurrency(
                            reservation.subtotal,
                            currency
                        )
                    }

                </td>


                {/* =================================================
                    DISCOUNT
                ================================================== */}

                <td className="transportation-financial-amount">

                    {
                        formatCurrency(
                            reservation.discountAmount,
                            currency
                        )
                    }

                </td>


                {/* =================================================
                    TAX
                ================================================== */}

                <td className="transportation-financial-amount">

                    {
                        formatCurrency(
                            reservation.taxAmount,
                            currency
                        )
                    }

                </td>


                {/* =================================================
                    COMMISSION
                ================================================== */}

                <td
                    className="
                        transportation-financial-amount
                        transportation-financial-commission
                    "
                >

                    {
                        formatCurrency(
                            reservation.commissionAmount,
                            currency
                        )
                    }

                </td>


                {/* =================================================
                    TOTAL
                ================================================== */}

                <td
                    className="
                        transportation-financial-amount
                        transportation-financial-total
                    "
                >

                    {
                        formatCurrency(
                            reservation.total,
                            currency
                        )
                    }

                </td>

            </>
        );
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <section className="transportation-financial-table-container">

            {/* =====================================================
                TABLE HEADER
            ====================================================== */}

            <div className="transportation-financial-table-header">

                <div>

                    <h2 className="transportation-financial-table-title">

                        Detalle financiero

                    </h2>

                </div>


                <div className="transportation-financial-table-count">

                    {data.length}{" "}

                    {
                        data.length === 1
                            ? "registro"
                            : "registros"
                    }

                </div>

            </div>


            {/* =====================================================
                DATA TABLE
            ====================================================== */}

            <DataTable

                data={data}

                columns={columns}

                renderRow={renderRow}

                loading={loading}

                emptyTitle={
                    hasFilters
                        ? "No se encontraron resultados"
                        : "No hay información financiera"
                }

                emptyDescription={
                    hasFilters
                        ? "Intenta modificar los filtros seleccionados."
                        : "Las reservaciones de transporte aparecerán aquí."
                }

                rowsPerPageOptions={[
                    10,
                    25,
                    50,
                    100
                ]}

                defaultRowsPerPage={10}

            />

        </section>
    );
};


/* =============================================================
   CURRENCY FORMATTER
============================================================= */

const formatCurrency = (
    value,
    currency = "USD"
) => {

    const amount =
        Number(value || 0);


    try {

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(amount);

    } catch {

        return `${currency} ${amount.toFixed(2)}`;

    }
};


export default TransportationFinancialTable;