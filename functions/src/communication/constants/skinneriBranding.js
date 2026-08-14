/**
 * ==========================================================
 * SKINNERI BRANDING
 * ==========================================================
 */

const SKINNERI_BRANDING = Object.freeze({

    /*
    ======================================================
    COMPANY
    ======================================================
    */

    name:

        "Skinneri",

    website:

        "https://skinneri.com",


    /*
    ======================================================
    EMAILS
    ======================================================
    */

    emails: {

        /*
        --------------------------------------------------
        SUPPORT
        --------------------------------------------------
        */

        support:

            "support@skinneri.com",


        /*
        --------------------------------------------------
        PLATFORM SENDER
        --------------------------------------------------

        Used when a company does not have a verified
        custom domain.

        Example:

        Los Patitos via Skinneri
        <noreply@skinneri.com>

        --------------------------------------------------
        */

        noReply:

            "noreply@skinneri.com",


        /*
        --------------------------------------------------
        PLATFORM SENDER NAME
        --------------------------------------------------

        Used as the platform identity when Skinneri
        sends on behalf of a company.

        --------------------------------------------------
        */

        senderName:

            "Skinneri"

    },


    /*
    ======================================================
    LOGO
    ======================================================
    */

    logo: {

        url:

            "",

        alt:

            "Skinneri"

    },


    /*
    ======================================================
    COLORS
    ======================================================
    */

    colors: {

        primary:

            "#08204B",

        secondary:

            "#5B2D8B",

        accent:

            "#829CB0",

        background:

            "#F4F6F9",

        surface:

            "#FFFFFF",

        text:

            "#1F2937",

        muted:

            "#6B7280",

        border:

            "#E5E7EB",

        buttonText:

            "#FFFFFF"

    },


    /*
    ======================================================
    SOCIAL MEDIA
    ======================================================
    */

    social: {

        facebook:

            "",

        instagram:

            "",

        linkedin:

            "",

        youtube:

            ""

    },


    /*
    ======================================================
    FOOTER
    ======================================================
    */

    footer: {

        disclaimer:

            "Este correo fue enviado automáticamente por la plataforma Skinneri.",

        copyright:

            `© ${new Date().getFullYear()} Skinneri. Todos los derechos reservados.`

    }

});


export default SKINNERI_BRANDING;