import {
  useEffect,
  useMemo,
  useState
} from "react";

import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";


const EMPTY_FORM = {
  name: "",
  type: "percentage",
  value: "",
  currency: "",
  expirationDate: "",
  isActive: true
};


const TYPE_OPTIONS = [
  {
    value: "percentage",
    label: "Porcentaje (%)"
  },
  {
    value: "fixed",
    label: "Monto fijo"
  }
];


/* ======================================================
   BUILD INITIAL FORM
====================================================== */

const buildInitialForm = (discount) => {

  if (!discount) {

    return {
      ...EMPTY_FORM
    };

  }


  return {

    name:
      discount.name || "",

    type:
      discount.type || "percentage",

    value:
      discount.value ?? "",

    currency:
      discount.currency || "",

    expirationDate:
      discount.expirationDate
        ?.toDate?.()
        ?.toISOString()
        .split("T")[0] || "",

    isActive:
      discount.isActive !== false

  };

};


/* ======================================================
   NORMALIZATION
====================================================== */

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


  if (!formData.name.trim()) {

    errors.name =
      "El nombre es obligatorio.";

  }


  if (!formData.type) {

    errors.type =
      "El tipo de descuento es obligatorio.";

  }


  if (
    formData.value === "" ||
    formData.value === null ||
    Number.isNaN(
      Number(formData.value)
    )
  ) {

    errors.value =
      "El valor es obligatorio.";

  } else if (
    Number(formData.value) <= 0
  ) {

    errors.value =
      "El valor debe ser mayor que cero.";

  }


  if (
    formData.type === "percentage" &&
    Number(formData.value) > 100
  ) {

    errors.value =
      "El porcentaje no puede ser mayor que 100.";

  }


  if (
    formData.type === "fixed" &&
    !formData.currency
  ) {

    errors.currency =
      "La moneda es obligatoria para descuentos fijos.";

  }


  return errors;

};


/* ======================================================
   COMPONENT
====================================================== */

const DiscountsForm = ({
  discount = null,
  currencies = [],
  onClose,
  onSave
}) => {

  const isEditing =
    !!discount;


  /* ======================================================
     STATE
  ====================================================== */

  const [
    formData,
    setFormData
  ] = useState(
    () => buildInitialForm(discount)
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
     CURRENCY OPTIONS
  ====================================================== */

  const currencyOptions =
    useMemo(() => {

      return currencies.map(
        (currency) => ({
          value: currency.code,
          label:
            `${currency.name} (${currency.symbol})`
        })
      );

    }, [currencies]);


  /* ======================================================
     SYNC FORM
  ====================================================== */

  useEffect(() => {

    setFormData(
      buildInitialForm(discount)
    );

    setErrors({});

  }, [discount]);


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
     TYPE CHANGE
  ====================================================== */

  const handleTypeChange = (
    selectedOption
  ) => {

    const type =
      selectedOption?.value || "";


    setFormData(
      (previous) => ({
        ...previous,
        type,

        currency:
          type === "fixed"
            ? previous.currency
            : ""
      })
    );


    setErrors(
      (previous) => ({
        ...previous,
        type: undefined,
        currency: undefined
      })
    );

  };


  /* ======================================================
     CURRENCY CHANGE
  ====================================================== */

  const handleCurrencyChange = (
    selectedOption
  ) => {

    setFormData(
      (previous) => ({
        ...previous,
        currency:
          selectedOption?.value || ""
      })
    );


    setErrors(
      (previous) => ({
        ...previous,
        currency: undefined
      })
    );

  };


  /* ======================================================
     SUBMIT
  ====================================================== */

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

      setErrors(
        validationErrors
      );

      return;

    }


    const normalizedData = {

      name:
        normalizeText(
          formData.name
        ),

      type:
        formData.type,

      value:
        Number(
          formData.value
        ),

      currency:
        formData.type === "fixed"
          ? formData.currency
          : "",

      expirationDate:
        formData.expirationDate || "",

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
        "Error saving discount:",
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
                ? "Editar descuento"
                : "Nuevo descuento"}

            </h2>


            <p>

              {isEditing
                ? "Actualiza la información del descuento."
                : "Agrega un nuevo descuento al sistema."}

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
                  NAME
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="discount-name">

                  Nombre{" "}

                  <span>*</span>

                </label>


                <input
                  id="discount-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre del descuento"
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
                  TYPE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="discount-type">

                  Tipo{" "}

                  <span>*</span>

                </label>


                <Select
                  inputId="discount-type"
                  className="catalog-select"
                  classNamePrefix="catalog-select"
                  options={TYPE_OPTIONS}
                  value={
                    TYPE_OPTIONS.find(
                      (option) =>
                        option.value ===
                        formData.type
                    ) || null
                  }
                  onChange={
                    handleTypeChange
                  }
                  placeholder="Seleccionar tipo"
                  isSearchable={false}
                  isClearable={false}
                  isDisabled={loading}
                  menuPosition="fixed"
                  aria-invalid={
                    !!errors.type
                  }
                />


                {errors.type && (

                  <small>
                    {errors.type}
                  </small>

                )}

              </div>


              {/* ==========================================
                  VALUE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="discount-value">

                  Valor{" "}

                  <span>*</span>

                </label>


                <input
                  id="discount-value"
                  name="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder={
                    formData.type ===
                    "percentage"
                      ? "Ej. 10"
                      : "Ej. 5000"
                  }
                  disabled={loading}
                  aria-invalid={
                    !!errors.value
                  }
                />


                {errors.value && (

                  <small>
                    {errors.value}
                  </small>

                )}

              </div>


              {/* ==========================================
                  CURRENCY
              ========================================== */}

              {formData.type === "fixed" && (

                <div className="catalog-form-group">

                  <label htmlFor="discount-currency">

                    Moneda{" "}

                    <span>*</span>

                  </label>


                  <Select
                    inputId="discount-currency"
                    className="catalog-select"
                    classNamePrefix="catalog-select"
                    options={currencyOptions}
                    value={
                      currencyOptions.find(
                        (option) =>
                          option.value ===
                          formData.currency
                      ) || null
                    }
                    onChange={
                      handleCurrencyChange
                    }
                    placeholder="Seleccionar moneda"
                    isClearable
                    isDisabled={loading}
                    menuPosition="fixed"
                    aria-invalid={
                      !!errors.currency
                    }
                  />


                  {errors.currency && (

                    <small>
                      {errors.currency}
                    </small>

                  )}

                </div>

              )}


              {/* ==========================================
                  EXPIRATION DATE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="discount-expiration">

                  Fecha de expiración

                  <span className="catalog-form-label-optional">
                    {" "} (opcional)
                  </span>

                </label>


                <input
                  id="discount-expiration"
                  name="expirationDate"
                  type="date"
                  value={
                    formData.expirationDate
                  }
                  onChange={handleChange}
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

              <label htmlFor="discount-active">

                <input
                  id="discount-active"
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={handleChange}
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


export default DiscountsForm;