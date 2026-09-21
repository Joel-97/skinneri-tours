import {
    useEffect,
    useMemo,
    useState
} from "react";

import Select from "react-select";

import {
    useAuth
} from "../../../../../../context/AuthContext";

import {
    notifyError
} from "../../../../../../services/notificationService";

import {
    formatDateCustom
} from "../../../../../../services/Tools";

import {
    getTransportationReservations,
    filterTransportationReservations,
    getTransportationReservationFilterOptions
} from "../../../../../../services/reports/transportation/transportationReservationsService";

import {
    getStatusLabel,
    normalizeSelectOptions,
    getSelectedOption,
    getStatusClass,
    formatCurrency
} from "../utils/transportationReservationsUtils";

import {
    exportTransportationToExcel,
    exportTransportationToPDF
} from "../utils/transportationReservationsExports";


const useTransportationReservations = () => {

    const {
        session
    } = useAuth();


    const company =
        session?.company;

    const companyId =
        company?.id;


    const [
        reservations,
        setReservations
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        showMoreFilters,
        setShowMoreFilters
    ] = useState(false);


    const [
        startDateFilter,
        setStartDateFilter
    ] = useState("");


    const [
        endDateFilter,
        setEndDateFilter
    ] = useState("");


    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("");


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
        paymentTypeFilter,
        setPaymentTypeFilter
    ] = useState("");


    /*
    ========================================================
    LOAD
    ========================================================
    */

    useEffect(() => {

        const loadReservations = async () => {

            if (!companyId) {

                setReservations([]);
                setLoading(false);

                return;

            }


            try {

                setLoading(true);

                const data =
                    await getTransportationReservations(
                        companyId
                    );

                setReservations(
                    data || []
                );

            } catch (error) {

                console.error(
                    "Error cargando reservaciones de transporte:",
                    error
                );

                notifyError(
                    "Error cargando reservaciones"
                );

            } finally {

                setLoading(false);

            }

        };


        loadReservations();

    }, [companyId]);


    /*
    ========================================================
    FILTER OPTIONS
    ========================================================
    */

    const filterOptions = useMemo(
        () =>
            getTransportationReservationFilterOptions(
                reservations
            ),
        [reservations]
    );


    const selectOptions = useMemo(
        () => ({

            statuses:
                normalizeSelectOptions(
                    filterOptions.statuses,
                    true
                ),

            serviceTypes:
                normalizeSelectOptions(
                    filterOptions.serviceTypes
                ),

            origins:
                normalizeSelectOptions(
                    filterOptions.origins
                ),

            destinations:
                normalizeSelectOptions(
                    filterOptions.destinations
                ),

            drivers:
                normalizeSelectOptions(
                    filterOptions.drivers
                ),

            bookingSources:
                normalizeSelectOptions(
                    filterOptions.bookingSources
                ),

            paymentTypes:
                normalizeSelectOptions(
                    filterOptions.paymentTypes
                )

        }),
        [filterOptions]
    );


    /*
    ========================================================
    FILTERED RESERVATIONS
    ========================================================
    */

    const filteredReservations = useMemo(
        () =>
            filterTransportationReservations(
                reservations,
                {
                    startDate:
                        startDateFilter,

                    endDate:
                        endDateFilter,

                    searchTerm,

                    status:
                        statusFilter,

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

                    paymentType:
                        paymentTypeFilter
                }
            ),
        [
            reservations,
            startDateFilter,
            endDateFilter,
            searchTerm,
            statusFilter,
            serviceTypeFilter,
            originFilter,
            destinationFilter,
            driverFilter,
            bookingSourceFilter,
            paymentTypeFilter
        ]
    );


    /*
    ========================================================
    SUMMARY
    ========================================================
    */

    const totalPassengers = useMemo(
        () =>
            filteredReservations.reduce(
                (total, reservation) =>
                    total +
                    Number(
                        reservation.passengers || 0
                    ),
                0
            ),
        [filteredReservations]
    );


    /*
    ========================================================
    FILTER STATE
    ========================================================
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

        status:
            statusFilter,

        setStatus:
            setStatusFilter,

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

        paymentType:
            paymentTypeFilter,

        setPaymentType:
            setPaymentTypeFilter

    };


    const advancedFilterCount = [
        statusFilter,
        serviceTypeFilter,
        originFilter,
        destinationFilter,
        driverFilter,
        bookingSourceFilter,
        paymentTypeFilter
    ].filter(Boolean).length;


    const hasFilters = Boolean(
        startDateFilter ||
        endDateFilter ||
        searchTerm ||
        statusFilter ||
        serviceTypeFilter ||
        originFilter ||
        destinationFilter ||
        driverFilter ||
        bookingSourceFilter ||
        paymentTypeFilter
    );


    /*
    ========================================================
    SELECT STYLES
    ========================================================
    */

    const selectStyles = useMemo(
        () => ({

            control: (
                base,
                state
            ) => ({

                ...base,

                minHeight:
                    "36px",

                height:
                    "36px",

                borderRadius:
                    "6px",

                borderColor:
                    state.isFocused
                        ? "#829cb0"
                        : "#ccd4dd",

                boxShadow:
                    state.isFocused
                        ? "0 0 0 2px rgba(130, 156, 176, 0.14)"
                        : "none",

                backgroundColor:
                    "#ffffff",

                cursor:
                    "pointer",

                fontSize:
                    "12px",

                "&:hover": {

                    borderColor:
                        state.isFocused
                            ? "#829cb0"
                            : "#b8c2cd"

                }

            }),

            valueContainer:
                base => ({

                    ...base,

                    height:
                        "34px",

                    padding:
                        "0 10px"

                }),

            singleValue:
                base => ({

                    ...base,

                    color:
                        "#263548",

                    fontSize:
                        "12px"

                }),

            placeholder:
                base => ({

                    ...base,

                    color:
                        "#8d99a6",

                    fontSize:
                        "12px"

                }),

            input:
                base => ({

                    ...base,

                    margin: 0,

                    padding: 0,

                    color:
                        "#263548",

                    fontSize:
                        "12px"

                }),

            indicatorsContainer:
                base => ({

                    ...base,

                    height:
                        "34px"

                }),

            indicatorSeparator:
                () => ({

                    display:
                        "none"

                }),

            dropdownIndicator:
                base => ({

                    ...base,

                    padding:
                        "0 8px",

                    color:
                        "#263548"

                }),

            clearIndicator:
                base => ({

                    ...base,

                    padding:
                        "0 4px",

                    color:
                        "#829cb0"

                }),

            menu:
                base => ({

                    ...base,

                    zIndex:
                        20,

                    border:
                        "1px solid #dce2e8",

                    borderRadius:
                        "6px",

                    boxShadow:
                        "0 4px 12px rgba(8, 32, 75, 0.12)",

                    overflow:
                        "hidden"

                }),

            menuList:
                base => ({

                    ...base,

                    padding:
                        "4px 0",

                    maxHeight:
                        "240px"

                }),

            option: (
                base,
                state
            ) => ({

                ...base,

                padding:
                    "8px 10px",

                backgroundColor:
                    state.isSelected
                        ? "#08204b"
                        : state.isFocused
                            ? "#f1f4f7"
                            : "#ffffff",

                color:
                    state.isSelected
                        ? "#ffffff"
                        : "#263548",

                fontSize:
                    "12px",

                cursor:
                    "pointer"

            })

        }),
        []
    );


    /*
    ========================================================
    FILTER SELECT
    ========================================================
    */

    const renderFilterSelect = ({
        options,
        value,
        onChange,
        placeholder = "Todos"
    }) => {

        return (

            <Select

                options={
                    options
                }

                value={
                    getSelectedOption(
                        options,
                        value
                    )
                }

                onChange={
                    selectedOption =>
                        onChange(
                            selectedOption?.value || ""
                        )
                }

                placeholder={
                    placeholder
                }

                isClearable

                isSearchable

                styles={
                    selectStyles
                }

                classNamePrefix={
                    "transportation-select"
                }

                noOptionsMessage={() =>
                    "No hay opciones"
                }

            />

        );

    };


    /*
    ========================================================
    CLEAR FILTERS
    ========================================================
    */

    const clearFilters = () => {

        setStartDateFilter("");
        setEndDateFilter("");
        setSearchTerm("");

        setStatusFilter("");
        setServiceTypeFilter("");
        setOriginFilter("");
        setDestinationFilter("");
        setDriverFilter("");
        setBookingSourceFilter("");
        setPaymentTypeFilter("");

    };


    /*
    ========================================================
    TABLE
    ========================================================
    */

    const tableColumns = useMemo(
        () => [

            {
                key:
                    "reservationNumber",

                label:
                    "Reserva",

                sortable:
                    true,

                width:
                    "130px",

                minWidth:
                    "120px"
            },

            {
                key:
                    "serviceDate",

                label:
                    "Fecha",

                sortable:
                    true,

                width:
                    "130px",

                minWidth:
                    "120px"
            },

            {
                key:
                    "clientDisplayName",

                label:
                    "Cliente",

                sortable:
                    true,

                width:
                    "190px",

                minWidth:
                    "160px"
            },

            {
                key:
                    "serviceDisplayName",

                label:
                    "Servicio",

                sortable:
                    true,

                width:
                    "180px",

                minWidth:
                    "150px"
            },

            {
                key:
                    "originDisplayName",

                label:
                    "Ruta",

                sortable:
                    true,

                width:
                    "230px",

                minWidth:
                    "200px"
            },

            {
                key:
                    "passengers",

                label:
                    "Pax",

                sortable:
                    true,

                width:
                    "70px",

                minWidth:
                    "60px",

                align:
                    "center"
            },

            {
                key:
                    "driverDisplayName",

                label:
                    "Chofer",

                sortable:
                    true,

                width:
                    "160px",

                minWidth:
                    "140px"
            },

            {
                key:
                    "vehicleName",

                label:
                    "Vehículo",

                sortable:
                    true,

                width:
                    "160px",

                minWidth:
                    "140px"
            },

            {
                key:
                    "status",

                label:
                    "Estado",

                sortable:
                    true,

                width:
                    "120px",

                minWidth:
                    "110px",

                align:
                    "center"
            },

            {
                key:
                    "total",

                label:
                    "Total",

                sortable:
                    true,

                width:
                    "110px",

                minWidth:
                    "100px",

                align:
                    "right"
            }

        ],
        []
    );


    /*
    ========================================================
    ROW
    ========================================================
    */

    const renderRow = reservation => {

        return (

            <>

                <td>

                    <div className="transportation-reservations__reservation">

                        <strong>
                            {
                                reservation.reservationNumber ||
                                "-"
                            }
                        </strong>

                        {
                            reservation.flightNumber && (

                                <span>
                                    {
                                        reservation.flightNumber
                                    }
                                </span>

                            )
                        }

                    </div>

                </td>


                <td>

                    <span className="transportation-reservations__date">

                        {
                            reservation.serviceDateString
                                ? formatDateCustom(
                                    reservation.serviceDateString
                                )
                                : "-"
                        }

                    </span>

                </td>


                <td>

                    <div className="transportation-reservations__client">

                        <strong>
                            {
                                reservation.clientDisplayName ||
                                "-"
                            }
                        </strong>

                        {
                            reservation.clientEmail && (

                                <span>
                                    {
                                        reservation.clientEmail
                                    }
                                </span>

                            )
                        }

                        {
                            reservation.phone && (

                                <span>
                                    {
                                        reservation.phone
                                    }
                                </span>

                            )
                        }

                    </div>

                </td>


                <td>

                    <span>
                        {
                            reservation.serviceDisplayName ||
                            "-"
                        }
                    </span>

                </td>


                <td>

                    <div className="transportation-reservations__route">

                        <span>
                            {
                                reservation.originDisplayName ||
                                "-"
                            }
                        </span>

                        <span className="transportation-reservations__route-arrow">
                            →
                        </span>

                        <span>
                            {
                                reservation.destinationDisplayName ||
                                "-"
                            }
                        </span>

                    </div>

                </td>


                <td className="table-center">

                    {
                        Number(
                            reservation.passengers || 0
                        )
                    }

                </td>


                <td>

                    <span>
                        {
                            reservation.driverDisplayName ||
                            "-"
                        }
                    </span>

                </td>


                <td>

                    <div className="transportation-reservations__vehicle">

                        <span>
                            {
                                reservation.vehicleName ||
                                "-"
                            }
                        </span>

                        {
                            reservation.vehiclePlate && (

                                <small>
                                    {
                                        reservation.vehiclePlate
                                    }
                                </small>

                            )
                        }

                    </div>

                </td>


                <td className="table-center">

                    <span
                        className={
                            getStatusClass(
                                reservation.status
                            )
                        }
                    >

                        {
                            getStatusLabel(
                                reservation.status
                            ) ||
                            reservation.statusDisplayName ||
                            "-"
                        }

                    </span>

                </td>


                <td className="table-right">

                    <span className="transportation-reservations__total">

                        {
                            formatCurrency(
                                reservation.total,
                                reservation.currency
                            )
                        }

                    </span>

                </td>

            </>

        );

    };


    /*
    ========================================================
    ACTIONS
    ========================================================
    */

    const actions = {

        clearFilters,

        toggleMoreFilters:
            () =>
                setShowMoreFilters(
                    previous =>
                        !previous
                ),

        renderFilterSelect,

        exportToExcel:
            () =>
                exportTransportationToExcel({
                    filteredReservations,
                    getStatusLabel
                }),

        exportToPDF:
            () =>
                exportTransportationToPDF({
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
                })

    };


    return {

        company,
        loading,

        filteredReservations,
        totalPassengers,

        filters,

        filterOptions,
        selectOptions,

        showMoreFilters,
        advancedFilterCount,
        hasFilters,

        actions,

        selectStyles,

        tableColumns,
        renderRow

    };

};


export default useTransportationReservations;