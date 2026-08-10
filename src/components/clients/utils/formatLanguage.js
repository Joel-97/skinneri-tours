/*
==========================================================
FORMAT LANGUAGE
==========================================================
*/

import { LANGUAGE_OPTIONS } from "../constants/languageOptions";

export const formatLanguage = (value) => {

  if (!value) return "";

  const language = LANGUAGE_OPTIONS.find(

    option => option.value === value

  );

  return language?.label || value;

};