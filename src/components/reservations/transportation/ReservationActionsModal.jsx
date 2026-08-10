/**
 * ==========================================================
 * RESERVATION ACTIONS MODAL
 * ==========================================================
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Select from "react-select";

import {
  toPng
} from "html-to-image";

import jsPDF from "jspdf";

import Modal from "../../general/modal";

import HiddenTemplateRenderer
  from "../../signs/HiddenTemplateRenderer";

import Loading
  from "../../general/loading";

import {
  getSignTemplates
} from "../../../services/sign/signTemplatesService";

import "../../../style/transportation/reservationActionsModal.css";


/**
 * ==========================================================
 * FORMAT OPTIONS
 * ==========================================================
 */

const formatOptions = [

  {
    value: "png",

    label: "Imagen PNG"
  },

  {
    value: "pdf",

    label: "Documento PDF"
  }

];


/**
 * ==========================================================
 * SELECT STYLES
 * ==========================================================
 */

const customSelectStyles = {

  control: (
    base,
    state
  ) => ({

    ...base,

    minHeight: 48,

    borderRadius: 12,

    borderColor:
      state.isFocused
        ? "#2563eb"
        : "#dbe3ed",

    boxShadow:
      state.isFocused
        ? "0 0 0 3px rgba(37, 99, 235, 0.08)"
        : "none",

    backgroundColor: "#ffffff",

    transition:
      "all 0.2s ease",

    "&:hover": {

      borderColor: "#2563eb"

    }

  }),


  valueContainer: (
    base
  ) => ({

    ...base,

    padding:
      "0 12px"

  }),


  placeholder: (
    base
  ) => ({

    ...base,

    color: "#64748b",

    fontSize: "0.88rem"

  }),


  singleValue: (
    base
  ) => ({

    ...base,

    color: "#0f172a",

    fontWeight: 500,

    fontSize: "0.88rem"

  }),


  indicatorSeparator: () => ({

    display: "none"

  }),


  menu: (
    base
  ) => ({

    ...base,

    zIndex: 99999,

    borderRadius: 12,

    overflow: "hidden",

    border:
      "1px solid #e2e8f0",

    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.12)"

  }),


  option: (
    base,
    state
  ) => ({

    ...base,

    backgroundColor:
      state.isFocused
        ? "#f1f5f9"
        : "#ffffff",

    color: "#0f172a",

    cursor: "pointer",

    padding:
      "11px 14px",

    fontSize: "0.88rem"

  })

};


/**
 * ==========================================================
 * COMPONENT
 * ==========================================================
 */

