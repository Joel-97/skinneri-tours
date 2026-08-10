/*
==========================================================
IMPORTS
==========================================================
*/

import { useState } from "react";

import useAsync from "../useAsync";

import {
  submitAccessRequest,
  loadAccessRequests,
  loadPendingAccessRequests,
  loadAccessRequest,
  approveRequest,
  rejectRequest,
  updateRequest,
  removeAccessRequest
} from "../../controllers/platform/accessRequestController";

/*
==========================================================
HOOK
==========================================================
*/

export default function useAccessRequests() {

  const {

    loading,

    error,

    execute,

    clearError

  } = useAsync();

  const [

    accessRequests,

    setAccessRequests

  ] = useState([]);

  /*
  ==========================================================
  LOAD
  ==========================================================
  */

  async function load() {

    const result = await execute(

      () => loadAccessRequests()

    );

    if (

      result.success

    ) {

      setAccessRequests(

        result.data

      );

    }

    return result;

  }

  /*
  ==========================================================
  LOAD PENDING
  ==========================================================
  */

  async function loadPending() {

    const result = await execute(

      () => loadPendingAccessRequests()

    );

    if (

      result.success

    ) {

      setAccessRequests(

        result.data

      );

    }

    return result;

  }

  /*
  ==========================================================
  LOAD ONE
  ==========================================================
  */

  async function loadOne(

    requestId

  ) {

    return await execute(

      () => loadAccessRequest(

        requestId

      )

    );

  }

  /*
  ==========================================================
  CREATE
  ==========================================================
  */

  async function create(

    contract

  ) {

    return await execute(

      () => submitAccessRequest(

        contract

      )

    );

  }

  /*
  ==========================================================
  APPROVE
  ==========================================================
  */

  async function approve(

    contract

  ) {

    return await execute(

      () => approveRequest(

        contract

      )

    );

  }

  /*
  ==========================================================
  REJECT
  ==========================================================
  */

  async function reject(

    requestId,

    rejectedBy

  ) {

    return await execute(

      () => rejectRequest(

        requestId,

        rejectedBy

      )

    );

  }

  /*
  ==========================================================
  UPDATE
  ==========================================================
  */

  async function update(

    requestId,

    data

  ) {

    return await execute(

      () => updateRequest(

        requestId,

        data

      )

    );

  }

  /*
  ==========================================================
  REMOVE
  ==========================================================
  */

  async function remove(

    requestId

  ) {

    return await execute(

      () => removeAccessRequest(

        requestId

      )

    );

  }

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    loading,

    error,

    accessRequests,

    load,

    loadPending,

    loadOne,

    create,

    approve,

    reject,

    update,

    remove,

    clearError

  };

}