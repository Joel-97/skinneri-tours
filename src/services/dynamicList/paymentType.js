import { query, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';
import Swal from "sweetalert2";
import { v4 as uuid } from "uuid";
import { server } from '../serverName/Bookings';

export const getDataPaymentType = async (setdata, setPending = null) => {

    try {
      if (auth.currentUser != null) {
        const q = query(collection(db, server + "_payment_type_config"));
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

export const addDataPaymentType = async (data, message = false, del = false) => {
    try {
      var id = uuid();
      const docRef = doc(
        db,
        del ? (server === 'bookings' ? "plan_1_delete_911_payment_type_config" : 'dev_delete_911_payment_type_config') : server + "_payment_type_config",
        id
      );

      const userId = auth.currentUser;
      let today = new Date();
      let now = today.toLocaleString();

      if (userId !== null) {
        data['created_by_id'] = userId.uid;
        data['created_by_email'] = userId.email;
        data['created_by_name'] = userId.displayName;
        data['created_date'] = now;
        data['id'] = id;
  
        if (del) {
          data['deleted_by_id'] = userId.uid;
          data['deleted_by_email'] = userId.email;
          data['deleted_by_name'] = userId.displayName;
          data['deleted_date'] = now;
        }
  
        await setDoc(docRef, data);
  
        if (message) {
          Swal.fire({
            icon: "success",
            title: "Added",
            text: "The payment type was created successfully",
            confirmButtonColor: '#173d38',
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
      alert(error);
    }
}

export const editDataPaymentType = async (edit) => {
    try {
      const docRef = doc(db, server + "_payment_type_config", edit.id);
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
        text: "The payment type was edited successfully",
        confirmButtonColor: '#173d38',
        confirmButtonText: "Ok",
      });
    } catch (error) {
      console.log(error);
    }
}

export const deleteDataPaymentType = async (element) => {
    try {
        var element_duplicated = Object.assign({}, element);
        await addDataPaymentType(element_duplicated, false, true);

        const docRef = doc(db, server + "_payment_type_config", element.id);
        await deleteDoc(docRef);
    } catch (error) {
        console.log(error);
    }
}