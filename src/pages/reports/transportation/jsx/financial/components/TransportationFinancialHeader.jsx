import {
    FaFileExcel,
    FaFilePdf,
    FaFilter
} from "react-icons/fa";


const TransportationFinancialHeader = ({
    filtersOpen,
    setFiltersOpen,
    hasActiveFilters,
    onExportExcel,
    onExportPDF
}) => {

    return (
        <header className="transportation-financial-header">

            {/* =====================================================
                HEADER LEFT
            ====================================================== */}

            <div className="transportation-financial-header-left">

                <h1 className="transportation-financial-header-title">
                    Reporte Financiero
                </h1>

                <p className="transportation-financial-header-description">
                    Analiza los ingresos, descuentos,
                    impuestos, comisiones y totales de
                    las reservaciones de transporte.
                </p>

            </div>


            {/* =====================================================
                HEADER ACTIONS
            ====================================================== */}

            <div className="transportation-financial-header-actions">

                {/* =================================================
                    EXCEL
                ================================================== */}

                <button
                    type="button"
                    className="
                        transportation-financial-export-button
                        transportation-financial-export-excel
                    "
                    onClick={onExportExcel}
                    title="Exportar a Excel"
                >

                    <FaFileExcel
                        aria-hidden="true"
                    />

                    <span>
                        Excel
                    </span>

                </button>


                {/* =================================================
                    PDF
                ================================================== */}

                <button
                    type="button"
                    className="
                        transportation-financial-export-button
                        transportation-financial-export-pdf
                    "
                    onClick={onExportPDF}
                    title="Exportar a PDF"
                >

                    <FaFilePdf
                        aria-hidden="true"
                    />

                    <span>
                        PDF
                    </span>

                </button>


                {/* =================================================
                    FILTERS
                ================================================== */}

                <button
                    type="button"
                    className={`
                        transportation-financial-filter-button
                        ${filtersOpen ? "active" : ""}
                    `}
                    onClick={() =>
                        setFiltersOpen(
                            (previous) =>
                                !previous
                        )
                    }
                    title={
                        filtersOpen
                            ? "Ocultar filtros"
                            : "Mostrar filtros"
                    }
                >

                    <FaFilter
                        aria-hidden="true"
                    />

                    <span>
                        {filtersOpen
                            ? "Ocultar filtros"
                            : "Filtros"}
                    </span>


                    {hasActiveFilters && (

                        <span
                            className="
                                transportation-financial-filter-indicator
                            "
                            aria-label="Hay filtros activos"
                        />

                    )}

                </button>

            </div>

        </header>
    );
};


export default TransportationFinancialHeader;