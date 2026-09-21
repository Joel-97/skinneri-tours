import {
    FaFileExcel,
    FaFilePdf,
    FaFilter
} from "react-icons/fa";


const TransportationCommissionHeader = ({
    filtersOpen,
    setFiltersOpen,
    hasActiveFilters,
    onExportExcel,
    onExportPDF
}) => {

    return (
        <header className="transportation-commission-header">

            {/* =====================================================
                HEADER LEFT
            ====================================================== */}

            <div className="transportation-commission-header-left">

                <h1 className="transportation-commission-header-title">
                    Reporte de Comisiones
                </h1>

                <p className="transportation-commission-header-description">
                    Consulta y analiza las comisiones generadas por las reservaciones de transporte.
                </p>

            </div>


            {/* =====================================================
                HEADER ACTIONS
            ====================================================== */}

            <div className="transportation-commission-header-actions">

                {/* =================================================
                    EXCEL
                ================================================== */}

                <button
                    type="button"
                    className="
                        transportation-commission-export-button
                        transportation-commission-export-excel
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
                        transportation-commission-export-button
                        transportation-commission-export-pdf
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
                        transportation-commission-filter-button
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
                                transportation-commission-filter-indicator
                            "
                            aria-label="Hay filtros activos"
                        />

                    )}

                </button>

            </div>

        </header>
    );
};


export default TransportationCommissionHeader;