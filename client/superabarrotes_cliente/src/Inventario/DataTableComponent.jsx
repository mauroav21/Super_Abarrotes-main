import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import delIcon from '../assets/inventario/-.svg'
import PropTypes from 'prop-types';
import modIcon from '../assets/inventario/modIcon.svg'
import ModificacionProductosModal from './ModificacionProductosModal';
import EliminarModal from './EliminarModal';

function DataTableComponent({searchTerm}) {
  const[filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState(null);
  
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#12274B",
        color: "white",
        fontSize: "170%",
        height: "200%",
      },
    },
  }

  // 🛑 NUEVA FUNCIÓN: Lógica para obtener los datos. La haremos reusable.
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/data');
      const processedData = response.data.map((item) => ({
        ...item,
        cantidad: parseInt(item.cantidad, 10), 
        precio: parseFloat(item.precio), 
        cantidad_minima: parseInt(item.cantidad_minima, 10), 
      }));
      setData(processedData);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };
  
  // 🛑 FUNCIÓN DE CIERRE DE MODIFICACIÓN (Implementando la lógica de recarga)
  const handleCloseModifyModal = (shouldRefresh = false) => {
    setOpenModal(false);
    setSelectedCodigo(null);
    // Si el modal nos dice que la operación fue exitosa (true), recargamos.
    if (shouldRefresh) {
      fetchData();
    }
  };

  // 🛑 FUNCIÓN DE CIERRE DE ELIMINACIÓN (Implementando la lógica de recarga)
  const handleCloseDeleteModal = (shouldRefresh = false) => {
    setOpenModalDelete(false);
    setSelectedCodigo(null);
    // Si la eliminación fue exitosa (true), recargamos.
    if (shouldRefresh) {
      fetchData();
    }
  };


  const handleDelete = (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModalDelete(true);
    // Se elimina la línea JSX redundante aquí: {openModal && <EliminarModal closeModal={setOpenModal} codigo={selectedCodigo}/>}
  };

  const handleModify = (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModal(true);
    // Se elimina la línea JSX redundante aquí: {openModal && <ModificacionProductosModal closeModal={setOpenModal} codigo={selectedCodigo}/>}
  };

  // 🛑 CAMBIO: El useEffect inicial ahora usa la función reusable 'fetchData'.
  useEffect(() => {
    fetchData();
  }, []); // Mantenemos el array de dependencias vacío para la carga inicial

  // ... El useEffect para el filtro se mantiene igual ya que depende de 'data' y 'searchTerm'
  useEffect(() => {
    if (searchTerm) {
      setFilteredData(
        data.filter((item) => {
          const nombre = String(item.nombre || "").toLowerCase();
          const codigo = String(item.codigo || "");
          const term = searchTerm.toLowerCase();

          return (
            nombre.includes(term) || codigo.includes(term)
          );
        })
      );
    } else {
      setFilteredData(data);
    }
  }, [data, searchTerm]);


  const columns = [
    { name: 'Producto', selector: (row) => row.nombre, sortable: true },
    { name: 'Cantidad', selector: (row) => row.cantidad, sortable: true },
    { name: 'Código', selector: (row) => row.codigo, sortable:true},
    { name: 'Precio', selector: (row) => row.precio, sortable: true },
    { name: 'Cantidad Mínima', selector: (row) => row.cantidad_minima, sortable: true},
    {
      name: '',
      cell: (row) => (
        <div> 
          <img src={delIcon} alt="Delete" onClick={() => handleDelete(row.codigo)} />
          <img src={modIcon} onClick={() => handleModify(row.codigo)}
          style={{ width: '50%', height: '40%', marginBottom: '10%', marginLeft: '12%'}} />        
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
      data={filteredData && filteredData.length >= 0 ? filteredData : data} 
      noDataComponent="Producto no disponible"
      defaultSortFieldId={1}
      //pagination
      responsive
      aginationPerPage={5}
      fixedHeader
      fixedHeaderScrollHeight="50%"
      customStyles={customStyles}
      //paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
    />

    {/* 🛑 CAMBIO CRÍTICO DE PROPS: Usar las nuevas funciones de cierre */}
    {openModal && <ModificacionProductosModal closeModal={handleCloseModifyModal} codigo={selectedCodigo}/>}
    {openModalDelete && <EliminarModal closeModal={handleCloseDeleteModal} codigo={selectedCodigo}/>}

    </>
  );
  
}

DataTableComponent.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default DataTableComponent;