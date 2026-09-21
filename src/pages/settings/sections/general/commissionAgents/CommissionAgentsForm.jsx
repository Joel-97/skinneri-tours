import {
  useEffect,
  useState
} from "react";

import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";


/* ======================================================
   OPTIONS
====================================================== */

const TYPE_OPTIONS = [
  {
    value: "person",
    label: "Persona"
  },
  {
    value: "agency",
    label: "Agencia"
  }
];


const COMMISSION_TYPE_OPTIONS = [
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
   EMPTY FORM
====================================================== */

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  type: "person",
  commissionType: "percentage",
  commissionValue: 0,
  isActive: true
};


/* ======================================================
   HELPERS
====================================================== */

const buildInitialForm = (
  agent
) => {

  if (!agent) {

    return {
      ...EMPTY_FORM
    };

  }


  return {

    name:
      agent.name || "",

    phone:
      agent.phone || "",

    email:
      agent.email || "",

    type:
      agent.type || "person",

    commissionType:
      agent.commissionType ||
      "percentage",

    commissionValue:
      agent.commissionValue ?? 0,

    isActive:
      agent.isActive ?? true

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


  const email =
    formData.email.trim();


  const commissionValue =
    Number(
      formData.commissionValue
    );


  /* ----------------------------------------
     NAME
  ---------------------------------------- */

  if (!name) {

    errors.name =
      "El nombre es obligatorio.";

  }


  /* ----------------------------------------
     TYPE
  ---------------------------------------- */

  if (
    !formData.type
  ) {

    errors.type =
      "Seleccione un tipo.";

  }


  /* ----------------------------------------
     COMMISSION TYPE
  ---------------------------------------- */

  if (
    !formData.commissionType
  ) {

    errors.commissionType =
      "Seleccione un tipo de comisión.";

  }


  /* ----------------------------------------
     COMMISSION VALUE
  ---------------------------------------- */

  if (
    !Number.isFinite(
      commissionValue
    ) ||
    commissionValue <= 0
  ) {

    errors.commissionValue =
      "El valor de comisión debe ser mayor a 0.";

  }


  /* ----------------------------------------
     PERCENTAGE
  ---------------------------------------- */

  if (
    formData.commissionType ===
    "percentage" &&
    commissionValue > 100
  ) {

    errors.commissionValue =
      "El porcentaje no puede ser mayor a 100.";

  }


  /* ----------------------------------------
     EMAIL
  ---------------------------------------- */

  if (email) {

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailRegex.test(email)
    ) {

      errors.email =
        "Ingrese un correo electrónico válido.";

    }

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

    phone:
      formData.phone.trim(),

    email:
      formData.email
        .trim()
        .toLowerCase(),

    type:
      formData.type,

    commissionType:
      formData.commissionType,

    commissionValue:
      Number(
        formData.commissionValue
      ),

    isActive:
      formData.isActive

  };

};


/* ======================================================
   COMPONENT
====================================================== */

const CommissionAgentsForm = ({
  agent = null,
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
    () => buildInitialForm(agent)
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
    !!agent;


  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    setFormData(
      buildInitialForm(agent)
    );

    setErrors({});

  }, [agent]);


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
      validateForm(formData);


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
       * El Section se encarga de mostrar
       * la notificación del error.
       */

      console.error(
        "Error saving commission agent:",
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
                  ? "Editar comisionista"
                  : "Nuevo comisionista"
              }

            </h2>


            <p>

              {
                isEditing
                  ? "Actualiza la información del comisionista."
                  : "Completa la información para registrar un nuevo comisionista."
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
                  NAME
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="commission-agent-name">

                  Nombre{" "}

                  <span>*</span>

                </label>


                <input
                  id="commission-agent-name"
                  type="text"
                  value={formData.name}
                  placeholder="Nombre del comisionista"
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
                  TYPE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="commission-agent-type">

                  Tipo{" "}

                  <span>*</span>

                </label>


                <Select
                  inputId="commission-agent-type"
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
                  onChange={(option) =>
                    handleChange(
                      "type",
                      option?.value || ""
                    )
                  }
                  placeholder="Seleccione un tipo"
                  isSearchable={false}
                  isClearable={false}
                  isDisabled={loading}
                  menuPosition="fixed"
                  aria-invalid={
                    !!errors.type
                  }
                />


                {
                  errors.type && (

                    <small>
                      {errors.type}
                    </small>

                  )
                }

              </div>


              {/* ==========================================
                  PHONE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="commission-agent-phone">
                  Teléfono
                </label>


                <input
                  id="commission-agent-phone"
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

                <label htmlFor="commission-agent-email">
                  Email
                </label>


                <input
                  id="commission-agent-email"
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
              COMMISSION
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Comisión
            </h3>


            <div className="catalog-form-grid catalog-form-grid-2">

              {/* ==========================================
                  COMMISSION TYPE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="commission-type">

                  Tipo de comisión{" "}

                  <span>*</span>

                </label>


                <Select
                  inputId="commission-type"
                  className="catalog-select"
                  classNamePrefix="catalog-select"
                  options={
                    COMMISSION_TYPE_OPTIONS
                  }
                  value={
                    COMMISSION_TYPE_OPTIONS.find(
                      (option) =>
                        option.value ===
                        formData.commissionType
                    ) || null
                  }
                  onChange={(option) =>
                    handleChange(
                      "commissionType",
                      option?.value ||
                        "percentage"
                    )
                  }
                  placeholder="Seleccione un tipo"
                  isSearchable={false}
                  isClearable={false}
                  isDisabled={loading}
                  menuPosition="fixed"
                  aria-invalid={
                    !!errors.commissionType
                  }
                />


                {
                  errors.commissionType && (

                    <small>
                      {errors.commissionType}
                    </small>

                  )
                }

              </div>


              {/* ==========================================
                  COMMISSION VALUE
              ========================================== */}

              <div className="catalog-form-group">

                <label htmlFor="commission-value">

                  Valor de comisión{" "}

                  <span>*</span>

                </label>


                <input
                  id="commission-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formData.commissionValue
                  }
                  placeholder={
                    formData.commissionType ===
                    "percentage"
                      ? "Ej. 10"
                      : "Ej. 5000"
                  }
                  onChange={(event) =>
                    handleChange(
                      "commissionValue",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  aria-invalid={
                    !!errors.commissionValue
                  }
                />


                {
                  errors.commissionValue && (

                    <small>
                      {
                        errors.commissionValue
                      }
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

              <label htmlFor="commission-agent-active">

                <input
                  id="commission-agent-active"
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


export default CommissionAgentsForm;