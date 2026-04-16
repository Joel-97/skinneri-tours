import React, { useEffect, useState, useMemo } from "react";
import { getTransportation } from "../../services/transportation/transportationService";
import { FaFileExcel, FaFilePdf, FaBroom } from "react-icons/fa";
import { notifyError } from "../../services/notificationService";
import Loading from "../../components/general/loading";
import "../../style/reports/transportationReport.css";
import Pagination from "../../components/general/pagination";

// 📥 EXPORTS
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TransportationReport = ({ companyId }) => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 filtros
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Agregamos estado de orden
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc"
  });
  
  // 📥 cargar datos
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await getTransportation(companyId);
        setBookings(data || []);
      } catch (error) {
        notifyError("Error cargando reservas");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [companyId]);

  // 🧠 preprocesar datos
  const processedBookings = useMemo(() => {
    return bookings.map(b => {
      const dateObj = b.date ? new Date(b.date.seconds * 1000) : null;

      return {
        ...b,
        dateObj, // 🔥 NECESARIO para ordenar
        dateStr: dateObj ? dateObj.toISOString().split("T")[0] : ""
      };
    });
  }, [bookings]);

  //Handler para cambiar orden
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "desc"
          ? "asc"
          : "desc"
    }));
  };

  // 🔹 opciones dinámicas
  const staffOptions = useMemo(() => {
    return [...new Set(processedBookings.map(b => b.staffName).filter(Boolean))];
  }, [processedBookings]);

  const paymentOptions = useMemo(() => {
    return [...new Set(processedBookings.map(b => b.paymentTypeName).filter(Boolean))];
  }, [processedBookings]);

  const filteredBookings = useMemo(() => {
  return processedBookings
    .filter((b) => {

      const matchesDate =
        (!startDateFilter || b.dateStr >= startDateFilter) &&
        (!endDateFilter || b.dateStr <= endDateFilter);

      const matchesSearch =
        !searchTerm ||
        b.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStaff =
        !staffFilter || b.staffName === staffFilter;

      const matchesPayment =
        !paymentFilter || b.paymentTypeName === paymentFilter;

      return matchesDate && matchesSearch && matchesStaff && matchesPayment;
    })
    .sort((a, b) => {

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // 🔥 manejo correcto de fechas
      if (sortConfig.key === "date") {
        aValue = a.dateObj;
        bValue = b.dateObj;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  }, [
  processedBookings,
  startDateFilter,
  endDateFilter,
  searchTerm,
  staffFilter,
  paymentFilter,
  sortConfig
  ]);

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredBookings.slice(start, start + rowsPerPage);
  }, [filteredBookings, currentPage]);

  // 📊 totales
  const totals = useMemo(() => {
    return filteredBookings.reduce(
      (acc, b) => {
        acc.subtotal += Number(b.subtotal || 0);
        acc.total += Number(b.total || 0);
        acc.tax += Number(b.taxAmount || 0);
        acc.discount += Number(b.discountAmount || 0);
        return acc;
      },
      { subtotal: 0, total: 0, tax: 0, discount: 0 }
    );
  }, [filteredBookings]);

  // 💰 formatter
  const formatCurrency = (value) =>
    `$${Number(value || 0).toFixed(2)}`;

  // 🔄 limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStartDateFilter("");
    setEndDateFilter("");
    setStaffFilter("");
    setPaymentFilter("");
  };

  // 📥 EXPORT EXCEL
  const exportToExcel = () => {
    const data = filteredBookings.map((b, i) => ({
      "#": i + 1,
      Cliente: b.clientName,
      Fecha: b.dateStr,
      Chofer: b.staffName,
      Pago: b.paymentTypeName,
      Subtotal: b.subtotal,
      Descuento: b.discountAmount,
      Impuestos: b.taxAmount,
      Total: b.total
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const file = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(file, "transportation_report.xlsx");
  };

  // 📄 EXPORT PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableData = filteredBookings.map((b, i) => [
      i + 1,
      b.clientName,
      b.dateStr,
      b.staffName,
      b.paymentTypeName,
      formatCurrency(b.subtotal),
      formatCurrency(b.discountAmount),
      formatCurrency(b.taxAmount),
      formatCurrency(b.total)
    ]);

    autoTable(doc, {
      head: [["#", "Cliente", "Fecha", "Chofer", "Pago", "Subtotal", "Desc.", "Imp.", "Total"]],
      body: tableData
    });

    doc.save("transportation_report.pdf");
  };

  if (loading) return <Loading />;

  return (
    <div className="report-container">

      {/* 🔹 HEADER */}
      <div className="report-header">
        <div>
          <h2>Reporte de Transportes</h2>
          <p>Resumen de ingresos, impuestos y descuentos</p>
        </div>

        <div className="report-actions">

          <button className="action-btn" onClick={clearFilters}>
            <FaBroom />
            <span>Limpiar</span>
          </button>

          <button className="action-btn excel" onClick={exportToExcel}>
            <FaFileExcel />
            <span>Excel</span>
          </button>

          <button className="action-btn pdf" onClick={exportToPDF}>
            <FaFilePdf />
            <span>PDF</span>
          </button>
        </div>

      </div>

      {/* 📊 KPIs */}
      <div className="report-kpis">
        <div className="kpi-box">
          <h4>Reservas</h4>
          <p>{filteredBookings.length}</p>
        </div>

        <div className="kpi-box">
          <h4>Descuentos</h4>
          <p>{formatCurrency(totals.discount)}</p>
        </div>

        <div className="kpi-box">
          <h4>Impuestos</h4>
          <p>{formatCurrency(totals.tax)}</p>
        </div>

        <div className="kpi-box">
          <h4>Total</h4>
          <p>{formatCurrency(totals.total)}</p>
        </div>
      </div>

      {/* 🔎 FILTROS */}
      <div className="report-filters">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
        />

        <input
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
        />

        <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
          <option value="">Todos</option>
          {staffOptions.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>

        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="">Todos</option>
          {paymentOptions.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* 📋 TABLA */}
      <div className="report-table-wrapper">
        <table className="report-table">

        <thead>
          <tr>
            <th>#</th>

            <th onClick={() => handleSort("clientName")}>
              Cliente{" "}
              {sortConfig.key === "clientName" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>

            <th onClick={() => handleSort("date")}>
              Fecha{" "}
              {sortConfig.key === "date" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>

            <th onClick={() => handleSort("staffName")}>
              Chofer{" "}
              {sortConfig.key === "staffName" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>

            <th onClick={() => handleSort("paymentTypeName")}>
              Pago{" "}
              {sortConfig.key === "paymentTypeName" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>

            <th onClick={() => handleSort("subtotal")}>
              Subtotal{" "}
              {sortConfig.key === "subtotal" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>

            <th onClick={() => handleSort("discountAmount")}>
              Descuento{" "}
              {sortConfig.key === "discountAmount" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>

            <th onClick={() => handleSort("taxAmount")}>
              Impuestos{" "}
              {sortConfig.key === "taxAmount" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>

            <th onClick={() => handleSort("total")}>
              Total{" "}
              {sortConfig.key === "total" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredBookings.length === 0 ? (
            <tr>
              <td colSpan="9" className="no-data">
                No hay resultados
              </td>
            </tr>
          ) : (
            paginatedBookings.map((b, i) => (
              <tr key={b.id || i}>
                <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                <td>{b.clientName}</td>
                <td>{b.dateStr}</td>
                <td>{b.staffName || "-"}</td>
                <td>{b.paymentTypeName || "-"}</td>
                <td>{formatCurrency(b.subtotal)}</td>
                <td className="amount-negative">
                  {formatCurrency(b.discountAmount)}
                </td>
                <td className="amount-positive">
                  {formatCurrency(b.taxAmount)}
                </td>
                <td className="total-cell">
                  {formatCurrency(b.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>

      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsChange={setRowsPerPage}
        />

      </div>

      {/* 📌 FOOTER */}
      {/* <div className="totals-footer">
        <div className="totals-group">

          <div className="totals-item">
            <span>Subtotal</span>
            <strong>{formatCurrency(totals.subtotal)}</strong>
          </div>

          <div className="totals-item">
            <span>Descuentos</span>
            <strong>{formatCurrency(totals.discount)}</strong>
          </div>

          <div className="totals-item">
            <span>Impuestos</span>
            <strong>{formatCurrency(totals.tax)}</strong>
          </div>

          <div className="totals-item">
            <span>Total</span>
            <strong>{formatCurrency(totals.total)}</strong>
          </div>

        </div>
      </div> */}

    </div>
  );
};

export default TransportationReport;