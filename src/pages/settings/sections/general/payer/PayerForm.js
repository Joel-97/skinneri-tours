import { useEffect, useMemo, useState } from "react";

import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import {
  PAYER_TYPES
} from "../../../../../constants/payerTypes";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";

/* ======================================================
   EMPTY FORM
====================================================== */

const EMPTY_FORM = {

  name: "",

  payerType: null,

  phone: "",

  email: "",

  isActive: true

};

/* ======================================================
   COMPONENT
====================================================== */

const PayerForm = ({

  payer = null,

  onClose,

  onSave

}) => {

  /* ======================================================
     STATE
  ====================================================== */

  const isEditing = useMemo(

    () => !!payer,

    [payer]

  );

  const [formData, setFormData] =

    useState(EMPTY_FORM);

  const [errors, setErrors] =

    useState({});

  const [loading, setLoading] =

    useState(false);

  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    if (payer) {

      setFormData({

        name:

          payer.name || "",

        payerType:

          payer.payerType || null,

        phone:

          payer.phone || "",

        email:

          payer.email || "",

        isActive:

          payer.isActive ?? true

      });

    }

    else {

      setFormData(

        EMPTY_FORM

      );

    }

    setErrors({});

  }, [payer]);

  /* ======================================================
     HANDLE CHANGE
  ====================================================== */

  const handleChange = (

    field,

    value

  ) => {

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

    if (!formData.payerType) {

      newErrors.payerType =
        "Seleccione un tipo de pagador.";

    }

    if (!formData.name.trim()) {

      newErrors.name =
        "El nombre es obligatorio.";

    }

    setErrors(newErrors);

    return (

      Object.keys(newErrors).length === 0

    );

  };

  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    try {

      setLoading(true);

      await onSave({

        name:

          formData.name

            .trim(),

        payerType: {

          value:

            formData.payerType.value,

          label:

            formData.payerType.label

        },

        phone:

          formData.phone

            .trim(),

        email:

          formData.email

            .trim()

            .toLowerCase(),

        isActive:

          formData.isActive

      });

    }

    finally {

      setLoading(false);

    }

  };

    /* ======================================================
     RENDER
  ====================================================== */

  return (

    <Modal
      size="lg"
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

                  ? "Editar pagador"

                  : "Nuevo pagador"

              }

            </h2>

            <p>

              {

                isEditing

                  ? "Actualiza la información del pagador."

                  : "Completa la información para registrar un nuevo pagador."

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

            <div className="catalog-form-grid catalog-form-grid-2">

              {/* ==========================================
                  PAYER TYPE
              ========================================== */}

              <div className="catalog-form-group">

                <label>

                  Tipo de pagador <span>*</span>

                </label>

                <Select

                  className="catalog-select"

                  classNamePrefix="catalog-select"

                  options={PAYER_TYPES}

                  value={formData.payerType}

                  onChange={(option)=>

                    handleChange(

                      "payerType",

                      option

                    )

                  }

                  placeholder="Seleccione un tipo"

                  isClearable

                  menuPosition="fixed"

                />

                {

                  errors.payerType && (

                    <small>

                      {errors.payerType}

                    </small>

                  )

                }

              </div>

              {/* ==========================================
                  NAME
              ========================================== */}

              <div className="catalog-form-group">

                <label>

                  Nombre <span>*</span>

                </label>

                <input

                  type="text"

                  value={formData.name}

                  placeholder="Nombre del pagador"

                  onChange={(e)=>

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

              {/* ==========================================
                  PHONE
              ========================================== */}

              <div className="catalog-form-group">

                <label>

                  Teléfono

                </label>

                <input

                  type="text"

                  value={formData.phone}

                  placeholder="Ej. +506 8888-8888"

                  onChange={(e)=>

                    handleChange(

                      "phone",

                      e.target.value

                    )

                  }

                />

              </div>

              {/* ==========================================
                  EMAIL
              ========================================== */}

              <div className="catalog-form-group">

                <label>

                  Email

                </label>

                <input

                  type="email"

                  value={formData.email}

                  placeholder="correo@empresa.com"

                  onChange={(e)=>

                    handleChange(

                      "email",

                      e.target.value

                    )

                  }

                />

              </div>

            </div>

          </section>

          {/* ==================================================
              STATUS
          ================================================== */}

          <section className="catalog-form-section">

            <h3>

              Estado

            </h3>

            <div className="catalog-form-checkbox">

              <label>

                <input

                  type="checkbox"

                  checked={formData.isActive}

                  onChange={(e)=>

                    handleChange(

                      "isActive",

                      e.target.checked

                    )

                  }

                />

                Activo

              </label>

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

export default PayerForm;