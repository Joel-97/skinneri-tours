import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const saveUser = async () => {
  try {
    await addDoc(collection(db, "users"), {
      nombre: "Fabricio",
      fecha: new Date()
    });
    console.log("User saved");
  } catch (e) {
    console.error("Error:", e);
  }
};
