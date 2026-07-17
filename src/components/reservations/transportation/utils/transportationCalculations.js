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
                    data.price * (selectedDiscount.value / 100);

            }

            else if (selectedDiscount.type === "fixed") {

                discountAmount = selectedDiscount.value;

            }

        }

    }

    /*
    --------------------------------------------------
    SUBTOTAL
    --------------------------------------------------
    */

    const subtotalAfterDiscount = Math.max(

        Number(data.price || 0) - discountAmount,

        0

    );

    /*
    --------------------------------------------------
    IMPUESTOS
    --------------------------------------------------
    */

    const activeTaxes = taxes.filter(

        tax => data.activeTaxIds.includes(tax.id)

    );

    const taxBreakdown = activeTaxes.map(tax => {

        const rate = Number(tax.rate || 0);

        const amount = subtotalAfterDiscount * (rate / 100);

        return {

            taxId: tax.id,

            name: tax.name,

            rate,

            amount: Number(amount.toFixed(2))

        };

    });

    const totalTax = taxBreakdown.reduce(

        (sum, tax) => sum + tax.amount,

        0

    );

    /*
    --------------------------------------------------
    TOTALES
    --------------------------------------------------
    */

    const price = Number(data.price || 0);

    const discount = Number(discountAmount || 0);

    const baseForCommission = Number(

        (price - discount).toFixed(2)

    );

    const total = Number(

        (

            baseForCommission +

            Number(totalTax || 0)

        ).toFixed(2)

    );

    return {

        selectedDiscount,

        discountAmount,

        subtotalAfterDiscount,

        activeTaxes,

        taxBreakdown,

        totalTax,

        price,

        discount,

        baseForCommission,

        total

    };

}