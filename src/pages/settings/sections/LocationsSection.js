import React, { useEffect, useState, useMemo } from "react";
import {
  getLocations,
  createLocations,
  updateLocations,
  toggleLocationStatus
} from "../../../services/settings/transportation/locationsService";

import { UserAuth } from "../../../context/AuthContext";
import Modal from "../../../components/general/modal";
import Pagination from "../../../components/general/pagination";
import DataTable from "../../../components/general/dataTable";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/transportation/locationsSection.css";
import Loading from "../../../components/general/loading"; 

const LocationsSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "name",
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

  // 🔍 SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  /* =========================
    PROCESAMIENTO (FILTRO + ORDEN)
  ========================== */

  const processedLocations = useMemo(() => {

    let result = locations;

    // 🔎 FILTRO
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter((loc) =>
        loc.name?.toLowerCase().includes(term)
      );
    }

    // 🔽 ORDEN
    result = [...result].sort((a, b) => {

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // boolean → número
      if (typeof aValue === "boolean") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      // string → lowercase
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // null safety
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;

  }, [locations, searchTerm, sortConfig]);

  /* =========================
    FORM
  ========================== */

  const [form, setForm] = useState({
    name: "",
    isActive: true
  });

  /* =========================
     LOAD DATA
  ========================== */

  const cargarLocations = async () => {
    if (!companyId) return;

    const data = await getLocations(companyId);

    // ⚠️ FIX opcional (recomendado): sort correcto para strings
    const ordenados = data.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setLocations(ordenados);
    setLoading(false);
  };

  useEffect(() => {
    cargarLocations();
  }, [companyId]);

  /* =========================
     RESET PAGINACIÓN
  ========================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, searchTerm]);

  /* =========================
     RESET FORM
  ========================== */

  const resetForm = () => {
    setForm({
      name: "",
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  /* =========================
     CREATE / UPDATE
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      notifyError("El nombre es obligatorio.");
      return;
    }

    try {

      if (editingId) {
        await updateLocations(companyId, editingId, form, user);
        notifySuccess("Lugar actualizado", "Los cambios fueron guardados.");
      } else {
        await createLocations(companyId, form, user);
        notifySuccess("Lugar creado", "El lugar fue creado correctamente.");
      }

      resetForm();
      cargarLocations();

    } catch (error) {
      console.error(error);
      notifyError(error.message || "Ocurrió un error inesperado.");
    }
  };

  /* =========================
     EDIT
  ========================== */

  const handleEdit = (location) => {
    setForm({
      name: location.name,
      isActive: location.isActive
    });

    setEditingId(location.id);
    setShowForm(true);
  };

  /* =========================
     TOGGLE STATUS
  ========================== */

  const handleToggle = async (location) => {

    const confirmed = await notifyConfirm(
      `¿Deseas ${location.isActive ? "desactivar" : "activar"} este lugar?`
    );

    if (!confirmed) return;

    try {

      await toggleLocationStatus(
        companyId,
        location.id,
        location.isActive
      );

      notifySuccess(
        "Estado actualizado",
        `El lugar fue ${location.isActive ? "desactivado" : "activado"} correctamente.`
      );

      cargarLocations();

    } catch (error) {
      notifyError(error.message || "No se pudo actualizar.");
    }
  };

  /* ================= RENDER ================= */

  if (loading) return <Loading />;

  return (
    <div className="locations-container">

    <div className="locations-header">

      {/* IZQUIERDA */}
      <div className="locations-header-left">
        <h3>Lugares</h3>
        <p>Administra los puntos disponibles para reservas.</p>
      </div>

      {/* DERECHA */}
      <div className="locations-header-right">

        <input
          type="text"
          className="search-input"
          placeholder="Buscar lugar..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // mantiene consistencia con paginación
          }}
        />

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Agregar lugar
        </button>

      </div>

    </div>

      {showForm && (
        <Modal onClose={resetForm}>
          <div className="app-modal-header">
            <h4>{editingId ? "Editar lugar" : "Nuevo lugar"}</h4>
            <button className="close-btn" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Lugar</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Activo
              </label>
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>

              <button className="btn-primary" type="submit">
                {editingId ? "Actualizar" : "Crear"}
              </button>

            </div>

          </form>
        </Modal>
      )}

      <div className="locations-content">

        {locations.length === 0 ? (
          <div className="locations-empty">
            <p>No hay lugares registrados todavía.</p>
          </div>
        ) : (
          <DataTable
            data={processedLocations}
            rowsPerPage={rowsPerPage}
            columns={[
              { key: "name", label: "Nombre", sortable: true },
              { key: "isActive", label: "Estado", sortable: true },
              { key: "actions", label: "Acciones", sortable: false },
            ]}
            renderRow={(location) => (
              <>
                <td>{location.name}</td>

                <td>
                  <span
                    className={
                      location.isActive
                        ? "badge-active"
                        : "badge-inactive"
                    }
                  >
                    {location.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td>
                  <button
                    className="btn-link"
                    onClick={() => handleEdit(location)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn-link"
                    onClick={() => handleToggle(location)}
                  >
                    {location.isActive ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </>
            )}
          />
        )}

      </div>

    </div>
  );
};

export default LocationsSection;
