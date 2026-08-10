/*
==========================================================
DASHBOARD SERVICE
==========================================================
*/

import {

  getDashboardFinancialMetrics

} from "./dashboardFinancialService";

import {

  getDashboardOperationalMetrics

} from "./dashboardOperationalService";

import {

  getDashboardFleetMetrics

} from "./dashboardFleetService";

import {

  getDashboardCRMMetrics

} from "./dashboardCRMService";

import {

  getDashboardTrips

} from "./dashboardTripsService";

/*
==========================================================
GET DASHBOARD DATA
==========================================================
*/

export function getDashboardData({

  reservations = [],

  drivers = [],

  vehicles = [],

  clients = []

}) {

  /*
  ==========================================================
  FINANCIAL
  ==========================================================
  */

  const financial =

    getDashboardFinancialMetrics(

      reservations

    );

  /*
  ==========================================================
  OPERATIONAL
  ==========================================================
  */

  const operational =

    getDashboardOperationalMetrics(

      reservations,

      drivers

    );

  /*
  ==========================================================
  FLEET
  ==========================================================
  */

  const fleet =

    getDashboardFleetMetrics(

      vehicles

    );

  /*
  ==========================================================
  CRM
  ==========================================================
  */

  const crm =

    getDashboardCRMMetrics(

      clients

    );

  /*
  ==========================================================
  TRIPS
  ==========================================================
  */

  const trips =

    getDashboardTrips(

      reservations

    );

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return {

    financial,

    operational,

    fleet,

    crm,

    trips

  };

}