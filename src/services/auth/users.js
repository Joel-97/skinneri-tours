// import { query, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { query, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, where } from "firebase/firestore";
import { auth, db } from '../../firebase';
import Swal from "sweetalert2";
import { v4 as uuid } from "uuid";
import { server } from '../serverName/Server';
import { roleVisit } from '../Tools';

export const getDataUsers = async (setdata, setPending = null) => {

    try {
      if (auth.currentUser != null) {
        const q = query(collection(db, server + "_users"));
        const querySnapshot = await getDocs(q);
  
        setdata({ rows: [] });
  
        var array = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          array.push(data);
        });
        setdata({
          rows: array
        });
  
        if (setPending) {
          setPending(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
}

export const getDataOneUser = async (id, setPending = null) => {
    try {
        if (auth.currentUser != null) {
            const all = query(collection(db, server === 'bookings' ? "bookings_users" : 'dev_users'), where('id', '==', id));
            const querySnapshot = await getDocs(all);
            
            var array = [];
            querySnapshot.forEach((doc) => {
            const data = doc.data();
            array.push(data);
            });

            return array;
        }
    } catch (error) {
        console.log(error);
    }
}

export const addDataUsers = async (data, message = false, del = false) => {
    try {
      var id = uuid();
      const docRef = doc(
        db,
        del ? (server === 'bookings' ? "plan_1_delete_911_users" : 'dev_delete_911_users') : server + "_users",
        id
      );
  
      const userId = auth.currentUser;
      let today = new Date();
      let now = today.toLocaleString();
  
      if (userId !== null) {
        // Extraer los campos relevantes del objeto data
        const { email, displayName, uid } = data;
  
        // Crear un nuevo objeto plano con los campos extraídos
        const userData = {
          email: email,
          displayName: displayName,
          role: roleVisit,
          created_by_id: userId.uid,
          created_by_email: userId.email,
          created_by_name: userId.displayName,
          created_date: now,
          id: uid,
        };
  
        if (del) {
          userData['deleted_by_id'] = userId.uid;
          userData['deleted_by_email'] = userId.email;
          userData['deleted_by_name'] = userId.displayName;
          userData['deleted_date'] = now;
        }
  
        // Pasar el nuevo objeto userData a setDoc()
        await setDoc(docRef, userData);
  
        if (message) {
          Swal.fire({
            icon: "success",
            title: "Added",
            text: "The user was created successfully",
            confirmButtonColor: '#173d38',
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
      alert(error);
    }
  }
  

export const editDataUsers = async (edit) => {
    try {
      const docRef = doc(db, server + "_users", edit.id);
      const userId = auth.currentUser;
      let today = new Date();
      let now = today.toLocaleString();
      
      edit['updated_by_id'] = userId.uid;
      edit['updated_by_email'] = userId.email;
      edit['updated_by_name'] = userId.displayName;
      edit['updated_date'] = now;

      await updateDoc(docRef,edit);

      Swal.fire({
        icon: "success",
        title: "Edited",
        text: "The user was edited successfully",
        confirmButtonColor: '#173d38',
        confirmButtonText: "Ok",
      });
    } catch (error) {
      console.log(error);
    }
}

export const deleteDataUsers = async (element) => {
    try {
        var element_duplicated = Object.assign({}, element);
        await addDataUsers(element_duplicated, false, true);

        const docRef = doc(db, server + "_users", element.id);
        await deleteDoc(docRef);
    } catch (error) {
        console.log(error);
    }
}