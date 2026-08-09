/**
 * ==========================================================
 * SKINNERI TEMPLATES
 * ==========================================================
 */

/*
==========================================================
INVITACIÓN
==========================================================
*/

export function buildInvitationTemplateES({

    companyName,

    invitationLink

}) {

    return {

        subject:

            `Has sido invitado a ${companyName}`,

        text: `

Has sido invitado a formar parte de ${companyName} dentro de la plataforma Skinneri.

Para activar tu cuenta y crear tu contraseña, haz clic en el siguiente enlace:

${invitationLink}

Si no esperabas esta invitación, puedes ignorar este correo de forma segura.

`,

        html: `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8"/>

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
/>

</head>

<body
    style="
        margin:0;
        padding:40px;
        background:#F4F6F9;
        font-family:Arial,Helvetica,sans-serif;
    "
>

<table
    align="center"
    width="600"
    cellpadding="0"
    cellspacing="0"
    style="
        background:#FFFFFF;
        border-radius:12px;
        overflow:hidden;
    "
>

<tr>

<td
    style="padding:50px;"
>

<h1
    style="
        color:#08204B;
        margin-top:0;
    "
>

¡Bienvenido a Skinneri!

</h1>

<p>

Has sido invitado a formar parte de

<strong>

${companyName}

</strong>

dentro de la plataforma Skinneri.

</p>

<p>

Para comenzar, solo necesitas crear tu contraseña haciendo clic en el siguiente botón.

</p>

<p
    style="
        margin:40px 0;
    "
>

<a

    href="${invitationLink}"

    style="
        background:#08204B;
        color:#FFFFFF;
        padding:14px 28px;
        text-decoration:none;
        border-radius:8px;
        display:inline-block;
        font-weight:bold;
    "

>

Crear contraseña

</a>

</p>

<p>

Este enlace te permitirá establecer tu contraseña y activar tu cuenta de forma segura.

</p>

<p>

Si no esperabas esta invitación, simplemente puedes ignorar este correo.

</p>

<hr
    style="
        margin:40px 0;
        border:none;
        border-top:1px solid #DDDDDD;
    "
>

<p
    style="
        font-size:13px;
        color:#666666;
        line-height:1.6;
    "
>

Este correo fue enviado automáticamente por la plataforma Skinneri.

<br><br>

© ${new Date().getFullYear()} Skinneri. Todos los derechos reservados.

</p>

</td>

</tr>

</table>

</body>

</html>

`

    };

}