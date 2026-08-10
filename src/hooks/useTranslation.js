/*
==========================================================
IMPORTS
==========================================================
*/

import { useCallback } from "react";

import {

  useLanguage

} from "../context/LanguageContext";

/*
==========================================================
GET VALUE
==========================================================
*/

function getNestedValue(

  object,

  path

) {

  return path

    .split(".")

    .reduce(

      (

        current,

        key

      ) =>

        current?.[key],

      object

    );

}

/*
==========================================================
HOOK
==========================================================
*/

export function useTranslation() {

  const {

    language,

    dictionary

  } = useLanguage();

  /*
  ==========================================================
  TRANSLATE
  ==========================================================
  */

  const t =

    useCallback(

      (

        key,

        fallback = key

      ) => {

        const value =

          getNestedValue(

            dictionary,

            key

          );

        return value ??

          fallback;

      },

      [

        dictionary

      ]

    );

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    language,

    t

  };

}