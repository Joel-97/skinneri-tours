import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  getServiceTypes,
  createServiceType,
  updateServiceType,
  toggleServiceTypeStatus
} from "../../../services/settings/serviceTypeService";

import { getCurrencies } from "../../../services/settings/currencyService";

import { UserAuth } from "../../../context/AuthContext";
import Modal from "../../../components/general/modal";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/serviceTypesSection.css";
import Loading from "../../../components/general/loading"; 

const ServiceTypesSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [serviceTypes, setServiceTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    pricingMode: "fixed",
    basePrice: "",
    currency: "",
    symbol: "",
    durationValue: "",
    durationUnit: "minutes",
    durationMinutes: null,
    color: "#0a2a63",
    driverPayment: {
      enabled: false,
      type: "fixed",      // "fixed" | "percentage"
      value: ""           // número
    },
    isActive: true
  });

  /* =========================
     LOAD DATA
  ========================== */

  const loadData = async () => {
    if (!companyId) return;

    const types = await getServiceTypes(companyId);
    const curr = await getCurrencies(companyId);

    const ordered = types.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setServiceTypes(ordered);
    setCurrencies(curr.filter(c => c.isActive));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  /* =========================
     RESET FORM
  ========================== */

  const resetForm = () => {
    setForm({
      name: "",
      pricingMode: "fixed",
      basePrice: "",
      currency: "",
      symbol: "",
      color: "#0a2a63",
      driverPayment: {
        enabled: false,
        type: "fixed",      // "fixed" | "percentage"
        value: ""           // número
      },
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const pricingOptions = [
    { value: "fixed", label: "Precio fijo" },
    { value: "manual", label: "Precio manual" }
  ];

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.symbol})`,
    symbol: c.symbol
  }));

  const durationUnitOptions = [
    { value: "minutes", label: "Minutos" },
    { value: "hours", label: "Horas" },
    { value: "days", label: "Días" }
  ];


  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      notifyError("Error","El nombre es obligatorio.");
      return;
    }

    try {

      // 🔹 Calcular duración en minutos (opcional)
      let durationMinutes = null;

      if (form.durationValue) {
        if (form.durationUnit === "minutes") {
          durationMinutes = Number(form.durationValue);
        } else if (form.durationUnit === "hours") {
          durationMinutes = Number(form.durationValue) * 60;
        } else if (form.durationUnit === "days") {
          durationMinutes = Number(form.durationValue) * 60 * 24;
        }
      }

      const finalForm = {
        ...form,
        durationMinutes
      };

      if (editingId) {
        await updateServiceType(
          companyId,
          editingId,
          finalForm,
          user
        );
        notifySuccess("Tipo actualizado correctamente.");
      } else {
        await createServiceType(
          companyId,
          finalForm,
          user
        );
        notifySuccess("Tipo creado correctamente.");
      }

      resetForm();
      loadData();

    } catch (error) {
      notifyError("Error", error.message);
    }
  };


  /* =========================
     EDIT
  ========================== */

  const handleEdit = (type) => {

    let durationValue = "";
    let durationUnit = "minutes";

    if (type.durationMinutes) {

      if (type.durationMinutes % 1440 === 0) {
        durationValue = type.durationMinutes / 1440;
        durationUnit = "days";
      } else if (type.durationMinutes % 60 === 0) {
        durationValue = type.durationMinutes / 60;
        durationUnit = "hours";
      } else {
        durationValue = type.durationMinutes;
        durationUnit = "minutes";
      }

    }

    setForm({
      name: type.name || "",
      pricingMode: type.pricingMode || "fixed",
      basePrice: type.basePrice ?? "",
      currency: type.currency || "",
      symbol: type.symbol || "",
      durationValue,
      durationUnit,
      color: type.color || "#0a2a63",

      driverPayment: {
        enabled: type.driverPayment?.enabled ?? false,
        type: type.driverPayment?.type || "fixed",
        value:
          type.driverPayment?.value !== null &&
          type.driverPayment?.value !== undefined
            ? String(type.driverPayment.value)
            : ""
      },

      isActive: type.isActive ?? true
    });

    setEditingId(type.id);
    setShowForm(true);
  };


  /* =========================
     TOGGLE
  ========================== */

  const handleToggle = async (type) => {

    const confirmed = await notifyConfirm(
      `¿Deseas ${type.isActive ? "desactivar" : "activar"} este tipo de servicio?`
    );

    if (!confirmed) return;

    try {

      await toggleServiceTypeStatus(
        companyId,
        type.id,
        type.isActive
      );

      notifySuccess("Estado actualizado.");
      loadData();

    } catch (error) {
      notifyError("Error",error.message);
    }
  };

  const handlePricingModeChange = (selectedOption) => {

    const newMode = selectedOption?.value || "";

    setForm(prev => {

      // Si no cambió el modo, no hacer nada
      if (prev.pricingMode === newMode) return prev;

      return {
        ...prev,
        pricingMode: newMode,

        // 🔥 Reset automático
        basePrice: "",
      };
    });
  };


  /* ================= RENDER ================= */

  if (loading) return <Loading />;

  return (
    <div className="serviceTypes-container">

      <div className="serviceTypes-header">
        <div>
          <h3>Tipos de servicio</h3>
          <p>Define cómo se calcula el precio de cada servicio.</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Agregar tipo
        </button>
      </div>

{showForm && (
  <Modal onClose={resetForm}>
    <div className="app-modal-header">
      <h4>{editingId ? "Editar tipo" : "Nuevo tipo"}</h4>
      <button className="close-btn" onClick={resetForm}>✕</button>
    </div>

    <form onSubmit={handleSubmit} className="modal-form">

      {/* ================= NOMBRE ================= */}
      <div className="form-group">
        <label>Nombre</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />
      </div>

      {/* ================= MODO PRECIO ================= */}
      <div className="form-group">
        <label>Modo de precio</label>
        <Select
          options={pricingOptions}
          value={
            pricingOptions.find(
              (option) => option.value === form.pricingMode
            ) || null
          }
          onChange={handlePricingModeChange}
          placeholder="Seleccionar modo de precio"
          isClearable={false}
        />
      </div>

      {/* ================= PRECIO BASE ================= */}
      {form.pricingMode === "fixed" && (
        <div className="form-group">
          <label>
            Precio base {form.symbol && `(${form.symbol})`}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.basePrice}
            onChange={(e) =>
              setForm({
                ...form,
                basePrice: e.target.value === "" ? "" : Number(e.target.value)
              })
            }
            placeholder="Ej: 150"
          />
        </div>
      )}

      {/* ================= PAGO AL CHOFER ================= */}
      <div className="form-group">

        <div className="section-header">
          <label className="section-title">Pago al chofer</label>

          {/* TOGGLE */}
          <label className="switch">
            <input
              type="checkbox"
              checked={form.driverPayment?.enabled || false}
              onChange={(e) =>
                setForm({
                  ...form,
                  driverPayment: {
                    ...(form.driverPayment || {}),
                    enabled: e.target.checked,
                    value: "" // limpia cuando cambia estado
                  }
                })
              }
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* SOLO SE MUESTRA SI ESTÁ ACTIVADO */}
        {form.driverPayment?.enabled && (
          <>
            <div className="driver-type-toggle">
              <label className="radio-option">
                <input
                  type="radio"
                  value="fixed"
                  checked={form.driverPayment?.type === "fixed"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      driverPayment: {
                        ...form.driverPayment,
                        type: e.target.value,
                        value: ""
                      }
                    })
                  }
                />
                <span>Monto fijo</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  value="percentage"
                  checked={form.driverPayment?.type === "percentage"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      driverPayment: {
                        ...form.driverPayment,
                        type: e.target.value,
                        value: ""
                      }
                    })
                  }
                />
                <span>Comisión (%)</span>
              </label>
            </div>

            <input
              type="number"
              min="0"
              max={form.driverPayment?.type === "percentage" ? "100" : undefined}
              step="0.01"
              className="modern-input"
              placeholder={
                form.driverPayment?.type === "fixed"
                  ? `Ej: ${form.symbol || ""} 25`
                  : "Ej: 20 %"
              }
              value={form.driverPayment?.value || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  driverPayment: {
                    ...form.driverPayment,
                    value: e.target.value
                  }
                })
              }
            />
          </>
        )}

      </div>

      {/* ================= MONEDA + COLOR ================= */}
      <div className="form-row two-columns">
        <div className="form-group">
          <label>Moneda</label>
          <Select
            options={currencyOptions}
            value={
              currencyOptions.find(
                (option) => option.value === form.currency
              ) || null
            }
            onChange={(selectedOption) => {
              setForm({
                ...form,
                currency: selectedOption?.value || "",
                symbol: selectedOption?.symbol || ""
              });
            }}
            placeholder="Seleccionar"
            isClearable
          />
        </div>

        <div className="form-group">
          <label>Color del servicio</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) =>
              setForm({
                ...form,
                color: e.target.value
              })
            }
            className="color-input"
          />
        </div>
      </div>

      {/* ================= DURACIÓN ================= */}
      <div className="form-group">
        <label>Duración estimada</label>

        <div className="duration-row">
          <input
            type="number"
            min="0"
            value={form.durationValue}
            onChange={(e) =>
              setForm({
                ...form,
                durationValue: e.target.value === "" ? "" : Number(e.target.value)
              })
            }
            placeholder="Cantidad"
          />

          <Select
            options={durationUnitOptions}
            value={
              durationUnitOptions.find(
                (option) => option.value === form.durationUnit
              ) || null
            }
            onChange={(selectedOption) =>
              setForm({
                ...form,
                durationUnit: selectedOption?.value || "minutes"
              })
            }
            isSearchable={false}
            isClearable={false}
          />
        </div>
      </div>

      {/* ================= ACTIVO ================= */}
      <div className="form-checkbox">
        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm({
                ...form,
                isActive: e.target.checked
              })
            }
          />
          Activo
        </label>
      </div>

      {/* ================= BOTONES ================= */}
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

      <div className="serviceTypes-content">

        { serviceTypes.length === 0 ? (
          <p>No hay tipos registrados.</p>
        ) : (
        <div className="serviceTypes-table-wrapper">
          <table className="serviceTypes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Modo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {serviceTypes.map(type => (
                <tr key={type.id}>
                  <td>
                    <div className="service-name-cell">
                      <span
                        className="color-dot"
                        style={{ backgroundColor: type.color || "#3B82F6" }}
                      />
                      {type.name}
                    </div>
                  </td>

                    <td>
                    <span className={
                        type.pricingMode === "fixed"
                        ? "badge-fixed"
                        : "badge-manual"
                    }>
                        {type.pricingMode === "fixed" ? "Precio fijo" : "Manual"}
                    </span>
                    </td>

                  <td>
                    {type.pricingMode === "fixed"
                      ? `${type.symbol ?? type.currency ?? ""} ${type.basePrice ?? 0}`
                      : "-"}
                  </td>

                  <td>
                   <span className={type.isActive ? "badge-active" : "badge-inactive"}>
                     {type.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn-link"
                      onClick={() => handleEdit(type)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-link"
                      onClick={() => handleToggle(type)}
                    >
                      {type.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        )}

      </div>

    </div>
  );
};

export default ServiceTypesSection;
