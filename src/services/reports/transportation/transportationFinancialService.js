/*
==========================================================
TRANSPORTATION FINANCIAL REPORT SERVICE
==========================================================
*/

import {
    getTransportation
} from "../../transportation/transportationService";

import {
    getLocations
} from "../../../services/settings/transportation/locationsService";


/*
==========================================================
DATE HELPERS
==========================================================
*/

/**
 * Normalizes the different date formats that may come
 * from Firestore or existing reservation data.
 */
export const normalizeFinancialReportDate = (
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
        const date = value.toDate();

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
        const date = new Date(
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
        const date = new Date(
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
export const formatFinancialReportDate = (
    value
) => {
    const date =
        normalizeFinancialReportDate(
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
 * Returns YYYY-MM.
 */
export const formatFinancialReportMonth = (
    value
) => {
    const date =
        normalizeFinancialReportDate(
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

    return `${year}-${month}`;
};


/*
==========================================================
NUMBER HELPERS
==========================================================
*/

export const normalizeFinancialNumber = (
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
        !Number.isFinite(number)
    ) {
        return 0;
    }

    return number;
};


/**
 * Rounds financial values to two decimals.
 */
export const roundFinancialValue = (
    value
) => {
    return Number(
        normalizeFinancialNumber(
            value
        ).toFixed(2)
    );
};


/**
 * Normalizes a currency code for financial calculations.
 */
export const normalizeFinancialCurrencyCode = (
    value
) => {
    if (value && typeof value === "object") {
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


/*
==========================================================
DISPLAY HELPERS
==========================================================
*/

export const getFinancialClientName = (
    reservation
) => {
    if (!reservation) {
        return "-";
    }

    return (
        reservation.clientName ||
        reservation.clientDisplayName ||
        reservation.clientEmail ||
        "-"
    );
};


export const getFinancialServiceName = (
    reservation
) => {
    if (!reservation) {
        return "-";
    }

    return (
        reservation.serviceTypeName ||
        reservation.serviceDisplayName ||
        "-"
    );
};


export const getFinancialBookingSourceName = (
    reservation
) => {
    if (!reservation) {
        return "-";
    }

    return (
        reservation.bookingSourceName ||
        reservation.bookingSourceDisplayName ||
        "-"
    );
};


export const getFinancialPayerName = (
    reservation
) => {
    if (!reservation) {
        return "-";
    }

    return (
        reservation.payerName ||
        reservation.payerDisplayName ||
        "-"
    );
};


export const getFinancialStatusName = (
    reservation
) => {
    if (!reservation) {
        return "-";
    }

    const status =
        String(
            reservation.status || ""
        )
            .trim()
            .toLowerCase();

    const labels = {
        pending:
            "Pendiente",

        confirmed:
            "Confirmada",

        completed:
            "Completada",

        cancelled:
            "Cancelada",

        canceled:
            "Cancelada",

        draft:
            "Borrador"
    };

    return (
        labels[status] ||
        reservation.statusDisplayName ||
        reservation.status ||
        "-"
    );
};


/*
==========================================================
FINANCIAL NORMALIZATION
==========================================================
*/

/**
 * Converts a transportation reservation into the
 * financial structure used by the report.
 *
 * IMPORTANT:
 * - subtotal is the original reservation price/base.
 * - discountAmount is the persisted discount.
 * - taxableAmount is reconstructed as subtotal - discount.
 * - taxAmount is the persisted total tax.
 * - total is the persisted final total.
 * - commissionAmount is the persisted commission.
 *
 * No financial value is recalculated from tax definitions
 * or commission settings here.
 */
export const normalizeTransportationFinancialReservation = (
    reservation
) => {
    if (!reservation) {
        return null;
    }

    const serviceDate =
        normalizeFinancialReportDate(
            reservation.date
        );

    const createdDate =
        normalizeFinancialReportDate(
            reservation.createdAt
        );


    /*
    ------------------------------------------------------
    FINANCIAL VALUES
    ------------------------------------------------------
    */

    const subtotal =
        roundFinancialValue(
            reservation.subtotal ??
            reservation.price
        );

    const discountAmount =
        roundFinancialValue(
            reservation.discountAmount
        );

    const taxableAmount =
        roundFinancialValue(
            Math.max(
                subtotal -
                discountAmount,
                0
            )
        );

    const taxAmount =
        roundFinancialValue(
            reservation.taxAmount
        );

    const commissionAmount =
        roundFinancialValue(
            reservation.commissionAmount
        );

    const total =
        roundFinancialValue(
            reservation.total
        );


    /*
    ------------------------------------------------------
    RETURN NORMALIZED RESERVATION
    ------------------------------------------------------
    */

    return {
        ...reservation,

        /*
        ----------------------------------------------
        DATES
        ----------------------------------------------
        */

        serviceDate,

        serviceDateString:
            reservation.dateString ||
            formatFinancialReportDate(
                reservation.date
            ),

        createdDate,

        createdDateString:
            formatFinancialReportDate(
                reservation.createdAt
            ),

        month:
            reservation.month ||
            formatFinancialReportMonth(
                reservation.date
            ),


        /*
        ----------------------------------------------
        DISPLAY
        ----------------------------------------------
        */

        clientDisplayName:
            getFinancialClientName(
                reservation
            ),

        serviceDisplayName:
            getFinancialServiceName(
                reservation
            ),

        bookingSourceDisplayName:
            getFinancialBookingSourceName(
                reservation
            ),

        payerDisplayName:
            getFinancialPayerName(
                reservation
            ),

        statusDisplayName:
            getFinancialStatusName(
                reservation
            ),


        /*
        ----------------------------------------------
        FINANCIAL
        ----------------------------------------------
        */

        subtotal,

        discountAmount,

        taxableAmount,

        taxAmount,

        commissionAmount,

        total,


        /*
        ----------------------------------------------
        COMMISSION
        ----------------------------------------------
        */

        commissionEnabled:
            Boolean(
                reservation.commissionEnabled
            ),

        commissionType:
            reservation.commissionType ||
            "",

        commissionValue:
            normalizeFinancialNumber(
                reservation.commissionValue
            ),


        /*
        ----------------------------------------------
        CURRENCY
        ----------------------------------------------
        */

        currency:
            normalizeFinancialCurrencyCode(
                reservation.currency
            )
    };
};


/*
==========================================================
LOAD RESERVATIONS
==========================================================
*/

/**
 * Builds a lookup map for company locations.
 *
 * Historical transportation reservations may contain only
 * locationFromId / locationToId and may not have the persisted
 * locationFromName / locationToName fields that newer
 * reservations contain.
 *
 * We resolve those IDs once per report load instead of making
 * one Firestore request per reservation.
 */
const buildFinancialLocationMap = (
    locations = []
) => {
    const map =
        new Map();

    if (!Array.isArray(locations)) {
        return map;
    }

    locations.forEach(
        (location) => {
            if (!location) {
                return;
            }

            const id =
                String(
                    location.id ??
                    location.locationId ??
                    ""
                ).trim();

            const name =
                String(
                    location.name ??
                    location.locationName ??
                    location.displayName ??
                    ""
                ).trim();

            if (!id || !name) {
                return;
            }

            map.set(
                id,
                name
            );
        }
    );

    return map;
};


/**
 * Enriches historical reservations with the current location
 * names stored in the company's locations collection.
 *
 * New reservations keep their persisted names when available.
 * Older reservations are resolved by ID only when their display
 * name is missing.
 */
const enrichTransportationFinancialReservationsWithLocations = async (
    companyId,
    reservations = []
) => {
    if (
        !companyId ||
        !Array.isArray(reservations) ||
        reservations.length === 0
    ) {
        return Array.isArray(reservations)
            ? reservations
            : [];
    }

    const hasMissingLocationNames =
        reservations.some(
            (reservation) =>
                (
                    reservation?.locationFromId &&
                    !String(
                        reservation.locationFromName ??
                        ""
                    ).trim()
                ) ||
                (
                    reservation?.locationToId &&
                    !String(
                        reservation.locationToName ??
                        ""
                    ).trim()
                )
        );

    if (!hasMissingLocationNames) {
        return reservations;
    }

    let locations = [];

    try {
        locations =
            await getLocations(
                companyId
            );
    } catch (error) {
        /*
         * Historical enrichment is supplemental.
         * If the locations catalog cannot be loaded, keep the
         * original reservation data and allow the report to work.
         */
        console.warn(
            "No se pudieron cargar las ubicaciones para enriquecer reservas históricas:",
            error
        );

        return reservations;
    }

    const locationMap =
        buildFinancialLocationMap(
            locations
        );

    if (locationMap.size === 0) {
        return reservations;
    }

    return reservations.map(
        (reservation) => {
            if (!reservation) {
                return reservation;
            }

            const locationFromId =
                String(
                    reservation.locationFromId ??
                    ""
                ).trim();

            const locationToId =
                String(
                    reservation.locationToId ??
                    ""
                ).trim();

            const currentFromName =
                String(
                    reservation.locationFromName ??
                    ""
                ).trim();

            const currentToName =
                String(
                    reservation.locationToName ??
                    ""
                ).trim();

            const resolvedFromName =
                currentFromName ||
                locationMap.get(
                    locationFromId
                ) ||
                "";

            const resolvedToName =
                currentToName ||
                locationMap.get(
                    locationToId
                ) ||
                "";

            return {
                ...reservation,

                locationFromName:
                    resolvedFromName,

                locationToName:
                    resolvedToName
            };
        }
    );
};


/*
==========================================================
LOAD RESERVATIONS
==========================================================
*/

/**
 * Loads transportation reservations for a company,
 * enriches historical location references, and normalizes
 * their financial information.
 */
export const getTransportationFinancialReservations = async (
    companyId
) => {
    if (!companyId) {
        return [];
    }

    const data =
        await getTransportation(
            companyId
        );

    if (!Array.isArray(data)) {
        return [];
    }

    /*
     * Resolve historical location IDs before normalization.
     *
     * This is intentionally done once for the complete
     * reservation set instead of querying Firestore for each
     * individual reservation.
     */
    const enrichedData =
        await enrichTransportationFinancialReservationsWithLocations(
            companyId,
            data
        );

    return enrichedData
        .map(
            normalizeTransportationFinancialReservation
        )
        .filter(Boolean);
};


/*
==========================================================
FILTER
==========================================================
*/

/**
 * Applies report filters to transportation financial data.
 *
 * Date filters use the SERVICE DATE (`date`), not the
 * reservation creation date (`createdAt`).
 */
export const filterTransportationFinancialReservations = (
    reservations,
    filters = {}
) => {
    if (
        !Array.isArray(reservations)
    ) {
        return [];
    }

    const {
        startDate = "",
        endDate = "",

        searchTerm = "",

        currency = "",

        serviceType = "",
        origin = "",
        destination = "",

        driver = "",
        bookingSource = "",
        payer = "",

        status = ""
    } = filters;

    const normalizedSearch =
        String(
            searchTerm || ""
        )
            .trim()
            .toLowerCase();


    return reservations.filter(
        (reservation) => {

            /*
            ------------------------------------------
            DATE
            ------------------------------------------
            */

            const serviceDate =
                reservation.serviceDateString ||
                formatFinancialReportDate(
                    reservation.date
                );


            if (
                startDate &&
                serviceDate < startDate
            ) {
                return false;
            }


            if (
                endDate &&
                serviceDate > endDate
            ) {
                return false;
            }


            /*
            ------------------------------------------
            SEARCH
            ------------------------------------------
            */

            if (
                normalizedSearch
            ) {
                const searchableText = [
                    reservation.reservationNumber,

                    reservation.clientName,
                    reservation.clientDisplayName,
                    reservation.clientEmail,

                    reservation.phone,

                    reservation.flightNumber,

                    reservation.driverName,
                    reservation.driverDisplayName,
                    reservation.staffName,

                    reservation.vehicleName,
                    reservation.vehiclePlate,

                    reservation.serviceTypeName,
                    reservation.serviceDisplayName,

                    reservation.locationFromName,
                    reservation.locationToName,

                    reservation.bookingSourceName,
                    reservation.bookingSourceDisplayName,

                    reservation.payerName,
                    reservation.payerDisplayName,

                    reservation.paymentTypeName,
                    reservation.paymentTypeDisplayName,

                    reservation.reservationBase,

                    reservation.currency
                ]
                    .filter(
                        (value) =>
                            value !== null &&
                            value !== undefined &&
                            String(value).trim() !== ""
                    )
                    .join(" ")
                    .toLowerCase();


                if (
                    !searchableText.includes(
                        normalizedSearch
                    )
                ) {
                    return false;
                }
            }


            /*
            ------------------------------------------
            CURRENCY
            ------------------------------------------
            */

            if (currency) {
                const reservationCurrency =
                    String(
                        reservation.currency ||
                        ""
                    )
                        .trim()
                        .toUpperCase();

                const selectedCurrency =
                    String(currency)
                        .trim()
                        .toUpperCase();

                if (
                    reservationCurrency !==
                    selectedCurrency
                ) {
                    return false;
                }
            }


            /*
            ------------------------------------------
            SERVICE
            ------------------------------------------
            */

            if (
                serviceType &&
                String(
                    reservation.serviceTypeId ||
                    ""
                ) !==
                String(serviceType)
            ) {
                return false;
            }


            /*
            ------------------------------------------
            ORIGIN
            ------------------------------------------
            */

            if (
                origin &&
                String(
                    reservation.locationFromId ||
                    ""
                ) !==
                String(origin)
            ) {
                return false;
            }


            /*
            ------------------------------------------
            DESTINATION
            ------------------------------------------
            */

            if (
                destination &&
                String(
                    reservation.locationToId ||
                    ""
                ) !==
                String(destination)
            ) {
                return false;
            }


            /*
            ------------------------------------------
            DRIVER
            ------------------------------------------
            */

            if (
                driver &&
                String(
                    reservation.driverId ||
                    ""
                ) !==
                String(driver)
            ) {
                return false;
            }


            /*
            ------------------------------------------
            BOOKING SOURCE
            ------------------------------------------
            */

            if (
                bookingSource &&
                String(
                    reservation.bookingSourceId ||
                    ""
                ) !==
                String(bookingSource)
            ) {
                return false;
            }


            /*
            ------------------------------------------
            PAYER
            ------------------------------------------
            */

            if (
                payer &&
                String(
                    reservation.payerId ||
                    ""
                ) !==
                String(payer)
            ) {
                return false;
            }


            /*
            ------------------------------------------
            STATUS
            ------------------------------------------
            */

            if (
                status &&
                String(
                    reservation.status ||
                    ""
                )
                    .trim()
                    .toLowerCase() !==
                String(status)
                    .trim()
                    .toLowerCase()
            ) {
                return false;
            }


            return true;
        }
    );
};


/*
==========================================================
FILTER OPTIONS
==========================================================
*/

/**
 * Creates { value, label } options from an ID field
 * and its corresponding display field.
 *
 * Example:
 *
 * {
 *     value: "service-id",
 *     label: "Airport Transfer"
 * }
 */
const createFilterOptions = (
    reservations,
    valueKey,
    labelKeys = []
) => {

    const map =
        new Map();


    const normalizedLabelKeys =
        Array.isArray(labelKeys)
            ? labelKeys
            : [labelKeys];


    reservations.forEach(
        (reservation) => {

            const value =
                reservation?.[valueKey];


            /*
             * --------------------------------------------------
             * VALUE
             * --------------------------------------------------
             */

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return;
            }


            const normalizedValue =
                String(value)
                    .trim();


            if (!normalizedValue) {
                return;
            }


            /*
             * --------------------------------------------------
             * LABEL
             * --------------------------------------------------
             *
             * Try the configured display fields
             * in order until we find a valid value.
             */

            let label = "";


            for (
                const labelKey
                of normalizedLabelKeys
            ) {

                const rawLabel =
                    reservation?.[labelKey];


                /*
                 * Direct string / number
                 */

                if (
                    rawLabel !== null &&
                    rawLabel !== undefined &&
                    (
                        typeof rawLabel ===
                        "string" ||
                        typeof rawLabel ===
                        "number"
                    )
                ) {

                    const normalizedLabel =
                        String(rawLabel)
                            .trim();


                    if (
                        normalizedLabel
                    ) {
                        label =
                            normalizedLabel;

                        break;
                    }
                }


                /*
                 * Object values
                 *
                 * This supports data such as:
                 *
                 * {
                 *     name: "Juan Pérez"
                 * }
                 *
                 * or:
                 *
                 * {
                 *     displayName: "Juan Pérez"
                 * }
                 */

                if (
                    rawLabel &&
                    typeof rawLabel ===
                    "object"
                ) {

                    const objectLabel =
                        rawLabel.name ??
                        rawLabel.displayName ??
                        rawLabel.fullName ??
                        rawLabel.label ??
                        rawLabel.title ??
                        "";


                    const normalizedObjectLabel =
                        String(
                            objectLabel
                        ).trim();


                    if (
                        normalizedObjectLabel
                    ) {
                        label =
                            normalizedObjectLabel;

                        break;
                    }
                }
            }


            /*
             * --------------------------------------------------
             * FALLBACK
             * --------------------------------------------------
             *
             * Only use the ID when no display name
             * exists at all.
             */

            if (!label) {
                label =
                    normalizedValue;
            }


            /*
             * --------------------------------------------------
             * STORE UNIQUE OPTION
             * --------------------------------------------------
             */

            const existingOption =
                map.get(
                    normalizedValue
                );

            if (!existingOption) {

                map.set(
                    normalizedValue,
                    {
                        value:
                            normalizedValue,

                        label
                    }
                );

                return;
            }

            /*
             * If an older reservation produced the raw ID as
             * the fallback label, but a newer reservation has
             * the real display name, replace the fallback.
             */
            const existingLabel =
                String(
                    existingOption.label ??
                    ""
                ).trim();

            if (
                existingLabel ===
                    normalizedValue &&
                label &&
                label !== normalizedValue
            ) {
                map.set(
                    normalizedValue,
                    {
                        value:
                            normalizedValue,

                        label
                    }
                );
            }
        }
    );


    return Array.from(
        map.values()
    ).sort(
        (a, b) =>
            String(a.label).localeCompare(
                String(b.label),
                undefined,
                {
                    sensitivity:
                        "base"
                }
            )
    );
};


/**
 * Creates options where the value itself is also
 * the display label.
 */
const createValueOptions = (
    values = [],
    labelResolver
) => {
    const map =
        new Map();


    values.forEach(
        (value) => {
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return;
            }


            const normalizedValue =
                String(value)
                    .trim();


            if (!normalizedValue) {
                return;
            }


            const label =
                typeof labelResolver ===
                    "function"
                    ? labelResolver(
                        normalizedValue
                    )
                    : normalizedValue;


            if (
                !map.has(
                    normalizedValue
                )
            ) {
                map.set(
                    normalizedValue,
                    {
                        value:
                            normalizedValue,

                        label
                    }
                );
            }
        }
    );


    return Array.from(
        map.values()
    ).sort(
        (a, b) =>
            String(a.label).localeCompare(
                String(b.label),
                undefined,
                {
                    sensitivity:
                        "base"
                }
            )
    );
};


/**
 * Returns all options required by the financial
 * report filters.
 */
export const getTransportationFinancialFilterOptions = (
    reservations = []
) => {
    if (
        !Array.isArray(reservations)
    ) {
        return {
            currencies: [],
            serviceTypes: [],
            origins: [],
            destinations: [],
            drivers: [],
            bookingSources: [],
            payers: [],
            statuses: []
        };
    }


    /*
    ------------------------------------------------------
    CURRENCIES
    ------------------------------------------------------
    */

    const currencies =
        createValueOptions(
            reservations.map(
                (reservation) =>
                    reservation.currency
            )
        );


    /*
    ------------------------------------------------------
    SERVICE TYPES
    ------------------------------------------------------
    */

    const serviceTypes =
        createFilterOptions(
            reservations,
            "serviceTypeId",
            "serviceDisplayName"
        );


    /*
    ------------------------------------------------------
    ORIGINS
    ------------------------------------------------------
    */

    const origins =
        createFilterOptions(
            reservations,
            "locationFromId",
            [
                "locationFromName",
                "originName",
                "originDisplayName"
            ]
        );


    /*
    ------------------------------------------------------
    DESTINATIONS
    ------------------------------------------------------
    */

    const destinations =
        createFilterOptions(
            reservations,
            "locationToId",
            [
                "locationToName",
                "destinationName",
                "destinationDisplayName"
            ]
        );


    /*
    ------------------------------------------------------
    DRIVERS
    ------------------------------------------------------
    */

    const drivers =
        createFilterOptions(
            reservations,
            "driverId",
            [
                "driverDisplayName",
                "driverName",
                "driverFullName",
                "staffDisplayName",
                "staffName"
            ]
        );


    /*
    ------------------------------------------------------
    BOOKING SOURCE
    ------------------------------------------------------
    */

    const bookingSources =
        createFilterOptions(
            reservations,
            "bookingSourceId",
            "bookingSourceDisplayName"
        );


    /*
    ------------------------------------------------------
    PAYERS
    ------------------------------------------------------
    */

    const payers =
        createFilterOptions(
            reservations,
            "payerId",
            "payerDisplayName"
        );


    /*
    ------------------------------------------------------
    STATUSES
    ------------------------------------------------------
    */

    const statuses =
        createValueOptions(
            reservations.map(
                (reservation) =>
                    reservation.status
            ),
            (status) =>
                getFinancialStatusName({
                    status
                })
        );


    return {
        currencies,

        serviceTypes,

        origins,

        destinations,

        drivers,

        bookingSources,

        payers,

        statuses
    };
};


/*
==========================================================
FINANCIAL AGGREGATION
==========================================================
*/

/**
 * Aggregates financial values.
 *
 * IMPORTANT:
 * This function assumes all reservations have already
 * been filtered to the same currency.
 */
export const calculateTransportationFinancialSummary = (
    reservations = [],
    currency = ""
) => {
    if (!Array.isArray(reservations)) {
        return {
            reservationCount: 0,
            passengerCount: 0,
            grossSales: 0,
            discounts: 0,
            taxableAmount: 0,
            taxes: 0,
            total: 0,
            commissions: 0
        };
    }

    const normalizedCurrency =
        normalizeFinancialCurrencyCode(
            currency
        );

    /*
     * Never aggregate financial values from different
     * currencies. When a currency is supplied, this function
     * defensively scopes the calculation to that currency.
     */

    const scopedReservations =
        normalizedCurrency
            ? reservations.filter(
                (reservation) =>
                    normalizeFinancialCurrencyCode(
                        reservation?.currency
                    ) === normalizedCurrency
            )
            : reservations;


    if (scopedReservations.length === 0) {
        return {
            reservationCount: 0,
            passengerCount: 0,
            grossSales: 0,
            discounts: 0,
            taxableAmount: 0,
            taxes: 0,
            total: 0,
            commissions: 0
        };
    }


    const summary =
        scopedReservations.reduce(
            (result, reservation) => {

                result.reservationCount +=
                    1;

                result.passengerCount +=
                    normalizeFinancialNumber(
                        reservation.passengers
                    );

                result.grossSales +=
                    normalizeFinancialNumber(
                        reservation.subtotal
                    );

                result.discounts +=
                    normalizeFinancialNumber(
                        reservation.discountAmount
                    );

                result.taxableAmount +=
                    normalizeFinancialNumber(
                        reservation.taxableAmount
                    );

                result.taxes +=
                    normalizeFinancialNumber(
                        reservation.taxAmount
                    );

                result.total +=
                    normalizeFinancialNumber(
                        reservation.total
                    );

                result.commissions +=
                    normalizeFinancialNumber(
                        reservation.commissionAmount
                    );

                return result;

            },
            {
                reservationCount: 0,
                passengerCount: 0,
                grossSales: 0,
                discounts: 0,
                taxableAmount: 0,
                taxes: 0,
                total: 0,
                commissions: 0
            }
        );


    return roundTransportationFinancialSummary(
        summary
    );
};


/*
==========================================================
ROUND SUMMARY
==========================================================
*/

export const roundTransportationFinancialSummary = (
    summary = {}
) => {
    return {
        ...summary,

        reservationCount:
            normalizeFinancialNumber(
                summary.reservationCount
            ),

        passengerCount:
            normalizeFinancialNumber(
                summary.passengerCount
            ),

        grossSales:
            roundFinancialValue(
                summary.grossSales
            ),

        discounts:
            roundFinancialValue(
                summary.discounts
            ),

        taxableAmount:
            roundFinancialValue(
                summary.taxableAmount
            ),

        taxes:
            roundFinancialValue(
                summary.taxes
            ),

        total:
            roundFinancialValue(
                summary.total
            ),

        commissions:
            roundFinancialValue(
                summary.commissions
            )
    };
};


/*
==========================================================
SORT
==========================================================
*/

/**
 * Sorts transportation financial reservations.
 *
 * Supports both:
 *
 * sortTransportationFinancialReservations(
 *     data,
 *     "serviceDate",
 *     "desc"
 * )
 *
 * and:
 *
 * sortTransportationFinancialReservations(
 *     data,
 *     {
 *         field: "serviceDate",
 *         direction: "desc"
 *     }
 * )
 */
export const sortTransportationFinancialReservations = (
    reservations = [],
    sortKey = "serviceDate",
    direction = "desc"
) => {
    if (
        !Array.isArray(reservations)
    ) {
        return [];
    }


    /*
    ------------------------------------------------------
    SUPPORT OBJECT CONFIGURATION
    ------------------------------------------------------
    */

    if (
        sortKey &&
        typeof sortKey === "object"
    ) {
        direction =
            sortKey.direction ||
            "desc";

        sortKey =
            sortKey.field ||
            "serviceDate";
    }


    const normalizedSortKey =
        sortKey || "serviceDate";


    const normalizedDirection =
        String(
            direction || "desc"
        )
            .trim()
            .toLowerCase();


    const multiplier =
        normalizedDirection === "asc"
            ? 1
            : -1;


    return [...reservations].sort(
        (a, b) => {
            let valueA =
                a?.[normalizedSortKey];

            let valueB =
                b?.[normalizedSortKey];


            /*
            ------------------------------------------
            DATE FIELDS
            ------------------------------------------
            */

            if (
                normalizedSortKey ===
                "serviceDate"
            ) {
                valueA =
                    normalizeFinancialReportDate(
                        valueA ||
                        a?.date
                    )?.getTime() ??
                    0;

                valueB =
                    normalizeFinancialReportDate(
                        valueB ||
                        b?.date
                    )?.getTime() ??
                    0;
            }


            if (
                normalizedSortKey ===
                "createdDate"
            ) {
                valueA =
                    normalizeFinancialReportDate(
                        valueA ||
                        a?.createdAt
                    )?.getTime() ??
                    0;

                valueB =
                    normalizeFinancialReportDate(
                        valueB ||
                        b?.createdAt
                    )?.getTime() ??
                    0;
            }


            /*
            ------------------------------------------
            NUMERIC FIELDS
            ------------------------------------------
            */

            const numericFields = [
                "subtotal",
                "discountAmount",
                "taxableAmount",
                "taxAmount",
                "commissionAmount",
                "total",
                "passengers",
                "commissionValue"
            ];


            if (
                numericFields.includes(
                    normalizedSortKey
                )
            ) {
                valueA =
                    normalizeFinancialNumber(
                        valueA
                    );

                valueB =
                    normalizeFinancialNumber(
                        valueB
                    );

                return (
                    valueA -
                    valueB
                ) * multiplier;
            }


            /*
            ------------------------------------------
            EMPTY VALUES
            ------------------------------------------
            */

            const stringA =
                String(
                    valueA ?? ""
                ).trim();

            const stringB =
                String(
                    valueB ?? ""
                ).trim();


            if (
                !stringA &&
                !stringB
            ) {
                return 0;
            }


            if (!stringA) {
                return 1;
            }


            if (!stringB) {
                return -1;
            }


            /*
            ------------------------------------------
            STRING SORT
            ------------------------------------------
            */

            return (
                stringA.localeCompare(
                    stringB,
                    undefined,
                    {
                        sensitivity:
                            "base",
                        numeric:
                            true
                    }
                )
            ) * multiplier;
        }
    );
};


/*
==========================================================
MONTHLY / DAILY CHART DATA
==========================================================
*/

/**
 * Groups financial data by service date.
 *
 * All reservations should already belong to the same
 * selected currency before calling this function.
 */
export const getTransportationFinancialDailyData = (
    reservations = [],
    currency = ""
) => {
    if (!Array.isArray(reservations)) {
        return [];
    }

    const normalizedCurrency =
        normalizeFinancialCurrencyCode(
            currency
        );


    const scopedReservations =
        normalizedCurrency
            ? reservations.filter(
                (reservation) =>
                    normalizeFinancialCurrencyCode(
                        reservation?.currency
                    ) === normalizedCurrency
            )
            : reservations;


    const groups =
        new Map();


    scopedReservations.forEach(
        (reservation) => {

            const date =
                reservation.serviceDateString ||
                formatFinancialReportDate(
                    reservation.date
                );


            if (!date) {
                return;
            }


            if (!groups.has(date)) {
                groups.set(
                    date,
                    {
                        date,

                        grossSales:
                            0,

                        discounts:
                            0,

                        taxes:
                            0,

                        commissions:
                            0,

                        total:
                            0,

                        reservationCount:
                            0
                    }
                );
            }


            const group =
                groups.get(
                    date
                );


            group.grossSales +=
                normalizeFinancialNumber(
                    reservation.subtotal
                );


            group.discounts +=
                normalizeFinancialNumber(
                    reservation.discountAmount
                );


            group.taxes +=
                normalizeFinancialNumber(
                    reservation.taxAmount
                );


            group.commissions +=
                normalizeFinancialNumber(
                    reservation.commissionAmount
                );


            group.total +=
                normalizeFinancialNumber(
                    reservation.total
                );


            group.reservationCount +=
                1;

        }
    );


    return Array.from(
        groups.values()
    )
        .sort(
            (a, b) =>
                a.date.localeCompare(
                    b.date
                )
        )
        .map(
            (item) => ({
                ...item,

                grossSales:
                    roundFinancialValue(
                        item.grossSales
                    ),

                discounts:
                    roundFinancialValue(
                        item.discounts
                    ),

                taxes:
                    roundFinancialValue(
                        item.taxes
                    ),

                commissions:
                    roundFinancialValue(
                        item.commissions
                    ),

                total:
                    roundFinancialValue(
                        item.total
                    ),

                currency:
                    normalizedCurrency
            })
        );
};


/*
==========================================================
DEFAULT EXPORT
==========================================================
*/

export default {
    getTransportationFinancialReservations,

    normalizeTransportationFinancialReservation,

    normalizeFinancialCurrencyCode,

    filterTransportationFinancialReservations,

    getTransportationFinancialFilterOptions,

    calculateTransportationFinancialSummary,

    roundTransportationFinancialSummary,

    sortTransportationFinancialReservations,

    getTransportationFinancialDailyData
};