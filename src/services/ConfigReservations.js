import { query, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, orderBy, where, limit, serverTimestamp, writeBatch, Timestamp } from "firebase/firestore";
import { auth, db } from '../firebase';
import Swal from "sweetalert2";
import { v4 as uuid } from "uuid";
import { server } from './serverName/Bookings';
import { serverCrm } from './serverName/Crm';
import { ExcelRenderer } from 'react-excel-renderer';
import { numtoDate, formatDate } from './Tools';
// import { addDataInvoice, editDataInvoice } from './invoice';

export const fileHandler = (event, setData) => {
  let fileObj = event.target.files[0];
  //just pass the fileObj as parameter
  ExcelRenderer(fileObj, async (err, resp) => {
    var array = [];
    if (err) {
      console.log(err);
    }
    else {
      resp.rows.forEach(async (element, i) => {
        if (i !== 0 && element[0]) {

          if(element[11] !== "-"){
            var newObject = {
              idClient: '',
              client: {
                label: '',
                value: '',
              },
              newClientData: element[0],
              newClient: true,
              shuttle: { 
                value: element[5],
                label: element[5], 
                fixedRate: false,
                rate: 0,
              },
              pickUp: { 
                label: element[13],
                value: element[14],
              },
              pickUpAddress: '',
              dropOff: { 
                label: element[15],
                value: element[16],
              },
              dropOffAddress: '',
              nop: element[12] ? parseFloat(element[12]) : '',
              startDate: element[1] ? formatDate(numtoDate(element[1]), 'yyyy-MM-dd') : '',
              endDate: element[2] ? formatDate(numtoDate(element[2]), 'yyyy-MM-dd') : '',
              startTime: element[3],
              endTime: element[4],
              taxes: { 
                label:'GST',
                value: 5,
              },
              amount: element[7],
              amountPaid: element[10],
              taxAmount: element[8],
              total: element[11] ? element[11] : 0,
              balance: element[9] ? element[9] : 0,
              bookingType: 'No info',
              showInvoice: element[19] === 0 ? true : false,
              paid: element[19] === 1 ? true : false,
              agents: {
                commission: 0,
                label:'No info',
                value: '0',
              },
              // paymentLink: '',
              note: element[17],
              extraAmount: 0,
              extraCost: [],
              fuelSurcharge: false,
              fuelSurchargeAmount: 0,
              fuelSurchargePercentage: 9,
              discount: {
                value: '',
                label: '',
              },
              discountAmount: 0,
            }

            // var newObject = {
            //   idClient: element[0] ? element[0] : '',
            //   client: {
            //     email: element[3] ? element[3] : '',
            //     label: element[1] ? element[1] : '',
            //     organization: element[2] ? element[2] : '',
            //     phone: element[4] ? element[4] : '',
            //     value: element[0] ? element[0] : '',
            //   },
            //   shuttle: { 
            //     value: element[13] ? element[13] : '',
            //     label: element[13] ? element[13] : '', 
            //   },
            //   pickUp: { 
            //     label: element[13] === 'YYC' || element[13] === 'YXC' ? (element[13] === 'YYC' ? 'YYC' : 'YXC') : ('No info'),
            //     value: element[13] === 'YYC' || element[13] === 'YXC' ? (element[13] === 'YYC' ? '#2c00cc' : '#f22121') : ('No info'),
            //   },
            //   dropOff: { 
            //     label: element[13] === 'YYC' || element[13] === 'YXC' ? ('Fernie') : ('No info'),
            //     value: element[13] === 'YYC' || element[13] === 'YXC' ? ('#173d38') : ('#080808'),
            //   },
            //   nop: element[12] ? parseFloat(element[12]) : '',
            //   startDate: element[11] ? element[11] : '',
            //   endDate: element[11] ? element[11] : '',
            //   startTime: '00:00',
            //   endTime: '00:00',
            //   tax: { 
            //     label:'',
            //     value: '',
            //   },
            //   amount: 0,
            //   amountPaid: 0,
            //   taxAmount: 0,
            //   total: element[10] ? element[10] : '',
            //   balance: element[10] ? element[10] : '',
            //   bookingType: 'No info',
            //   agents: {},
            //   paymentLink: '',
            //   note: '',
            //   newClientData: '',
            //   newClient: true,
            //   extraAmount: '',
            //   taxes: {},
            //   extraCost: {},
            // }
            
            await addDataReservations(newObject);
            array.push(newObject);
          }
        }
      });
      setData({ rows: array });
    }

    Swal.fire({
      icon: "success",
      title: "Imported",
      text: "The transport was imported successfully",
      confirmButtonColor: '#173d38',
      confirmButtonText: "Ok",
    });
  });
}

