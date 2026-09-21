import {
    CalendarDays,
    Filter,
    RotateCcw,
    Search,
    SlidersHorizontal,
    X
} from "lucide-react";

import Select from "react-select";


const TransportationCommissionFilters = ({
    filtersOpen = false,

    filters = {},

    updateFilter,
    resetFilters,

    hasActiveFilters = false,

    serviceTypeOptions = [],
    originOptions = [],
    destinationOptions = [],
    driverOptions = [],
    bookingSourceOptions = [],
    commissionTypeOptions = [],
    statusOptions = [],

    filterOptions = {}
}) => {

    /*
    ==========================================================
    HELPERS
    ==========================================================
    */

    const normalizeOptions = (
        options = []
    ) => {

        if (!Array.isArray(options)) {
            return [];
        }

        return options
            .filter(Boolean)
            .map(
                (option) => {

                    if (
                        typeof option ===
                        "string"
                    ) {
                        return {
                            value: option,
                            label: option
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


    const getSelectedOption = (
        options,
        value
    ) => {

        if (
            !value ||
            !Array.isArray(options)
        ) {
            return null;
        }

        return (
            options.find(
                (option) =>
                    String(
                        option.value
                    ) ===
                    String(value)
            ) ||
            null
        );
    };


    const handleSelectChange = (
        filterName,
        option
    ) => {

        updateFilter?.(
            filterName,
            option?.value || ""
        );
    };


    /*
    ==========================================================
    OPTIONS
    ==========================================================
    */

    const normalizedServiceTypeOptions =
        normalizeOptions(
            serviceTypeOptions
        );


    const normalizedOriginOptions =
        normalizeOptions(
            originOptions
        );


    const normalizedDestinationOptions =
        normalizeOptions(
            destinationOptions
        );


    const normalizedDriverOptions =
        normalizeOptions(
            driverOptions
        );


    const normalizedBookingSourceOptions =
        normalizeOptions(
            bookingSourceOptions
        );


    const normalizedCommissionTypeOptions =
        normalizeOptions(
            commissionTypeOptions
        );


    const normalizedStatusOptions =
        normalizeOptions(
            statusOptions
        );


    /*
    ==========================================================
    SELECT STYLES
    ==========================================================
    */

    const selectStyles = {

        control: (
            base,
            state
        ) => ({
            ...base,

            minHeight: "38px",

            height: "38px",

            borderRadius: "6px",

            borderColor:
                state.isFocused
                    ? "#829CB0"
                    : "#d8e0e6",

            boxShadow:
                state.isFocused
                    ? "0 0 0 1px #829CB0"
                    : "none",

            backgroundColor:
                "#ffffff",

            fontSize: "12px",

            cursor: "pointer",

            "&:hover": {
                borderColor:
                    "#829CB0"
            }
        }),


        valueContainer: (
            base
        ) => ({
            ...base,

            padding:
                "0 10px"
        }),


        placeholder: (
            base
        ) => ({
            ...base,

            color:
                "#82909D",

            fontSize:
                "12px"
        }),


        singleValue: (
            base
        ) => ({
            ...base,

            color:
                "#34465A",

            fontSize:
                "12px"
        }),


        input: (
            base
        ) => ({
            ...base,

            color:
                "#34465A",

            fontSize:
                "12px"
        }),


        menu: (
            base
        ) => ({
            ...base,

            zIndex: 20,

            border:
                "1px solid #dce2e8",

            borderRadius:
                "6px",

            boxShadow:
                "0 8px 24px rgba(8, 32, 75, 0.10)"
        }),


        option: (
            base,
            state
        ) => ({
            ...base,

            padding:
                "9px 10px",

            backgroundColor:
                state.isSelected
                    ? "#f1edf6"
                    : state.isFocused
                        ? "#f7f9fb"
                        : "#ffffff",

            color:
                state.isSelected
                    ? "#5B2D8B"
                    : "#34465A",

            fontSize:
                "12px",

            cursor:
                "pointer"
        }),


        indicatorSeparator: (
            base
        ) => ({
            ...base,

            backgroundColor:
                "#e2e8ed"
        }),


        dropdownIndicator: (
            base
        ) => ({
            ...base,

            color:
                "#82909D",

            padding:
                "6px"
        }),


        clearIndicator: (
            base
        ) => ({
            ...base,

            color:
                "#82909D",

            padding:
                "6px"
        })
    };


    /*
    ==========================================================
    SEARCH
    ==========================================================
    */

    const searchValue =
        filters.searchTerm ||
        "";


    /*
    ==========================================================
    RENDER
    ==========================================================
    */

    if (!filtersOpen) {
        return null;
    }


    return (

        <section className="transportation-commission-filters">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="transportation-commission-filters-header">

                <div className="transportation-commission-filters-title-wrapper">

                    <div className="transportation-commission-filters-title-icon">

                        <SlidersHorizontal
                            size={16}
                            strokeWidth={2}
                        />

                    </div>


                    <div>

                        <h2 className="transportation-commission-filters-title">
                            Filtros
                        </h2>

                        <p className="transportation-commission-filters-description">
                            Personaliza la información mostrada en el reporte.
                        </p>

                    </div>

                </div>


                {
                    hasActiveFilters && (

                        <button
                            type="button"
                            className="transportation-commission-clear-filters"
                            onClick={
                                resetFilters
                            }
                        >

                            <RotateCcw
                                size={14}
                                strokeWidth={2}
                            />

                            <span>
                                Limpiar filtros
                            </span>

                        </button>

                    )
                }

            </div>


            {/* ==================================================
                MAIN FILTERS
            ================================================== */}

            <div className="transportation-commission-filter-grid-main">

                {/* ------------------------------------------------
                    SEARCH
                ------------------------------------------------ */}

                <div className="transportation-commission-filter-group transportation-commission-filter-group--search">

                    <label>
                        Buscar
                    </label>


                    <div className="transportation-commission-search-wrapper">

                        <Search
                            size={15}
                            strokeWidth={2}
                        />


                        <input
                            type="text"
                            value={
                                searchValue
                            }
                            onChange={(
                                event
                            ) =>
                                updateFilter?.(
                                    "searchTerm",
                                    event.target.value
                                )
                            }
                            placeholder="Reserva, cliente, servicio, chofer..."
                        />


                        {
                            searchValue && (

                                <button
                                    type="button"
                                    className="transportation-commission-search-clear"
                                    onClick={() =>
                                        updateFilter?.(
                                            "searchTerm",
                                            ""
                                        )
                                    }
                                    aria-label="Limpiar búsqueda"
                                >

                                    <X
                                        size={14}
                                        strokeWidth={2}
                                    />

                                </button>

                            )
                        }

                    </div>

                </div>


                {/* ------------------------------------------------
                    START DATE
                ------------------------------------------------ */}

                <div className="transportation-commission-filter-group">

                    <label>
                        Fecha desde
                    </label>


                    <div className="transportation-commission-date-wrapper">

                        <CalendarDays
                            size={15}
                            strokeWidth={2}
                        />


                        <input
                            type="date"
                            value={
                                filters.startDate ||
                                ""
                            }
                            onChange={(
                                event
                            ) =>
                                updateFilter?.(
                                    "startDate",
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* ------------------------------------------------
                    END DATE
                ------------------------------------------------ */}

                <div className="transportation-commission-filter-group">

                    <label>
                        Fecha hasta
                    </label>


                    <div className="transportation-commission-date-wrapper">

                        <CalendarDays
                            size={15}
                            strokeWidth={2}
                        />


                        <input
                            type="date"
                            value={
                                filters.endDate ||
                                ""
                            }
                            onChange={(
                                event
                            ) =>
                                updateFilter?.(
                                    "endDate",
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                ADVANCED FILTERS
            ================================================== */}

            <div className="transportation-commission-advanced-section">

                <div className="transportation-commission-advanced-header">

                    <div className="transportation-commission-advanced-title">

                        <Filter
                            size={14}
                            strokeWidth={2}
                        />

                        <span>
                            Filtros avanzados
                        </span>

                    </div>

                </div>


                <div className="transportation-commission-filter-grid-advanced">

                    {/* ------------------------------------------------
                        SERVICE TYPE
                    ------------------------------------------------ */}

                    <div className="transportation-commission-filter-group">

                        <label>
                            Servicio
                        </label>

                        <Select
                            value={
                                getSelectedOption(
                                    normalizedServiceTypeOptions,
                                    filters.serviceType
                                )
                            }
                            onChange={(
                                option
                            ) =>
                                handleSelectChange(
                                    "serviceType",
                                    option
                                )
                            }
                            options={
                                normalizedServiceTypeOptions
                            }
                            placeholder="Todos"
                            isClearable
                            styles={
                                selectStyles
                            }
                            noOptionsMessage={() =>
                                "Sin opciones"
                            }
                        />

                    </div>


                    {/* ------------------------------------------------
                        ORIGIN
                    ------------------------------------------------ */}

                    <div className="transportation-commission-filter-group">

                        <label>
                            Origen
                        </label>

                        <Select
                            value={
                                getSelectedOption(
                                    normalizedOriginOptions,
                                    filters.origin
                                )
                            }
                            onChange={(
                                option
                            ) =>
                                handleSelectChange(
                                    "origin",
                                    option
                                )
                            }
                            options={
                                normalizedOriginOptions
                            }
                            placeholder="Todos"
                            isClearable
                            styles={
                                selectStyles
                            }
                            noOptionsMessage={() =>
                                "Sin opciones"
                            }
                        />

                    </div>


                    {/* ------------------------------------------------
                        DESTINATION
                    ------------------------------------------------ */}

                    <div className="transportation-commission-filter-group">

                        <label>
                            Destino
                        </label>

                        <Select
                            value={
                                getSelectedOption(
                                    normalizedDestinationOptions,
                                    filters.destination
                                )
                            }
                            onChange={(
                                option
                            ) =>
                                handleSelectChange(
                                    "destination",
                                    option
                                )
                            }
                            options={
                                normalizedDestinationOptions
                            }
                            placeholder="Todos"
                            isClearable
                            styles={
                                selectStyles
                            }
                            noOptionsMessage={() =>
                                "Sin opciones"
                            }
                        />

                    </div>


                    {/* ------------------------------------------------
                        DRIVER
                    ------------------------------------------------ */}

                    <div className="transportation-commission-filter-group">

                        <label>
                            Chofer
                        </label>

                        <Select
                            value={
                                getSelectedOption(
                                    normalizedDriverOptions,
                                    filters.driver
                                )
                            }
                            onChange={(
                                option
                            ) =>
                                handleSelectChange(
                                    "driver",
                                    option
                                )
                            }
                            options={
                                normalizedDriverOptions
                            }
                            placeholder="Todos"
                            isClearable
                            styles={
                                selectStyles
                            }
                            noOptionsMessage={() =>
                                "Sin opciones"
                            }
                        />

                    </div>


                    {/* ------------------------------------------------
                        BOOKING SOURCE
                    ------------------------------------------------ */}

                    <div className="transportation-commission-filter-group">

                        <label>
                            Fuente de reserva
                        </label>

                        <Select
                            value={
                                getSelectedOption(
                                    normalizedBookingSourceOptions,
                                    filters.bookingSource
                                )
                            }
                            onChange={(
                                option
                            ) =>
                                handleSelectChange(
                                    "bookingSource",
                                    option
                                )
                            }
                            options={
                                normalizedBookingSourceOptions
                            }
                            placeholder="Todas"
                            isClearable
                            styles={
                                selectStyles
                            }
                            noOptionsMessage={() =>
                                "Sin opciones"
                            }
                        />

                    </div>


                    {/* ------------------------------------------------
                        COMMISSION TYPE
                    ------------------------------------------------ */}

                    <div className="transportation-commission-filter-group">

                        <label>
                            Tipo de comisión
                        </label>

                        <Select
                            value={
                                getSelectedOption(
                                    normalizedCommissionTypeOptions,
                                    filters.commissionType
                                )
                            }
                            onChange={(
                                option
                            ) =>
                                handleSelectChange(
                                    "commissionType",
                                    option
                                )
                            }
                            options={
                                normalizedCommissionTypeOptions
                            }
                            placeholder="Todos"
                            isClearable
                            styles={
                                selectStyles
                            }
                            noOptionsMessage={() =>
                                "Sin opciones"
                            }
                        />

                    </div>


                    {/* ------------------------------------------------
                        STATUS
                    ------------------------------------------------ */}

                    <div className="transportation-commission-filter-group">

                        <label>
                            Estado
                        </label>

                        <Select
                            value={
                                getSelectedOption(
                                    normalizedStatusOptions,
                                    filters.status
                                )
                            }
                            onChange={(
                                option
                            ) =>
                                handleSelectChange(
                                    "status",
                                    option
                                )
                            }
                            options={
                                normalizedStatusOptions
                            }
                            placeholder="Todos"
                            isClearable
                            styles={
                                selectStyles
                            }
                            noOptionsMessage={() =>
                                "Sin opciones"
                            }
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="transportation-commission-filters-footer">

                <div className="transportation-commission-filters-footer-info">

                    {
                        hasActiveFilters
                            ? (
                                <>
                                    <span className="transportation-commission-filters-active-dot" />

                                    <span>
                                        Hay filtros activos
                                    </span>
                                </>
                            )
                            : (
                                <span>
                                    Mostrando todas las comisiones disponibles
                                </span>
                            )
                    }

                </div>


                {
                    hasActiveFilters && (

                        <button
                            type="button"
                            className="transportation-commission-filters-footer-clear"
                            onClick={
                                resetFilters
                            }
                        >

                            <X
                                size={14}
                                strokeWidth={2}
                            />

                            <span>
                                Restablecer
                            </span>

                        </button>

                    )
                }

            </div>

        </section>

    );
};


export default TransportationCommissionFilters;