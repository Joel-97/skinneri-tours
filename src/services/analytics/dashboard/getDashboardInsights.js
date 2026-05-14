// ======================================================
// GET DASHBOARD INSIGHTS
// ======================================================

export const getDashboardInsights = ({

  kpis,

  paymentMethods,

  topActivities,

  topDrivers

}) => {

  const insights = [];

  // ====================================================
  // REVENUE GROWTH
  // ====================================================

  if (
    Number(kpis?.revenueGrowth) > 0
  ) {

    insights.push({

      type: "success",

      title:
        "Crecimiento de ingresos",

      description:
        `Los ingresos crecieron ${kpis.revenueGrowth}% respecto al período anterior.`

    });

  }

  // ====================================================
  // PENDING PAYMENTS
  // ====================================================

  if (
    Number(kpis?.pending) > 0
  ) {

    insights.push({

      type: "warning",

      title:
        "Pagos pendientes",

      description:
        `Actualmente existen $${kpis.pending} pendientes de confirmar.`

    });

  }

  // ====================================================
  // TOP PAYMENT METHOD
  // ====================================================

  if (
    paymentMethods?.length > 0
  ) {

    const topMethod =
      paymentMethods[0];

    insights.push({

      type: "info",

      title:
        "Método de pago principal",

      description:
        `${topMethod.name} representa el ${topMethod.percentage}% de los ingresos.`

    });

  }

  // ====================================================
  // TOP ACTIVITY
  // ====================================================

  if (
    topActivities?.length > 0
  ) {

    const topActivity =
      topActivities[0];

    insights.push({

      type: "success",

      title:
        "Actividad destacada",

      description:
        `${topActivity.name} lidera actualmente las reservas.`

    });

  }

  // ====================================================
  // TOP DRIVER
  // ====================================================

  if (
    topDrivers?.length > 0
  ) {

    const topDriver =
      topDrivers[0];

    insights.push({

      type: "info",

      title:
        "Conductor destacado",

      description:
        `${topDriver.name} genera el mayor volumen de ingresos.`

    });

  }

  // ====================================================
  // RETURN
  // ====================================================

  return insights;

};