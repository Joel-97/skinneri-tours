import { useEffect, useMemo, useState } from "react";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";

const EMPTY_FORM = {

  name: "",

  description: "",

  isActive: true

};

const BookingSourceForm = ({
  bookingSource = null,
  onClose,
  onSave
}) => {

  /* ======================================================
     STATE
  ====================================================== */

  const isEditing = useMemo(
    () => !!bookingSource,
    [bookingSource]
  );

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    if (bookingSource) {

      setFormData({

        name: bookingSource.name || "",

        description: bookingSource.description || "",

        isActive: bookingSource.isActive ?? true

      });

    } else {

      setFormData(EMPTY_FORM);

    }

    setErrors({});

  }, [bookingSource]);

  /* ======================================================
     HANDLE CHANGE
  ====================================================== */

  const handleChange = (field, value) => {

    setFormData(prev => ({

      ...prev,

      [field]: value

    }));

    if (errors[field]) {

      setErrors(prev => ({

        ...prev,

        [field]: null

      }));

    }

  };

  /* ======================================================
     VALIDATION
  ====================================================== */

  const validateForm = () => {

    const newErrors = {};

    if (!formData.name.trim()) {

      newErrors.name =
        "El nombre es obligatorio.";

    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    try {

      setLoading(true);

      await onSave(formData);

    } finally {

      setLoading(false);

    }

  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <Modal
      size="md"
      onClose={onClose}
    >

      <form
        className="catalog-form"
        onSubmit={handleSubmit}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="catalog-form-header">

          <div className="catalog-form-header-left">

            <h2>

              {

                isEditing

                  ? "Editar origen"

                  : "Nuevo origen"

              }

            </h2>

            <p>

              {

                isEditing

                  ? "Actualiza la información del origen de la reserva."

                  : "Completa la información para registrar un nuevo origen de reserva."

              }

            </p>

          </div>

          <button
            type="button"
            className="catalog-form-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <div className="catalog-form-body">

          <section className="catalog-form-section">

            <h3>

              Información general

            </h3>

            <div className="catalog-form-grid catalog-form-grid-1">

              <div className="catalog-form-group">

                <label>

                  Nombre <span>*</span>

                </label>

                <input
                  type="text"
                  value={formData.name}
                  placeholder="Ej. Website"
                  onChange={(e) =>
                    handleChange(
                      "name",
                      e.target.value
                    )
                  }
                />

                {

                  errors.name && (

                    <small>

                      {errors.name}

                    </small>

                  )

                }

              </div>

              <div className="catalog-form-group">

                <label>

                  Descripción

                </label>

                <textarea
                  rows={4}
                  value={formData.description}
                  placeholder="Información adicional sobre este origen..."
                  onChange={(e) =>
                    handleChange(
                      "description",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="catalog-form-checkbox">

                <label>

                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleChange(
                        "isActive",
                        e.target.checked
                      )
                    }
                  />

                  Activo

                </label>

              </div>

            </div>

          </section>

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

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

              {

                loading

                  ? "Guardando..."

                  : isEditing

                    ? "Guardar cambios"

                    : "Guardar"

              }

            </button>

          </div>

        </div>

      </form>

    </Modal>

  );

};

export default BookingSourceForm;