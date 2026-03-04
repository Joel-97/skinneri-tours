import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  toggleDiscountStatus
} from "../../../services/settings/discountService";

import { getCurrencies } from "../../../services/settings/currencyService";

import { UserAuth } from "../../../context/AuthContext";
import Modal from "../../../components/general/modal";
import Loading from "../../../components/general/loading";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/discountsSection.css";

const DiscountsSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [discounts, setDiscounts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "percentage",
    value: "",
    currency: "",
    expirationDate: "",
    isActive: true
  });

  /* ================= LOAD DATA ================= */

  const loadData = async () => {
    if (!companyId) return;

    const data = await getDiscounts(companyId);
    const curr = await getCurrencies(companyId);

    setDiscounts(data);
    setCurrencies(curr.filter(c => c.isActive));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  /* ================= RESET FORM ================= */

  const resetForm = () => {
    setForm({
      name: "",
      type: "percentage",
      value: "",
      currency: "",
      expirationDate: "",
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.symbol})`
  }));

  const typeOptions = [
    { value: "percentage", label: "Porcentaje (%)" },
    { value: "fixed", label: "Monto fijo" }
  ];

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (editingId) {
        await updateDiscount(companyId, editingId, form, user);
        notifySuccess("Descuento actualizado","Descuento actualizado correctamente.");
      } else {
        await createDiscount(companyId, form, user);
        notifySuccess("Descuento creado","Descuento creado correctamente.");
      }

      resetForm();
      loadData();

    } catch (error) {
      notifyError("Error", "Hubo un error al actualizar");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (discount) => {

    setForm({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      currency: discount.currency || "",
      expirationDate: discount.expirationDate
        ? discount.expirationDate.toDate().toISOString().split("T")[0]
        : "",
      isActive: discount.isActive
    });

    setEditingId(discount.id);
    setShowForm(true);
  };

  /* ================= TOGGLE ================= */

  const handleToggle = async (discount) => {

    const confirmed = await notifyConfirm(
      `¿Deseas ${discount.isActive ? "desactivar" : "activar"} este descuento?`
    );

    if (!confirmed) return;

    try {

      await toggleDiscountStatus(
        companyId,
        discount.id,
        discount.isActive
      );

      notifySuccess("Estado actualizado", "El estado se actualizo correctamente");
      loadData();

    } catch (error) {
      notifyError("Error", "Hubo un error al actualizar");
    }
  };

  /* ================= RENDER ================= */

  if (loading) return <Loading />;

  return (
    <div className="discounts-container">

      <div className="discounts-header">
        <div>
          <h3>Descuentos</h3>
          <p>Gestiona descuentos globales del sistema.</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Agregar descuento
        </button>
      </div>

      {showForm && (
        <Modal onClose={resetForm}>

          <div className="app-modal-header">
            <h4>{editingId ? "Editar descuento" : "Nuevo descuento"}</h4>
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
                isSearchable={false}
                isClearable={false}
              />
            </div>

            <div className="form-group">
              <label>Valor</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: Number(e.target.value) })
                }
              />
            </div>

            {form.type === "fixed" && (
              <div className="form-group">
                <label>Moneda</label>
                <Select
                  options={currencyOptions}
                  value={
                    currencyOptions.find(
                      (option) => option.value === form.currency
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    setForm({
                      ...form,
                      currency: selectedOption?.value || ""
                    })
                  }
                  placeholder="Seleccionar"
                  isClearable
                />
              </div>
            )}

            <div className="form-group">
              <label>Fecha de expiración (opcional)</label>
              <input
                type="date"
                value={form.expirationDate}
                onChange={(e) =>
                  setForm({ ...form, expirationDate: e.target.value })
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

      <div className="discounts-content">

        {discounts.length === 0 ? (
          <p>No hay descuentos registrados.</p>
        ) : (
        <div className="discounts-table-wrapper">
          <table className="discounts-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Expira</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {discounts.map(discount => {

                const expired =
                  discount.expirationDate &&
                  discount.expirationDate.toDate() < new Date();

                return (
                  <tr key={discount.id}>
                    <td>{discount.name}</td>

                    <td>
                      {discount.type === "percentage"
                        ? "Porcentaje"
                        : "Fijo"}
                    </td>

                    <td>
                      {discount.type === "percentage"
                        ? `${discount.value}%`
                        : `${discount.currency} ${discount.value}`}
                    </td>

                    <td>
                      {discount.expirationDate
                        ? discount.expirationDate.toDate().toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <span className={
                        discount.isActive && !expired
                          ? "badge-active"
                          : "badge-inactive"
                      }>
                        {expired ? "Expirado" :
                         discount.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-link"
                        onClick={() => handleEdit(discount)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-link"
                        onClick={() => handleToggle(discount)}
                      >
                        {discount.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
  
        )}

      </div>

    </div>
  );
};

export default DiscountsSection;
