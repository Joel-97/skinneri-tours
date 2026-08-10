/*
==========================================================
CLIENT UTILS
==========================================================
*/

import { emptyClient } from "../constants/clientConstants";

/*
==========================================================
BUILD CREATE CLIENT
Inicializa el formulario para crear un cliente.
==========================================================
*/

export function buildCreateClient(client = {}) {

  return {

    ...emptyClient,

    ...client

  };

}

/*
==========================================================
BUILD EDIT CLIENT
Inicializa el formulario para editar un cliente.
==========================================================
*/

export function buildEditClient(client = {}) {

  return {

    ...emptyClient,

    ...client

  };

}

/*
==========================================================
GET CLIENT INITIALS
Obtiene las iniciales del cliente.
==========================================================
*/

export function getClientInitials(name = "") {

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");

}

/*
==========================================================
GET CLIENT DISPLAY NAME
==========================================================
*/

export function getClientDisplayName(client = {}) {

  return client.company || client.name || "-";

}

/*
==========================================================
IS COMPANY
==========================================================
*/

export function isCompany(client = {}) {

  return client.type === "company";

}

/*
==========================================================
IS PERSON
==========================================================
*/

export function isPerson(client = {}) {

  return client.type === "person";

}