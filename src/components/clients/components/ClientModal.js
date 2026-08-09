import React from "react";

import useClientController from "../controllers/useClientController";

import ClientHeader from "./ClientHeader";
import ClientFooter from "./ClientFooter";

import ClientGeneralSection from "./sections/ClientGeneralSection";
import ClientCompanySection from "../components/sections/ClientCompanySection";
import ClientNotesSection from "../components/sections/ClientNotesSection";

import "../../../style/clients/clientModal.css";

export default function ClientModal({

  isOpen,

  onClose,

  onSave,

  client,

  mode = "create",

  user,

  companyId

}) {

  /*
  ==========================================================
  SETTINGS
  ==========================================================
  */

  const controller = useClientController({

    companyId,

    client,

    mode,

    user,

    onSave

  });

  const {

    form,

    actions

  } = controller;

  /*
  ==========================================================
  FORM
  ==========================================================
  */

  const {

    data

  } = form;

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const {

    handleSubmit

  } = actions;

  if (!isOpen) return null;

  /*
  ==========================================================
  UI
  ==========================================================
  */

  return (

    <div
      className="client-modal-overlay"
      onMouseDown={(e) => {

        if (e.target.classList.contains("client-modal-overlay")) {

          onClose();

        }

      }}
    >

      <div
        className="client-modal-card client-modal-modern"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <ClientHeader

          mode={mode}

          client={data}

          onClose={onClose}

        />

        {/* ======================================================
            GENERAL
        ====================================================== */}

        <ClientGeneralSection

          controller={controller}

        />

        {/* ======================================================
            COMPANY
        ====================================================== */}

        <ClientCompanySection

          controller={controller}

        />

        {/* ======================================================
            NOTES
        ====================================================== */}

        <ClientNotesSection

          controller={controller}

        />

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <ClientFooter

          mode={mode}

          onCancel={onClose}

          onSave={handleSubmit}

        />

      </div>

    </div>

  );

}