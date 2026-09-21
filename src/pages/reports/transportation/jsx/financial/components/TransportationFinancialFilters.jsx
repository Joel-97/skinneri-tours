import Select from "react-select";

import {
    FaSearch,
    FaFilter,
    FaChevronDown
} from "react-icons/fa";


const TransportationFinancialFilters = ({
    filtersOpen,

    filters = {},

    updateFilter,
    resetFilters,

    hasActiveFilters,

    serviceTypeOptions = [],
    originOptions = [],
    destinationOptions = [],
    driverOptions = [],
    bookingSourceOptions = [],
    payerOptions = [],
    statusOptions = []
}) => {

    if (!filtersOpen) {
        return null;
    }


    /* =========================================================
       SELECT HELPERS
    ========================================================= */

    const getSelectedOption = (
        options,
        value
    ) => {

        if (!value) {
            return null;
        }

        return (
            options.find(
                (option) =>
                    String(option.value) ===
                    String(value)
            ) || null
        );
    };


    const handleSelectChange = (
        field,
        selectedOption
    ) => {

        updateFilter(
            field,
            selectedOption?.value || ""
        );
    };


    /* =========================================================
       REACT SELECT STYLES
    ========================================================= */

    const selectStyles = {

        control: (
            provided,
            state
        ) => ({
            ...provided,

            minHeight: "38px",
            height: "38px",

            borderRadius: "7px",

            borderColor:
                state.isFocused
                    ? "#5B2D8B"
                    : "#D6E0E6",

            boxShadow:
                state.isFocused
                    ? "0 0 0 3px rgba(91, 45, 139, 0.08)"
                    : "none",

            backgroundColor:
                "#FFFFFF",

            cursor:
                "pointer",

            "&:hover": {
                borderColor:
                    state.isFocused
                        ? "#5B2D8B"
                        : "#B9C8D2"
            },

            fontSize:
                "13px"
        }),


        valueContainer: (
            provided
        ) => ({
            ...provided,

            padding:
                "0 10px"
        }),


        input: (
            provided
        ) => ({
            ...provided,

            margin:
                "0",

            padding:
                "0",

            fontSize:
                "13px"
        }),


        indicatorsContainer: (
            provided
        ) => ({
            ...provided,

            height:
                "36px"
        }),


        indicatorSeparator: () => ({
            display:
                "none"
        }),


        dropdownIndicator: (
            provided
        ) => ({
            ...provided,

            color:
                "#829CB0",

            padding:
                "7px 9px",

            "&:hover": {
                color:
                    "#5B2D8B"
            }
        }),


        clearIndicator: (
            provided
        ) => ({
            ...provided,

            color:
                "#829CB0",

            padding:
                "7px 4px",

            "&:hover": {
                color:
                    "#C83C3C"
            }
        }),


        menu: (
            provided
        ) => ({
            ...provided,

            zIndex:
                100,

            marginTop:
                "4px",

            border:
                "1px solid #DCE5EA",

            borderRadius:
                "8px",

            boxShadow:
                "0 8px 22px rgba(8, 32, 75, 0.12)",

            overflow:
                "hidden",

            fontSize:
                "13px"
        }),


        menuList: (
            provided
        ) => ({
            ...provided,

            padding:
                "5px",

            maxHeight:
                "240px"
        }),


        option: (
            provided,
            state
        ) => ({
            ...provided,

            padding:
                "9px 10px",

            borderRadius:
                "5px",

            backgroundColor:
                state.isSelected
                    ? "#08204B"
                    : state.isFocused
                        ? "#F3F5F8"
                        : "#FFFFFF",

            color:
                state.isSelected
                    ? "#FFFFFF"
                    : "#344B5B",

            cursor:
                "pointer",

            "&:active": {
                backgroundColor:
                    "#08204B"
            }
        }),


        placeholder: (
            provided
        ) => ({
            ...provided,

            color:
                "#9AAAB5"
        }),


        singleValue: (
            provided
        ) => ({
            ...provided,

            color:
                "#243746"
        })
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <section
            className="transportation-financial-filters"
        >

            {/* =====================================================
                FILTER HEADER
            ====================================================== */}

            <div
                className="transportation-financial-filters-header"
            >

                <div
                    className="transportation-financial-filters-title"
                >

                    <FaFilter />

                    <span>
                        Filtros
                    </span>

                </div>


                <div
                    className="transportation-financial-filters-actions"
                >

                    {hasActiveFilters && (

                        <button
                            type="button"
                            className="transportation-financial-clear-filters"
                            onClick={resetFilters}
                        >
                            Limpiar filtros
                        </button>

                    )}


                    <FaChevronDown
                        className="transportation-financial-filters-chevron"
                        aria-hidden="true"
                    />

                </div>

            </div>


            {/* =====================================================
                FILTER BODY
            ====================================================== */}

            <div
                className="transportation-financial-filters-body"
            >

                {/* =================================================
                    MAIN FILTERS
                ================================================== */}

                <div
                    className="
                        transportation-financial-filter-grid
                        transportation-financial-filter-grid-main
                    "
                >

                    {/* =================================================
                        SEARCH
                    ================================================== */}

                    <div
                        className="
                            transportation-financial-filter-group
                            transportation-financial-filter-search
                        "
                    >

                        <label
                            htmlFor="financial-search"
                        >
                            Buscar
                        </label>


                        <div
                            className="
                                transportation-financial-search-wrapper
                            "
                        >

                            <FaSearch
                                className="
                                    transportation-financial-search-icon
                                "
                                aria-hidden="true"
                            />


                            <input
                                id="financial-search"
                                type="text"
                                value={
                                    filters.searchTerm ||
                                    ""
                                }
                                onChange={(event) =>
                                    updateFilter(
                                        "searchTerm",
                                        event.target.value
                                    )
                                }
                                placeholder="Reserva, cliente, servicio..."
                                className="
                                    transportation-financial-filter-input
                                "
                            />

                        </div>

                    </div>


                    {/* =================================================
                        START DATE
                    ================================================== */}

                    <div
                        className="
                            transportation-financial-filter-group
                        "
                    >

                        <label
                            htmlFor="financial-start-date"
                        >
                            Desde
                        </label>


                        <input
                            id="financial-start-date"
                            type="date"
                            value={
                                filters.startDate ||
                                ""
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "startDate",
                                    event.target.value
                                )
                            }
                            className="
                                transportation-financial-filter-input
                            "
                        />

                    </div>


                    {/* =================================================
                        END DATE
                    ================================================== */}

                    <div
                        className="
                            transportation-financial-filter-group
                        "
                    >

                        <label
                            htmlFor="financial-end-date"
                        >
                            Hasta
                        </label>


                        <input
                            id="financial-end-date"
                            type="date"
                            value={
                                filters.endDate ||
                                ""
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "endDate",
                                    event.target.value
                                )
                            }
                            className="
                                transportation-financial-filter-input
                            "
                        />

                    </div>

                    {/* =================================================
    STATUS
================================================== */}

                    <div
                        className="
        transportation-financial-filter-group
        transportation-financial-filter-status-main
    "
                    >

                        <label
                            htmlFor="financial-status-main"
                        >
                            Estado
                        </label>


                        <Select
                            inputId="financial-status-main"

                            value={
                                getSelectedOption(
                                    statusOptions,
                                    filters.status
                                )
                            }

                            onChange={(option) =>
                                handleSelectChange(
                                    "status",
                                    option
                                )
                            }

                            options={
                                statusOptions
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


                {/* =====================================================
                    ADVANCED FILTERS
                ====================================================== */}

                <div
                    className="
                        transportation-financial-advanced-filters
                    "
                >

                    <div
                        className="
                            transportation-financial-advanced-title
                        "
                    >
                        Filtros avanzados
                    </div>


                    <div
                        className="
                            transportation-financial-filter-grid
                            transportation-financial-filter-grid-advanced
                        "
                    >

                        {/* =============================================
                            SERVICE
                        ============================================== */}

                        <div
                            className="
                                transportation-financial-filter-group
                            "
                        >

                            <label
                                htmlFor="financial-service-type"
                            >
                                Servicio
                            </label>


                            <Select
                                inputId="financial-service-type"

                                value={
                                    getSelectedOption(
                                        serviceTypeOptions,
                                        filters.serviceType
                                    )
                                }

                                onChange={(option) =>
                                    handleSelectChange(
                                        "serviceType",
                                        option
                                    )
                                }

                                options={
                                    serviceTypeOptions
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


                        {/* =============================================
                            ORIGIN
                        ============================================== */}

                        <div
                            className="
                                transportation-financial-filter-group
                            "
                        >

                            <label
                                htmlFor="financial-origin"
                            >
                                Origen
                            </label>


                            <Select
                                inputId="financial-origin"

                                value={
                                    getSelectedOption(
                                        originOptions,
                                        filters.origin
                                    )
                                }

                                onChange={(option) =>
                                    handleSelectChange(
                                        "origin",
                                        option
                                    )
                                }

                                options={
                                    originOptions
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


                        {/* =============================================
                            DESTINATION
                        ============================================== */}

                        <div
                            className="
                                transportation-financial-filter-group
                            "
                        >

                            <label
                                htmlFor="financial-destination"
                            >
                                Destino
                            </label>


                            <Select
                                inputId="financial-destination"

                                value={
                                    getSelectedOption(
                                        destinationOptions,
                                        filters.destination
                                    )
                                }

                                onChange={(option) =>
                                    handleSelectChange(
                                        "destination",
                                        option
                                    )
                                }

                                options={
                                    destinationOptions
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


                        {/* =============================================
                            DRIVER
                        ============================================== */}

                        <div
                            className="
                                transportation-financial-filter-group
                            "
                        >

                            <label
                                htmlFor="financial-driver"
                            >
                                Chofer
                            </label>


                            <Select
                                inputId="financial-driver"

                                value={
                                    getSelectedOption(
                                        driverOptions,
                                        filters.driver
                                    )
                                }

                                onChange={(option) =>
                                    handleSelectChange(
                                        "driver",
                                        option
                                    )
                                }

                                options={
                                    driverOptions
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


                        {/* =============================================
                            BOOKING SOURCE
                        ============================================== */}

                        <div
                            className="
                                transportation-financial-filter-group
                            "
                        >

                            <label
                                htmlFor="financial-booking-source"
                            >
                                Fuente
                            </label>


                            <Select
                                inputId="financial-booking-source"

                                value={
                                    getSelectedOption(
                                        bookingSourceOptions,
                                        filters.bookingSource
                                    )
                                }

                                onChange={(option) =>
                                    handleSelectChange(
                                        "bookingSource",
                                        option
                                    )
                                }

                                options={
                                    bookingSourceOptions
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


                        {/* =============================================
                            PAYER
                        ============================================== */}

                        <div
                            className="
                                transportation-financial-filter-group
                            "
                        >

                            <label
                                htmlFor="financial-payer"
                            >
                                Pagador
                            </label>


                            <Select
                                inputId="financial-payer"

                                value={
                                    getSelectedOption(
                                        payerOptions,
                                        filters.payer
                                    )
                                }

                                onChange={(option) =>
                                    handleSelectChange(
                                        "payer",
                                        option
                                    )
                                }

                                options={
                                    payerOptions
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

            </div>

        </section>
    );
};


export default TransportationFinancialFilters;