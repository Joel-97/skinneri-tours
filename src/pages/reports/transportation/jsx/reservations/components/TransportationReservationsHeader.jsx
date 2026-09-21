import React from "react";

import {
    FaFileExcel,
    FaFilePdf,
    FaBroom
} from "react-icons/fa";


const TransportationReservationsHeader = ({
    onClearFilters,
    onExportExcel,
    onExportPDF,
    hasReservations
}) => {

    return (

        <header className="transportation-reservations__header">

            <div>

                <h2>
                    Reservaciones de Transporte
                </h2>

                <p>
                    Consulta y analiza las reservaciones de transporte.
                </p>

            </div>


            <div className="transportation-reservations__actions">

                <button
                    type="button"
                    className="transportation-reservations__action transportation-reservations__action--excel"
                    onClick={onExportExcel}
                    disabled={!hasReservations}
                >

                    <FaFileExcel />

                    <span>
                        Excel
                    </span>

                </button>


                <button
                    type="button"
                    className="transportation-reservations__action transportation-reservations__action--pdf"
                    onClick={onExportPDF}
                    disabled={!hasReservations}
                >

                    <FaFilePdf />

                    <span>
                        PDF
                    </span>

                </button>

                <button
                    type="button"
                    className="transportation-reservations__action"
                    onClick={onClearFilters}
                >

                    <FaBroom />

                    <span>
                        Limpiar
                    </span>

                </button>

            </div>

        </header>

    );

};


export default TransportationReservationsHeader;