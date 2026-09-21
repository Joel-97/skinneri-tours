export const getStatusLabel = status => {

    const labels = {

        pending:
            "Pendiente",

        confirmed:
            "Confirmada",

        completed:
            "Completada",

        cancelled:
            "Cancelada",

        canceled:
            "Cancelada"

    };


    const normalized =
        String(status || "")
            .trim()
            .toLowerCase();


    return (
        labels[normalized] ||
        String(status || "")
    );

};


export const normalizeSelectOptions = (
    options,
    isStatus = false
) => {

    if (!Array.isArray(options)) {

        return [];

    }


    return options
        .filter(
            option =>
                option !== null &&
                option !== undefined &&
                option !== ""
        )
        .map(option => {

            if (
                typeof option === "string" ||
                typeof option === "number"
            ) {

                const value =
                    String(option);

                return {

                    value,

                    label:
                        isStatus
                            ? getStatusLabel(value)
                            : value

                };

            }


            if (
                option.value !== undefined
            ) {

                const value =
                    String(option.value);

                return {

                    value,

                    label:
                        isStatus
                            ? getStatusLabel(value)
                            : (
                                option.label ??
                                value
                            )

                };

            }


            if (
                option.id !== undefined
            ) {

                const value =
                    String(option.id);

                return {

                    value,

                    label:
                        option.name ??
                        option.label ??
                        value

                };

            }


            if (
                option.code !== undefined
            ) {

                const value =
                    String(option.code);

                return {

                    value,

                    label:
                        option.name ??
                        option.label ??
                        value

                };

            }


            return null;

        })
        .filter(Boolean);

};


export const getSelectedOption = (
    options,
    value
) => {

    if (
        !value ||
        !Array.isArray(options)
    ) {

        return null;

    }


    return (
        options.find(
            option =>
                String(option.value) ===
                String(value)
        ) ||
        null
    );

};


export const getStatusClass = status => {

    const normalized =
        String(status || "")
            .trim()
            .toLowerCase();


    if (
        normalized === "pending"
    ) {

        return "transportation-reservations__status transportation-reservations__status--pending";

    }


    if (
        normalized === "confirmed"
    ) {

        return "transportation-reservations__status transportation-reservations__status--confirmed";

    }


    if (
        normalized === "completed"
    ) {

        return "transportation-reservations__status transportation-reservations__status--completed";

    }


    if (
        normalized === "cancelled" ||
        normalized === "canceled"
    ) {

        return "transportation-reservations__status transportation-reservations__status--cancelled";

    }


    return "transportation-reservations__status transportation-reservations__status--unknown";

};


export const formatCurrency = (
    value,
    currency = "",
    companyCurrency = ""
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }


    const numericValue =
        Number(value);


    if (
        Number.isNaN(
            numericValue
        )
    ) {

        return "-";

    }


    const currencyCode =
        currency ||
        companyCurrency ||
        "";


    if (currencyCode) {

        try {

            return new Intl.NumberFormat(
                undefined,
                {
                    style:
                        "currency",

                    currency:
                        currencyCode
                }
            ).format(
                numericValue
            );

        } catch {

            return numericValue.toFixed(2);

        }

    }


    return numericValue.toFixed(2);

};