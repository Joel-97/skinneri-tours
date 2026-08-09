/*
==========================================================
RESOLVE ERROR MESSAGE
==========================================================

Resolves an error code into a translated
message using the provided translation map.

==========================================================
*/

export default function resolveErrorMessage(

  error,

  t,

  errorMap = {}

) {

  /*
  ==========================================================
  NO ERROR
  ==========================================================
  */

  if (!error) {

    return "";

  }

  /*
  ==========================================================
  TRANSLATION KEY
  ==========================================================
  */

  const translationKey =

    errorMap[error];

  /*
  ==========================================================
  UNKNOWN ERROR
  ==========================================================
  */

  if (!translationKey) {

    return t(

      "auth.messages.unknownError"

    );

  }

  /*
  ==========================================================
  TRANSLATED MESSAGE
  ==========================================================
  */

  return t(

    translationKey

  );

}