/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    validateRequiredString

} from "./helpers/validatorHelpers.js";

/*
==========================================================
VALIDATOR
==========================================================
*/

export function getAuthActionValidator(

    contract

) {

    validateRequiredString(

        contract.token,

        "token"

    );

}