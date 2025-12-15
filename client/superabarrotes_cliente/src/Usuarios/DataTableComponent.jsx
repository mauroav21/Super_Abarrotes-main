/**
 * DataTableComponent.jsx
 * * CORRECCIONES:
 * 1. Implementada la función `fetchData` con `useCallback` para recargar la tabla.
 * 2. Creadas `handleCloseModal` y `handleCloseDeleteModal` que llaman a `fetchData` si la operación es exitosa (shouldRefresh = true).
 * 3. Eliminado el renderizado de JSX incorrecto dentro de `handleModify` y `handleDelete`.
 * 4. El useEffect inicial ahora usa `fetchData`.
 */
import { useState, useEffect, useCallback } from 'react'; // << Añadido useCallback
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

  const customStyles = { /* ... (tus estilos) ... */
    headRow: {
      style: {
        backgroundColor: "#12274b",
        color: "white",
        fontSize: "170%",
        height: "200%",
      },
    },
  }

  // ----------------------------------------------------
  // 1. FUNCIÓN PARA CARGAR/RECARGAR DATOS
  // ----------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/data_usuarios');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------------------
  // 2. USE EFFECT PARA CARGA INICIAL
  // ----------------------------------------------------
  useEffect(() => {
    fetchData();
  }, [fetchData]); // <-- Recargar solo si fetchData cambia (nunca)


  // ----------------------------------------------------
  // 3. MANEJO DE CIERRE DE MODALES (CON RECARGA CONDICIONAL)
  // ----------------------------------------------------

  // Función de cierre para el Modal de MODIFICACIÓN
  const handleCloseModal = (shouldRefresh = false) => {
    setOpenModal(false);
    setSelectedUsuario(null);
    if (shouldRefresh) {
      fetchData();
    }
  };
    
  // Función de cierre para el Modal de ELIMINACIÓN
  const handleCloseDeleteModal = (shouldRefresh = false) => {
    setOpenModalDelete(false);
    setSelectedUsuario(null);
    if (shouldRefresh) {
      fetchData();
    }
  };


  // ----------------------------------------------------
  // 4. HANDLERS DE ACCIONES (SIN RENDERIZADO INCORRECTO)
  // ----------------------------------------------------

  // Eliminar
  const handleDelete = (codigo) => {
    setSelectedUsuario(codigo);
    setOpenModalDelete(true);
    // ELIMINADO: {openModal && <EliminarModal ... />}
  };

  // Modificar
  const handleModify = (usuario) => {
    setSelectedUsuario(usuario);
    setOpenModal(true);
    // ELIMINADO: {openModal && <ModificacionUsuariosModal ... />}
  };
  
  // ... (togglePassword)
  const togglePassword = (usuario) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [usuario]: !prev[usuario],
    }));
  };

  // ----------------------------------------------------
  // 5. DEFINICIÓN DE COLUMNAS
  // ----------------------------------------------------
  const columns = [
    { name: 'Usuario', selector: (row) => row.usuario, sortable: true },
    { name: 'Nombre', selector: (row) => `${row.nombre}  ${row.apellido_paterno} ${row.apellido_materno}`, sortable: true },
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
          <img src={visiblePasswords[row.usuario] ? hideIcon : showIcon} alt="Toggle Password" onClick={() => togglePassword(row.usuario)}
          style={{ marginBottom: '6%', marginRight: '3%', cursor: 'pointer'}}
          />
          <img src={delIcon} alt="Delete" onClick={() => handleDelete(row.usuario)} style={{ cursor: 'pointer' }}/>
          <img src={modIcon} alt="Modify" onClick={() => handleModify(row.usuario) }
          style={{ width: '30%', height: '40%', marginBottom: '10%', marginLeft: '8%', cursor: 'pointer'}} />        
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // ----------------------------------------------------
  // 6. RENDERIZADO PRINCIPAL
  // ----------------------------------------------------
  return (
    <>
    <DataTable
      columns={columns}
      data={data} 
      noDataComponent="No hay usuarios"
      defaultSortFieldId={1}
      responsive
      aginationPerPage={5}
      fixedHeader
      fixedHeaderScrollHeight="50%"
      customStyles={customStyles}
    />

    {openModal && <ModificacionUsuariosModal 
      closeModal={handleCloseModal} // << Pasa la función con lógica de recarga
      usuario={selectedUsuario}
    />}
    
    {openModalDelete && <EliminarModal 
      closeModal={handleCloseDeleteModal} // << Pasa la función con lógica de recarga
      usuario={selectedUsuario} // << Usamos 'usuario' para consistencia con selectedUsuario
    />}

    </>
  );
}

export default DataTableComponent;