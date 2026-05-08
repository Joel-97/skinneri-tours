export const replacePlaceholders = (
  text = "",
  signData = {}
) => {

  const placeholders = {

    "{{clientName}}":
      signData.clientName ??
      "Nombre del cliente",

    "{{clientEmail}}":
      signData.clientEmail ??
      "Correo electrónico",

    "{{phone}}":
      signData.phone ??
      "Número de teléfono",

    "{{reservationNumber}}":
      signData.reservationNumber ??
      "Número de reservación",

    "{{reservationDate}}":
      signData.dateString ??
      "Fecha de reservación",

    "{{passengers}}":
      signData.passengers ??
      "#",

    "{{serviceTypeName}}":
      signData.serviceTypeName ??
      "Tipo de servicio",

    "{{serviceCategory}}":
      signData.serviceCategory ??
      "Categoría del servicio",

    "{{status}}":
      signData.status ??
      "Estado",

    "{{subtotal}}":
      signData.subtotal != null
        ? `${signData.symbol || "$"}${signData.subtotal}`
        : "Subtotal",

    "{{taxAmount}}":
      signData.taxAmount != null
        ? `${signData.symbol || "$"}${signData.taxAmount}`
        : "Impuestos",

    "{{total}}":
      signData.total != null
        ? `${signData.symbol || "$"}${signData.total}`
        : "Total",

    "{{currency}}":
      signData.currency ??
      "Moneda",

    "{{symbol}}":
      signData.symbol ??
      "Símbolo de moneda",

    "{{notes}}":
      signData.notes ??
      "Notas",

    "{{staffName}}":
      signData.staffName ??
      "Nombre del staff",

    "{{title}}":
      signData.title ??
      "Título de la reserva",

    "{{companyName}}":
      signData.companyName ??
      "Nombre de la empresa",

    "{{locationFromName}}":
      signData.locationFromName ??
      "Lugar de recogida",

    "{{locationToName}}":
      signData.locationToName ??
      "Lugar de destino",

    "{{durationLabel}}":
      signData.durationLabel ??
      "Duración",
  };

  let parsedText = text;

  Object.entries(placeholders).forEach(
    ([key, value]) => {

      parsedText =
        parsedText.replaceAll(
          key,
          String(value)
        );
    }
  );

  return parsedText;
};