import {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";

import { emptyForm } from "./constants/transportationConstants";

import {
  loadTransportationSettings
} from "./services/transportationServices";

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

import {
  calculateFinancials
} from "./utils/transportationCalculations";

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


const normalizeValue = (value) => {

  if (value === undefined || value === null) {
    return null;
  }


  if (value instanceof Date) {
    return value.toISOString();
  }


  if (typeof value?.toDate === "function") {

    try {
      return value.toDate().toISOString();
    }

    catch {
      return String(value);
    }

  }


  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }


  if (typeof value === "object") {

    return Object.keys(value)
      .sort()
      .reduce((result, key) => {

        result[key] =
          normalizeValue(value[key]);

        return result;

      }, {});

  }


  return value;

};


const createFormSnapshot = (value) =>
  JSON.stringify(
    normalizeValue(value)
  );


const getDraftKey = (companyId) =>
  companyId
    ? `skinneri:transportation:draft:${companyId}`
    : null;


const readDraft = (key) => {

  if (
    !key ||
    typeof window === "undefined"
  ) {
    return null;
  }

  try {

    const stored =
      window.localStorage.getItem(
        key
      );

    if (!stored) {
      return null;
    }


    const parsed =
      JSON.parse(stored);

    return (
      parsed &&
      typeof parsed === "object"
    )
      ? parsed
      : null;

  }

  catch (error) {

    console.error(
      "Error leyendo el borrador de transporte:",
      error
    );

    return null;

  }

};


const writeDraft = (
  key,
  value
) => {

  if (
    !key ||
    typeof window === "undefined"
  ) {
    return;
  }

  try {

    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  }

  catch (error) {

    console.error(
      "Error guardando el borrador de transporte:",
      error
    );

  }

};


const removeDraft = (key) => {

  if (
    !key ||
    typeof window === "undefined"
  ) {
    return;
  }

  try {

    window.localStorage.removeItem(
      key
    );

  }

  catch (error) {

    console.error(
      "Error eliminando el borrador de transporte:",
      error
    );

  }

};


