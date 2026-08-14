/*
==========================================================
USE TRANSPORTATION CONTROLLER
==========================================================
*/

import { useState, useEffect, useMemo } from "react";

import { emptyForm } from "./constants/transportationConstants";
import { loadTransportationSettings } from "./services/transportationServices";

import {
  buildCreateForm,
  buildEditForm,
  buildOptions
} from "./utils/transportationUtils";

import { searchClientsByName } from "../../../services/clients/clientService";
import { calculateFinancials } from "./utils/transportationCalculations";
import { reservationNumberExists } from "../../../services/transportation/transportationService";
import { generateReservationNumber, getEndDate } from "../../../services/Tools";
import { createClient } from "../../../services/clients/clientService";

import {
  notifySuccess,
  notifyError
} from "../../../services/notificationService";

import {
  buildTransportationReservation
} from "./builders/transportationReservationBuilder";


export default function useTransportationController({

  companyId,

  reservation,

  mode,

  user,

  onSave

}) {

  /*
  ==========================================================
  FORM
  ==========================================================
  */

  const [data, setData] = useState(emptyForm);

  /*
  ==========================================================
  MODALS
  ==========================================================
  */

  const [showClientModal, setShowClientModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  /*
  ==========================================================
  CLIENTS
  ==========================================================
  */

  const [clientData, setClientData] = useState({

    name: "",
    email: "",
    phone: "",
    notes: ""

  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleClientChange = (e) => {

    setClientData(prev => ({

      ...prev,

      [e.target.name]: e.target.value

    }));

  };

  const handleCreateClient = async () => {

    if (!clientData.name?.trim()) {

      notifyError(
        "Nombre requerido",
        "El cliente debe tener un nombre."
      );

      return;

    }

    try {

      const newClientRef = await createClient(

        clientData,

        user,

        companyId

      );

      const newClient = {

        id: newClientRef.id,

        ...clientData

      };

      setData(prev => ({

        ...prev,

        clientId: newClient.id,

        clientName: newClient.name,

        clientEmail: newClient.email,

        phone: newClient.phone

      }));

      notifySuccess(
        "Cliente creado",
        "El cliente fue creado correctamente."
      );

      setShowClientModal(false);

      setClientData({

        name: "",
        email: "",
        phone: "",
        notes: ""

      });

    }

    catch (error) {

      console.error(error);

      notifyError(
        "Error",
        "No se pudo crear el cliente."
      );

    }

  };

  /*
  ==========================================================
  CLIENT SEARCH
  ==========================================================
  */

  useEffect(() => {

    const debounce = setTimeout(async () => {

      if (!searchTerm.trim()) {

        setSearchResults([]);

        return;

      }

      if (!companyId) return;

      try {

        setIsSearching(true);

        const results = await searchClientsByName(

          companyId,

          searchTerm.trim()

        );

        setSearchResults(results);

      }

      catch (error) {

        console.error(error);

      }

      finally {

        setIsSearching(false);

      }

    }, 600);

    return () => clearTimeout(debounce);

  }, [searchTerm, companyId]);

  /*
  ==========================================================
  CLIENT ACTIONS
  ==========================================================
  */

  const handleSelectClient = (client) => {

    setData(prev => ({

      ...prev,

      clientId: client.id,

      clientName: client.name,

      clientEmail: client.email || "",

      phone: client.phone || ""

    }));

    setShowSearchModal(false);

    setSearchTerm("");

    setSearchResults([]);

  };

  /*
  ==========================================================
  SETTINGS
  ==========================================================
  */

  const [serviceTypes, setServiceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookingSources, setBookingSources] = useState([]);
  const [payers, setPayers] = useState([]);

  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [commissionAgents, setCommissionAgents] = useState([]);
  const [existingCommission, setExistingCommission] = useState(null);

  /*
  ==========================================================
  SETTINGS EFFECT
  ==========================================================
  */

  useEffect(() => {

    if (!companyId) return;

    const load = async () => {

      const settings = await loadTransportationSettings(companyId);

      setServiceTypes(settings.serviceTypes);
      setLocations(settings.locations);
      setRoutes(settings.routes);
      setVehicles(settings.vehicles);
      setBookingSources(settings.bookingSources);
      setPayers(settings.payers);

      setTaxes(settings.taxes);
      setDiscounts(settings.discounts);
      setCurrencies(settings.currencies);

      /*
      ========================================================
      DRIVERS
      ========================================================
      */

      setDrivers(settings.drivers);

      setPaymentTypes(settings.paymentTypes);
      setCommissionAgents(settings.commissionAgents);

    };

    load();

  }, [companyId]);

  /*
  ==========================================================
  RESERVATION
  ==========================================================
  */

  useEffect(() => {

    if (mode === "create") {

      setData(
        buildCreateForm(reservation)
      );

      return;

    }

    if (!reservation) return;

    setData(
      buildEditForm(reservation)
    );

  }, [reservation, mode]);

  /*
  ==========================================================
  SELECTED SERVICE
  ==========================================================
  */

  const selectedServiceType = useMemo(() => {

    return serviceTypes.find(
      service => service.id === (data.serviceTypeId ?? "")
    );

  }, [serviceTypes, data.serviceTypeId]);

  /*
  ==========================================================
  AUTO PRICE
  ==========================================================
  */

  useEffect(() => {

    if (!selectedServiceType) return;

    if (selectedServiceType.pricingMode === "fixed") {

      setData(prev => ({

        ...prev,

        price: selectedServiceType.basePrice,

        currency: selectedServiceType.currency,

        symbol: selectedServiceType.symbol

      }));

      return;

    }

    setData(prev => ({

      ...prev,

      price: 0,

      currency: currencies[0]?.code || "",

      symbol: currencies[0]?.symbol || ""

    }));

  }, [selectedServiceType, currencies]);

  /*
  ==========================================================
  FINANCIAL
  ==========================================================
  */

  const financial = calculateFinancials({

    data,

    taxes,

    discounts

  });

  /*
  ==========================================================
  OPTIONS
  ==========================================================
  */

  const locationOptions = useMemo(
    () => buildOptions(locations),
    [locations]
  );

  const serviceTypeOptions = useMemo(
    () => buildOptions(serviceTypes),
    [serviceTypes]
  );

  const driverOptions = useMemo(
    () => buildOptions(drivers),
    [drivers]
  );

  const routeOptions = useMemo(
    () => buildOptions(routes, "code"),
    [routes]
  );

  const vehicleOptions = useMemo(
    () => buildOptions(vehicles),
    [vehicles]
  );

  const bookingSourceOptions = useMemo(
    () => buildOptions(bookingSources),
    [bookingSources]
  );

  const payerOptions = useMemo(
    () => buildOptions(payers),
    [payers]
  );

  const discountOptions = [

    {

      value: "",

      label: "Sin descuento"

    },

    ...discounts.map(discount => ({

      value: discount.id,

      label: `${discount.name} (${
        discount.type === "percentage"
          ? `${discount.value}%`
          : `${discount.value} ${data.currency}`
      })`

    }))

  ];

  const paymentTypeOptions = paymentTypes.map(payment => ({

    value: payment.id,
    label: payment.name

  }));

  const commissionOptions = useMemo(() =>

    commissionAgents.map(agent => ({

      value: agent.id,
      label: agent.name,
      type: agent.type

    })),

    [commissionAgents]

  );

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setData(prev => {

      let newValue = value;

      // 🔢 convertir price a número
      if (name === "price") {

        newValue = value === "" ? "" : Number(value);

      }

      let updatedForm = {

        ...prev,

        [name]: newValue

      };

      /* =========================
        SERVICIO
      ========================== */

      if (name === "serviceTypeId") {

        const selectedService = serviceTypes.find(
          s => s.id === newValue
        );

        updatedForm.serviceTypeName =
          selectedService?.name || "";

      }

      /* =========================
        END AUTO
      ========================== */

      if (name === "date" || name === "serviceTypeId") {

        const date =
          name === "date"
            ? newValue
            : prev.date;

        const serviceId =
          name === "serviceTypeId"
            ? newValue
            : prev.serviceTypeId;

        const selectedService = serviceTypes.find(
          s => s.id === serviceId
        );

        if (date && selectedService?.durationMinutes) {

          updatedForm.end = getEndDate(
            date,
            selectedService.durationMinutes
          );

        } else {

          updatedForm.end = "";

        }

      }

      /* =========================
        🔥 COMISIONISTA AUTO (CLAVE)
      ========================== */

      if (name === "commissionBeneficiaryId") {

        const agent = commissionAgents.find(
          a => a.id === newValue
        );

        if (agent) {

          updatedForm.commissionBeneficiaryName =
            agent.name;

          updatedForm.commissionBeneficiaryType =
            agent.type;

          // 🔥 AUTO CONFIGURACIÓN
          updatedForm.commissionType =
            agent.commissionType || "percentage";

          updatedForm.commissionValue =
            Number(agent.commissionValue || 0);

        }

      }

      return updatedForm;

    });

  };

  const toggleTax = (taxId) => {

    setData(prev => {

      const exists = prev.activeTaxIds.includes(taxId);

      return {

        ...prev,

        activeTaxIds: exists

          ? prev.activeTaxIds.filter(id => id !== taxId)

          : [...prev.activeTaxIds, taxId]

      };

    });

  };

  /*
  ==========================================================
  PRIVATE HELPERS
  ==========================================================
  */

  const validateReservation = () => {

    if (!data.clientId) {

      notifyError("Cliente requerido");

      return false;

    }

    if (!data.serviceTypeId) {

      notifyError("Seleccione un tipo de servicio.");

      return false;

    }

    if (!data.date) {

      notifyError("Fecha y hora requeridas.");

      return false;

    }

    if (!data.status) {

      notifyError("Estado de la reserva requerido");

      return false;

    }

    if (!data.locationFromId) {

      notifyError("Lugar de recogida requerido");

      return false;

    }

    if (!data.locationToId) {

      notifyError("Lugar de destino requerido");

      return false;

    }

    if (!data.passengers) {

      notifyError("La cantidad de pasajeros es requerido.");

      return false;

    }

    if (!data.bookingSourceId) {

      notifyError("Seleccione un origen de la reserva.");

      return false;

    }

    if (!data.price) {

      notifyError("Debe ingresar un monto para esta reserva.");

      return false;

    }

    return true;

  };

  const getReservationNumber = async () => {

    if (mode !== "create") {

      return data.reservationNumber;

    }

    let reservationNumber;
    let exists = true;

    while (exists) {

      reservationNumber =
        generateReservationNumber();

      exists = await reservationNumberExists(

        companyId,

        reservationNumber

      );

    }

    return reservationNumber;

  };

  const handleSubmit = async () => {

    if (!validateReservation()) return;

    const reservationNumber =
      await getReservationNumber();

    const reservationData =
      buildTransportationReservation({

        data: {

          ...data,

          reservationNumber

        },

        reservationNumber,

        financial,

        settings: {

          /*
          ====================================================
          DRIVERS
          ====================================================
          */

          drivers,

          paymentTypes,

          serviceTypes,

          locations,

          routes,

          vehicles,

          bookingSources,

          payers

        }

      });

    try {

      await onSave(reservationData);

    } catch (error) {

      console.error(error);

      notifyError("Error guardando reserva");

    }

  };

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  const controller = {

    form: {

      data,

      setData,

      selectedServiceType

    },

    settings: {

      serviceTypes,
      setServiceTypes,

      locations,
      setLocations,

      routes,
      setRoutes,

      vehicles,
      setVehicles,

      bookingSources,
      setBookingSources,

      payers,
      setPayers,

      taxes,
      setTaxes,

      discounts,
      setDiscounts,

      currencies,
      setCurrencies,

      drivers,
      setDrivers,

      paymentTypes,
      setPaymentTypes,

      commissionAgents,
      setCommissionAgents,

      existingCommission,
      setExistingCommission

    },

    clients: {

      clientData,

      setClientData,

      searchTerm,

      setSearchTerm,

      searchResults,

      setSearchResults,

      isSearching,

      setIsSearching,

      handleSelectClient,

      handleClientChange,

      handleCreateClient

    },

    modals: {

      showClientModal,

      setShowClientModal,

      showSearchModal,

      setShowSearchModal

    },

    financial,

    options: {

      locationOptions,

      serviceTypeOptions,

      driverOptions,

      routeOptions,

      vehicleOptions,

      bookingSourceOptions,

      payerOptions,

      discountOptions,

      paymentTypeOptions,

      commissionOptions

    },

    actions: {

      handleChange,

      toggleTax,

      handleSubmit

    }

  };

  return controller;

}