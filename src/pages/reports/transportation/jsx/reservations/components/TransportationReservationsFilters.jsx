import React from "react";

import {
    FaChevronDown,
    FaChevronUp
} from "react-icons/fa";


const TransportationReservationsFilters = ({
    filters,
    selectOptions,
    selectStyles,

    showMoreFilters,
    advancedFilterCount,

    onToggleMoreFilters,
    renderFilterSelect
}) => {

    return (

        <section className="transportation-reservations__filters">

            <div className="transportation-reservations__filters-main">

                <div className="transportation-reservations__filter-group transportation-reservations__filter-group--search">

                    <label>
                        Buscar
                    </label>

                    <input
                        type="text"
                        placeholder="Reserva, cliente, email, teléfono, servicio..."
                        value={filters.searchTerm}
                        onChange={
                            event =>
                                filters.setSearchTerm(
                                    event.target.value
                                )
                        }
                    />

                </div>


                <div className="transportation-reservations__filter-group">

                    <label>
                        Desde
                    </label>

                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={
                            event =>
                                filters.setStartDate(
                                    event.target.value
                                )
                        }
                    />

                </div>


                <div className="transportation-reservations__filter-group">

                    <label>
                        Hasta
                    </label>

                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={
                            event =>
                                filters.setEndDate(
                                    event.target.value
                                )
                        }
                    />

                </div>


                <div className="transportation-reservations__filter-group">

                    <label>
                        Estado
                    </label>

                    {
                        renderFilterSelect({
                            options:
                                selectOptions.statuses,

                            value:
                                filters.status,

                            onChange:
                                filters.setStatus,

                            placeholder:
                                "Todos",

                            styles:
                                selectStyles
                        })
                    }

                </div>

            </div>


            <div className="transportation-reservations__more-filters-wrapper">

                <button
                    type="button"
                    className={
                        `transportation-reservations__more-filters ${
                            showMoreFilters
                                ? "transportation-reservations__more-filters--active"
                                : ""
                        }`
                    }
                    onClick={
                        onToggleMoreFilters
                    }
                >

                    <span>
                        {
                            showMoreFilters
                                ? "Ocultar filtros"
                                : "Mostrar más filtros"
                        }
                    </span>


                    {
                        advancedFilterCount > 0 &&
                        !showMoreFilters && (

                            <span className="transportation-reservations__filter-count">

                                {
                                    advancedFilterCount
                                }

                            </span>

                        )
                    }


                    {
                        showMoreFilters
                            ? <FaChevronUp />
                            : <FaChevronDown />
                    }

                </button>

            </div>


            {
                showMoreFilters && (

                    <div className="transportation-reservations__filters-advanced">

                        <div className="transportation-reservations__filter-group">

                            <label>
                                Servicio
                            </label>

                            {
                                renderFilterSelect({
                                    options:
                                        selectOptions.serviceTypes,

                                    value:
                                        filters.serviceType,

                                    onChange:
                                        filters.setServiceType,

                                    placeholder:
                                        "Todos",

                                    styles:
                                        selectStyles
                                })
                            }

                        </div>


                        <div className="transportation-reservations__filter-group">

                            <label>
                                Origen
                            </label>

                            {
                                renderFilterSelect({
                                    options:
                                        selectOptions.origins,

                                    value:
                                        filters.origin,

                                    onChange:
                                        filters.setOrigin,

                                    placeholder:
                                        "Todos",

                                    styles:
                                        selectStyles
                                })
                            }

                        </div>


                        <div className="transportation-reservations__filter-group">

                            <label>
                                Destino
                            </label>

                            {
                                renderFilterSelect({
                                    options:
                                        selectOptions.destinations,

                                    value:
                                        filters.destination,

                                    onChange:
                                        filters.setDestination,

                                    placeholder:
                                        "Todos",

                                    styles:
                                        selectStyles
                                })
                            }

                        </div>


                        <div className="transportation-reservations__filter-group">

                            <label>
                                Chofer
                            </label>

                            {
                                renderFilterSelect({
                                    options:
                                        selectOptions.drivers,

                                    value:
                                        filters.driver,

                                    onChange:
                                        filters.setDriver,

                                    placeholder:
                                        "Todos",

                                    styles:
                                        selectStyles
                                })
                            }

                        </div>


                        <div className="transportation-reservations__filter-group">

                            <label>
                                Fuente
                            </label>

                            {
                                renderFilterSelect({
                                    options:
                                        selectOptions.bookingSources,

                                    value:
                                        filters.bookingSource,

                                    onChange:
                                        filters.setBookingSource,

                                    placeholder:
                                        "Todas",

                                    styles:
                                        selectStyles
                                })
                            }

                        </div>


                        <div className="transportation-reservations__filter-group">

                            <label>
                                Pago
                            </label>

                            {
                                renderFilterSelect({
                                    options:
                                        selectOptions.paymentTypes,

                                    value:
                                        filters.paymentType,

                                    onChange:
                                        filters.setPaymentType,

                                    placeholder:
                                        "Todos",

                                    styles:
                                        selectStyles
                                })
                            }

                        </div>

                    </div>

                )
            }

        </section>

    );

};


export default TransportationReservationsFilters;