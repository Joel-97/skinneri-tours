import React, {
  useEffect,
  useState,
  useMemo
} from "react";

import Select from "react-select";

import {
  getServiceTypes,
  createServiceType,
  updateServiceType,
  toggleServiceTypeStatus
} from "../../../../services/settings/general/serviceTypeService";

import {
  getCurrencies
} from "../../../../services/settings/general/currencyService";

import DataTable from "../../../../components/general/dataTable";

import {
  useAuth
} from "../../../../context/AuthContext";

import Modal from "../../../../components/general/modal";

import Pagination from "../../../../components/general/pagination";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../services/notificationService";

import "../../../../style/settings/transportation/serviceTypesSection.css";

import Loading from "../../../../components/general/loading";


/* ===============================
   COMPONENT
================================= */

const ServiceTypesSection = () => {

  const { session } = useAuth();

  const user = session?.user;

  const companyId = session?.company?.id;


  /* ===============================
     DATA
  ================================= */

  const [serviceTypes, setServiceTypes] =
    useState([]);

  const [currencies, setCurrencies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* ===============================
     FORM STATE
  ================================= */

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);


  /* ===============================
     PAGINATION
  ================================= */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);


  /* ===============================
     SEARCH
  ================================= */

  const [searchTerm, setSearchTerm] =
    useState("");


  /* ===============================
     SORT
  ================================= */

  const [sortConfig, setSortConfig] =
    useState({
      key: "name",
      direction: "asc"
    });


  /* ===============================
     FORM
  ================================= */

  const [form, setForm] =
    useState({

      code: "",

      name: "",

      pricingMode: "fixed",

      pricingType: "per_booking",

      basePrice: "",

      currency: "",

      symbol: "",

      durationValue: "",

      durationUnit: "hours",

      durationMinutes: null,

      color: "#0a2a63",

      staffPayment: {

        enabled: false,

        type: "fixed",

        value: ""

      },

      isActive: true

    });


  /* ===============================
     SORT HANDLER
  ================================= */

  const handleSort = (key) => {

    setSortConfig(prev => ({

      key,

      direction:
        prev.key === key &&
        prev.direction === "asc"

          ? "desc"

          : "asc"

    }));

  };


  /* ===============================
     PROCESSING
     FILTER + SORT
  ================================= */

  const processedServiceTypes =
    useMemo(() => {

      let result =
        serviceTypes;


      /* ===============================
         FILTER
      ================================= */

      if (searchTerm) {

        const term =
          searchTerm
            .toLowerCase()
            .trim();


        result =
          result.filter((type) => (

            type.code
              ?.toLowerCase()
              .includes(term)

            ||

            type.name
              ?.toLowerCase()
              .includes(term)

            ||

            type.pricingMode
              ?.toLowerCase()
              .includes(term)

          ));

      }


      /* ===============================
         SORT
      ================================= */

      result =
        [...result].sort((a, b) => {

          let aValue =
            a[sortConfig.key];

          let bValue =
            b[sortConfig.key];


          /* ===============================
             BOOLEAN
          ================================= */

          if (
            typeof aValue ===
            "boolean"
          ) {

            aValue =
              aValue ? 1 : 0;

            bValue =
              bValue ? 1 : 0;

          }


          /* ===============================
             STRING
          ================================= */

          if (
            typeof aValue ===
            "string"
          ) {

            aValue =
              aValue.toLowerCase();

            bValue =
              bValue.toLowerCase();

          }


          /* ===============================
             NULL SAFETY
          ================================= */

          if (
            aValue == null
          ) {

            aValue = "";

          }

          if (
            bValue == null
          ) {

            bValue = "";

          }


          /* ===============================
             COMPARE
          ================================= */

          if (
            aValue < bValue
          ) {

            return sortConfig.direction ===
              "asc"

              ? -1

              : 1;

          }


          if (
            aValue > bValue
          ) {

            return sortConfig.direction ===
              "asc"

              ? 1

              : -1;

          }


          return 0;

        });


      return result;

    }, [
      serviceTypes,
      searchTerm,
      sortConfig
    ]);


  /* ===============================
     PAGINATION
  ================================= */

  const totalPages =
    Math.ceil(
      processedServiceTypes.length /
      rowsPerPage
    );


  const currentServiceTypes =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        rowsPerPage;


      return processedServiceTypes.slice(
        start,
        start + rowsPerPage
      );

    }, [
      processedServiceTypes,
      currentPage,
      rowsPerPage
    ]);


  /* ===============================
     LOAD DATA
  ================================= */

  const loadData = async () => {

    if (!companyId) {

      return;

    }


    try {

      /*
      ==============================================
      LOAD TRANSPORTATION SERVICES
      ==============================================
      */

      const types =
        await getServiceTypes(
          companyId
        );


      const curr =
        await getCurrencies(
          companyId
        );


      const ordered =
        [...types].sort((a, b) =>
          (a.name || "").localeCompare(
            b.name || ""
          )
        );


      setServiceTypes(
        ordered
      );


      setCurrencies(
        curr.filter(
          c => c.isActive
        )
      );


    } catch (error) {

      notifyError(
        "Error cargando datos",
        error.message
      );

    } finally {

      setLoading(false);

    }

  };


  /* ===============================
     INITIAL LOAD
  ================================= */

  useEffect(() => {

    loadData();

  }, [companyId]);


  /* ===============================
     RESET PAGE
  ================================= */

  useEffect(() => {

    setCurrentPage(1);

  }, [
    rowsPerPage,
    searchTerm
  ]);


  /* ===============================
     GENERATE CODE FROM NAME
  ================================= */

  const generateCodeFromName = (
    name
  ) => {

    if (
      typeof name !==
      "string"
    ) {

      return "";

    }


    return name

      .trim()

      .toLowerCase()

      .replace(
        /[^a-z0-9]+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        "");

  };


  /* ===============================
     NORMALIZE CODE INPUT
  ================================= */

  const normalizeCodeInput = (
    value
  ) => {

    return value

      .toLowerCase()

      .replace(
        /[^a-z0-9-]/g,
        "-"
      )

      .replace(
        /-+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        "");

  };


  /* ===============================
     RESET FORM
  ================================= */

  const resetForm = () => {

    setForm({

      code: "",

      name: "",

      pricingMode:
        "fixed",

      pricingType:
        "per_booking",

      basePrice:
        "",

      currency:
        "",

      symbol:
        "",

      durationValue:
        "",

      durationUnit:
        "minutes",

      durationMinutes:
        null,

      color:
        "#0a2a63",

      staffPayment: {

        enabled:
          false,

        type:
          "fixed",

        value:
          ""

      },

      isActive:
        true

    });


    setEditingId(
      null
    );


    setShowForm(
      false
    );

  };


  /* ===============================
     OPTIONS
  ================================= */

  const pricingOptions = [

    {
      value:
        "fixed",

      label:
        "Precio fijo"

    },

    {
      value:
        "manual",

      label:
        "Precio manual"

    }

  ];


  const currencyOptions =
    currencies.map((c) => ({

      value:
        c.code,

      label:
        `${c.name} (${c.symbol})`,

      symbol:
        c.symbol

    }));


  const durationUnitOptions = [

    {
      value:
        "minutes",

      label:
        "Minutos"

    },

    {
      value:
        "hours",

      label:
        "Horas"

    },

    {
      value:
        "days",

      label:
        "Días"

    }

  ];


  /* ===============================
     SUBMIT
  ================================= */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();


    /* ===============================
       BASIC VALIDATION
    ================================= */

    if (!form.code) {

      return notifyError(
        "Error",
        "Código requerido"
      );

    }


    if (!form.name) {

      return notifyError(
        "Error",
        "Nombre requerido"
      );

    }


    if (!form.durationValue) {

      return notifyError(
        "Error",
        "Duración requerida"
      );

    }


    if (
      form.staffPayment?.enabled &&
      !form.staffPayment.value
    ) {

      return notifyError(
        "Error",
        "Debe ingresar el pago al chofer"
      );

    }


    try {

      /* ===============================
         DURATION
      ================================= */

      let durationMinutes =
        null;


      if (
        form.durationValue
      ) {

        if (
          form.durationUnit ===
          "minutes"
        ) {

          durationMinutes =
            Number(
              form.durationValue
            );

        }

        else if (
          form.durationUnit ===
          "hours"
        ) {

          durationMinutes =
            Number(
              form.durationValue
            ) * 60;

        }

        else {

          durationMinutes =
            Number(
              form.durationValue
            ) * 1440;

        }

      }


      /* ===============================
         FINAL FORM
      ================================= */

      const finalForm = {

        ...form,

        code:
          normalizeCodeInput(
            form.code
          ),

        durationMinutes,

        pricingType:
          form.pricingType ||
          "per_booking"

      };


      /* ===============================
         SAVE
      ================================= */

      if (editingId) {

        await updateServiceType(

          companyId,

          editingId,

          finalForm,

          user

        );


        notifySuccess(
          "Tipo de servicio actualizado"
        );

      }

      else {

        await createServiceType(

          companyId,

          finalForm,

          user

        );


        notifySuccess(
          "Tipo de servicio creado"
        );

      }


      /* ===============================
         RESET + RELOAD
      ================================= */

      resetForm();

      await loadData();


    } catch (error) {

      notifyError(
        "Error",
        error.message
      );

    }

  };


  /* ===============================
     EDIT
  ================================= */

  const handleEdit = (
    type
  ) => {

    let durationValue =
      "";

    let durationUnit =
      "minutes";


    /* ===============================
       DURATION
    ================================= */

    if (
      type.durationMinutes
    ) {

      if (
        type.durationMinutes %
        1440 === 0
      ) {

        durationValue =
          type.durationMinutes /
          1440;

        durationUnit =
          "days";

      }

      else if (
        type.durationMinutes %
        60 === 0
      ) {

        durationValue =
          type.durationMinutes /
          60;

        durationUnit =
          "hours";

      }

      else {

        durationValue =
          type.durationMinutes;

      }

    }


    /* ===============================
       LEGACY CODE
    ================================= */

    const serviceCode =
      type.code ||
      generateCodeFromName(
        type.name
      );


    /* ===============================
       FORM
    ================================= */

    setForm({

      code:
        serviceCode,

      name:
        type.name ||
        "",

      pricingMode:
        type.pricingMode ||
        "fixed",

      pricingType:
        type.pricingType ||
        "per_booking",

      basePrice:
        type.basePrice ??
        "",

      currency:
        type.currency ||
        "",

      symbol:
        type.symbol ||
        "",

      durationValue,

      durationUnit,

      color:
        type.color ||
        "#0a2a63",

      staffPayment: {

        enabled:
          type.staffPayment?.enabled ??
          false,

        type:
          type.staffPayment?.type ||
          "fixed",

        value:
          type.staffPayment?.value !=
          null

            ? String(
                type.staffPayment.value
              )

            : ""

      },

      isActive:
        type.isActive ??
        true

    });


    setEditingId(
      type.id
    );

    setShowForm(
      true
    );

  };


  /* ===============================
     TOGGLE
  ================================= */

  const handleToggle = async (
    type
  ) => {

    const confirmed =
      await notifyConfirm(

        `¿Deseas ${
          type.isActive
            ? "desactivar"
            : "activar"
        } este servicio de transporte?`

      );


    if (!confirmed) {

      return;

    }


    try {

      await toggleServiceTypeStatus(

        companyId,

        type.id,

        type.isActive

      );


      notifySuccess(
        "Estado actualizado"
      );


      await loadData();


    } catch (error) {

      notifyError(
        "Error",
        error.message
      );

    }

  };


  /* ===============================
     PRICING MODE
  ================================= */

  const handlePricingModeChange = (
    selectedOption
  ) => {

    const newMode =
      selectedOption?.value ||
      "";


    setForm(prev => ({

      ...prev,

      pricingMode:
        newMode,

      basePrice:
        ""

    }));

  };


  /* ===============================
     RENDER
  ================================= */

  if (loading) {

    return <Loading />;

  }


  return (

    <div className="serviceTypes-container">


      {/* ===============================
          HEADER
      ================================= */}

      <div className="serviceTypes-header">


        <div className="serviceTypes-header-left">

          <h3>
            Servicios de transporte
          </h3>

          <p>
            Define cómo se calcula el precio de cada servicio de transporte.
          </p>

        </div>


        <div className="serviceTypes-header-right">

          <input

            type="text"

            className="search-input"

            placeholder="Buscar servicio..."

            value={
              searchTerm
            }

            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }

          />


          <button

            className="btn-primary"

            onClick={() =>
              setShowForm(true)
            }

          >

            + Agregar servicio

          </button>

        </div>

      </div>


      {/* ===============================
          FORM MODAL
      ================================= */}

      {showForm && (

        <Modal
          onClose={
            resetForm
          }
        >


          <div className="app-modal-header">

            <h4>

              {
                editingId
                  ? "Editar servicio"
                  : "Nuevo servicio"
              }

            </h4>


            <button

              className="close-btn"

              onClick={
                resetForm
              }

            >

              ✕

            </button>

          </div>


          <form

            onSubmit={
              handleSubmit
            }

            className="modal-form"

          >


            {/* ===============================
                CODE
            ================================= */}

            <div className="form-group">

              <label>
                Código
              </label>


              <input

                type="text"

                value={
                  form.code
                }

                onChange={(e) =>
                  setForm({

                    ...form,

                    code:
                      normalizeCodeInput(
                        e.target.value
                      )

                  })
                }

                placeholder="Ej: viaje-aeropuerto"

                maxLength={50}

                required

              />


              <small>

                Identificador público del servicio. Usa letras, números y guiones.

              </small>

            </div>


            {/* ===============================
                NAME
            ================================= */}

            <div className="form-group">

              <label>
                Nombre
              </label>


              <input

                type="text"

                value={
                  form.name
                }

                onChange={(e) =>
                  setForm({

                    ...form,

                    name:
                      e.target.value

                  })
                }

                required

              />

            </div>


            {/* ===============================
                PRICE MODE + BASE PRICE
            ================================= */}

            <div className="form-row two-columns">


              {/* ===============================
                  PRICING MODE
              ================================= */}

              <div className="form-group">

                <label>
                  Modo de precio
                </label>


                <Select

                  options={
                    pricingOptions
                  }

                  value={

                    pricingOptions.find(
                      option =>
                        option.value ===
                        form.pricingMode
                    ) || null

                  }

                  onChange={
                    handlePricingModeChange
                  }

                  isClearable={
                    false
                  }

                />

              </div>


              {/* ===============================
                  BASE PRICE
              ================================= */}

              {form.pricingMode ===
                "fixed" && (

                <div className="form-group">

                  <label>

                    Precio base{" "}

                    {
                      form.symbol &&
                      `(${form.symbol})`
                    }

                  </label>


                  <input

                    type="number"

                    min="0"

                    step="0.01"

                    value={
                      form.basePrice
                    }

                    onChange={(e) =>
                      setForm({

                        ...form,

                        basePrice:
                          e.target.value ===
                          ""

                            ? ""

                            : Number(
                                e.target.value
                              )

                      })
                    }

                  />

                </div>

              )}

            </div>


            {/* ===============================
                PRICING TYPE
            ================================= */}

            <div className="form-group">

              <label>
                Tipo de precio
              </label>


              <div className="toggle-group">


                <label className="radio-option">

                  <input

                    type="radio"

                    value="per_booking"

                    checked={
                      form.pricingType ===
                      "per_booking"
                    }

                    onChange={(e) =>
                      setForm({

                        ...form,

                        pricingType:
                          e.target.value

                      })
                    }

                  />


                  <span>
                    Por evento
                  </span>

                </label>


                <label className="radio-option">

                  <input

                    type="radio"

                    value="per_person"

                    checked={
                      form.pricingType ===
                      "per_person"
                    }

                    onChange={(e) =>
                      setForm({

                        ...form,

                        pricingType:
                          e.target.value

                      })
                    }

                  />


                  <span>
                    Por persona
                  </span>

                </label>


              </div>

            </div>


            {/* ===============================
                DRIVER PAYMENT
            ================================= */}

            <div className="form-group">


              <div className="section-header">

                <label className="section-title">

                  Pago al chofer

                </label>


                <label className="switch">

                  <input

                    type="checkbox"

                    checked={
                      form.staffPayment?.enabled ||
                      false
                    }

                    onChange={(e) =>
                      setForm({

                        ...form,

                        staffPayment: {

                          ...(form.staffPayment ||
                            {}),

                          enabled:
                            e.target.checked,

                          value:
                            ""

                        }

                      })
                    }

                  />


                  <span className="slider"></span>

                </label>

              </div>


              {form.staffPayment?.enabled && (

                <>

                  <div className="driver-type-toggle">


                    <label className="radio-option">

                      <input

                        type="radio"

                        value="fixed"

                        checked={
                          form.staffPayment?.type ===
                          "fixed"
                        }

                        onChange={(e) =>
                          setForm({

                            ...form,

                            staffPayment: {

                              ...form.staffPayment,

                              type:
                                e.target.value,

                              value:
                                ""

                            }

                          })
                        }

                      />


                      <span>
                        Monto fijo
                      </span>

                    </label>


                    <label className="radio-option">

                      <input

                        type="radio"

                        value="percentage"

                        checked={
                          form.staffPayment?.type ===
                          "percentage"
                        }

                        onChange={(e) =>
                          setForm({

                            ...form,

                            staffPayment: {

                              ...form.staffPayment,

                              type:
                                e.target.value,

                              value:
                                ""

                            }

                          })
                        }

                      />


                      <span>
                        Porcentaje (%)
                      </span>

                    </label>


                  </div>


                  <input

                    type="number"

                    min="0"

                    max={
                      form.staffPayment?.type ===
                      "percentage"

                        ? "100"

                        : undefined
                    }

                    className="modern-input"

                    placeholder={

                      form.staffPayment?.type ===
                      "fixed"

                        ? `Ej: ${
                            form.symbol ||
                            ""
                          } 25`

                        : "Ej: 20 %"

                    }

                    value={
                      form.staffPayment?.value ||
                      ""
                    }

                    onChange={(e) =>
                      setForm({

                        ...form,

                        staffPayment: {

                          ...form.staffPayment,

                          value:
                            e.target.value

                        }

                      })
                    }

                  />

                </>

              )}

            </div>


            {/* ===============================
                CURRENCY + COLOR
            ================================= */}

            <div className="form-row two-columns">


              {/* ===============================
                  CURRENCY
              ================================= */}

              <div className="form-group">

                <label>
                  Moneda
                </label>


                <Select

                  options={
                    currencyOptions
                  }

                  value={

                    currencyOptions.find(
                      option =>
                        option.value ===
                        form.currency
                    ) || null

                  }

                  onChange={(selectedOption) =>
                    setForm({

                      ...form,

                      currency:
                        selectedOption?.value ||
                        "",

                      symbol:
                        selectedOption?.symbol ||
                        ""

                    })
                  }

                />

              </div>


              {/* ===============================
                  COLOR
              ================================= */}

              <div className="form-group">

                <label>
                  Color
                </label>


                <input

                  type="color"

                  value={
                    form.color
                  }

                  onChange={(e) =>
                    setForm({

                      ...form,

                      color:
                        e.target.value

                    })
                  }

                  className="color-input"

                />

              </div>

            </div>


            {/* ===============================
                DURATION
            ================================= */}

            <div className="form-group">

              <label>
                Duración
              </label>


              <div className="duration-row">


                <input

                  type="number"

                  min="0"

                  value={
                    form.durationValue
                  }

                  onChange={(e) =>
                    setForm({

                      ...form,

                      durationValue:
                        e.target.value ===
                        ""

                          ? ""

                          : Number(
                              e.target.value
                            )

                    })
                  }

                />


                <Select

                  options={
                    durationUnitOptions
                  }

                  value={

                    durationUnitOptions.find(
                      option =>
                        option.value ===
                        form.durationUnit
                    ) || null

                  }

                  onChange={(selectedOption) =>
                    setForm({

                      ...form,

                      durationUnit:
                        selectedOption?.value ||
                        "minutes"

                    })
                  }

                  isSearchable={
                    false
                  }

                />

              </div>

            </div>


            {/* ===============================
                ACTIVE
            ================================= */}

            <div className="form-checkbox">

              <label>

                <input

                  type="checkbox"

                  checked={
                    form.isActive
                  }

                  onChange={(e) =>
                    setForm({

                      ...form,

                      isActive:
                        e.target.checked

                    })
                  }

                />


                Activo

              </label>

            </div>


            {/* ===============================
                BUTTONS
            ================================= */}

            <div className="form-actions">


              <button

                type="button"

                className="btn-secondary"

                onClick={
                  resetForm
                }

              >

                Cancelar

              </button>


              <button

                className="btn-primary"

                type="submit"

              >

                {
                  editingId
                    ? "Actualizar"
                    : "Crear"
                }

              </button>


            </div>


          </form>

        </Modal>

      )}


      {/* ===============================
          TABLE
      ================================= */}

      <div className="serviceTypes-content">


        {serviceTypes.length === 0 ? (

          <p>
            No hay servicios de transporte registrados.
          </p>

        ) : (

          <DataTable

            data={
              currentServiceTypes
            }

            rowsPerPage={
              rowsPerPage
            }

            columns={[

              {
                key:
                  "code",

                label:
                  "Código",

                sortable:
                  true

              },

              {
                key:
                  "name",

                label:
                  "Nombre",

                sortable:
                  true

              },

              {
                key:
                  "pricingMode",

                label:
                  "Modo",

                sortable:
                  true

              },

              {
                key:
                  "basePrice",

                label:
                  "Precio",

                sortable:
                  true

              },

              {
                key:
                  "isActive",

                label:
                  "Estado",

                sortable:
                  true

              },

              {
                key:
                  "actions",

                label:
                  "Acciones",

                sortable:
                  false

              }

            ]}


            renderRow={(type) => (

              <>


                {/* ===============================
                    CODE
                ================================= */}

                <td>

                  <span>

                    {
                      type.code ||
                      "—"
                    }

                  </span>

                </td>


                {/* ===============================
                    NAME
                ================================= */}

                <td>

                  <div className="service-name-cell">

                    <span

                      className="color-dot"

                      style={{
                        backgroundColor:
                          type.color ||
                          "#3B82F6"
                      }}

                    />


                    {
                      type.name
                    }

                  </div>

                </td>


                {/* ===============================
                    PRICING MODE
                ================================= */}

                <td>

                  {
                    type.pricingMode ===
                    "fixed"

                      ? "Precio fijo"

                      : "Manual"
                  }

                </td>


                {/* ===============================
                    PRICE
                ================================= */}

                <td>

                  {
                    type.pricingMode ===
                    "fixed"

                      ? `${
                          type.symbol ??
                          ""
                        } ${
                          type.basePrice ??
                          0
                        }`

                      : "-"
                  }

                </td>


                {/* ===============================
                    STATUS
                ================================= */}

                <td>

                  <span

                    className={

                      type.isActive

                        ? "badge-active"

                        : "badge-inactive"

                    }

                  >

                    {
                      type.isActive
                        ? "Activo"
                        : "Inactivo"
                    }

                  </span>

                </td>


                {/* ===============================
                    ACTIONS
                ================================= */}

                <td>

                  <button

                    className="btn-link"

                    onClick={() =>
                      handleEdit(type)
                    }

                  >

                    Editar

                  </button>


                  <button

                    className="btn-link"

                    onClick={() =>
                      handleToggle(type)
                    }

                  >

                    {
                      type.isActive
                        ? "Desactivar"
                        : "Activar"
                    }

                  </button>

                </td>

              </>

            )}

          />

        )}

      </div>

    </div>

  );

};


export default ServiceTypesSection;