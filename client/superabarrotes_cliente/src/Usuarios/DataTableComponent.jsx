/**
 * DataTableComponent.jsx
 *
 * Propósito:
 *  - Mostrar la lista de usuarios en una tabla (react-data-table-component).
 *  - Permitir mostrar/ocultar la contraseña en texto plano, abrir modal de modificación y abrir modal de eliminación.
 * 
 * Importaciones principales:
 *  - useState, useEffect (React)
 *  - DataTable (react-data-table-component)
 *  - axios para llamadas al backend
 *  - íconos (delIcon, modIcon, showIcon, hideIcon)
 *  - ModificacionUsuariosModal y EliminarModal
 *
 * Estado:
 *  - visiblePasswords: objeto { usuario: boolean } para controlar visibilidad de contraseñas por fila.
 *  - data: array con usuarios (respuesta de backend).
 *  - loading / error: control de carga y errores.
 *  - openModal / openModalDelete: booleans para mostrar los modales.
 *  - selectedUsuario: string con el usuario seleccionado para editar/eliminar.
 *
 * Efectos y llamadas:
 *  - useEffect carga los usuarios desde GET http://localhost:8081/data_usuarios al montar.
 *
 * Columnas y comportamientos:
 *  - Usuario, Nombre (nombre + apellidos), Rol.
 *  - Contraseña: muestra row.texto_plano si visiblePasswords[row.usuario] es true; de lo contrario muestra '********'.
 *  - Acciones: iconos para alternar visibilidad de contraseña, eliminar y modificar.
 *
 * Handlers clave:
 *  - togglePassword(usuario): alterna visiblePasswords[usuario].
 *  - handleDelete(codigo): setea selectedUsuario y abre el modal de eliminación.
 *  - handleModify(usuario): setea selectedUsuario y abre el modal de modificación.
 *
 *
 * Flujo de render:
 *  - Si loading -> muestra "Loading..."
 *  - Si error -> muestra mensaje de error
 *  - Renderiza DataTable con columnas y datos
 *  - Renderiza condicionalmente ModificacionUsuariosModal y EliminarModal pasando selectedUsuario y funciones para cerrar (setOpenModal / setOpenModalDelete)
 * Nota:
 * Todavia non jala julia por favor revisa los comentarios
 */
import  { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import delIcon from '../assets/inventario/-.svg'
import modIcon from '../assets/inventario/modIcon.svg'
import showIcon from '../assets/usuarios/mostrar.svg'
import hideIcon from '../assets/usuarios/esconder.svg'
import ModificacionUsuariosModal from './ModificacionUsuariosModal';
import EliminarModal from './EliminarModal.jsx';

function DataTableComponent() {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#12274b",
        color: "white",
        fontSize: "170%",
        height: "200%",
      },
    },
  }


  const handleDelete = async (codigo) => {
    setSelectedUsuario(codigo);
    setOpenModalDelete(true);
    {openModal && <EliminarModal closeModal={setOpenModal} codigo={selectedUsuario}/>}
  };


  //Modificar
  const handleModify = async (usuario) => {
    setSelectedUsuario(usuario);
    setOpenModal(true);
    {openModal && <ModificacionUsuariosModal closeModal={setOpenModal} usuario={selectedUsuario}/>}
  };


  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:8081/data_usuarios');
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const togglePassword = (usuario) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [usuario]: !prev[usuario],
    }));
  };


  const columns = [
    { name: 'Usuario', selector: (row) => row.usuario, sortable: true },
    { name: 'Nombre', selector: (row) => `${row.nombre}  ${row.apellido_paterno} ${row.apellido_materno}`, sortable: true },
    { name: 'Rol', selector: (row) => row.rol, sortable: true },
    // eslint-disable-next-line no-unused-vars
    {
      name: 'Contraseña',
      selector: (row) => (
        <div>
          {visiblePasswords[row.usuario] ? row.texto_plano : '********'}
        </div>
      ),
    },
    {
      name: '',
      cell: (row) => (
        <div> 
          <img src={visiblePasswords[row.usuario] ? hideIcon : showIcon} alt="Delete" onClick={() => togglePassword(row.usuario)}
          style={{ marginBottom: '6%', marginRight: '3%'}}
          />
          <img src={delIcon} alt="Delete" onClick={() => handleDelete(row.usuario)} />
          <img src={modIcon} onClick={() => handleModify(row.usuario) }
          style={{ width: '30%', height: '40%', marginBottom: '10%', marginLeft: '8%'}} />        
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
    <DataTable
      columns={columns}
      data={data} 
      noDataComponent="No hay usuarios"
      defaultSortFieldId={1}
      //pagination
      responsive
      aginationPerPage={5}
      fixedHeader
      fixedHeaderScrollHeight="50%"
      customStyles={customStyles}
      //paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
    />

    {openModal && <ModificacionUsuariosModal closeModal={() => setOpenModal(false)} usuario={selectedUsuario}/>}
    {openModalDelete && <EliminarModal closeModal={() => setOpenModalDelete(false)} usuario={selectedUsuario}/>}

    </>
  );
  
}

export default DataTableComponent;