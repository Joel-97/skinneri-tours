import { useEffect, useState } from "react";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";


const EMPTY_FORM = {
  name: "",
  description: "",
  isActive: true
};


const buildInitialForm = (bookingSource) => {
  if (!bookingSource) {
    return {
      ...EMPTY_FORM
    };
  }

  return {
    name:
      bookingSource.name || "",

    description:
      bookingSource.description || "",

    isActive:
      bookingSource.isActive ?? true
  };
};


const validateForm = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name =
      "El nombre es obligatorio.";
  }

  return errors;
};


const BookingSourceForm = ({
  bookingSource = null,
  onClose,
  onSave
}) => {
  const isEditing =
    Boolean(bookingSource);

  const [formData, setFormData] =
    useState(
      () => buildInitialForm(
        bookingSource
      )
    );

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);


  useEffect(() => {
    setFormData(
      buildInitialForm(
        bookingSource
      )
    );

    setErrors({});
  }, [bookingSource]);


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
      name:
        formData.name.trim(),

      description:
        formData.description?.trim() || "",

      isActive:
        Boolean(formData.isActive)
    };

    try {
      setLoading(true);

      await onSave(finalData);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      size="md"
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
                ? "Editar origen"
                : "Nuevo origen"}
            </h2>

            <p>
              {isEditing
                ? "Actualiza la información del origen de la reserva."
                : "Completa la información para registrar un nuevo origen de reserva."}
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
              Información general
            </h3>


            <div className="catalog-form-grid catalog-form-grid-1">

              <div className="catalog-form-group">

                <label htmlFor="booking-source-name">
                  Nombre <span>*</span>
                </label>

                <input
                  id="booking-source-name"
                  type="text"
                  value={formData.name}
                  placeholder="Ej. Website"
                  maxLength={100}
                  onChange={event =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  required
                />

                {errors.name && (
                  <small className="catalog-form-error">
                    {errors.name}
                  </small>
                )}

              </div>


              <div className="catalog-form-group">

                <label htmlFor="booking-source-description">
                  Descripción
                </label>

                <textarea
                  id="booking-source-description"
                  rows={4}
                  value={
                    formData.description
                  }
                  placeholder="Información adicional sobre este origen..."
                  maxLength={500}
                  onChange={event =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="catalog-form-checkbox">

                <label>

                  <input
                    type="checkbox"
                    checked={
                      formData.isActive
                    }
                    onChange={event =>
                      updateField(
                        "isActive",
                        event.target.checked
                      )
                    }
                    disabled={loading}
                  />

                  <span>
                    Activo
                  </span>

                </label>

              </div>

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
                  ? "Guardar cambios"
                  : "Guardar"}
            </button>

          </div>

        </div>

      </form>

    </Modal>
  );
};


export default BookingSourceForm;