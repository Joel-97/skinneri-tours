/*
==========================================================
DASHBOARD FLEET SERVICE
==========================================================
*/

/*
==========================================================
GET DASHBOARD FLEET METRICS
==========================================================
*/

export function getDashboardFleetMetrics(

  vehicles = []

) {

  /*
  ==========================================================
  INITIAL DATA
  ==========================================================
  */

  const metrics = {

    totalVehicles: 0,

    activeVehicles: 0,

    inactiveVehicles: 0,

    availableVehicles: 0,

    unavailableVehicles: 0,

    totalPassengerCapacity: 0,

    totalLuggageCapacity: 0,

    totalMileage: 0,

    averageMileage: 0,

    vehicleTypes: []

  };

  /*
  ==========================================================
  VEHICLE TYPES
  ==========================================================
  */

  const types = new Map();

  /*
  ==========================================================
  PROCESS VEHICLES
  ==========================================================
  */

  vehicles.forEach((vehicle) => {

    metrics.totalVehicles += 1;

    /*
    ========================================================
    ACTIVE / INACTIVE
    ========================================================
    */

    if (vehicle.isActive) {

      metrics.activeVehicles += 1;

    } else {

      metrics.inactiveVehicles += 1;

    }

    /*
    ========================================================
    AVAILABLE / UNAVAILABLE

    Por ahora usamos isActive como referencia.
    Cuando exista un calendario de disponibilidad
    podremos reemplazar esta lógica sin afectar
    el Dashboard.
    ========================================================
    */

    if (vehicle.isActive) {

      metrics.availableVehicles += 1;

    } else {

      metrics.unavailableVehicles += 1;

    }

    /*
    ========================================================
    CAPACITY
    ========================================================
    */

    metrics.totalPassengerCapacity +=

      Number(

        vehicle.passengers || 0

      );

    metrics.totalLuggageCapacity +=

      Number(

        vehicle.luggage || 0

      );

    /*
    ========================================================
    MILEAGE
    ========================================================
    */

    metrics.totalMileage +=

      Number(

        vehicle.mileage || 0

      );

    /*
    ========================================================
    TYPES
    ========================================================
    */

    const type =

      vehicle.type ||

      "unknown";

    if (

      !types.has(type)

    ) {

      types.set(

        type,

        {

          type,

          total: 0

        }

      );

    }

    types.get(type).total++;

  });

  /*
  ==========================================================
  AVERAGE MILEAGE
  ==========================================================
  */

  if (

    metrics.totalVehicles > 0

  ) {

    metrics.averageMileage =

      Math.round(

        metrics.totalMileage /

        metrics.totalVehicles

      );

  }

  /*
  ==========================================================
  VEHICLE TYPES
  ==========================================================
  */

  metrics.vehicleTypes =

    Array.from(

      types.values()

    ).sort(

      (a, b) =>

        b.total - a.total

    );

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return metrics;

}