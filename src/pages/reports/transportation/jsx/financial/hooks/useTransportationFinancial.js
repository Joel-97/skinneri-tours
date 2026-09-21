import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";


import {
    getTransportationFinancialReservations,
    filterTransportationFinancialReservations,
    getTransportationFinancialFilterOptions,
    calculateTransportationFinancialSummary,
    getTransportationFinancialDailyData,
    sortTransportationFinancialReservations
} from "../../../../../../services/reports/transportation/transportationFinancialService";


import {
    useAuth
} from "../../../../../../context/AuthContext";


import {
    formatFinancialCurrency,
    formatFinancialNumber,
    formatFinancialDate,
    getFinancialReservationSearchText
} from "../utils/transportationFinancialUtils";


import {
    exportTransportationFinancialToExcel,
    exportTransportationFinancialToPDF
} from "../utils/transportationFinancialExports";


/*
==========================================================
CONSTANTS
==========================================================
*/

const DEFAULT_CURRENCY =
    "USD";


const DEFAULT_SORT = {
    field:
        "serviceDate",

    direction:
        "desc"
};


const EMPTY_FILTER_OPTIONS = {
    currencies: [],
    serviceTypes: [],
    origins: [],
    destinations: [],
    drivers: [],
    bookingSources: [],
    payers: [],
    statuses: []
};


const EMPTY_SUMMARY = {
    reservationCount: 0,
    passengerCount: 0,
    grossSales: 0,
    discounts: 0,
    taxableAmount: 0,
    taxes: 0,
    total: 0,
    commissions: 0
};


/*
==========================================================
NORMALIZATION HELPERS
==========================================================
*/

const normalizeSelectOptions = (
    options = []
) => {

    return options
        .filter(Boolean)
        .map(
            (option) => {

                if (
                    typeof option ===
                    "string"
                ) {
                    return {
                        value:
                            option,

                        label:
                            option
                    };
                }


                return {
                    value:
                        option.value ??
                        option.id ??
                        "",

                    label:
                        option.label ??
                        option.name ??
                        option.value ??
                        option.id ??
                        ""
                };
            }
        )
        .filter(
            (option) =>
                option.value !== "" &&
                option.label !== ""
        );
};


/*
 * Normalize a currency value to a
 * three-letter uppercase code.
 */
