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
import { getCommissionAgents  } from "../../../services/settings/general/agentsService";

import { reservationNumberExists } from "../../../services/adventure/adventureService";

import { getEndDate, generateReservationNumber, safe, formatCurrency } from "../../../services/Tools";

import { getPaymentTypes } from "../../../services/settings/general/paymentTypeService";

import { notifySuccess, notifyError } from "../../../services/notificationService";
import "../../../style/general/adventureModal.css";

export default function AdventureModal({
  isOpen,
  onClose,
  onSave,
  reservation,
  mode = "create",
  user,
  companyId
}) {

  /* ================= FORM BASE ================= */

  const emptyForm = {
    clientId: null,
    clientName: "",
    clientEmail: "",
    phone: "",

    serviceTypeId: "",
    serviceTypeName: "",
    serviceCategory: "adventure",

    // locationId: "",

    date: "",
    endDate: "",
    status: "confirmed",
    notes: "",

    currency: "",
    price: 0,

    // 🔥 NUEVO (CLAVE)
    pricingType: "per_booking", // per_booking | per_person

    discountId: "",
    discountAmount: 0,

    activeTaxIds: [],
    taxAmount: 0,

    subtotal: 0,
    total: 0,

    staffId: "",
    staffName: "",

    paymentTypeId: "",
    paymentTypeName: "",

    pax: 1
  };

  /* ================= STATE ================= */

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

  /* ================= LOAD SETTINGS ================= */

  useEffect(() => {
    if (!companyId) return;

    const load = async () => {
      const [st, loc, tx, ds, cur, sf, pt, ca] = await Promise.all([
        getServiceTypes(companyId, "adventure"),
        getLocations(companyId),
        getTaxes(companyId),
        getDiscounts(companyId),
        getCurrencies(companyId),
        getStaff(companyId),
        getPaymentTypes(companyId),
        getCommissionAgents(companyId) 
        
      ]);

      setServiceTypes(st.filter(s => s.isActive));
      setLocations(loc.filter(l => l.isActive));
      setTaxes(tx.filter(t => t.isActive));
      setDiscounts(ds.filter(d => d.isActive));
      setCurrencies(cur.filter(c => c.isActive));
      setStaff(sf.filter(s => s.isActive));
      setPaymentTypes(pt.filter(p => p.isActive));
      setCommissionAgents(ca.filter(c => c.isActive));
    };

    load();
  }, [companyId]);

  /* ================= LOAD RESERVATION ================= */

  useEffect(() => {

    const formatDate = (value) => {
      if (!value) return "";

      if (value.seconds) {
        return new Date(value.seconds * 1000).toISOString().slice(0, 16);
      }

      if (typeof value === "string") return value.slice(0, 16);

      return new Date(value).toISOString().slice(0, 16);
    };

    if (mode === "create") {
      setForm({
        ...emptyForm,
        ...reservation,
        date: formatDate(reservation?.date),
        endDate: formatDate(reservation?.endDate),
        activeTaxIds: [],
        reservationNumber: generateReservationNumber()
      });
      return;
    }

    if (!reservation) return;

    setForm({
      ...reservation,
      date: formatDate(reservation.date),
      endDate: formatDate(reservation.endDate),
      activeTaxIds: reservation.activeTaxIds || []
    });

  }, [reservation, mode]);

  /* ================= SERVICE ================= */

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

        // 🔥 FALTA ESTO
        pricingType: selectedServiceType.pricingType || "per_booking"
      }));
    }
  }, [selectedServiceType]);

  /* ================= DESCUENTO ================= */

  const selectedDiscount = discounts.find(d => d.id === form.discountId);

  const baseTotal = form.price * form.pax;

  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;

    if (selectedDiscount.type === "percentage") {
      return baseTotal * (selectedDiscount.value / 100);
    }

    return selectedDiscount.value;
  }, [selectedDiscount, baseTotal]);

  //const subtotalAfterDiscount = Math.max(baseTotal - discountAmount, 0);

  /* ================= IMPUESTOS ================= */

  // 🔥 PRECIO BASE
  const price = Number(form.price || 0);
  const pax = Number(form.pax || 1);

  // 🔥 BASE SEGÚN TIPO DE PRECIO
  const basePrice =
    form.pricingType === "per_person"
      ? price * pax
      : price;

  // 🔥 DESCUENTO
  const discount = Number(discountAmount || 0);

  // 🔥 SUBTOTAL DESPUÉS DE DESCUENTO
  const subtotalAfterDiscount = Number(
    (basePrice - discount).toFixed(2)
  );

  // 🔥 IMPUESTOS ACTIVOS
  const activeTaxes = taxes.filter(t =>
    form.activeTaxIds.includes(t.id)
  );

  // 🔥 TOTAL IMPUESTOS
  const totalTax = activeTaxes.reduce(
    (sum, t) => sum + (subtotalAfterDiscount * (t.rate / 100)),
    0
  );

  // 🔥 BASE PARA COMISIÓN (SIN IMPUESTOS)
  const baseForCommission = subtotalAfterDiscount;

  // 🔥 TOTAL FINAL
  const total = subtotalAfterDiscount + totalTax;

  /* ================= CLIENT SEARCH ================= */

  useEffect(() => {
    const delay = setTimeout(async () => {

      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchClientsByName(companyId, searchTerm.trim());
        setSearchResults(results);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }

    }, 600);

    return () => clearTimeout(delay);

  }, [searchTerm, companyId]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {

    console.log(form);

    const { name, value } = e.target;

    setForm(prev => {

      let newValue = value;

      // 🔢 números
      if (name === "price" || name === "pax") {
        newValue = value === "" ? "" : Number(value);
      }

      let updatedForm = {
        ...prev,
        [name]: newValue
      };

      /* =========================
        END DATE AUTO
      ========================== */

      if (name === "date" || name === "serviceTypeId") {

        const date = name === "date" ? newValue : prev.date;

        const serviceId =
          name === "serviceTypeId"
            ? newValue
            : prev.serviceTypeId;

        const selectedService = serviceTypes.find(
          s => s.id === serviceId
        );

        if (selectedService) {

          // 🔥 IMPORTANTE: traer pricingType desde el servicio
          updatedForm.pricingType =
            selectedService.pricingType || "per_booking";

          if (selectedService.pricingMode === "fixed") {
            updatedForm.price = selectedService.basePrice || 0;
            updatedForm.currency = selectedService.currency || "";
            updatedForm.symbol = selectedService.symbol || "";
          }

          if (date && selectedService?.durationMinutes) {
            updatedForm.endDate = getEndDate(
              date,
              selectedService.durationMinutes
            );
          }
        }
      }

      /* =========================
        🔥 COMISIONISTA AUTO
      ========================== */

      if (name === "commissionBeneficiaryId") {

        const agent = commissionAgents.find(
          a => a.id === newValue
        );

        if (agent) {
          updatedForm.commissionBeneficiaryName = agent.name;
          updatedForm.commissionBeneficiaryType = agent.type;

          updatedForm.commissionType = agent.commissionType || "percentage";
          updatedForm.commissionValue = Number(agent.commissionValue || 0);

          updatedForm.commissionEnabled = true;
        } else {
          updatedForm.commissionEnabled = false;
        }
      }

      return updatedForm;

    });
  };

  const handleSubmit = async () => {

    if (!form.clientId) return notifyError("Cliente requerido");
    if (!form.serviceTypeId) return notifyError("Selecciona el tour");

    let updatedForm = { ...form };

    /* =========================
      GENERAR NÚMERO
    ========================== */

    if (mode === "create") {
      let exists = true;

      while (exists) {
        const num = generateReservationNumber("adventure");
        exists = await reservationNumberExists(companyId, num);
        if (!exists) updatedForm.reservationNumber = num;
      }
    }

    /* =========================
      SNAPSHOTS
    ========================== */

    const selectedStaff = staff.find(s => s.id === form.staffId);
    const selectedPayment = paymentTypes.find(p => p.id === form.paymentTypeId);
    const selectedService = serviceTypes.find(s => s.id === form.serviceTypeId);

    /* =========================
      🔥 BASE SEGÚN pricingType
    ========================== */

    const price = Number(form.price || 0);
    const pax = Number(form.pax || 1);

    const basePrice =
      form.pricingType === "per_person"
        ? price * pax
        : price;

    /* =========================
      DATOS FINANCIEROS
    ========================== */

    const financialData = {
      ...updatedForm,

      // 🔥 CLAVE: ahora sí respeta pricingType
      subtotal: Number(basePrice || 0),

      discountAmount: Number(discountAmount || 0),
      taxAmount: Number(totalTax || 0),
      total: Number(total || 0),

      staffName: selectedStaff?.name || "",
      paymentTypeName: selectedPayment?.name || "",

      serviceCategory: selectedService?.category || "adventure",
      serviceTypeName: selectedService?.name || "",

      dateString: form.date ? form.date.slice(0, 10) : "",
      month: form.date ? form.date.slice(0, 7) : "",
      year: form.date ? form.date.slice(0, 4) : ""
    };

    try {

      // 🔥 delega todo (incluye comisiones)
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

  const handleClientChange = (e) => {
    setClientData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateClient = async () => {

    if (!clientData.name?.trim()) {
      notifyError("Nombre requerido");
      return;
    }

    try {
      const ref = await createClient(clientData, user, companyId);

      setForm(prev => ({
        ...prev,
        clientId: ref.id,
        clientName: clientData.name,
        clientEmail: clientData.email,
        phone: clientData.phone
      }));

      notifySuccess("Cliente creado");

      setShowClientModal(false);
      setClientData({ name: "", email: "", phone: "", notes: "" });

    } catch (error) {
      notifyError("Error creando cliente");
    }
  };

  const toggleTax = (taxId) => {
    setForm(prev => ({
      ...prev,
      activeTaxIds: prev.activeTaxIds.includes(taxId)
        ? prev.activeTaxIds.filter(id => id !== taxId)
        : [...prev.activeTaxIds, taxId]
    }));
  };

  /* ================= OPTIONS ================= */

  // const locationOptions = locations.map(l => ({
  //   value: l.id,
  //   label: l.name
  // }));

  const serviceTypeOptions = serviceTypes.map(st => ({
    value: st.id,
    label: st.name
  }));

  const staffOptions = staff.map(s => ({
    value: s.id,
    label: s.name
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

  const discountOptions = [
    { value: "", label: "Sin descuento" },
    ...discounts.map(d => ({
      value: d.id,
      label: d.name
    }))
  ];

  const statusOptions = [
    { value: "confirmed", label: "Confirmada" },
    { value: "pending", label: "Pendiente" },
    { value: "completed", label: "Completada" },
    { value: "cancelled", label: "Cancelada" }
  ];

  const selectPortal = {
    menuPortalTarget: document.body,
    menuPosition: "fixed",
    styles: {
      menuPortal: base => ({ ...base, zIndex: 9999 })
    }
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
              {mode === "create" ? "Nuevo tour" : "Editar tour"}
            </h2>

            {mode === "edit" && form.reservationNumber && (
              <span className="reservation-badge">
                #{form.reservationNumber}
              </span>
            )}
          </div>

          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* ================= CLIENTE ================= */}

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

        {/* ================= SERVICIO ================= */}

        <div className="modal-section section-card">
          <h4 className="section-title">Servicio</h4>

          <div className="form-grid two-columns">

            <div className="form-field">
              <label className="field-label">
                Tour <span className="required">*</span>
              </label>

              <Select
                {...selectPortal}
                options={serviceTypeOptions}
                value={
                  serviceTypeOptions.find(
                    o => o.value === form.serviceTypeId
                  ) || null
                }
                onChange={(opt) =>
                  setForm(prev => ({
                    ...prev,
                    serviceTypeId: opt?.value || "",
                    serviceTypeName: opt?.label || ""
                  }))
                }
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                Fecha y hora <span className="required">*</span>
              </label>

              <input
                type="datetime-local"
                name="date"
                value={form.date || ""}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* <div className="form-field">
            <label className="field-label">
              Ubicación <span className="required">*</span>
            </label>

            <Select
              {...selectPortal}
              options={locationOptions}
              value={
                locationOptions.find(
                  o => o.value === form.locationId
                ) || null
              }
              onChange={(opt) =>
                setForm(prev => ({
                  ...prev,
                  locationId: opt?.value || ""
                }))
              }
            />
          </div> */}

          <div className="form-grid two-columns">

          <div className="form-field">
          <label className="field-label">
            {form.pricingType === "per_person"
              ? "Cantidad de personas *"
              : "Personas (no afecta el precio)"}
          </label>

            <input
              type="number"
              name="pax"
              value={form.pax ?? 1}
              onChange={handleChange}
              min="1"
            />
          </div>

            <div className="form-field">
              <label className="field-label">
                Estado <span className="required">*</span>
              </label>

              <Select
                {...selectPortal}
                options={statusOptions}
                value={
                  statusOptions.find(o => o.value === form.status) || null
                }
                onChange={(opt) =>
                  setForm(prev => ({
                    ...prev,
                    status: opt?.value || ""
                  }))
                }
              />
            </div>

          </div>

          <div className="form-grid two-columns">
            <div className="form-field">
              <label className="field-label">
                Colaborador asignado
              </label>

              <Select
                options={staffOptions}
                value={
                  staffOptions.find(o => o.value === form.staffId) || null
                }
                onChange={(opt) =>
                  setForm(prev => ({
                    ...prev,
                    staffId: opt?.value || ""
                  }))
                }
                isClearable
              />
            </div>
            
            <div className="form-field"></div>
          </div>

        </div>

        {/* ================= FINANZAS ================= */}

        <div className="modal-section section-card">
          <h4>Facturación</h4>

          <div className="form-grid two-columns">

            <div className="form-field">
              <label className="field-label">Descuento</label>

              <Select
                {...selectPortal}
                options={discountOptions}
                value={
                  discountOptions.find(
                    o => o.value === form.discountId
                  ) || null
                }
                onChange={(opt) =>
                  setForm(prev => ({
                    ...prev,
                    discountId: opt?.value || ""
                  }))
                }
              />
            </div>

            <div className="form-field">
              <label className="field-label">Tipo de pago</label>

              <Select
                {...selectPortal}
                options={paymentTypeOptions}
                value={
                  paymentTypeOptions.find(
                    o => o.value === form.paymentTypeId
                  ) || null
                }
                onChange={(opt) =>
                  setForm(prev => ({
                    ...prev,
                    paymentTypeId: opt?.value || ""
                  }))
                }
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                Precio <span className="required">*</span>
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
                  className="price-input"
                />
              </div>
            </div>

          </div>

          {/* TAXES */}
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

          {/* SUMMARY */}
          <div className="financial-summary">

            <p>
              Subtotal: $ {
                safe(basePrice)
              }
            </p>

            {form.pricingType === "per_person" && (
              <p className="hint">
                {form.pax} x $ {safe(form.price)} = $ {safe(basePrice)}
              </p>
            )}

            <p>Descuento: - $ {safe(discountAmount)}</p>

            <p>Impuestos: $ {safe(totalTax)}</p>

            <hr />

            <p className="total">
              Total: $ {safe(total)}
            </p>

          </div>
          
        </div>

        {/* NOTAS */}
        <div className="modal-section full-width">
          <h4>Notas</h4>
          <textarea
            className="notes-textarea"
            name="notes"
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
            {mode === "create" ? "Crear tour" : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  );
  
}