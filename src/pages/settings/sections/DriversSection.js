import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  getDrivers,
  createDriver,
  updateDriver,
  toggleDriverStatus
} from "../../../services/settings/driverService";
import Loading from "../../../components/general/loading";

import { UserAuth } from "../../../context/AuthContext";
import Modal from "../../../components/general/modal";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/driversSection.css";

const DriversSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    driverType: "Empleado", 
    isActive: true
  });

  const driverTypeOptions = [
    { value: "Empleado", label: "Empleado" },
    { value: "Freelance", label: "Freelance" }
  ];

  /* =========================
     LOAD
  ========================== */

  const loadDrivers = async () => {
    if (!companyId) return;

    const data = await getDrivers(companyId);
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDrivers();
  }, [companyId]);

  /* =========================
     RESET
  ========================== */

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
      driverType: "Empleado",
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

    try {
      if (editingId) {
        await updateDriver(companyId, editingId, form, user);
        notifySuccess("Chofer actualizado");
      } else {
        await createDriver(companyId, form, user);
        notifySuccess("Chofer creado correctamente");
      }

      resetForm();
      loadDrivers();

    } catch (error) {
      notifyError(error.message || "Error inesperado.");
    }
  };

  /* =========================
     EDIT
  ========================== */

  const handleEdit = (driver) => {
    setForm(driver);
    setEditingId(driver.id);
    setShowForm(true);
  };

  /* =========================
     TOGGLE
  ========================== */

  const handleToggle = async (driver) => {

    const confirmed = await notifyConfirm(
      `¿Deseas ${driver.isActive ? "desactivar" : "activar"} este chofer?`
    );

    if (!confirmed) return;

    try {
      await toggleDriverStatus(companyId, driver.id, driver.isActive);
      notifySuccess("Estado actualizado");
      loadDrivers();
    } catch (error) {
      notifyError("No se pudo actualizar.");
    }
  };

  if (loading) return <Loading />;

  /* =========================
     UI
  ========================== */

  return (
    <div className="drivers-container">

      <div className="drivers-header">
        <div>
          <h3>Choferes</h3>
          <p>Administra los conductores disponibles.</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Agregar chofer
        </button>
      </div>

      {showForm && (
        <Modal onClose={resetForm}>
          <div className="app-modal-header">
            <h4>{editingId ? "Editar chofer" : "Nuevo chofer"}</h4>
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

            <div className="form-group">
                <label>Tipo de chofer</label>

                <Select
                    options={driverTypeOptions}
                    value={driverTypeOptions.find(
                    option => option.value === form.driverType
                    )}
                    onChange={(selectedOption) =>
                    setForm({ ...form, driverType: selectedOption.value })
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isSearchable={false}
                />
            </div>

            <div className="form-group">
              <label>Tipo de licencia</label>
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

      
    <table className="drivers-table">
        <thead>
        <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        {drivers.map(driver => (
            <tr key={driver.id}>
            <td>{driver.name}</td>
            <td>{driver.phone}</td>
            <td>{driver.driverType}</td>
            <td>
                <span className={driver.isActive ? "badge-active" : "badge-inactive"}>
                {driver.isActive ? "Activo" : "Inactivo"}
                </span>
            </td>
            <td>
                <button className="btn-link" onClick={() => handleEdit(driver)}>
                Editar
                </button>
                <button className="btn-link" onClick={() => handleToggle(driver)}>
                {driver.isActive ? "Desactivar" : "Activar"}
                </button>
            </td>
            </tr>
        ))}
        </tbody>
    </table>

    </div>
  );
};

export default DriversSection;