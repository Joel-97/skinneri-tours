import { useEffect, useState, useMemo, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { columnsClients, columns_excel } from '../../services/Tools';
import '../../style/table.css'
import Button from '../button';
import ModalC from '../modal';
import FormClient from './formClient';
import Swal from "sweetalert2";
import { addData, getData, deleteData, editData } from "../../services/crm/clients";
import { sendEmailMarketingService } from '../../services/Services';
import { UserAuth } from '../../context/AuthContext';
import { Input } from 'antd';
import { DateRangePicker } from "rsuite";
import { useNavigate } from 'react-router-dom';
import { ExcelExport } from "@progress/kendo-react-excel-export";

function TableClient() {
  const [pending, setPending] = useState(true);
  const [data, setData] = useState({ rows: [] });
  const [modal, setModal] = useState(false);
  const [selects, setSelects] = useState([]);
  const [edit, setEdit] = useState(null);
  const [titleModal, setTitleModal] = useState("");
  const [expand, setExpand] = useState(true);
  const [toggledClearRows, setToggleClearRows] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const { user } = UserAuth();
  const navigate = useNavigate();
  const _export = useRef(null);

  // Exportar datos a Excel
  const excelExport = () => {
    if (_export.current !== null) {
      _export.current.save(data.rows, columns_excel()); // `columns_excel` debe definirse en tu componente
    }
  };

  // Obtener datos al cargar el componente
  useEffect(() => {
    if (user != null) {
      if (data?.rows?.length < 1) {
        getData(setData, setPending);
      }
    }
  }, [user]);

  // Actualizar selección de filas
  const handleChange = ({ selectedRows }) => {
    setSelects(selectedRows);
  };

  // Agregar o editar datos
  const action = (formData) => {
    handleClearRows();
    formData["owner"] = formData["owner"] ? formData["owner"].value : "";

    if (edit) {
      editData(formData);
    } else {
      addData(formData, true);
    }

    setModal(false);
    setTimeout(() => {
      getData(setData, setPending);
    }, 500);
  };

  // Limpiar selección de filas
  const handleClearRows = () => {
    setToggleClearRows(!toggledClearRows);
    setSelects([]);
  };

  // Editar un cliente
  const editObj = (id) => {
    const obj = filteredItems.find((item) => item.id === id);
    setModal(true);
    setEdit(obj);
    setTitleModal("Edit Client");
  };

  // Eliminar un cliente
  const deleteObj = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#173d38',
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = filteredItems.find((item) => item.id === id);
        deleteData(obj);
        Swal.fire({
          title: 'Deleted!',
          text: 'Has been removed successfully.',
          icon: 'success',
          confirmButtonColor: '#173d38',
        })
        setTimeout(() => {
          setModal(false);
          getData(setData, setPending);
          handleClearRows();
        }, 1000);
      }
    });
  };

  // Mostrar detalles de un cliente
  const showClient = (id) => {
    navigate(`/clients/bookings/${id}`);
    window.location.reload(false);
  };

  // Filtrar elementos por texto
  useEffect(() => {
    setFilteredItems(
      data.rows.filter((item) =>
        ["id","client", "owner", "organisation", "email"].some((key) =>
          item[key]?.toLowerCase().includes(filterText.toLowerCase())
        )
      )
    );
  }, [filterText, data]);

  // Filtrar por rango de fechas
  const selectDate = (range) => {
    if (!range || range.length !== 2){
      setFilteredItems(data.rows);
      return;
    } 

    const [start, end] = range.map((date) => new Date(date).toISOString().split("T")[0]);

    const filteredByDate = data.rows.filter((item) => {
      const itemDate = new Date(item.date).toISOString().split("T")[0];
      return itemDate >= start && itemDate <= end;
    });

    setFilteredItems(filteredByDate);
  };

  // Subheader para el filtro de búsqueda
  const subHeaderComponentMemo = useMemo(() => {
    return (
      <>
        <h5 className="search-label">Search</h5>
        <Input onChange={(e) => setFilterText(e.target.value)} value={filterText} />
      </>
    );
  }, [filterText]);

  return (
    <div className="content">
    
    {/* <div className="d-flex justify-content-between align-items-center"> */}
    <div className="d-flex justify-content-between flex-row-reverse ">

      <div className='d-inline-flex'>
        <div className='btn-equal-size mx-1'>
          <Button className="btn-width-40px color-green btn btn-outline-secondary p-2 mx-2 w-100" onClick={() => {
            setExpand(!expand);
          }}>{expand ? "Expand" : "Compress"}</Button>
        </div>

        <div>
          {/* <Button className="color-green btn btn-outline-secondary p-2 mx-2" onClick={() => {
              if (selects.length === 1) {
                setModal(true);
                setEdit(selects[0]);
                setTitleModal('Edit Client');
                handleClearRows();
              } else {
                Swal.fire({
                  title: 'Warning!',
                  text: 'You must select a client to edit, (ONLY ONE)',
                  icon: 'warning',
                  confirmButtonColor: "#173d38",

              })
              }
            }} >Edit Selected</Button> */}
        </div>

        <div className='btn-equal-size mx-1'>
          <Button className="color-green btn btn-outline-secondary p-2 mx-2 w-100" onClick={() => {
            setModal(true);
            setTitleModal('Add Client');
            setEdit(null);
          }}>+Add Client</Button>
        </div>

        <div className='btn-equal-size mx-1'>
          <Button className="color-green btn btn-outline-secondary p-2 mx-2 w-100" onClick={() => {
            if (selects.length > 0) {
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
                  if (selects.length >= 1) {
                    selects.forEach(element => {
                      deleteData(element);
                    });
                    Swal.fire({
                      title: 'Deleted!',
                      text: 'Has been removed successfully.',
                      icon: 'success',
                      confirmButtonColor: '#173d38',
                    })
                    setTimeout(() => {
                      setModal(false);
                      getData(setData, setPending);
                      handleClearRows();
                    }, 1000)
                  }
                }
              })
            } else {
              Swal.fire({
                title: 'Warning!',
                text: 'You must select something to be able to delete',
                icon: 'warning',
                confirmButtonColor: "#173d38",
              })
            }
          }}>Delete Selected</Button>
        </div>


        {/* ENVIEO DE CORREO ELECTRONICO CON MARKETING DE VENTA PARA VARIOS EMAILS AL MISMO TIEMPO */}
        <div className='btn-equal-size mx-1'>
          <Button className="color-green btn btn-outline-secondary p-2 mx-2 w-100" onClick={() => {
            if (selects.length > 0) {
              Swal.fire({
                title: 'Are you sure?',
                text: "Are you really sure you want to send this email to all previously selected customers?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then((result) => {
                if (result.isConfirmed) {
                  if (selects.length >= 1) {
                    selects.forEach(element => {
                      //sendAutomatedEmailMarketing(element);
                      sendEmailMarketingService(element);
                    });
                    // Swal.fire({
                    //   title: 'Deleted!',
                    //   text: 'The marketing email has been sent successfully.',
                    //   icon: 'success',
                    //   confirmButtonColor: '#173d38',
                    // })
                    // setTimeout(() => {
                    //   setModal(false);
                    //   getData(setData, setPending);
                    //   handleClearRows();
                    // }, 1000)
                  }
                }
              })
            } else {
              Swal.fire({
                title: 'Warning!',
                text: 'You must select something to be able to delete',
                icon: 'warning',
                confirmButtonColor: "#173d38",
              })
            }
          }}>Send Email</Button>
        </div>

        <div className='btn-equal-size mx-1'>
          <ExcelExport ref={_export}>
            <Button className="color-green btn btn-outline-secondary p-2 mx-2 w-100" onClick={excelExport}>Export to Excel</Button>
          </ExcelExport>
        </div>
      </div>

      <div className='d-inline-flex'>
        <div className=" text-center">
            <h6>Range Date</h6>
            <DateRangePicker 
              placeholder="Today"
              onChange={selectDate}
            />
          </div>
      </div>

    </div>


      <div className="m-3">
        <DataTable
          columns={columnsClients(expand, editObj, deleteObj,showClient)}
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
          onHide={() => setModal(false)}>
          <FormClient title={titleModal} lastData={edit} textButton={titleModal} action={action} setModal={setModal}></FormClient>
        </ModalC>
      </div>
    </div>
  );
}

export default TableClient;
