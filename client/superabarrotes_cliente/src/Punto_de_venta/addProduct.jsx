import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import axios from 'axios';
import toast from 'react-hot-toast';

function AddProduct({ onProductSelect }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectInputRef = useRef();

  useEffect(() => {
    async function fetchAllRecords() {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8081/dataPventa');

        const formattedOptions = response.data
          .filter(item => item.cantidad > 0) // Solo productos con existencia
          .map(item => ({
            value: item.codigo,
            label: `${item.nombre} - ${item.codigo}`,
            inventario: item.cantidad,
            precio: item.precio,
            nombre: item.nombre
          }));

        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllRecords();
  }, []);

  const handleAddProduct = () => {
    if (!selectedOption) return;

    if (cantidad < 1 || cantidad > selectedOption.inventario) {
      toast.error(`Cantidad inválida. Solo hay ${selectedOption.inventario} disponibles.`);
      return;
    }

    if (onProductSelect) {
      onProductSelect({ ...selectedOption, cantidad });
      setSelectedOption(null);
      setCantidad(1);
    }
  };

  const handleSelectChange = (option) => {
    setSelectedOption(option);
    setCantidad(1);
  };

  return (
    <div>
      <Select
        className="basic-single"
        classNamePrefix="select"
        isLoading={isLoading}
        isClearable
        isSearchable
        onChange={handleSelectChange}
        name="producto"
        value={selectedOption}
        options={options}
        placeholder="Nombre o código del producto"
        styles={{
          container: (base) => ({ ...base, width: 350 }),
          control: (base) => ({ ...base, backgroundColor: 'white' }),
          menu: (base) => ({ ...base, backgroundColor: 'white', zIndex: 100 }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#12274b' : 'white',
            color: state.isFocused ? 'white' : 'black',
            fontWeight: state.isSelected ? 'bold' : 'normal',
          }),
          singleValue: (base) => ({ ...base, color: '#CD1C18', fontWeight: 'bold' }),
        }}
      />

      {selectedOption && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <input
            type="number"
            min={1}
            max={selectedOption.inventario}
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value, 10))}
            style={{ width: '60px', marginRight: '10px' }}
          />
          <button onClick={handleAddProduct}>Agregar</button>
        </div>
      )}
    </div>
  );
}

AddProduct.propTypes = {
  onProductSelect: PropTypes.func,
};

export default AddProduct;
