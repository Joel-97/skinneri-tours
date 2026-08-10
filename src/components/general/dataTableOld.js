import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";

const DataTable = ({
  data = [],
  columns = [],
  rowsPerPageOptions = [5, 10, 20, 50],
  defaultRowsPerPage = 10,
  renderRow,
  customSelectStyles,
}) => {

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

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

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue?.toDate) aValue = aValue.toDate();
        if (bValue?.toDate) bValue = bValue.toDate();

        if (typeof aValue === "boolean") {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        }

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, sortConfig]);

  // 📄 PAGINACIÓN
  const totalPages = Math.max(1, Math.ceil(processedData.length / rowsPerPage));

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data, rowsPerPage]);

  const rowsOptions = rowsPerPageOptions.map(v => ({
    value: v,
    label: v
  }));

  // 🎨 ESTILOS POR DEFECTO
  const defaultSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "36px",
      borderRadius: "6px",
      borderColor: state.isFocused ? "#08204B" : "#cbd5e1",
      boxShadow: "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#08204B"
      }
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 8px"
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    }),

    menu: (base) => ({
      ...base,
      borderRadius: "8px",
      overflow: "hidden"
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#eef2ff"
        : state.isSelected
        ? "#08204B"
        : "white",
      color: state.isSelected ? "white" : "#111",
      padding: "8px 10px"
    })
  };

  // 👉 usar custom si existe, si no usar default
  const selectStyles = customSelectStyles || defaultSelectStyles;

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
            {currentData.length > 0 ? (
              currentData.map((row, i) => (
                <tr key={row.id || i}>
                  <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                  {renderRow(row)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: "center" }}>
                  No hay datos
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      <div className="table-pagination">

        <div className="rows-selector">
          <span>Mostrar</span>

          <Select
            options={rowsOptions}
            value={rowsOptions.find(opt => opt.value === rowsPerPage)}
            onChange={(selected) => setRowsPerPage(selected.value)}
            isSearchable={false}
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />

          <span>registros</span>
        </div>

        <div className="page-controls">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ◀
          </button>

          <span>
            Página {currentPage} de {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            ▶
          </button>
        </div>

      </div>

    </div>
  );
};

export default DataTable;