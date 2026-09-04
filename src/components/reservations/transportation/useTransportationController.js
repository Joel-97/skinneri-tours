/*
==========================================================
USE TRANSPORTATION CONTROLLER
==========================================================
*/

import {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";

import { emptyForm } from "./constants/transportationConstants";
import { loadTransportationSettings } from "./services/transportationServices";

import {
  buildCreateForm,
  buildEditForm,
  buildOptions
} from "./utils/transportationUtils";

import {
  searchClientsByName,
  createClient,
  findOrCreateClient
} from "../../../services/clients/clientService";

import { calculateFinancials } from "./utils/transportationCalculations";

import {
  reservationNumberExists
} from "../../../services/transportation/transportationService";

import {
  generateReservationNumber,
  getEndDate
} from "../../../services/Tools";

import {
  notifySuccess,
  notifyError
} from "../../../services/notificationService";

import {
  buildTransportationReservation
} from "./builders/transportationReservationBuilder";


/*
==========================================================
NORMALIZE VALUE FOR COMPARISON
==========================================================
*/

const normalizeValue = (value) => {

  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  /*
  ---------------------------------------------------------
  DATE
  ---------------------------------------------------------
  */

  if (value instanceof Date) {
    return value.toISOString();
  }

  /*
  ---------------------------------------------------------
  FIRESTORE TIMESTAMP
  ---------------------------------------------------------
  */

  if (
    typeof value?.toDate === "function"
  ) {

    try {

      return value.toDate().toISOString();

    }
    catch {

      return String(value);

    }

  }

  /*
  ---------------------------------------------------------
  ARRAY
  ---------------------------------------------------------
  */

  if (Array.isArray(value)) {

    return value.map(
      item => normalizeValue(item)
    );

  }

  /*
  ---------------------------------------------------------
  OBJECT
  ---------------------------------------------------------
  */

  if (
    typeof value === "object"
  ) {

    const normalized = {};

    Object.keys(value)
      .sort()
      .forEach(key => {

        normalized[key] =
          normalizeValue(
            value[key]
          );

      });

    return normalized;

  }

  /*
  ---------------------------------------------------------
  PRIMITIVE
  ---------------------------------------------------------
  */

  return value;

};


/*
==========================================================
CREATE FORM SNAPSHOT
==========================================================
*/

const createFormSnapshot = (value) => {

  return JSON.stringify(
    normalizeValue(value)
  );

};


/*
==========================================================
CONTROLLER
==========================================================
*/

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
  INITIAL FORM SNAPSHOT
  ==========================================================
  */

  const initialFormSnapshot = useRef(
    createFormSnapshot(emptyForm)
  );


  /*
  ==========================================================
  MODIFIED STATE
  ==========================================================
  */

  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);


  /*
  ==========================================================
  UPDATE UNSAVED CHANGES
  ==========================================================
  */

  useEffect(() => {

    const currentSnapshot =
      createFormSnapshot(data);

    const changed =
      currentSnapshot !==
      initialFormSnapshot.current;

    setHasUnsavedChanges(changed);

  }, [data]);


  /*
  ==========================================================
  MODALS
  ==========================================================
  */

  const [showClientModal, setShowClientModal] =
    useState(false);

  const [showSearchModal, setShowSearchModal] =
    useState(false);


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


  /*
  ==========================================================
  HANDLE CLIENT CHANGE
  ==========================================================
  */

  const handleClientChange = (e) => {

    setClientData(prev => ({

      ...prev,

      [e.target.name]:
        e.target.value

    }));

  };


  /*
  ==========================================================
  HANDLE CREATE CLIENT MANUALLY
  ==========================================================
  */

  const handleCreateClient = async () => {

    if (!clientData.name?.trim()) {

      notifyError(
        "Nombre requerido",
        "El cliente debe tener un nombre."
      );

      return false;

    }

    try {

      /*
      ======================================================
      CREATE CLIENT

      createClient signature:

          createClient(
            companyId,
            data,
            user
          )
      ======================================================
      */

      const newClientRef =
        await createClient(
          companyId,
          clientData,
          user
        );


      const newClient = {

        id:
          newClientRef.id,

        ...clientData

      };


      /*
      ======================================================
      LINK CLIENT TO RESERVATION
      ======================================================
      */

      setData(prev => ({

        ...prev,

        clientId:
          newClient.id,

        clientName:
          newClient.name,

        clientEmail:
          newClient.email,

        phone:
          newClient.phone

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

      return true;

    }
    catch (error) {

      console.error(
        "Error creando cliente:",
        error
      );

      notifyError(
        "Error",
        "No se pudo crear el cliente."
      );

      return false;

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


        const results =
          await searchClientsByName(
            companyId,
            searchTerm.trim()
          );


        setSearchResults(results);

      }
      catch (error) {

        console.error(
          "Error buscando clientes:",
          error
        );

      }
      finally {

        setIsSearching(false);

      }

    }, 600);


    return () =>
      clearTimeout(debounce);

  }, [
    searchTerm,
    companyId
  ]);


  /*
  ==========================================================
  CLIENT ACTIONS
  ==========================================================
  */

  const handleSelectClient = (client) => {

    setData(prev => ({

      ...prev,

      clientId:
        client.id,

      clientName:
        client.name,

      clientEmail:
        client.email || "",

      phone:
        client.phone || ""

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

  const [commissionAgents, setCommissionAgents] =
    useState([]);

  const [existingCommission, setExistingCommission] =
    useState(null);


  /*
  ==========================================================
  SETTINGS EFFECT
  ==========================================================
  */

  useEffect(() => {

    if (!companyId) return;


    const load = async () => {

      try {

        const settings =
          await loadTransportationSettings(
            companyId
          );


        setServiceTypes(
          settings.serviceTypes
        );

        setLocations(
          settings.locations
        );

        setRoutes(
          settings.routes
        );

        setVehicles(
          settings.vehicles
        );

        setBookingSources(
          settings.bookingSources
        );

        setPayers(
          settings.payers
        );


        setTaxes(
          settings.taxes
        );

        setDiscounts(
          settings.discounts
        );

        setCurrencies(
          settings.currencies
        );


        /*
        ========================================================
        DRIVERS
        ========================================================
        */

        setDrivers(
          settings.drivers
        );


        setPaymentTypes(
          settings.paymentTypes
        );

        setCommissionAgents(
          settings.commissionAgents
        );

      }
      catch (error) {

        console.error(
          "Error loading transportation settings:",
          error
        );

      }

    };


    load();

  }, [companyId]);


  /*
  ==========================================================
  RESERVATION
  ==========================================================
  */

  useEffect(() => {

    let initialData;


    if (mode === "create") {

      initialData =
        buildCreateForm(
          reservation
        );

    }

    else {

      if (!reservation) return;

      initialData =
        buildEditForm(
          reservation
        );

    }


    setData(initialData);


    /*
    ---------------------------------------------------------
    ESTABLISH BASELINE
    ---------------------------------------------------------
    */

    initialFormSnapshot.current =
      createFormSnapshot(
        initialData
      );


    setHasUnsavedChanges(false);

  }, [
    reservation,
    mode
  ]);


  /*
  ==========================================================
  SELECTED SERVICE
  ==========================================================
  */

  const selectedServiceType = useMemo(() => {

    return serviceTypes.find(
      service =>
        service.id ===
        (data.serviceTypeId ?? "")
    );

  }, [
    serviceTypes,
    data.serviceTypeId
  ]);


  /*
  ==========================================================
  AUTO PRICE
  ==========================================================
  */

  useEffect(() => {

    if (!selectedServiceType) return;


    if (
      selectedServiceType.pricingMode ===
      "fixed"
    ) {

      setData(prev => ({

        ...prev,

        price:
          selectedServiceType.basePrice,

        currency:
          selectedServiceType.currency,

        symbol:
          selectedServiceType.symbol

      }));

      return;

    }


    setData(prev => ({

      ...prev,

      price:
        0,

      currency:
        currencies[0]?.code || "",

      symbol:
        currencies[0]?.symbol || ""

    }));

  }, [
    selectedServiceType,
    currencies
  ]);


  /*
  ==========================================================
  FINANCIAL
  ==========================================================
  */

  const financial =
    calculateFinancials({

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
    () =>
      buildOptions(
        locations
      ),
    [locations]
  );


  const serviceTypeOptions = useMemo(
    () =>
      buildOptions(
        serviceTypes
      ),
    [serviceTypes]
  );


  const driverOptions = useMemo(
    () =>
      buildOptions(
        drivers
      ),
    [drivers]
  );


  const routeOptions = useMemo(
    () =>
      buildOptions(
        routes,
        "code"
      ),
    [routes]
  );


  const vehicleOptions = useMemo(
    () =>
      buildOptions(
        vehicles
      ),
    [vehicles]
  );


  const bookingSourceOptions = useMemo(
    () =>
      buildOptions(
        bookingSources
      ),
    [bookingSources]
  );


  const payerOptions = useMemo(
    () =>
      buildOptions(
        payers
      ),
    [payers]
  );


  const discountOptions = [

    {
      value: "",
      label: "Sin descuento"
    },

    ...discounts.map(
      discount => ({

        value:
          discount.id,

        label:
          `${discount.name} (${
            discount.type ===
            "percentage"
              ? `${discount.value}%`
              : `${discount.value} ${data.currency}`
          })`

      })
    )

  ];


  const paymentTypeOptions =
    paymentTypes.map(
      payment => ({

        value:
          payment.id,

        label:
          payment.name

      })
    );


  const commissionOptions =
    useMemo(
      () =>
        commissionAgents.map(
          agent => ({

            value:
              agent.id,

            label:
              agent.name,

            type:
              agent.type

          })
        ),

      [commissionAgents]
    );


  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setData(prev => {

      let newValue = value;


      /*
      -------------------------------------------------------
      CONVERT PRICE TO NUMBER
      -------------------------------------------------------
      */

      if (
        name === "price"
      ) {

        newValue =
          value === ""
            ? ""
            : Number(value);

      }


      let updatedForm = {

        ...prev,

        [name]:
          newValue

      };


      /*
      -------------------------------------------------------
      SERVICIO
      -------------------------------------------------------
      */

      if (
        name ===
        "serviceTypeId"
      ) {

        const selectedService =
          serviceTypes.find(
            s =>
              s.id ===
              newValue
          );


        updatedForm.serviceTypeName =
          selectedService?.name || "";

      }


      /*
      -------------------------------------------------------
      END AUTO
      -------------------------------------------------------
      */

      if (
        name === "date" ||
        name === "serviceTypeId"
      ) {

        const date =
          name === "date"
            ? newValue
            : prev.date;


        const serviceId =
          name === "serviceTypeId"
            ? newValue
            : prev.serviceTypeId;


        const selectedService =
          serviceTypes.find(
            s =>
              s.id ===
              serviceId
          );


        if (
          date &&
          selectedService?.durationMinutes
        ) {

          updatedForm.end =
            getEndDate(
              date,
              selectedService.durationMinutes
            );

        }

        else {

          updatedForm.end = "";

        }

      }


      /*
      ======================================================
      COMISIONISTA AUTO
      ======================================================
      */

      if (
        name ===
        "commissionBeneficiaryId"
      ) {

        const agent =
          commissionAgents.find(
            a =>
              a.id ===
              newValue
          );


        if (agent) {

          updatedForm.commissionBeneficiaryName =
            agent.name;


          updatedForm.commissionBeneficiaryType =
            agent.type;


          /*
          --------------------------------------------------
          AUTO CONFIGURACIÓN
          --------------------------------------------------
          */

          updatedForm.commissionType =
            agent.commissionType ||
            "percentage";


          updatedForm.commissionValue =
            Number(
              agent.commissionValue ||
              0
            );

        }

      }


      return updatedForm;

    });

  };


  /*
  ==========================================================
  TOGGLE TAX
  ==========================================================
  */

  const toggleTax = (taxId) => {

    setData(prev => {

      const exists =
        prev.activeTaxIds.includes(
          taxId
        );


      return {

        ...prev,

        activeTaxIds:

          exists
            ? prev.activeTaxIds.filter(
                id =>
                  id !== taxId
              )

            : [
                ...prev.activeTaxIds,
                taxId
              ]

      };

    });

  };


  /*
  ==========================================================
  PRIVATE HELPERS
  ==========================================================
  */


  /*
  ==========================================================
  ENSURE RESERVATION CLIENT
  ==========================================================

  Public API reservations intentionally start with:

      clientId = null

  When an administrator saves the reservation, we resolve
  the client against the CRM.

  Flow:

      clientId exists
          ↓
      use existing client

      clientId missing
          ↓
      search by email
          ↓
      existing client?
          ↓
      YES → link existing client
      NO  → create new client
  ==========================================================
  */

  const ensureReservationClient = async (

    currentData

  ) => {

    /*
    ======================================================
    CLIENT ALREADY LINKED
    ======================================================
    */

    if (
      currentData.clientId
    ) {

      return currentData;

    }


    /*
    ======================================================
    COMPANY REQUIRED
    ======================================================
    */

    if (!companyId) {

      notifyError(
        "Error",
        "No se encontró la compañía de la reserva."
      );

      return null;

    }


    /*
    ======================================================
    CLIENT NAME REQUIRED
    ======================================================
    */

    if (
      !currentData.clientName?.trim()
    ) {

      notifyError(
        "Cliente requerido",
        "La reserva debe tener un nombre de cliente."
      );

      return null;

    }


    /*
    ======================================================
    FIND OR CREATE CLIENT
    ======================================================
    */

    try {

      const client =
        await findOrCreateClient(

          companyId,

          {

            name:
              currentData.clientName.trim(),

            email:
              currentData.clientEmail?.trim() || "",

            phone:
              currentData.phone?.trim() || "",

            notes:
              currentData.notes?.trim() || ""

          },

          user

        );


      /*
      ======================================================
      VALIDATE RESULT
      ======================================================
      */

      if (
        !client?.id
      ) {

        notifyError(
          "Cliente requerido",
          "No se pudo obtener o crear el cliente."
        );

        return null;

      }


      /*
      ======================================================
      BUILD UPDATED FORM
      ======================================================
      */

      const updatedData = {

        ...currentData,

        clientId:
          client.id,

        clientName:
          client.name ||
          currentData.clientName,

        clientEmail:
          client.email ||
          currentData.clientEmail ||
          "",

        phone:
          client.phone ||
          currentData.phone ||
          ""

      };


      /*
      ======================================================
      UPDATE LOCAL FORM
      ======================================================
      */

      setData(
        updatedData
      );


      return updatedData;

    }
    catch (error) {

      console.error(
        "Error resolving reservation client:",
        error
      );

      notifyError(
        "Error",
        "No se pudo obtener o crear el cliente."
      );

      return null;

    }

  };


  /*
  ==========================================================
  VALIDATE RESERVATION
  ==========================================================
  */

  const validateReservation = (

    currentData = data

  ) => {

    /*
    ======================================================
    CLIENT
    ======================================================

    Client resolution is handled separately by
    ensureReservationClient().
    ======================================================
    */

    if (
      !currentData.clientId
    ) {

      notifyError(
        "Cliente requerido"
      );

      return false;

    }


    /*
    ======================================================
    SERVICE TYPE
    ======================================================
    */

    if (
      !currentData.serviceTypeId
    ) {

      notifyError(
        "Seleccione un tipo de servicio."
      );

      return false;

    }


    /*
    ======================================================
    DATE
    ======================================================
    */

    if (
      !currentData.date
    ) {

      notifyError(
        "Fecha y hora requeridas."
      );

      return false;

    }


    /*
    ======================================================
    STATUS
    ======================================================
    */

    if (
      !currentData.status
    ) {

      notifyError(
        "Estado de la reserva requerido"
      );

      return false;

    }


    /*
    ======================================================
    LOCATION FROM
    ======================================================
    */

    if (
      !currentData.locationFromId
    ) {

      notifyError(
        "Lugar de recogida requerido"
      );

      return false;

    }


    /*
    ======================================================
    LOCATION TO
    ======================================================
    */

    if (
      !currentData.locationToId
    ) {

      notifyError(
        "Lugar de destino requerido"
      );

      return false;

    }


    /*
    ======================================================
    PASSENGERS
    ======================================================
    */

    if (
      !currentData.passengers
    ) {

      notifyError(
        "La cantidad de pasajeros es requerido."
      );

      return false;

    }


    /*
    ======================================================
    BOOKING SOURCE
    ======================================================
    */

    if (
      !currentData.bookingSourceId
    ) {

      notifyError(
        "Seleccione un origen de la reserva."
      );

      return false;

    }


    /*
    ======================================================
    PRICE
    ======================================================
    */

    if (
      !currentData.price
    ) {

      notifyError(
        "Debe ingresar un monto para esta reserva."
      );

      return false;

    }


    return true;

  };


  /*
  ==========================================================
  GET RESERVATION NUMBER
  ==========================================================
  */

  const getReservationNumber = async () => {

    if (
      mode !== "create"
    ) {

      return data.reservationNumber;

    }


    let reservationNumber;

    let exists = true;


    while (exists) {

      reservationNumber =
        generateReservationNumber();


      exists =
        await reservationNumberExists(
          companyId,
          reservationNumber
        );

    }


    return reservationNumber;

  };


  /*
  ==========================================================
  RESET UNSAVED CHANGES
  ==========================================================
  */

  const resetUnsavedChanges = () => {

    initialFormSnapshot.current =
      createFormSnapshot(
        data
      );


    setHasUnsavedChanges(false);

  };


  /*
  ==========================================================
  HANDLE SUBMIT
  ==========================================================
  */

  const handleSubmit = async () => {

    /*
    ======================================================
    ENSURE CLIENT
    ======================================================

    This must happen before reservation validation because
    public API reservations can legitimately start with:

        clientId = null

    The client is resolved here and the returned object is
    used directly for the reservation build.
    ======================================================
    */

    const dataToSave =
      await ensureReservationClient(
        data
      );


    if (
      !dataToSave
    ) {

      return false;

    }


    /*
    ---------------------------------------------------------
    VALIDATION
    ---------------------------------------------------------
    */

    if (
      !validateReservation(
        dataToSave
      )
    ) {

      return false;

    }


    /*
    ---------------------------------------------------------
    RESERVATION NUMBER
    ---------------------------------------------------------
    */

    let reservationNumber;

    try {

      reservationNumber =
        await getReservationNumber();

    }
    catch (error) {

      console.error(
        "Error generating reservation number:",
        error
      );

      notifyError(
        "Error",
        "No se pudo generar el número de reserva."
      );

      return false;

    }


    /*
    ---------------------------------------------------------
    BUILD RESERVATION
    ---------------------------------------------------------
    */

    let reservationData;

    try {

      reservationData =
        buildTransportationReservation({

          data: {

            ...dataToSave,

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

    }
    catch (error) {

      console.error(
        "Error building transportation reservation:",
        error
      );

      notifyError(
        "Error",
        "No se pudo preparar la reserva para guardar."
      );

      return false;

    }


    /*
    ---------------------------------------------------------
    SAVE
    ---------------------------------------------------------
    */

    try {

      const result =
        await onSave(
          reservationData
        );


      /*
      =======================================================
      IMPORTANT
      =======================================================

      onSave() must return false when the parent failed
      to save the reservation.

      This prevents the modal from considering the form
      saved when the database operation actually failed.
      =======================================================
      */

      if (
        result === false
      ) {

        return false;

      }


      /*
      -------------------------------------------------------
      SAVE SUCCESSFUL
      -------------------------------------------------------

      The data actually sent to the parent becomes the new
      baseline.

      This is important because ensureReservationClient()
      may have added a new clientId immediately before save.
      -------------------------------------------------------
      */

      initialFormSnapshot.current =
        createFormSnapshot(
          dataToSave
        );


      setHasUnsavedChanges(false);


      /*
      -------------------------------------------------------
      RETURN SUCCESS
      -------------------------------------------------------
      */

      return true;

    }
    catch (error) {

      console.error(
        "Error guardando reserva:",
        error
      );

      notifyError(
        "Error guardando reserva"
      );

      return false;

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

      selectedServiceType,

      hasUnsavedChanges,

      resetUnsavedChanges

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

      handleSubmit,

      resetUnsavedChanges

    }

  };


  return controller;

}