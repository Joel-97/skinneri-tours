import React, { useMemo, useState } from "react";

const DataTable = ({
  data = [],
  columns = [],
  rowsPerPage = 10,
  renderRow,
}) => {

  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc"
          ? "desc"
          : "asc"
    }));
  };

  // 🔄 PROCESAMIENTO
  const processedData = useMemo(() => {

    let result = [...data];

    // SORT
    if (sortConfig.key) {
      result.sort((a, b) => {

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // fechas Firestore
        if (aValue?.toDate) aValue = aValue.toDate();
        if (bValue?.toDate) bValue = bValue.toDate();

        // boolean
        if (typeof aValue === "boolean") {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        }

        // string
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;

  }, [data, sortConfig]);

  // 📄 PAGINACIÓN
  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  return (
    <div>

      <div className="table-wrapper">
        <table className="table">

          <thead>
            <tr>
              <th>#</th>

              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  {col.label}{" "}
                  {col.sortable && sortConfig.key === col.key &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>
            {currentData.map((row, i) => (
              <tr key={row.id || i}>
                <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                {renderRow(row)}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* PAGINACIÓN SIMPLE */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ←
        </button>

        <span>{currentPage} / {totalPages}</span>

        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>

    </div>
  );
};

export default DataTable;