import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import AdventureModal from "../reservations/adventure/adventureModal";

import {
  getAdventures,
  createAdventure,
  updateAdventure
} from "../../services/adventure/adventureService";

import { getServiceTypes } from "../../services/settings/general/serviceTypeService";

import Loading from "../../components/general/loading";
import { notifySuccess, notifyError } from "../../services/notificationService";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarAdventures = ({ companyId, user }) => {

  const [events, setEvents] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState("edit");

  /* =========================
     LOAD RESERVATIONS
  ========================== */

  const loadReservations = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      const data = await getAdventures(companyId);

      // 🔥 SOLO ADVENTURES
      const types = await getServiceTypes(companyId, "adventure");

      const formatted = data.map(r => {

        const serviceType = types.find(
          t => t.id === r.serviceTypeId
        );

        const startDate = r.date?.toDate
          ? r.date.toDate()
          : new Date(r.date);

        const endDate = r.endDate
          ? (r.endDate.toDate
              ? r.endDate.toDate()
              : new Date(r.endDate))
          : startDate; // 🔥 fallback

        return {
          ...r,
          title: `${r.clientName || "Cliente"} - ${serviceType?.name || "Tour"}`,
          start: startDate,
          end: endDate,
          color: serviceType?.color || "#0a2a63"
        };
      });

      setEvents(formatted);

    } catch (error) {
      console.error("Error cargando calendario:", error);
      notifyError("Error", "No se pudieron cargar los tours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [companyId]);

  /* =========================
     SELECT EVENT (EDIT)
  ========================== */

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

  /* =========================
     SAVE
  ========================== */

  const handleSave = async (formData) => {

    try {
      setLoading(true);

      if (modalMode === "edit") {
        await updateAdventure(companyId, selectedReservation.id, formData, user);
        notifySuccess("Reserva actualizada", "Los cambios fueron guardados.");
      } else {
        await createAdventure(companyId, formData, user);
        notifySuccess("Reserva creada", "La reserva fue creada correctamente.");
      }

      setModalOpen(false);
      await loadReservations();

    } catch (error) {
      console.error(error);
      notifyError("Error", "No se pudo guardar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CREATE (SELECT SLOT)
  ========================== */

  const handleSelectSlot = (slotInfo) => {

    const start = moment(slotInfo.start);
    const end = moment(slotInfo.end);

    const isDragSelection = !start.isSame(end);

    setModalMode("create");

    setSelectedReservation({
      date: start.format("YYYY-MM-DDTHH:mm"),
      endDate: isDragSelection
        ? end.format("YYYY-MM-DDTHH:mm")
        : "",

      // 🔥 ADVENTURE BASE
      serviceTypeId: "",
      locationId: "",
      pax: 1,
      clientId: null,

      // 🔥 FUTURO (OPERADOR)
      operatorId: "",
      operatorName: ""
    });

    setModalOpen(true);
  };

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

      {!loading && (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          defaultView="month" // 🔥 mejora UX
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

      {modalOpen && (
        <AdventureModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          reservation={selectedReservation}
          mode={modalMode}
          companyId={companyId}
          user={user}
        />
      )}

    </div>
  );
};

export default CalendarAdventures;