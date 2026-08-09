/*
==========================================================
IMPORTS
==========================================================
*/

import { ROLES } from "../constants/platform/roles";

/*
==========================================================
HAS ROLE
==========================================================
*/

export function hasRole(
  user,
  role
) {

  if (!user) {

    return false;

  }

  return user.role === role;

}

/*
==========================================================
IS ADMIN
==========================================================
*/

export function isAdmin(user) {

  if (!user) {

    return false;

  }

  return (

    user.role === ROLES.ADMIN.id ||

    user.role === ROLES.SUPER_ADMIN.id

  );

}

/*
==========================================================
IS SUPER ADMIN
==========================================================
*/

export function isSuperAdmin(user) {

  if (!user) {

    return false;

  }

  return (

    user.role === ROLES.SUPER_ADMIN.id

  );

}

/*
==========================================================
HAS PERMISSION
==========================================================
*/

export function hasPermission(
  user,
  permission
) {

  if (!user) {

    return false;

  }

  if (!Array.isArray(user.permissions)) {

    return false;

  }

  return user.permissions.includes(

    permission

  );

}

/*
==========================================================
HAS MODULE
==========================================================
*/

export function hasModule(
  company,
  module
) {

  if (!company) {

    return false;

  }

  if (!Array.isArray(company.enabledModules)) {

    return false;

  }

  return company.enabledModules.includes(

    module

  );

}