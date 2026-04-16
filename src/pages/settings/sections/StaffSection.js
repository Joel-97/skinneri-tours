import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import {
  getStaff,
  createStaff,
  updateStaff,
  toggleStaffStatus
} from "../../../services/settings/general/staffService";
import Loading from "../../../components/general/loading";

import { UserAuth } from "../../../context/AuthContext";
import Modal from "../../../components/general/modal";
import Pagination from "../../../components/general/pagination";
import DataTable from "../../../components/general/dataTable";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/general/staffSection.css";

const StaffSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [staff, setStaff] = useState([]);
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

  const processedStaff = useMemo(() => {

    let result = staff;

    // 🔎 FILTRO
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter((s) =>
        s.name?.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.licenseNumber?.toLowerCase().includes(term) ||
        s.staffType?.toLowerCase().includes(term) ||
        s.role?.toLowerCase().includes(term)
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

  }, [staff, searchTerm, sortConfig]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    staffType: "Empleado",
    role: "",
    isActive: true
  });

  /* =========================
     OPTIONS
  ========================== */

  const staffTypeOptions = [
    { value: "Empleado", label: "Empleado" },
    { value: "Freelance", label: "Freelance" }
  ];

  const roleOptions = [
    { value: "driver", label: "Chofer" },
    { value: "guide", label: "Guía turístico" },
    { value: "instructor", label: "Instructor" }
  ];

  /* =========================
     LOAD
  ========================== */

  const loadStaff = async () => {
    if (!companyId) return;

    const data = await getStaff(companyId);
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, [companyId]);

  /* =========================
     RESET PAGINACIÓN
  ========================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, searchTerm]);

  /* =========================
     RESET
  ========================== */

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
      staffType: "Empleado",
      role: "",
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

    if (!form.name.trim()) {
      notifyError("El nombre es obligatorio.");
      return;
    }

    if (!form.role) {
      notifyError("Selecciona el rol del colaborador.");
      return;
    }

    try {
      if (editingId) {
        await updateStaff(companyId, editingId, form, user);
        notifySuccess("Colaborador actualizado");
      } else {
        await createStaff(companyId, form, user);
        notifySuccess("Colaborador creado");
      }

      resetForm();
      loadStaff();

    } catch (error) {
      notifyError(error.message || "Error inesperado.");
    }
  };

  /* =========================
     EDIT
  ========================== */

  const handleEdit = (staff) => {
    setForm(staff);
    setEditingId(staff.id);
    setShowForm(true);
  };

  /* =========================
     TOGGLE
  ========================== */

  const handleToggle = async (staff) => {

    const confirmed = await notifyConfirm(
      `¿Deseas ${staff.isActive ? "desactivar" : "activar"} este colaborador?`
    );

    if (!confirmed) return;

    try {
      await toggleStaffStatus(companyId, staff.id, staff.isActive);
      notifySuccess("Estado actualizado");
      loadStaff();
    } catch (error) {
      notifyError("No se pudo actualizar.");
    }
  };

  if (loading) return <Loading />;

  /* =========================
     UI
  ========================== */

  return (
    <div className="staff-container">

    <div className="staff-header">

      {/* IZQUIERDA */}
      <div className="staff-header-left">
        <h3>Colaboradores</h3>
        <p>Administra los colaboradores disponibles.</p>
      </div>

      {/* DERECHA */}
      <div className="staff-header-right">

        <input
          type="text"
          className="search-input"
          placeholder="Buscar colaborador..."
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
          + Agregar colaborador
        </button>

      </div>

    </div>

      {showForm && (
        <Modal onClose={resetForm}>
          <div className="app-modal-header">
            <h4>{editingId ? "Editar colaborador" : "Nuevo colaborador"}</h4>
            <button className="close-btn" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Nombre</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            {/* 🔥 NUEVO: ROL */}
            <div className="form-group">
              <label>Rol del colaborador</label>
              <Select
                options={roleOptions}
                value={roleOptions.find(
                  option => option.label === form.role
                )}
                onChange={(selectedOption) =>
                  setForm({ ...form, role: selectedOption.label })
                }
                placeholder="Seleccionar rol"
              />
            </div>

            <div className="form-group">
              <label>Tipo de colaborador</label>
              <Select
                options={staffTypeOptions}
                value={staffTypeOptions.find(
                  option => option.value === form.staffType
                )}
                onChange={(selectedOption) =>
                  setForm({ ...form, staffType: selectedOption.value })
                }
                isSearchable={false}
              />
            </div>

            <div className="form-group">
              <label>Licencia (opcional)</label>
              <input
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm({ ...form, licenseNumber: e.target.value })
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


<div className="staff-table-wrapper">

  <DataTable
    data={processedStaff}
    rowsPerPage={rowsPerPage}
    columns={[
      { key: "name", label: "Nombre", sortable: true },
      { key: "phone", label: "Teléfono", sortable: true },
      { key: "role", label: "Rol", sortable: true },
      { key: "staffType", label: "Tipo", sortable: true },
      { key: "isActive", label: "Estado", sortable: true },
      { key: "actions", label: "Acciones", sortable: false },
    ]}
    renderRow={(staff) => (
      <>
        <td>{staff.name}</td>

        <td>{staff.phone}</td>

        <td>{staff.role}</td>

        <td>{staff.staffType}</td>

        <td>
          <span
            className={
              staff.isActive
                ? "badge-active"
                : "badge-inactive"
            }
          >
            {staff.isActive ? "Activo" : "Inactivo"}
          </span>
        </td>

        <td>
          <button
            className="btn-link"
            onClick={() => handleEdit(staff)}
          >
            Editar
          </button>

          <button
            className="btn-link"
            onClick={() => handleToggle(staff)}
          >
            {staff.isActive ? "Desactivar" : "Activar"}
          </button>
        </td>
      </>
    )}
  />

</div>

    </div>
  );
};

export default StaffSection;