import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";

// 🔹 Obtener rango de hoy (00:00 - 23:59)
const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    start: Timestamp.fromDate(today),
    end: Timestamp.fromDate(tomorrow)
  };
};

// 🔹 Obtener métricas del dashboard
export const getDashboardMetrics = async (companyId) => {
  const { start, end } = getTodayRange();

  const bookingsRef = collection(db, `companies/${companyId}/transportation`);

  const todayQuery = query(
    bookingsRef,
    where("date", ">=", start),
    where("date", "<", end)
  );

  try {


  const snapshot = await getDocs(todayQuery);

  let bookingsToday = 0;
  let revenueToday = 0;
  let unassignedTrips = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    bookingsToday++;

    revenueToday += data.totalAmount || 0;

    if (!data.driverId) {
      unassignedTrips++;
    }
  });

  return {
    bookingsToday,
    revenueToday,
    unassignedTrips
  };

} catch (error) {
   console.log("Error in todayQuery:", error);
}
};

// 🔹 Próximos servicios (hoy en adelante)
export const getUpcomingTrips = async (companyId) => {
  const now = Timestamp.now();

  const bookingsRef = collection(
    db,
    "companies",
    companyId,
    "transportation"
  );

  const upcomingQuery = query(
    bookingsRef,
    where("date", ">=", now),
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

  const bookingsRef = collection(
    db,
    "companies",
    companyId,
    "transportation"
  );

  const q = query(
    bookingsRef,
    where("date", ">=", start),
    where("date", "<=", end),
    orderBy("date", "asc")
  );

  try {

    const snapshot = await getDocs(q);

    const revenueByDay = {};

    // Inicializar últimos 7 días en 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().split("T")[0];
      revenueByDay[key] = 0;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date.toDate();
      const key = date.toISOString().split("T")[0];

      revenueByDay[key] += data.totalAmount || 0;
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