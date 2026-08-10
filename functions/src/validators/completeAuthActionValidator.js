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

export function completeAuthActionValidator(

    contract

) {

    validateRequiredString(

        contract.token,

        "token"

    );

    validateRequiredString(

        contract.password,

        "password"

    );

}