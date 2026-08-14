/*
==========================================================
TRANSPORTATION CONSTANTS
==========================================================
*/

export const emptyForm = {

  /* ======================================================
     CLIENTE
  ====================================================== */

  clientId: null,
  clientName: "",
  clientEmail: "",
  phone: "",

  /* ======================================================
     SERVICIO
  ====================================================== */

  serviceTypeId: "",
  serviceTypeName: "",
  serviceCategory: "",

  routeId: "",
  routeCode: "",
  routeName: "",

  /* ======================================================
     LOCACIONES
  ====================================================== */

  locationFromId: "",
  locationFromName: "",

  locationToId: "",
  locationToName: "",

  /* ======================================================
     OPERACIÓN
  ====================================================== */

  service: "",

  date: "",
  endDate: "",

  status: "confirmed",

  passengers: 1,
  flightNumber: "",

  vehicleId: "",
  vehicleName: "",
  vehiclePlate: "",
  vehicleType: "",

  driverId: "",
  driverName: "",

  /* ======================================================
     FACTURACIÓN
  ====================================================== */

  bookingSourceId: "",
  bookingSourceName: "",

  payerId: "",
  payerName: "",

  paymentTypeId: "",
  paymentTypeName: "",

  paymentStatus: "",

  reservationBase: "",

  currency: "",
  symbol: "",

  // Precio base
  price: 0,

  // Descuento
  discountId: "",
  discountAmount: 0,

  // Impuestos
  activeTaxIds: [],
  taxAmount: 0,

  // Totales
  subtotal: 0,
  total: 0,

  /* ======================================================
     COMISIONES
  ====================================================== */

  commissionEnabled: false,

  commissionType: "percentage",
  commissionValue: 0,

  commissionBeneficiaryId: "",
  commissionBeneficiaryName: "",
  commissionBeneficiaryType: "person",

  commissionId: null,
  commissionAmount: 0,

  /* ======================================================
     NOTAS
  ====================================================== */

  notes: ""

};

/*
==========================================================
OPCIONES DE ESTADOS
==========================================================
*/

export const statusOptions = [
  {
    value: "confirmed",
    label: "Confirmada"
  },
  {
    value: "pending",
    label: "Pendiente"
  },
  {
    value: "assigned",
    label: "Asignada"
  },
  {
    value: "in_progress",
    label: "En progreso"
  },
  {
    value: "completed",
    label: "Completada"
  },
  {
    value: "cancelled",
    label: "Cancelada"
  }
];

/*
==========================================================
REACT SELECT - CONFIGURACION POR DEFECTO 
==========================================================
*/

export const selectPortal = {
  menuPortalTarget: document.body,
  menuPosition: "fixed",
  styles: {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    })
  }
};