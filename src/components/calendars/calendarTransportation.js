import React from "react";
import useTransportationCalendar from "./TransportationCalendar/useTransportationCalendar";

import CalendarView from "./TransportationCalendar/components/CalendarView";

import TransportationModal from "../reservations/transportation/transportationModal";

import Loading from "../general/loading";


const CalendarTransportations = ({ companyId, user }) => {

  const {

    calendar,

    modal

  } = useTransportationCalendar({

    companyId,

    user

  });

  const {

    events,

    loading

  } = calendar;

  const {

    modalOpen,

    modalMode,

    selectedReservation,

    handleCloseModal,

    handleSelectEvent,

    handleSelectSlot,

    handleSave

  } = modal;


  /* =========================
     UI
  ========================== */

  return (
    <div style={{ height: "80vh", position: "relative" }}>

      {loading && (
        <div className="calendar-loading">
          <Loading />
        </div>
      )}

      <CalendarView

          events={events}
          loading={loading}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}

      />

      <TransportationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        reservation={selectedReservation}
        mode={modalMode}
        companyId={companyId}
        user={user}
      />

    </div>
  );
};

export default CalendarTransportations;