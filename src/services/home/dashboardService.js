import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";
import { server } from '../serverName/Server';

/* ======================================================
   TODAY RANGE
====================================================== */

const getTodayRange = () => {

  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };

};

/* ======================================================
   YESTERDAY RANGE
====================================================== */

const getYesterdayRange = () => {

  const now = new Date();

  const start = new Date(now);
  start.setDate(now.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setDate(now.getDate() - 1);
  end.setHours(23, 59, 59, 999);

  return { start, end };

};

/* ======================================================
   DASHBOARD METRICS
====================================================== */

export const getDashboardMetrics = async (companyId) => {

  try {

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
       COLLECTION REFERENCE
    ========================================= */

    const bookingsRef = collection(
      db,
      `companies/${companyId}/transportation`
    );

    /* =========================================
       TODAY QUERY
    ========================================= */

    const todayQuery = query(
      bookingsRef,
      where("date", ">=", todayStart),
      where("date", "<=", todayEnd)
    );

    /* =========================================
       YESTERDAY QUERY
    ========================================= */

    const yesterdayQuery = query(
      bookingsRef,
      where("date", ">=", yesterdayStart),
      where("date", "<=", yesterdayEnd)
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

    todaySnapshot.forEach((doc) => {

      const data = doc.data();

      /* =====================================
         VALIDATE BOOKING
      ===================================== */

      if (!data) return;

      if (!data.date) return;

      /*
        Solo contamos reservas válidas.
      */

      bookingsToday++;

      /* =====================================
         REVENUE
      ===================================== */

      revenueToday += Number(data.total || 0);

      /* =====================================
         UNASSIGNED TRIPS
      ===================================== */

      if (!data.staffId) {
        unassignedTrips++;
      }

    });

    /* =========================================
       YESTERDAY METRICS
    ========================================= */

    let bookingsYesterday = 0;
    let revenueYesterday = 0;

    yesterdaySnapshot.forEach((doc) => {

      const data = doc.data();

      if (!data) return;

      if (!data.date) return;

      bookingsYesterday++;

      revenueYesterday += Number(data.total || 0);

    });

    /* =========================================
       SAFE TREND CALCULATOR
    ========================================= */

    const calculateTrend = (current, previous) => {

      /*
        Si ambos son 0:
        no hubo movimiento.
      */

      if (current === 0 && previous === 0) {
        return 0;
      }

      /*
        Si ayer fue 0 y hoy hay datos:
        crecimiento total.
      */

      if (previous === 0 && current > 0) {
        return 100;
      }

      /*
        Fórmula estándar:
        ((actual - anterior) / anterior) * 100
      */

      return Math.round(
        ((current - previous) / previous) * 100
      );

    };

    /* =========================================
       TRENDS
    ========================================= */

    const bookingsTrend = calculateTrend(
      bookingsToday,
      bookingsYesterday
    );

    const revenueTrend = calculateTrend(
      revenueToday,
      revenueYesterday
    );

    /* =========================================
       RETURN METRICS
    ========================================= */

    return {

      /* =====================================
         TODAY
      ===================================== */

      bookingsToday,
      revenueToday,
      unassignedTrips,

      /* =====================================
         YESTERDAY
      ===================================== */

      bookingsYesterday,
      revenueYesterday,

      /* =====================================
         TRENDS
      ===================================== */

      bookingsTrend,
      revenueTrend

    };

  } catch (error) {

    console.log(
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

// 🔹 Próximos servicios (hoy en adelante)
export const getUpcomingTrips = async (companyId) => {
  const now = Timestamp.now();

  // Crear fecha límite: ahora + 4 días
  const fourDaysLaterDate = new Date();
  fourDaysLaterDate.setDate(fourDaysLaterDate.getDate() + 7);
  const fourDaysLater = Timestamp.fromDate(fourDaysLaterDate);

  const bookingsRef = collection(db, "companies", companyId, "transportation");

  const upcomingQuery = query(
    bookingsRef,
    where("date", ">=", now),
    where("date", "<=", fourDaysLater),
    orderBy("date", "asc")
  );

  try {
    const snapshot = await getDocs(upcomingQuery);

    const trips = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return trips.slice(0, 10);

  } catch (error) {
    console.log("Error in upcomingQuery:", error);
    return [];
  }
};

export const getLast7DaysRevenue = async (companyId) => {

  if (!companyId) return [];

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const start = Timestamp.fromDate(sevenDaysAgo);
  const end = Timestamp.fromDate(today);

  const bookingsRef = collection(db, "companies", companyId, "transportation");

  const q = query(
    bookingsRef,
    where("date", ">=", start),
    where("date", "<=", end),
    orderBy("date", "asc")
  );

  try {

    const snapshot = await getDocs(q);

    const revenueByDay = {};

    // Función para obtener fecha local YYYY-MM-DD
    const formatDateKey = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    // Inicializar últimos 7 días
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      revenueByDay[formatDateKey(d)] = 0;
    }

    snapshot.forEach(doc => {
      const data = doc.data();

      if (!data.date) return;

      const date = data.date.toDate();
      const key = formatDateKey(date);

      if (!(key in revenueByDay)) return;

      revenueByDay[key] += Number(data.total || 0);
    });

    return Object.keys(revenueByDay).map(date => ({
      date,
      revenue: revenueByDay[date]
    }));

  } catch (error) {
    console.log("Error getLast7DaysRevenue:", error);
    return [];
  }
};

export const getActiveDrivers = async (companyId) => {

  try {

    const driversRef = collection(db, `companies/${companyId}/staff`);

    const activeDriversQuery = query(
      driversRef,
      where("isActive", "==", true)
    );

    const snapshot = await getDocs(activeDriversQuery);

    const activeDrivers = snapshot.size;

    return activeDrivers;

  } catch (error) {

    console.error("Error getting active drivers:", error);

    return 0;

  }

};