export const getDataReservations = async (setdata, setPending = null, showAll = false) => {

  try {
    if (auth.currentUser != null) {
      let q = null;
      let querySnapshot = null;

      if(!showAll){
        q = query(collection(db, server + "_reservations"), orderBy("startDate", "desc"));
        querySnapshot = await getDocs(q);
      }else{
        let today = new Date();
        q = query(collection(db, server + "_reservations"), where('startDate', '==', formatDate(today, "yyyy-MM-dd")));
        querySnapshot = await getDocs(q);
      }
      

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
    console.error("Error getDataReservations");
  }
}

export const getDataReservationsHistory = async (setdata, setPending = null) => {

  try {
    if (auth.currentUser != null) {
    
      const q = query(collection(db, server + "_reservations"), where('showInvoice', '==', true));
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
    console.error("Error getDataReservationsHistory");
  }
}

export const getClientReservations = async (id, setdata, setPending = null) => {
  try {

    if (auth.currentUser != null) {
        const all = query(collection(db, server === 'bookings' ? "bookings_reservations" : "dev_reservations"), where("idClient", "==", id));
        const querySnapshot = await getDocs(all);

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
    console.error("Error getClientReservations");
  }
}

export const getReservationById = async (id, setPending = null) => {
  try {
    if (auth.currentUser != null) {
        const all = query(collection(db, server === 'bookings' ? "bookings_reservations" : "dev_reservations"), where("id", "==", id));
        const querySnapshot = await getDocs(all);
        
        var array = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          array.push(data);
        });

        return array;
    }
  } catch (error) {
    console.error("Error getReservationById");
  }
}

export const getTransportReport = async (startDate, endDate) => {
  try {
      if (auth.currentUser != null) {          
          const reservationsCollection = server === 'bookings' ? "bookings_reservations" : "dev_reservations";
          const all = query(collection(db, reservationsCollection), 
              where("startDate", ">=", startDate), 
              where("startDate", "<=", endDate)
          );
          const querySnapshot = await getDocs(all);
          
          // Crea un array para almacenar los resultados
          const array = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              array.push(data);
          });

          return array;
      } else {
          throw new Error("Unauthenticated user");
      }
  } catch (error) {
      // Maneja errores adecuadamente, puedes lanzar una excepción o devolver un objeto de error
      console.error("Error getTransportReport");
      throw error;
  }
}

export const getLeadSourcesReport = async (startDate, endDate, leadSource) => {
  try {
    if (auth.currentUser != null) {
      const reservationsCollection = server === 'bookings' ? "bookings_reservations" : "dev_reservations";
      const clientsCollection = serverCrm === 'clients' ? "clients" : "dev";

      const all = query(collection(db, reservationsCollection),
        where("startDate", ">=", startDate),
        where("startDate", "<=", endDate)
      );

     

      return 0;
      
    } else {
      throw new Error("Unauthenticated user");
    }
  } catch (error) {
    // Maneja errores adecuadamente, puedes lanzar una excepción o devolver un objeto de error
    console.error("Error getLeadSourcesReport");
    throw error;
  }
}

export const getClientServicesReport = async (setdata, setPending = null) => {
  try {
    if (auth.currentUser != null) {
      const reservationsCollection = server === 'bookings' ? "bookings_reservations" : "dev_reservations";
      const adventuresCollection = server === 'bookings' ? "bookings_adventures" : "dev_adventures";
      const clientsCollection = serverCrm === 'clients' ? "clients" : "dev";

      const allReservation = query(collection(db, reservationsCollection));
      const allAdventures = query(collection(db, adventuresCollection));

      const querySnapshotReser = await getDocs(allReservation);
      const querySnapshotAdven = await getDocs(allAdventures);

      // Extraer los documentos de reservations y adventures
      const reservationsData = querySnapshotReser.docs.map(doc => ({ id: `Transport-${doc.id}`, ...doc.data(), type: 'Transport' }));
      const adventuresData = querySnapshotAdven.docs.map(doc => ({ id: `Adventure-${doc.id}`, ...doc.data(), type: 'Adventure' }));

      // Combinar ambos arrays
      const combinedData = [...reservationsData, ...adventuresData];

      // Crea un mapa para almacenar los clientes por id
      const clientsMap = new Map();

      // Crea un array para almacenar los resultados combinados con información del cliente
      const combinedResults = combinedData.map(item => {
        const idClient = item?.type === "Transport" ? item?.idClient : item?.client?.value;

        // Verifica si hay información del cliente en el mapa
        if (clientsMap.has(idClient)) {
          const clientData = clientsMap.get(idClient);
          // Combina la información del cliente con los datos de la reserva o aventura
          return { ...item, ...clientData, id: `${item.type}-${item.id}-client-${idClient}` }; // Añadir una clave única
        } else {
          return { ...item, id: `${item.type}-${item.id}` };  // Si no hay información del cliente, devuelve el item original con una clave única
        }
      });

      // Establece los datos combinados en el estado
      setdata({
        rows: combinedResults
      });

      if (setPending) {
        setPending(false);
      }

    } else {
      throw new Error("Unauthenticated user");
    }
  } catch (error) {
    // Maneja errores adecuadamente, puedes lanzar una excepción o devolver un objeto de error
    console.error("Error transportation or adventures report");
    throw error;
  }
};

