import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from "firebase/firestore";

import { db } from "../../firebase";

/* ======================================================
   DATE HELPERS
====================================================== */

/*
==========================================================
GET TODAY RANGE
==========================================================
*/

const getTodayRange = () => {

  const now = new Date();

  const start = new Date(now);

  start.setHours(
    0,
    0,
    0,
    0
  );

  const end = new Date(now);

  end.setHours(
    23,
    59,
    59,
    999
  );

  return {
    start,
    end
  };

};

/*
==========================================================
GET YESTERDAY RANGE
==========================================================
*/

const getYesterdayRange = () => {

  const now = new Date();

  const start = new Date(now);

  start.setDate(
    now.getDate() - 1
  );

  start.setHours(
    0,
    0,
    0,
    0
  );

  const end = new Date(now);

  end.setDate(
    now.getDate() - 1
  );

  end.setHours(
    23,
    59,
    59,
    999
  );

  return {
    start,
    end
  };

};

/*
==========================================================
FORMAT LOCAL DATE KEY
YYYY-MM-DD
==========================================================
*/

const formatDateKey = (date) => {

  const year = date.getFullYear();

  const month = String(

    date.getMonth() + 1

  ).padStart(2, "0");

  const day = String(

    date.getDate()

  ).padStart(2, "0");

  return `${year}-${month}-${day}`;

};

/*
==========================================================
GET RESERVATION DATE
==========================================================
*/

const getReservationDate = (value) => {

  if (!value) {
    return null;
  }

  const date =

    value?.toDate

      ? value.toDate()

      : new Date(value);

  if (

    Number.isNaN(

      date.getTime()

    )

  ) {

    return null;

  }

  return date;

};

/* ======================================================
   DASHBOARD METRICS
====================================================== */

export const getDashboardMetrics = async (

  companyId

) => {

  try {

    if (!companyId) {

      return {

        bookingsToday: 0,
        revenueToday: 0,
        unassignedTrips: 0,

        bookingsYesterday: 0,
        revenueYesterday: 0,

        bookingsTrend: 0,
        revenueTrend: 0

      };

    }

    /* =========================================
       DATE RANGES
    ========================================= */

    const {

      start: todayStart,

      end: todayEnd

    } = getTodayRange();

    const {

      start: yesterdayStart,

      end: yesterdayEnd

    } = getYesterdayRange();

    /* =========================================
       COLLECTION
    ========================================= */

    const bookingsRef = collection(

      db,

      "companies",

      companyId,

      "transportation"

    );

    /* =========================================
       TODAY QUERY
    ========================================= */

    const todayQuery = query(

      bookingsRef,

      where(

        "date",

        ">=",

        Timestamp.fromDate(

          todayStart

        )

      ),

      where(

        "date",

        "<=",

        Timestamp.fromDate(

          todayEnd

        )

      )

    );

    /* =========================================
       YESTERDAY QUERY
    ========================================= */

    const yesterdayQuery = query(

      bookingsRef,

      where(

        "date",

        ">=",

        Timestamp.fromDate(

          yesterdayStart

        )

      ),

      where(

        "date",

        "<=",

        Timestamp.fromDate(

          yesterdayEnd

        )

      )

    );

    /* =========================================
       EXECUTE QUERIES
    ========================================= */

    const [

      todaySnapshot,

      yesterdaySnapshot

    ] = await Promise.all([

      getDocs(todayQuery),

      getDocs(yesterdayQuery)

    ]);

    /* =========================================
       TODAY METRICS
    ========================================= */

    let bookingsToday = 0;

    let revenueToday = 0;

    let unassignedTrips = 0;

    todaySnapshot.forEach((docSnapshot) => {

      const data = docSnapshot.data();

      if (!data?.date) {

        return;

      }

      /*
      ============================================
      EXCLUDE CANCELLED
      ============================================
      */

      if (

        data.status === "cancelled"

      ) {

        return;

      }

      /*
      ============================================
      BOOKINGS
      ============================================
      */

      bookingsToday += 1;

      /*
      ============================================
      REVENUE
      ============================================
      */

      revenueToday += Number(

        data.total || 0

      );

      /*
      ============================================
      UNASSIGNED DRIVER
      ============================================
      */

      if (!data.driverId) {

        unassignedTrips += 1;

      }

    });

    /* =========================================
       YESTERDAY METRICS
    ========================================= */

    let bookingsYesterday = 0;

    let revenueYesterday = 0;

    yesterdaySnapshot.forEach((docSnapshot) => {

      const data = docSnapshot.data();

      if (!data?.date) {

        return;

      }

      /*
      ============================================
      EXCLUDE CANCELLED
      ============================================
      */

      if (

        data.status === "cancelled"

      ) {

        return;

      }

      bookingsYesterday += 1;

      revenueYesterday += Number(

        data.total || 0

      );

    });

    /* =========================================
       TREND CALCULATOR
    ========================================= */

    const calculateTrend = (

      current,

      previous

    ) => {

      if (

        current === 0 &&

        previous === 0

      ) {

        return 0;

      }

      if (

        previous === 0 &&

        current > 0

      ) {

        return 100;

      }

      return Math.round(

        (

          (current - previous) /

          previous

        ) * 100

      );

    };

    /* =========================================
       TRENDS
    ========================================= */

    const bookingsTrend =

      calculateTrend(

        bookingsToday,

        bookingsYesterday

      );

    const revenueTrend =

      calculateTrend(

        revenueToday,

        revenueYesterday

      );

    /* =========================================
       RETURN
    ========================================= */

    return {

      bookingsToday,

      revenueToday,

      unassignedTrips,

      bookingsYesterday,

      revenueYesterday,

      bookingsTrend,

      revenueTrend

    };

  } catch (error) {

    console.error(

      "Error getting dashboard metrics:",

      error

    );

    return {

      bookingsToday: 0,

      revenueToday: 0,

      unassignedTrips: 0,

      bookingsYesterday: 0,

      revenueYesterday: 0,

      bookingsTrend: 0,

      revenueTrend: 0

    };

  }

};

