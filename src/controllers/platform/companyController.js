/*
==========================================================
IMPORTS
==========================================================
*/

import {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  updateCompanyStatus,
  updateCompanyModules,
  deleteCompany
} from "../../services/platform/companyService";

/*
==========================================================
CREATE COMPANY
==========================================================
*/

export async function submitCompany(contract) {

  return await createCompany(

    contract

  );

}

/*
==========================================================
GET COMPANIES
==========================================================
*/

export async function loadCompanies() {

  return await getCompanies();

}

/*
==========================================================
GET COMPANY
==========================================================
*/

export async function loadCompany(companyId) {

  return await getCompany(

    companyId

  );

}

/*
==========================================================
UPDATE COMPANY
==========================================================
*/

export async function updateCompanyInformation(

  companyId,

  data

) {

  return await updateCompany(

    companyId,

    data

  );

}

/*
==========================================================
UPDATE COMPANY STATUS
==========================================================
*/

export async function changeCompanyStatus(

  companyId,

  status

) {

  return await updateCompanyStatus(

    companyId,

    status

  );

}

/*
==========================================================
UPDATE COMPANY MODULES
==========================================================
*/

export async function changeCompanyModules(

  companyId,

  enabledModules

) {

  return await updateCompanyModules(

    companyId,

    enabledModules

  );

}

/*
==========================================================
DELETE COMPANY
==========================================================
*/

export async function removeCompany(

  companyId

) {

  return await deleteCompany(

    companyId

  );

}