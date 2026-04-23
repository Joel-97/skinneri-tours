import React, { useEffect, useState, useMemo } from "react";
import {
  getCommissions,
  markCommissionAsPaid
} from "../../services/settings/general/commissionService";

import { FaFileExcel, FaFilePdf, FaBroom } from "react-icons/fa";
import { notifyError, notifyConfirm } from "../../services/notificationService";
import Loading from "../../components/general/loading";
import "../../style/reports/transportationReport.css";
import Pagination from "../../components/general/pagination";
import { formatDateCustom } from "../../services/Tools";
import { UserAuth } from "../../context/AuthContext";

// 📥 EXPORTS
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CommissionReport = ({ companyId }) => {

  const { user } = UserAuth();

  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 filtros
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc"
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCommissions(companyId);
        setCommissions(data || []);
      } catch (error) {
        notifyError("Error cargando comisiones");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [companyId]);

  /* ================= RESET PAGINACIÓN ================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDateFilter, endDateFilter, agentFilter, statusFilter]);

  /* ================= PREPROCESS ================= */

  const processed = useMemo(() => {
    return commissions.map(c => {

      const dateObj = c.bookingDate?.seconds
        ? new Date(c.bookingDate.seconds * 1000)
        : new Date(c.bookingDate || null);

      return {
        ...c,
        dateObj,
        dateStr: dateObj
          ? dateObj.toISOString().split("T")[0]
          : ""
      };
    });
  }, [commissions]);

  /* ================= SORT ================= */

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "desc"
          ? "asc"
          : "desc"
    }));
  };

  /* ================= OPTIONS ================= */

  const agentOptions = useMemo(() => {
    return [...new Set(processed.map(c => c.beneficiaryName).filter(Boolean))];
  }, [processed]);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return processed
      .filter(c => {

        const matchesDate =
          (!startDateFilter || c.dateStr >= startDateFilter) &&
          (!endDateFilter || c.dateStr <= endDateFilter);

        const matchesSearch =
          !searchTerm ||
          c.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAgent =
          !agentFilter || c.beneficiaryName === agentFilter;

        const matchesStatus =
          !statusFilter || c.status === statusFilter;

        return matchesDate && matchesSearch && matchesAgent && matchesStatus;
      })
      .sort((a, b) => {

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "date") {
          aValue = a.dateObj;
          bValue = b.dateObj;
        }

        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });

  }, [processed, startDateFilter, endDateFilter, searchTerm, agentFilter, statusFilter, sortConfig]);

  /* ================= PAGINACIÓN ================= */

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage]);

  /* ================= KPIs ================= */

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.total += Number(c.amount || 0);
        if (c.status === "pending") acc.pending += Number(c.amount || 0);
        if (c.status === "paid") acc.paid += Number(c.amount || 0);
        return acc;
      },
      { total: 0, pending: 0, paid: 0 }
    );
  }, [filtered]);

  /* ================= HELPERS ================= */

  const formatCurrency = (value) =>
    `$${Number(value || 0).toFixed(2)}`;

  const clearFilters = () => {
    setSearchTerm("");
    setStartDateFilter("");
    setEndDateFilter("");
    setAgentFilter("");
    setStatusFilter("");
  };

  /* ================= EXPORT ================= */

  const exportToExcel = () => {
    const data = filtered.map((c, i) => ({
      "#": i + 1,
      Fecha: formatDateCustom(c.dateStr),
      Comisionista: c.beneficiaryName,
      Tipo: c.type === "percentage" ? "Porcentaje" : "Monto fijo",
      Base: c.baseAmount,
      Comisión: c.amount,
      Estado: c.status === "paid" ? "Pagado" : "Pendiente"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Comisiones");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(new Blob([buffer]), "commission_report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableData = filtered.map((c, i) => [
      i + 1,
      formatDateCustom(c.dateStr),
      c.beneficiaryName,
      c.type,
      formatCurrency(c.baseAmount),
      formatCurrency(c.amount),
      c.status
    ]);

    autoTable(doc, {
      head: [["#", "Fecha", "Comisionista", "Tipo", "Base", "Comisión", "Estado"]],
      body: tableData
    });

    doc.save("commission_report.pdf");
  };

  /* ================= ACTION ================= */

  const handleMarkPaid = async (c) => {

    const confirmed = await notifyConfirm("¿Marcar esta comisión como pagada?");
    if (!confirmed) return;

    try {
      await markCommissionAsPaid(companyId, c.id, user);

      // 🔥 actualización optimista
      setCommissions(prev =>
        prev.map(x =>
          x.id === c.id
            ? { ...x, status: "paid", paidAt: new Date() }
            : x
        )
      );

    } catch (error) {
      notifyError("No se pudo actualizar el estado");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="report-container">

      {/* HEADER */}
      <div className="report-header">
        <div>
          <h2>Reporte de Comisiones</h2>
          <p>Control de pagos a comisionistas</p>
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

      {/* KPIs */}
      <div className="report-kpis">

        <div className="kpi-box">
          <h4>Total</h4>
          <p>{formatCurrency(totals.total)}</p>
        </div>

        <div className="kpi-box">
          <h4>Pendiente</h4>
          <p>{formatCurrency(totals.pending)}</p>
        </div>

        <div className="kpi-box">
          <h4>Pagado</h4>
          <p>{formatCurrency(totals.paid)}</p>
        </div>

      </div>

      {/* FILTROS */}
      <div className="report-filters">

        <input
          type="text"
          placeholder="Buscar comisionista..."
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

        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
          <option value="">Todos</option>
          {agentOptions.map((a, i) => (
            <option key={i} value={a}>{a}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="paid">Pagado</option>
        </select>

      </div>

      {/* TABLA */}
      <div className="report-table-wrapper">

        <table className="report-table">

          <thead>
            <tr>
              <th>#</th>

              <th onClick={() => handleSort("date")}>
                Fecha {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th onClick={() => handleSort("beneficiaryName")}>
                Comisionista {sortConfig.key === "beneficiaryName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th onClick={() => handleSort("type")}>
                Tipo {sortConfig.key === "type" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th onClick={() => handleSort("baseAmount")}>
                Base {sortConfig.key === "baseAmount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th onClick={() => handleSort("amount")}>
                Comisión {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th onClick={() => handleSort("status")}>
                Estado {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>

              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No hay resultados
                </td>
              </tr>
            ) : (
              paginated.map((c, i) => (
                <tr key={c.id}>
                  <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                  <td>{formatDateCustom(c.dateStr)}</td>
                  <td>{c.beneficiaryName}</td>
                  <td>{c.type === "percentage" ? "Porcentaje" : "Monto fijo"}</td>
                  <td>{formatCurrency(c.baseAmount)}</td>
                  <td>{formatCurrency(c.amount)}</td>

                  <td>
                    <span className={
                      c.status === "paid"
                        ? "badge-active"
                        : "badge-inactive"
                    }>
                      {c.status === "paid" ? "Pagado" : "Pendiente"}
                    </span>
                  </td>

                  <td>
                    {c.status === "pending" && (
                      <button
                        className="btn-link"
                        onClick={() => handleMarkPaid(c)}
                      >
                        Marcar pagado
                      </button>
                    )}
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

    </div>
  );
};

export default CommissionReport;