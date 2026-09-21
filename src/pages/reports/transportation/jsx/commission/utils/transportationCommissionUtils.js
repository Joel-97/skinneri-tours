/* ==========================================================
   TRANSPORTATION COMMISSION UTILITIES
========================================================== */


/* ==========================================================
   DATE HELPERS
========================================================== */

/**
 * Normalizes the different date formats that may come
 * from Firestore or existing transportation reservations.
 */
export const normalizeCommissionDate = (
    value
) => {

    if (!value) {
        return null;
    }


    if (value instanceof Date) {

        return Number.isNaN(
            value.getTime()
        )
            ? null
            : value;

    }


    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {

        const date =
            value.toDate();

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    if (
        typeof value === "object" &&
        typeof value.seconds === "number"
    ) {

        const date =
            new Date(
                value.seconds * 1000
            );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    if (
        typeof value === "object" &&
        typeof value._seconds === "number"
    ) {

        const date =
            new Date(
                value._seconds * 1000
            );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    const parsed =
        new Date(value);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return null;
    }


    return parsed;
};


/**
 * Returns YYYY-MM-DD using the local date.
 */
export const formatCommissionDateISO = (
    value
) => {

    const date =
        normalizeCommissionDate(
            value
        );


    if (!date) {
        return "";
    }


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


/**
 * Returns a user-facing date.
 */
export const formatCommissionDate = (
    value
) => {

    const date =
        normalizeCommissionDate(
            value
        );


    if (!date) {
        return "-";
    }


    return date.toLocaleDateString(
        "es-CR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
};


/**
 * Returns a short date for charts.
 */
export const formatCommissionShortDate = (
    value
) => {

    const date =
        normalizeCommissionDate(
            value
        );


    if (!date) {
        return "";
    }


    return date.toLocaleDateString(
        "es-CR",
        {
            day: "2-digit",
            month: "short"
        }
    );
};


/* ==========================================================
   NUMBER HELPERS
========================================================== */

/**
 * Converts a value into a safe number.
 */
export const normalizeCommissionNumber = (
    value
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }


    const number =
        Number(value);


    if (
        !Number.isFinite(
            number
        )
    ) {
        return 0;
    }


    return number;
};


/**
 * Rounds a financial value to two decimals.
 */
export const roundCommissionValue = (
    value
) => {

    return Number(
        normalizeCommissionNumber(
            value
        ).toFixed(2)
    );
};


/**
 * Formats an ordinary number.
 */
export const formatCommissionNumber = (
    value
) => {

    return new Intl.NumberFormat(
        "es-CR",
        {
            maximumFractionDigits: 0
        }
    ).format(
        normalizeCommissionNumber(
            value
        )
    );
};


/**
 * Formats a decimal number.
 */
export const formatCommissionDecimal = (
    value,
    decimals = 2
) => {

    return new Intl.NumberFormat(
        "es-CR",
        {
            minimumFractionDigits:
                decimals,

            maximumFractionDigits:
                decimals
        }
    ).format(
        normalizeCommissionNumber(
            value
        )
    );
};


/* ==========================================================
   CURRENCY HELPERS
========================================================== */

/**
 * Normalizes a currency code.
 */
export const normalizeCommissionCurrency = (
    value
) => {

    if (
        value &&
        typeof value === "object"
    ) {

        return String(
            value.code ??
            value.currencyCode ??
            value.value ??
            ""
        )
            .trim()
            .toUpperCase();

    }


    return String(
        value || ""
    )
        .trim()
        .toUpperCase();
};


/**
 * Formats a financial amount without
 * converting between currencies.
 */
export const formatCommissionCurrency = (
    value,
    currency = "USD"
) => {

    const normalizedCurrency =
        normalizeCommissionCurrency(
            currency
        ) || "USD";


    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency:
                normalizedCurrency,

            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        normalizeCommissionNumber(
            value
        )
    );
};


/* ==========================================================
   COMMISSION HELPERS
========================================================== */

/**
 * Normalizes commission type.
 */
export const normalizeCommissionType = (
    value
) => {

    const normalized =
        String(
            value || ""
        )
            .trim()
            .toLowerCase();


    if (
        normalized === "percentage" ||
        normalized === "percent" ||
        normalized === "%"
    ) {
        return "percentage";
    }


    if (
        normalized === "fixed" ||
        normalized === "amount" ||
        normalized === "flat"
    ) {
        return "fixed";
    }


    return normalized;
};


/**
 * Returns the display label for a commission type.
 */
export const getCommissionTypeLabel = (
    value
) => {

    const type =
        normalizeCommissionType(
            value
        );


    if (
        type === "percentage"
    ) {
        return "Porcentaje";
    }


    if (
        type === "fixed"
    ) {
        return "Monto fijo";
    }


    return value
        ? String(value)
        : "-";
};


/**
 * Formats the commission value according
 * to its commission type.
 */
export const formatCommissionValue = (
    value,
    commissionType,
    currency = "USD"
) => {

    const numericValue =
        normalizeCommissionNumber(
            value
        );


    const type =
        normalizeCommissionType(
            commissionType
        );


    if (
        type === "percentage"
    ) {

        return `${new Intl.NumberFormat(
            "es-CR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(
            numericValue
        )}%`;

    }


    return formatCommissionCurrency(
        numericValue,
        currency
    );
};


/* ==========================================================
   TEXT HELPERS
========================================================== */

/**
 * Normalizes text for searching.
 */
export const normalizeCommissionText = (
    value
) => {

    return String(
        value ?? ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
};


/**
 * Builds the searchable text for a commission
 * reservation.
 */
export const getCommissionReservationSearchText = (
    reservation
) => {

    if (!reservation) {
        return "";
    }


    return [
        reservation.id,

        reservation.reservationId,

        reservation.reservationNumber,

        reservation.reservationDisplayNumber,

        reservation.clientName,

        reservation.clientDisplayName,

        reservation.clientEmail,

        reservation.serviceTypeName,

        reservation.serviceDisplayName,

        reservation.driverName,

        reservation.driverDisplayName,

        reservation.locationFromName,

        reservation.locationFromDisplayName,

        reservation.locationToName,

        reservation.locationToDisplayName,

        reservation.bookingSourceName,

        reservation.bookingSourceDisplayName,

        reservation.commissionType,

        reservation.commissionTypeLabel,

        reservation.status,

        reservation.statusName,

        reservation.statusDisplayName

    ]
        .filter(
            Boolean
        )
        .map(
            normalizeCommissionText
        )
        .join(" ");
};


/**
 * Checks whether a reservation matches
 * a search term.
 */
export const commissionReservationMatchesSearch = (
    reservation,
    searchTerm
) => {

    const normalizedSearch =
        normalizeCommissionText(
            searchTerm
        );


    if (!normalizedSearch) {
        return true;
    }


    const searchableText =
        getCommissionReservationSearchText(
            reservation
        );


    return searchableText.includes(
        normalizedSearch
    );
};


/* ==========================================================
   DISPLAY HELPERS
========================================================== */

export const getCommissionReservationNumber = (
    reservation
) => {

    if (!reservation) {
        return "-";
    }


    return (
        reservation.reservationDisplayNumber ||
        reservation.reservationNumber ||
        reservation.confirmationNumber ||
        reservation.id ||
        reservation.reservationId ||
        "-"
    );
};


export const getCommissionClientName = (
    reservation
) => {

    if (!reservation) {
        return "-";
    }


    return (
        reservation.clientDisplayName ||
        reservation.clientName ||
        reservation.clientEmail ||
        "-"
    );
};


export const getCommissionServiceName = (
    reservation
) => {

    if (!reservation) {
        return "-";
    }


    return (
        reservation.serviceDisplayName ||
        reservation.serviceTypeName ||
        reservation.serviceName ||
        "-"
    );
};


export const getCommissionDriverName = (
    reservation
) => {

    if (!reservation) {
        return "-";
    }


    return (
        reservation.driverDisplayName ||
        reservation.driverName ||
        "-"
    );
};


export const getCommissionOriginName = (
    reservation
) => {

    if (!reservation) {
        return "-";
    }


    return (
        reservation.locationFromDisplayName ||
        reservation.locationFromName ||
        "-"
    );
};


export const getCommissionDestinationName = (
    reservation
) => {

    if (!reservation) {
        return "-";
    }


    return (
        reservation.locationToDisplayName ||
        reservation.locationToName ||
        "-"
    );
};


/* ==========================================================
   EXPORT ROW BUILDER
========================================================== */

/**
 * Creates a clean row for Excel/PDF exports.
 */
export const buildCommissionExportRow = (
    reservation
) => {

    if (!reservation) {
        return {};
    }


    const currency =
        normalizeCommissionCurrency(
            reservation.currency
        ) || "USD";


    const commissionType =
        normalizeCommissionType(
            reservation.commissionType
        );


    return {

        "Fecha":
            formatCommissionDate(
                reservation.serviceDate
            ),

        "Reservación":
            getCommissionReservationNumber(
                reservation
            ),

        "Cliente":
            getCommissionClientName(
                reservation
            ),

        "Servicio":
            getCommissionServiceName(
                reservation
            ),

        "Conductor":
            getCommissionDriverName(
                reservation
            ),

        "Origen":
            getCommissionOriginName(
                reservation
            ),

        "Destino":
            getCommissionDestinationName(
                reservation
            ),

        "Subtotal":
            normalizeCommissionNumber(
                reservation.subtotal
            ),

        "Tipo de comisión":
            getCommissionTypeLabel(
                commissionType
            ),

        "Valor comisión":
            normalizeCommissionNumber(
                reservation.commissionValue
            ),

        "Comisión":
            normalizeCommissionNumber(
                reservation.commissionAmount
            ),

        "Moneda":
            currency,

        "Estado":
            reservation.statusDisplayName ||
            reservation.statusName ||
            reservation.status ||
            "-"

    };
};


/* ==========================================================
   EXPORT SUMMARY
========================================================== */

export const buildCommissionExportSummary = (
    summary = {},
    currency = "USD"
) => {

    const normalizedCurrency =
        normalizeCommissionCurrency(
            currency
        ) || "USD";


    return {

        "Reservaciones":
            normalizeCommissionNumber(
                summary.reservationCount
            ),

        "Pasajeros":
            normalizeCommissionNumber(
                summary.passengerCount
            ),

        "Ventas brutas":
            normalizeCommissionNumber(
                summary.grossSales
            ),

        "Descuentos":
            normalizeCommissionNumber(
                summary.discounts
            ),

        "Total":
            normalizeCommissionNumber(
                summary.total
            ),

        "Comisiones":
            normalizeCommissionNumber(
                summary.commissions
            ),

        "Tasa efectiva":
            normalizeCommissionNumber(
                summary.commissionRate
            ),

        "Moneda":
            normalizedCurrency

    };
};


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default {

    normalizeCommissionDate,

    formatCommissionDateISO,

    formatCommissionDate,

    formatCommissionShortDate,

    normalizeCommissionNumber,

    roundCommissionValue,

    formatCommissionNumber,

    formatCommissionDecimal,

    normalizeCommissionCurrency,

    formatCommissionCurrency,

    normalizeCommissionType,

    getCommissionTypeLabel,

    formatCommissionValue,

    normalizeCommissionText,

    getCommissionReservationSearchText,

    commissionReservationMatchesSearch,

    getCommissionReservationNumber,

    getCommissionClientName,

    getCommissionServiceName,

    getCommissionDriverName,

    getCommissionOriginName,

    getCommissionDestinationName,

    buildCommissionExportRow,

    buildCommissionExportSummary

};