export default function ReservationActionsModal({

  isOpen,

  onClose,

  companyId,

  reservation,

  user

}) {


  /**
   * ========================================================
   * NAVIGATION STATE
   * ========================================================
   */

  const [
    activeAction,
    setActiveAction
  ] = useState("export");


  /**
   * ========================================================
   * EXPORT STATE
   * ========================================================
   */

  const [
    templates,
    setTemplates
  ] = useState([]);


  const [
    selectedTemplate,
    setSelectedTemplate
  ] = useState(null);


  const [
    selectedFormat,
    setSelectedFormat
  ] = useState(
    formatOptions[0]
  );


  const [
    isExporting,
    setIsExporting
  ] = useState(false);


  const [
    loadingTemplates,
    setLoadingTemplates
  ] = useState(false);


  const exportRef =
    useRef(null);


  /**
   * ========================================================
   * COMMUNICATION STATE
   * ========================================================
   */

  const [
    communicationLanguage,
    setCommunicationLanguage
  ] = useState("en");


  /**
   * ========================================================
   * LOAD TEMPLATES
   * ========================================================
   */

  useEffect(() => {

    if (!isOpen) {

      return;

    }

    loadTemplates();

  }, [

    isOpen,

    companyId

  ]);


  /**
   * ========================================================
   * LOAD TEMPLATES FUNCTION
   * ========================================================
   */

  async function loadTemplates() {

    if (!companyId) {

      setTemplates([]);

      return;

    }

    try {

      setLoadingTemplates(true);

      const data =
        await getSignTemplates(
          companyId
        );

      setTemplates(
        data || []
      );

    }

    catch (error) {

      console.error(
        "ERROR LOADING SIGN TEMPLATES:",
        error
      );

      setTemplates([]);

    }

    finally {

      setLoadingTemplates(false);

    }

  }


  /**
   * ========================================================
   * TEMPLATE OPTIONS
   * ========================================================
   */

  const templateOptions =

    useMemo(

      () => {

        return templates.map(

          (
            template
          ) => ({

            value:
              template,

            label:
              template.name

          })

        );

      },

      [
        templates
      ]

    );


  /**
   * ========================================================
   * RESET
   * ========================================================
   */

  useEffect(() => {

    if (!isOpen) {

      setActiveAction(
        "export"
      );

      setSelectedTemplate(
        null
      );

      setSelectedFormat(
        formatOptions[0]
      );

      setCommunicationLanguage(
        "en"
      );

      setIsExporting(
        false
      );

    }

  }, [

    isOpen

  ]);


  /**
   * ========================================================
   * CLOSE
   * ========================================================
   */

  function handleClose() {

    setActiveAction(
      "export"
    );

    setSelectedTemplate(
      null
    );

    setSelectedFormat(
      formatOptions[0]
    );

    setCommunicationLanguage(
      "en"
    );

    setIsExporting(
      false
    );

    onClose();

  }


  /**
   * ========================================================
   * EXPORT
   * ========================================================
   */

  async function handleExport() {

    try {

      /*
      ======================================================
      VALIDATION
      ======================================================
      */

      if (!selectedTemplate) {

        return;

      }

      if (!exportRef.current) {

        return;

      }


      /*
      ======================================================
      EXPORTING
      ======================================================
      */

      setIsExporting(
        true
      );


      /*
      ======================================================
      GENERATE IMAGE
      ======================================================
      */

      const dataUrl =

        await toPng(

          exportRef.current,

          {

            cacheBust: true,

            pixelRatio: 2

          }

        );


      /*
      ======================================================
      PNG
      ======================================================
      */

      if (

        selectedFormat.value ===
        "png"

      ) {

        const link =
          document.createElement(
            "a"
          );


        link.download =

          `${
            reservation?.reservationNumber ||
            "template"
          }.png`;


        link.href =
          dataUrl;


        link.click();

      }


      /*
      ======================================================
      PDF
      ======================================================
      */

      if (

        selectedFormat.value ===
        "pdf"

      ) {

        /*
        ====================================================
        TEMPLATE SIZE
        ====================================================
        */

        const canvasWidth =

          selectedTemplate
            ?.canvas
            ?.width ||
          900;


        const canvasHeight =

          selectedTemplate
            ?.canvas
            ?.height ||
          1400;


        /*
        ====================================================
        ORIENTATION
        ====================================================
        */

        const orientation =

          canvasWidth >
          canvasHeight

            ? "landscape"

            : "portrait";


        /*
        ====================================================
        CREATE PDF
        ====================================================
        */

        const pdf =

          new jsPDF({

            orientation,

            unit: "px",

            format: [

              canvasWidth,

              canvasHeight

            ]

          });


        /*
        ====================================================
        ADD IMAGE
        ====================================================
        */

        pdf.addImage(

          dataUrl,

          "PNG",

          0,

          0,

          canvasWidth,

          canvasHeight

        );


        /*
        ====================================================
        FILE NAME
        ====================================================
        */

        const fileName =

          `${
            reservation?.reservationNumber ||
            "template"
          }.pdf`;


        /*
        ====================================================
        SAVE
        ====================================================
        */

        pdf.save(
          fileName
        );

      }

    }

    catch (error) {

      console.error(
        "EXPORT ERROR:",
        error
      );

    }

    finally {

      setIsExporting(
        false
      );

    }

  }


  /**
   * ========================================================
   * RESERVATION DATA
   * ========================================================
   */

  const reservationNumber =

    reservation?.reservationNumber ||
    reservation?.id ||
    "—";


  const clientName =

    reservation?.clientName ||
    "—";


  const clientEmail =

    reservation?.clientEmail ||
    "—";


  const serviceName =

    reservation?.serviceTypeName ||
    reservation?.service ||
    "—";


  const locationFrom =

    reservation?.locationFromName ||
    "—";


  const locationTo =

    reservation?.locationToName ||
    "—";


  const routeLabel =

    `${locationFrom} → ${locationTo}`;


  const total =

    reservation?.total !== undefined &&
    reservation?.total !== null

      ? reservation.total

      : null;


  const currency =

    reservation?.currency ||
    "";


  const symbol =

    reservation?.symbol ||
    "";


  /**
   * ========================================================
   * GUARD
   * ========================================================
   */

  if (

    !isOpen ||
    !reservation

  ) {

    return null;

  }


  /**
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (

    <Modal

      onClose={handleClose}

      size="xl"

    >

      <div className="reservation-actions-container">


        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="reservation-actions-header">

          <div>

            <h2>

              Acciones de reserva

            </h2>


            <div className="reservation-actions-header-meta">

              <span>

                {reservationNumber}

              </span>


              <span className="reservation-actions-header-separator">

                ·

              </span>


              <span>

                {clientName}

              </span>


              <span className="reservation-actions-header-separator">

                ·

              </span>


              <span>

                {routeLabel}

              </span>

            </div>

          </div>


          <button

            type="button"

            className="reservation-actions-close"

            onClick={handleClose}

            aria-label="Cerrar"

          >

            ×

          </button>

        </header>


        {/* ==================================================
            BODY
        ================================================== */}

        <div className="reservation-actions-body">


          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <aside className="reservation-actions-navigation">


            <div className="reservation-actions-navigation-title">

              ACCIONES

            </div>


            {/* ==============================================
                EXPORT
            ============================================== */}

            <button

              type="button"

              className={

                `reservation-actions-navigation-item ${
                  activeAction === "export"
                    ? "active"
                    : ""
                }`

              }

              onClick={() =>

                setActiveAction(
                  "export"
                )

              }

            >

              <span className="reservation-actions-navigation-icon">

                ↓

              </span>


              <span className="reservation-actions-navigation-content">

                <strong>

                  Exportar

                </strong>


                <small>

                  Generar documento

                </small>

              </span>

            </button>


            {/* ==============================================
                COMMUNICATION
            ============================================== */}

            <button

              type="button"

              className={

                `reservation-actions-navigation-item ${
                  activeAction === "communication"
                    ? "active"
                    : ""
                }`

              }

              onClick={() =>

                setActiveAction(
                  "communication"
                )

              }

            >

              <span className="reservation-actions-navigation-icon">

                @

              </span>


              <span className="reservation-actions-navigation-content">

                <strong>

                  Comunicación

                </strong>


                <small>

                  Enviar al cliente

                </small>

              </span>

            </button>

          </aside>


          {/* ==================================================
              MAIN
          ================================================== */}

          <main className="reservation-actions-main">


            {/* ==================================================
                EXPORT
            ================================================== */}

            {activeAction === "export" && (

              <section className="reservation-actions-panel">


                {/* ============================================
                    PANEL HEADER
                ============================================ */}

                <div className="reservation-actions-panel-header">

                  <div>

                    <h3>

                      Exportar reserva

                    </h3>


                    <p>

                      Genera un documento utilizando
                      los datos de la reserva seleccionada.

                    </p>

                  </div>

                </div>


                {/* ============================================
                    EXPORT FORM
                ============================================ */}

                <div className="reservation-actions-export-form">


                  {/* ==========================================
                      TEMPLATE
                  ========================================== */}

                  <div className="reservation-actions-form-group">

                    <label>

                      Plantilla

                    </label>


                    <Select

                      options={
                        templateOptions
                      }

                      value={

                        templateOptions.find(

                          (
                            option
                          ) =>

                            option.value?.id ===
                            selectedTemplate?.id

                        ) || null

                      }

                      onChange={

                        (
                          selected
                        ) =>

                          setSelectedTemplate(

                            selected?.value ||
                            null

                          )

                      }

                      placeholder="Seleccionar plantilla..."

                      isLoading={
                        loadingTemplates
                      }

                      isDisabled={
                        loadingTemplates ||
                        isExporting
                      }

                      styles={
                        customSelectStyles
                      }

                      isClearable

                    />

                  </div>


                  {/* ==========================================
                      FORMAT
                  ========================================== */}

                  <div className="reservation-actions-form-group">

                    <label>

                      Formato

                    </label>


                    <Select

                      options={
                        formatOptions
                      }

                      value={
                        selectedFormat
                      }

                      onChange={

                        (
                          selected
                        ) =>

                          setSelectedFormat(
                            selected
                          )

                      }

                      styles={
                        customSelectStyles
                      }

                      isDisabled={
                        isExporting
                      }

                      isSearchable={false}

                    />

                  </div>


                </div>


                {/* ============================================
                    RESERVATION PREVIEW
                ============================================ */}

                <div className="reservation-actions-reservation-card">

                  <div className="reservation-actions-reservation-card-title">

                    RESERVACIÓN SELECCIONADA

                  </div>


                  <div className="reservation-actions-reservation-grid">


                    <div>

                      <span>

                        Cliente

                      </span>


                      <strong>

                        {clientName}

                      </strong>

                    </div>


                    <div>

                      <span>

                        Servicio

                      </span>


                      <strong>

                        {serviceName}

                      </strong>

                    </div>


                    <div>

                      <span>

                        Ruta

                      </span>


                      <strong>

                        {routeLabel}

                      </strong>

                    </div>


                    <div>

                      <span>

                        Booking ID

                      </span>


                      <strong>

                        {reservationNumber}

                      </strong>

                    </div>


                  </div>

                </div>


                {/* ============================================
                    FOOTER
                ============================================ */}

                <div className="reservation-actions-panel-footer">

                  <button

                    type="button"

                    className="reservation-actions-secondary-btn"

                    onClick={handleClose}

                    disabled={isExporting}

                  >

                    Cancelar

                  </button>


                  <button

                    type="button"

                    className="reservation-actions-primary-btn"

                    onClick={handleExport}

                    disabled={

                      !selectedTemplate ||
                      isExporting

                    }

                  >

                    {isExporting ? (

                      <Loading />

                    ) : (

                      "Exportar"

                    )}

                  </button>

                </div>

              </section>

            )}


            {/* ==================================================
                COMMUNICATION
            ================================================== */}

            {activeAction === "communication" && (

              <section className="reservation-actions-panel">


                {/* ============================================
                    PANEL HEADER
                ============================================ */}

                <div className="reservation-actions-panel-header">

                  <div>

                    <h3>

                      Comunicación

                    </h3>


                    <p>

                      Envía información de la reserva
                      directamente al cliente.

                    </p>

                  </div>

                </div>


                {/* ============================================
                    RECIPIENT
                ============================================ */}

                <div className="reservation-actions-email-card">

                  <div className="reservation-actions-email-card-header">

                    <span>

                      CLIENTE

                    </span>

                  </div>


                  <div className="reservation-actions-email-recipient">

                    <span className="reservation-actions-email-icon">

                      @

                    </span>


                    <div>

                      <strong>

                        {clientName}

                      </strong>


                      <span>

                        {clientEmail}

                      </span>

                    </div>

                  </div>

                </div>


                {/* ============================================
                    LANGUAGE
                ============================================ */}

                <div className="reservation-actions-form-group">

                  <div>

                    <label>

                      Idioma del correo

                    </label>


                    <p className="reservation-actions-field-description">

                      Selecciona el idioma en el que el cliente
                      recibirá la confirmación.

                    </p>

                  </div>


                  <div className="reservation-actions-language-options">


                    {/* ========================================
                        ENGLISH
                    ======================================== */}

                    <button

                      type="button"

                      className={

                        `reservation-actions-language-option ${
                          communicationLanguage === "en"
                            ? "active"
                            : ""
                        }`

                      }

                      onClick={() =>

                        setCommunicationLanguage(
                          "en"
                        )

                      }

                    >

                      <span className="reservation-actions-language-code">

                        EN

                      </span>


                      <span>

                        <strong>

                          English

                        </strong>


                        <small>

                          Confirmation in English

                        </small>

                      </span>

                    </button>


                    {/* ========================================
                        SPANISH
                    ======================================== */}

                    <button

                      type="button"

                      className={

                        `reservation-actions-language-option ${
                          communicationLanguage === "es"
                            ? "active"
                            : ""
                        }`

                      }

                      onClick={() =>

                        setCommunicationLanguage(
                          "es"
                        )

                      }

                    >

                      <span className="reservation-actions-language-code">

                        ES

                      </span>


                      <span>

                        <strong>

                          Español

                        </strong>


                        <small>

                          Confirmación en español

                        </small>

                      </span>

                    </button>

                  </div>

                </div>


                {/* ============================================
                    COMMUNICATION TYPE
                ============================================ */}

                <div className="reservation-actions-communication-list">

                  <div className="reservation-actions-communication-item">

                    <span className="reservation-actions-communication-icon">

                      ✓

                    </span>


                    <div className="reservation-actions-communication-content">

                      <strong>

                        Confirmación de reserva

                      </strong>


                      <p>

                        Envía al cliente los detalles principales
                        de su reserva.

                      </p>

                    </div>

                  </div>

                </div>


                {/* ============================================
                    CONFIRMATION SUMMARY
                ============================================ */}

                <div className="reservation-actions-confirmation-summary">


                  <div>

                    <span>

                      Booking ID

                    </span>


                    <strong>

                      {reservationNumber}

                    </strong>

                  </div>


                  <div>

                    <span>

                      Servicio

                    </span>


                    <strong>

                      {serviceName}

                    </strong>

                  </div>


                  <div>

                    <span>

                      Ruta

                    </span>


                    <strong>

                      {routeLabel}

                    </strong>

                  </div>


                  <div>

                    <span>

                      Total

                    </span>


                    <strong>

                      {total !== null

                        ? `${symbol} ${Number(total).toFixed(2)} ${currency}`

                        : "—"

                      }

                    </strong>

                  </div>


                </div>


                {/* ============================================
                    FOOTER
                ============================================ */}

                <div className="reservation-actions-panel-footer">

                  <button

                    type="button"

                    className="reservation-actions-secondary-btn"

                    onClick={handleClose}

                  >

                    Cancelar

                  </button>


                  <button

                    type="button"

                    className="reservation-actions-primary-btn"

                    disabled={!clientEmail}

                  >

                    Enviar confirmación

                  </button>

                </div>

              </section>

            )}

          </main>

        </div>


        {/* ==================================================
            HIDDEN EXPORT RENDERER
        ================================================== */}

        <HiddenTemplateRenderer

          ref={exportRef}

          template={
            selectedTemplate
          }

          reservation={
            reservation
          }

        />

      </div>

    </Modal>

  );

}