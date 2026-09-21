import {
  useEffect,
  useState
} from "react";

import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import {
  PAYER_TYPES
} from "../../../../../constants/transportation/payerTypes";

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
   HELPERS
====================================================== */

const buildInitialForm = (payer) => {

  if (!payer) {
    return {
      ...EMPTY_FORM
    };
  }

  return {
    name: payer.name || "",
    payerType: payer.payerType || null,
    phone: payer.phone || "",
    email: payer.email || "",
    isActive: payer.isActive ?? true
  };

};


const normalizeFormData = (formData) => {

  return {
    name: formData.name.trim(),

    payerType: formData.payerType
      ? {
          value: formData.payerType.value,
          label: formData.payerType.label
        }
      : null,

    phone: formData.phone.trim(),

    email: formData.email
      .trim()
      .toLowerCase(),

    isActive: formData.isActive
  };

};


/* ======================================================
   VALIDATION
====================================================== */

const validateForm = (formData) => {

  const errors = {};

  const name =
    formData.name.trim();

  const email =
    formData.email.trim();


  if (!formData.payerType) {

    errors.payerType =
      "Seleccione un tipo de pagador.";

  }


  if (!name) {

    errors.name =
      "El nombre es obligatorio.";

  }


  if (email) {

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

      errors.email =
        "Ingrese un correo electrónico válido.";

    }

  }


  return errors;

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

  const [
    formData,
    setFormData
  ] = useState(
    () => buildInitialForm(payer)
  );


  const [
    errors,
    setErrors
  ] = useState({});


  const [
    loading,
    setLoading
  ] = useState(false);


  const isEditing =
    !!payer;


  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    setFormData(
      buildInitialForm(payer)
    );

    setErrors({});

  }, [payer]);


  /* ======================================================
     HANDLE CHANGE
  ====================================================== */

  const handleChange = (
    field,
    value
  ) => {

    setFormData(
      (previous) => ({
        ...previous,
        [field]: value
      })
    );


    if (errors[field]) {

      setErrors(
        (previous) => {

          const nextErrors = {
            ...previous
          };

          delete nextErrors[field];

          return nextErrors;

        }
      );

    }

  };


  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (loading) {
      return;
    }


    const validationErrors =
      validateForm(formData);


    if (
      Object.keys(validationErrors).length > 0
    ) {

      setErrors(
        validationErrors
      );

      return;

    }


    try {

      setLoading(true);

      const normalizedData =
        normalizeFormData(formData);


      await onSave(
        normalizedData
      );

    } catch (error) {

      /*
       * El Section maneja la notificación
       * del error. Aquí únicamente dejamos
       * que el estado de loading termine.
       */

      console.error(
        "Error saving payer:",
        error
      );

    } finally {

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
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>


        {/* ==================================================
            BODY
        ================================================== */}

        <div className="catalog-form-body">

          {/* ==================================================
              GENERAL INFORMATION
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Información general
            </h3>


            <div className="catalog-form-grid catalog-form-grid-2">

              {/* ==========================================
                  PAYER TYPE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="payer-type">

                  Tipo de pagador{" "}

                  <span>*</span>

                </label>


                <Select
                  inputId="payer-type"
                  className="catalog-select"
                  classNamePrefix="catalog-select"
                  options={PAYER_TYPES}
                  value={formData.payerType}
                  onChange={(option) =>
                    handleChange(
                      "payerType",
                      option
                    )
                  }
                  placeholder="Seleccione un tipo"
                  isClearable
                  isDisabled={loading}
                  menuPosition="fixed"
                  aria-invalid={
                    !!errors.payerType
                  }
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

                <label htmlFor="payer-name">

                  Nombre{" "}

                  <span>*</span>

                </label>


                <input
                  id="payer-name"
                  type="text"
                  value={formData.name}
                  placeholder="Nombre del pagador"
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  aria-invalid={
                    !!errors.name
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

                <label htmlFor="payer-phone">
                  Teléfono
                </label>


                <input
                  id="payer-phone"
                  type="tel"
                  value={formData.phone}
                  placeholder="Ej. +506 8888-8888"
                  onChange={(event) =>
                    handleChange(
                      "phone",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>


              {/* ==========================================
                  EMAIL
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="payer-email">
                  Email
                </label>


                <input
                  id="payer-email"
                  type="email"
                  value={formData.email}
                  placeholder="correo@empresa.com"
                  onChange={(event) =>
                    handleChange(
                      "email",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  aria-invalid={
                    !!errors.email
                  }
                />


                {
                  errors.email && (

                    <small>
                      {errors.email}
                    </small>

                  )
                }

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

              <label htmlFor="payer-active">

                <input
                  id="payer-active"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    handleChange(
                      "isActive",
                      event.target.checked
                    )
                  }
                  disabled={loading}
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