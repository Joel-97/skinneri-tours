/*
==========================================================
CREATE COMPANY CONTRACT
==========================================================

Defines the minimum information required
to create a company.

The rest of the company information will be
completed later by the company administrator.

==========================================================
*/

const createCompanyContract = {

  /*
  ==========================================================
  GENERAL
  ==========================================================
  */

  name: "",

  /*
  ==========================================================
  MODULES
  ==========================================================
  */

  enabledModules: [],

  /*
  ==========================================================
  PLATFORM
  ==========================================================
  */

  status: "active"

};

export default createCompanyContract;