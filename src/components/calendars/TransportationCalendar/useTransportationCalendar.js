import { useState, useEffect } from "react";
import moment from "moment";

import {
  getTransportation
} from "../../../services/transportation/transportationService";

import {
  getServiceTypes
} from "../../../services/settings/general/serviceTypeService";

import {
  notifySuccess,
  notifyError
} from "../../../services/notificationService";

import { saveReservation } from "./services/reservationService";

export default function useTransportationCalendar({
  companyId,
  user
}) {

  /*
  ==========================================================
  CALENDAR
  ==========================================================
  */

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
  ==========================================================
  MODAL
  ==========================================================
  */

  const [modalOpen, setModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState("edit");

  const [selectedReservation, setSelectedReservation] = useState(null);


    /*
    ==========================================================
    LOAD RESERVATIONS
    ==========================================================
    */

    const loadReservations = async () => {

    if (!companyId) return;

    try {

        setLoading(true);

        const [

        reservations,

        serviceTypes

        ] = await Promise.all([

        getTransportation(companyId),

        getServiceTypes(companyId)

        ]);

        const formatted = reservations.map(reservation => {

        const serviceType = serviceTypes.find(

            item => item.id === reservation.serviceTypeId

        );

        return {

            ...reservation,

            title: `${reservation.clientName} - ${serviceType?.name || ""}`,

            start: reservation.date.toDate(),

            end:

            reservation.endDate?.toDate()

            || reservation.date.toDate(),

            color:

            serviceType?.color || "#0a2a63"

        };

        });

        setEvents(formatted);

    }

    catch (error) {

        console.error(error);

        notifyError("Error cargando calendario");

    }

    finally {

        setLoading(false);

    }

    };

    useEffect(() => {

        loadReservations();

    }, [companyId]);

    /*
    ==========================================================
    SELECT EVENT
    ==========================================================
    */

    const handleSelectEvent = (event) => {

    setModalMode("edit");

    setSelectedReservation({

        ...event,

        date: moment(event.start).format("YYYY-MM-DDTHH:mm"),

        endDate: event.end
        ? moment(event.end).format("YYYY-MM-DDTHH:mm")
        : "",

        commissionEnabled:
        event.commissionEnabled || false,

        commissionBeneficiaryId:
        event.commissionBeneficiaryId || "",

        commissionType:
        event.commissionType || "percentage",

        commissionValue:
        event.commissionValue || 0

    });

    setModalOpen(true);

    };

    /* =========================
     SAVE
    ========================== */

    const handleSave = async (formData) => {

    try {

        setLoading(true);

        await saveReservation({

        companyId,

        user,

        mode: modalMode,

        reservation: selectedReservation,

        formData

        });

        notifySuccess(
            modalMode === "create"
                ? "Reserva creada"
                : "Reserva actualizada",

            modalMode === "create"
                ? "La reserva fue creada correctamente."
                : "Los cambios fueron guardados."
        );

        setModalOpen(false);

        await loadReservations();

    } catch (error) {

        console.error(error);

        notifyError("Error guardando reserva");

    } finally {

        setLoading(false);

    }

    };

    /*
    ==========================================================
    SELECT SLOT
    ==========================================================
    */

    const handleSelectSlot = (slotInfo) => {

    const start = moment(slotInfo.start);

    const end = moment(slotInfo.end);

    const isDragSelection = !start.isSame(end);

    const formattedStart =
        start.format("YYYY-MM-DDTHH:mm");

    const formattedEnd =
        isDragSelection
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

        commissionEnabled: false,

        commissionBeneficiaryId: "",

        commissionBeneficiaryName: "",

        commissionBeneficiaryType: "",

        commissionType: "percentage",

        commissionValue: 0

    });

    setModalOpen(true);

    };

    /*
    ==========================================================
    MODAL
    ==========================================================
    */

    const handleOpenModal = () => {

    setModalOpen(true);

    };

    const handleCloseModal = () => {

    setModalOpen(false);

    };

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    calendar: {

        events,

        setEvents,

        loading,

        setLoading,

        loadReservations

    },

    modal: {

        modalOpen,

        modalMode,

        selectedReservation,

        handleOpenModal,

        handleCloseModal,

        handleSelectEvent,

        handleSelectSlot,

        handleSave

    }

  };

}