import './Modal.css';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function RegistrarCompraModal({ closeModal, productos }) {
  const [precioTotal, setPrecioTotal] = useState(0.0);
  const [productosCompra, setProductosCompra] = useState([]);

  useEffect(() => {
    if (productos) {
      // Inicializar cantidades y precios
      const inicializados = productos.map(p => ({
        ...p,
        precioCompra: p.precio || 0,
        cantidad: p.cantidad || 1
      }));
      setProductosCompra(inicializados);
      calcularTotal(inicializados);
    }
  }, [productos]);

  const calcularTotal = (lista) => {
    const total = lista.reduce((sum, item) => sum + item.precioCompra * item.cantidad, 0);
    setPrecioTotal(total);
  };

  const handleChange = (index, field, value) => {
    const nuevosProductos = [...productosCompra];
    nuevosProductos[index][field] = Number(value);
    setProductosCompra(nuevosProductos);
    calcularTotal(nuevosProductos);
  };

  const registrarCompra = async () => {
    try {
      const res = await axios.post('http://localhost:8081/registrarCompra', { productos: productosCompra });
      if (res.data.Status === 'Exito') {
        toast.success('Compra registrada con éxito');
        closeModal(false);
      } else {
        toast.error(res.data.Error || 'Error al registrar la compra');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión con el servidor');
    }
  };

  return (
    <>
      <Toaster />
      <div className="modalBackground">
        <div className="modalContainer" style={{ backgroundImage: 'unset', maxHeight: '80%', maxWidth: '50%', marginTop: '3%', backgroundColor: 'white', color: 'black', overflowY: 'auto' }}>
          <div className="header">
            Registrar Compra
          </div>
          <div className="forms" style={{ alignItems: 'center', justifyContent: 'center' }}>
            {productosCompra.map((p, index) => (
              <div key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', width: '90%', marginLeft: '5%' }}>
                <span>{p.label}</span>
                <input
                  type="number"
                  min="1"
                  value={p.cantidad}
                  style={{ width: '60px', marginRight: '10px' }}
                  onChange={(e) => handleChange(index, 'cantidad', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  value={p.precioCompra}
                  style={{ width: '80px' }}
                  onChange={(e) => handleChange(index, 'precioCompra', e.target.value)}
                />
              </div>
            ))}
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '20px' }}>Total: ${precioTotal}</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
              <button className='button_delete' onClick={registrarCompra}>Registrar Compra</button>
              <button className='button_delete' onClick={() => closeModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

RegistrarCompraModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  productos: PropTypes.array.isRequired,
};

export default RegistrarCompraModal;
