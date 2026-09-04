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

  onConfirm,

  reservation,

  mode = "create",

  user,

  companyId

}) {


  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

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


  /*
  ==========================================================
  FORM
  ==========================================================
  */

  const {

    data,

    setData,

    hasUnsavedChanges

  } = form;


  const {

    handleSubmit,

    resetUnsavedChanges

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


  /*
  ==========================================================
  CLOSE CONFIRMATION
  ==========================================================
  */

  const handleClose = () => {

    /*
    --------------------------------------------------------
    CREATE MODE
    --------------------------------------------------------
    */

    if (mode === "create") {

      if (hasUnsavedChanges) {

        const shouldClose =
          window.confirm(

            "Hay cambios sin guardar. ¿Desea salir sin guardar los cambios?"

          );


        if (!shouldClose) {

          return;

        }

      }


      onClose();

      return;

    }


    /*
    --------------------------------------------------------
    EDIT MODE
    --------------------------------------------------------
    */

    if (hasUnsavedChanges) {

      const shouldClose =
        window.confirm(

          "Hay cambios sin guardar. ¿Desea salir sin guardar los cambios?"

        );


      if (!shouldClose) {

        return;

      }

    }


    onClose();

  };


  /*
  ==========================================================
  CONFIRM RESERVATION
  ==========================================================
  */

  const handleConfirm = async () => {

    /*
    --------------------------------------------------------
    CONFIRMATION FUNCTION REQUIRED
    --------------------------------------------------------
    */

    if (!onConfirm) {

      return;

    }


    /*
    --------------------------------------------------------
    ONLY PENDING RESERVATIONS CAN BE CONFIRMED
    --------------------------------------------------------
    */

    if (data.status !== "pending") {

      return;

    }


    /*
    --------------------------------------------------------
    IF THERE ARE UNSAVED CHANGES
    --------------------------------------------------------
    */

    if (hasUnsavedChanges) {

      const shouldSave =
        window.confirm(

          "Hay cambios sin guardar. Debe guardar los cambios antes de confirmar la reserva.\n\n¿Desea guardar los cambios?"

        );


      /*
      ------------------------------------------------------
      USER CHOSE NOT TO SAVE
      ------------------------------------------------------
      */

      if (!shouldSave) {

        return;

      }


      /*
      ------------------------------------------------------
      SAVE FIRST
      ------------------------------------------------------
      */

      const saved =
        await handleSubmit();


      /*
      ------------------------------------------------------
      SAVE FAILED
      ------------------------------------------------------

      IMPORTANT:
      Do not continue to confirmation if the save failed.
      ------------------------------------------------------
      */

      if (!saved) {

        return;

      }

    }


    /*
    --------------------------------------------------------
    CONFIRM
    --------------------------------------------------------
    */

    try {

      const result =
        await onConfirm(

          data

        );


      /*
      ------------------------------------------------------
      CONFIRMATION FAILED
      ------------------------------------------------------

      The parent handler returns false when the backend
      confirmation did not succeed.
      ------------------------------------------------------
      */

      if (result === false) {

        return;

      }


      /*
      ------------------------------------------------------
      UPDATE LOCAL FORM STATE
      ------------------------------------------------------

      The backend has now changed:

          pending -> confirmed

      Keep the modal synchronized with that state.
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

      Confirmation is now the new clean state.
      ------------------------------------------------------
      */

      resetUnsavedChanges();

    }

    catch (error) {

      console.error(

        "Error confirmando reserva:",

        error

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


  /*
  ==========================================================
  UI
  ==========================================================
  */

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

        />


        {/* ==================================================
            CLIENTE
        ================================================== */}

        <ClientSection

          controller={controller}

        />


        {/* ==================================================
            SERVICIO
        ================================================== */}

        <ServiceSection

          controller={controller}

        />


        {/* ==================================================
            FINANZAS
        ================================================== */}

        <FinancialSection

          controller={controller}

        />


        {/* ==================================================
            NOTAS
        ================================================== */}

        <NotesSection

          controller={controller}

        />


        {/* ==================================================
            BUSCAR CLIENTE MODAL
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
            CREAR CLIENTE MODAL
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

          onSave={handleSubmit}

          onConfirm={handleConfirm}

        />


      </div>

    </div>

  );

}