import { useEffect, useState } from "react";

import Modal from "../../../../components/general/modal";

import "../../../../style/settings/transportation/catalog/catalogForm.css";


const EMPTY_FORM = {
  code: "",
  name: "",
  isActive: true
};


const normalizeCode = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");


const normalizeCodeInput = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");


const generateCodeFromName = (
  name = ""
) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


const buildInitialForm = (location) => {
  if (!location) {
    return {
      ...EMPTY_FORM
    };
  }

  return {
    code:
      location.code ||
      generateCodeFromName(location.name),

    name:
      location.name || "",

    isActive:
      location.isActive ?? true
  };
};


const validateForm = (formData) => {
  const errors = {};

  if (!formData.code?.trim()) {
    errors.code =
      "El código es obligatorio.";
  }

  if (!formData.name?.trim()) {
    errors.name =
      "El nombre es obligatorio.";
  }

  return errors;
};


const LocationsForm = ({
  location = null,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(location);

  const [formData, setFormData] =
    useState(
      () => buildInitialForm(location)
    );

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);


  useEffect(() => {
    setFormData(
      buildInitialForm(location)
    );

    setErrors({});
  }, [location]);


  const updateField = (
    field,
    value
  ) => {
    setFormData(previous => ({
      ...previous,
      [field]: value
    }));

    setErrors(previous => {
      if (!previous[field]) {
        return previous;
      }

      const next = {
        ...previous
      };

      delete next[field];

      return next;
    });
  };


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationErrors =
      validateForm(formData);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    const finalData = {
      code: normalizeCode(
        formData.code
      ),
      name:
        formData.name.trim(),
      isActive:
        Boolean(formData.isActive)
    };

    try {
      setLoading(true);

      await onSave(finalData);
    } catch (error) {
      console.error(
        "Error saving location:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      size="lg"
      onClose={onClose}
    >
      <form
        className="catalog-form"
        onSubmit={handleSubmit}
      >

        <div className="catalog-form-header">

          <div className="catalog-form-header-left">
            <h2>
              {isEditing
                ? "Editar lugar"
                : "Nuevo lugar"}
            </h2>

            <p>
              Administra los puntos disponibles
              para las reservas.
            </p>
          </div>


          <button
            type="button"
            className="catalog-form-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>


        <div className="catalog-form-body">

          <section className="catalog-form-section">

            <h3>
              Información del lugar
            </h3>


            <div className="catalog-form-grid catalog-form-grid-2">

              <div className="catalog-form-group">

                <label htmlFor="location-code">
                  Código <span>*</span>
                </label>

                <input
                  id="location-code"
                  type="text"
                  value={formData.code}
                  onChange={event =>
                    updateField(
                      "code",
                      normalizeCodeInput(
                        event.target.value
                      )
                    )
                  }
                  placeholder="Ej: aeropuerto-lir"
                  maxLength={50}
                  required
                />

                <small className="catalog-form-help">
                  Identificador público del lugar.
                  Usa letras, números y guiones.
                </small>

                {errors.code && (
                  <small className="catalog-form-error">
                    {errors.code}
                  </small>
                )}

              </div>


              <div className="catalog-form-group">

                <label htmlFor="location-name">
                  Lugar <span>*</span>
                </label>

                <input
                  id="location-name"
                  type="text"
                  value={formData.name}
                  onChange={event =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Ej: Aeropuerto Liberia"
                  maxLength={100}
                  required
                />

                {errors.name && (
                  <small className="catalog-form-error">
                    {errors.name}
                  </small>
                )}

              </div>

            </div>

          </section>


          <section className="catalog-form-section">

            <div className="catalog-form-checkbox">

              <label>

                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={event =>
                    updateField(
                      "isActive",
                      event.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span>
                  Lugar activo
                </span>

              </label>

            </div>

          </section>

        </div>


        <div className="catalog-form-footer">

          <div className="catalog-form-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : isEditing
                  ? "Actualizar"
                  : "Crear"}
            </button>

          </div>

        </div>

      </form>
    </Modal>
  );
};


export default LocationsForm;