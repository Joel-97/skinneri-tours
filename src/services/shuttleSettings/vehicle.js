// import { query, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
// import { auth, dbCrm } from '../../firebase'
// import Swal from "sweetalert2";
// import { v4 as uuid } from "uuid";
// import { serverCrm } from '../serverName/Crm';

// export const addDataVehicleType = async (data, message = false, del = false) => {
//   try {
//     var id = uuid();
//     const docRef = doc(
//       dbCrm,
//       del ? (serverCrm === 'clients' ? "plan_1_delete_911_request_type" : 'dev_delete_911_request_type') : serverCrm + "_request_type",
//       id
//     );
//     const userId = auth.currentUser;
//     let today = new Date();
//     let now = today.toLocaleString();

//     if (userId !== null) {
//       data['created_by_id'] = userId.uid;
//       data['created_by_email'] = userId.email;
//       data['created_by_name'] = userId.displayName;
//       data['created_date'] = now;
//       data['id'] = id;

//       if (del) {
//         data['deleted_by_id'] = userId.uid;
//         data['deleted_by_email'] = userId.email;
//         data['deleted_by_name'] = userId.displayName;
//         data['deleted_date'] = now;
//       }

//       await setDoc(docRef, data);

//       if (message) {
//         Swal.fire({
//           icon: "success",
//           title: "Added",
//           text: "The shuttle type was created successfully",
//           confirmButtonColor: '#173d38',
//           confirmButtonText: "Ok",
//         });
//       }
//     }
//   } catch (error) {
//     alert(error);
//   }
// }

// export const editDataVehicleType = async (edit, message = true) => {
//   try {
//     const docRef = doc(dbCrm, serverCrm + "_request_type", edit.id);
//     const userId = auth.currentUser;
//     let today = new Date();
//     let now = today.toLocaleString();
    
//     edit['updated_by_id'] = userId.uid;
//     edit['updated_by_email'] = userId.email;
//     edit['updated_by_name'] = userId.displayName;
//     edit['updated_date'] = now;

//     await updateDoc(docRef,
//       edit
//     );
//     if(message){
//       Swal.fire({
//         icon: "success",
//         title: "Edited",
//         text: "The shuttle type was edited successfully",
//         confirmButtonColor: '#173d38',
//         confirmButtonText: "Ok",
//       });
//     }
    
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const getDataVehicleType = async (setdata, setPending = null) => {
//   try {
//     if (auth.currentUser != null) {
//       const q = query(collection(dbCrm, serverCrm + "_request_type"));
//       const querySnapshot = await getDocs(q);

//       setdata({ rows: [] });

//       var array = [];
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         array.push(data);
//       });
//       setdata({
//         rows: array
//       });

//       if (setPending) {
//         setPending(false);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// export const deleteDataVehicleType = async (element) => {
//   try {
//     var element_duplicated = Object.assign({}, element);
//     await addDataVehicleType(element_duplicated, false, true);

//     const docRef = doc(dbCrm, serverCrm + "_request_type", element.id);
//     await deleteDoc(docRef);
//   } catch (error) {
//     console.log(error);
//   }
// }
