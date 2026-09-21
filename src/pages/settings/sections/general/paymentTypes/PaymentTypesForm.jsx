import {
  useEffect,
  useState
} from "react";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";


/* ======================================================
   EMPTY FORM
====================================================== */

const EMPTY_FORM = {
  name: "",
  description: "",
  isActive: true
};


/* ======================================================
   HELPERS
====================================================== */

const buildInitialForm = (
  paymentType
) => {

  if (!paymentType) {

    return {
      ...EMPTY_FORM
    };

  }


  return {

    name:
      paymentType.name || "",

    description:
      paymentType.description || "",

    isActive:
      paymentType.isActive ?? true

  };

};


/* ======================================================
   VALIDATION
====================================================== */

const validateForm = (
  formData
) => {

  const errors = {};


  const name =
    formData.name.trim();


  if (!name) {

    errors.name =
      "El nombre es obligatorio.";

  }


  return errors;

};


/* ======================================================
   NORMALIZATION
====================================================== */

const normalizeFormData = (
  formData
) => {

  return {

    name:
      formData.name
        .trim()
        .replace(/\s+/g, " "),

    description:
      formData.description
        .trim()
        .replace(/\s+/g, " "),

    isActive:
      formData.isActive

  };

};


/* ======================================================
   COMPONENT
====================================================== */

const PaymentTypesForm = ({
  paymentType = null,
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
    () => buildInitialForm(
      paymentType
    )
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
    !!paymentType;


  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    setFormData(
      buildInitialForm(
        paymentType
      )
    );

    setErrors({});

  }, [paymentType]);


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

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (loading) {
      return;
    }


    const validationErrors =
      validateForm(
        formData
      );


    if (
      Object.keys(
        validationErrors
      ).length > 0
    ) {

      setErrors(
        validationErrors
      );

      return;

    }


    try {

      setLoading(true);


      const normalizedData =
        normalizeFormData(
          formData
        );


      await onSave(
        normalizedData
      );

    } catch (error) {

      /*
       * El Section maneja la notificación.
       * Aquí solamente registramos el error
       * y dejamos que finally termine loading.
       */

      console.error(
        "Error saving payment type:",
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
                  ? "Editar tipo de pago"
                  : "Nuevo tipo de pago"
              }

            </h2>


            <p>

              {
                isEditing
                  ? "Actualiza la información del tipo de pago."
                  : "Completa la información para registrar un nuevo tipo de pago."
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

          <section className="catalog-form-section">

            <h3>
              Información general
            </h3>


            <div className="catalog-form-grid catalog-form-grid-2">

              {/* ==========================================
                  NAME
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="payment-type-name">

                  Nombre{" "}

                  <span>*</span>

                </label>


                <input
                  id="payment-type-name"
                  type="text"
                  value={formData.name}
                  placeholder="Nombre del tipo de pago"
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
                  DESCRIPTION
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="payment-type-description">
                  Descripción
                </label>


                <input
                  id="payment-type-description"
                  type="text"
                  value={
                    formData.description
                  }
                  placeholder="Descripción del tipo de pago"
                  onChange={(event) =>
                    handleChange(
                      "description",
                      event.target.value
                    )
                  }
                  disabled={loading}
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

              <label htmlFor="payment-type-active">

                <input
                  id="payment-type-active"
                  type="checkbox"
                  checked={
                    formData.isActive
                  }
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


export default PaymentTypesForm;