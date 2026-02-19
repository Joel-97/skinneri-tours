import React, { useState, useEffect } from "react";
import { createClient, updateClient } from "../../services/clients/clientService";
import { UserAuth } from "../../context/AuthContext";
import { notifySuccess, notifyError } from "../../services/notificationService";

export default function ClientCreateModal({ 
  isOpen,
  onClose,
  onClientCreated,
  client = null,
  mode = "create"
}) {

  const { user, companyId } = UserAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && client) {
      setForm({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.type === "company" ? client.name : "",
        notes: client.notes || ""
      });
    }
  }, [client, mode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    if (!form.name) {
      notifyError("Campo obligatorio", "El nombre del cliente es obligatorio.");
      return;
    }

    if (!companyId) {
      notifyError(
        "Empresa no asignada",
        "No tienes una empresa asignada para crear clientes."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        nationality: "",
        birthday: "",
        tags: [],
        type: form.company ? "company" : "Person",
        status: "active",
        source: "manual",
        notes: form.notes
      };

      if (mode === "create") {
        await createClient(payload, user, companyId);

        notifySuccess(
          "Cliente creado",
          "El cliente fue registrado correctamente."
        );
      } 
      else {
        await updateClient(client.id, payload, user, companyId);

        notifySuccess(
          "Cliente actualizado",
          "Los cambios se guardaron correctamente."
        );
      }

      onClose();
      onClientCreated?.();

    } catch (error) {

      console.error(error);

      switch (error.code) {
        case "duplicate_name":
          notifyError("Nombre duplicado", "Ya existe un cliente con ese nombre.");
          break;

        case "duplicate_email":
          notifyError("Correo duplicado", "Ese correo ya está registrado.");
          break;

        case "duplicate_phone":
          notifyError("Teléfono duplicado", "Ese teléfono ya está registrado.");
          break;

        default:
          notifyError("Error", "Ocurrió un problema al guardar el cliente.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">
              {mode === "create" ? "Nuevo cliente" : "Editar cliente"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Empresa</label>
                <input
                  type="text"
                  name="company"
                  className="form-control"
                  value={form.company}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Notas</label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows="3"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? (mode === "create" ? "Creando..." : "Guardando...")
                : (mode === "create" ? "Crear cliente" : "Guardar cambios")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
