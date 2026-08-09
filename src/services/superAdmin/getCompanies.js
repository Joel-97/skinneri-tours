import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export const listenCompanies = (callback) => {
  const ref = collection(db, "companies");

  const unsubscribe = onSnapshot(ref, (snapshot) => {
    const companies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(companies);
  });

  return unsubscribe;
};

export const listenCompanyAdmins = (companyId, callback) => {
  const q = query(
    collection(db, "users"),
    where("companyId", "==", companyId),
    where("status", "==", "approved")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(users);
  });

  return unsubscribe;
};

export const listenAdminsByCompany = (companyId, callback) => {
  const q = query(
    collection(db, "users"),
    where("companyId", "==", companyId)
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(users);
  });
};