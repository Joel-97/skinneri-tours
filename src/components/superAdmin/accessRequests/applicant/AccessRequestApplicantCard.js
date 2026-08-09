/*
==========================================================
IMPORTS
==========================================================
*/

import {

    User,
    Mail,
    CalendarDays,
    Circle

} from "lucide-react";

import {

    useTranslation

} from "../../../../hooks/useTranslation";

import "./accessRequestApplicantCard.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function AccessRequestApplicantCard({

    request

}) {

    const {

        t

    } = useTranslation();

    /*
    ======================================================
    EMPTY
    ======================================================
    */

    if (

        !request

    ) {

        return null;

    }

    /*
    ======================================================
    INITIAL
    ======================================================
    */

    const initial =

        request.displayName

            ?.charAt(0)

            ?.toUpperCase()

        || "?";

    /*
    ======================================================
    DATE
    ======================================================
    */

    const requestedAt =

        request.requestedAt

            ? new Date(

                request.requestedAt

            ).toLocaleString()

            : "-";

    /*
    ======================================================
    RENDER
    ======================================================
    */

    return (

        <section

            className="access-request-applicant-card"

        >

            {/* ==========================================
                HEADER
            =========================================== */}

            <div

                className="access-request-applicant-card__header"

            >

                <div

                    className="access-request-applicant-card__avatar"

                >

                    {initial}

                </div>

                <div

                    className="access-request-applicant-card__user"

                >

                    <h3

                        className="access-request-applicant-card__name"

                    >

                        {request.displayName}

                    </h3>

                    <p

                        className="access-request-applicant-card__email"

                    >

                        {request.email}

                    </p>

                </div>

            </div>

            {/* ==========================================
                GRID
            =========================================== */}

            <div

                className="access-request-applicant-card__grid"

            >

                <div

                    className="access-request-applicant-card__item"

                >

                    <User size={18} />

                    <div>

                        <span>

                            {

                                t(

                                    "superAdmin.accessRequests.table.name"

                                )

                            }

                        </span>

                        <strong>

                            {request.displayName}

                        </strong>

                    </div>

                </div>

                <div

                    className="access-request-applicant-card__item"

                >

                    <Mail size={18} />

                    <div>

                        <span>

                            {

                                t(

                                    "superAdmin.accessRequests.table.email"

                                )

                            }

                        </span>

                        <strong>

                            {request.email}

                        </strong>

                    </div>

                </div>

                <div

                    className="access-request-applicant-card__item"

                >

                    <CalendarDays size={18} />

                    <div>

                        <span>

                            {

                                t(

                                    "superAdmin.accessRequests.table.requestedAt"

                                )

                            }

                        </span>

                        <strong>

                            {requestedAt}

                        </strong>

                    </div>

                </div>

                <div

                    className="access-request-applicant-card__item"

                >

                    <Circle size={18} />

                    <div>

                        <span>

                            {

                                t(

                                    "superAdmin.accessRequests.table.status"

                                )

                            }

                        </span>

                        <strong>

                            {

                                t(

                                    `superAdmin.accessRequests.status.${request.status}`

                                )

                            }

                        </strong>

                    </div>

                </div>

            </div>

        </section>

    );

}