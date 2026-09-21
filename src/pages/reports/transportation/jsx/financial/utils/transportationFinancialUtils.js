/**
 * Transportation Financial Report Utilities
 *
 * Utilidades de presentación y normalización utilizadas
 * por el reporte financiero de transporte.
 */


/*
 * ---------------------------------------------------------
 * NUMBER HELPERS
 * ---------------------------------------------------------
 */

export const normalizeFinancialNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return number;
};


export const roundFinancialNumber = (value, decimals = 2) => {
    const number = normalizeFinancialNumber(value);
    const factor = 10 ** decimals;

    return Math.round((number + Number.EPSILON) * factor) / factor;
};


export const formatFinancialNumber = (
    value,
    options = {}
) => {
    const number = normalizeFinancialNumber(value);

    const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 2
    } = options;

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits,
        maximumFractionDigits
    }).format(number);
};


/*
 * ---------------------------------------------------------
 * CURRENCY
 * ---------------------------------------------------------
 */

export const normalizeCurrencyCode = (currency) => {
    if (!currency) {
        return "USD";
    }

    if (typeof currency === "string") {
        return currency.trim().toUpperCase() || "USD";
    }

    if (typeof currency === "object") {
        return String(
            currency.code ||
            currency.currency ||
            currency.value ||
            "USD"
        )
            .trim()
            .toUpperCase();
    }

    return "USD";
};


export const formatFinancialCurrency = (
    value,
    currency = "USD"
) => {
    const normalizedCurrency =
        normalizeCurrencyCode(currency);

    const number =
        normalizeFinancialNumber(value);

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: normalizedCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    } catch (error) {
        return `${normalizedCurrency} ${number.toFixed(2)}`;
    }
};


/*
 * ---------------------------------------------------------
 * DATE
 * ---------------------------------------------------------
 */

export const normalizeFinancialDate = (value) => {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
            ? null
            : value;
    }

    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {
        const date = value.toDate();

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    if (
        typeof value === "object" &&
        typeof value.seconds === "number"
    ) {
        const date = new Date(
            value.seconds * 1000
        );

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    if (typeof value === "string") {
        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    return null;
};


export const formatFinancialDate = (value) => {
    if (!value) {
        return "—";
    }

    /*
     * Si el servicio ya entregó YYYY-MM-DD,
     * evitamos que el navegador lo interprete
     * como UTC y pueda desplazar el día.
     */
    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        const [
            year,
            month,
            day
        ] = value.split("-");

        return `${day}/${month}/${year}`;
    }

    const date =
        normalizeFinancialDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
};


export const formatFinancialMonth = (value) => {
    if (!value) {
        return "—";
    }

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}$/.test(value)
    ) {
        const [
            year,
            month
        ] = value.split("-");

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        return new Intl.DateTimeFormat("es-CR", {
            month: "long",
            year: "numeric"
        }).format(date);
    }

    const date =
        normalizeFinancialDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat("es-CR", {
        month: "long",
        year: "numeric"
    }).format(date);
};


/*
 * ---------------------------------------------------------
 * STATUS
 * ---------------------------------------------------------
 */

const FINANCIAL_STATUS_LABELS = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
    canceled: "Cancelada",
    draft: "Borrador"
};


export const getFinancialStatusLabel = (
    status
) => {
    if (!status) {
        return "Sin estado";
    }

    const normalized =
        String(status)
            .trim()
            .toLowerCase();

    return (
        FINANCIAL_STATUS_LABELS[normalized] ||
        String(status)
    );
};


export const getFinancialStatusClass = (
    status
) => {
    if (!status) {
        return "status-neutral";
    }

    const normalized =
        String(status)
            .trim()
            .toLowerCase();

    switch (normalized) {
        case "pending":
            return "status-pending";

        case "confirmed":
            return "status-confirmed";

        case "completed":
            return "status-completed";

        case "cancelled":
        case "canceled":
            return "status-cancelled";

        case "draft":
            return "status-draft";

        default:
            return "status-neutral";
    }
};


/*
 * ---------------------------------------------------------
 * DISPLAY VALUES
 * ---------------------------------------------------------
 */

export const getFinancialClientName = (
    reservation
) => {
    if (!reservation) {
        return "—";
    }

    return (
        reservation.clientDisplayName ||
        reservation.clientName ||
        reservation.clientEmail ||
        "Sin cliente"
    );
};


export const getFinancialServiceName = (
    reservation
) => {
    if (!reservation) {
        return "—";
    }

    return (
        reservation.serviceDisplayName ||
        reservation.serviceTypeName ||
        "Sin servicio"
    );
};


export const getFinancialBookingSourceName = (
    reservation
) => {
    if (!reservation) {
        return "—";
    }

    return (
        reservation.bookingSourceDisplayName ||
        reservation.bookingSourceName ||
        "Sin fuente"
    );
};


export const getFinancialPayerName = (
    reservation
) => {
    if (!reservation) {
        return "—";
    }

    return (
        reservation.payerDisplayName ||
        reservation.payerName ||
        "Sin pagador"
    );
};


export const getFinancialDriverName = (
    reservation
) => {
    if (!reservation) {
        return "—";
    }

    return (
        reservation.driverDisplayName ||
        reservation.driverName ||
        reservation.staffName ||
        "Sin chofer"
    );
};


/*
 * ---------------------------------------------------------
 * RESERVATION SEARCH
 * ---------------------------------------------------------
 */

