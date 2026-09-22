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

import {
  notifyConfirm,
  notifyError,
  notifyWarning
} from "../../../services/notificationService";

import "../../../style/general/transportationModal.css";


export default function TransportationModal({

  isOpen,

  onClose,

  onSave,

  onConfirm,

  reservation,

  mode = "create",

  user,

  companyId

}) {

  const controller =
    useTransportationController({

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


  const {
    data,
    setData,
    hasUnsavedChanges,
    hasDraft
  } = form;


  const {
    handleSubmit,
    clearDraft,
    resetUnsavedChanges
  } = actions;


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


  const {
    showClientModal,
    setShowClientModal,
    showSearchModal,
    setShowSearchModal
  } = modals;


  /*
  ==========================================================
  CLOSE MODAL
  ==========================================================
  */

  const handleClose = async () => {

    /*
    --------------------------------------------------------
    CREATE MODE
    --------------------------------------------------------

    New reservations use the temporary localStorage draft.

    Closing the modal does not delete the draft and does not
    ask for confirmation.

    When the modal is opened again, the controller restores
    the temporary draft automatically.
    --------------------------------------------------------
    */

    if (mode === "create") {

      onClose();

      return;

    }


    /*
    --------------------------------------------------------
    EDIT MODE
    --------------------------------------------------------

    Existing reservations continue to warn the user when
    there are unsaved changes.
    --------------------------------------------------------
    */

    if (hasUnsavedChanges) {

      const shouldClose =
        await notifyConfirm(
          "Cambios sin guardar",
          "Hay cambios pendientes de guardar. ¿Está seguro de que desea salir?"
        );


      if (!shouldClose) {

        return;

      }

    }


    onClose();

  };


  /*
  ==========================================================
  SAVE RESERVATION
  ==========================================================
  */

  const handleSave = async () => {

    /*
    --------------------------------------------------------
    EXECUTE SAVE
    --------------------------------------------------------
    */

    const saved =
      await handleSubmit();


    /*
    --------------------------------------------------------
    CLOSE ONLY AFTER SUCCESSFUL SAVE
    --------------------------------------------------------

    We intentionally call onClose() directly here instead
    of handleClose().

    handleClose() checks for unsaved changes and could show
    the confirmation dialog before React has finished
    updating the dirty state.
    --------------------------------------------------------
    */

    if (saved === true) {

      onClose();

    }

  };


  /*
  ==========================================================
  CONFIRM RESERVATION
  ==========================================================
  */

  const handleConfirm = async () => {

    if (!onConfirm) {
      return;
    }


    /*
    --------------------------------------------------------
    ONLY PENDING RESERVATIONS CAN BE CONFIRMED
    --------------------------------------------------------
    */

    if (data.status !== "pending") {

      await notifyWarning(
        "Reserva no disponible",
        "Solo las reservas pendientes pueden ser confirmadas."
      );

      return;

    }


    /*
    --------------------------------------------------------
    SAVE CHANGES BEFORE CONFIRMING
    --------------------------------------------------------
    */

    if (hasUnsavedChanges) {

      const shouldSave =
        await notifyConfirm(
          "Guardar cambios antes de confirmar",
          "Hay cambios sin guardar. Debe guardar los cambios antes de confirmar la reserva.\n\n¿Desea guardar los cambios?"
        );


      if (!shouldSave) {
        return;
      }


      const saved =
        await handleSubmit();


      if (!saved) {
        return;
      }

    }


    /*
    --------------------------------------------------------
    CONFIRM RESERVATION
    --------------------------------------------------------
    */

    try {

      const result =
        await onConfirm(
          data
        );


      if (result === false) {
        return;
      }


      /*
      ------------------------------------------------------
      UPDATE LOCAL STATUS
      ------------------------------------------------------
      */

      setData(prev => ({

        ...prev,

        status: "confirmed"

      }));


      /*
      ------------------------------------------------------
      RESET DIRTY STATE
      ------------------------------------------------------
      */

      resetUnsavedChanges();

    }

    catch (error) {

      console.error(
        "Error confirmando reserva:",
        error
      );


      await notifyError(
        "Error al confirmar",
        error?.message ||
        "No fue posible confirmar la reserva. Inténtelo nuevamente."
      );

    }

  };


  /*
  ==========================================================
  OVERLAY CLOSE
  ==========================================================
  */

  const handleOverlayMouseDown = (e) => {

    if (
      e.target.classList.contains(
        "modal-overlay"
      )
    ) {

      handleClose();

    }

  };


  /*
  ==========================================================
  MODAL
  ==========================================================
  */

  if (!isOpen) {
    return null;
  }


  return (

    <div

      className="modal-overlay"

      onMouseDown={
        handleOverlayMouseDown
      }

    >

      <div

        className="modal-card modern"

        onMouseDown={(e) =>
          e.stopPropagation()
        }

      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <TransportationHeader

          mode={mode}

          reservationNumber={
            data.reservationNumber
          }

          onClose={handleClose}

          onClear={clearDraft}

          hasDraft={hasDraft}

        />


        {/* ==================================================
            CLIENT
        ================================================== */}

        <ClientSection

          controller={controller}

        />


        {/* ==================================================
            SERVICE
        ================================================== */}

        <ServiceSection

          controller={controller}

        />


        {/* ==================================================
            FINANCIAL
        ================================================== */}

        <FinancialSection

          controller={controller}

        />


        {/* ==================================================
            NOTES
        ================================================== */}

        <NotesSection

          controller={controller}

        />


        {/* ==================================================
            CLIENT SEARCH MODAL
        ================================================== */}

        <ClientSearchModal

          show={showSearchModal}

          onClose={() =>
            setShowSearchModal(false)
          }

          searchTerm={searchTerm}

          setSearchTerm={setSearchTerm}

          isSearching={isSearching}

          searchResults={searchResults}

          onSelectClient={
            handleSelectClient
          }

        />


        {/* ==================================================
            CREATE CLIENT MODAL
        ================================================== */}

        <ClientCreateModal

          show={showClientModal}

          onClose={() =>
            setShowClientModal(false)
          }

          clientData={clientData}

          onChange={handleClientChange}

          onSave={handleCreateClient}

        />


        {/* ==================================================
            FOOTER
        ================================================== */}

        <TransportationFooter

          mode={mode}

          status={data.status}

          onCancel={handleClose}

          onSave={handleSave}

          onConfirm={handleConfirm}

        />

      </div>

    </div>

  );

}