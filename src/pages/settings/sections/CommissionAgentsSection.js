import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import {
  getCommissionAgents,
  createCommissionAgent,
  updateCommissionAgent,
  toggleCommissionAgentStatus
} from "../../../services/settings/general/agentsService";
import Loading from "../../../components/general/loading";

import { UserAuth } from "../../../context/AuthContext";
import Modal from "../../../components/general/modal";
import DataTable from "../../../components/general/dataTable";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/general/staffSection.css"; // puedes reutilizar

const CommissionAgentsSection = () => {

  const { user, adminData } = UserAuth();
  const companyId = adminData?.companyId;

  const [agents, setAgents] = useState([]);
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* =========================
    PROCESAMIENTO
  ========================== */

  const processedAgents = useMemo(() => {

    let result = agents;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter((a) =>
        a.name?.toLowerCase().includes(term) ||
        a.phone?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term) ||
        a.type?.toLowerCase().includes(term)
      );
    }

    result = [...result].sort((a, b) => {

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === "boolean") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;

  }, [agents, searchTerm, sortConfig]);

  /* =========================
     FORM (🔥 AJUSTADO)
  ========================== */

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "person",
    commissionType: "percentage", // 🔥 NUEVO
    commissionValue: 0,           // 🔥 NUEVO
    isActive: true
  });

  /* =========================
     OPTIONS
  ========================== */

  const typeOptions = [
    { value: "person", label: "Persona" },
    { value: "agency", label: "Agencia" }
  ];

  const commissionTypeOptions = [
    { value: "percentage", label: "Porcentaje (%)" },
    { value: "fixed", label: "Monto fijo" }
  ];

  /* =========================
     LOAD
  ========================== */

  const loadAgents = async () => {
    if (!companyId) return;

    const data = await getCommissionAgents(companyId);
    setAgents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAgents();
  }, [companyId]);

  /* =========================
     RESET
  ========================== */

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      type: "person",
      commissionType: "percentage",
      commissionValue: 0,
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  /* =========================
     SUBMIT (🔥 AJUSTADO)
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      notifyError("El nombre es obligatorio.");
      return;
    }

    if (!form.commissionValue || form.commissionValue <= 0) {
      notifyError("El valor de comisión debe ser mayor a 0.");
      return;
    }

    try {

      const payload = {
        ...form,
        commissionType: form.commissionType,
        commissionValue: Number(form.commissionValue)
      };

      if (editingId) {
        await updateCommissionAgent(companyId, editingId, payload, user);
        notifySuccess("Comisionista actualizado");
      } else {
        await createCommissionAgent(companyId, payload, user);
        notifySuccess("Comisionista creado");
      }

      resetForm();
      loadAgents();

    } catch (error) {
      notifyError(error.message || "Error inesperado.");
    }
  };

  /* =========================
     EDIT (🔥 AJUSTADO)
  ========================== */

  const handleEdit = (agent) => {
    setForm({
      ...agent,
      commissionType: agent.commissionType || "percentage",
      commissionValue: agent.commissionValue || 0
    });
    setEditingId(agent.id);
    setShowForm(true);
  };

  /* =========================
     TOGGLE
  ========================== */

  const handleToggle = async (agent) => {

    const confirmed = await notifyConfirm(
      `¿Deseas ${agent.isActive ? "desactivar" : "activar"} este comisionista?`
    );

    if (!confirmed) return;

    try {
      await toggleCommissionAgentStatus(companyId, agent.id, agent.isActive);
      notifySuccess("Estado actualizado");
      loadAgents();
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

        {/* HEADER */}
        <div className="staff-header">

        <div className="staff-header-left">
            <h3>Comisionistas</h3>
            <p>Administra las personas o empresas que reciben comisión.</p>
        </div>

        <div className="staff-header-right">

            <input
            type="text"
            className="search-input"
            placeholder="Buscar comisionista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
            >
            + Agregar comisionista
            </button>

        </div>

        </div>

        {/* MODAL */}
        {showForm && (
        <Modal onClose={resetForm}>

            <div className="app-modal-header">
            <h4>{editingId ? "Editar comisionista" : "Nuevo comisionista"}</h4>
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
                <label>Tipo</label>
                <Select
                options={typeOptions}
                value={typeOptions.find(o => o.value === form.type)}
                onChange={(opt) =>
                    setForm({ ...form, type: opt.value })
                }
                isSearchable={false}
                />
            </div>

            {/* 🔥 NUEVO: TIPO DE COMISIÓN */}
            <div className="form-group">
                <label>Tipo de comisión</label>
                <Select
                options={[
                    { value: "percentage", label: "Porcentaje (%)" },
                    { value: "fixed", label: "Monto fijo" }
                ]}
                value={{
                    value: form.commissionType,
                    label:
                    form.commissionType === "percentage"
                        ? "Porcentaje (%)"
                        : "Monto fijo"
                }}
                onChange={(opt) =>
                    setForm({ ...form, commissionType: opt.value })
                }
                isSearchable={false}
                />
            </div>

            {/* 🔥 NUEVO: VALOR */}
            <div className="form-group">
                <label>Valor de comisión</label>
                <input
                type="number"
                value={form.commissionValue}
                onChange={(e) =>
                    setForm({
                    ...form,
                    commissionValue: Number(e.target.value)
                    })
                }
                placeholder={
                    form.commissionType === "percentage"
                    ? "Ej: 10 (%)"
                    : "Ej: 5000"
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

        {/* TABLA */}
        <div className="staff-table-wrapper">

        <DataTable
            data={processedAgents}
            rowsPerPage={rowsPerPage}
            columns={[
            { key: "name", label: "Nombre", sortable: true },
            { key: "phone", label: "Teléfono", sortable: true },
            { key: "email", label: "Email", sortable: true },
            { key: "type", label: "Tipo", sortable: true },
            { key: "commission", label: "Comisión", sortable: false }, // 🔥 NUEVO
            { key: "isActive", label: "Estado", sortable: true },
            { key: "actions", label: "Acciones", sortable: false },
            ]}
            renderRow={(agent) => (
            <>
                <td>{agent.name}</td>
                <td>{agent.phone}</td>
                <td>{agent.email}</td>
                <td>{agent.type === "agency" ? "Agencia" : "Persona"}</td>

                {/* 🔥 NUEVO: VISUAL DE COMISIÓN */}
                <td>
                {agent.commissionType === "percentage"
                    ? `${agent.commissionValue || 0}%`
                    : `$${agent.commissionValue || 0}`}
                </td>

                <td>
                <span className={agent.isActive ? "badge-active" : "badge-inactive"}>
                    {agent.isActive ? "Activo" : "Inactivo"}
                </span>
                </td>

                <td>
                <button className="btn-link" onClick={() => handleEdit(agent)}>
                    Editar
                </button>

                <button className="btn-link" onClick={() => handleToggle(agent)}>
                    {agent.isActive ? "Desactivar" : "Activar"}
                </button>
                </td>
            </>
            )}
        />

        </div>

    </div>
    );
};

export default CommissionAgentsSection;