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

// 🔥 COMISIONES
import {
  createCommission,
  updateCommission,
  deleteCommission,
  getCommissionByBooking
} from "../../services/settings/general/commissionService";

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
      const types = await getServiceTypes(companyId, "adventure");

      /* =========================
        🔥 FILTRAR CANCELADOS
      ========================== */

      const activeReservations = data.filter(r => {
        return (r.status || "").toLowerCase() !== "cancelled";
      });

      /* =========================
        FORMATEAR
      ========================== */

      const formatted = activeReservations.map(r => {

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
          : startDate;

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
     SAVE (🔥 CON COMISIONES)
  ========================== */

  const handleSave = async (formData) => {

    try {
      setLoading(true);

      let savedBooking;

      /* =========================
         1. GUARDAR RESERVA
      ========================== */

      if (modalMode === "edit") {

        await updateAdventure(
          companyId,
          selectedReservation.id,
          formData,
          user
        );

        savedBooking = {
          id: selectedReservation.id,
          ...formData
        };

        notifySuccess("Reserva actualizada", "Los cambios fueron guardados.");

      } else {

        const docRef = await createAdventure(companyId, formData, user);

        savedBooking = {
          id: docRef.id,
          ...formData
        };

        notifySuccess("Reserva creada", "La reserva fue creada correctamente.");
      }

      if (!savedBooking?.id) return;

      /* =========================
         2. COMISIONES
      ========================== */

      const existingList = await getCommissionByBooking(companyId, savedBooking.id);
      const existing = existingList?.[0];

      // 🔥 BASE = price - descuento (SIN impuestos)
      const price = Number(formData.price || 0);
      const discount = Number(formData.discountAmount || 0);
      const base = Number((price - discount).toFixed(2));

      if (
        formData.commissionEnabled &&
        formData.commissionBeneficiaryId
      ) {

        const amount =
          formData.commissionType === "percentage"
            ? base * (formData.commissionValue / 100)
            : formData.commissionValue;

        const commissionData = {
          bookingId: savedBooking.id,

          beneficiaryId: formData.commissionBeneficiaryId,
          beneficiaryName: formData.commissionBeneficiaryName,
          beneficiaryType: formData.commissionBeneficiaryType,

          serviceTypeId: formData.serviceTypeId,
          serviceTypeName: formData.serviceTypeName,

          amount: Number(amount.toFixed(2)),
          baseAmount: base,

          type: formData.commissionType,
          value: formData.commissionValue,

          bookingDate: formData.date
        };

        if (existing) {
          await updateCommission(companyId, existing.id, commissionData, user);
        } else {
          await createCommission(companyId, commissionData, user);
        }

      } else if (!formData.commissionEnabled && existing) {

        await deleteCommission(companyId, existing.id);
      }

      /* =========================
         FINAL
      ========================== */

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

      serviceTypeId: "",
      locationId: "",
      pax: 1,
      clientId: null,

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
          defaultView="month"
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