export default function useTransportationController({

  companyId,
  reservation,
  mode,
  user,
  onSave

}) {

  const [data, setData] =
    useState(emptyForm);


  const initialFormSnapshot =
    useRef(
      createFormSnapshot(emptyForm)
    );


  const [
    hasUnsavedChanges,
    setHasUnsavedChanges
  ] = useState(false);


  const [
    hasDraft,
    setHasDraft
  ] = useState(false);


  const draftKey =
    getDraftKey(companyId);


  const draftHydratedRef =
    useRef(false);


  const skipNextDraftWriteRef =
    useRef(false);


  const previousServiceTypeIdRef =
    useRef(null);


  const [
    showClientModal,
    setShowClientModal
  ] = useState(false);


  const [
    showSearchModal,
    setShowSearchModal
  ] = useState(false);


  const [clientData, setClientData] =
    useState({
      name: "",
      email: "",
      phone: "",
      notes: ""
    });


  const [searchTerm, setSearchTerm] =
    useState("");


  const [searchResults, setSearchResults] =
    useState([]);


  const [isSearching, setIsSearching] =
    useState(false);


  const [serviceTypes, setServiceTypes] =
    useState([]);


  const [locations, setLocations] =
    useState([]);


  const [routes, setRoutes] =
    useState([]);


  const [vehicles, setVehicles] =
    useState([]);


  const [bookingSources, setBookingSources] =
    useState([]);


  const [payers, setPayers] =
    useState([]);


  const [taxes, setTaxes] =
    useState([]);


  const [discounts, setDiscounts] =
    useState([]);


  const [currencies, setCurrencies] =
    useState([]);


  const [drivers, setDrivers] =
    useState([]);


  const [paymentTypes, setPaymentTypes] =
    useState([]);


  const [commissionAgents, setCommissionAgents] =
    useState([]);


  const [
    existingCommission,
    setExistingCommission
  ] = useState(null);


  useEffect(() => {

    const currentSnapshot =
      createFormSnapshot(data);

    setHasUnsavedChanges(
      currentSnapshot !==
      initialFormSnapshot.current
    );

  }, [data]);


  const handleClientChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setClientData(prev => ({
      ...prev,
      [name]: value
    }));

  };


  const handleCreateClient = async () => {

    if (!clientData.name?.trim()) {

      notifyError(
        "Nombre requerido",
        "El cliente debe tener un nombre."
      );

      return false;

    }


    try {

      const newClientRef =
        await createClient(
          companyId,
          clientData,
          user
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


  useEffect(() => {

    const debounce =
      setTimeout(async () => {

        if (!searchTerm.trim()) {

          setSearchResults([]);

          return;

        }


        if (!companyId) {
          return;
        }


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


  useEffect(() => {

    if (!companyId) {
      return;
    }


    const loadSettings = async () => {

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


    loadSettings();

  }, [companyId]);


  useEffect(() => {

    let initialData;


    const restoredDraft =
      mode === "create"
        ? readDraft(draftKey)
        : null;


    if (mode === "create") {

      initialData =
        restoredDraft ||
        buildCreateForm(reservation);


      draftHydratedRef.current = true;

      setHasDraft(
        Boolean(restoredDraft)
      );

    }

    else {

      if (!reservation) {

        draftHydratedRef.current =
          false;

        setHasDraft(false);

        return;

      }


      initialData =
        buildEditForm(
          reservation
        );


      draftHydratedRef.current =
        false;

      setHasDraft(false);

    }


    skipNextDraftWriteRef.current =
      true;


    setData(initialData);


    previousServiceTypeIdRef.current =
      mode === "create" && !restoredDraft
        ? null
        : initialData.serviceTypeId || null;


    initialFormSnapshot.current =
      createFormSnapshot(
        initialData
      );


    setHasUnsavedChanges(false);

  }, [
    reservation,
    mode,
    draftKey
  ]);


  useEffect(() => {

    if (
      mode !== "create" ||
      !draftKey ||
      !draftHydratedRef.current
    ) {
      return;
    }


    if (
      skipNextDraftWriteRef.current
    ) {

      skipNextDraftWriteRef.current =
        false;

      return;

    }


    writeDraft(
      draftKey,
      data
    );


    setHasDraft(true);

  }, [
    data,
    mode,
    draftKey
  ]);


  const selectedServiceType =
    useMemo(() => {

      return serviceTypes.find(
        service =>
          service.id ===
          (data.serviceTypeId ?? "")
      );

    }, [
      serviceTypes,
      data.serviceTypeId
    ]);


  useEffect(() => {

    if (!selectedServiceType) {
      return;
    }


    const serviceTypeChanged =
      previousServiceTypeIdRef.current !==
      selectedServiceType.id;


    if (!serviceTypeChanged) {
      return;
    }


    previousServiceTypeIdRef.current =
      selectedServiceType.id;


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

      price: 0,

      currency:
        currencies[0]?.code || "",

      symbol:
        currencies[0]?.symbol || ""

    }));

  }, [
    selectedServiceType,
    currencies
  ]);


  const financial =
    calculateFinancials({
      data,
      taxes,
      discounts
    });


  const locationOptions =
    useMemo(
      () => buildOptions(locations),
      [locations]
    );


  const serviceTypeOptions =
    useMemo(
      () => buildOptions(serviceTypes),
      [serviceTypes]
    );


  const driverOptions =
    useMemo(
      () => buildOptions(drivers),
      [drivers]
    );


  const routeOptions =
    useMemo(
      () => buildOptions(
        routes,
        "code"
      ),
      [routes]
    );


  const vehicleOptions =
    useMemo(
      () => buildOptions(vehicles),
      [vehicles]
    );


  const bookingSourceOptions =
    useMemo(
      () => buildOptions(
        bookingSources
      ),
      [bookingSources]
    );


  const payerOptions =
    useMemo(
      () => buildOptions(payers),
      [payers]
    );


  const discountOptions =
    useMemo(() => [

      {
        value: "",
        label: "Sin descuento"
      },

      ...discounts
        .filter(discount => {

          if (
            discount.isActive === false
          ) {
            return false;
          }


          if (discount.expirationDate) {

            const expirationDate =
              typeof discount.expirationDate.toDate ===
              "function"
                ? discount.expirationDate.toDate()
                : new Date(
                    discount.expirationDate
                  );


            if (
              !Number.isNaN(
                expirationDate.getTime()
              ) &&
              expirationDate < new Date()
            ) {
              return false;
            }

          }


          return true;

        })
        .map(discount => ({

          value:
            discount.id,

          label:
            `${discount.name} (${
              discount.type === "percentage"
                ? `${discount.value}%`
                : `${discount.value} ${data.currency}`
            })`

        }))

    ], [
      discounts,
      data.currency
    ]);


  const paymentTypeOptions =
    useMemo(
      () =>
        paymentTypes.map(
          payment => ({
            value: payment.id,
            label: payment.name
          })
        ),
      [paymentTypes]
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
              agent.type,

            commissionType:
              agent.commissionType ||
              "percentage",

            commissionValue:
              Number(
                agent.commissionValue || 0
              )

          })
        ),
      [commissionAgents]
    );


  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setData(prev => {

      let newValue = value;


      if (name === "price") {

        newValue =
          value === ""
            ? ""
            : Number(value);

      }


      const updatedForm = {
        ...prev,
        [name]: newValue
      };


      if (name === "serviceTypeId") {

        const selectedService =
          serviceTypes.find(
            service =>
              service.id ===
              newValue
          );


        updatedForm.serviceTypeName =
          selectedService?.name || "";

      }


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
            service =>
              service.id ===
              serviceId
          );


        updatedForm.end =
          date &&
          selectedService?.durationMinutes
            ? getEndDate(
                date,
                selectedService.durationMinutes
              )
            : "";

      }


      if (
        name ===
        "commissionBeneficiaryId"
      ) {

        const agent =
          commissionAgents.find(
            item =>
              item.id ===
              newValue
          );


        if (agent) {

          updatedForm.commissionBeneficiaryName =
            agent.name;


          updatedForm.commissionBeneficiaryType =
            agent.type;


          updatedForm.commissionType =
            agent.commissionType ||
            "percentage";


          updatedForm.commissionValue =
            Number(
              agent.commissionValue || 0
            );


          if (!prev.discountId) {

            updatedForm.commissionBase =
              "original";

          }

          else if (
            !prev.commissionBase
          ) {

            updatedForm.commissionBase =
              "afterDiscount";

          }

        }

        else {

          updatedForm.commissionBeneficiaryName =
            "";


          updatedForm.commissionBeneficiaryType =
            "";


          updatedForm.commissionType =
            "percentage";


          updatedForm.commissionValue =
            0;

        }

      }


      if (name === "discountId") {

        if (!newValue) {

          updatedForm.commissionBase =
            "original";

        }

        else if (
          !prev.commissionBase ||
          prev.commissionBase === "original"
        ) {

          updatedForm.commissionBase =
            prev.commissionBase ||
            "afterDiscount";

        }

      }


      return updatedForm;

    });

  };


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
                id => id !== taxId
              )
            : [
                ...prev.activeTaxIds,
                taxId
              ]

      };

    });

  };


  const ensureReservationClient =
    async (currentData) => {

      if (currentData.clientId) {
        return currentData;
      }


      if (!companyId) {

        notifyError(
          "Error",
          "No se encontró la compañía de la reserva."
        );

        return null;

      }


      if (!currentData.clientName?.trim()) {

        notifyError(
          "Cliente requerido",
          "La reserva debe tener un nombre de cliente."
        );

        return null;

      }


      try {

        const client =
          await findOrCreateClient(

            companyId,

            {
              name:
                currentData.clientName.trim(),

              email:
                currentData.clientEmail?.trim() ||
                "",

              phone:
                currentData.phone?.trim() ||
                "",

              notes:
                currentData.notes?.trim() ||
                ""

            },

            user

          );


        if (!client?.id) {

          notifyError(
            "Cliente requerido",
            "No se pudo obtener o crear el cliente."
          );

          return null;

        }


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


        setData(updatedData);


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


  const validateReservation =
    (currentData = data) => {

      const validations = [

        [
          !currentData.clientId,
          "Cliente requerido"
        ],

        [
          !currentData.serviceTypeId,
          "Seleccione un tipo de servicio."
        ],

        [
          !currentData.date,
          "Fecha y hora requeridas."
        ],

        [
          !currentData.status,
          "Estado de la reserva requerido"
        ],

        [
          !currentData.locationFromId,
          "Lugar de recogida requerido"
        ],

        [
          !currentData.locationToId,
          "Lugar de destino requerido"
        ],

        [
          !currentData.passengers,
          "La cantidad de pasajeros es requerido."
        ],

        [
          !currentData.bookingSourceId,
          "Seleccione un origen de la reserva."
        ],

        [
          !currentData.price,
          "Debe ingresar un monto para esta reserva."
        ]

      ];


      const invalid =
        validations.find(
          ([condition]) => condition
        );


      if (invalid) {

        notifyError(
          invalid[1]
        );


        return false;

      }


      return true;

    };


  const getReservationNumber =
    async () => {

      if (mode !== "create") {
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


  const clearDraft = () => {

    removeDraft(draftKey);

    setHasDraft(false);


    if (mode !== "create") {
      return;
    }


    const freshForm =
      buildCreateForm(null);


    skipNextDraftWriteRef.current =
      true;


    setData(freshForm);


    previousServiceTypeIdRef.current =
      null;


    initialFormSnapshot.current =
      createFormSnapshot(
        freshForm
      );


    setHasUnsavedChanges(false);

  };


  const resetUnsavedChanges = () => {

    initialFormSnapshot.current =
      createFormSnapshot(data);


    setHasUnsavedChanges(false);

  };


  const handleSubmit = async () => {

    const dataToSave =
      await ensureReservationClient(
        data
      );


    if (!dataToSave) {
      return false;
    }


    if (
      !validateReservation(
        dataToSave
      )
    ) {
      return false;
    }


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


    const reservationDataToSave = {

      ...dataToSave,

      commissionBase:
        financial.commissionBase,

      commissionBaseAmount:
        financial.commissionBaseAmount,

      commissionAmount:
        financial.commissionAmount

    };


    let reservationData;


    try {

      reservationData =
        buildTransportationReservation({

          data: {
            ...reservationDataToSave,
            reservationNumber
          },

          reservationNumber,

          financial,

          settings: {

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


    try {

      const result =
        await onSave(
          reservationData
        );


      if (result === false) {
        return false;
      }


      if (mode === "create") {

        removeDraft(draftKey);
        setHasDraft(false);


        const freshForm =
          buildCreateForm(null);


        skipNextDraftWriteRef.current =
          true;


        setData(freshForm);


        previousServiceTypeIdRef.current =
          freshForm.serviceTypeId || null;


        initialFormSnapshot.current =
          createFormSnapshot(
            freshForm
          );

      }

      else {

        initialFormSnapshot.current =
          createFormSnapshot(
            reservationDataToSave
          );

      }


      setHasUnsavedChanges(false);


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


  return {

    form: {

      data,

      setData,

      selectedServiceType,

      hasUnsavedChanges,
      hasDraft,

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
      clearDraft,
      resetUnsavedChanges

    }

  };

}