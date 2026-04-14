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

  // 🔍 SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* =========================
     FILTRO
  ========================== */

  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staff;

    const term = searchTerm.toLowerCase();

    return staff.filter((s) =>
      s.name?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.licenseNumber?.toLowerCase().includes(term) ||
      s.staffType?.toLowerCase().includes(term) ||
      s.role?.toLowerCase().includes(term)
    );
  }, [staff, searchTerm]);

  /* =========================
     PAGINACIÓN (CORREGIDA)
  ========================== */

  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

  const currentStaff = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredStaff.slice(start, start + rowsPerPage);
  }, [filteredStaff, currentPage, rowsPerPage]);

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
        <table className="staff-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Rol</th> {/* 🔥 NUEVO */}
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentStaff.map(staff => (
              <tr key={staff.id}>
                <td>{staff.name}</td>
                <td>{staff.phone}</td>
                <td>{staff.role}</td> {/* 🔥 NUEVO */}
                <td>{staff.staffType}</td>

                <td>
                  <span className={staff.isActive ? "badge-active" : "badge-inactive"}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsChange={setRowsPerPage}
      />

    </div>
  );
};

export default StaffSection;