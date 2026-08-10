/*
==========================================================
IMPORTS
==========================================================
*/

import {
  createUser,
  getUsers,
  getCompanyUsers,
  getUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  updateLastLogin,
  deleteUser
} from "../../services/platform/userService";

/*
==========================================================
CREATE USER
==========================================================
*/

export async function submitUser(contract) {

  return await createUser(

    contract

  );

}

/*
==========================================================
GET USERS
==========================================================
*/

export async function loadUsers() {

  return await getUsers();

}

/*
==========================================================
GET COMPANY USERS
==========================================================
*/

export async function loadCompanyUsers(

  companyId

) {

  return await getCompanyUsers(

    companyId

  );

}

/*
==========================================================
GET USER
==========================================================
*/

export async function loadUser(userId) {

  return await getUser(

    userId

  );

}

/*
==========================================================
UPDATE USER
==========================================================
*/

export async function updateUserInformation(

  userId,

  data

) {

  return await updateUser(

    userId,

    data

  );

}

/*
==========================================================
UPDATE USER ROLE
==========================================================
*/

export async function changeUserRole(

  userId,

  role

) {

  return await updateUserRole(

    userId,

    role

  );

}

/*
==========================================================
UPDATE USER STATUS
==========================================================
*/

export async function changeUserStatus(

  userId,

  status

) {

  return await updateUserStatus(

    userId,

    status

  );

}

/*
==========================================================
UPDATE LAST LOGIN
==========================================================
*/

export async function registerLastLogin(

  userId

) {

  return await updateLastLogin(

    userId

  );

}

/*
==========================================================
DELETE USER
==========================================================
*/

export async function removeUser(

  userId

) {

  return await deleteUser(

    userId

  );

}