import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import {
  createClient,
  searchClientsByName
} from "../../services/clients/clientService";
import { getServiceTypes } from "../../services/settings/serviceTypeService";
import { getLocations } from "../../services/settings/locationsService";
import { getTaxes } from "../../services/settings/taxService";
import { getDiscounts } from "../../services/settings/discountService";
import { getCurrencies } from "../../services/settings/currencyService";
import { reservationNumberExists } from "../../services/transportation/transportationService";

import { notifySuccess, notifyError } from "../../services/notificationService";
import "../../style/general/transportationModal.css";

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
    locationFromId: "",
    locationToId: "",

    service: "",
    date: "",
    endDate: "",
    status: "confirmed",
    notes: "",

    currency: "",
    price: 0,
    discountId: "",
    activeTaxIds: []
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


  useEffect(() => {
    if (!companyId) return;

    const load = async () => {
      const st = await getServiceTypes(companyId);
      const loc = await getLocations(companyId);
      const tx = await getTaxes(companyId);
      const ds = await getDiscounts(companyId);
      const cur = await getCurrencies(companyId);

      setServiceTypes(st.filter(s => s.isActive));
      setLocations(loc.filter(l => l.isActive));
      setTaxes(tx.filter(t => t.isActive));
      setDiscounts(ds.filter(d => d.isActive));
      setCurrencies(cur.filter(c => c.isActive));
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
        activeTaxIds: taxes.map(t => t.id),
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
      activeTaxIds:
        reservation.taxBreakdown?.map(t => t.taxId) || []
    });

  }, [reservation, mode, taxes]);

  // 2️⃣ 🔥 Cálculo automático de duración
  useEffect(() => {

    if (mode !== "create") return;

    if (!form.date) return;

    // Si ya tiene endDate (porque arrastró) no recalcular
    if (form.endDate) return;

    if (!form.serviceTypeId) return;

    const selectedService = serviceTypes.find(
      s => s.id === form.serviceTypeId
    );

    if (!selectedService?.durationMinutes) return;

    const start = new Date(form.date);

    const end = new Date(
      start.getTime() + selectedService.durationMinutes * 60000
    );

    const formattedEnd =
      end.getFullYear() +
      "-" +
      String(end.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(end.getDate()).padStart(2, "0") +
      "T" +
      String(end.getHours()).padStart(2, "0") +
      ":" +
      String(end.getMinutes()).padStart(2, "0");

    setForm(prev => ({
      ...prev,
      endDate: formattedEnd
    }));

  }, [form.date, form.serviceTypeId, mode, serviceTypes]);

  /* =======================
     SERVICE TYPE AUTO PRICE
  ======================== */

  const selectedServiceType = serviceTypes.find(
    s => s.id === form.serviceTypeId
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
     SERVICE TYPE AUTO ENDDATE
  ======================== */

  useEffect(() => {

    if (!form.date || !form.serviceTypeId) return;

    const selectedService = serviceTypes.find(
      (s) => s.id === form.serviceTypeId
    );

    if (!selectedService || !selectedService.durationMinutes) {
      setForm(prev => ({
        ...prev,
        endDate: form.date,
      }));
      return;
    }

    const start = new Date(form.date);
    const end = new Date(
      start.getTime() + selectedService.durationMinutes * 60000
    );

    const formattedEnd = end.toISOString().slice(0, 16);

    setForm(prev => ({
      ...prev,
      endDate: formattedEnd
    }));

  }, [form.date, form.serviceTypeId, serviceTypes]);


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

  const taxBreakdown = activeTaxes.map(t => {
    const rate = Number(t.rate || 0);
    const amount = subtotalAfterDiscount * (rate / 100);

    return {
      taxId: t.id,
      name: t.name,
      rate,
      amount: Number(amount.toFixed(2))
    };
  });

  const totalTax = taxBreakdown.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const total = Number(
    (Number(subtotalAfterDiscount || 0) + Number(totalTax || 0))
      .toFixed(2)
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

    setForm(prev => ({
        ...prev,
        [name]: name === "price" ? Number(value) : value
      }));
  };


  const toggleTax = (taxId) => {
    setForm(prev => ({
      ...prev,
      activeTaxIds: prev.activeTaxIds.includes(taxId)
        ? prev.activeTaxIds.filter(id => id !== taxId)
        : [...prev.activeTaxIds, taxId]
    }));
  };

const handleSubmit = async () => {

  if (!form.clientId) {
    notifyError("Cliente requerido");
    return;
  }

  if (!form.serviceTypeId) {
    notifyError("Selecciona tipo de servicio.");
    return;
  }

  let updatedForm = { ...form };

  // 🔹 Generar número solo si es nueva reserva
  if (mode === "create") {
      let newNumber;
      let exists = true;

      while (exists) {
        newNumber = generateReservationNumber();
        exists = await reservationNumberExists(companyId, newNumber);
      }

      updatedForm.reservationNumber = newNumber;
    }

    const financialData = {
      ...updatedForm,
      subtotal: updatedForm.price,
      discountAmount: Number(discountAmount.toFixed(2)),
      subtotalAfterDiscount: Number(subtotalAfterDiscount.toFixed(2)),
      taxBreakdown,
      totalTax,
      total
    };

    onSave(financialData);
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

  const safe = (value) => Number(value || 0).toFixed(2);

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

  const generateReservationNumber = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const unique = Date.now().toString().slice(-5); 

    return `TR-${year}${month}${day}-${unique}`;
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
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                }}
                name="serviceTypeId"
                options={serviceTypeOptions}
                value={
                  serviceTypeOptions.find(
                    (option) => option.value === form.serviceTypeId
                  ) || null
                }
                onChange={(selectedOption) =>
                  setForm({
                    ...form,
                    serviceTypeId: selectedOption?.value || ""
                  })
                }
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
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
              name="locationFromId"
              options={locationOptions}
              value={
                locationOptions.find(
                  (option) => option.value === form.locationFromId
                ) || null
              }
              onChange={(selectedOption) =>
                setForm({
                  ...form,
                  locationFromId: selectedOption?.value || ""
                })
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
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                }}
                name="locationToId"
                options={locationOptions}
                value={
                  locationOptions.find(
                    (option) => option.value === form.locationToId
                  ) || null
                }
                onChange={(selectedOption) =>
                  setForm({
                    ...form,
                    locationToId: selectedOption?.value || ""
                  })
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
                value={form.passengers || 1}
                onChange={handleChange}
              />

            </div>
            
          <div className="form-field">
            <label className="field-label">
              Información de reserva
            </label>
            <Select
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
              name="status"
              options={statusOptions}
              value={
                statusOptions.find(
                  (option) => option.value === form.status
                ) || null
              }
              onChange={(selectedOption) =>
                setForm({
                  ...form,
                  status: selectedOption?.value || ""
                })
              }
              isSearchable={false}
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
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 })
                  }}
                  name="discountId"
                  options={discountOptions}
                  value={
                    discountOptions.find(
                      (option) => option.value === (form.discountId || "")
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    setForm({
                      ...form,
                      discountId: selectedOption?.value || ""
                    })
                  }
                  placeholder="Sin descuento"
                  isSearchable={false}
                  isClearable
                />
              </div>
          
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

          {/* RESUMEN */}
          <div className="financial-summary">
            <p>Subtotal: {form.symbol} {safe(form.price)}</p>
            <p>Descuento: - {form.symbol} {safe(discountAmount)}</p>
            <p>Impuestos: {form.curresymbolncy} {safe(totalTax)}</p>
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
            <div className="inner-modal">
              <div className="inner-header">
                <h3>Crear cliente (CRM)</h3>
                <button className="close-btn" onClick={() => setShowClientModal(false)}>✕</button>
              </div>

              <div className="modal-section">
                <input
                  name="name"
                  placeholder="Nombre"
                  value={clientData.name}
                  onChange={handleClientChange}
                />

                <input
                  name="email"
                  placeholder="Email"
                  value={clientData.email}
                  onChange={handleClientChange}
                />

                <input
                  name="phone"
                  placeholder="Teléfono"
                  value={clientData.phone}
                  onChange={handleClientChange}
                />

                <textarea
                  name="notes"
                  placeholder="Notas"
                  value={clientData.notes}
                  onChange={handleClientChange}
                />
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowClientModal(false)}>
                  Cancelar
                </button>

                <button className="btn-primary" onClick={handleCreateClient}>
                  Guardar cliente
                </button>
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
