import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import PropTypes from 'prop-types';

function DataTableComponent({ data, columns, searchTerm, noDataText = "No hay datos" }) {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (searchTerm && data) {
      setFilteredData(
        data.filter((item) =>
          Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredData(data);
    }
  }, [data, searchTerm]);

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#12274B",
        color: "white",
        fontSize: "120%",
        fontWeight: 'bold',
      },
    },
    rows: {
      style: {
        minHeight: '50px', // altura de fila
        fontSize: '95%',
      },
    },
    cells: {
      style: {
        paddingLeft: '10px',
        paddingRight: '10px',
      },
    },
  };

  return (
    <DataTable
      columns={columns}
      data={filteredData || []}
      noDataComponent={noDataText}
      responsive
      fixedHeader
      fixedHeaderScrollHeight="400px"
      customStyles={customStyles}
      highlightOnHover
      striped
      pagination
    />
  );
}

DataTableComponent.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  searchTerm: PropTypes.string,
  noDataText: PropTypes.string,
};

export default DataTableComponent;
