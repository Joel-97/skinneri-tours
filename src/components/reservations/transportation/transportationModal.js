import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import {
  createClient,
  searchClientsByName
} from "../../../services/clients/clientService";
import { getServiceTypes } from "../../../services/settings/general/serviceTypeService";
import { getLocations } from "../../../services/settings/transportation/locationsService";
import { getTaxes } from "../../../services/settings/general/taxService";
import { getDiscounts } from "../../../services/settings/transportation/discountService";
import { getCurrencies } from "../../../services/settings/general/currencyService";
import { getStaff } from "../../../services/settings/general/staffService";
import { reservationNumberExists } from "../../../services/transportation/transportationService";
import { getEndDate, generateReservationNumber, safe } from "../../../services/Tools";
import { getPaymentTypes } from "../../../services/settings/general/paymentTypeService";
import { getCommissionAgents  } from "../../../services/settings/general/agentsService";
import { getCommissionByBooking } from "../../../services/settings/general/commissionService";
import { notifySuccess, notifyError } from "../../../services/notificationService";
import "../../../style/general/transportationModal.css";

export default function TransportationModal({
  isOpen,
  onClose,
  onSave,
  reservation,
  mode = "create",
  user,
  companyId
}) {

   /* =======================
     FORM BASE (TUYO + NUEVO)
  ======================== */

  const emptyForm = {
    clientId: null,
    clientName: "",
    clientEmail: "",
    phone: "",

    serviceTypeId: "",
    serviceTypeName: "",
    serviceCategory: "",

    locationFromId: "",
    locationToId: "",

    service: "",
    date: "",
    endDate: "",
    status: "confirmed",
    notes: "",

    currency: "",

    // 💰 BASE
    price: 0,

    // 🔻 DESCUENTO
    discountId: "",
    discountAmount: 0,

    // 🧾 IMPUESTOS
    activeTaxIds: [],
    taxAmount: 0,

    // 🧮 RESULTADOS
    subtotal: 0,
    total: 0,

    // 👤 SNAPSHOTS
    staffId: "",
    staffName: "",

    paymentTypeId: "",
    paymentTypeName: "",

    // 💸 COMISIONES
    commissionEnabled: false,
    commissionType: "percentage",
    commissionValue: 0,

    commissionBeneficiaryId: "",
    commissionBeneficiaryName: "",
    commissionBeneficiaryType: "person",

    // 🔥 NUEVOS (PRO)
    commissionId: null,
    commissionAmount: 0
  };

  /* =======================
     SETTINGS
  ======================== */


  const [form, setForm] = useState(emptyForm);

  const [showClientModal, setShowClientModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [serviceTypes, setServiceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [staff, setStaff] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [commissionAgents, setCommissionAgents] = useState([]);
  const [existingCommission, setExistingCommission] = useState(null);

  useEffect(() => {
    if (!companyId) return;

    const load = async () => {

      const [
        st,
        loc,
        tx,
        ds,
        cur,
        dr,
        pt,
        ca // 🔥 NUEVO
      ] = await Promise.all([
        getServiceTypes(companyId, "transportation"),
        getLocations(companyId),
        getTaxes(companyId),
        getDiscounts(companyId),
        getCurrencies(companyId),
        getStaff(companyId),
        getPaymentTypes(companyId),
        getCommissionAgents(companyId) // 🔥 NUEVO
      ]);

      setServiceTypes(st.filter(s => s.isActive));
      setLocations(loc.filter(l => l.isActive));
      setTaxes(tx.filter(t => t.isActive));
      setDiscounts(ds.filter(d => d.isActive));
      setCurrencies(cur.filter(c => c.isActive));
      setStaff(dr.filter(d => d.isActive));
      setPaymentTypes(pt.filter(p => p.isActive));

      // 🔥 NUEVO
      setCommissionAgents(ca.filter(c => c.isActive));
    };

    load();
  }, [companyId]);

  /* =======================
     LOAD RESERVATION
  ======================== */
// 1️⃣ Inicializa el form
  useEffect(() => {

    const formatDate = (value) => {
      if (!value) return "";

      if (value.seconds) {
        return new Date(value.seconds * 1000)
          .toISOString()
          .slice(0, 16);
      }

      // Si ya viene como string YYYY-MM-DDTHH:mm
      if (typeof value === "string") {
        return value.slice(0, 16);
      }

      return new Date(value)
        .toISOString()
        .slice(0, 16);
    };

    // =========================
    // 🟢 CREATE MODE
    // =========================
    if (mode === "create") {

      setForm({
        ...emptyForm,
        ...reservation, // si viene del calendario
        date: formatDate(reservation?.date),
        endDate: formatDate(reservation?.endDate),
        //activeTaxIds: taxes.map(t => t.id),
        activeTaxIds: [],
        reservationNumber: generateReservationNumber()
      });

      return;
    }

    // =========================
    // 🔵 EDIT MODE
    // =========================
    if (!reservation) return;

  setForm({
    ...reservation,
    date: formatDate(reservation.date),
    endDate: formatDate(reservation.endDate),
    activeTaxIds: reservation.activeTaxIds || []
  });

  }, [reservation, mode, taxes]);

  const selectedServiceType = useMemo(() =>
    serviceTypes.find(s => s.id === form.serviceTypeId),
    [serviceTypes, form.serviceTypeId]
  );

  useEffect(() => {
    if (!selectedServiceType) return;

    if (selectedServiceType.pricingMode === "fixed") {
      setForm(prev => ({
        ...prev,
        price: selectedServiceType.basePrice,
        currency: selectedServiceType.currency,
        symbol: selectedServiceType.symbol,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        price: 0,
        currency: currencies[0]?.code || "",
        symbol: currencies[0]?.symbol || "",
      }));
    }
  }, [selectedServiceType]);

  /* =======================
    CARGA LAS COMISIONES LO BUSCA POR RESERVA
  ======================== */

  useEffect(() => {
    const loadCommission = async () => {
      if (!reservation?.id) return;

      const data = await getCommissionByBooking(companyId, reservation.id);

      if (data.length > 0) {
        setExistingCommission(data[0]);
      }
    };

    if (mode === "edit") {
      loadCommission();
    }

  }, [reservation, mode]);

  /* =======================
     DESCUENTO
  ======================== */

  const selectedDiscount = discounts.find(
    d => d.id === form.discountId
  );

  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;

    if (
      selectedDiscount.expirationDate &&
      typeof selectedDiscount.expirationDate.toDate === "function" &&
      selectedDiscount.expirationDate.toDate() < new Date()
    ) {
      return 0;
    }

    if (selectedDiscount.type === "percentage") {
      return form.price * (selectedDiscount.value / 100);
    }

    if (selectedDiscount.type === "fixed") {
      return selectedDiscount.value;
    }

    return 0;
  }, [selectedDiscount, form.price]);

  const subtotalAfterDiscount = Math.max(
    form.price - discountAmount,
    0
  );

  /* =======================
     IMPUESTOS EDITABLES
  ======================== */

  const activeTaxes = taxes.filter(t =>
    form.activeTaxIds.includes(t.id)
  );

  const taxBreakdown = useMemo(() => {

    return activeTaxes.map(t => {

      const rate = Number(t.rate || 0);
      const amount = subtotalAfterDiscount * (rate / 100);

      return {
        taxId: t.id,
        name: t.name,
        rate,
        amount: Number(amount.toFixed(2))
      };

    });

  }, [activeTaxes, subtotalAfterDiscount]);

  const totalTax = taxBreakdown.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const price = Number(form.price || 0);

  const discount = Number(discountAmount || 0);

  const baseForCommission = Number(
    (price - discount).toFixed(2)
  );

  const total = Number(
    (baseForCommission + Number(totalTax || 0)).toFixed(2)
  );


  /* ================= BUSCAR CLIENTE ================= */

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {

      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      if (!companyId) return;

      try {
        setIsSearching(true);
        const results = await searchClientsByName(companyId, searchTerm.trim());
        setSearchResults(results);
      } catch (error) {
        console.error("ERROR SEARCH:", error);
      } finally {
        setIsSearching(false);
      }

    }, 600);

    return () => clearTimeout(delayDebounce);

  }, [searchTerm, companyId]);

   /* =====================================================
     HANDLERS
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => {
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

        updatedForm.serviceTypeName = selectedService?.name || "";
      }

      /* =========================
        END DATE AUTO
      ========================== */

      if (name === "date" || name === "serviceTypeId") {

        const date = name === "date" ? newValue : prev.date;

        const serviceId =
          name === "serviceTypeId" ? newValue : prev.serviceTypeId;

        const selectedService = serviceTypes.find(
          s => s.id === serviceId
        );

        if (date && selectedService?.durationMinutes) {
          updatedForm.endDate = getEndDate(
            date,
            selectedService.durationMinutes
          );
        } else {
          updatedForm.endDate = "";
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
          updatedForm.commissionBeneficiaryName = agent.name;
          updatedForm.commissionBeneficiaryType = agent.type;

          // 🔥 AUTO CONFIGURACIÓN
          updatedForm.commissionType = agent.commissionType || "percentage";
          updatedForm.commissionValue = Number(agent.commissionValue || 0);
        }
      }

      return updatedForm;
    });
  };

  const toggleTax = (taxId) => {

    setForm(prev => {

      const exists = prev.activeTaxIds.includes(taxId);

      return {
        ...prev,
        activeTaxIds: exists
          ? prev.activeTaxIds.filter(id => id !== taxId)
          : [...prev.activeTaxIds, taxId]
      };

    });

  };

  const handleSubmit = async () => {

    if (!form.clientId) {
      notifyError("Cliente requerido");
      return;
    }

    if (!form.locationFromId) {
      notifyError("Lugar de recogida requerido");
      return;
    }

    if (!form.locationToId) {
      notifyError("Lugar de destino requerido");
      return;
    }

    if (!form.status) {
      notifyError("Estado de la reserva requerido");
      return;
    }

    if (!form.serviceTypeId) {
      notifyError("Selecciona tipo de servicio.");
      return;
    }

    let updatedForm = { ...form };

    /* =========================
      GENERAR NÚMERO
    ========================== */

    if (mode === "create") {
      let newNumber;
      let exists = true;

      while (exists) {
        newNumber = generateReservationNumber();
        exists = await reservationNumberExists(companyId, newNumber);
      }

      updatedForm.reservationNumber = newNumber;
    }

    /* =========================
      SNAPSHOTS
    ========================== */

    const selectedStaff = staff.find(d => d.id === form.staffId);
    const selectedPayment = paymentTypes.find(p => p.id === form.paymentTypeId);
    const selectedService = serviceTypes.find(s => s.id === form.serviceTypeId);

    /* =========================
      DATOS FINANCIEROS
    ========================== */

    const financialData = {
      ...updatedForm,

      subtotal: Number(form.price || 0),
      discountAmount: Number(discountAmount.toFixed(2)),
      taxAmount: Number(totalTax.toFixed(2)),
      total: Number(total.toFixed(2)),

      staffName: selectedStaff?.name || "",
      paymentTypeName: selectedPayment?.name || "",
      serviceCategory: selectedService?.category || "transport",
      serviceTypeName: selectedService?.name || "",

      dateString: form.date ? form.date.slice(0, 10) : "",
      month: form.date ? form.date.slice(0, 7) : "",
      year: form.date ? form.date.slice(0, 4) : ""
    };

    try {

      // 🔥 SOLO GUARDAR → delega TODO al padre
      await onSave(financialData);

    } catch (error) {

      console.error(error);
      notifyError("Error guardando reserva");

    }
  };

  const handleSelectClient = (client) => {
    setForm(prev => ({
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

  /* ================= CREAR CLIENTE ================= */

  const handleClientChange = (e) => {
    setClientData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateClient = async () => {

    if (!clientData.name?.trim()) {
      notifyError("Nombre requerido", "El cliente debe tener un nombre.");
      return;
    }

    try {

      const newClientRef = await createClient(clientData, user, companyId);

      const newClient = {
        id: newClientRef.id,
        ...clientData
      };

      setForm(prev => ({
        ...prev,
        clientId: newClient.id,
        clientName: newClient.name,
        clientEmail: newClient.email,
        phone: newClient.phone
      }));

      notifySuccess("Cliente creado", "El cliente fue creado correctamente.");

      setShowClientModal(false);
      setClientData({ name: "", email: "", phone: "", notes: "" });

    } catch (error) {
      console.error(error);
      notifyError("Error", "No se pudo crear el cliente.");
    }
  };

  const discountOptions = [
    {
      value: "",
      label: "Sin descuento"
    },
    ...discounts.map((discount) => ({
      value: discount.id,
      label: `${discount.name} (${
        discount.type === "percentage"
          ? `${discount.value}%`
          : `${discount.value} ${form.currency}`
      })`
    }))
  ];

  const locationOptions = useMemo(() =>
    locations.map((l) => ({
      value: l.id,
      label: l.name
    })),
  [locations]);

  const serviceTypeOptions = useMemo(() =>
    serviceTypes.map((st) => ({
      value: st.id,
      label: st.name
    })),
  [serviceTypes]);

  const statusOptions = [
    { value: "confirmed", label: "Confirmada" },
    { value: "pending", label: "Pendiente" },
    { value: "assigned", label: "Asignada" },
    { value: "in_progress", label: "En progreso" },
    { value: "completed", label: "Completada" },
    { value: "cancelled", label: "Cancelada" }
  ];

  const staffOptions = staff.map(staff => ({
    value: staff.id,
    label: staff.name
  }));

  const commissionOptions = useMemo(() => {
    return commissionAgents.map(a => ({
      value: a.id,
      label: a.name,
      type: a.type
    }));
  }, [commissionAgents]);

  const paymentTypeOptions = paymentTypes.map(p => ({
    value: p.id,
    label: p.name
  }));

  const selectPortal = {
    menuPortalTarget: document.body,
    menuPosition: "fixed",
    styles: {
      menuPortal: base => ({ ...base, zIndex: 9999 })
    }
  };

  const formatCurrency = (value, currency = "USD") => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency
    }).format(Number(value || 0));
  };

  if (!isOpen) return null;
  
  /* ================= UI ================= */

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target.classList.contains("modal-overlay")) {
          onClose();
        }
      }}
    >
      <div
        className="modal-card modern"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>
              {mode === "create" ? "Nueva reserva" : "Editar reserva"}
            </h2>

            {mode === "edit" && form.reservationNumber && (
              <span className="reservation-badge">
                #{form.reservationNumber}
              </span>
            )}
          </div>

          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* ================= SISTEMA ================= */}


        {/* CLIENTE */}
        <div className="modal-section section-card">
          <h4>Cliente</h4>

          <div className="client-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowSearchModal(true)}
            >
              🔍 Buscar cliente
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowClientModal(true)}
            >
              + Crear cliente nuevo
            </button>
          </div>

          <div className="form-grid compact">
            <input value={form.clientName} placeholder="Nombre" readOnly />
            <input value={form.clientEmail} placeholder="Correo" readOnly />
            <input value={form.phone} placeholder="Teléfono" readOnly />
          </div>
        </div>

        {/* SERVICIO */}
        <div className="modal-section section-card">
          <h4 className="section-title">Servicio</h4>

          <div className="form-grid two-columns">

            {/* TIPO DE RESERVA */}
            <div className="form-field">
              <label className="field-label">
                Tipo de reserva <span className="required">*</span>
              </label>

              <Select
                {...selectPortal}
                name="serviceTypeId"
                options={serviceTypeOptions}
                value={
                  serviceTypeOptions.find(
                    (option) => option.value === form.serviceTypeId
                  ) || null
                }
                onChange={(selectedOption) => {
                  handleChange({
                    target: {
                      name: "serviceTypeId",
                      value: selectedOption?.value || ""
                    }
                  });
                }}
                placeholder="Seleccionar tipo"
                isClearable
                isSearchable
              />
            </div>

            {/* FECHA Y HORA */}
            <div className="form-field">
              <label className="field-label">
                Fecha y hora <span className="required">*</span>
              </label>

              <input
                type="datetime-local"
                name="date"
                value={form.date || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>

          </div>

          <div className="form-grid two-columns">
            <div className="form-field">
              <label className="field-label">
                Lugar de recogida <span className="required">*</span>
              </label>
            <Select
              {...selectPortal}
              name="locationFromId"
              options={locationOptions}
              value={
                locationOptions.find(
                  (option) => option.value === form.locationFromId
                ) || null
              }
              onChange={(selectedOption) =>
              setForm(prev => ({
                ...prev,
                locationFromId: selectedOption?.value || ""
              }))
              }
              placeholder="Recogida"
              isClearable
              isSearchable
            />
            </div>

            <div className="form-field">
              <label className="field-label">
                Lugar de destino <span className="required">*</span>
              </label>
              <Select
                {...selectPortal}
                name="locationToId"
                options={locationOptions}
                value={
                  locationOptions.find(
                    (option) => option.value === form.locationToId
                  ) || null
                }
                onChange={(selectedOption) =>
                setForm(prev => ({
                  ...prev,
                  locationToId: selectedOption?.value || ""
                }))
                }
                placeholder="Destino"
                isClearable
                isSearchable
              />
            </div>
          </div>

          {/* NUEVOS CAMPOS OPERATIVOS */}
          <div className="form-grid two-columns">
            <div className="form-field">
              <label className="field-label">
                Cantidad de Pasajeros <span className="required">*</span>
              </label>

              <input
                type="number"
                name="passengers"
                placeholder="Pasajeros"
                value={form.passengers ?? 1}
                onChange={handleChange}
              />

            </div>
            
            <div className="form-field">
              <label className="field-label">
                Estado de la reserva <span className="required">*</span>
              </label>
              <Select
                {...selectPortal}
                name="status"
                options={statusOptions}
                value={
                  statusOptions.find(
                    (option) => option.value === form.status
                  ) || null
                }
                onChange={(selectedOption) =>
                setForm(prev => ({
                  ...prev,
                  status: selectedOption?.value || ""
                }))
                }
                isSearchable={false}
              />
            </div>
          </div>

          <div className="form-grid two-columns">
                        
            <div className="form-field">
              <label className="field-label">
                Nº de vuelo 
              </label>

              <input
                type="text"
                name="flightNumber"
                placeholder="Ej: AA1337"
                value={form.flightNumber}
                onChange={handleChange}
              />
            
            </div>

            <div className="form-field">
              <label className="field-label">
                Colaborador asignado
              </label>

              <Select
                options={staffOptions}
                value={staffOptions.find(
                  option => option.value === form.staffId
                ) || null}
                onChange={(selectedOption) =>
                setForm(prev => ({
                  ...prev,
                  staffId: selectedOption?.value || ""
                }))
                }
                placeholder="Seleccionar colaborador"
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable
              />

            </div>

          </div>

        </div>


        {/* FINANZAS */}
        <div className="modal-section section-card">
          <h4>Facturación</h4>
          <div className="form-grid two-columns">

           <div className="form-field">
              <label className="field-label">
                Descuento <span className="required">*</span>
              </label>
              <div className="form-field">
                <Select
                  {...selectPortal}
                  name="discountId"
                  options={discountOptions}
                  value={
                    discountOptions.find(
                      (option) => option.value === (form.discountId || "")
                    ) || null
                  }
                  onChange={(selectedOption) =>
                  setForm(prev => ({
                    ...prev,
                    discountId: selectedOption?.value || ""
                  }))
                  }
                  placeholder="Sin descuento"
                  isSearchable={false}
                  isClearable
                />
              </div>
          
            </div>

            <div className="form-field">

              <label className="field-label">
                Tipo de pago
              </label>

              <Select
                {...selectPortal}
                options={paymentTypeOptions}
                value={
                  paymentTypeOptions.find(
                    option => option.value === form.paymentTypeId
                  ) || null
                }
                onChange={(selectedOption) =>
                  setForm(prev => ({
                    ...prev,
                    paymentTypeId: selectedOption?.value || ""
                  }))
                }
                placeholder="Seleccionar tipo de pago"
                isClearable
              />

            </div>


           <div className="form-field">
              <label className="field-label">
                Monto <span className="required">*</span>
              </label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">
                  {form.symbol || form.currency}
                </span>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Precio"
                  className="price-input"
                />
              </div>
            </div>
            
          </div>

          {/* IMPUESTOS EDITABLES */}
          <div className="tax-list">
            {taxes.map(t => (
              <label key={t.id} className="tax-item">
                <input
                  type="checkbox"
                  checked={form.activeTaxIds.includes(t.id)}
                  onChange={() => toggleTax(t.id)}
                />
                {t.name} ({t.rate}%)
              </label>
            ))}
          </div>

          {/* ================= COMISIONES ================= */}
          <div className="modal-section section-card m-top">
            <h4>Comisión</h4>

            {/* ACTIVAR */}
            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={form.commissionEnabled}
                  onChange={(e) =>
                    setForm(prev => ({
                      ...prev,
                      commissionEnabled: e.target.checked,

                      // 🔥 reset si se desactiva
                      ...(e.target.checked === false && {
                        commissionBeneficiaryId: "",
                        commissionBeneficiaryName: "",
                        commissionBeneficiaryType: "",
                        commissionType: "percentage",
                        commissionValue: 0
                      })
                    }))
                  }
                />
                Aplicar comisión
              </label>
            </div>

            {form.commissionEnabled && (
              <div className="form-grid two-columns">

                {/* COMISIONISTA */}
                <div className="form-field">
                  <label className="field-label">
                    Comisionista
                  </label>

                  <Select
                    options={commissionOptions}
                    value={
                      commissionOptions.find(
                        o => o.value === form.commissionBeneficiaryId
                      ) || null
                    }
                    onChange={(selected) => {

                      // 🔥 buscar agente completo
                      const agent = commissionAgents.find(a => a.id === selected?.value);

                      setForm(prev => ({
                        ...prev,

                        commissionBeneficiaryId: selected?.value || "",
                        commissionBeneficiaryName: selected?.label || "",
                        commissionBeneficiaryType: selected?.type || "",

                        // 🔥 AUTO-SET (CLAVE)
                        commissionType: agent?.commissionType || "percentage",
                        commissionValue: agent?.commissionValue || 0
                      }));
                    }}
                    placeholder="Seleccionar"
                    isClearable
                  />
                </div>

                {/* TIPO (AUTO PERO EDITABLE) */}
                {/* <div className="form-field">
                  <label className="field-label">
                    Tipo de comisión
                  </label>

                  <Select
                    options={[
                      { value: "percentage", label: "Porcentaje (%)" },
                      { value: "fixed", label: "Monto fijo" }
                    ]}
                    value={{
                      value: form.commissionType,
                      label:
                        form.commissionType === "percentage"
                          ? "Porcentaje (%)"
                          : "Monto fijo"
                    }}
                    onChange={(selected) =>
                      setForm(prev => ({
                        ...prev,
                        commissionType: selected.value
                      }))
                    }
                    isSearchable={false}
                  />
                </div> */}

                {/* VALOR */}
                {/* <div className="form-field">
                  <label className="field-label">
                    Valor
                  </label>

                  <input
                    type="number"
                    value={form.commissionValue}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        commissionValue: Number(e.target.value)
                      }))
                    }
                    placeholder={
                      form.commissionType === "percentage"
                        ? "Ej: 10 (%)"
                        : "Ej: 5000"
                    }
                  />
                </div> */}

                {/* 🔥 PREVIEW (MUY IMPORTANTE UX) */}
                <div className="form-field full-width">
                  <label className="field-label">Comisión estimada</label>

                  <div className="commission-preview">

                    {form.commissionType === "percentage"
                      ? `${form.commissionValue || 0}% de ${formatCurrency(baseForCommission)}`
                      : `${formatCurrency(form.commissionValue || 0)} fijo`
                    }

                    <strong>
                      {" → "}
                      {formatCurrency(
                        form.commissionType === "percentage"
                          ? (baseForCommission * (form.commissionValue || 0)) / 100
                          : form.commissionValue || 0
                      )}
                    </strong>

                  </div>
                </div>

              </div>
            )}
          </div>

          {/* RESUMEN */}
          <div className="financial-summary">
            <p>Subtotal: {form.symbol} {safe(form.price)}</p>
            <p>Descuento: - {form.symbol} {safe(discountAmount)}</p>
            <p>Impuestos: {form.symbol} {safe(totalTax)}</p>
            <hr />
            <p className="total">
              Total: {form.symbol} {safe(total)}
            </p>
          </div>
        </div>

        {/* NOTAS */}
        <div className="modal-section full-width">
          <h4>Notas</h4>
          <textarea
            className="notes-textarea"
            name="notes"
            placeholder="Notas internas de la reserva..."
            value={form.notes}
            onChange={handleChange}
          />
        </div>



          {/* ================= BUSCAR CLIENTE MODAL ================= */}
          {showSearchModal && (
            <div className="inner-modal search-modal">

              <div className="inner-header">
                <h3>Buscar cliente</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowSearchModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* Input con estilo mejorado */}
              <div className="search-input-wrapper">
                <input
                  placeholder="Escribe el nombre del cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Estado cargando */}
              {isSearching && (
                <div className="search-loading">
                  Buscando clientes...
                </div>
              )}

              {/* Resultados */}
              {!isSearching && searchTerm && searchResults.length === 0 && (
                <div className="search-empty">
                  No se encontraron clientes.
                </div>
              )}

              <div className="search-results">
                {searchResults.map(client => (
                  <div
                    key={client.id}
                    className="search-item"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="search-name">
                      {client.name}
                    </div>
                    <div className="search-email">
                      {client.email || "Sin correo"}
                    </div>
                    <div className="search-phone">
                      {client.phone || ""}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ================= CREAR CLIENTE MODAL ================= */}
          {showClientModal && (
            <div className="client-modal-overlay">

              <div className="client-modal">

                <div className="client-modal-header">
                  <h3>Nuevo cliente</h3>
                  <button
                    className="client-modal-close"
                    onClick={() => setShowClientModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="client-modal-body">

                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      name="name"
                      placeholder="Ej: María González"
                      value={clientData.name}
                      onChange={handleClientChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      name="email"
                      placeholder="correo@ejemplo.com"
                      value={clientData.email}
                      onChange={handleClientChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      name="phone"
                      placeholder="+506 8888 8888"
                      value={clientData.phone}
                      onChange={handleClientChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Notas</label>
                    <textarea
                      name="notes"
                      placeholder="Información adicional del cliente..."
                      value={clientData.notes}
                      onChange={handleClientChange}
                      rows="3"
                    />
                  </div>

                </div>

                <div className="client-modal-footer">

                  <button
                    className="btn-secondary"
                    onClick={() => setShowClientModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn-primary"
                    onClick={handleCreateClient}
                  >
                    Guardar cliente
                  </button>

                </div>

              </div>

            </div>
          )}


        {/* FOOTER */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>

          <button onClick={handleSubmit} className="btn-primary">
            {mode === "create" ? "Crear reserva" : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}
