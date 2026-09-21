import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";


import {
    getTransportationCommissionReservations,
    getTransportationCommissionFilterOptions,
    filterTransportationCommissionReservations,
    calculateTransportationCommissionSummary,
    getTransportationCommissionDailyData
} from "../../../../../../services/reports/transportation/transportationCommissionService";


import {
    useAuth
} from "../../../../../../context/AuthContext";


import {
    formatCommissionCurrency,
    formatCommissionNumber,
    formatCommissionDate
} from "../utils/transportationCommissionUtils";


/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CURRENCY = "USD";


const EMPTY_FILTER_OPTIONS = {
    currencies: [],
    serviceTypes: [],
    origins: [],
    destinations: [],
    drivers: [],
    bookingSources: [],
    commissionTypes: [],
    statuses: []
};


const EMPTY_SUMMARY = {
    reservationCount: 0,
    passengerCount: 0,
    grossSales: 0,
    discounts: 0,
    total: 0,
    commissions: 0,
    commissionRate: 0
};


/* =========================================================
   TABLE COLUMNS

   DataTable agrega automáticamente la columna #.

   Por eso este arreglo comienza con:

   Reserva
   Fecha
   Cliente
   ...
========================================================= */

const TABLE_COLUMNS = [
    {
        key: "reservationDisplayNumber",
        label: "Reserva",
        sortable: true
    },

    {
        key: "serviceDate",
        label: "Fecha",
        sortable: true
    },

    {
        key: "clientDisplayName",
        label: "Cliente",
        sortable: true
    },

    {
        key: "serviceDisplayName",
        label: "Servicio",
        sortable: true
    },

    {
        key: "driverDisplayName",
        label: "Conductor",
        sortable: true
    },

    {
        key: "locationFromDisplayName",
        label: "Origen",
        sortable: true
    },

    {
        key: "locationToDisplayName",
        label: "Destino",
        sortable: true
    },

    {
        key: "subtotal",
        label: "Subtotal",
        sortable: true
    },

    {
        key: "commissionTypeLabel",
        label: "Tipo de comisión",
        sortable: true
    },

    {
        key: "commissionValue",
        label: "Valor comisión",
        sortable: true
    },

    {
        key: "commissionAmount",
        label: "Comisión",
        sortable: true
    },

    {
        key: "statusDisplayName",
        label: "Estado",
        sortable: true
    }
];


/* =========================================================
   HOOK
========================================================= */

