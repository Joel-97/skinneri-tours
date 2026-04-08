import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { server } from '../serverName/Server';

export const listenPendingAdmins = (callback) => {
  const q = query(
    collection(db, "admins"),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    const admins = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(admins);
  });
};
