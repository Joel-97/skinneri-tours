import React, { useEffect, useMemo, useRef, useState, } from "react";
import Select from "react-select";
import { toPng } from "html-to-image";

import { getSignTemplates, } from "../../../services/sign/signTemplatesService";
import HiddenTemplateRenderer from "../../signs/HiddenTemplateRenderer";
import Loading from "../../../components/general/loading";
import "../../../style/transportation/exportTemplateModal.css";

const formatOptions = [
  {
    value: "png",
    label: "PNG Image",
  },

  {
    value: "pdf",
    label: "PDF Document",
  },
];

const customSelectStyles = {

  control: (base, state) => ({
    ...base,

    minHeight: 54,

    borderRadius: 14,

    borderColor: state.isFocused
      ? "#2563eb"
      : "#cbd5e1",

    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(37, 99, 235, 0.08)"
      : "none",

    transition: "all 0.2s ease",

    "&:hover": {
      borderColor: "#2563eb",
    },
  }),

  valueContainer: (base) => ({
    ...base,

    padding: "0 14px",
  }),

  placeholder: (base) => ({
    ...base,

    color: "#64748b",

    fontSize: "0.95rem",
  }),

  singleValue: (base) => ({
    ...base,

    color: "#0f172a",

    fontWeight: 500,
  }),

  menu: (base) => ({
    ...base,

    zIndex: 99999,

    borderRadius: 14,

    overflow: "hidden",

    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.12)",
  }),

  option: (base, state) => ({
    ...base,

    backgroundColor:
      state.isFocused
        ? "#eff6ff"
        : "#ffffff",

    color: "#0f172a",

    cursor: "pointer",

    padding: "12px 16px",

    fontSize: "0.95rem",
  }),
};

const ExportTemplateModal = ({
  isOpen,
  onClose,
  companyId,
  reservation,
}) => {

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] =  useState(formatOptions[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] =  useState(false);
  const exportRef = useRef(null);

  /* -------------------------------------------------- */
  /* LOAD TEMPLATES */
  /* -------------------------------------------------- */

  useEffect(() => {

    if (!isOpen) return;

    loadTemplates();

  }, [isOpen]);

  const loadTemplates =
    async () => {

    try {

      setLoading(true);

      const data =
        await getSignTemplates(
          companyId
        );

      setTemplates(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /* TEMPLATE OPTIONS */
  /* -------------------------------------------------- */

  const templateOptions =
    useMemo(() => {

      return templates.map(
        (template) => ({
          value: template,
          label: template.name,
        })
      );

    }, [templates]);

  /* -------------------------------------------------- */
  /* EXPORT */
  /* -------------------------------------------------- */

    const handleExport =
        async () => {

        try {

        if (
            !selectedTemplate
        ) {
            return;
        }

        setIsExporting(true);

        const dataUrl =
            await toPng(
            exportRef.current,
            {
                cacheBust: true,
            }
            );

        const link =
            document.createElement(
            "a"
            );

        link.download =
            `${reservation?.reservationNumber || "template"}.png`;

        link.href = dataUrl;

        link.click();

        } catch (error) {

        console.error(error);

        } finally {

        setIsExporting(false);
        }
    };

  /* -------------------------------------------------- */
  /* CLOSE */
  /* -------------------------------------------------- */

  const handleClose = () => {

    setSelectedTemplate(null);

    setSelectedFormat(
      formatOptions[0]
    );

    onClose();
  };

  /* -------------------------------------------------- */
  /* RENDER */
  /* -------------------------------------------------- */

  if (!isOpen) {
    return null;
  }

  return (
    <div className="export-modal-overlay">

      <div className="export-modal">

        {/* HEADER */}
        <div className="export-modal-header">

          <div>

            <h2>
              Exportar plantilla
            </h2>

            <p>
              Genera un documento
              utilizando los datos
              de la reservación.
            </p>

          </div>

          <button
            className="export-modal-close"
            onClick={handleClose}
          >
            ✕
          </button>

        </div>

        {/* CONTENT */}
        <div className="export-modal-content">

          {/* TEMPLATE */}
          <div className="form-group">

            <label>
              Plantilla
            </label>

            <Select
              options={
                templateOptions
              }

              value={
                templateOptions.find(
                  (option) =>
                    option.value?.id ===
                    selectedTemplate?.id
                ) || null
              }

              onChange={(selected) =>
                setSelectedTemplate(
                  selected?.value
                )
              }

              placeholder="Seleccionar plantilla..."

              isLoading={loading}

              styles={
                customSelectStyles
              }
            />

          </div>

          {/* FORMAT */}
          <div className="form-group">

            <label>
              Formato
            </label>

            <Select
              options={formatOptions}

              value={selectedFormat}

              onChange={
                setSelectedFormat
              }

              styles={
                customSelectStyles
              }
            />

          </div>

          {/* RESERVATION */}
          {reservation && (

            <div className="export-modal-preview">

              <div className="export-modal-preview-title">
                Reservación seleccionada
              </div>

              <div className="export-modal-preview-grid">

                <div>
                  <span>
                    Cliente
                  </span>

                  <strong>
                    {
                      reservation.clientName ||
                      "N/A"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Servicio
                  </span>

                  <strong>
                    {
                      reservation.serviceTypeName ||
                      "N/A"
                    }
                  </strong>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ACTIONS */}
        <div className="export-modal-actions">

          <button
            className="export-modal-cancel-btn"

            onClick={handleClose}
          >
            Cancelar
          </button>

            <button
                className="export-modal-export-btn"

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

      </div>

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
  );
};

export default ExportTemplateModal;