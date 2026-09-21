import React from "react";

import DataTable from "../../../../../../components/general/dataTable";


const TransportationReservationsTable = ({
    data,
    columns,
    renderRow,
    hasFilters
}) => {

    return (

        <DataTable

            data={
                data
            }

            columns={
                columns
            }

            renderRow={
                renderRow
            }

            loading={
                false
            }

            emptyTitle={
                hasFilters
                    ? "No hay reservaciones con estos filtros."
                    : "No hay reservaciones para mostrar."
            }

            emptyDescription={
                hasFilters
                    ? "Prueba modificando o limpiando los filtros."
                    : "Todavía no existen reservaciones de transporte."
            }

            rowsPerPageOptions={[
                5,
                10,
                20,
                50
            ]}

            defaultRowsPerPage={
                10
            }

        />

    );

};


export default TransportationReservationsTable;