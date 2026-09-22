/*
==========================================================
TRANSPORTATION CALCULATIONS
==========================================================
*/

export function calculateFinancials({

    data,

    taxes,

    discounts

}) {

    /*
    --------------------------------------------------
    PRECIO
    --------------------------------------------------
    */

    const price = Number(
        data.price || 0
    );


    /*
    --------------------------------------------------
    DESCUENTO
    --------------------------------------------------
    */

    const selectedDiscount = discounts.find(
        d => d.id === data.discountId
    );

    let discountAmount = 0;

    if (selectedDiscount) {

        const expired =
            selectedDiscount.expirationDate &&
            typeof selectedDiscount.expirationDate.toDate === "function" &&
            selectedDiscount.expirationDate.toDate() < new Date();

        if (!expired) {

            if (selectedDiscount.type === "percentage") {

                discountAmount =
                    price *
                    (Number(selectedDiscount.value || 0) / 100);

            }

            else if (selectedDiscount.type === "fixed") {

                discountAmount =
                    Number(selectedDiscount.value || 0);

            }

        }

    }


    /*
    --------------------------------------------------
    NORMALIZE DISCOUNT
    --------------------------------------------------
    */

    const discount = Number(
        discountAmount || 0
    );


    /*
    --------------------------------------------------
    SUBTOTAL AFTER DISCOUNT
    --------------------------------------------------
    */

    const subtotalAfterDiscount = Math.max(

        price - discount,

        0

    );


    /*
    --------------------------------------------------
    IMPUESTOS
    --------------------------------------------------
    */

    const activeTaxes = taxes.filter(

        tax =>
            data.activeTaxIds?.includes(
                tax.id
            )

    );

    const taxBreakdown = activeTaxes.map(tax => {

        const rate = Number(
            tax.rate || 0
        );

        const amount =
            subtotalAfterDiscount *
            (rate / 100);

        return {

            taxId: tax.id,

            name: tax.name,

            rate,

            amount:
                Number(
                    amount.toFixed(2)
                )

        };

    });


    /*
    --------------------------------------------------
    TOTAL DE IMPUESTOS
    --------------------------------------------------
    */

    const totalTax = taxBreakdown.reduce(

        (sum, tax) =>
            sum + tax.amount,

        0

    );


    /*
    ==================================================
    COMISIONES
    ==================================================
    */


    /*
    --------------------------------------------------
    BASE ORIGINAL
    --------------------------------------------------

    Precio antes de aplicar descuentos.
    */

    const originalCommissionBase = Number(

        price.toFixed(2)

    );


    /*
    --------------------------------------------------
    BASE DESPUÉS DEL DESCUENTO
    --------------------------------------------------

    Precio después de aplicar el descuento.
    */

    const discountedCommissionBase = Number(

        subtotalAfterDiscount.toFixed(2)

    );


    /*
    --------------------------------------------------
    BASE DE COMISIÓN SELECCIONADA
    --------------------------------------------------

    Si existe descuento:

        original
            → precio original

        afterDiscount
            → precio después del descuento

    Si no existe descuento, ambas bases
    tendrán el mismo valor.

    Por seguridad, cualquier valor diferente
    de "original" utiliza afterDiscount.
    */

    const commissionBase =
        data.commissionBase === "original"
            ? "original"
            : "afterDiscount";


    /*
    --------------------------------------------------
    MONTO BASE DE LA COMISIÓN
    --------------------------------------------------
    */

    const commissionBaseAmount = Number(

        (
            commissionBase === "original"
                ? originalCommissionBase
                : discountedCommissionBase
        ).toFixed(2)

    );


    /*
    --------------------------------------------------
    VALOR DE COMISIÓN
    --------------------------------------------------
    */

    const commissionValue = Number(

        data.commissionValue || 0

    );


    /*
    --------------------------------------------------
    MONTO DE COMISIÓN
    --------------------------------------------------
    */

    let commissionAmount = 0;


    if (data.commissionEnabled) {

        /*
        ----------------------------------------------
        COMISIÓN PORCENTUAL
        ----------------------------------------------
        */

        if (
            data.commissionType ===
            "percentage"
        ) {

            commissionAmount =
                commissionBaseAmount *
                (commissionValue / 100);

        }


        /*
        ----------------------------------------------
        COMISIÓN FIJA
        ----------------------------------------------
        */

        else if (
            data.commissionType ===
            "fixed"
        ) {

            commissionAmount =
                commissionValue;

        }

    }


    /*
    --------------------------------------------------
    NORMALIZE COMMISSION AMOUNT
    --------------------------------------------------
    */

    commissionAmount = Number(

        commissionAmount.toFixed(2)

    );


    /*
    --------------------------------------------------
    TOTAL
    --------------------------------------------------

    El total de la reserva siempre se calcula
    utilizando el subtotal después del descuento
    más los impuestos.

    La base de comisión NO afecta el total
    de la reserva.
    */

    const total = Number(

        (

            subtotalAfterDiscount +

            Number(totalTax || 0)

        ).toFixed(2)

    );


    /*
    ==================================================
    RETURN
    ==================================================
    */

    return {

        /*
        ----------------------------------------------
        DESCUENTO
        ----------------------------------------------
        */

        selectedDiscount,

        discountAmount,

        discount,


        /*
        ----------------------------------------------
        SUBTOTAL
        ----------------------------------------------
        */

        subtotalAfterDiscount,


        /*
        ----------------------------------------------
        IMPUESTOS
        ----------------------------------------------
        */

        activeTaxes,

        taxBreakdown,

        totalTax,


        /*
        ----------------------------------------------
        PRECIO
        ----------------------------------------------
        */

        price,


        /*
        ----------------------------------------------
        COMISIONES
        ----------------------------------------------
        */

        originalCommissionBase,

        discountedCommissionBase,

        commissionBase,

        commissionBaseAmount,

        commissionAmount,


        /*
        ----------------------------------------------
        COMPATIBILIDAD TEMPORAL
        ----------------------------------------------

        Se mantiene mientras otros componentes
        todavía utilicen baseForCommission.

        Posteriormente podremos eliminarlo.
        */

        baseForCommission:
            commissionBaseAmount,


        /*
        ----------------------------------------------
        TOTAL
        ----------------------------------------------
        */

        total

    };

}