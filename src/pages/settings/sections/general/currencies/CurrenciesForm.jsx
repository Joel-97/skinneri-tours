import {
  useEffect,
  useState
} from "react";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";


const EMPTY_FORM = {
  code: "",
  name: "",
  symbol: "",
  isDefault: false,
  isActive: true
};


/* ======================================================
   BUILD INITIAL FORM
====================================================== */

const buildInitialForm = (currency) => {

  if (!currency) {
    return {
      ...EMPTY_FORM
    };
  }

  return {
    code: currency.code || "",
    name: currency.name || "",
    symbol: currency.symbol || "",
    isDefault: currency.isDefault || false,
    isActive: currency.isActive !== false
  };

};


/* ======================================================
   NORMALIZATION
====================================================== */

const normalizeCode = (value = "") => {

  return value
    .trim()
    .toUpperCase();

};


const normalizeText = (value = "") => {

  return value
    .trim()
    .replace(/\s+/g, " ");

};


/* ======================================================
   VALIDATION
====================================================== */

const validateForm = (formData) => {

  const errors = {};


  if (!formData.code.trim()) {

    errors.code =
      "El código es obligatorio.";

  }


  if (!formData.name.trim()) {

    errors.name =
      "El nombre es obligatorio.";

  }


  if (!formData.symbol.trim()) {

    errors.symbol =
      "El símbolo es obligatorio.";

  }


  return errors;

};


/* ======================================================
   COMPONENT
====================================================== */

const CurrencyForm = ({
  currency = null,
  onClose,
  onSave
}) => {

  const isEditing =
    !!currency;


  /* ======================================================
     STATE
  ====================================================== */

  const [
    formData,
    setFormData
  ] = useState(
    () => buildInitialForm(currency)
  );


  const [
    errors,
    setErrors
  ] = useState({});


  const [
    loading,
    setLoading
  ] = useState(false);


  /* ======================================================
     SYNC EDIT DATA
  ====================================================== */

  useEffect(() => {

    setFormData(
      buildInitialForm(currency)
    );

    setErrors({});

  }, [currency]);


  /* ======================================================
     FIELD CHANGE
  ====================================================== */

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          type === "checkbox"
            ? checked
            : value
      })
    );


    setErrors(
      (previous) => ({
        ...previous,
        [name]: undefined
      })
    );

  };


  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (event) => {

    event.preventDefault();


    const validationErrors =
      validateForm(formData);


    if (
      Object.keys(validationErrors)
        .length > 0
    ) {

      setErrors(
        validationErrors
      );

      return;

    }


    const normalizedData = {
      code: normalizeCode(
        formData.code
      ),

      name: normalizeText(
        formData.name
      ),

      symbol:
        formData.symbol.trim(),

      isDefault:
        !!formData.isDefault,

      isActive:
        !!formData.isActive
    };


    try {

      setLoading(true);

      await onSave(
        normalizedData
      );

    } catch (error) {

      console.error(
        "Error saving currency:",
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

              {isEditing
                ? "Editar moneda"
                : "Nueva moneda"}

            </h2>


            <p>

              {isEditing
                ? "Actualiza la información de la moneda."
                : "Agrega una nueva moneda para la empresa."}

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
              Información de la moneda
            </h3>


            <div className="catalog-form-grid catalog-form-grid-2">

              {/* ==========================================
                  CODE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="currency-code">

                  Código{" "}

                  <span>*</span>

                </label>


                <input
                  id="currency-code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ej. CRC, USD"
                  maxLength={10}
                  disabled={loading}
                  aria-invalid={
                    !!errors.code
                  }
                />


                {errors.code && (

                  <small>
                    {errors.code}
                  </small>

                )}

              </div>


              {/* ==========================================
                  NAME
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="currency-name">

                  Nombre{" "}

                  <span>*</span>

                </label>


                <input
                  id="currency-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Colón costarricense"
                  disabled={loading}
                  aria-invalid={
                    !!errors.name
                  }
                />


                {errors.name && (

                  <small>
                    {errors.name}
                  </small>

                )}

              </div>


              {/* ==========================================
                  SYMBOL
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="currency-symbol">

                  Símbolo{" "}

                  <span>*</span>

                </label>


                <input
                  id="currency-symbol"
                  name="symbol"
                  type="text"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="Ej. ₡, $, €"
                  maxLength={10}
                  disabled={loading}
                  aria-invalid={
                    !!errors.symbol
                  }
                />


                {errors.symbol && (

                  <small>
                    {errors.symbol}
                  </small>

                )}

              </div>

            </div>

          </section>


          {/* ==================================================
              DEFAULT CURRENCY
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Configuración
            </h3>


            <div className="catalog-form-checkbox">

              <label htmlFor="currency-default">

                <input
                  id="currency-default"
                  type="checkbox"
                  name="isDefault"
                  checked={
                    formData.isDefault
                  }
                  onChange={handleChange}
                  disabled={loading}
                />

                Establecer como predeterminada

              </label>

            </div>


            <div className="catalog-form-checkbox">

              <label htmlFor="currency-active">

                <input
                  id="currency-active"
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={handleChange}
                  disabled={loading}
                />

                Activa

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


export default CurrencyForm;