/*
==========================================================
IMPORTS
==========================================================
*/

import {

  createAccessRequest,

  getAccessRequests,

  getPendingAccessRequests,

  getAccessRequest,

  approveAccessRequest,

  rejectAccessRequest,

  updateAccessRequest,

  deleteAccessRequest

} from "../../services/platform/accessRequestService";

/*
==========================================================
SUBMIT ACCESS REQUEST
==========================================================
*/

export async function submitAccessRequest(

  contract

) {

  return await createAccessRequest(

    contract

  );

}

/*
==========================================================
GET ACCESS REQUESTS
==========================================================
*/

export async function loadAccessRequests() {

  return await getAccessRequests();

}

/*
==========================================================
GET PENDING ACCESS REQUESTS
==========================================================
*/

export async function loadPendingAccessRequests() {

  return await getPendingAccessRequests();

}

/*
==========================================================
GET ACCESS REQUEST
==========================================================
*/

export async function loadAccessRequest(

  requestId

) {

  return await getAccessRequest(

    requestId

  );

}

/*
==========================================================
APPROVE ACCESS REQUEST
==========================================================
*/

export async function approveRequest(

  contract

) {

  return await approveAccessRequest(

    contract

  );

}

/*
==========================================================
REJECT ACCESS REQUEST
==========================================================
*/

export async function rejectRequest(

  requestId,

  rejectedBy

) {

  return await rejectAccessRequest(

    requestId,

    rejectedBy

  );

}

/*
==========================================================
UPDATE ACCESS REQUEST
==========================================================
*/

export async function updateRequest(

  requestId,

  data

) {

  return await updateAccessRequest(

    requestId,

    data

  );

}

/*
==========================================================
DELETE ACCESS REQUEST
==========================================================
*/

export async function removeAccessRequest(

  requestId

) {

  return await deleteAccessRequest(

    requestId

  );

}