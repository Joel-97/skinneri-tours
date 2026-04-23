import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import TransportationModal from "../reservations/transportation/transportationModal";

import {
  getTransportation,
  createTransportation,
  updateTransportation
} from "../../services/transportation/transportationService";

import { getServiceTypes } from "../../services/settings/general/serviceTypeService";
import { getCommissionAgents } from "../../services/settings/general/agentsService"; 
import { 
  createCommission, 
  updateCommission,
  deleteCommission,
  getCommissionByBooking 
} from "../../services/settings/general/commissionService";

import Loading from "../../components/general/loading";
import {
  notifySuccess,
  notifyError
} from "../../services/notificationService";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarTransportations = ({ companyId, user }) => {

  const [events, setEvents] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState("edit");

  // 🔥 NUEVO
  const [commissionAgents, setCommissionAgents] = useState([]);

  /* =========================
     LOAD DATA
  ========================== */

  const loadReservations = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      const [data, types, agents] = await Promise.all([
        getTransportation(companyId),
        getServiceTypes(companyId),
        getCommissionAgents(companyId) // 🔥 NUEVO
      ]);

      setCommissionAgents(agents);

      const formatted = data.map(r => {

        const serviceType = types.find(
          t => t.id === r.serviceTypeId
        );

        return {
          ...r,
          title: `${r.clientName} - ${serviceType?.name || ""}`,
          start: r.date.toDate(),
          end: r.endDate?.toDate() || r.date.toDate(), // 🔥 FIX
          color: serviceType?.color || "#0a2a63",
        };
      });

      setEvents(formatted);

    } catch (error) {
      console.error("Error cargando calendario:", error);
      notifyError("Error cargando calendario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [companyId]);

  /* =========================
     EVENT CLICK
  ========================== */

  const handleSelectEvent = (event) => {

    setModalMode("edit");

    setSelectedReservation({
      ...event,
      date: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      endDate: event.end
        ? moment(event.end).format("YYYY-MM-DDTHH:mm")
        : "",

      // 🔥 asegurar campos de comisión
      commissionEnabled: event.commissionEnabled || false,
      commissionBeneficiaryId: event.commissionBeneficiaryId || "",
      commissionType: event.commissionType || "percentage",
      commissionValue: event.commissionValue || 0
    });

    setModalOpen(true);
  };

  /* =========================
     SAVE
  ========================== */

  const handleSave = async (formData) => {

    try {
      setLoading(true);

      let savedBooking;

      /* =========================
        1. GUARDAR RESERVA
      ========================== */

      if (modalMode === "edit") {

        await updateTransportation(
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

        const docRef = await createTransportation(companyId, formData, user);

        savedBooking = {
          id: docRef.id,
          ...formData
        };

        notifySuccess("Reserva creada", "La reserva fue creada correctamente.");
      }

      if (!savedBooking?.id) return;

      /* =========================
        2. COMISIONES (CLAVE)
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
          baseAmount: Number(base),

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
      notifyError("Error guardando reserva");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CREATE SLOT
  ========================== */

  const handleSelectSlot = (slotInfo) => {

    const start = moment(slotInfo.start);
    const end = moment(slotInfo.end);

    const isDragSelection = !start.isSame(end);

    const formattedStart = start.format("YYYY-MM-DDTHH:mm");
    const formattedEnd = isDragSelection
      ? end.format("YYYY-MM-DDTHH:mm")
      : "";

    setModalMode("create");

    setSelectedReservation({
      date: formattedStart,
      endDate: formattedEnd,

      serviceTypeId: "",
      locationFromId: "",
      locationToId: "",
      passengers: 1,
      clientId: null,

      // 🔥 INICIALIZACIÓN DE COMISIÓN
      commissionEnabled: false,
      commissionBeneficiaryId: "",
      commissionBeneficiaryName: "",
      commissionBeneficiaryType: "",
      commissionType: "percentage",
      commissionValue: 0
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

        // 🔥 CLAVE PARA AUTOCOMPLETAR COMISIÓN
        commissionAgents={commissionAgents}
      />

    </div>
  );
};

export default CalendarTransportations;