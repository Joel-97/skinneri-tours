import useTransportationCommission
    from "./hooks/useTransportationCommission";


import TransportationCommissionHeader
    from "./components/TransportationCommissionHeader";


import TransportationCommissionCurrencySelector
    from "./components/TransportationCommissionCurrencySelector";


import TransportationCommissionSummary
    from "./components/TransportationCommissionSummary";


import TransportationCommissionFilters
    from "./components/TransportationCommissionFilters";


import TransportationCommissionChart
    from "./components/TransportationCommissionChart";


import TransportationCommissionTable
    from "./components/TransportationCommissionTable";


import "../../css/transportationCommission.css";


const TransportationCommission = () => {

    const {
        filteredReservations,

        summaryCards,

        chartData,

        filters,

        filterOptions,

        serviceTypeOptions,

        originOptions,

        destinationOptions,

        driverOptions,

        bookingSourceOptions,

        commissionTypeOptions,

        statusOptions,

        currencyOptions,

        selectedCurrency,

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

    } = useTransportationCommission();


    return (

        <div className="transportation-commission-report">


            {/* ==================================================
                HEADER
            ================================================== */}

            <TransportationCommissionHeader

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


            {/* ==================================================
                ERROR
            ================================================== */}

            {
                error && (

                    <div className="transportation-commission-error">

                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={
                                refresh
                            }
                        >
                            Reintentar
                        </button>

                    </div>

                )
            }


            {/* ==================================================
                CURRENCY
            ================================================== */}

            <TransportationCommissionCurrencySelector

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


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <TransportationCommissionSummary

                summaryCards={
                    summaryCards
                }

            />


            {/* ==================================================
                FILTERS
            ================================================== */}

            <TransportationCommissionFilters

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

                commissionTypeOptions={
                    commissionTypeOptions
                }

                statusOptions={
                    statusOptions
                }

                filterOptions={
                    filterOptions
                }

            />


            {/* ==================================================
                CHART
            ================================================== */}

            <TransportationCommissionChart

                data={
                    chartData
                }

                loading={
                    loading ||
                    filtering
                }

            />


            {/* ==================================================
                TABLE
            ================================================== */}

            <TransportationCommissionTable

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


export default TransportationCommission;