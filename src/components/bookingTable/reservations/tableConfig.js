import { useEffect, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { columnsReservations } from '../../../services/columnsList';
// import { columnsReservationsReports } from '../../../services/columnsList';
// import Form from 'react-bootstrap/Form';
import Button from '../../general/button'; 
import ModalC from '../../general/modal';
import FormConfig from './formConfig';
// import FormPayment from '../../invoice/formConfig';
// import FormUploadPDF from './formUploadPDF';
// import FormTransportReport from '../../../components/report/transportReport/formConfig';
import Swal from "sweetalert2";
import {  getDataReservations, getReservationById, addDataReservations, editDataReservations, deleteDataReservations } from '../../../services/ConfigReservations';
import { getDataOneUser } from '../../../services/auth/users';
// import { fileHandler } from '../../../services/ConfigReservations';
import { UserAuth } from '../../../context/AuthContext';
import { Input } from 'antd';
import '../../../style/table.css';
// import ExportPDF from '../../../services/exports/exportPDF';
// import ExportCSV from '../../../services/exports/exportCSV';
// import { transformedData } from '../../../services/exports/transformedData';
import { useNavigate } from 'react-router-dom';
import generateInvoicePDF from '../../../services/exports/generateInvoicePDF';
// import PreviewModalPDF from '../../../services/exports/previewModalPDF';
import { getData } from "../../../services/crm/clients";
// import { addDataPayments, deleteTemporaryReservationData, getTemporaryReservationData, storeTemporaryReservationData } from '../../../services/payment';
// import { addDataVehicleOccupation, editDataVehicleOccupation } from '../../../services/shuttleSettings/vehicleOccupation';
import Loading from '../../../components/general/loading';
// import { createCheckoutSession } from '../../payments/paymentForm';
import { roleVisit, roleSuperAdmin } from '../../../services/Tools';
// import { sendVerificationEmail } from '../../../services/Services';
// import axios from 'axios';

function TableConfig({ clients, tap }) {

  const [pending, setPending] = useState(true);
  const [data, setData] = useState({ rows: [] });
  const [modal, setModal] = useState(false);
  const [modalPayment, setModalPayment] = useState(false); 
  const [modalUploadPDF, setModalUploadPDF] = useState(false); 
  const [selects, setSelects] = useState([]);
  const [edit, setEdit] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [paymentEdit, setPaymentEdit] = useState(null);
  const [uploadPDF, setUploadPDF] = useState(null);
  const [dataInvoiceList, setDataInvoiceList] = useState({ rows: [] });
  const [dataInvoice, setDataInvoice] = useState({ rows: [] });
  const [titleModal, setTitleModal] = useState('');
  const [titleModalPayment, setTitleModalPayment] = useState('');
  const [titleModalUploadPDF, setTitleModalUploadPDF] = useState('');
  const [expand, setExpand] = useState(true);
  const [toggledClearRows, setToggleClearRows] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [allBookings, setAllBookings ] = useState(tap ? false : true);
  const [userInfo, setUserInfo ] = useState('');
  const [showDataId, setShowDataId ] = useState(false);

  //Show preview PDF
  const [showModal, setShowModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);

  const [clientListAux, setClientListAux] = useState({ rows: [] });
  const [clientList, setClientList] = useState([{ value: '', label: '', email: '', phone: '', organization: '' }]);

  const { user } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user != null) {

      // const fetchData = async () => {
      //   const urlParams = new URLSearchParams(window.location.search);
      //   const token = urlParams.get('token');
      
      //   if (token) {
      //     let temp = await getTemporaryReservationData(token);

      //     if (!temp) {
      //       showAll();
      //       return;
      //     }

      //     await editDataReservations(temp?.aux, false);
      //     await addDataPayments(temp?.newData, true);

      //     setTimeout(() => {
      //       showAll();
      //       deleteTemporaryReservationData(token);
      //       const url = new URL(window.location);
      //       url.searchParams.delete('token');
      //       window.history.pushState({}, '', url);
      //     }, 500);    
      //   }else{
      //     showAll();
      //     return;
      //   }
      // }
      // fetchData();

      const getUserData = async () => {
        const userDocSnap = await getDataOneUser(user.uid);
        if(userDocSnap?.length > 0){
          // if(userDocSnap[0?.role !== roleVisit]){
            setUserInfo(userDocSnap[0]);
          // }
          // else{
          //   localStorage.setItem('errorMessage', 'We are sorry but you do not have access to these system functions.');
          //   window.location.href = '/';
          // }
        }
      };
  
      getUserData();

    }
  }, [user]);

  //Use by client List
  useEffect(() => {
    if (clientListAux?.rows?.length > 0) {
        var aux = [];
        clientListAux?.rows?.forEach(element => {
            let orga = element.organisation;
            if(orga){
                aux.push({ value: element.id, label: element.client, email: element.email, phone: element.phone, organization: orga });
            }else{
                aux.push({ value: element.id, label: element.client, email: element.email, phone: element.phone, organization : "-" });
            }
        });
        setClientList(aux);
    }
  }, [clientListAux]);

  const handleChange = ({ selectedRows }) => {
    setSelects(selectedRows);
  };

  const action = async (data, lastData) => {
    handleClearRows(); 
    
    if (edit) {
      editDataReservations(data, true, lastData);
      setEdit(null);
    } else if (duplicate) {
      addDataReservations(data, false, true);
      setDuplicate(null);
    }else {
      addDataReservations(data, true);
    }

    setFilterText('');
    setPending(true);
    setModal(false);
    setTimeout(() => {   
      getDataReservations(setData, setPending, !allBookings);
    }, 500);
  }

  const actionPay = async (newData, copy_link = false) => {
    handleClearRows();
    let aux = null;

    filteredItems.forEach(element => {
      if (element.id === newData?.idReservation) {
        aux = element;
      }
    });


    aux['paid'] = newData?.paid ? newData?.paid : false;
    aux['refund'] =  newData?.refund ?  newData?.refund : false;
    aux['revert'] =  newData?.revert ?  newData?.revert : false;
    aux['balance'] = parseFloat(newData?.balance ? newData?.balance : 0);
    aux['tipAmount'] = parseFloat(newData?.tipAmount ? newData?.tipAmount : 0);
    aux['amountPaid'] = parseFloat(newData?.amountPaid ? newData?.amountPaid : 0);
    aux['refundAmount'] = parseFloat(newData?.refundAmount ? newData?.refundAmount : 0);
    aux['revertAmount'] = parseFloat(newData?.revertAmount ? newData?.revertAmount : 0);
    aux['tipAmountPaid'] = parseFloat(newData?.tipAmountPaid ? newData?.tipAmountPaid : 0);
    aux['tipAmountTotalPaid'] = parseFloat(newData?.tipAmountTotalPaid ? newData?.tipAmountTotalPaid : 0);
    aux['invoicedVia'] = { value: newData?.paymentType?.value, label: newData?.paymentType?.label };
    newData['client'] = aux?.client;


    // if(newData?.paymentType?.label === "Stripe"){
    //   if (paymentEdit) {
    //     let temp = {
    //       aux: aux,
    //       newData: newData
    //     }
    //     let id = await storeTemporaryReservationData(temp);
    //     createCheckoutSession(newData?.newAmountPaid, newData["service"], id, copy_link);
    //   }
    // }else{
    //   editDataReservations(aux, false);
    //   addDataPayments(newData, true);
    //   setModalPayment(false);
    // }
    
    // Generar y descargar el PDF de la factura
    //generateInvoicePDF(invoiceData);
  }

  const handleClearRows = () => {
    setToggleClearRows(!toggledClearRows);
    setSelects([]);
  }

  const editObj = async (id) => {
    try {
      // Llamar a getReservationById y esperar a que se resuelva la promesa
      const aux = await getReservationById(id);
      
      // Verifica que si haya devuelto algo, sino muestra mensaje de error.
      if (aux[0]) {
        setModal(true);
        setEdit(aux[0]);
        setTitleModal('Edit reservation');
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Error editing, please try again later",
          confirmButtonColor: '#173d38',
          confirmButtonText: "OK",
        });
      }

    } catch (error) {
      console.error("Error editing reservation, getReservationById Reservations");
    }
  }

  const deleteObj = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#173d38',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        let aux = null;
        filteredItems.forEach(element => {
          if (element.id === id) {
            aux = element;
          }
        });
        deleteDataReservations(aux);
        Swal.fire({
          title: 'Deleted!',
          text: 'Has been removed successfully.',
          icon: 'success',
          confirmButtonColor: '#173d38',
        })
        setTimeout(() => {
          setModal(false);
          getDataReservations(setData, setPending, !allBookings);
          handleClearRows();
        }, 1000)
      }
    })
  }

  const paymentObj = (id) => { 
    let aux = null;

    filteredItems.forEach(element => {
      if (element.id === id) {
        aux = element;
      }
    });

    setModalPayment(true);
    setPaymentEdit(aux);
    setTitleModalPayment('Transport Payment');
  }

  const uploadPDFObj = (id) => {
    let aux = null;

    filteredItems.forEach(element => {
      if (element.id === id) {
        aux = element;
      }
    });

    setModalUploadPDF(true);
    setUploadPDF(aux);
    setTitleModalUploadPDF('Upload document');
  }

  //const previewPay = async (newData) => {
  const generateInvoice = async (id) => {
    let aux = null;
    let auxClient = null;

    filteredItems.forEach(element => {
      if (element.id === id) {
        aux = element;
      }
    });

    if(!aux?.newClient){
      clientListAux?.rows?.forEach(element => {
        if (element.id === aux?.client?.value) {
          auxClient = element;
        }
      });
    }else{
      auxClient = aux?.newClientData;
    }

    generateInvoicePDF(aux, auxClient);

  }

  let filteredItems;

  if(data.rows.length > 0){

    filteredItems = data.rows.filter(
      item => item?.client?.label && item?.client?.label?.toLowerCase().includes(filterText.toLowerCase()) ||
      item?.newClientData && item?.newClientData?.toLowerCase().includes(filterText.toLowerCase()) ||
      item?.shuttle?.label && item?.shuttle?.label?.toLowerCase().includes(filterText.toLowerCase()) ||
      item?.pickUp?.label && item?.pickUp?.label?.toLowerCase().includes(filterText.toLowerCase()) ||
      item?.id && item?.id?.toLowerCase().includes(filterText.toLowerCase())
    );


    if (tap && tap.length > 0 && !showDataId) {  
      editObj(tap);
      setShowDataId(true);
      setFilterText(tap.length > 1 ? tap?.slice(0, 8) : '');
      // La URL actual completa
      const currentUrl = window.location.href;

      // Genera la URL "limpia" que deseas mostrar en la barra de direcciones
      const cleanUrl = currentUrl.replace(/(\/booking\/).*/, '$1');

      // Actualiza la URL en el navegador sin recargar la página
      window.history.replaceState(null, '', cleanUrl);
    }
  }

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <>
        <h5 className='search-label'>Search</h5>
        <Input onChange={e => setFilterText(e.target.value)} value={filterText} filtertext={filterText} />
      </>
    );
  }, [filterText, resetPaginationToggle]);

  const showAll = () => {
    setPending(true);
    if(!allBookings){
      getDataReservations(setData, setPending,false);
      setAllBookings(true);
    }else{
      getDataReservations(setData, setPending,true);
      setAllBookings(false);
    }
    setFilterText('');
    setDuplicate(null);
    setSelects([]);

    if(clients?.rows?.length > 0){
      setClientListAux(clients);
    }else{
      getData(setClientListAux);
    }
  }

  return (
    <>
    { pending ? (
      <>
      <div style={{textAlign:"center"}}>
        <Loading></Loading>
      </div>
      </>
      ) 
      : (
        <>
          <div>
            <h3 style={{textAlign:"center"}}> { allBookings ? ("All transports") : ("Today's transports")}</h3> 
          </div>
          <div className="content">
            <div className="d-flex justify-content-between flex-row-reverse ">
              <div className="gap-2 m-1">
                {/* <ExportPDF data={transformedData(filteredItems, columnsReservationsReports())} headers={transformedData(filteredItems, columnsReservationsReports(), true)} filename={"report"}></ExportPDF>
                <ExportCSV data={transformedData(filteredItems, columnsReservations(expand, editObj, deleteObj, paymentObj))} headers={transformedData(filteredItems, columnsReservations(expand, editObj, deleteObj, paymentObj), true)} filename={"report"}></ExportCSV> */}
                <Button className="color-green btn btn-outline-secondary p-2 mx-2" onClick={() => {
                  setExpand(!expand);
                }} >{expand ? "Expand" : "Compress"}</Button>
                
                <Button className="color-green btn btn-outline-secondary p-2 mx-2" onClick={() => { showAll()
                  }} > { allBookings ? ( "Show today") : ("Show all") }</Button>

                { userInfo?.role !== roleVisit ? (
                  <>
                  { selects?.length > 0 ? (
                    <Button className="color-green btn btn-outline-secondary p-2 mx-2" onClick={() => {
                      if (selects.length === 1) {
                        setModal(true);
                        setDuplicate(selects[0]);
                        setTitleModal('Duplicate booking');
                        handleClearRows();
                      } else {
                        Swal.fire({
                          title: 'Warning!',
                          text: 'You must select a booking to duplicate, (ONLY ONE)',
                          icon: 'warning',
                          confirmButtonColor: "#173d38",
                      })
                      }
                    }}> Duplicate Selected</Button>
                  ) : ("") }

                  <Button className="color-green btn btn-outline-secondary p-2 mx-2" onClick={() => {
                    setModal(true);
                    setTitleModal('Add new reservation');
                    setEdit(null);
                  }} >+Add reservation</Button>
                  </>
                ) : ("")}

              </div>
              {/* <div>
                <Form.Group controlId="formFile" className="mt-5 p-2">
                  <Form.Control type="file" onChange={
                    (e) => {
                      fileHandler(e, setData);
                    }
                  } />
                </Form.Group>
              </div> */}
            </div>
            
              <div className="m-3">
                <DataTable
                  columns={columnsReservations(expand, editObj, deleteObj, paymentObj, generateInvoice, userInfo, uploadPDFObj)}
                  data={filteredItems}
                  selectableRows
                  onSelectedRowsChange={handleChange}
                  pagination
                  clearSelectedRows={toggledClearRows}
                  defaultSortFieldId={9}
                  defaultSortAsc={false}
                  progressPending={pending}
                  paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
                  subHeader
                  subHeaderComponent={subHeaderComponentMemo}
                />
                <ModalC
                  show={modal}
                  onHide={() => { setModal(false); setEdit(null); setDuplicate(null);}}
                  changeSize={true}> 
                  <FormConfig title={titleModal} lastData={edit ? edit : duplicate} textButton={titleModal} setDuplicate={setDuplicate} action={action} setModal={setModal} clients={clientListAux}></FormConfig>
                </ModalC>

                {/* <ModalC
                  show={modalPayment}
                  onHide={() => setModalPayment(false)}>
                  <FormPayment title={titleModalPayment} data={paymentEdit} textButton={titleModalPayment} actionPay={actionPay} setModalPayment={setModalPayment}></FormPayment>
                </ModalC> */}

                {/* <ModalC
                  show={modalUploadPDF}
                  onHide={() => setModalUploadPDF(false)}>
                  <FormUploadPDF title={titleModalUploadPDF} data={uploadPDF} textButton={titleModalUploadPDF} uploadPDFObj={uploadPDFObj} setModalUploadPDF={setModalUploadPDF}></FormUploadPDF>
                </ModalC> */}

                {/* <PreviewModalPDF show={showModal} onHide={() => setShowModal(false)} pdfData={pdfData} /> */}
            

              </div>
          </div>
        </>
      )}
     
    </>
  );
}

export default TableConfig;
