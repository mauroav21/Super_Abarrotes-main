import { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import delIcon from '../assets/inventario/-.svg';
import modIcon from '../assets/inventario/modIcon.svg';
import ModificacionProveedoresModal from './ModificacionProveedoresModal';
import EliminarProveedorModal from "./EliminarModal";
import toast from 'react-hot-toast';

function DataTableProveedores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState(null);
  // Nuevo estado para forzar la recarga de datos
  const [refreshToggle, setRefreshToggle] = useState(0); 

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#12274b',
        color: 'white',
        fontSize: '120%',
      },
    },
  };

  // Función de carga de datos encapsulada
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/data_proveedores');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      toast.error("Error al cargar la lista de proveedores.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos de proveedores (se ejecuta en montaje y al cambiar refreshToggle)
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshToggle]); // Dependencia 'refreshToggle' dispara la recarga

  // Manejador de cierre de modales que verifica si debe recargar
  const handleCloseModal = (shouldRefresh = false) => {
    setOpenModal(false); 
    setOpenModalDelete(false); 
    setSelectedCodigo(null);

    if (shouldRefresh) {
      // Incrementa el toggle para disparar el useEffect y recargar
      setRefreshToggle(prev => prev + 1); 
    }
  };

  const handleDelete = (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModalDelete(true);
  };

  const handleModify = (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModal(true);
  };

  const columns = [
    { name: 'Código', selector: (row) => row.codigo, sortable: true },
    { name: 'Nombre', selector: (row) => row.nombre, sortable: true },
    { name: 'Teléfono', selector: (row) => row.telefono, sortable: true },
    { name: 'Correo', selector: (row) => row.correo, sortable: true },
    {
      name: 'Acciones',
      cell: (row) => (
        <div>
          <img
            src={delIcon}
            alt="Eliminar"
            onClick={() => handleDelete(row.codigo)}
            style={{ marginRight: '8%', cursor: 'pointer' }}
          />
          <img
            src={modIcon}
            alt="Modificar"
            onClick={() => handleModify(row.codigo)}
            style={{ width: '30%', height: '40%', cursor: 'pointer' }}
          />
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  if (loading) return <p>Cargando proveedores...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        noDataComponent="No hay proveedores registrados"
        defaultSortFieldId={1}
        responsive
        fixedHeader
        fixedHeaderScrollHeight="50%"
        customStyles={customStyles}
      />

      {openModal && (
        <ModificacionProveedoresModal
          closeModal={handleCloseModal} // Pasa la nueva función de manejo
          codigo={selectedCodigo}
        />
      )}

      {openModalDelete && (
        <EliminarProveedorModal
          closeModal={handleCloseModal} // Pasa la nueva función de manejo
          codigo={selectedCodigo}
        />
      )}
    </>
  );
}

export default DataTableProveedores;