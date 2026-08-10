/*
==========================================================
IMPORTS
==========================================================
*/

import { useState } from "react";

import useAsync from "../useAsync";

import {
  submitCompany,
  loadCompanies,
  loadCompany,
  updateCompanyInformation,
  changeCompanyStatus,
  changeCompanyModules,
  removeCompany
} from "../../controllers/platform/companyController";

/*
==========================================================
HOOK
==========================================================
*/

export default function useCompanies() {

  const {

    loading,

    error,

    execute,

    clearError

  } = useAsync();

  const [

    companies,

    setCompanies

  ] = useState([]);

  /*
  ==========================================================
  LOAD
  ==========================================================
  */

  async function load() {

    const result = await execute(

      () => loadCompanies()

    );

    if (

      result.success

    ) {

      setCompanies(

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

    companyId

  ) {

    return await execute(

      () => loadCompany(

        companyId

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

      () => submitCompany(

        contract

      )

    );

  }

  /*
  ==========================================================
  UPDATE
  ==========================================================
  */

  async function update(

    companyId,

    data

  ) {

    return await execute(

      () => updateCompanyInformation(

        companyId,

        data

      )

    );

  }

  /*
  ==========================================================
  UPDATE STATUS
  ==========================================================
  */

  async function updateStatus(

    companyId,

    status

  ) {

    return await execute(

      () => changeCompanyStatus(

        companyId,

        status

      )

    );

  }

  /*
  ==========================================================
  UPDATE MODULES
  ==========================================================
  */

  async function updateModules(

    companyId,

    enabledModules

  ) {

    return await execute(

      () => changeCompanyModules(

        companyId,

        enabledModules

      )

    );

  }

  /*
  ==========================================================
  REMOVE
  ==========================================================
  */

  async function remove(

    companyId

  ) {

    return await execute(

      () => removeCompany(

        companyId

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

    companies,

    load,

    loadOne,

    create,

    update,

    updateStatus,

    updateModules,

    remove,

    clearError

  };

}