export const getClientReport3Services = async (setdata, setPending = null) => {
  try {
    if (auth.currentUser != null) {
      const reservationsCollection = server === 'bookings' ? "bookings_payments_reservation" : "dev_payments_reservation";
      const adventuresCollection = server === 'bookings' ? "bookings_payments_adventures" : "dev_payments_adventures";

      const allReservation = query(collection(db, reservationsCollection));
      const allAdventures = query(collection(db, adventuresCollection));

      const [querySnapshotReser, querySnapshotAdven] = await Promise.all([
        getDocs(allReservation),
        getDocs(allAdventures)
      ]);

      // Extraer los documentos de reservations y adventures
      const reservationsData = querySnapshotReser.docs.map(doc => ({ id: `Transport-${doc.id}`, ...doc.data(), type: 'Transport' }));

      const adventuresData = querySnapshotAdven.docs.map(doc => ({ id: `Adventure-${doc.id}`, ...doc.data(), type: 'Adventure' }));

      // Combinar ambos arrays en uno solo y filtrar los que tienen total === 0
      const combinedData = [...reservationsData, ...adventuresData].filter(item => item.total !== 0);

      // Establecer los datos filtrados en el estado
      setdata({ rows: combinedData });

      if (setPending) {
        setPending(false);
      }
    } else {
      throw new Error("Unauthenticated user");
    }
  } catch (error) {
    console.error("Error transportation or adventures report", error);
    throw error;
  }
};



