export const defaultSignTemplate = {
  id: "default-template",

  name: "Default Template",

  orientation: "landscape",

  canvas: {
    width: 1400,

    height: 900,

    orientation: "landscape",
  },

  background: {
    color: "#ffffff",
  },

  layers: [
    {
      id: "background-shape",

      type: "shape",

      x: 0,
      y: 0,

      width: 1400,
      height: 900,

      backgroundColor: "#ffffff",
    },

    {
      id: "company-name",

      type: "text",

      text: "{{companyName}}",

      x: 0,
      y: 80,

      width: 1400,
      height: 100,

      fontSize: 48,
      fontWeight: 700,
      color: "#111111",
      textAlign: "center",
      fontFamily: "Arial",
    },

    {
      id: "client-name",

      type: "text",

      text: "{{clientName}}",

      x: 100,
      y: 280,

      width: 1200,
      height: 300,

      fontSize: 140,
      fontWeight: 700,
      color: "#000000",
      textAlign: "center",
      fontFamily: "Arial",
    },

    {
      id: "pickup-location",

      type: "text",

      text: "{{pickupLocation}}",

      x: 0,
      y: 720,

      width: 1400,
      height: 80,

      fontSize: 42,
      fontWeight: 400,
      color: "#444444",
      textAlign: "center",
      fontFamily: "Arial",
    },
  ],

  version: 1,
};