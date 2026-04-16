import React, { useEffect, useState, useMemo } from "react";
import {
  getPaymentTypes,
  createPaymentType,
  updatePaymentType,
  togglePaymentTypeStatus
} from "../../../services/settings/general/paymentTypeService";

import Loading from "../../../components/general/loading";
import Modal from "../../../components/general/modal";
import Pagination from "../../../components/general/pagination";
import DataTable from "../../../components/general/dataTable";
import { UserAuth } from "../../../context/AuthContext";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/general/paymentTypesSection.css";

const PaymentTypesSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [paymentTypes, setPaymentTypes] = useState([]);
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

  const processedPaymentTypes = useMemo(() => {

    let result = paymentTypes;

    // 🔎 FILTRO
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter((p) =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
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

  }, [paymentTypes, searchTerm, sortConfig]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true
  });

  /* =========================
     LOAD
  ========================== */

  const loadPaymentTypes = async () => {

    if (!companyId) return;

    const data = await getPaymentTypes(companyId);

    setPaymentTypes(data);
    setLoading(false);

  };

  useEffect(() => {
    loadPaymentTypes();
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
      description: "",
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

        await updatePaymentType(companyId, editingId, form, user);
        notifySuccess("Tipo de pago actualizado");

      } else {

        await createPaymentType(companyId, form, user);
        notifySuccess("Tipo de pago creado correctamente");

      }

      resetForm();
      loadPaymentTypes();

    } catch (error) {

      notifyError(error.message || "Error inesperado.");

    }

  };

  /* =========================
     EDIT
  ========================== */

  const handleEdit = (paymentType) => {

    setForm(paymentType);
    setEditingId(paymentType.id);
    setShowForm(true);

  };

  /* =========================
     TOGGLE
  ========================== */

  const handleToggle = async (paymentType) => {

    const confirmed = await notifyConfirm(
      `¿Deseas ${paymentType.isActive ? "desactivar" : "activar"} este tipo de pago?`
    );

    if (!confirmed) return;

    try {

      await togglePaymentTypeStatus(
        companyId,
        paymentType.id,
        paymentType.isActive
      );

      notifySuccess("Estado actualizado");

      loadPaymentTypes();

    } catch (error) {

      notifyError("No se pudo actualizar.");

    }

  };

  if (loading) return <Loading />;

  /* =========================
     UI
  ========================== */

  return (

    <div className="payment-types-container">

    <div className="payment-types-header">

      {/* IZQUIERDA */}
      <div className="payment-types-header-left">
        <h3>Tipos de pago</h3>
        <p>Administra los métodos de pago disponibles.</p>
      </div>

      {/* DERECHA */}
      <div className="payment-types-header-right">

        <input
          type="text"
          className="search-input"
          placeholder="Buscar tipo de pago..."
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
          + Agregar tipo de pago
        </button>

      </div>

    </div>

      {showForm && (

        <Modal onClose={resetForm}>

          <div className="app-modal-header">
            <h4>{editingId ? "Editar tipo de pago" : "Nuevo tipo de pago"}</h4>
            <button className="close-btn" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Nombre</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
              />
            </div>

            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm(prev => ({
                      ...prev,
                      isActive: e.target.checked
                    }))
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

              <button
                className="btn-primary"
                type="submit"
              >
                {editingId ? "Actualizar" : "Crear"}
              </button>

            </div>

          </form>

        </Modal>

      )}
    

    <div className="payment-types-table-wrapper">

      <DataTable
        data={processedPaymentTypes}
        rowsPerPage={rowsPerPage}
        columns={[
          { key: "name", label: "Nombre", sortable: true },
          { key: "description", label: "Descripción", sortable: true },
          { key: "isActive", label: "Estado", sortable: true },
          { key: "actions", label: "Acciones", sortable: false },
        ]}
        renderRow={(paymentType) => (
          <>
            <td>{paymentType.name}</td>

            <td>{paymentType.description}</td>

            <td>
              <span
                className={
                  paymentType.isActive
                    ? "badge-active"
                    : "badge-inactive"
                }
              >
                {paymentType.isActive ? "Activo" : "Inactivo"}
              </span>
            </td>

            <td>
              <button
                className="btn-link"
                onClick={() => handleEdit(paymentType)}
              >
                Editar
              </button>

              <button
                className="btn-link"
                onClick={() => handleToggle(paymentType)}
              >
                {paymentType.isActive ? "Desactivar" : "Activar"}
              </button>
            </td>
          </>
        )}
      />

    </div>
    

    </div>

  );

};

export default PaymentTypesSection;