export const getAgentReport = async (setdata, setPending = null) => {
  try {

    if (auth.currentUser != null) {
        const all = query(collection(db, server === 'bookings' ? "bookings_reservations" : "dev_reservations"), 
        where("bookingType", "==", "Agent"), where("balance","==",0));
        const querySnapshot = await getDocs(all);

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
    console.error("Error getAgentReport");
  }
}

export const getReservation = async (uuid, setdata, setPending = null) => {

  try {

    if (auth.currentUser != null) {
        const all = query(collection(db, server === 'bookings' ? "bookings_reservations" : 'dev_reservations'), where('id', '==', uuid));

        const querySnapshot = await getDocs(all);

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
    console.error("Error getReservation");
  }
}

export const getEventsAddReservation = async (setdata, setPending = null) => {
  try {
    if (auth.currentUser != null) {
        const all = query(collection(db, server === 'bookings' ? "bookings_events_add_reservations" : "dev_events_add_reservations"), 
        orderBy("created_date", "desc"), limit(300));
        const querySnapshot = await getDocs(all);

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
    console.error("Error getEventsAddReservation");
  }
}

export const getEventsEditReservation = async (setdata, setPending = null) => {
  try {
 
    if (auth.currentUser != null) {
        const all = query(collection(db, server === 'bookings' ? "bookings_events_edit_reservations" : "dev_events_edit_reservations"), 
        orderBy("updated_date", "desc"), limit(300));

        const querySnapshot = await getDocs(all);

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
    console.error("Error getEventsEditReservation");
  }
}

export const getEventsDeleteReservation = async (setdata, setPending = null) => {
  try {
 
    if (auth.currentUser != null) {
        const all = query(collection(db, server === 'bookings' ? "plan_1_delete_911_reservations" : 'dev_delete_911_reservations'),
        orderBy("deleted_date", "desc"), limit(300));
        
        const querySnapshot = await getDocs(all);

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
    console.error("Error getEventsDeleteReservation");
  }
}

export const addDataReservations = async (data, message = false, duplicate = false, del = false) => {
    try {
      var id = uuid();
      let newData = {};
      
      const docRef = doc(
        db,
        del ? (server === 'bookings' ? "plan_1_delete_911_reservations" : 'dev_delete_911_reservations') : server + "_reservations",
        id
      );

      const userId = auth.currentUser;
      let today = new Date();
      let now = today.toLocaleString();

      if (userId !== null) {
  
        if (del) {
          data['deleted_by_id'] = userId.uid;
          data['deleted_by_email'] = userId.email;
          data['deleted_by_name'] = userId.displayName;
          data['deleted_date'] = serverTimestamp();
          data['id_event'] = data?.id ? data?.id : id;
        }else{
          data['created_by_id'] = userId.uid;
          data['created_by_email'] = userId.email;
          data['created_by_name'] = userId.displayName;
          data['created_date'] = data?.created_date ? data?.created_date : serverTimestamp();          
          data['id'] = id;
        }

        if(!del){
          eventAddReservation(data);
        }

        await setDoc(docRef, data);

        if (message) {
          Swal.fire({
            icon: "success",
            title: "Added",
            text: "The reservation was created successfully",
            confirmButtonColor: '#173d38',
            confirmButtonText: "Ok",
          });
        }
        if (duplicate) {
          Swal.fire({
            icon: "success",
            title: "Added",
            text: "The reservation was successfully doubled",
            confirmButtonColor: '#173d38',
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
      console.error("Error addDataReservations");
    }
}

export const eventAddReservation = async (data) => {
  try {
    var id = uuid();
    const docRef = doc(db, server + "_events_add_reservations", id );
    const userId = auth.currentUser;
    data['client_name'] = data?.client?.label ? (data?.client?.label) : (data?.newClientData + " (UNREGISTERED)");

    if (userId !== null) {
      await setDoc(docRef, data);
    }
  } catch (error) {
    console.error("Error eventAddReservation");
  }
}

export const editDataReservations = async (edit, message = false, lastData = null) => {
    try {

      const docRef = doc(db, server + "_reservations", edit?.id);
      const userId = auth.currentUser;
      let today = new Date();
      let now = today.toLocaleString();
      
      edit['updated_by_id'] = userId?.uid ? userId.uid : "Customer-Payment";
      edit['updated_by_email'] = userId?.email ? userId.email : "Customer-Payment";
      edit['updated_by_name'] = userId?.displayName ? userId.displayName : "Customer-Payment";      
      edit['updated_date'] = serverTimestamp();

      if(lastData){
        let datas = { 
          new_data: edit, 
          old_data: lastData,
          client_name: edit?.client?.label ? (edit?.client?.label) : (edit?.newClientData + " (UNREGISTERED)"),
          id_event: edit?.id,
          updated_by_id: edit['updated_by_id'],
          updated_by_email: edit['updated_by_email'],
          updated_by_name: edit['updated_by_name'],
          updated_date: edit['updated_date'],
        };
        eventEditReservations(datas);
      }

      await updateDoc(docRef,edit);

      if(message){
        Swal.fire({
          icon: "success",
          title: "Edited",
          text: "The reservation was edited successfully",
          confirmButtonColor: '#173d38',
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error editDataReservations");
      Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Problems with the connection to the database.",
          confirmButtonColor: '#173d38',
          confirmButtonText: "OK",
      });
      
    }
}

export const editDataReservationsColor = async (edit, lastData = null) => {
  try {
    // const docRef = doc(db, server + "_reservations", edit?.id);
    const userId = auth.currentUser;
    // let today = new Date();
    // let now = today.toLocaleString();

    edit['updated_by_id'] = userId?.uid ? userId.uid : "Customer-Payment";
    edit['updated_by_email'] = userId?.email ? userId.email : "Customer-Payment";
    edit['updated_by_name'] = userId?.displayName ? userId.displayName : "Customer-Payment";
    edit['updated_date'] = serverTimestamp();

    const newColor = edit?.color;
    const oldColor = lastData?.value ? lastData?.value : "";

    const batch = writeBatch(db);
    const reservationsCollectionRef = collection(db, server + "_reservations");

    const querySnapshot = await getDocs(reservationsCollectionRef);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const shuttleMap = data.shuttle || {};

      // Verificar si el color en el documento coincide con el color que deseas actualizar
      if(oldColor){
        if (shuttleMap.value === oldColor) {

          //Actualizar campos específicos en el documento
          batch.update(doc.ref, {
            shuttle: {
              color: newColor,
              fixedRate: edit?.fixedRate,
              rate: edit?.rate,
              label: edit?.label,
              value: edit?.value
            },
          });
        }
      }
    });

    // Ejecutar la operación de escritura en lote
    batch.commit();

    // // Actualizar el documento original
    // updateDoc(docRef, edit);

  } catch (error) {
    console.error("Error editDataReservationsColor");
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "Problems with the connection to the database.",
      confirmButtonColor: '#173d38',
      confirmButtonText: "OK",
    });
  }
}

export const eventEditReservations = async (data) => {
  try {
    var id = uuid();
    const docRef = doc(db, server + "_events_edit_reservations", id);
    const userId = auth.currentUser;

    if (userId !== null) {
      await setDoc(docRef, data);
    }
  } catch (error) {
    console.error("Error eventEditReservations");
  }
}

export const deleteDataReservations = async (element) => {
    try {
        var element_duplicated = Object.assign({}, element);
        await addDataReservations(element_duplicated, false, false, true);

        const docRef = doc(db, server + "_reservations", element.id);
        await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleteDataReservations");
    }
}
