/*
==========================================================
MODULE UTILITIES
==========================================================
*/

/*
==========================================================
CHECK MODULE
==========================================================
*/

export function isModuleEnabled(

  company,

  moduleId

) {

  if (!company) {

    return false;

  }

  if (!moduleId) {

    return false;

  }

  return (

    company.enabledModules?.includes(

      moduleId

    ) || false

  );

}

/*
==========================================================
GET ENABLED MODULES
==========================================================
*/

export function getEnabledModules(

  company

) {

  if (!company) {

    return [];

  }

  return company.enabledModules || [];

}