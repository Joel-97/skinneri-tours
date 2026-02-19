import React, { useEffect, useState, useMemo } from "react";
import TransportationModal from "../../general/transportationModal";
import {
  getTransportation,
  createTransportation,
  updateTransportation,
  deleteTransportation
} from "../../../services/transportation/transportationService";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";
import Loading from "../../../components/general/loading"; 
import "../../../style/transportation/transportationList.css";

const TransportationList = ({ companyId, user }) => {

  const [reservations, setReservations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(true);

  // 🔎 FILTROS
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadReservations = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const data = await getTransportation(companyId);
      setReservations(data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
      notifyError("Error", "No se pudieron cargar las reservas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    loadReservations();
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
      await deleteTransportation(companyId, id);
      notifySuccess("Reserva eliminada", "La reserva fue eliminada correctamente.");
      loadReservations();
    } catch (error) {
      console.error("Error eliminando reserva:", error);
      notifyError("Error", "No se pudo eliminar la reserva.");
    }
  };

  const handleSave = async (formData) => {
    try {
      if (mode === "create") {
        await createTransportation(companyId, formData, user);
        notifySuccess("Reserva creada", "La reserva fue creada correctamente.");
      } else {
        await updateTransportation(companyId, selectedReservation.id, formData, user);
        notifySuccess("Reserva actualizada", "Los cambios fueron guardados.");
      }

      setModalOpen(false);
      loadReservations();
    } catch (error) {
      console.error("Error guardando reserva:", error);
      notifyError("Error", "Ocurrió un problema al guardar la reserva.");
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

  // 🔥 FILTRADO EN MEMORIA (no consume más Firebase)
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
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

      return true;
    });
  }, [reservations, startDateFilter, endDateFilter, statusFilter]);

  return (
    <div className="transportation-container">

      <div className="transportation-header">
        <div>
          <h2>Reservas de transporte</h2>
          <p>{filteredReservations.length} resultados encontrados</p>
        </div>

        <button className="btn-primary" onClick={handleCreate}>
          + Nueva reserva
        </button>
      </div>

      {/* 🔎 FILTROS */}
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        <button
          className="btn-secondary"
          onClick={() => {
            setStartDateFilter("");
            setEndDateFilter("");
            setStatusFilter("");
          }}
        >
          Limpiar
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center" }}>
          <Loading />
        </div>
      )}


      {!loading && filteredReservations.length === 0 && (
        <div className="empty-state">
          <p>No hay reservas en este rango.</p>
        </div>
      )}

      <div className="reservations-grid">
        {filteredReservations.map(r => (
          <div key={r.id} className="reservation-card">

            <div className="reservation-top">
              <h4 onClick={() => handleEdit(r)}>{r.clientName}</h4>
              <span className={getStatusClass(r.status)} onClick={() => handleEdit(r)}>
                {r.status}
              </span>
            </div>

            <p className="service" onClick={() => handleEdit(r)}>{r.service}</p>

            <div className="reservation-info" onClick={() => handleEdit(r)}>
              <p><strong>Fecha:</strong> {formatDate(r.date)}</p>
              {r.endDate && (
                <p><strong>Fin:</strong> {formatDate(r.endDate)}</p>
              )}
            </div>

            <div className="reservation-actions">
              <button
                className="btn-edit"
                onClick={() => handleEdit(r)}
              >
                Editar
              </button>

              <button
                className="btn-delete"
                onClick={() => handleDelete(r.id)}
              >
                Eliminar
              </button>
            </div>

          </div>
        ))}
      </div>

      <TransportationModal
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

export default TransportationList;
