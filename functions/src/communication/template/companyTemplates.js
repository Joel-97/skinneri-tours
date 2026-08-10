/**
 * ==========================================================
 * COMPANY TEMPLATES
 * ==========================================================
 */

import {
    getReservationTranslations
} from "./reservationTranslations.js";


/**
 * ==========================================================
 * HTML ESCAPE
 * ==========================================================
 */

function escapeHtml(value = "") {

    return String(value)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/**
 * ==========================================================
 * FORMAT NUMBER
 * ==========================================================
 */

function formatNumber(
    amount = 0,
    currency = ""
) {

    const numericAmount =

        Number(amount) || 0;


    /*
    ==========================================================
    CURRENCY DECIMALS

    Most currencies use 2 decimals.

    Currencies such as JPY and KRW normally use
    zero decimal places.
    ==========================================================
    */

    const zeroDecimalCurrencies = [

        "JPY",

        "KRW"

    ];


    const decimals =

        zeroDecimalCurrencies.includes(

            currency

        )

            ? 0

            : 2;


    try {

        return new Intl.NumberFormat(

            "en-US",

            {

                minimumFractionDigits:
                    decimals,

                maximumFractionDigits:
                    decimals

            }

        ).format(

            numericAmount

        );

    }

    catch {

        return String(

            numericAmount

        );

    }

}


/**
 * ==========================================================
 * FORMAT MONEY
 * ==========================================================
 */

function formatMoney({

    amount = 0,

    currency = "",

    symbol = ""

}) {

    const formattedAmount =

        formatNumber(

            amount,

            currency

        );


    /*
    ==========================================================
    USE SYMBOL STORED IN RESERVATION

    Example:

    USD -> $
    CRC -> ₡
    EUR -> €
    ==========================================================
    */

    if (symbol) {

        return `${symbol}${formattedAmount}`;

    }


    /*
    ==========================================================
    FALLBACK

    If the reservation does not contain a symbol,
    display the currency code.
    ==========================================================
    */

    if (currency) {

        return `${currency} ${formattedAmount}`;

    }


    return formattedAmount;

}


/**
 * ==========================================================
 * FORMAT DATE
 * ==========================================================
 */

function formatDate(
    date,
    language = "en"
) {

    if (!date) {

        return "";

    }


    try {

        const parsedDate =

            date?.toDate

                ? date.toDate()

                : new Date(date);


        const locale =

            language === "es"

                ? "es-CR"

                : "en-US";


        return new Intl.DateTimeFormat(

            locale,

            {

                day: "numeric",

                month: "long",

                year: "numeric"

            }

        ).format(

            parsedDate

        );

    }

    catch {

        return "";

    }

}


/**
 * ==========================================================
 * FORMAT TIME
 * ==========================================================
 */

function formatTime(
    date,
    language = "en"
) {

    if (!date) {

        return "";

    }


    try {

        const parsedDate =

            date?.toDate

                ? date.toDate()

                : new Date(date);


        const locale =

            language === "es"

                ? "es-CR"

                : "en-US";


        return new Intl.DateTimeFormat(

            locale,

            {

                hour: "2-digit",

                minute: "2-digit",

                hour12:
                    language !== "es"

                        ? true

                        : false

            }

        ).format(

            parsedDate

        );

    }

    catch {

        return "";

    }

}


/**
 * ==========================================================
 * RESERVATION CONFIRMATION
 * ==========================================================
 */

export function buildReservationConfirmationTemplate({

    company,

    reservation,

    language = "en"

}) {

    /*
    ==========================================================
    LANGUAGE
    ==========================================================
    */

    const selectedLanguage =

        language === "es"

            ? "es"

            : "en";


    const t =

        getReservationTranslations(

            selectedLanguage

        );


    /*
    ==========================================================
    COMPANY INFORMATION
    ==========================================================
    */

    const companyName =

        escapeHtml(

            company?.name ||

            company?.legalName ||

            "The company"

        );


    const companyEmail =

        escapeHtml(

            company?.email ||

            ""

        );


    const companyPhone =

        escapeHtml(

            company?.phone ||

            ""

        );


    const companyWebsite =

        escapeHtml(

            company?.website ||

            ""

        );


    const companyAddress =

        escapeHtml(

            [

                company?.address,

                company?.city,

                company?.province,

                company?.country

            ]

                .filter(Boolean)

                .join(", ")

        );


    const logoURL =

        company?.logoURL ||

        null;


    const primaryColor =

        company?.primaryColor ||

        "#08204B";


    /*
    ==========================================================
    RESERVATION INFORMATION
    ==========================================================
    */

    const clientName =

        escapeHtml(

            reservation?.clientName ||

            (

                selectedLanguage === "es"

                    ? "Cliente"

                    : "Customer"

            )

        );


    const reservationNumber =

        escapeHtml(

            reservation?.reservationNumber ||

            ""

        );


    const serviceName =

        escapeHtml(

            reservation?.serviceTypeName ||

            reservation?.service ||

            (

                selectedLanguage === "es"

                    ? "Servicio de transporte"

                    : "Transportation service"

            )

        );


    const locationFrom =

        escapeHtml(

            reservation?.locationFromName ||

            ""

        );


    const locationTo =

        escapeHtml(

            reservation?.locationToName ||

            ""

        );


    const routeCode =

        escapeHtml(

            reservation?.routeCode ||

            ""

        );


    const passengers =

        escapeHtml(

            reservation?.passengers ??

            ""

        );


    const flightNumber =

        escapeHtml(

            reservation?.flightNumber ||

            ""

        );


    const vehicleName =

        escapeHtml(

            reservation?.vehicleName ||

            ""

        );


    const vehiclePlate =

        escapeHtml(

            reservation?.vehiclePlate ||

            ""

        );


    const staffName =

        escapeHtml(

            reservation?.staffName ||

            ""

        );


    const bookingSourceName =

        escapeHtml(

            reservation?.bookingSourceName ||

            ""

        );


    /*
    ==========================================================
    CURRENCY

    Currency and symbol always come from the reservation.
    ==========================================================
    */

    const currency =

        reservation?.currency ||

        "";


    const currencySymbol =

        reservation?.symbol ||

        "";


    /*
    ==========================================================
    FINANCIAL INFORMATION
    ==========================================================
    */

    const subtotal =

        Number(

            reservation?.subtotal ?? 0

        );


    const discountAmount =

        Number(

            reservation?.discountAmount ?? 0

        );


    const taxAmount =

        Number(

            reservation?.taxAmount ?? 0

        );


    const total =

        Number(

            reservation?.total ??

            reservation?.price ??

            0

        );


    const subtotalFormatted =

        formatMoney({

            amount:

                subtotal,

            currency,

            symbol:

                currencySymbol

        });


    const discountFormatted =

        formatMoney({

            amount:

                discountAmount,

            currency,

            symbol:

                currencySymbol

        });


    const taxFormatted =

        formatMoney({

            amount:

                taxAmount,

            currency,

            symbol:

                currencySymbol

        });


    const totalFormatted =

        formatMoney({

            amount:

                total,

            currency,

            symbol:

                currencySymbol

        });


    /*
    ==========================================================
    DATE / TIME
    ==========================================================
    */

    const reservationDate =

        formatDate(

            reservation?.date,

            selectedLanguage

        );


    const reservationTime =

        formatTime(

            reservation?.date,

            selectedLanguage

        );


    /*
    ==========================================================
    OPTIONAL DATA
    ==========================================================
    */

    const hasFlightNumber =

        Boolean(

            reservation?.flightNumber

        );


    const hasRoute =

        Boolean(

            locationFrom ||

            locationTo

        );


    const hasVehicle =

        Boolean(

            vehicleName ||

            vehiclePlate

        );


    const hasDriver =

        Boolean(

            staffName

        );


    const hasBookingSource =

        Boolean(

            bookingSourceName

        );


    const hasRouteCode =

        Boolean(

            routeCode

        );


    const hasDiscount =

        discountAmount > 0;


    const hasTax =

        taxAmount > 0;


    /*
    ==========================================================
    SUBJECT
    ==========================================================
    */

    const subject =

        reservationNumber

            ? `${t.subject} ${reservationNumber} | ${companyName}`

            : `${t.subject} | ${companyName}`;


    /*
    ==========================================================
    TEXT VERSION
    ==========================================================
    */

    const text = `

${companyName}

${t.reservationConfirmed}

${t.hello} ${clientName},

${t.confirmationMessage}


${t.reservationConfirmed.toUpperCase()}

${reservationNumber
    ? `${t.reservationConfirmed}: ${reservationNumber}`
    : ""
}

${t.service}:
${serviceName}

${t.date}:
${reservationDate}

${t.time}:
${reservationTime}

${t.passengers}:
${passengers}

${locationFrom
    ? `${t.pickup}:\n${locationFrom}\n`
    : ""
}

${locationTo
    ? `${t.destination}:\n${locationTo}\n`
    : ""
}

${hasRouteCode
    ? `${t.routeCode}:\n${routeCode}\n`
    : ""
}

${hasFlightNumber
    ? `${t.flightNumber}:\n${flightNumber}\n`
    : ""
}

${hasVehicle
    ? `${t.vehicle}:\n${vehicleName}${vehiclePlate ? ` (${vehiclePlate})` : ""}\n`
    : ""
}

${hasDriver
    ? `${t.driver}:\n${staffName}\n`
    : ""
}


${t.paymentSummary.toUpperCase()}

${t.subtotal}:
${subtotalFormatted}

${hasDiscount
    ? `${t.discount}:\n-${discountFormatted}\n`
    : ""
}

${hasTax
    ? `${t.taxes}:\n${taxFormatted}\n`
    : ""
}

${t.total}:
${totalFormatted}

${hasBookingSource
    ? `${t.bookingSource}:\n${bookingSourceName}\n`
    : ""
}


${companyName}

${companyPhone
    ? `${t.phone}: ${companyPhone}`
    : ""
}

${companyEmail
    ? `${t.email}: ${companyEmail}`
    : ""
}

${companyWebsite
    ? `${t.website}: ${companyWebsite}`
    : ""
}

${companyAddress
    ? `${t.address}: ${companyAddress}`
    : ""
}


${t.customerMessage}

`;


    /*
    ==========================================================
    HTML
    ==========================================================
    */

    const html = `

<!DOCTYPE html>

<html lang="${selectedLanguage}">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        ${t.reservationConfirmed}
    </title>

</head>


<body
    style="
        margin:0;
        padding:0;
        background:#f4f6f8;
        font-family:
            Arial,
            Helvetica,
            sans-serif;
        color:#172033;
    "
>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#f4f6f8;
        padding:40px 20px;
    "
>

<tr>

<td align="center">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:680px;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        border:1px solid #e5e7eb;
    "
>


<!-- ======================================================
     HEADER
======================================================= -->

<tr>

<td
    style="
        padding:32px 36px;
        text-align:center;
        border-bottom:1px solid #eef0f3;
    "
>

${
    logoURL

        ? `

        <img
            src="${escapeHtml(logoURL)}"
            alt="${companyName}"
            style="
                max-width:180px;
                max-height:80px;
                object-fit:contain;
                display:block;
                margin:0 auto 24px;
            "
        >

        `

        : `

        <div
            style="
                font-size:24px;
                font-weight:700;
                color:${primaryColor};
                margin-bottom:20px;
            "
        >
            ${companyName}
        </div>

        `
}


<div
    style="
        display:inline-block;
        background:#ecfdf3;
        color:#027a48;
        padding:7px 14px;
        border-radius:999px;
        font-size:13px;
        font-weight:600;
    "
>

    ${t.reservationConfirmed}

</div>


${
    reservationNumber

        ? `

        <div
            style="
                margin-top:12px;
                color:#6b7280;
                font-size:13px;
            "
        >

            ${reservationNumber}

        </div>

        `

        : ""
}


</td>

</tr>


<!-- ======================================================
     INTRODUCTION
======================================================= -->

<tr>

<td
    style="
        padding:36px 36px 20px;
    "
>

<h1
    style="
        margin:0 0 14px;
        font-size:26px;
        line-height:1.3;
        color:#111827;
    "
>

    ${t.hello} ${clientName},

</h1>


<p
    style="
        margin:0;
        font-size:15px;
        line-height:1.7;
        color:#5b6472;
    "
>

    ${t.confirmationMessage}

</p>


</td>

</tr>


<!-- ======================================================
     SERVICE DETAILS
======================================================= -->

<tr>

<td
    style="
        padding:0 36px 28px;
    "
>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:12px;
    "
>


<tr>

<td
    style="
        padding:22px;
    "
>


<div
    style="
        color:${primaryColor};
        font-size:12px;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:0.6px;
        margin-bottom:8px;
    "
>

    ${t.service}

</div>


<div
    style="
        color:#111827;
        font-size:18px;
        font-weight:600;
        margin-bottom:22px;
    "
>

    ${serviceName}

</div>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>


<tr>

<td
    width="50%"
    valign="top"
    style="
        padding:0 10px 18px 0;
    "
>

<div
    style="
        color:#6b7280;
        font-size:12px;
        margin-bottom:5px;
    "
>

    ${t.date}

</div>


<div
    style="
        color:#111827;
        font-size:14px;
        font-weight:600;
    "
>

    ${reservationDate}

</div>

</td>


<td
    width="50%"
    valign="top"
    style="
        padding:0 0 18px 10px;
    "
>

<div
    style="
        color:#6b7280;
        font-size:12px;
        margin-bottom:5px;
    "
>

    ${t.time}

</div>


<div
    style="
        color:#111827;
        font-size:14px;
        font-weight:600;
    "
>

    ${reservationTime}

</div>

</td>

</tr>


<tr>

<td
    width="50%"
    valign="top"
    style="
        padding:0 10px 0 0;
    "
>

<div
    style="
        color:#6b7280;
        font-size:12px;
        margin-bottom:5px;
    "
>

    ${t.passengers}

</div>


<div
    style="
        color:#111827;
        font-size:14px;
        font-weight:600;
    "
>

    ${passengers}

</div>

</td>


<td
    width="50%"
    valign="top"
    style="
        padding:0 0 0 10px;
    "
>

${
    hasFlightNumber

        ? `

        <div
            style="
                color:#6b7280;
                font-size:12px;
                margin-bottom:5px;
            "
        >

            ${t.flightNumber}

        </div>


        <div
            style="
                color:#111827;
                font-size:14px;
                font-weight:600;
            "
        >

            ${flightNumber}

        </div>

        `

        : ""
}

</td>

</tr>


</table>


</td>

</tr>

</table>


</td>

</tr>


<!-- ======================================================
     ROUTE
======================================================= -->

${
    hasRoute

        ? `

<tr>

<td
    style="
        padding:0 36px 28px;
    "
>


<div
    style="
        color:#6b7280;
        font-size:12px;
        font-weight:600;
        text-transform:uppercase;
        letter-spacing:0.5px;
        margin-bottom:10px;
    "
>

    ${t.route}

</div>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>


<td
    width="46%"
    valign="middle"
    style="
        padding:18px;
        border:1px solid #e5e7eb;
        border-radius:10px;
    "
>

<div
    style="
        color:#6b7280;
        font-size:11px;
        text-transform:uppercase;
        margin-bottom:6px;
    "
>

    ${t.pickup}

</div>


<div
    style="
        color:#111827;
        font-size:14px;
        font-weight:600;
    "
>

    ${locationFrom || t.toBeConfirmed}

</div>

</td>


<td
    width="8%"
    align="center"
    style="
        color:${primaryColor};
        font-size:20px;
        font-weight:600;
    "
>

    →

</td>


<td
    width="46%"
    valign="middle"
    style="
        padding:18px;
        border:1px solid #e5e7eb;
        border-radius:10px;
    "
>

<div
    style="
        color:#6b7280;
        font-size:11px;
        text-transform:uppercase;
        margin-bottom:6px;
    "
>

    ${t.destination}

</div>


<div
    style="
        color:#111827;
        font-size:14px;
        font-weight:600;
    "
>

    ${locationTo || t.toBeConfirmed}

</div>

</td>


</tr>

</table>


${
    hasRouteCode

        ? `

        <div
            style="
                margin-top:10px;
                color:#6b7280;
                font-size:12px;
            "
        >

            ${t.routeCode}:

            <strong style="color:#111827;">

                ${routeCode}

            </strong>

        </div>

        `

        : ""
}


</td>

</tr>

`

        : ""
}


<!-- ======================================================
     OPERATIONAL DETAILS
======================================================= -->

${
    hasVehicle || hasDriver

        ? `

<tr>

<td
    style="
        padding:0 36px 28px;
    "
>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>


<tr>


${
    hasVehicle

        ? `

        <td
            width="${hasDriver ? "50%" : "100%"}"
            valign="top"
            style="
                padding:0 ${hasDriver ? "8px" : "0"} 0 0;
            "
        >

            <div
                style="
                    padding:18px;
                    background:#f8fafc;
                    border:1px solid #e5e7eb;
                    border-radius:10px;
                "
            >

                <div
                    style="
                        color:#6b7280;
                        font-size:11px;
                        text-transform:uppercase;
                        margin-bottom:6px;
                    "
                >

                    ${t.vehicle}

                </div>


                <div
                    style="
                        color:#111827;
                        font-size:14px;
                        font-weight:600;
                    "
                >

                    ${vehicleName || t.toBeConfirmed}

                </div>


                ${
                    vehiclePlate

                        ? `

                        <div
                            style="
                                margin-top:4px;
                                color:#6b7280;
                                font-size:12px;
                            "
                        >

                            ${t.plate}:

                            ${vehiclePlate}

                        </div>

                        `

                        : ""
                }

            </div>

        </td>

        `

        : ""
}


${
    hasDriver

        ? `

        <td
            width="50%"
            valign="top"
            style="
                padding:0 0 0 8px;
            "
        >

            <div
                style="
                    padding:18px;
                    background:#f8fafc;
                    border:1px solid #e5e7eb;
                    border-radius:10px;
                "
            >

                <div
                    style="
                        color:#6b7280;
                        font-size:11px;
                        text-transform:uppercase;
                        margin-bottom:6px;
                    "
                >

                    ${t.driver}

                </div>


                <div
                    style="
                        color:#111827;
                        font-size:14px;
                        font-weight:600;
                    "
                >

                    ${staffName}

                </div>

            </div>

        </td>

        `

        : ""
}


</tr>

</table>


</td>

</tr>

`

        : ""
}


<!-- ======================================================
     FINANCIAL SUMMARY
======================================================= -->

<tr>

<td
    style="
        padding:0 36px 32px;
    "
>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        border-top:1px solid #e5e7eb;
    "
>


<tr>

<td
    colspan="2"
    style="
        padding:22px 0 14px;
        color:#111827;
        font-size:15px;
        font-weight:700;
    "
>

    ${t.paymentSummary}

</td>

</tr>


<tr>

<td
    style="
        padding:5px 0;
        color:#6b7280;
        font-size:13px;
    "
>

    ${t.subtotal}

</td>


<td
    align="right"
    style="
        padding:5px 0;
        color:#111827;
        font-size:13px;
    "
>

    ${subtotalFormatted}

</td>

</tr>


${
    hasDiscount

        ? `

        <tr>

        <td
            style="
                padding:5px 0;
                color:#6b7280;
                font-size:13px;
            "
        >

            ${t.discount}

        </td>


        <td
            align="right"
            style="
                padding:5px 0;
                color:#111827;
                font-size:13px;
            "
        >

            -${discountFormatted}

        </td>

        </tr>

        `

        : ""
}


${
    hasTax

        ? `

        <tr>

        <td
            style="
                padding:5px 0;
                color:#6b7280;
                font-size:13px;
            "
        >

            ${t.taxes}

        </td>


        <td
            align="right"
            style="
                padding:5px 0;
                color:#111827;
                font-size:13px;
            "
        >

            ${taxFormatted}

        </td>

        </tr>

        `

        : ""
}


<tr>

<td
    style="
        padding:18px 0 0;
        border-top:1px solid #e5e7eb;
        color:#111827;
        font-size:15px;
        font-weight:700;
    "
>

    ${t.total}

</td>


<td
    align="right"
    style="
        padding:18px 0 0;
        border-top:1px solid #e5e7eb;
        color:${primaryColor};
        font-size:23px;
        font-weight:700;
    "
>

    ${totalFormatted}

</td>

</tr>


${
    currency

        ? `

        <tr>

        <td
            colspan="2"
            align="right"
            style="
                padding-top:5px;
                color:#9ca3af;
                font-size:10px;
            "
        >

            ${escapeHtml(currency)}

        </td>

        </tr>

        `

        : ""
}


</table>


</td>

</tr>


<!-- ======================================================
     BOOKING SOURCE
======================================================= -->

${
    hasBookingSource

        ? `

<tr>

<td
    style="
        padding:0 36px 28px;
    "
>

<div
    style="
        color:#9ca3af;
        font-size:11px;
        text-align:center;
    "
>

    ${t.reservationManagedThrough}

    ${bookingSourceName}

</div>

</td>

</tr>

`

        : ""
}


<!-- ======================================================
     CUSTOMER MESSAGE
======================================================= -->

<tr>

<td
    style="
        padding:0 36px 36px;
    "
>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#f8fafc;
        border-radius:10px;
    "
>

<tr>

<td
    style="
        padding:18px 20px;
        color:#5b6472;
        font-size:13px;
        line-height:1.7;
    "
>

    ${t.customerMessage}

</td>

</tr>

</table>


</td>

</tr>


<!-- ======================================================
     FOOTER
======================================================= -->

<tr>

<td
    style="
        padding:28px 36px;
        background:#f8fafc;
        border-top:1px solid #eef0f3;
        text-align:center;
    "
>


<div
    style="
        color:#111827;
        font-size:15px;
        font-weight:700;
        margin-bottom:10px;
    "
>

    ${companyName}

</div>


${
    companyPhone

        ? `

        <div
            style="
                color:#6b7280;
                font-size:12px;
                margin-bottom:4px;
            "
        >

            ${t.phone}:
            ${companyPhone}

        </div>

        `

        : ""
}


${
    companyEmail

        ? `

        <div
            style="
                color:#6b7280;
                font-size:12px;
                margin-bottom:4px;
            "
        >

            ${t.email}:
            ${companyEmail}

        </div>

        `

        : ""
}


${
    companyWebsite

        ? `

        <div
            style="
                color:#6b7280;
                font-size:12px;
                margin-bottom:4px;
            "
        >

            ${t.website}:
            ${companyWebsite}

        </div>

        `

        : ""
}


${
    companyAddress

        ? `

        <div
            style="
                color:#9ca3af;
                font-size:11px;
                margin-top:8px;
            "
        >

            ${t.address}:
            ${companyAddress}

        </div>

        `

        : ""
}


<div
    style="
        margin-top:18px;
        color:#9ca3af;
        font-size:10px;
    "
>

    ${t.footerMessage}

</div>


</td>

</tr>


</table>


</td>

</tr>

</table>


</body>

</html>

`;


    /*
    ==========================================================
    RETURN TEMPLATE
    ==========================================================
    */

    return {

        subject,

        html,

        text

    };

}