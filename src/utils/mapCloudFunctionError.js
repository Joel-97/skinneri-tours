/*
==========================================================
IMPORTS
==========================================================
*/

import PLATFORM_ERRORS

  from "../constants/errors/platformErrors";

/*
==========================================================
MAPPER
==========================================================
*/

export default function mapCloudFunctionError(error) {

  if (!error) {

    return PLATFORM_ERRORS.UNKNOWN_ERROR;

  }

  return (

    error.details

    ||

    error.message

    ||

    PLATFORM_ERRORS.UNKNOWN_ERROR

  );

}