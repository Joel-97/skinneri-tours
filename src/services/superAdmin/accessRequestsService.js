/*
==========================================================
IMPORTS
==========================================================
*/

import {

  httpsCallable

} from "firebase/functions";

import functions

  from "../../firebase/functions";

import {

  failure

} from "../../utils/serviceResult";

import mapCloudFunctionError

  from "../../utils/mapCloudFunctionError";

/*
==========================================================
FUNCTIONS
==========================================================
*/

const getAccessRequestsCallable =

  httpsCallable(

    functions,

    "getAccessRequests"

  );

const approveAccessRequestCallable =

  httpsCallable(

    functions,

    "approveAccessRequest"

  );

const rejectAccessRequestCallable =

  httpsCallable(

    functions,

    "rejectAccessRequest"

  );

/*
==========================================================
GET ACCESS REQUESTS
==========================================================
*/

async function getAccessRequests(

  filters = {}

) {

  try {

    const {

      data

    } = await getAccessRequestsCallable(

      filters

    );

    return data;

  }

  catch (error) {

    return failure(

      mapCloudFunctionError(

        error

      )

    );

  }

}

/*
==========================================================
APPROVE ACCESS REQUEST
==========================================================
*/

async function approveAccessRequest(

  data

) {

  try {

    const result =

      await approveAccessRequestCallable(

        data

      );

    return result.data;

  }

  catch (error) {

    return failure(

      mapCloudFunctionError(

        error

      )

    );

  }

}

/*
==========================================================
REJECT ACCESS REQUEST
==========================================================
*/

async function rejectAccessRequest(

  data

) {

  try {

    const result =

      await rejectAccessRequestCallable(

        data

      );

    return result.data;

  }

  catch (error) {

    return failure(

      mapCloudFunctionError(

        error

      )

    );

  }

}

/*
==========================================================
SERVICE
==========================================================
*/

const accessRequestsService = {

  getAccessRequests,

  approveAccessRequest,

  rejectAccessRequest

};

export default accessRequestsService;