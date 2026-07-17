/*
==========================================================
FILTERS SECTION
==========================================================
*/

import React from "react";

import ClientSearch from "../ClientSearchOld";

import {

    CLIENT_STATUS_OPTIONS

} from "../constants/clientStatus";

const FiltersSection = ({

    controller

}) => {

    const {

        filters

    } = controller;

    return (

        <div className="clients-filters">

            {/* ==========================================
                SEARCH
            ========================================== */}

            <div className="clients-filter-search">

                <ClientSearch

                    searchTerm={

                        filters.searchTerm

                    }

                    setSearchTerm={

                        filters.setSearchTerm

                    }

                />

            </div>

            {/* ==========================================
                TYPE
            ========================================== */}

            <select

                className="form-select"

                value={

                    filters.selectedType

                }

                onChange={event =>

                    filters.setSelectedType(

                        event.target.value

                    )

                }

            >

                <option value="">

                    Todos los tipos

                </option>

                <option value="person">

                    Personas

                </option>

                <option value="company">

                    Empresas

                </option>

            </select>

            {/* ==========================================
                STATUS
            ========================================== */}

            <select

                className="form-select"

                value={

                    filters.selectedStatus

                }

                onChange={event =>

                    filters.setSelectedStatus(

                        event.target.value

                    )

                }

            >

                <option value="">

                    Todos los estados

                </option>

                {

                    CLIENT_STATUS_OPTIONS.map(

                        option => (

                            <option

                                key={option.value}

                                value={option.value}

                            >

                                {option.label}

                            </option>

                        )

                    )

                }

            </select>

        </div>

    );

};

export default FiltersSection;