/* ======================================================
   UPCOMING TRIPS
====================================================== */

/*
  Obtiene servicios desde este momento
  hasta los próximos 7 días.

  Utiliza únicamente:

  date

  No utiliza endDate.
*/

export const getUpcomingTrips = async (

  companyId

) => {

  if (!companyId) {

    return [];

  }

  try {

    const now = new Date();

    const sevenDaysLater = new Date(

      now

    );

    sevenDaysLater.setDate(

      sevenDaysLater.getDate() + 7

    );

    const bookingsRef = collection(

      db,

      "companies",

      companyId,

      "transportation"

    );

    const upcomingQuery = query(

      bookingsRef,

      where(

        "date",

        ">=",

        Timestamp.fromDate(now)

      ),

      where(

        "date",

        "<=",

        Timestamp.fromDate(

          sevenDaysLater

        )

      ),

      orderBy(

        "date",

        "asc"

      )

    );

    const snapshot = await getDocs(

      upcomingQuery

    );

    const trips = snapshot.docs

      .map(docSnapshot => ({

        id: docSnapshot.id,

        ...docSnapshot.data()

      }))

      .filter(trip =>

        trip.status !== "cancelled" &&

        trip.status !== "completed"

      );

    return trips.slice(

      0,

      10

    );

  } catch (error) {

    console.error(

      "Error getting upcoming trips:",

      error

    );

    return [];

  }

};

/* ======================================================
   LAST 7 DAYS REVENUE
====================================================== */

export const getLast7DaysRevenue = async (

  companyId

) => {

  if (!companyId) {

    return [];

  }

  try {

    const now = new Date();

    /*
    ============================================
    END
    ============================================
    */

    const end = new Date(now);

    end.setHours(

      23,

      59,

      59,

      999

    );

    /*
    ============================================
    START
    ============================================
    */

    const start = new Date(now);

    start.setDate(

      start.getDate() - 6

    );

    start.setHours(

      0,

      0,

      0,

      0

    );

    const bookingsRef = collection(

      db,

      "companies",

      companyId,

      "transportation"

    );

    const q = query(

      bookingsRef,

      where(

        "date",

        ">=",

        Timestamp.fromDate(start)

      ),

      where(

        "date",

        "<=",

        Timestamp.fromDate(end)

      ),

      orderBy(

        "date",

        "asc"

      )

    );

    const snapshot = await getDocs(q);

    /* =========================================
       INITIALIZE DAYS
    ========================================= */

    const revenueByDay = {};

    for (

      let i = 0;

      i < 7;

      i++

    ) {

      const date = new Date(start);

      date.setDate(

        start.getDate() + i

      );

      revenueByDay[

        formatDateKey(date)

      ] = 0;

    }

    /* =========================================
       PROCESS RESERVATIONS
    ========================================= */

    snapshot.forEach(

      (docSnapshot) => {

        const data =

          docSnapshot.data();

        if (!data?.date) {

          return;

        }

        /*
        ==========================================
        EXCLUDE CANCELLED
        ==========================================
        */

        if (

          data.status === "cancelled"

        ) {

          return;

        }

        const reservationDate =

          getReservationDate(

            data.date

          );

        if (!reservationDate) {

          return;

        }

        const key =

          formatDateKey(

            reservationDate

          );

        if (

          !(key in revenueByDay)

        ) {

          return;

        }

        revenueByDay[key] +=

          Number(

            data.total || 0

          );

      }

    );

    /* =========================================
       RETURN
    ========================================= */

    return Object.keys(

      revenueByDay

    ).map(date => ({

      date,

      revenue:

        revenueByDay[date]

    }));

  } catch (error) {

    console.error(

      "Error getting last 7 days revenue:",

      error

    );

    return [];

  }

};

/* ======================================================
   ACTIVE DRIVERS
====================================================== */

export const getActiveDrivers = async (

  companyId

) => {

  if (!companyId) {

    return 0;

  }

  try {

    const driversRef = collection(

      db,

      "companies",

      companyId,

      "drivers"

    );

    const activeDriversQuery = query(

      driversRef,

      where(

        "isActive",

        "==",

        true

      )

    );

    const snapshot = await getDocs(

      activeDriversQuery

    );

    return snapshot.size;

  } catch (error) {

    console.error(

      "Error getting active drivers:",

      error

    );

    return 0;

  }

};