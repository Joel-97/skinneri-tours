/*
==========================================================
IMPORTS
==========================================================
*/

import {

  REQUEST_STATUS

} from "../../constants/platform/requestStatus";

/*
==========================================================
VALIDATE EMAIL
==========================================================
*/

function validateEmail(

  email

) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    .test(

      email

    );

}

/*
==========================================================
VALIDATE ACCESS REQUEST
==========================================================
*/

export function validateAccessRequest(

  request = {}

) {

  const errors = {};

  /*
  ==========================================================
  DISPLAY NAME
  ==========================================================
  */

  if (

    !request.displayName

      ?.trim()

  ) {

    errors.displayName =

      "platform.validation.displayNameRequired";

  }

  /*
  ==========================================================
  EMAIL
  ==========================================================
  */

  if (

    !request.email

      ?.trim()

  ) {

    errors.email =

      "platform.validation.emailRequired";

  }

  else if (

    !validateEmail(

      request.email

    )

  ) {

    errors.email =

      "platform.validation.invalidEmail";

  }

  /*
  ==========================================================
  STATUS
  ==========================================================
  */

  if (

    request.status &&

    !Object.values(

      REQUEST_STATUS

    ).some(

      status =>

        status.id ===

        request.status

    )

  ) {

    errors.status =

      "platform.validation.invalidStatus";

  }

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return {

    isValid:

      Object.keys(

        errors

      ).length === 0,

    errors

  };

}