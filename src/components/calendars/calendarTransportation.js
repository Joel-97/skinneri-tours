import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import TransportationModal from "../general/transportationModal";
import {
  getTransportation,
  createTransportation,
  updateTransportation
} from "../../services/transportation/transportationService";
import { getServiceTypes } from "../../services/settings/serviceTypeService";
import Loading from "../../components/general/loading";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarTransportations = ({ companyId, user }) => {
  const [events, setEvents] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState("edit");

  const loadReservations = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      const data = await getTransportation(companyId);
      const types = await getServiceTypes(companyId);

      const formatted = data.map(r => {

        const serviceType = types.find(
          t => t.id === r.serviceTypeId
        );

        return {
          ...r,
          title: r.clientName + " - " + serviceType?.name,
          start: r.date.toDate(),
          end: r.endDate?.toDate(),
          color: serviceType?.color || "#0a2a63",
        };
      });

      setEvents(formatted);

    } catch (error) {
      console.error("Error cargando calendario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [companyId]);


  const handleSelectEvent = (event) => {

    setModalMode("edit");

    setSelectedReservation({
      ...event,
      date: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      endDate: event.end
        ? moment(event.end).format("YYYY-MM-DDTHH:mm")
        : ""
    });

    setModalOpen(true);
  };


  const handleSave = async (formData) => {

    try {
      setLoading(true);

      if (modalMode === "edit") {
        await updateTransportation(
          companyId,
          selectedReservation.id,
          formData,
          user
        );
      } else {
        await createTransportation(
          companyId,
          formData,
          user
        );
      }

      setModalOpen(false);
      await loadReservations();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleSelectSlot = (slotInfo) => {

    const start = moment(slotInfo.start);
    const end = moment(slotInfo.end);

    const isDragSelection = !start.isSame(end);

    let formattedStart = start.format("YYYY-MM-DDTHH:mm");
    let formattedEnd = "";

    if (isDragSelection) {
      // 🟢 Usuario arrastró → usar rango exacto
      formattedEnd = end.format("YYYY-MM-DDTHH:mm");
    }

    setModalMode("create");

    setSelectedReservation({
      date: formattedStart,
      endDate: formattedEnd,
      serviceTypeId: "",
      locationFromId: "",
      locationToId: "",
      passengers: 1,
      clientId: null
    });

    setModalOpen(true);
  };


  return (
    <div style={{ height: "80vh", position: "relative" }}>

      {loading && (
        <div className="calendar-loading">
          <Loading />
        </div>
      )}

      {!loading && (
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color,
            borderRadius: "8px",
            color: "white",
            border: "none",
            padding: "2px 6px"
          }
        })}
      />

      )}

      <TransportationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
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
