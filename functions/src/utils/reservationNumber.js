/**
 * ==========================================================
 * RESERVATION NUMBER
 * ==========================================================
 */

import crypto from "crypto";


/*
==========================================================
GET RESERVATION PREFIX
==========================================================
*/

function getReservationPrefix(

    category = "transportation"

) {

    if (

        category ===

        "adventure"

    ) {

        return "AD";

    }


    return "TR";

}


/*
==========================================================
GENERATE RESERVATION NUMBER
==========================================================
*/

export function generateReservationNumber(

    category = "transportation"

) {

    /*
    ======================================================
    DATE
    ======================================================
    */

    const now = new Date();


    const day =

        String(

            now.getDate()

        ).padStart(

            2,

            "0"

        );


    const month =

        String(

            now.getMonth() + 1

        ).padStart(

            2,

            "0"

        );


    /*
    ======================================================
    PREFIX
    ======================================================
    */

    const prefix =

        getReservationPrefix(

            category

        );


    /*
    ======================================================
    RANDOM NUMBER
    ======================================================
    */

    const random =

        crypto.randomInt(

            1000000,

            10000000

        );


    /*
    ======================================================
    RESULT
    ======================================================
    */

    return (

        `${prefix}-${day}${month}-${random}`

    );

}