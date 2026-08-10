import React from "react";

import useTransportationController from "./useTransportationController";

import ClientSearchModal from "../transportation/components/modals/ClientSearchModal";
import ClientCreateModal from "../transportation/components/modals/ClientCreateModal";
import ClientSection from "../transportation/components/sections/ClientSection";

import TransportationHeader from "../transportation/components/TransportationHeader";
import TransportationFooter from "../transportation/components/TransportationFooter";

import ServiceSection from "../transportation/components/sections/ServiceSection";
import FinancialSection from "../transportation/components/sections/FinancialSection";
import NotesSection from "../transportation/components/sections/NotesSection";

import "../../../style/general/transportationModal.css";

export default function TransportationModal({
  isOpen,
  onClose,
  onSave,
  reservation,
  mode = "create",
  user,
  companyId
}) {


  /* =======================
     SETTINGS
  ======================== */

  const controller = useTransportationController({

      companyId,

      reservation,

      mode,

      user,

      onSave

  });

  const {

      form,

      clients,

      modals,

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

  const {

    handleSubmit

  } = actions;

  /*
  ==========================================================
  CLIENTS
  ==========================================================
  */

  const {

    clientData,

    searchTerm,

    setSearchTerm,

    searchResults,

    isSearching,

    handleSelectClient,

    handleClientChange,

    handleCreateClient

  } = clients;

  /*
  ==========================================================
  MODALS
  ==========================================================
  */

  const {

      showClientModal,

      setShowClientModal,

      showSearchModal,

      setShowSearchModal

  } = modals;


  if (!isOpen) return null;
  
  /* ================= UI ================= */

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target.classList.contains("modal-overlay")) {
          onClose();
        }
      }}
    >
      <div
        className="modal-card modern"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <TransportationHeader
            mode={mode}
            reservationNumber={data.reservationNumber}
            onClose={onClose}
        />

        {/* ================= SISTEMA ================= */}


        {/* CLIENTE */}
        <ClientSection controller={controller} />

        {/* SERVICIO */}
        <ServiceSection controller={controller} />

        {/* FINANZAS */}
        <FinancialSection controller={controller} />

        {/* NOTAS */}
        <NotesSection controller={controller} />



        {/* ================= BUSCAR CLIENTE MODAL ================= */}
        <ClientSearchModal
          show={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearching={isSearching}
          searchResults={searchResults}
          onSelectClient={handleSelectClient}
        />

        {/* ================= CREAR CLIENTE MODAL ================= */}
        <ClientCreateModal
            show={showClientModal}
            onClose={() => setShowClientModal(false)}
            clientData={clientData}
            onChange={handleClientChange}
            onSave={handleCreateClient}
        />


        {/* FOOTER */}
        <TransportationFooter
            mode={mode}
            onCancel={onClose}
            onSave={handleSubmit}
        />

      </div>
    </div>
  );
}
