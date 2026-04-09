import React from "react";
import "../../style/general/pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsChange
}) => {

  const safeTotalPages = totalPages || 1;
  const isDisabled = totalPages <= 1;

  return (
    <div className="table-pagination">

      {/* LEFT */}
      <div className="rows-selector">
        <span>Mostrar</span>

        <select
          value={rowsPerPage}
          onChange={(e) => onRowsChange(Number(e.target.value))}
          disabled={isDisabled}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>

        <span>registros</span>
      </div>

      {/* RIGHT */}
      <div className="page-controls">

        <button
          disabled={currentPage === 1 || isDisabled}
          onClick={() =>
            onPageChange(Math.max(currentPage - 1, 1))
          }
        >
          ⬅
        </button>

        <span>
          Página {currentPage} de {safeTotalPages}
        </span>

        <button
          disabled={currentPage === safeTotalPages || isDisabled}
          onClick={() =>
            onPageChange(Math.min(currentPage + 1, safeTotalPages))
          }
        >
          ➡
        </button>

      </div>

    </div>
  );
};

export default Pagination;