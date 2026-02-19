import { query, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../../firebase'
import Swal from "sweetalert2";
import { v4 as uuid } from "uuid";
import { server } from '../serverName/Bookings';

export const addDataVehicleOccupation = async (data, message = false, del = false) => {
  try {
    var id = uuid();
    const docRef = doc(
      db,
      del ? (server === 'clients' ? "plan_1_delete_911_vehicle_occupation" : 'dev_delete_911_vehicle_occupation') : server + "_vehicle_occupation",
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
          text: "The shuttle type was created successfully",
          confirmButtonColor: '#173d38',
          confirmButtonText: "Ok",
        });
      }
    }
  } catch (error) {
    alert(error);
  }
}

export const editDataVehicleOccupation = async (edit, message = true) => {
  try {
    const docRef = doc(db, server + "_vehicle_occupation", edit.id);
    const userId = auth.currentUser;
    let today = new Date();
    let now = today.toLocaleString();
    
    edit['updated_by_id'] = userId.uid;
    edit['updated_by_email'] = userId.email;
    edit['updated_by_name'] = userId.displayName;
    edit['updated_date'] = now;

    await updateDoc(docRef,
      edit
    );
    if(message){
      Swal.fire({
        icon: "success",
        title: "Edited",
        text: "The shuttle type was edited successfully",
        confirmButtonColor: '#173d38',
        confirmButtonText: "Ok",
      });
    }
    
  } catch (error) {
    console.log(error);
  }
}

export const getDataVehicleOccupation = async (setdata, setPending = null) => {
  try {
    if (auth.currentUser != null) {
      const q = query(collection(db, server + "_vehicle_occupation"));
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

export const deleteDataVehicleOccupation = async (element) => {
  try {
    var element_duplicated = Object.assign({}, element);
    await addDataVehicleOccupation(element_duplicated, false, true);

    const docRef = doc(db, server + "_vehicle_occupation", element.id);
    await deleteDoc(docRef);
  } catch (error) {
    console.log(error);
  }
}
