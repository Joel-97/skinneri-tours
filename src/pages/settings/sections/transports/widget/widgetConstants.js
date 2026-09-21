/*
==========================================================
TRANSPORTATION WIDGET
EDITOR CONSTANTS
==========================================================
*/


/*
==========================================================
DEFAULT APPEARANCE
==========================================================

IMPORTANT:

primaryColor is NOT part of the Widget appearance.

It is inherited from:

companies/{companyId}.primaryColor
==========================================================
*/

export const DEFAULT_APPEARANCE = Object.freeze({

  backgroundColor:
    "#FFFFFF",

  textColor:
    "#111827",

  fieldBackgroundColor:
    "#FFFFFF",

  borderRadius:
    8,

  fontFamily:
    "Inter",

  buttonStyle:
    "filled"

});


/*
==========================================================
DEFAULT COMPANY BRANDING
==========================================================
*/

export const DEFAULT_COMPANY_BRANDING = Object.freeze({

  name:
    "",

  logoURL:
    "",

  primaryColor:
    "#2563EB"

});


/*
==========================================================
FONT OPTIONS
==========================================================
*/

export const FONT_OPTIONS = [

  {
    value:
      "Inter",

    label:
      "Inter"
  },

  {
    value:
      "Arial",

    label:
      "Arial"
  },

  {
    value:
      "Helvetica",

    label:
      "Helvetica"
  },

  {
    value:
      "system-ui",

    label:
      "System"
  }

];


/*
==========================================================
BUTTON STYLE OPTIONS
==========================================================
*/

export const BUTTON_STYLE_OPTIONS = [

  {
    value:
      "filled",

    label:
      "Relleno"
  },

  {
    value:
      "outline",

    label:
      "Contorno"
  }

];