const normalizeCurrencyCode = (
    value
) => {

    if (
        value &&
        typeof value ===
        "object"
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


/*
==========================================================
CURRENCY OPTIONS
==========================================================
*/

/*
 * USD must always be available because it is
 * the initial currency of the financial report.
 */
const buildCurrencyOptions = (
    options = []
) => {

    const normalizedOptions =
        normalizeSelectOptions(
            options
        );


    const normalizedMap =
        new Map();


    normalizedOptions.forEach(
        (option) => {

            const code =
                normalizeCurrencyCode(
                    option.value
                );


            if (!code) {
                return;
            }


            if (
                !normalizedMap.has(
                    code
                )
            ) {

                normalizedMap.set(
                    code,
                    {
                        value:
                            code,

                        label:
                            option.label ||
                            code
                    }
                );
            }
        }
    );


    /*
     * USD is always present.
     */
    if (
        !normalizedMap.has(
            DEFAULT_CURRENCY
        )
    ) {

        normalizedMap.set(
            DEFAULT_CURRENCY,
            {
                value:
                    DEFAULT_CURRENCY,

                label:
                    "USD — US Dollar"
            }
        );

    } else {

        /*
         * Reinsert USD so that the sort
         * below always places it first.
         */
        const usdOption =
            normalizedMap.get(
                DEFAULT_CURRENCY
            );


        normalizedMap.delete(
            DEFAULT_CURRENCY
        );


        normalizedMap.set(
            DEFAULT_CURRENCY,
            usdOption
        );
    }


    return Array.from(
        normalizedMap.values()
    ).sort(
        (a, b) => {

            if (
                a.value ===
                DEFAULT_CURRENCY
            ) {
                return -1;
            }


            if (
                b.value ===
                DEFAULT_CURRENCY
            ) {
                return 1;
            }


            return String(
                a.label
            ).localeCompare(
                String(
                    b.label
                ),
                undefined,
                {
                    sensitivity:
                        "base"
                }
            );
        }
    );
};


/*
==========================================================
HOOK
==========================================================
*/

const useTransportationFinancial = ({
    onExportExcel,
    onExportPDF
} = {}) => {

    const {
        session
    } = useAuth();


    /*
    ======================================================
    COMPANY
    ======================================================
    */

    const company =
        session?.company;


    const companyId =
        company?.id;


    /*
    ======================================================
    DATA
    ======================================================
    */

    const [
        reservations,
        setReservations
    ] = useState([]);


    const [
        filteredReservations,
        setFilteredReservations
    ] = useState([]);


    /*
    ======================================================
    FILTER OPTIONS
    ======================================================
    */

    const [
        filterOptions,
        setFilterOptions
    ] = useState(
        EMPTY_FILTER_OPTIONS
    );


    /*
    ======================================================
    FILTER STATE
    ======================================================
    */

    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        startDateFilter,
        setStartDateFilter
    ] = useState("");


    const [
        endDateFilter,
        setEndDateFilter
    ] = useState("");


    /*
     * Currency is intentionally kept as its own
     * state because it represents the financial
     * context of the report.
     */
    const [
        currencyFilter,
        setCurrencyFilter
    ] = useState(
        DEFAULT_CURRENCY
    );


    const [
        serviceTypeFilter,
        setServiceTypeFilter
    ] = useState("");


    const [
        originFilter,
        setOriginFilter
    ] = useState("");


    const [
        destinationFilter,
        setDestinationFilter
    ] = useState("");


    const [
        driverFilter,
        setDriverFilter
    ] = useState("");


    const [
        bookingSourceFilter,
        setBookingSourceFilter
    ] = useState("");


    const [
        payerFilter,
        setPayerFilter
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("");


    /*
    ======================================================
    SORT STATE
    ======================================================
    */

    const [
        sortConfig,
        setSortConfig
    ] = useState(
        DEFAULT_SORT
    );


    /*
    ======================================================
    SUMMARY
    ======================================================
    */

    const [
        summary,
        setSummary
    ] = useState(
        EMPTY_SUMMARY
    );


    /*
    ======================================================
    CHART
    ======================================================
    */

    const [
        dailyData,
        setDailyData
    ] = useState([]);


    /*
    ======================================================
    UI STATE
    ======================================================
    */

    const [
        filtersOpen,
        setFiltersOpen
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        filtering,
        setFiltering
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    /*
    ======================================================
    LOAD
    ======================================================
    */

    const loadReservations =
        useCallback(
            async () => {

                if (!companyId) {

                    setReservations([]);

                    setFilteredReservations([]);

                    setFilterOptions(
                        EMPTY_FILTER_OPTIONS
                    );

                    setSummary(
                        EMPTY_SUMMARY
                    );

                    setDailyData([]);

                    setLoading(false);

                    return;
                }


                try {

                    setLoading(true);

                    setError("");


                    /*
                    --------------------------------------
                    LOAD RESERVATIONS
                    --------------------------------------
                    */

                    const data =
                        await getTransportationFinancialReservations(
                            companyId
                        );


                    const safeData =
                        Array.isArray(data)
                            ? data
                            : [];


                    setReservations(
                        safeData
                    );


                    /*
                    --------------------------------------
                    FILTER OPTIONS
                    --------------------------------------
                    */

                    const options =
                        getTransportationFinancialFilterOptions(
                            safeData
                        );


                    setFilterOptions({

                        currencies:
                            buildCurrencyOptions(
                                options?.currencies
                            ),

                        serviceTypes:
                            normalizeSelectOptions(
                                options?.serviceTypes
                            ),

                        origins:
                            normalizeSelectOptions(
                                options?.origins
                            ),

                        destinations:
                            normalizeSelectOptions(
                                options?.destinations
                            ),

                        drivers:
                            normalizeSelectOptions(
                                options?.drivers
                            ),

                        bookingSources:
                            normalizeSelectOptions(
                                options?.bookingSources
                            ),

                        payers:
                            normalizeSelectOptions(
                                options?.payers
                            ),

                        statuses:
                            normalizeSelectOptions(
                                options?.statuses
                            )

                    });


                    /*
                    --------------------------------------
                    RESET REPORT CURRENCY
                    --------------------------------------
                    */

                    setCurrencyFilter(
                        DEFAULT_CURRENCY
                    );


                } catch (err) {

                    console.error(
                        "Error cargando reporte financiero de transporte:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo cargar el reporte financiero."
                    );


                    setReservations([]);

                    setFilteredReservations([]);

                    setFilterOptions(
                        EMPTY_FILTER_OPTIONS
                    );

                    setSummary(
                        EMPTY_SUMMARY
                    );

                    setDailyData([]);

                } finally {

                    setLoading(false);
                }

            },
            [
                companyId
            ]
        );


    /*
    ======================================================
    INITIAL LOAD
    ======================================================
    */

    useEffect(
        () => {

            loadReservations();

        },
        [
            loadReservations
        ]
    );


    /*
    ======================================================
    FILTER STATE
    ======================================================
    */

    const filters = {

        searchTerm,

        setSearchTerm,


        startDate:
            startDateFilter,

        setStartDate:
            setStartDateFilter,


        endDate:
            endDateFilter,

        setEndDate:
            setEndDateFilter,


        currency:
            currencyFilter,

        setCurrency:
            setCurrencyFilter,


        serviceType:
            serviceTypeFilter,

        setServiceType:
            setServiceTypeFilter,


        origin:
            originFilter,

        setOrigin:
            setOriginFilter,


        destination:
            destinationFilter,

        setDestination:
            setDestinationFilter,


        driver:
            driverFilter,

        setDriver:
            setDriverFilter,


        bookingSource:
            bookingSourceFilter,

        setBookingSource:
            setBookingSourceFilter,


        payer:
            payerFilter,

        setPayer:
            setPayerFilter,


        status:
            statusFilter,

        setStatus:
            setStatusFilter

    };


    /*
    ======================================================
    FILTER OPTIONS
    ======================================================
    */

    const serviceTypeOptions =
        useMemo(
            () =>
                filterOptions.serviceTypes,
            [
                filterOptions.serviceTypes
            ]
        );


    const originOptions =
        useMemo(
            () =>
                filterOptions.origins,
            [
                filterOptions.origins
            ]
        );


    const destinationOptions =
        useMemo(
            () =>
                filterOptions.destinations,
            [
                filterOptions.destinations
            ]
        );


    const driverOptions =
        useMemo(
            () =>
                filterOptions.drivers,
            [
                filterOptions.drivers
            ]
        );


    const bookingSourceOptions =
        useMemo(
            () =>
                filterOptions.bookingSources,
            [
                filterOptions.bookingSources
            ]
        );


    const payerOptions =
        useMemo(
            () =>
                filterOptions.payers,
            [
                filterOptions.payers
            ]
        );


    const currencyOptions =
        useMemo(
            () =>
                buildCurrencyOptions(
                    filterOptions.currencies
                ),
            [
                filterOptions.currencies
            ]
        );


    const statusOptions =
        useMemo(
            () =>
                filterOptions.statuses,
            [
                filterOptions.statuses
            ]
        );


    /*
    ======================================================
    FILTERED RESERVATIONS
    ======================================================
    */

    useEffect(
        () => {

            /*
             * Do not filter until the initial
             * reservation load has completed.
             */
            if (loading) {
                return;
            }


            try {

                setFiltering(true);

                setError("");


                /*
                --------------------------------------
                BUILD FILTER OBJECT
                --------------------------------------
                */

                const currentFilters = {

                    startDate:
                        startDateFilter,

                    endDate:
                        endDateFilter,

                    searchTerm,

                    currency:
                        currencyFilter,

                    serviceType:
                        serviceTypeFilter,

                    origin:
                        originFilter,

                    destination:
                        destinationFilter,

                    driver:
                        driverFilter,

                    bookingSource:
                        bookingSourceFilter,

                    payer:
                        payerFilter,

                    status:
                        statusFilter

                };


                /*
                --------------------------------------
                FILTER
                --------------------------------------
                */

                const filtered =
                    filterTransportationFinancialReservations(
                        reservations,
                        currentFilters
                    );


                /*
                --------------------------------------
                SORT
                --------------------------------------
                */

                const sorted =
                    sortTransportationFinancialReservations(
                        filtered,
                        sortConfig
                    );


                setFilteredReservations(
                    sorted
                );


                /*
                --------------------------------------
                SUMMARY
                --------------------------------------
                */

                const filteredSummary =
                    calculateTransportationFinancialSummary(
                        sorted,
                        currencyFilter
                    );


                setSummary(
                    filteredSummary
                );


                /*
                --------------------------------------
                CHART
                --------------------------------------
                */

                const filteredDailyData =
                    getTransportationFinancialDailyData(
                        sorted,
                        currencyFilter
                    );


                setDailyData(
                    filteredDailyData
                );


            } catch (err) {

                console.error(
                    "Error filtrando reporte financiero de transporte:",
                    err
                );


                setError(
                    err?.message ||
                    "No se pudieron aplicar los filtros."
                );


                setFilteredReservations([]);

                setSummary(
                    EMPTY_SUMMARY
                );

                setDailyData([]);

            } finally {

                setFiltering(false);
            }

        },
        [
            reservations,

            startDateFilter,
            endDateFilter,
            searchTerm,
            currencyFilter,
            serviceTypeFilter,
            originFilter,
            destinationFilter,
            driverFilter,
            bookingSourceFilter,
            payerFilter,
            statusFilter,

            sortConfig,

            loading
        ]
    );


    /*
    ======================================================
    UPDATE FILTER
    ======================================================
    */

    const updateFilter =
        useCallback(
            (name, value) => {

                const nextValue =
                    value ?? "";


                switch (name) {

                    case "searchTerm":

                        setSearchTerm(
                            nextValue
                        );

                        break;


                    case "startDate":

                        setStartDateFilter(
                            nextValue
                        );

                        break;


                    case "endDate":

                        setEndDateFilter(
                            nextValue
                        );

                        break;


                    case "currency":

                        setCurrencyFilter(
                            normalizeCurrencyCode(
                                nextValue
                            ) ||
                            DEFAULT_CURRENCY
                        );

                        break;


                    case "serviceType":

                        setServiceTypeFilter(
                            nextValue
                        );

                        break;


                    case "origin":

                        setOriginFilter(
                            nextValue
                        );

                        break;


                    case "destination":

                        setDestinationFilter(
                            nextValue
                        );

                        break;


                    case "driver":

                        setDriverFilter(
                            nextValue
                        );

                        break;


                    case "bookingSource":

                        setBookingSourceFilter(
                            nextValue
                        );

                        break;


                    case "payer":

                        setPayerFilter(
                            nextValue
                        );

                        break;


                    case "status":

                        setStatusFilter(
                            nextValue
                        );

                        break;


                    default:

                        break;
                }

            },
            []
        );


    /*
    ======================================================
    UPDATE FILTERS
    ======================================================
    */

    const updateFilters =
        useCallback(
            (values = {}) => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "searchTerm"
                    )
                ) {

                    setSearchTerm(
                        values.searchTerm ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "startDate"
                    )
                ) {

                    setStartDateFilter(
                        values.startDate ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "endDate"
                    )
                ) {

                    setEndDateFilter(
                        values.endDate ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "currency"
                    )
                ) {

                    setCurrencyFilter(
                        normalizeCurrencyCode(
                            values.currency
                        ) ||
                        DEFAULT_CURRENCY
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "serviceType"
                    )
                ) {

                    setServiceTypeFilter(
                        values.serviceType ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "origin"
                    )
                ) {

                    setOriginFilter(
                        values.origin ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "destination"
                    )
                ) {

                    setDestinationFilter(
                        values.destination ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "driver"
                    )
                ) {

                    setDriverFilter(
                        values.driver ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "bookingSource"
                    )
                ) {

                    setBookingSourceFilter(
                        values.bookingSource ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "payer"
                    )
                ) {

                    setPayerFilter(
                        values.payer ??
                        ""
                    );
                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        values,
                        "status"
                    )
                ) {

                    setStatusFilter(
                        values.status ??
                        ""
                    );
                }

            },
            []
        );


    /*
    ======================================================
    RESET FILTERS
    ======================================================
    */

    const resetFilters =
        useCallback(
            () => {

                setSearchTerm("");

                setStartDateFilter("");

                setEndDateFilter("");

                setCurrencyFilter(
                    DEFAULT_CURRENCY
                );

                setServiceTypeFilter("");

                setOriginFilter("");

                setDestinationFilter("");

                setDriverFilter("");

                setBookingSourceFilter("");

                setPayerFilter("");

                setStatusFilter("");


                setSortConfig(
                    DEFAULT_SORT
                );

            },
            []
        );


    /*
    ======================================================
    ADVANCED FILTER COUNT
    ======================================================
    */

    const advancedFilterCount = [
        statusFilter,
        serviceTypeFilter,
        originFilter,
        destinationFilter,
        driverFilter,
        bookingSourceFilter,
        payerFilter
    ].filter(Boolean).length;


    /*
    ======================================================
    ACTIVE FILTERS
    ======================================================
    */

    /*
     * Currency is not considered an active filter.
     *
     * It defines the report context.
     */
    const hasActiveFilters =
        Boolean(
            startDateFilter ||
            endDateFilter ||
            searchTerm ||
            statusFilter ||
            serviceTypeFilter ||
            originFilter ||
            destinationFilter ||
            driverFilter ||
            bookingSourceFilter ||
            payerFilter
        );


    /*
    ======================================================
    SORTING
    ======================================================
    */

    const handleSort =
        useCallback(
            (field) => {

                setSortConfig(
                    (previous) => {

                        if (
                            previous.field ===
                            field
                        ) {

                            return {

                                field,

                                direction:
                                    previous.direction ===
                                    "asc"
                                        ? "desc"
                                        : "asc"

                            };
                        }


                        return {

                            field,

                            direction:
                                "asc"

                        };

                    }
                );

            },
            []
        );


    /*
    ======================================================
    TABLE COLUMNS
    ======================================================
    */

    const tableColumns =
        useMemo(
            () => [

                {
                    key:
                        "reservationNumber",

                    label:
                        "Reserva",

                    sortable:
                        true
                },


                {
                    key:
                        "serviceDate",

                    label:
                        "Fecha",

                    sortable:
                        true
                },


                {
                    key:
                        "clientDisplayName",

                    label:
                        "Cliente",

                    sortable:
                        true
                },


                {
                    key:
                        "serviceDisplayName",

                    label:
                        "Servicio",

                    sortable:
                        true
                },


                {
                    key:
                        "subtotal",

                    label:
                        "Base",

                    sortable:
                        true,

                    align:
                        "right"
                },


                {
                    key:
                        "discountAmount",

                    label:
                        "Descuento",

                    sortable:
                        true,

                    align:
                        "right"
                },


                {
                    key:
                        "taxAmount",

                    label:
                        "Impuesto",

                    sortable:
                        true,

                    align:
                        "right"
                },


                {
                    key:
                        "commissionAmount",

                    label:
                        "Comisión",

                    sortable:
                        true,

                    align:
                        "right"
                },


                {
                    key:
                        "total",

                    label:
                        "Total",

                    sortable:
                        true,

                    align:
                        "right"
                }

            ],
            []
        );


    /*
    ======================================================
    TABLE DATA
    ======================================================
    */

    const tableRows =
        useMemo(
            () =>

                filteredReservations.map(
                    (reservation) => ({

                        ...reservation,

                        serviceDateFormatted:
                            formatFinancialDate(
                                reservation.serviceDate
                            )

                    })
                ),

            [
                filteredReservations
            ]
        );


    /*
    ======================================================
    SUMMARY CURRENCY
    ======================================================
    */

    const summaryCurrency =
        normalizeCurrencyCode(
            currencyFilter
        ) ||
        DEFAULT_CURRENCY;


    /*
    ======================================================
    SUMMARY CARDS
    ======================================================
    */

    const summaryCards =
        useMemo(
            () => [

                {
                    key:
                        "grossSales",

                    label:
                        "Ventas brutas",

                    value:
                        formatFinancialCurrency(
                            summary.grossSales,
                            summaryCurrency
                        ),

                    type:
                        "currency"
                },


                {
                    key:
                        "discounts",

                    label:
                        "Descuentos",

                    value:
                        formatFinancialCurrency(
                            summary.discounts,
                            summaryCurrency
                        ),

                    type:
                        "currency"
                },


                {
                    key:
                        "taxes",

                    label:
                        "Impuestos",

                    value:
                        formatFinancialCurrency(
                            summary.taxes,
                            summaryCurrency
                        ),

                    type:
                        "currency"
                },


                {
                    key:
                        "commissions",

                    label:
                        "Comisiones",

                    value:
                        formatFinancialCurrency(
                            summary.commissions,
                            summaryCurrency
                        ),

                    type:
                        "currency"
                },


                {
                    key:
                        "total",

                    label:
                        "Total",

                    value:
                        formatFinancialCurrency(
                            summary.total,
                            summaryCurrency
                        ),

                    type:
                        "currency"
                }

            ],
            [
                summary,
                summaryCurrency
            ]
        );


    /*
    ======================================================
    SECONDARY SUMMARY
    ======================================================
    */

    const reservationCountLabel =
        useMemo(
            () =>
                formatFinancialNumber(
                    summary.reservationCount
                ),
            [
                summary.reservationCount
            ]
        );


    const passengerCountLabel =
        useMemo(
            () =>
                formatFinancialNumber(
                    summary.passengerCount
                ),
            [
                summary.passengerCount
            ]
        );


    /*
    ======================================================
    CHART DATA
    ======================================================
    */

    const chartData =
        useMemo(
            () =>

                dailyData.map(
                    (item) => ({

                        ...item,

                        label:
                            formatFinancialDate(
                                item.date
                            ),

                        grossSales:
                            Number(
                                item.grossSales ||
                                0
                            ),

                        discounts:
                            Number(
                                item.discounts ||
                                0
                            ),

                        taxes:
                            Number(
                                item.taxes ||
                                0
                            ),

                        commissions:
                            Number(
                                item.commissions ||
                                0
                            ),

                        total:
                            Number(
                                item.total ||
                                0
                            ),

                        reservationCount:
                            Number(
                                item.reservationCount ||
                                0
                            ),

                        currency:
                            summaryCurrency

                    })
                ),

            [
                dailyData,
                summaryCurrency
            ]
        );


    /*
    ======================================================
    EXPORT EXCEL
    ======================================================
    */

    const handleExportExcel =
        useCallback(
            async () => {

                try {

                    setError("");


                    const exportData = {

                        reservations:
                            filteredReservations,

                        summary,

                        filters,

                        currency:
                            summaryCurrency

                    };


                    if (
                        typeof onExportExcel ===
                        "function"
                    ) {

                        await onExportExcel(
                            exportData
                        );

                        return;
                    }


                    await exportTransportationFinancialToExcel(
                        exportData
                    );


                } catch (err) {

                    console.error(
                        "Error exportando reporte financiero a Excel:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo exportar el reporte a Excel."
                    );

                }

            },
            [
                filteredReservations,
                summary,
                filters,
                summaryCurrency,
                onExportExcel
            ]
        );


    /*
    ======================================================
    EXPORT PDF
    ======================================================
    */

    const handleExportPDF =
        useCallback(
            async () => {

                try {

                    setError("");


                    const exportData = {

                        reservations:
                            filteredReservations,

                        summary,

                        filters,

                        currency:
                            summaryCurrency

                    };


                    if (
                        typeof onExportPDF ===
                        "function"
                    ) {

                        await onExportPDF(
                            exportData
                        );

                        return;
                    }


                    await exportTransportationFinancialToPDF(
                        {
                            ...exportData,

                            company
                        }
                    );


                } catch (err) {

                    console.error(
                        "Error exportando reporte financiero a PDF:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo exportar el reporte a PDF."
                    );

                }

            },
            [
                company,
                filteredReservations,
                summary,
                filters,
                summaryCurrency,
                onExportPDF
            ]
        );


    /*
    ======================================================
    REFRESH
    ======================================================
    */

    const refresh =
        useCallback(
            async () => {

                await loadReservations();

            },
            [
                loadReservations
            ]
        );


    /*
    ======================================================
    SEARCH HELPER
    ======================================================
    */

    const getReservationSearchText =
        useCallback(
            (reservation) =>

                getFinancialReservationSearchText(
                    reservation
                ),

            []
        );


    /*
    ======================================================
    RETURN
    ======================================================
    */

    return {

        /*
        ----------------------------------------------
        COMPANY
        ----------------------------------------------
        */

        company,


        /*
        ----------------------------------------------
        DATA
        ----------------------------------------------
        */

        reservations,

        filteredReservations,

        tableRows,

        chartData,


        /*
        ----------------------------------------------
        SUMMARY
        ----------------------------------------------
        */

        summary,

        summaryCards,

        reservationCountLabel,

        passengerCountLabel,


        /*
        ----------------------------------------------
        FILTERS
        ----------------------------------------------
        */

        filters,

        filterOptions,

        serviceTypeOptions,

        originOptions,

        destinationOptions,

        driverOptions,

        bookingSourceOptions,

        payerOptions,

        currencyOptions,

        selectedCurrency:
            currencyFilter,

        statusOptions,


        /*
        ----------------------------------------------
        FILTER UI
        ----------------------------------------------
        */

        filtersOpen,

        setFiltersOpen,

        advancedFilterCount,

        hasActiveFilters,

        updateFilter,

        updateFilters,

        resetFilters,


        /*
        ----------------------------------------------
        TABLE
        ----------------------------------------------
        */

        tableColumns,

        sortConfig,

        handleSort,


        /*
        ----------------------------------------------
        STATE
        ----------------------------------------------
        */

        loading,

        filtering,

        error,


        /*
        ----------------------------------------------
        ACTIONS
        ----------------------------------------------
        */

        refresh,

        loadReservations,

        handleExportExcel,

        handleExportPDF,


        /*
        ----------------------------------------------
        HELPERS
        ----------------------------------------------
        */

        getReservationSearchText

    };

};


export default useTransportationFinancial;