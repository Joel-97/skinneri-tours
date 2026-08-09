/*
==========================================================
IMPORTS
==========================================================
*/

import {

  createContext,
  useContext,
  useMemo,
  useState

} from "react";

import es from "../locales/es";
import en from "../locales/en";

/*
==========================================================
AVAILABLE LANGUAGES
==========================================================
*/

const LANGUAGES = {

  es,

  en

};

/*
==========================================================
DEFAULT LANGUAGE
==========================================================
*/

const DEFAULT_LANGUAGE = "es";

/*
==========================================================
CONTEXT
==========================================================
*/

const LanguageContext =

  createContext(null);

/*
==========================================================
PROVIDER
==========================================================
*/

export function LanguageProvider({

  children

}) {

  /*
  ==========================================================
  LANGUAGE

  V1:
  El idioma permanece fijo en español.

  V2:
  Aquí únicamente cambiaremos la lógica para
  permitir cambiar entre idiomas.
  ==========================================================
  */

  const [

    language

  ] = useState(

    DEFAULT_LANGUAGE

  );

  /*
  ==========================================================
  DICTIONARY
  ==========================================================
  */

  const dictionary =

    LANGUAGES[language];

  /*
  ==========================================================
  VALUE
  ==========================================================
  */

  const value =

    useMemo(

      () => ({

        language,

        dictionary

      }),

      [

        language,

        dictionary

      ]

    );

  /*
  ==========================================================
  PROVIDER
  ==========================================================
  */

  return (

    <LanguageContext.Provider

      value={value}

    >

      {children}

    </LanguageContext.Provider>

  );

}

/*
==========================================================
HOOK
==========================================================
*/

export function useLanguage() {

  const context =

    useContext(

      LanguageContext

    );

  if (!context) {

    throw new Error(

      "useLanguage must be used inside LanguageProvider."

    );

  }

  return context;

}