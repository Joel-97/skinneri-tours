/*
==========================================================
USER SCHEMA
==========================================================

Represents a user with access to the Skinneri platform.

A user always belongs to a company
(except Super Administrators).

Permissions are resolved through the assigned role.

==========================================================
*/

const userSchema = {

  /*
  ==========================================================
  IDENTIFICATION
  ==========================================================
  */

  id: null,

  uid: null,

  /*
  ==========================================================
  PERSONAL INFORMATION
  ==========================================================
  */

  displayName: "",

  email: "",

  phone: "",

  photoURL: "",

  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  companyId: null,

  /*
  ==========================================================
  ACCESS
  ==========================================================
  */

  role: null,

  status: "active",

  /*
  ==========================================================
  PREFERENCES
  ==========================================================
  */

  language: null,

  /*
  ==========================================================
  AUDIT
  ==========================================================
  */

  createdAt: null,

  updatedAt: null,

  createdBy: null,

  updatedBy: null,

  approvedAt: null,

  approvedBy: null,

  lastLoginAt: null

};

export default userSchema;