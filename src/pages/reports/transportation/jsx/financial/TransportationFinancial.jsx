import useTransportationFinancial from "./hooks/useTransportationFinancial";

import TransportationFinancialHeader
    from "./components/TransportationFinancialHeader";

import TransportationFinancialCurrencySelector
    from "./components/TransportationFinancialCurrencySelector";

import TransportationFinancialSummary
    from "./components/TransportationFinancialSummary";

import TransportationFinancialFilters
    from "./components/TransportationFinancialFilters";

import TransportationFinancialChart
    from "./components/TransportationFinancialChart";

import TransportationFinancialTable
    from "./components/TransportationFinancialTable";

import "../../css/transportationFinancial.css";


const TransportationFinancial = () => {

    const {
        filteredReservations,

        summaryCards,
        reservationCountLabel,
        passengerCountLabel,

        chartData,

        filters,

        serviceTypeOptions,
        originOptions,
        destinationOptions,
        driverOptions,
        bookingSourceOptions,
        payerOptions,
        currencyOptions,
        selectedCurrency,
        statusOptions,

        filtersOpen,
        setFiltersOpen,

        updateFilter,
        resetFilters,

        hasActiveFilters,

        tableColumns,

        loading,
        filtering,
        error,

        handleExportExcel,
        handleExportPDF,

        refresh
    } = useTransportationFinancial();


    return (
        <div className="transportation-financial-report">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <TransportationFinancialHeader
                filtersOpen={
                    filtersOpen
                }

                setFiltersOpen={
                    setFiltersOpen
                }

                hasActiveFilters={
                    hasActiveFilters
                }

                onExportExcel={
                    handleExportExcel
                }

                onExportPDF={
                    handleExportPDF
                }
            />


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="transportation-financial-error">

                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        onClick={refresh}
                    >
                        Reintentar
                    </button>

                </div>
            )}


            {/* =====================================================
                CURRENCY SELECTOR
            ===================================================== */}

            <TransportationFinancialCurrencySelector
                currencyOptions={
                    currencyOptions
                }

                selectedCurrency={
                    selectedCurrency
                }

                onCurrencyChange={
                    (value) =>
                        updateFilter(
                            "currency",
                            value
                        )
                }
            />


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <TransportationFinancialSummary
                summaryCards={
                    summaryCards
                }

                reservationCountLabel={
                    reservationCountLabel
                }

                passengerCountLabel={
                    passengerCountLabel
                }
            />

            {/* =====================================================
                CHART
            ===================================================== */}

            <TransportationFinancialChart
                data={
                    chartData
                }

                loading={
                    loading ||
                    filtering
                }
            />

            {/* =====================================================
                FILTERS
            ===================================================== */}

            <TransportationFinancialFilters
                filtersOpen={
                    filtersOpen
                }

                filters={
                    filters
                }

                updateFilter={
                    updateFilter
                }

                resetFilters={
                    resetFilters
                }

                hasActiveFilters={
                    hasActiveFilters
                }

                serviceTypeOptions={
                    serviceTypeOptions
                }

                originOptions={
                    originOptions
                }

                destinationOptions={
                    destinationOptions
                }

                driverOptions={
                    driverOptions
                }

                bookingSourceOptions={
                    bookingSourceOptions
                }

                payerOptions={
                    payerOptions
                }

                statusOptions={
                    statusOptions
                }
            />


            {/* =====================================================
                TABLE
            ===================================================== */}

            <TransportationFinancialTable
                data={
                    filteredReservations
                }

                columns={
                    tableColumns
                }

                loading={
                    loading ||
                    filtering
                }

                hasFilters={
                    hasActiveFilters
                }
            />

        </div>
    );
};


export default TransportationFinancial;