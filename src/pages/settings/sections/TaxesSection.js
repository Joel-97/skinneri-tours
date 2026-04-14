import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import {
  getTaxes,
  createTax,
  updateTax,
  toggleTaxStatus
} from "../../../services/settings/general/taxService";

import { UserAuth } from "../../../context/AuthContext";
import "../../../style/settings/general/taxSettings.css";
import Modal from "../../../components/general/modal";
import Pagination from "../../../components/general/pagination";
import { getCurrencies } from "../../../services/settings/general/currencyService";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";
import Loading from "../../../components/general/loading"; 

const TaxesSettings = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  // 🔍 SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* =========================
     FILTRO
  ========================== */

  const filteredTaxes = useMemo(() => {
    if (!searchTerm) return taxes;

    const term = searchTerm.toLowerCase();

    return taxes.filter((t) =>
      t.name?.toLowerCase().includes(term) ||
      t.type?.toLowerCase().includes(term) ||
      t.rate?.toString().includes(term) ||
      t.currency?.toLowerCase().includes(term)
    );
  }, [taxes, searchTerm]);

  /* =========================
     PAGINACIÓN (CORREGIDA)
  ========================== */

  const totalPages = Math.ceil(filteredTaxes.length / rowsPerPage);

  const currentTaxes = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTaxes.slice(start, start + rowsPerPage);
  }, [filteredTaxes, currentPage, rowsPerPage]);

  const [form, setForm] = useState({
    name: "",
    rate: "",
    type: "percentage",
    currency: "",
    isDefault: false,
    isActive: true
  });

  const [editingId, setEditingId] = useState(null);

  /* =========================
     LOAD DATA
  ========================== */

  const cargarImpuestos = async () => {
    if (!companyId) return;

    const data = await getTaxes(companyId);
    const ordenados = data.sort((a, b) => b.isDefault - a.isDefault);

    setTaxes(ordenados);
    setLoading(false);
  };

  useEffect(() => {
    if (!companyId) return;
    cargarImpuestos();
  }, [companyId]);

  /* =========================
     RESET PAGINACIÓN
  ========================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, searchTerm]);

  /* =========================
     BLOQUEO SCROLL MODAL
  ========================== */

  useEffect(() => {
    if (mostrarFormulario) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mostrarFormulario]);

  /* =========================
     LOAD CURRENCIES
  ========================== */

  useEffect(() => {
    if (!companyId) return;

    const loadCurrencies = async () => {
      const data = await getCurrencies(companyId);

      const activeCurrencies = data.filter(c => c.isActive);

      setCurrencies(activeCurrencies);

      const defaultCurrency = activeCurrencies.find(c => c.isDefault);

      if (defaultCurrency) {
        setForm(prev => ({
          ...prev,
          currency: defaultCurrency.code
        }));
      }
    };

    loadCurrencies();

  }, [companyId]);

  /* =========================
     RESET FORM
  ========================== */

  const resetForm = () => {
    setForm({
      name: "",
      rate: "",
      type: "percentage",
      currency: "",
      isDefault: false,
      isActive: true
    });
    setEditingId(null);
    setMostrarFormulario(false);
  };

  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.rate) return;

    try {

      if (editingId) {
        await updateTax(companyId, editingId, form, user);
        notifySuccess(
          "Impuesto actualizado",
          "Los cambios fueron guardados correctamente."
        );
      } else {
        await createTax(companyId, form, user);
        notifySuccess(
          "Impuesto creado",
          "El impuesto fue creado correctamente."
        );
      }

      resetForm();
      cargarImpuestos();

    } catch (error) {

      console.error("Error guardando impuesto:", error);

      notifyError(
        "Error al guardar",
        error.message || "Ocurrió un error inesperado."
      );

    }

  };

  /* =========================
     EDIT
  ========================== */

  const handleEdit = (tax) => {
    setForm({
      name: tax.name,
      rate: tax.rate,
      type: tax.type,
      currency: tax.currency || "", 
      isDefault: tax.isDefault,
      isActive: tax.isActive
    });
    setEditingId(tax.id);
    setMostrarFormulario(true);
  };

  /* =========================
     HELPERS
  ========================== */

  const getCurrencySymbol = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.symbol || "";
  };

  const typeOptions = [
    { value: "percentage", label: "Porcentaje (%)" },
    { value: "fixed", label: "Monto fijo" }
  ];

  /* ================= RENDER ================= */

  if (loading) return <Loading />;

  return (

    <div className="taxes-container">

    <div className="taxes-header">

      {/* IZQUIERDA */}
      <div className="taxes-header-left">
        <h3>Impuestos</h3>
        <p>Administra los impuesto de tu empresa.</p>
      </div>

      {/* DERECHA */}
      <div className="taxes-header-right">

        <input
          type="text"
          className="search-input"
          placeholder="Buscar impuesto..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // mantiene consistencia con paginación
          }}
        />

        <button
          className="btn-primary"
          onClick={() => setMostrarFormulario(true)}
        >
          + Agregar Impuesto
        </button>

      </div>

    </div>

      {/* MODAL */}
      {mostrarFormulario && (
        <Modal onClose={resetForm}>

          <div className="modal-header">
            <h3>
              {editingId ? "Editar Impuesto" : "Nuevo Impuesto"}
            </h3>
            <button className="close-btn" onClick={resetForm}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Nombre del impuesto</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Tasa</label>
              <input
                type="number"
                value={form.rate}
                onChange={(e) =>
                  setForm({ ...form, rate: Number(e.target.value) })
                }
              />
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <Select
                options={typeOptions}
                value={
                  typeOptions.find(
                    (option) => option.value === form.type
                  ) || null
                }
                onChange={(selectedOption) =>
                  setForm({
                    ...form,
                    type: selectedOption?.value || ""
                  })
                }
                placeholder="Seleccionar tipo"
                isClearable={false}
              />
            </div>

            {form.type === "fixed" && (

              currencies.length === 0 ? (

                <div className="form-group">
                  <label>Moneda</label>
                  <p className="form-error">
                    No hay monedas activas. Configura una en Settings → Monedas.
                  </p>
                </div>

              ) : (

                <div className="form-group">
                  <label>Moneda</label>
                  <Select
                    value={currencies.find(c => c.code === form.currency)}
                    onChange={(selected) =>
                      setForm({ ...form, currency: selected.code })
                    }
                    options={currencies}
                    getOptionLabel={(option) =>
                      `${option.name} (${option.symbol})`
                    }
                    getOptionValue={(option) => option.code}
                  />
                </div>
              )
            )}

            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                />
                Establecer como predeterminado
              </label>
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

      {/* LISTADO */}
      <div className="taxes-list">

        { taxes.length === 0 ? (
          <p>No hay impuestos creados todavía.</p>
        ) : (
        <>
          <div className="taxes-table-wrapper">
            <table className="taxes-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tasa</th>
                  <th>Predeterminado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentTaxes.map((tax) => (
                  <tr key={tax.id}>
                    <td>{tax.name}</td>

                    <td>
                      {tax.type === "percentage"
                        ? `${tax.rate}%`
                        : `${getCurrencySymbol(tax.currency)}${tax.rate}`
                      }
                    </td>

                    <td>
                      {tax.isDefault && (
                        <span className="badge-default">
                          ⭐ Sí
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          tax.isActive
                            ? "badge-active"
                            : "badge-inactive"
                        }
                      >
                        {tax.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-link"
                        onClick={() => handleEdit(tax)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-link"
                        onClick={async () => {

                          const confirmed = await notifyConfirm(
                            `¿Deseas ${tax.isActive ? "desactivar" : "activar"} este impuesto?`
                          );

                          if (!confirmed) return;

                          try {

                            await toggleTaxStatus(
                              companyId,
                              tax.id,
                              tax.isActive
                            );

                            notifySuccess(
                              "Estado actualizado",
                              `El impuesto fue ${tax.isActive ? "desactivado" : "activado"} correctamente.`
                            );

                            cargarImpuestos();

                          } catch (error) {

                            console.error("Error cambiando estado:", error);

                            notifyError(
                              "No se pudo actualizar",
                              error.message || "Ocurrió un error inesperado."
                            );

                          }

                        }}
                      >
                        {tax.isActive ? "Desactivar" : "Activar"}
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔥 PAGINACIÓN REUTILIZABLE */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsChange={setRowsPerPage}
          />

        </>
        )}

      </div>

    </div>

  );
};

export default TaxesSettings;
