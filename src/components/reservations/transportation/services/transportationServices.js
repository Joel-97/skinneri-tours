/*
==========================================================
TRANSPORTATION SERVICES
==========================================================
*/

import { getServiceTypes } from "../../../../services/settings/general/serviceTypeService";
import { getLocations } from "../../../../services/settings/transportation/locationsService";
import { getTaxes } from "../../../../services/settings/general/taxService";
import { getDiscounts } from "../../../../services/settings/transportation/discountService";
import { getCurrencies } from "../../../../services/settings/general/currencyService";
import { getDrivers } from "../../../../services/settings/transportation/driversService";
import { getPaymentTypes } from "../../../../services/settings/general/paymentTypeService";
import { getCommissionAgents } from "../../../../services/settings/general/agentsService";

import { getRoutes } from "../../../../services/settings/transportation/routesService";
import { getVehicles } from "../../../../services/settings/transportation/vehiclesService";
import { getBookingSources } from "../../../../services/settings/transportation/bookingSourcesService";
import { getPayers } from "../../../../services/settings/general/payersService";

/*
==========================================================
LOAD ALL SETTINGS
==========================================================
*/

export async function loadTransportationSettings(companyId) {

    if (!companyId) {
        return {

            serviceTypes: [],
            locations: [],
            taxes: [],
            discounts: [],
            currencies: [],
            drivers: [],
            paymentTypes: [],
            commissionAgents: [],

            routes: [],
            vehicles: [],
            bookingSources: [],
            payers: []

        };
    }

    const [

        serviceTypes,

        locations,

        taxes,

        discounts,

        currencies,

        drivers,

        paymentTypes,

        commissionAgents,

        routes,

        vehicles,

        bookingSources,

        payers

    ] = await Promise.all([

        getServiceTypes(companyId, "transportation"),

        getLocations(companyId),

        getTaxes(companyId),

        getDiscounts(companyId),

        getCurrencies(companyId),

        getDrivers(companyId),

        getPaymentTypes(companyId),

        getCommissionAgents(companyId),

        getRoutes(companyId),

        getVehicles(companyId),

        getBookingSources(companyId),

        getPayers(companyId)

    ]);

    return {

        serviceTypes:
            serviceTypes.filter(
                item => item.isActive
            ),

        locations:
            locations.filter(
                item => item.isActive
            ),

        taxes:
            taxes.filter(
                item => item.isActive
            ),

        discounts:
            discounts.filter(
                item => item.isActive
            ),

        currencies:
            currencies.filter(
                item => item.isActive
            ),

        drivers:
            drivers.filter(
                item => item.isActive
            ),

        paymentTypes:
            paymentTypes.filter(
                item => item.isActive
            ),

        commissionAgents:
            commissionAgents.filter(
                item => item.isActive
            ),

        routes:
            routes.filter(
                item => item.isActive
            ),

        vehicles:
            vehicles.filter(
                item => item.isActive
            ),

        bookingSources:
            bookingSources.filter(
                item => item.isActive
            ),

        payers:
            payers.filter(
                item => item.isActive
            )

    };

}