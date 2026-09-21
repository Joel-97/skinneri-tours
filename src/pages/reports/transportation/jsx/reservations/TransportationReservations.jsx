import React from "react";

import Loading from "../../../../../components/general/loading";

import TransportationReservationsHeader
    from "./components/TransportationReservationsHeader";

import TransportationReservationsSummary
    from "./components/TransportationReservationsSummary";

import TransportationReservationsFilters
    from "./components/TransportationReservationsFilters";

import TransportationReservationsTable
    from "./components/TransportationReservationsTable";

import useTransportationReservations
    from "./hooks/useTransportationReservations";

import "../../css/transportationReservations.css";


const TransportationReservations = () => {

    const {
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

    } = useTransportationReservations();


    if (loading) {

        return (

            <div className="transportation-reservations__loading">

                <Loading />

            </div>

        );

    }


    return (

        <div className="transportation-reservations">

            <TransportationReservationsHeader
                onClearFilters={
                    actions.clearFilters
                }
                onExportExcel={
                    actions.exportToExcel
                }
                onExportPDF={
                    actions.exportToPDF
                }
                hasReservations={
                    filteredReservations.length > 0
                }
            />


            <TransportationReservationsSummary
                reservationCount={
                    filteredReservations.length
                }
                totalPassengers={
                    totalPassengers
                }
                hasFilters={
                    hasFilters
                }
            />


            <TransportationReservationsFilters

                filters={
                    filters
                }

                filterOptions={
                    filterOptions
                }

                selectOptions={
                    selectOptions
                }

                selectStyles={
                    selectStyles
                }

                showMoreFilters={
                    showMoreFilters
                }

                advancedFilterCount={
                    advancedFilterCount
                }

                onToggleMoreFilters={
                    actions.toggleMoreFilters
                }

                renderFilterSelect={
                    actions.renderFilterSelect
                }

            />


            <TransportationReservationsTable
                data={
                    filteredReservations
                }

                columns={
                    tableColumns
                }

                renderRow={
                    renderRow
                }

                hasFilters={
                    hasFilters
                }
            />

        </div>

    );

};


export default TransportationReservations;