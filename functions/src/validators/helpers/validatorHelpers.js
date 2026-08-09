/**
 * ==========================================================
 * VALIDATE REQUIRED STRING
 * ==========================================================
 */

export function validateRequiredString(

    value,

    field

) {

    if (

        typeof value !== "string" ||

        !value.trim()

    ) {

        throw new Error(

            `${field} is required.`

        );

    }

}

/*
==========================================================
VALIDATE OPTIONAL STRING
==========================================================
*/

export function validateOptionalString(

    value,

    field

) {

    if (

        value ===

        undefined ||

        value ===

        null

    ) {

        return;

    }

    if (

        typeof value !== "string"

    ) {

        throw new Error(

            `${field} must be a string.`

        );

    }

}

/*
==========================================================
VALIDATE REQUIRED ARRAY
==========================================================
*/

export function validateRequiredArray(

    value,

    field

) {

    if (

        !Array.isArray(

            value

        ) ||

        value.length === 0

    ) {

        throw new Error(

            `${field} is required.`

        );

    }

}

/*
==========================================================
VALIDATE OPTIONAL ARRAY
==========================================================
*/

export function validateOptionalArray(

    value,

    field

) {

    if (

        value ===

        undefined ||

        value ===

        null

    ) {

        return;

    }

    if (

        !Array.isArray(

            value

        )

    ) {

        throw new Error(

            `${field} must be an array.`

        );

    }

}

/*
==========================================================
VALIDATE REQUIRED BOOLEAN
==========================================================
*/

export function validateRequiredBoolean(

    value,

    field

) {

    if (

        typeof value !== "boolean"

    ) {

        throw new Error(

            `${field} is required.`

        );

    }

}

/*
==========================================================
VALIDATE OPTIONAL BOOLEAN
==========================================================
*/

export function validateOptionalBoolean(

    value,

    field

) {

    if (

        value ===

        undefined ||

        value ===

        null

    ) {

        return;

    }

    if (

        typeof value !== "boolean"

    ) {

        throw new Error(

            `${field} must be a boolean.`

        );

    }

}

/*
==========================================================
VALIDATE REQUIRED OBJECT
==========================================================
*/

export function validateRequiredObject(

    value,

    field

) {

    if (

        !value ||

        typeof value !== "object" ||

        Array.isArray(

            value

        )

    ) {

        throw new Error(

            `${field} is required.`

        );

    }

}