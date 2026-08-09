/*
==========================================================
SUCCESS
==========================================================
*/

export function success(

  data = null

) {

  return {

    success: true,

    data,

    error: null

  };

}

/*
==========================================================
CREATED
==========================================================
*/

export function created(

  id

) {

  return {

    success: true,

    data: {

      id

    },

    error: null

  };

}

/*
==========================================================
FAILURE
==========================================================
*/

export function failure(

  error,

  data = null

) {

  return {

    success: false,

    data,

    error

  };

}

/*
==========================================================
NOT FOUND
==========================================================
*/

export function notFound(

  error

) {

  return {

    success: false,

    data: null,

    error

  };

}