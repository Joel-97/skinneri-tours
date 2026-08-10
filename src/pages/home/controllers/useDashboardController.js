/*
==========================================================
USE DASHBOARD CONTROLLER
==========================================================
*/

import {

  useEffect,
  useMemo,
  useState

} from "react";

/* ======================================================
   SERVICES
====================================================== */

import {

  getDashboardContext

} from "../../../services/dashboard/dashboardContextService";

import {

  getDashboardData

} from "../../../services/dashboard/dashboardService";

/*
==========================================================
HOOK
==========================================================
*/

export function useDashboardController(

  companyId

) {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    loading,

    setLoading

  ] = useState(true);

  const [

    context,

    setContext

  ] = useState({

    reservations: [],

    drivers: [],

    vehicles: [],

    clients: []

  });

  const [

    dashboard,

    setDashboard

  ] = useState({

    financial: {},

    operational: {},

    fleet: {},

    crm: {},

    trips: {}

  });

  /*
  ==========================================================
  HELPERS
  ==========================================================
  */

  const greeting = useMemo(() => {

    const hour = new Date().getHours();

    if (hour < 12) {

      return "Buenos días";

    }

    if (hour < 18) {

      return "Buenas tardes";

    }

    return "Buenas noches";

  }, []);

  const formatDateTime = (

    timestamp

  ) => {

    if (!timestamp) {

      return "-";

    }

    const date =

      timestamp.toDate

        ? timestamp.toDate()

        : new Date(timestamp);

    return date.toLocaleString(

      "es-CR",

      {

        day: "2-digit",

        month: "short",

        hour: "2-digit",

        minute: "2-digit"

      }

    );

  };

  const capitalize = (

    value = ""

  ) => {

    if (!value) {

      return "";

    }

    return (

      value.charAt(0).toUpperCase() +

      value.slice(1)

    );

  };

  /*
  ==========================================================
  LOAD DASHBOARD
  ==========================================================
  */

  useEffect(() => {

    if (!companyId) {

      return;

    }

    const loadDashboard = async () => {

      try {

        setLoading(true);

        /*
        ====================================================
        LOAD CONTEXT
        ====================================================
        */

        const dashboardContext =

          await getDashboardContext(

            companyId

          );

        /*
        ====================================================
        BUILD DASHBOARD
        ====================================================
        */

        const dashboardData =

          getDashboardData(

            dashboardContext

          );

        /*
        ====================================================
        STATE
        ====================================================
        */

        setContext(

          dashboardContext

        );

        setDashboard(

          dashboardData

        );

      }

      catch (error) {

        console.error(

          "Dashboard:",

          error

        );

      }

      finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, [

    companyId

  ]);

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  return {

    loading,

    dashboard,

    context,

    helpers: {

      greeting,

      formatDateTime,

      capitalize

    }

  };

}