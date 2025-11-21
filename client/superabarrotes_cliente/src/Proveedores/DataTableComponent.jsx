/**
 * DataTableProveedores.jsx
 *
 * Propósito:
 *  - Mostrar la lista de proveedores en una tabla (react-data-table-component).
 *  - Permitir abrir los modales de modificación y eliminación.
 *
 * Estado:
 *  - data: lista de proveedores obtenida del backend.
 *  - loading / error: controlan el estado de carga y errores.
 *  - openModal / openModalDelete: muestran los modales de edición o eliminación.
 *  - selectedCodigo: código del proveedor seleccionado.
 *
 * Llamadas al backend:
 *  - GET http://localhost:8081/data_proveedores
 *
 * Columnas:
 *  - Código, Nombre, Teléfono, Correo
 *
 * Archivos relacionados:
 *  - ModificacionProveedoresModal.jsx
 *  - EliminarProveedorModal.jsx
 */

import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import delIcon from '../assets/inventario/-.svg';
import modIcon from '../assets/inventario/modIcon.svg';
import ModificacionProveedoresModal from './ModificacionProveedoresModal';
import EliminarProveedorModal from "./EliminarModal";


function DataTableProveedores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState(null);

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#12274b',
        color: 'white',
        fontSize: '120%',
      },
    },
  };

  // Cargar datos de proveedores
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:8081/data_proveedores');
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        //pagination
        responsive
        //paginationPerPage={5}
        fixedHeader
        fixedHeaderScrollHeight="50%"
        customStyles={customStyles}
        //paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
      />

      {openModal && (
        <ModificacionProveedoresModal
          closeModal={() => setOpenModal(false)}
          codigo={selectedCodigo}
        />
      )}

      {openModalDelete && (
        <EliminarProveedorModal
          closeModal={() => setOpenModalDelete(false)}
          codigo={selectedCodigo}
        />
      )}
    </>
  );
}

export default DataTableProveedores;
