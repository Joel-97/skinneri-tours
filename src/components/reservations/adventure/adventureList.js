import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import AdventureModal from "./adventureModal";
import {
  getAdventures,
  createAdventure,
  updateAdventure,
  deleteAdventure
} from "../../../services/adventure/adventureService";
import { notifySuccess, notifyError, notifyConfirm } from "../../../services/notificationService";
import Loading from "../../../components/general/loading"; 
import ViewToggle from "../../../components/general/viewToggle"; 
import DataTable from "../../../components/general/dataTable";
import "../../../style/adventure/adventureList.css";

const AdventureList = ({ companyId, user }) => {

  const [adventures, setAdventures] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "grid" | "table"
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(true);

  // 🔎 FILTROS
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadAdventures = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const data = await getAdventures(companyId);
      setAdventures(data);
    } catch (error) {
      console.error("Error cargando tours:", error);
      notifyError("Error", "No se pudieron cargar los tours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    loadAdventures();
  }, [companyId]);

  const handleCreate = () => {
    setSelectedReservation(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await notifyConfirm(
      "¿Eliminar reserva?",
      "Esta acción no se puede deshacer"
    );

    if (!confirmed) return;

    try {
      await deleteAdventure(companyId, id);
      notifySuccess("Reserva eliminada", "La reserva fue eliminada correctamente.");
      loadAdventures();
    } catch (error) {
      console.error("Error eliminando reserva:", error);
      notifyError("Error", "No se pudo eliminar la reserva.");
    }
  };

  const handleSave = async (formData) => {
    try {
      if (mode === "create") {
        await createAdventure(companyId, formData, user);
        notifySuccess("Reserva creada", "La reserva fue creada correctamente.");
      } else {
        await updateAdventure(companyId, selectedReservation.id, formData, user);
        notifySuccess("Reserva actualizada", "Los cambios fueron guardados.");
      }

      setModalOpen(false);
      loadAdventures();
    } catch (error) {
      console.error("Error guardando reserva:", error);
      notifyError("Error", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const getStatusClass = (status) => {
    if (status === "confirmed") return "status confirmed";
    if (status === "pending") return "status pending";
    if (status === "cancelled") return "status cancelled";
    return "status";
  };

  // 🔥 FILTRADO EN MEMORIA
  const filteredReservations = useMemo(() => {

    const term = searchTerm.toLowerCase().trim();

    return adventures.filter((r) => {

      if (!r.date) return true;

      const reservationDate = r.date.seconds
        ? new Date(r.date.seconds * 1000)
        : new Date(r.date);

      if (startDateFilter) {
        const start = new Date(startDateFilter);
        if (reservationDate < start) return false;
      }

      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        if (reservationDate > end) return false;
      }

      if (statusFilter && r.status !== statusFilter) return false;

      if (term) {

        const name = r.clientName?.toLowerCase() || "";
        const service = r.serviceTypeName?.toLowerCase() || "";
        const booking = r.reservationNumber?.toLowerCase() || "";

        if (
          !name.includes(term) &&
          !service.includes(term) &&
          !booking.includes(term)
        ) {
          return false;
        }

      }

      return true;

    });

  }, [
    adventures,
    startDateFilter,
    endDateFilter,
    statusFilter,
    searchTerm
  ]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;

  const currentRows = filteredReservations.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    filteredReservations.length / rowsPerPage
  );

  const hasFilters =
    startDateFilter ||
    endDateFilter ||
    statusFilter ||
    searchTerm;

  return (
    <div className="adventure-container">

      {/* ================= HEADER ================= */}
      <div className="reservation-header">

        <div>
          <h2>Reservas de aventuras</h2>
          <p>{filteredReservations.length} resultados encontrados</p>
        </div>

        <div className="header-actions">

          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
          />

          <button className="btn-primary" onClick={handleCreate}>
            + Nueva reserva
          </button>

        </div>

      </div>

      {/* ================= FILTROS DESKTOP ================= */}
      <div className="filters-bar">

        <div className="filter-group">
          <label>Desde</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Estado</label>
          <Select
              options={[
                { value: "", label: "Todos" },
                { value: "pending", label: "Pendiente" },
                { value: "confirmed", label: "Confirmada" },
                { value: "cancelled", label: "Cancelada" }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <input
            className="search-input"
            type="text"
            placeholder="Cliente, tour o # reserva"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button
          className="btn-secondary"
          onClick={() => {
            setStartDateFilter("");
            setEndDateFilter("");
            setStatusFilter("");
            setSearchTerm("");
          }}
        >
          Limpiar
        </button>

      </div>

      {/* ================= FILTROS MOBILE ================= */}
      <div className="filters-collapsible">

        <button
          className={`filters-toggle ${hasFilters ? "active" : ""}`}
          onClick={() => setShowFilters(prev => !prev)}
        >
          🔍 Filtros {hasFilters && "•"}
        </button>

        <div className={`filters-content ${showFilters ? "open" : ""}`}>

          <div className="filter-group">
            <label>Desde</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Hasta</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Estado</label>
            <Select
              options={[
                { value: "", label: "Todos" },
                { value: "pending", label: "Pendiente" },
                { value: "confirmed", label: "Confirmada" },
                { value: "cancelled", label: "Cancelada" }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Cliente, tour o # reserva"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <button
            className="btn-secondary full"
            onClick={() => {
              setStartDateFilter("");
              setEndDateFilter("");
              setStatusFilter("");
              setSearchTerm("");
              setShowFilters(false);
            }}
          >
            Limpiar
          </button>

        </div>

      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div style={{ textAlign: "center" }}>
          <Loading />
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!loading && currentRows.length === 0 && (
        <div className="empty-state">
          <p>No hay reservas en este rango.</p>
        </div>
      )}

      {/* ================= GRID ================= */}
      {!loading && viewMode === "grid" && (
        <div className="reservations-grid">
          {currentRows.map(r => (
            <div key={r.id} className="reservation-card">

              <div className="reservation-top">
                <h4 onClick={() => handleEdit(r)}>{r.clientName}</h4>
                <span className={getStatusClass(r.status)}>
                  {r.status}
                </span>
              </div>

              <p className="service">{r.serviceTypeName}</p>

              <div className="reservation-info">
                <p><strong>Fecha:</strong> {formatDate(r.date)}</p>
                {r.endDate && (
                  <p><strong>Fin:</strong> {formatDate(r.endDate)}</p>
                )}
              </div>

              <div className="reservation-actions">
                <button className="btn-edit" onClick={() => handleEdit(r)}>
                  Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(r.id)}>
                  Eliminar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && viewMode === "table" && (
        <div className="reservations-table-wrapper">

          <DataTable
            data={filteredReservations} // 🔥 data completa (ya filtrada, sin paginar)
            columns={[
              { key: "reservationNumber", label: "Booking ID", sortable: true },
              { key: "clientName", label: "Cliente", sortable: true },
              { key: "serviceTypeName", label: "Tour", sortable: true },
              { key: "date", label: "Fecha", sortable: true },
              { key: "status", label: "Estado", sortable: true },
              { key: "actions", label: "Acciones", sortable: false },
            ]}
            renderRow={(r) => (
              <>
                <td onClick={() => handleEdit(r)}>
                  {r.reservationNumber}
                </td>

                <td onClick={() => handleEdit(r)}>
                  {r.clientName}
                </td>

                <td onClick={() => handleEdit(r)}>
                  {r.serviceTypeName}
                </td>

                <td onClick={() => handleEdit(r)}>
                  {formatDate(r.date)}
                </td>

                <td>
                  <span className={getStatusClass(r.status)}>
                    {r.status}
                  </span>
                </td>

                <td className="table-actions">
                  <button
                    className="btn-link"
                    onClick={() => handleEdit(r)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn-link"
                    onClick={() => handleDelete(r.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </>
            )}
            rowsPerPageOptions={[5, 10, 20, 50]} // opcional
            defaultRowsPerPage={10} // opcional
          />

        </div>
      )}

      {/* ================= MODAL ================= */}
      <AdventureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        reservation={selectedReservation}
        mode={mode}
        companyId={companyId}
        user={user}
      />

    </div>
  );

};

export default AdventureList;