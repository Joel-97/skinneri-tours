/*
==========================================================
DASHBOARD CRM SERVICE
==========================================================
*/

/*
==========================================================
GET DASHBOARD CRM METRICS
==========================================================
*/

export function getDashboardCRMMetrics(

  clients = []

) {

  /*
  ==========================================================
  INITIAL DATA
  ==========================================================
  */

  const metrics = {

    totalClients: 0,

    activeClients: 0,

    inactiveClients: 0,

    people: 0,

    companies: 0,

    totalCountries: 0,

    totalLanguages: 0,

    totalSources: 0,

    countries: [],

    languages: [],

    sources: []

  };

  /*
  ==========================================================
  HELPERS
  ==========================================================
  */

  const countries = new Map();

  const languages = new Map();

  const sources = new Map();

  /*
  ==========================================================
  PROCESS CLIENTS
  ==========================================================
  */

  clients.forEach((client) => {

    metrics.totalClients++;

    /*
    ========================================================
    STATUS
    ========================================================
    */

    if (

      client.status === "active"

    ) {

      metrics.activeClients++;

    }

    else {

      metrics.inactiveClients++;

    }

    /*
    ========================================================
    TYPE
    ========================================================
    */

    if (

      client.type === "company"

    ) {

      metrics.companies++;

    }

    else {

      metrics.people++;

    }

    /*
    ========================================================
    COUNTRY
    ========================================================
    */

    const country =

      client.country ||

      "Unknown";

    if (

      !countries.has(country)

    ) {

      countries.set(

        country,

        {

          country,

          total: 0

        }

      );

    }

    countries.get(country).total++;

    /*
    ========================================================
    LANGUAGE
    ========================================================
    */

    const language =

      client.preferredLanguage ||

      "Unknown";

    if (

      !languages.has(language)

    ) {

      languages.set(

        language,

        {

          language,

          total: 0

        }

      );

    }

    languages.get(language).total++;

    /*
    ========================================================
    SOURCE
    ========================================================
    */

    const source =

      client.source ||

      "Unknown";

    if (

      !sources.has(source)

    ) {

      sources.set(

        source,

        {

          source,

          total: 0

        }

      );

    }

    sources.get(source).total++;

  });

  /*
  ==========================================================
  COLLECTIONS
  ==========================================================
  */

  metrics.countries =

    Array.from(

      countries.values()

    ).sort(

      (a, b) =>

        b.total - a.total

    );

  metrics.languages =

    Array.from(

      languages.values()

    ).sort(

      (a, b) =>

        b.total - a.total

    );

  metrics.sources =

    Array.from(

      sources.values()

    ).sort(

      (a, b) =>

        b.total - a.total

    );

  /*
  ==========================================================
  TOTALS
  ==========================================================
  */

  metrics.totalCountries =

    metrics.countries.length;

  metrics.totalLanguages =

    metrics.languages.length;

  metrics.totalSources =

    metrics.sources.length;

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return metrics;

}