export const getFinancialReservationSearchText = (
    reservation
) => {
    if (!reservation) {
        return "";
    }

    const values = [
        reservation.reservationNumber,
        reservation.clientDisplayName,
        reservation.clientName,
        reservation.clientEmail,
        reservation.phone,
        reservation.flightNumber,
        reservation.driverDisplayName,
        reservation.driverName,
        reservation.staffName,
        reservation.vehicleName,
        reservation.vehiclePlate,
        reservation.serviceDisplayName,
        reservation.serviceTypeName,
        reservation.locationFromName,
        reservation.locationToName,
        reservation.bookingSourceDisplayName,
        reservation.bookingSourceName,
        reservation.payerDisplayName,
        reservation.payerName,
        reservation.paymentTypeDisplayName,
        reservation.paymentTypeName,
        reservation.reservationBase,
        reservation.currency
    ];

    return values
        .filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
        )
        .map((value) =>
            String(value)
                .trim()
                .toLowerCase()
        )
        .join(" ");
};


/*
 * ---------------------------------------------------------
 * FILTER LABELS
 * ---------------------------------------------------------
 */

export const getFinancialFilterOptionLabel = (
    option
) => {
    if (!option) {
        return "";
    }

    if (typeof option === "string") {
        return option;
    }

    return (
        option.label ||
        option.name ||
        option.value ||
        option.id ||
        ""
    );
};


export const getFinancialFilterOptionValue = (
    option
) => {
    if (!option) {
        return "";
    }

    if (typeof option === "string") {
        return option;
    }

    return (
        option.value ||
        option.id ||
        ""
    );
};


/*
 * ---------------------------------------------------------
 * FINANCIAL VALUES
 * ---------------------------------------------------------
 */

export const getFinancialGrossSales = (
    reservation
) => {
    return roundFinancialNumber(
        reservation?.subtotal
    );
};


export const getFinancialDiscount = (
    reservation
) => {
    return roundFinancialNumber(
        reservation?.discountAmount
    );
};


export const getFinancialTax = (
    reservation
) => {
    return roundFinancialNumber(
        reservation?.taxAmount
    );
};


export const getFinancialCommission = (
    reservation
) => {
    return roundFinancialNumber(
        reservation?.commissionAmount
    );
};


export const getFinancialTotal = (
    reservation
) => {
    return roundFinancialNumber(
        reservation?.total
    );
};


export const getFinancialTaxableAmount = (
    reservation
) => {
    const subtotal =
        getFinancialGrossSales(reservation);

    const discount =
        getFinancialDiscount(reservation);

    return Math.max(
        roundFinancialNumber(
            subtotal - discount
        ),
        0
    );
};


/*
 * ---------------------------------------------------------
 * COMMISSION
 * ---------------------------------------------------------
 */

export const getCommissionTypeLabel = (
    type
) => {
    if (!type) {
        return "—";
    }

    switch (
        String(type)
            .trim()
            .toLowerCase()
    ) {
        case "percentage":
            return "Porcentaje";

        case "fixed":
            return "Monto fijo";

        default:
            return String(type);
    }
};


/*
 * ---------------------------------------------------------
 * EXPORT HELPERS
 * ---------------------------------------------------------
 */

export const buildFinancialExportRow = (
    reservation
) => {
    if (!reservation) {
        return {};
    }

    const currency =
        normalizeCurrencyCode(
            reservation.currency
        );

    return {
        Reserva:
            reservation.reservationNumber || "",

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
            currency,

        Base:
            getFinancialGrossSales(
                reservation
            ),

        Descuento:
            getFinancialDiscount(
                reservation
            ),

        Impuesto:
            getFinancialTax(
                reservation
            ),

        Comisión:
            getFinancialCommission(
                reservation
            ),

        Total:
            getFinancialTotal(
                reservation
            )
    };
};


export const buildFinancialExportRows = (
    reservations = []
) => {
    return reservations.map(
        buildFinancialExportRow
    );
};


/*
 * ---------------------------------------------------------
 * SUMMARY
 * ---------------------------------------------------------
 */

export const getFinancialSummaryCurrency = (
    summary,
    filters = {},
    fallbackCurrency = "USD"
) => {
    return normalizeCurrencyCode(
        filters.currency ||
        summary?.currency ||
        fallbackCurrency
    );
};


/*
 * ---------------------------------------------------------
 * GENERAL HELPERS
 * ---------------------------------------------------------
 */

export const isFinancialReservationCancelled = (
    reservation
) => {
    const status =
        String(
            reservation?.status || ""
        )
            .trim()
            .toLowerCase();

    return (
        status === "cancelled" ||
        status === "canceled"
    );
};


export const isFinancialReservationValid = (
    reservation
) => {
    if (!reservation) {
        return false;
    }

    return Boolean(
        reservation.id ||
        reservation.reservationNumber
    );
};


export default {
    normalizeFinancialNumber,
    roundFinancialNumber,
    formatFinancialNumber,

    normalizeCurrencyCode,
    formatFinancialCurrency,

    normalizeFinancialDate,
    formatFinancialDate,
    formatFinancialMonth,

    getFinancialStatusLabel,
    getFinancialStatusClass,

    getFinancialClientName,
    getFinancialServiceName,
    getFinancialBookingSourceName,
    getFinancialPayerName,
    getFinancialDriverName,

    getFinancialReservationSearchText,

    getFinancialFilterOptionLabel,
    getFinancialFilterOptionValue,

    getFinancialGrossSales,
    getFinancialDiscount,
    getFinancialTax,
    getFinancialCommission,
    getFinancialTotal,
    getFinancialTaxableAmount,

    getCommissionTypeLabel,

    buildFinancialExportRow,
    buildFinancialExportRows,

    getFinancialSummaryCurrency,

    isFinancialReservationCancelled,
    isFinancialReservationValid
};