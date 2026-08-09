/*
==========================================================
IMPORTS
==========================================================
*/

import { useCallback, useEffect, useState } from "react";

import {

  getCompanies

} from "../../services/platform/companyService";

/*
==========================================================
HOOK
==========================================================
*/

export default function useCompanies() {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    companies,

    setCompanies

  ] = useState([]);

  const [

    loading,

    setLoading

  ] = useState(true);

  const [

    error,

    setError

  ] = useState(null);

  /*
  ==========================================================
  LOAD
  ==========================================================
  */

  const reload = useCallback(

    async () => {

      setLoading(true);

      setError(null);

      const result = await getCompanies();

      if (result.success) {

        setCompanies(

          result.data || []

        );

      }

      else {

        setCompanies([]);

        setError(

          result.error || null

        );

      }

      setLoading(false);

    },

    []

  );

  /*
  ==========================================================
  INITIAL LOAD
  ==========================================================
  */

  useEffect(() => {

    reload();

  }, [reload]);

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    companies,

    loading,

    error,

    reload

  };

}