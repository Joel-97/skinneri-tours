/*
==========================================================
IMPORTS
==========================================================
*/

import {

  useEffect,
  useMemo,
  useState,
  useCallback

} from "react";

import accessRequestsService

  from "../../services/superAdmin/accessRequestsService";

/*
==========================================================
HOOK
==========================================================
*/

export default function useAccessRequests() {

  /*
  ==========================================================
  DATA
  ==========================================================
  */

  const [

    requests,

    setRequests

  ] = useState([]);

  /*
  ==========================================================
  FILTERS
  ==========================================================
  */

  const [

    search,

    setSearch

  ] = useState("");

  const [

    status,

    setStatus

  ] = useState("all");

  /*
  ==========================================================
  DRAWER
  ==========================================================
  */

  const [

    drawerOpen,

    setDrawerOpen

  ] = useState(false);

  /*
  ==========================================================
  REJECT MODAL
  ==========================================================
  */

  const [

    rejectModalOpen,

    setRejectModalOpen

  ] = useState(false);

  /*
  ==========================================================
  REQUEST
  ==========================================================
  */

  const [

    selectedRequest,

    setSelectedRequest

  ] = useState(null);

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  const [

    loading,

    setLoading

  ] = useState(false);

  /*
  ==========================================================
  LOAD ACCESS REQUESTS
  ==========================================================
  */

  const loadAccessRequests =

    useCallback(

      async () => {

        setLoading(true);

        const result =

          await accessRequestsService

            .getAccessRequests({

              status

            });

        if (

          result.success

        ) {

          setRequests(

            result.data

          );

        }

        setLoading(false);

      },

      [

        status

      ]

    );

  /*
  ==========================================================
  EFFECT
  ==========================================================
  */

  useEffect(() => {

    loadAccessRequests();

  }, [

    loadAccessRequests

  ]);

  /*
  ==========================================================
  FILTERED REQUESTS
  ==========================================================
  */

  const filteredRequests =

    useMemo(() => {

      return requests.filter(request => {

        if (

          !search

        ) {

          return true;

        }

        const text =

          search.toLowerCase();

        return (

          request.displayName

            ?.toLowerCase()

            .includes(text)

          ||

          request.email

            ?.toLowerCase()

            .includes(text)

        );

      });

    }, [

      requests,

      search

    ]);

  /*
  ==========================================================
  DRAWER
  ==========================================================
  */

  function openDrawer(

    request

  ) {

    setSelectedRequest(

      request

    );

    setDrawerOpen(

      true

    );

  }

  function closeDrawer() {

    setDrawerOpen(

      false

    );

  }

  /*
  ==========================================================
  REJECT MODAL
  ==========================================================
  */

  function openRejectModal() {

    setRejectModalOpen(

      true

    );

  }

  function closeRejectModal() {

    setRejectModalOpen(

      false

    );

  }

  /*
==========================================================
APPROVE
==========================================================
*/

async function approveRequest(data) {

  setLoading(

    true

  );

  const result =

    await accessRequestsService

      .approveAccessRequest(

        data

      );

  if (

    result.success

  ) {

    closeDrawer();

    await loadAccessRequests();

  }

  setLoading(

    false

  );

  return result;

}

/*
==========================================================
REJECT
==========================================================
*/

async function rejectRequest() {

  if (

    !selectedRequest

  ) {

    return;

  }

  setLoading(

    true

  );

  const result =

    await accessRequestsService

      .rejectAccessRequest({

        requestId:

          selectedRequest.id

      });

  if (

    result.success

  ) {

    closeRejectModal();

    closeDrawer();

    await loadAccessRequests();

  }

  setLoading(

    false

  );

  return result;

}

/*
==========================================================
RETURN
==========================================================
*/

return {

  /*
  ==========================================
  DATA
  ==========================================
  */

  requests,

  filteredRequests,

  loadAccessRequests,

  /*
  ==========================================
  FILTERS
  ==========================================
  */

  search,

  setSearch,

  status,

  setStatus,

  /*
  ==========================================
  DRAWER
  ==========================================
  */

  drawerOpen,

  openDrawer,

  closeDrawer,

  /*
  ==========================================
  REQUEST
  ==========================================
  */

  selectedRequest,

  /*
  ==========================================
  REJECT
  ==========================================
  */

  rejectModalOpen,

  openRejectModal,

  closeRejectModal,

  /*
  ==========================================
  ACTIONS
  ==========================================
  */

  approveRequest,

  rejectRequest,

  /*
  ==========================================
  LOADING
  ==========================================
  */

  loading

};

}