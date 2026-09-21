/* ==========================================================
   TRANSPORTATION COMMISSION REPORT SERVICE
   ========================================================== */

import {
    getTransportation
} from "../../transportation/transportationService";

import {
    getLocations
} from "../../../services/settings/transportation/locationsService";


const DEFAULT_CURRENCY = "USD";


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const normalizeString = (value) =>
    String(value ?? "").trim();


const normalizeLowerString = (value) =>
    normalizeString(value).toLowerCase();


export const normalizeCommissionNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};


export const roundCommissionValue = (value) =>
    Number(
        normalizeCommissionNumber(value).toFixed(2)
    );


export const normalizeCommissionCurrency = (value) => {
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

    return String(value || "")
        .trim()
        .toUpperCase();
};


/* ==========================================================
   DATE HELPERS
   ========================================================== */

export const normalizeCommissionReportDate = (value) => {

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

    if (
        typeof value === "object" &&
        typeof value._seconds === "number"
    ) {
        const date = new Date(
            value._seconds * 1000
        );

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
};


export const formatCommissionReportDate = (value) => {

    const date =
        normalizeCommissionReportDate(value);

    if (!date) {
        return "";
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
};


export const formatCommissionReportMonth = (value) => {

    const date =
        normalizeCommissionReportDate(value);

    if (!date) {
        return "";
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0")
    ].join("-");
};


/* ==========================================================
   COMMISSION TYPE
   ========================================================== */

export const normalizeCommissionType = (value) =>
    normalizeLowerString(value);


export const getCommissionTypeLabel = (value) => {

    const type =
        normalizeCommissionType(value);

    const labels = {
        percentage: "Porcentaje",
        percent: "Porcentaje",
        "%": "Porcentaje",
        fixed: "Monto fijo",
        amount: "Monto fijo",
        fixed_amount: "Monto fijo",
        commission: "Comisión"
    };

    return (
        labels[type] ||
        normalizeString(value) ||
        "-"
    );
};


/* ==========================================================
   DISPLAY HELPERS
   ========================================================== */

export const getCommissionClientName = (
    reservation
) =>
    reservation?.clientName ||
    reservation?.clientDisplayName ||
    reservation?.clientEmail ||
    "-";


export const getCommissionServiceName = (
    reservation
) =>
    reservation?.serviceTypeName ||
    reservation?.serviceDisplayName ||
    reservation?.serviceName ||
    "-";


export const getCommissionDriverName = (
    reservation
) =>
    reservation?.driverName ||
    reservation?.driverDisplayName ||
    reservation?.staffName ||
    "-";


export const getCommissionBookingSourceName = (
    reservation
) =>
    reservation?.bookingSourceName ||
    reservation?.bookingSourceDisplayName ||
    reservation?.bookingSource ||
    "-";


export const getCommissionStatusName = (
    reservation
) => {

    const status =
        normalizeLowerString(
            reservation?.status
        );

    const labels = {
        pending: "Pendiente",
        confirmed: "Confirmada",
        completed: "Completada",
        cancelled: "Cancelada",
        canceled: "Cancelada",
        draft: "Borrador"
    };

    return (
        labels[status] ||
        reservation?.statusDisplayName ||
        reservation?.status ||
        "-"
    );
};


/* ==========================================================
   LOCATION ENRICHMENT
   ========================================================== */

const buildLocationMap = (
    locations = []
) => {

    const map = new Map();

    if (!Array.isArray(locations)) {
        return map;
    }

    locations.forEach((location) => {

        if (!location) {
            return;
        }

        const id = normalizeString(
            location.id ??
            location.locationId
        );

        const name = normalizeString(
            location.name ??
            location.locationName ??
            location.displayName
        );

        if (id && name) {
            map.set(id, name);
        }

    });

    return map;
};


const enrichCommissionReservationsWithLocations = async (
    companyId,
    reservations
) => {

    if (
        !companyId ||
        !Array.isArray(reservations) ||
        reservations.length === 0
    ) {
        return reservations || [];
    }

    const needsLocations = reservations.some(
        (reservation) =>
            (
                reservation?.locationFromId &&
                !normalizeString(
                    reservation.locationFromName
                )
            ) ||
            (
                reservation?.locationToId &&
                !normalizeString(
                    reservation.locationToName
                )
            )
    );

    if (!needsLocations) {
        return reservations;
    }

    try {

        const locations =
            await getLocations(companyId);

        const locationMap =
            buildLocationMap(locations);

        if (!locationMap.size) {
            return reservations;
        }

        return reservations.map(
            (reservation) => {

                if (!reservation) {
                    return reservation;
                }

                const fromId =
                    normalizeString(
                        reservation.locationFromId
                    );

                const toId =
                    normalizeString(
                        reservation.locationToId
                    );

                return {
                    ...reservation,

                    locationFromName:
                        normalizeString(
                            reservation.locationFromName
                        ) ||
                        locationMap.get(fromId) ||
                        "",

                    locationToName:
                        normalizeString(
                            reservation.locationToName
                        ) ||
                        locationMap.get(toId) ||
                        ""
                };

            }
        );

    } catch (error) {

        console.warn(
            "No se pudieron cargar las ubicaciones para el reporte de comisiones:",
            error
        );

        return reservations;
    }
};


/* ==========================================================
   COMMISSION DETECTION
   ========================================================== */

/*
 * Una reserva entra al reporte únicamente cuando
 * tiene la comisión activada.
 *
 * No usamos commissionType, commissionValue o
 * commissionAmount para decidir si la reserva entra.
 *
 * Esto evita mostrar reservas normales que tengan
 * datos históricos o valores residuales de comisión.
 */

export const hasCommissionData = (
    reservation
) =>
    Boolean(
        reservation?.commissionEnabled === true
    );


/* ==========================================================
   NORMALIZATION
   ========================================================== */

export const normalizeTransportationCommissionReservation = (
    reservation
) => {

    if (
        !reservation ||
        !hasCommissionData(reservation)
    ) {
        return null;
    }

    const serviceDate =
        normalizeCommissionReportDate(
            reservation.date
        );

    const createdDate =
        normalizeCommissionReportDate(
            reservation.createdAt
        );

    const subtotal =
        roundCommissionValue(
            reservation.subtotal ??
            reservation.price
        );

    const discountAmount =
        roundCommissionValue(
            reservation.discountAmount
        );

    const taxableAmount =
        roundCommissionValue(
            Math.max(
                subtotal - discountAmount,
                0
            )
        );

    const taxAmount =
        roundCommissionValue(
            reservation.taxAmount
        );

    const total =
        roundCommissionValue(
            reservation.total
        );

    const commissionAmount =
        roundCommissionValue(
            reservation.commissionAmount
        );

    const commissionValue =
        roundCommissionValue(
            reservation.commissionValue
        );

    const currency =
        normalizeCommissionCurrency(
            reservation.currency
        ) || DEFAULT_CURRENCY;

    const passengers =
        normalizeCommissionNumber(
            reservation.passengers
        );

    const commissionType =
        normalizeCommissionType(
            reservation.commissionType
        );

    const locationFromName =
        normalizeString(
            reservation.locationFromName
        );

    const locationToName =
        normalizeString(
            reservation.locationToName
        );

    return {

        ...reservation,

        /* Dates */

        serviceDate,

        serviceDateString:
            reservation.dateString ||
            formatCommissionReportDate(
                reservation.date
            ),

        createdDate,

        createdDateString:
            formatCommissionReportDate(
                reservation.createdAt
            ),

        month:
            formatCommissionReportMonth(
                reservation.date
            ),

        /* Display */

        reservationDisplayNumber:
            reservation.reservationNumber ||
            reservation.reservationId ||
            reservation.id ||
            "-",

        clientDisplayName:
            getCommissionClientName(
                reservation
            ),

        serviceDisplayName:
            getCommissionServiceName(
                reservation
            ),

        driverDisplayName:
            getCommissionDriverName(
                reservation
            ),

        bookingSourceDisplayName:
            getCommissionBookingSourceName(
                reservation
            ),

        statusDisplayName:
            getCommissionStatusName(
                reservation
            ),

        locationFromDisplayName:
            locationFromName ||
            reservation.originName ||
            reservation.origin ||
            "-",

        locationToDisplayName:
            locationToName ||
            reservation.destinationName ||
            reservation.destination ||
            "-",

        /* Financial */

        subtotal,
        discountAmount,
        taxableAmount,
        taxAmount,
        total,

        /* Commission */

        commissionEnabled: true,
        commissionType,
        commissionTypeLabel:
            getCommissionTypeLabel(
                reservation.commissionType
            ),
        commissionValue,
        commissionAmount,

        /* Operational */

        passengers,

        /* Currency */

        currency

    };
};


/* ==========================================================
   LOAD RESERVATIONS
   ========================================================== */

export const getTransportationCommissionReservations = async (
    companyId
) => {

    if (!companyId) {
        return [];
    }

    const reservations =
        await getTransportation(
            companyId
        );

    if (!Array.isArray(reservations)) {
        return [];
    }

    const enrichedReservations =
        await enrichCommissionReservationsWithLocations(
            companyId,
            reservations
        );

    return enrichedReservations
        .map(
            normalizeTransportationCommissionReservation
        )
        .filter(Boolean);
};


/* ==========================================================
   FILTER OPTIONS
   ========================================================== */

const addFilterOption = (
    map,
    value,
    label
) => {

    const normalizedValue =
        normalizeString(value);

    if (!normalizedValue) {
        return;
    }

    const normalizedLabel =
        normalizeString(label) ||
        normalizedValue;

    const current =
        map.get(normalizedValue);

    if (!current) {

        map.set(
            normalizedValue,
            {
                value: normalizedValue,
                label: normalizedLabel
            }
        );

        return;
    }

    if (
        normalizeString(current.label) ===
            normalizedValue &&
        normalizedLabel !==
            normalizedValue
    ) {

        map.set(
            normalizedValue,
            {
                value: normalizedValue,
                label: normalizedLabel
            }
        );
    }
};


const sortOptions = (map) =>
    Array.from(map.values()).sort(
        (a, b) =>
            String(a.label).localeCompare(
                String(b.label),
                undefined,
                {
                    sensitivity: "base",
                    numeric: true
                }
            )
    );


export const getTransportationCommissionFilterOptions = (
    reservations = []
) => {

    if (!Array.isArray(reservations)) {
        return {
            currencies: [],
            serviceTypes: [],
            origins: [],
            destinations: [],
            drivers: [],
            bookingSources: [],
            commissionTypes: [],
            statuses: []
        };
    }

    const maps = {
        currencies: new Map(),
        serviceTypes: new Map(),
        origins: new Map(),
        destinations: new Map(),
        drivers: new Map(),
        bookingSources: new Map(),
        commissionTypes: new Map(),
        statuses: new Map()
    };

    reservations.forEach((reservation) => {

        if (!reservation) {
            return;
        }

        addFilterOption(
            maps.currencies,
            reservation.currency,
            reservation.currency
        );

        addFilterOption(
            maps.serviceTypes,
            reservation.serviceTypeId ||
            reservation.serviceTypeName ||
            reservation.serviceDisplayName,
            reservation.serviceTypeName ||
            reservation.serviceDisplayName ||
            reservation.serviceTypeId
        );

        addFilterOption(
            maps.origins,
            reservation.locationFromId ||
            reservation.locationFromName ||
            reservation.originName ||
            reservation.origin,
            reservation.locationFromName ||
            reservation.originName ||
            reservation.origin ||
            reservation.locationFromId
        );

        addFilterOption(
            maps.destinations,
            reservation.locationToId ||
            reservation.locationToName ||
            reservation.destinationName ||
            reservation.destination,
            reservation.locationToName ||
            reservation.destinationName ||
            reservation.destination ||
            reservation.locationToId
        );

        addFilterOption(
            maps.drivers,
            reservation.driverId ||
            reservation.driverName ||
            reservation.driverDisplayName,
            reservation.driverName ||
            reservation.driverDisplayName ||
            reservation.driverId
        );

        addFilterOption(
            maps.bookingSources,
            reservation.bookingSourceId ||
            reservation.bookingSourceName ||
            reservation.bookingSource,
            reservation.bookingSourceName ||
            reservation.bookingSource
        );

        addFilterOption(
            maps.commissionTypes,
            reservation.commissionType,
            getCommissionTypeLabel(
                reservation.commissionType
            )
        );

        addFilterOption(
            maps.statuses,
            reservation.status,
            reservation.statusDisplayName ||
            getCommissionStatusName(
                reservation
            )
        );

    });

    const currencies =
        sortOptions(
            maps.currencies
        );

    if (
        !currencies.some(
            (option) =>
                option.value ===
                DEFAULT_CURRENCY
        )
    ) {
        currencies.unshift({
            value: DEFAULT_CURRENCY,
            label: DEFAULT_CURRENCY
        });
    }

    return {
        currencies,
        serviceTypes:
            sortOptions(maps.serviceTypes),
        origins:
            sortOptions(maps.origins),
        destinations:
            sortOptions(maps.destinations),
        drivers:
            sortOptions(maps.drivers),
        bookingSources:
            sortOptions(maps.bookingSources),
        commissionTypes:
            sortOptions(maps.commissionTypes),
        statuses:
            sortOptions(maps.statuses)
    };
};


/* ==========================================================
   SEARCH
   ========================================================== */

export const getTransportationCommissionSearchText = (
    reservation
) => {

    if (!reservation) {
        return "";
    }

    return [
        reservation.reservationNumber,
        reservation.reservationId,
        reservation.id,
        reservation.clientName,
        reservation.clientDisplayName,
        reservation.clientEmail,
        reservation.serviceTypeName,
        reservation.serviceDisplayName,
        reservation.driverName,
        reservation.driverDisplayName,
        reservation.locationFromName,
        reservation.locationToName,
        reservation.originName,
        reservation.destinationName,
        reservation.bookingSourceName,
        reservation.bookingSource,
        reservation.commissionType,
        reservation.commissionTypeLabel,
        reservation.currency
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
};


/* ==========================================================
   FILTER
   ========================================================== */

export const filterTransportationCommissionReservations = (
    reservations = [],
    filters = {}
) => {

    if (!Array.isArray(reservations)) {
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
        commissionType = "",
        status = ""
    } = filters;

    const search =
        normalizeLowerString(
            searchTerm
        );

    const selectedCurrency =
        normalizeCommissionCurrency(
            currency
        );

    const selectedServiceType =
        normalizeString(
            serviceType
        );

    const selectedOrigin =
        normalizeString(
            origin
        );

    const selectedDestination =
        normalizeString(
            destination
        );

    const selectedDriver =
        normalizeString(
            driver
        );

    const selectedBookingSource =
        normalizeString(
            bookingSource
        );

    const selectedCommissionType =
        normalizeLowerString(
            commissionType
        );

    const selectedStatus =
        normalizeLowerString(
            status
        );

    const start =
        normalizeCommissionReportDate(
            startDate
        );

    const end =
        normalizeCommissionReportDate(
            endDate
        );

    if (end) {
        end.setHours(
            23,
            59,
            59,
            999
        );
    }

    return reservations.filter(
        (reservation) => {

            if (
                !reservation ||
                !hasCommissionData(
                    reservation
                )
            ) {
                return false;
            }

            /* Search */

            if (
                search &&
                !getTransportationCommissionSearchText(
                    reservation
                ).includes(search)
            ) {
                return false;
            }

            /* Date */

            if (start || end) {

                const serviceDate =
                    normalizeCommissionReportDate(
                        reservation.serviceDate ||
                        reservation.date
                    );

                if (!serviceDate) {
                    return false;
                }

                if (
                    start &&
                    serviceDate < start
                ) {
                    return false;
                }

                if (
                    end &&
                    serviceDate > end
                ) {
                    return false;
                }
            }

            /* Currency */

            if (
                selectedCurrency &&
                normalizeCommissionCurrency(
                    reservation.currency
                ) !== selectedCurrency
            ) {
                return false;
            }

            /* Service */

            if (
                selectedServiceType &&
                normalizeString(
                    reservation.serviceTypeId ||
                    reservation.serviceTypeName ||
                    reservation.serviceDisplayName
                ) !== selectedServiceType
            ) {
                return false;
            }

            /* Origin */

            if (
                selectedOrigin &&
                normalizeString(
                    reservation.locationFromId ||
                    reservation.locationFromName ||
                    reservation.originName ||
                    reservation.origin
                ) !== selectedOrigin
            ) {
                return false;
            }

            /* Destination */

            if (
                selectedDestination &&
                normalizeString(
                    reservation.locationToId ||
                    reservation.locationToName ||
                    reservation.destinationName ||
                    reservation.destination
                ) !== selectedDestination
            ) {
                return false;
            }

            /* Driver */

            if (
                selectedDriver &&
                normalizeString(
                    reservation.driverId ||
                    reservation.driverName ||
                    reservation.driverDisplayName
                ) !== selectedDriver
            ) {
                return false;
            }

            /* Booking source */

            if (
                selectedBookingSource &&
                normalizeString(
                    reservation.bookingSourceId ||
                    reservation.bookingSourceName ||
                    reservation.bookingSource
                ) !== selectedBookingSource
            ) {
                return false;
            }

            /* Commission type */

            if (
                selectedCommissionType &&
                normalizeLowerString(
                    reservation.commissionType
                ) !== selectedCommissionType
            ) {
                return false;
            }

            /* Status */

            if (
                selectedStatus &&
                normalizeLowerString(
                    reservation.status
                ) !== selectedStatus
            ) {
                return false;
            }

            return true;
        }
    );
};


/* ==========================================================
   SUMMARY
   ========================================================== */

export const calculateTransportationCommissionSummary = (
    reservations = [],
    currency = ""
) => {

    if (!Array.isArray(reservations)) {
        return {
            reservationCount: 0,
            passengerCount: 0,
            grossSales: 0,
            discounts: 0,
            total: 0,
            commissions: 0,
            commissionRate: 0
        };
    }

    const selectedCurrency =
        normalizeCommissionCurrency(
            currency
        );

    const data =
        selectedCurrency
            ? reservations.filter(
                (reservation) =>
                    normalizeCommissionCurrency(
                        reservation?.currency
                    ) === selectedCurrency
            )
            : reservations;

    const summary = data.reduce(
        (result, reservation) => {

            result.reservationCount += 1;

            result.passengerCount +=
                normalizeCommissionNumber(
                    reservation.passengers
                );

            result.grossSales +=
                normalizeCommissionNumber(
                    reservation.subtotal
                );

            result.discounts +=
                normalizeCommissionNumber(
                    reservation.discountAmount
                );

            result.total +=
                normalizeCommissionNumber(
                    reservation.total
                );

            result.commissions +=
                normalizeCommissionNumber(
                    reservation.commissionAmount
                );

            return result;
        },
        {
            reservationCount: 0,
            passengerCount: 0,
            grossSales: 0,
            discounts: 0,
            total: 0,
            commissions: 0
        }
    );

    return {
        ...summary,

        grossSales:
            roundCommissionValue(
                summary.grossSales
            ),

        discounts:
            roundCommissionValue(
                summary.discounts
            ),

        total:
            roundCommissionValue(
                summary.total
            ),

        commissions:
            roundCommissionValue(
                summary.commissions
            ),

        commissionRate:
            summary.grossSales > 0
                ? roundCommissionValue(
                    (
                        summary.commissions /
                        summary.grossSales
                    ) * 100
                )
                : 0
    };
};


/* ==========================================================
   DAILY DATA
   ========================================================== */

export const getTransportationCommissionDailyData = (
    reservations = [],
    currency = ""
) => {

    if (!Array.isArray(reservations)) {
        return [];
    }

    const selectedCurrency =
        normalizeCommissionCurrency(
            currency
        );

    const data =
        selectedCurrency
            ? reservations.filter(
                (reservation) =>
                    normalizeCommissionCurrency(
                        reservation?.currency
                    ) === selectedCurrency
            )
            : reservations;

    const groups = new Map();

    data.forEach((reservation) => {

        if (!reservation) {
            return;
        }

        const date =
            reservation.serviceDateString ||
            formatCommissionReportDate(
                reservation.serviceDate ||
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
                    reservationCount: 0,
                    grossSales: 0,
                    commissions: 0
                }
            );
        }

        const group =
            groups.get(date);

        group.reservationCount += 1;

        group.grossSales +=
            normalizeCommissionNumber(
                reservation.subtotal
            );

        group.commissions +=
            normalizeCommissionNumber(
                reservation.commissionAmount
            );

    });

    return Array.from(
        groups.values()
    )
        .sort(
            (a, b) =>
                a.date.localeCompare(b.date)
        )
        .map((item) => ({
            ...item,

            grossSales:
                roundCommissionValue(
                    item.grossSales
                ),

            commissions:
                roundCommissionValue(
                    item.commissions
                ),

            commissionRate:
                item.grossSales > 0
                    ? roundCommissionValue(
                        (
                            item.commissions /
                            item.grossSales
                        ) * 100
                    )
                    : 0
        }));
};


/* ==========================================================
   SORT
   ========================================================== */

export const sortTransportationCommissionReservations = (
    reservations = [],
    sortConfig = {}
) => {

    if (!Array.isArray(reservations)) {
        return [];
    }

    const sortKey =
        sortConfig.field ||
        sortConfig.key ||
        "serviceDate";

    const direction =
        normalizeLowerString(
            sortConfig.direction || "desc"
        );

    const multiplier =
        direction === "asc"
            ? 1
            : -1;

    const numericFields = new Set([
        "passengers",
        "subtotal",
        "discountAmount",
        "taxableAmount",
        "taxAmount",
        "total",
        "commissionAmount",
        "commissionValue"
    ]);

    const dateFields = new Set([
        "serviceDate",
        "createdDate"
    ]);

    return [...reservations].sort(
        (a, b) => {

            let valueA =
                a?.[sortKey];

            let valueB =
                b?.[sortKey];

            if (dateFields.has(sortKey)) {

                valueA =
                    normalizeCommissionReportDate(
                        valueA ||
                        (
                            sortKey === "serviceDate"
                                ? a?.date
                                : a?.createdAt
                        )
                    )?.getTime() ?? null;

                valueB =
                    normalizeCommissionReportDate(
                        valueB ||
                        (
                            sortKey === "serviceDate"
                                ? b?.date
                                : b?.createdAt
                        )
                    )?.getTime() ?? null;

                if (
                    valueA === null &&
                    valueB === null
                ) {
                    return 0;
                }

                if (valueA === null) {
                    return 1;
                }

                if (valueB === null) {
                    return -1;
                }

                return (
                    valueA - valueB
                ) * multiplier;
            }

            if (numericFields.has(sortKey)) {

                return (
                    normalizeCommissionNumber(
                        valueA
                    ) -
                    normalizeCommissionNumber(
                        valueB
                    )
                ) * multiplier;
            }

            const stringA =
                normalizeString(valueA);

            const stringB =
                normalizeString(valueB);

            if (!stringA && !stringB) {
                return 0;
            }

            if (!stringA) {
                return 1;
            }

            if (!stringB) {
                return -1;
            }

            return (
                stringA.localeCompare(
                    stringB,
                    undefined,
                    {
                        sensitivity: "base",
                        numeric: true
                    }
                )
            ) * multiplier;
        }
    );
};


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default {
    getTransportationCommissionReservations,
    normalizeTransportationCommissionReservation,
    hasCommissionData,
    getTransportationCommissionFilterOptions,
    getTransportationCommissionSearchText,
    filterTransportationCommissionReservations,
    calculateTransportationCommissionSummary,
    getTransportationCommissionDailyData,
    sortTransportationCommissionReservations,

    normalizeCommissionReportDate,
    formatCommissionReportDate,
    formatCommissionReportMonth,

    normalizeCommissionNumber,
    roundCommissionValue,
    normalizeCommissionCurrency,

    normalizeCommissionType,
    getCommissionTypeLabel,

    getCommissionClientName,
    getCommissionServiceName,
    getCommissionDriverName,
    getCommissionBookingSourceName,
    getCommissionStatusName
};