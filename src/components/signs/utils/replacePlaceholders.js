export const replacePlaceholders = (
  text = "",
  signData = {}
) => {

  const placeholders = {
    "{{clientName}}": signData.clientName || "",

    "{{reservationDate}}":
      signData.reservationDate || "",

    "{{pickupLocation}}":
      signData.pickupLocation || "",

    "{{dropOff}}": signData.dropOff || "",

    "{{companyName}}":
      signData.companyName || "",

    "{{reservationNumber}}":
      signData.reservationNumber || "",
  };

  let parsedText = text;

  Object.entries(placeholders).forEach(([key, value]) => {

    parsedText = parsedText.replaceAll(key, value);
  });

  return parsedText;
};