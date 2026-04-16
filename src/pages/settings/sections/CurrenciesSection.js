import React, { useEffect, useState, useMemo } from "react";
import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  toggleCurrencyStatus
} from "../../../services/settings/general/currencyService";

import { UserAuth } from "../../../context/AuthContext";
import Modal from "../../../components/general/modal";
import Pagination from "../../../components/general/pagination";
import DataTable from "../../../components/general/dataTable";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";
import "../../../style/settings/general/currenciesSection.css";
import Loading from "../../../components/general/loading"; 

const CurrenciesSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [currencies, setCurrencies] = useState([]);
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

  const processedCurrencies = useMemo(() => {

    let result = currencies;

    // 🔎 FILTRO
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter((c) => (
        c.code?.toLowerCase().includes(term) ||
        c.name?.toLowerCase().includes(term) ||
        c.symbol?.toLowerCase().includes(term)
      ));
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

  }, [currencies, searchTerm, sortConfig]);

  const [form, setForm] = useState({
    code: "",
    name: "",
    symbol: "",
    isDefault: false,
    isActive: true
  });

  const loadCurrencies = async () => {
    if (!companyId) return;

    const data = await getCurrencies(companyId);
    const sorted = data.sort((a, b) => b.isDefault - a.isDefault);

    setCurrencies(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadCurrencies();
  }, [companyId]);

  /* =========================
     RESET PAGINACIÓN
  ========================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, searchTerm]);

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      symbol: "",
      isDefault: false,
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code || !form.name || !form.symbol) return;

    if (editingId) {
      await updateCurrency(companyId, editingId, form, user);
      notifySuccess("Moneda actualizada", "Los cambios fueron guardados.");
    } else {
      await createCurrency(companyId, form, user);
      notifySuccess("Moneda creada", "La moneda fue creada correctamente.");
    }

    resetForm();
    loadCurrencies();
  };

  const handleEdit = (currency) => {
    setForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isDefault: currency.isDefault,
      isActive: currency.isActive
    });
    setEditingId(currency.id);
    setShowForm(true);
  };

  /* ================= RENDER ================= */

  if (loading) return <Loading />;

  return (
    <div className="currencies-container">
    <div className="currencies-header">

      {/* IZQUIERDA */}
      <div className="currencies-header-left">
        <h3>Monedas</h3>
        <p>Administra los tipos de moneda de la empresa.</p>
      </div>

      {/* DERECHA */}
      <div className="currencies-header-right">

        <input
          type="text"
          className="search-input"
          placeholder="Buscar moneda..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // importante para UX
          }}
        />

        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Agregar Moneda
        </button>

      </div>

    </div>

      {showForm && (
        <Modal onClose={resetForm}>

          <div className="app-modal-header">
            <h4>
              {editingId ? "Editar Moneda" : "Nueva Moneda"}
            </h4>
            <button className="close-btn" onClick={resetForm}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Código (ej: CRC, USD)</label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </div>

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
              <label>Símbolo</label>
              <input
                value={form.symbol}
                onChange={(e) =>
                  setForm({ ...form, symbol: e.target.value })
                }
              />
            </div>

            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                />
                Establecer como predeterminada
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
                Activa
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


      {currencies.length === 0 ? (
        <p>No hay monedas creadas.</p>
      ) : (
        <DataTable
          data={processedCurrencies}
          rowsPerPage={rowsPerPage}
          columns={[
            { key: "code", label: "Código", sortable: true },
            { key: "name", label: "Nombre", sortable: true },
            { key: "symbol", label: "Símbolo", sortable: true },
            { key: "isDefault", label: "Predeterminada", sortable: true },
            { key: "isActive", label: "Estado", sortable: true },
            { key: "actions", label: "Acciones", sortable: false },
          ]}
          renderRow={(currency) => (
            <>
              <td>{currency.code}</td>
              <td>{currency.name}</td>
              <td>{currency.symbol}</td>

              <td>
                {currency.isDefault && (
                  <span className="badge-default">⭐ Sí</span>
                )}
              </td>

              <td>
                <span
                  className={
                    currency.isActive
                      ? "badge-active"
                      : "badge-inactive"
                  }
                >
                  {currency.isActive ? "Activa" : "Inactiva"}
                </span>
              </td>

              <td>
                <button
                  className="btn-link"
                  onClick={() => handleEdit(currency)}
                >
                  Editar
                </button>

                <button
                  className="btn-link"
                  onClick={async () => {
                    try {
                      await toggleCurrencyStatus(
                        companyId,
                        currency.id,
                        currency.isActive
                      );

                      notifySuccess(
                        "Moneda actualizada",
                        "Los cambios fueron guardados."
                      );

                      loadCurrencies();

                    } catch (error) {
                      notifyError(
                        "Error",
                        "Debe existir al menos una moneda activa"
                      );
                    }
                  }}
                >
                  {currency.isActive ? "Desactivar" : "Activar"}
                </button>
              </td>
            </>
          )}
        />
      )}

    </div>
  );
};

export default CurrenciesSection;
