import DataTable
    from "../../../../../../components/general/dataTable";

import {
    formatCommissionDate
} from "../utils/transportationCommissionUtils";


const TransportationCommissionTable = ({
    data = [],
    columns = [],
    loading = false,
    hasFilters = false
}) => {

    /* =========================================================
       ROW RENDER

       IMPORTANT:

       DataTable ya crea el <tr> y la columna #.

       Por eso este renderRow devuelve únicamente los <td>
       correspondientes a las columnas definidas en `columns`.

       ORDEN DE LA TABLA:

       #                   -> DataTable
       Reserva             -> aquí
       Fecha               -> aquí
       Cliente
       Servicio
       Conductor
       Origen
       Destino
       Subtotal
       Tipo de comisión
       Valor comisión
       Comisión
       Estado

       La columna Moneda fue eliminada.
    ========================================================= */

    const renderRow = (
        reservation
    ) => {

        const currency =
            reservation?.currency ||
            "USD";


        /* =====================================================
           RESERVATION NUMBER
        ===================================================== */

        const reservationNumber =
            reservation?.reservationDisplayNumber ||
            reservation?.reservationNumber ||
            reservation?.id ||
            "—";


        /* =====================================================
           SERVICE DATE
        ===================================================== */

        /*
         * Preferimos serviceDateFormatted si el hook ya
         * preparó la fecha.
         *
         * Si no existe, convertimos el Date a texto antes
         * de entregárselo a React.
         */

        const serviceDate =
            reservation?.serviceDateFormatted ||
            (
                reservation?.serviceDate
                    ? formatCommissionDate(
                        reservation.serviceDate
                    )
                    : "—"
            );


        /* =====================================================
           CLIENT
        ===================================================== */

        const clientName =
            reservation?.clientDisplayName ||
            reservation?.clientName ||
            "Sin cliente";


        const clientEmail =
            reservation?.clientEmail ||
            "";


        /* =====================================================
           SERVICE
        ===================================================== */

        const serviceName =
            reservation?.serviceDisplayName ||
            reservation?.serviceTypeName ||
            "Sin servicio";


        /* =====================================================
           DRIVER
        ===================================================== */

        const driverName =
            reservation?.driverDisplayName ||
            reservation?.driverName ||
            "—";


        /* =====================================================
           ORIGIN
        ===================================================== */

        const originName =
            reservation?.locationFromDisplayName ||
            reservation?.locationFromName ||
            "—";


        /* =====================================================
           DESTINATION
        ===================================================== */

        const destinationName =
            reservation?.locationToDisplayName ||
            reservation?.locationToName ||
            "—";


        /* =====================================================
           COMMISSION TYPE
        ===================================================== */

        const commissionType =
            reservation?.commissionTypeLabel ||
            getCommissionTypeLabel(
                reservation?.commissionType
            );


        /* =====================================================
           COMMISSION VALUE
        ===================================================== */

        const commissionValue =
            formatCommissionValue(
                reservation?.commissionValue,
                reservation?.commissionType,
                currency
            );


        /* =====================================================
           STATUS
        ===================================================== */

        const status =
            reservation?.statusDisplayName ||
            reservation?.statusName ||
            reservation?.status ||
            "—";


        return (
            <>

                {/* =================================================
                    RESERVATION
                ================================================== */}

                <td>

                    <span className="transportation-commission-reservation-number">

                        {
                            reservationNumber
                        }

                    </span>

                </td>


                {/* =================================================
                    SERVICE DATE
                ================================================== */}

                <td>

                    <span className="transportation-commission-date">

                        {
                            serviceDate || "—"
                        }

                    </span>

                </td>


                {/* =================================================
                    CLIENT
                ================================================== */}

                <td>

                    <div className="transportation-commission-client-cell">

                        <span className="transportation-commission-client-name">

                            {
                                clientName
                            }

                        </span>


                        {
                            clientEmail && (

                                <span className="transportation-commission-client-email">

                                    {
                                        clientEmail
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

                    <span className="transportation-commission-service-name">

                        {
                            serviceName
                        }

                    </span>

                </td>


                {/* =================================================
                    DRIVER
                ================================================== */}

                <td>

                    <span className="transportation-commission-driver-name">

                        {
                            driverName
                        }

                    </span>

                </td>


                {/* =================================================
                    ORIGIN
                ================================================== */}

                <td>

                    <span className="transportation-commission-location">

                        {
                            originName
                        }

                    </span>

                </td>


                {/* =================================================
                    DESTINATION
                ================================================== */}

                <td>

                    <span className="transportation-commission-location">

                        {
                            destinationName
                        }

                    </span>

                </td>


                {/* =================================================
                    SUBTOTAL
                ================================================== */}

                <td className="transportation-commission-amount">

                    {
                        formatCurrency(
                            reservation?.subtotal,
                            currency
                        )
                    }

                </td>


                {/* =================================================
                    COMMISSION TYPE
                ================================================== */}

                <td>

                    <span className="transportation-commission-type">

                        {
                            commissionType
                        }

                    </span>

                </td>


                {/* =================================================
                    COMMISSION VALUE
                ================================================== */}

                <td className="transportation-commission-amount">

                    {
                        commissionValue
                    }

                </td>


                {/* =================================================
                    COMMISSION AMOUNT
                ================================================== */}

                <td className="transportation-commission-amount transportation-commission-amount-primary">

                    {
                        formatCurrency(
                            reservation?.commissionAmount,
                            currency
                        )
                    }

                </td>


                {/* =================================================
                    STATUS
                ================================================== */}

                <td>

                    <span
                        className={
                            `transportation-commission-status ${
                                getStatusClass(
                                    reservation?.status
                                )
                            }`
                        }
                    >

                        {
                            status
                        }

                    </span>

                </td>

            </>
        );
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <section className="transportation-commission-table-container">

            {/* =====================================================
                TABLE HEADER
            ====================================================== */}

            <div className="transportation-commission-table-header">

                <div>

                    <h2 className="transportation-commission-table-title">

                        Detalle de comisiones

                    </h2>

                </div>


                <div className="transportation-commission-table-count">

                    {
                        data.length
                    }{" "}

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
                        : "No hay comisiones registradas"
                }

                emptyDescription={
                    hasFilters
                        ? "Intenta modificar los filtros seleccionados."
                        : "Las reservaciones con comisiones aparecerán aquí."
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


/* =============================================================
   COMMISSION VALUE FORMATTER
============================================================= */

const formatCommissionValue = (
    value,
    commissionType,
    currency = "USD"
) => {

    const amount =
        Number(value || 0);


    const normalizedType =
        String(
            commissionType || ""
        )
            .trim()
            .toLowerCase();


    /* =========================================================
       PERCENTAGE COMMISSION
    ========================================================= */

    if (
        normalizedType === "percentage" ||
        normalizedType === "percent" ||
        normalizedType === "porcentaje" ||
        normalizedType === "%"
    ) {

        return `${amount.toFixed(2)}%`;

    }


    /* =========================================================
       FIXED / MONETARY COMMISSION
    ========================================================= */

    return formatCurrency(
        amount,
        currency
    );
};


/* =============================================================
   COMMISSION TYPE LABEL
============================================================= */

const getCommissionTypeLabel = (
    commissionType
) => {

    if (
        !commissionType
    ) {

        return "—";

    }


    const normalized =
        String(
            commissionType
        )
            .trim()
            .toLowerCase();


    const labels = {

        percentage:
            "Porcentaje",

        percent:
            "Porcentaje",

        porcentaje:
            "Porcentaje",

        fixed:
            "Monto fijo",

        fixed_amount:
            "Monto fijo",

        amount:
            "Monto fijo",

        monto:
            "Monto fijo",

        flat:
            "Monto fijo"

    };


    return (
        labels[normalized] ||
        commissionType
    );
};


/* =============================================================
   STATUS CLASS
============================================================= */

const getStatusClass = (
    status
) => {

    const normalized =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    if (
        normalized === "completed" ||
        normalized === "complete" ||
        normalized === "completada"
    ) {

        return "is-completed";

    }


    if (
        normalized === "confirmed" ||
        normalized === "confirmada" ||
        normalized === "confirmado"
    ) {

        return "is-confirmed";

    }


    if (
        normalized === "pending" ||
        normalized === "pendiente"
    ) {

        return "is-pending";

    }


    if (
        normalized === "cancelled" ||
        normalized === "canceled" ||
        normalized === "cancelada" ||
        normalized === "cancelado"
    ) {

        return "is-cancelled";

    }


    if (
        normalized === "draft" ||
        normalized === "borrador"
    ) {

        return "is-draft";

    }


    return "is-default";
};


export default TransportationCommissionTable;