import DataTable from 'react-data-table-component';
import PropTypes from 'prop-types';
import papelera from '../assets/pventa/papelera.png';

function DataTableComponent({ productos }) {
  const columns = [
    { name: 'Producto', selector: row => row.nombre },
    { name: 'Cantidad', selector: row => row.cantidad },
    { name: 'Precio', selector: row => row.precio },
    { name: 'Subtotal', selector: row => row.precio * row.cantidad },
    {
      name: '',
      cell: row => (
        <img
          src={papelera}
          alt="Delete"
          onClick={() => {
            if (typeof row.onRemove === 'function') row.onRemove(row.codigo);
          }}
          style={{ width: '20px', cursor: 'pointer' }}
        />
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: { backgroundColor: '#12274b', color: 'white', fontSize: '170%', height: '200%' },
    },
  };

  return (
    <DataTable
      columns={columns}
      data={productos}
      noDataComponent="Producto no disponible"
      responsive
      fixedHeader
      fixedHeaderScrollHeight="50%"
      customStyles={customStyles}
    />
  );
}

DataTableComponent.propTypes = {
  productos: PropTypes.array.isRequired,
};

export default DataTableComponent;
