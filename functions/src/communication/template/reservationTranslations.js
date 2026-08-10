/**
 * ==========================================================
 * RESERVATION EMAIL TRANSLATIONS
 * ==========================================================
 */

const RESERVATION_TRANSLATIONS = {

    es: {

        subject: "Reserva confirmada",

        reservationConfirmed:
            "Reserva confirmada",

        hello:
            "Hola",

        confirmationMessage:
            "Tu reserva ha sido confirmada correctamente. A continuación encontrarás los detalles de tu servicio.",

        service:
            "Servicio",

        date:
            "Fecha",

        time:
            "Hora",

        passengers:
            "Pasajeros",

        flightNumber:
            "Número de vuelo",

        route:
            "Ruta",

        pickup:
            "Recogida",

        destination:
            "Destino",

        toBeConfirmed:
            "Por confirmar",

        routeCode:
            "Código de ruta",

        vehicle:
            "Vehículo",

        plate:
            "Placa",

        driver:
            "Conductor",

        paymentSummary:
            "Resumen de pago",

        subtotal:
            "Subtotal",

        discount:
            "Descuento",

        taxes:
            "Impuestos",

        total:
            "Total",

        bookingSource:
            "Origen de reserva",

        reservationManagedThrough:
            "Reserva gestionada mediante",

        customerMessage:
            "Si necesitas realizar algún cambio o tienes alguna consulta sobre tu reserva, puedes responder directamente a este correo.",

        footerMessage:
            "Este correo fue enviado en relación con tu reserva.",

        phone:
            "Teléfono",

        email:
            "Email",

        website:
            "Website",

        address:
            "Dirección"

    },


    en: {

        subject:
            "Reservation confirmed",

        reservationConfirmed:
            "Reservation confirmed",

        hello:
            "Hello",

        confirmationMessage:
            "Your reservation has been successfully confirmed. Below you will find the details of your service.",

        service:
            "Service",

        date:
            "Date",

        time:
            "Time",

        passengers:
            "Passengers",

        flightNumber:
            "Flight number",

        route:
            "Route",

        pickup:
            "Pickup",

        destination:
            "Destination",

        toBeConfirmed:
            "To be confirmed",

        routeCode:
            "Route code",

        vehicle:
            "Vehicle",

        plate:
            "Plate",

        driver:
            "Driver",

        paymentSummary:
            "Payment summary",

        subtotal:
            "Subtotal",

        discount:
            "Discount",

        taxes:
            "Taxes",

        total:
            "Total",

        bookingSource:
            "Booking source",

        reservationManagedThrough:
            "Reservation managed through",

        customerMessage:
            "If you need to make any changes or have any questions about your reservation, you can reply directly to this email.",

        footerMessage:
            "This email was sent regarding your reservation.",

        phone:
            "Phone",

        email:
            "Email",

        website:
            "Website",

        address:
            "Address"

    }

};


/**
 * ==========================================================
 * GET RESERVATION TRANSLATIONS
 * ==========================================================
 */

export function getReservationTranslations(
    language = "en"
) {

    return (

        RESERVATION_TRANSLATIONS[language] ||

        RESERVATION_TRANSLATIONS.en

    );

}


export default RESERVATION_TRANSLATIONS;