const useTransportationCommission = ({
    onExportExcel,
    onExportPDF
} = {}) => {

    /* =====================================================
       AUTH / COMPANY
    ===================================================== */

    const {
        session
    } = useAuth();


    const company =
        session?.company;


    const companyId =
        company?.id;


    /* =====================================================
       DATA STATE
    ===================================================== */

    const [
        reservations,
        setReservations
    ] = useState([]);


    const [
        filteredReservations,
        setFilteredReservations
    ] = useState([]);


    /* =====================================================
       FILTER STATE
    ===================================================== */

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
        commissionTypeFilter,
        setCommissionTypeFilter
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("");


    /* =====================================================
       UI STATE
    ===================================================== */

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


    /* =====================================================
       REPORT STATE
    ===================================================== */

    const [
        filterOptions,
        setFilterOptions
    ] = useState(
        EMPTY_FILTER_OPTIONS
    );


    const [
        summary,
        setSummary
    ] = useState(
        EMPTY_SUMMARY
    );


    const [
        dailyData,
        setDailyData
    ] = useState([]);


    /* =====================================================
       LOAD RESERVATIONS

       IMPORTANT:

       Este efecto solamente carga datos desde Firestore.

       Los filtros NO provocan una nueva consulta a Firestore.
       Se procesan localmente.
    ===================================================== */

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


                    const data =
                        await getTransportationCommissionReservations(
                            companyId
                        );


                    const safeReservations =
                        Array.isArray(data)
                            ? data
                            : [];


                    const options =
                        getTransportationCommissionFilterOptions(
                            safeReservations
                        );


                    setReservations(
                        safeReservations
                    );


                    setFilterOptions(
                        options
                    );


                    /*
                     * La moneda inicial siempre es USD.
                     */

                    setCurrencyFilter(
                        DEFAULT_CURRENCY
                    );


                } catch (err) {

                    console.error(
                        "Error loading transportation commission report:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo cargar el reporte de comisiones."
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


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(
        () => {

            loadReservations();

        },
        [
            loadReservations
        ]
    );


    /* =====================================================
       UPDATE FILTER
    ===================================================== */

    const updateFilter =
        useCallback(
            (
                filterName,
                value
            ) => {

                switch (filterName) {

                    case "searchTerm":

                        setSearchTerm(
                            value || ""
                        );

                        break;


                    case "startDate":

                        setStartDateFilter(
                            value || ""
                        );

                        break;


                    case "endDate":

                        setEndDateFilter(
                            value || ""
                        );

                        break;


                    case "currency":

                        setCurrencyFilter(
                            value ||
                            DEFAULT_CURRENCY
                        );

                        break;


                    case "serviceType":

                        setServiceTypeFilter(
                            value || ""
                        );

                        break;


                    case "origin":

                        setOriginFilter(
                            value || ""
                        );

                        break;


                    case "destination":

                        setDestinationFilter(
                            value || ""
                        );

                        break;


                    case "driver":

                        setDriverFilter(
                            value || ""
                        );

                        break;


                    case "bookingSource":

                        setBookingSourceFilter(
                            value || ""
                        );

                        break;


                    case "commissionType":

                        setCommissionTypeFilter(
                            value || ""
                        );

                        break;


                    case "status":

                        setStatusFilter(
                            value || ""
                        );

                        break;


                    default:

                        break;

                }

            },
            []
        );


    /* =====================================================
       RESET FILTERS

       Currency returns to USD.
    ===================================================== */

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

                setCommissionTypeFilter("");

                setStatusFilter("");

                setError("");

            },
            []
        );


    /* =====================================================
       ACTIVE FILTERS

       Currency is intentionally excluded.

       USD is the default report currency and changing
       currency is treated as the main report selector,
       not as an advanced filter.
    ===================================================== */

    const hasActiveFilters =
        Boolean(
            searchTerm ||
            startDateFilter ||
            endDateFilter ||
            serviceTypeFilter ||
            originFilter ||
            destinationFilter ||
            driverFilter ||
            bookingSourceFilter ||
            commissionTypeFilter ||
            statusFilter
        );


    /* =====================================================
       FILTER OBJECT

       Contains only values consumed by the UI and export
       functions. Setters are not necessary here.
    ===================================================== */

    const filters =
        useMemo(
            () => ({
                searchTerm,

                startDate:
                    startDateFilter,

                endDate:
                    endDateFilter,

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

                commissionType:
                    commissionTypeFilter,

                status:
                    statusFilter
            }),
            [
                searchTerm,
                startDateFilter,
                endDateFilter,
                currencyFilter,
                serviceTypeFilter,
                originFilter,
                destinationFilter,
                driverFilter,
                bookingSourceFilter,
                commissionTypeFilter,
                statusFilter
            ]
        );


    /* =====================================================
       FILTERING

       Everything is calculated locally from the already
       loaded reservations.
    ===================================================== */

    useEffect(
        () => {

            if (loading) {
                return;
            }


            setFiltering(true);


            try {

                const currentFilters = {
                    searchTerm,

                    startDate:
                        startDateFilter,

                    endDate:
                        endDateFilter,

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

                    commissionType:
                        commissionTypeFilter,

                    status:
                        statusFilter
                };


                const filtered =
                    filterTransportationCommissionReservations(
                        reservations,
                        currentFilters
                    );


                const calculatedSummary =
                    calculateTransportationCommissionSummary(
                        filtered,
                        currencyFilter
                    );


                const calculatedDailyData =
                    getTransportationCommissionDailyData(
                        filtered,
                        currencyFilter
                    );


                setFilteredReservations(
                    filtered
                );


                setSummary(
                    calculatedSummary
                );


                setDailyData(
                    calculatedDailyData
                );


            } catch (err) {

                console.error(
                    "Error filtering transportation commission report:",
                    err
                );


                setError(
                    err?.message ||
                    "No se pudo procesar el reporte de comisiones."
                );


            } finally {

                setFiltering(false);

            }

        },
        [
            reservations,
            loading,
            searchTerm,
            startDateFilter,
            endDateFilter,
            currencyFilter,
            serviceTypeFilter,
            originFilter,
            destinationFilter,
            driverFilter,
            bookingSourceFilter,
            commissionTypeFilter,
            statusFilter
        ]
    );


    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    const currencyOptions =
        useMemo(
            () => {

                const options =
                    Array.isArray(
                        filterOptions.currencies
                    )
                        ? [
                            ...filterOptions.currencies
                        ]
                        : [];


                const hasUSD =
                    options.some(
                        (option) =>
                            String(
                                option?.value ??
                                option?.id ??
                                ""
                            )
                                .trim()
                                .toUpperCase() ===
                            DEFAULT_CURRENCY
                    );


                if (!hasUSD) {

                    options.unshift({
                        value:
                            DEFAULT_CURRENCY,

                        label:
                            "USD — US Dollar"
                    });

                } else {

                    return options.map(
                        (option) => {

                            const value =
                                String(
                                    option?.value ??
                                    option?.id ??
                                    ""
                                )
                                    .trim()
                                    .toUpperCase();


                            if (
                                value ===
                                DEFAULT_CURRENCY
                            ) {

                                return {
                                    ...option,
                                    value:
                                        DEFAULT_CURRENCY,
                                    label:
                                        "USD"
                                };

                            }


                            return option;

                        }
                    );

                }


                return options;

            },
            [
                filterOptions.currencies
            ]
        );


    const serviceTypeOptions =
        filterOptions.serviceTypes || [];


    const originOptions =
        filterOptions.origins || [];


    const destinationOptions =
        filterOptions.destinations || [];


    const driverOptions =
        filterOptions.drivers || [];


    const bookingSourceOptions =
        filterOptions.bookingSources || [];


    const commissionTypeOptions =
        filterOptions.commissionTypes || [];


    const statusOptions =
        filterOptions.statuses || [];


    /* =====================================================
       SUMMARY CURRENCY
    ===================================================== */

    const summaryCurrency =
        currencyFilter ||
        DEFAULT_CURRENCY;


    /* =====================================================
       SUMMARY CARDS
    ===================================================== */

    const summaryCards =
        useMemo(
            () => [

                {
                    key:
                        "reservationCount",

                    label:
                        "Reservaciones",

                    value:
                        formatCommissionNumber(
                            summary.reservationCount
                        ),

                    type:
                        "number"
                },


                {
                    key:
                        "passengerCount",

                    label:
                        "Pasajeros",

                    value:
                        formatCommissionNumber(
                            summary.passengerCount
                        ),

                    type:
                        "number"
                },


                {
                    key:
                        "grossSales",

                    label:
                        "Ventas brutas",

                    value:
                        formatCommissionCurrency(
                            summary.grossSales,
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
                        formatCommissionCurrency(
                            summary.commissions,
                            summaryCurrency
                        ),

                    type:
                        "currency"
                },


                {
                    key:
                        "commissionRate",

                    label:
                        "Tasa efectiva",

                    value:
                        `${formatCommissionNumber(
                            summary.commissionRate
                        )}%`,

                    type:
                        "percentage"
                },


                {
                    key:
                        "total",

                    label:
                        "Total",

                    value:
                        formatCommissionCurrency(
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


    /* =====================================================
       SECONDARY SUMMARY
    ===================================================== */

    const reservationCountLabel =
        formatCommissionNumber(
            summary.reservationCount
        );


    const passengerCountLabel =
        formatCommissionNumber(
            summary.passengerCount
        );


    /* =====================================================
       CHART DATA
    ===================================================== */

    const chartData =
        useMemo(
            () =>
                dailyData.map(
                    (item) => ({

                        ...item,

                        label:
                            formatCommissionDate(
                                item.date
                            ),

                        grossSales:
                            Number(
                                item.grossSales || 0
                            ),

                        commissions:
                            Number(
                                item.commissions || 0
                            ),

                        reservationCount:
                            Number(
                                item.reservationCount || 0
                            ),

                        commissionRate:
                            Number(
                                item.commissionRate || 0
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


    /* =====================================================
       EXPORT EXCEL
    ===================================================== */

    const handleExportExcel =
        useCallback(
            async () => {

                try {

                    setError("");


                    if (
                        typeof onExportExcel !==
                        "function"
                    ) {

                        console.warn(
                            "No se proporcionó onExportExcel para el reporte de comisiones."
                        );

                        return;
                    }


                    await onExportExcel({

                        reservations:
                            filteredReservations,

                        summary,

                        filters,

                        currency:
                            summaryCurrency

                    });


                } catch (err) {

                    console.error(
                        "Error exporting transportation commission report to Excel:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo exportar el reporte de comisiones a Excel."
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


    /* =====================================================
       EXPORT PDF
    ===================================================== */

    const handleExportPDF =
        useCallback(
            async () => {

                try {

                    setError("");


                    if (
                        typeof onExportPDF !==
                        "function"
                    ) {

                        console.warn(
                            "No se proporcionó onExportPDF para el reporte de comisiones."
                        );

                        return;
                    }


                    await onExportPDF({

                        reservations:
                            filteredReservations,

                        summary,

                        filters,

                        currency:
                            summaryCurrency

                    });


                } catch (err) {

                    console.error(
                        "Error exporting transportation commission report to PDF:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo exportar el reporte de comisiones a PDF."
                    );

                }

            },
            [
                filteredReservations,
                summary,
                filters,
                summaryCurrency,
                onExportPDF
            ]
        );


    /* =====================================================
       REFRESH
    ===================================================== */

    const refresh =
        useCallback(
            async () => {

                await loadReservations();

            },
            [
                loadReservations
            ]
        );


    /* =====================================================
       RETURN
    ===================================================== */

    return {

        /* -------------------------------------------------
           COMPANY
        ------------------------------------------------- */

        company,

        companyId,


        /* -------------------------------------------------
           DATA
        ------------------------------------------------- */

        reservations,

        filteredReservations,

        chartData,


        /* -------------------------------------------------
           SUMMARY
        ------------------------------------------------- */

        summary,

        summaryCards,

        reservationCountLabel,

        passengerCountLabel,


        /* -------------------------------------------------
           FILTERS
        ------------------------------------------------- */

        filters,

        filterOptions,

        currencyOptions,

        selectedCurrency:
            currencyFilter,

        serviceTypeOptions,

        originOptions,

        destinationOptions,

        driverOptions,

        bookingSourceOptions,

        commissionTypeOptions,

        statusOptions,

        filtersOpen,

        setFiltersOpen,

        updateFilter,

        resetFilters,

        hasActiveFilters,


        /* -------------------------------------------------
           TABLE
        ------------------------------------------------- */

        tableColumns:
            TABLE_COLUMNS,


        /* -------------------------------------------------
           STATE
        ------------------------------------------------- */

        loading,

        filtering,

        error,


        /* -------------------------------------------------
           ACTIONS
        ------------------------------------------------- */

        refresh,

        loadReservations,

        handleExportExcel,

        handleExportPDF

    };

};


export default useTransportationCommission;