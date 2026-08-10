import React from "react";

export default function ClientCreateModal({

  show,

  onClose,

  clientData,

  onChange,

  onSave

}) {

  if (!show) return null;

  return (

    <div className="client-modal-overlay">

      <div className="client-modal">

        <div className="client-modal-header">

          <h3>Nuevo cliente</h3>

          <button
            className="client-modal-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className="client-modal-body">

          <div className="form-group">

            <label>Nombre *</label>

            <input
              name="name"
              placeholder="Ej: María González"
              value={clientData.name}
              onChange={onChange}
            />

          </div>

          <div className="form-group">

            <label>Email</label>

            <input
              name="email"
              placeholder="correo@ejemplo.com"
              value={clientData.email}
              onChange={onChange}
            />

          </div>

          <div className="form-group">

            <label>Teléfono</label>

            <input
              name="phone"
              placeholder="+506 8888 8888"
              value={clientData.phone}
              onChange={onChange}
            />

          </div>

          <div className="form-group">

            <label>Notas</label>

            <textarea
              name="notes"
              rows="3"
              placeholder="Información adicional del cliente..."
              value={clientData.notes}
              onChange={onChange}
            />

          </div>

        </div>

        <div className="client-modal-footer">

          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="btn-primary"
            onClick={onSave}
          >
            Guardar cliente
          </button>

        </div>

      </div>

    </div>

  );

}