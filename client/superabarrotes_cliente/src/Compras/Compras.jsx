// client/superabarrotes_cliente/src/Compras/Compras.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTableCompras from './DataTableCompras';
import './Compras.css';

const Compras = () => {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedProveedorCodigo, setSelectedProveedorCodigo] = useState('');
  const [selectedProductoCodigo, setSelectedProductoCodigo] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProveedores();
    fetchProductos();
  }, []);

  const fetchProveedores = async () => {
    try {
      const { data } = await axios.get('/api/proveedores');
      setProveedores(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar proveedores');
    }
  };

  const fetchProductos = async () => {
    try {
      const { data } = await axios.get('/api/productos');
      setProductos(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar productos');
    }
  };

  const agregarItem = () => {
    if (!selectedProveedorCodigo) {
      alert('Selecciona primero un proveedor.');
      return;
    }
    if (!selectedProductoCodigo) {
      alert('Selecciona un producto');
      return;
    }
    const prod = productos.find(p => String(p.codigo) === String(selectedProductoCodigo));
    if (!prod) {
      alert('Producto no encontrado');
      return;
    }
    const qty = parseInt(cantidad, 10);
    const pu = parseFloat(precioUnitario);
    if (!qty || qty <= 0) {
      alert('Cantidad inválida');
      return;
    }
    if (isNaN(pu) || pu <= 0) {
      alert('Precio unitario inválido');
      return;
    }
    const subtotal = parseFloat((qty * pu).toFixed(2));
    const newItem = {
      codigo: prod.codigo,
      nombre: prod.nombre,
      cantidad: qty,
      precio_unitario: pu,
      subtotal
    };
    setItems(prev => [...prev, newItem]);
    setSelectedProductoCodigo('');
    setCantidad(1);
    setPrecioUnitario('');
  };

  const total = items.reduce((acc, it) => acc + Number(it.subtotal), 0).toFixed(2);

  const eliminarItem = (index) => {
    const next = [...items];
    next.splice(index, 1);
    setItems(next);
  };

  const handleComprar = async () => {
    if (!selectedProveedorCodigo) {
      alert('Selecciona un proveedor');
      return;
    }
    if (items.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        codigo_proveedor: selectedProveedorCodigo,
        total: parseFloat(total),
        detalles: items.map(i => ({
          codigo: i.codigo,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          subtotal: i.subtotal
        }))
      };
      const { data } = await axios.post('/api/compras', payload);
      if (data && data.ok) {
        alert('Compra registrada correctamente (ID: ' + data.id_compra + ')');
        // reset
        setItems([]);
        setSelectedProveedorCodigo('');
      } else {
        alert('Error al registrar compra');
      }
    } catch (err) {
      console.error(err);
      alert('Error al registrar compra');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (!window.confirm('¿Cancelar la compra actual? Se perderán los artículos agregados.')) return;
    setItems([]);
    setSelectedProveedorCodigo('');
    setSelectedProductoCodigo('');
    setCantidad(1);
    setPrecioUnitario('');
  };

  const onChangeProveedor = (codigo) => {
    if (items.length > 0) {
      alert('No puedes cambiar de proveedor hasta completar o cancelar la compra');
      return;
    }
    setSelectedProveedorCodigo(codigo);
  };

  return (
    <div className="compras-container">
      <h2>Módulo de Compras</h2>

      <div className="compras-controls">
        <div className="field">
          <label>Proveedor</label>
          <select
            value={selectedProveedorCodigo}
            onChange={(e) => onChangeProveedor(e.target.value)}
            disabled={items.length > 0}
          >
            <option value="">-- Selecciona proveedor --</option>
            {proveedores.map(p => (
              <option key={p.codigo} value={p.codigo}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Producto</label>
          <select
            value={selectedProductoCodigo}
            onChange={(e) => setSelectedProductoCodigo(e.target.value)}
          >
            <option value="">-- Selecciona producto --</option>
            {productos.map(prod => (
              <option key={prod.codigo} value={prod.codigo}>
                {prod.codigo ? `${prod.codigo} - ${prod.nombre}` : prod.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="field small">
          <label>Cantidad</label>
          <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
        </div>

        <div className="field small">
          <label>Precio unitario</label>
          <input type="number" min="0.01" step="0.01" value={precioUnitario} onChange={e => setPrecioUnitario(e.target.value)} />
        </div>

        <div className="field action">
          <button type="button" onClick={agregarItem}>Agregar</button>
        </div>
      </div>

      <div className="table-wrapper">
        <DataTableCompras items={items} onEliminar={eliminarItem} />
      </div>

      <div className="footer-actions">
        <div className="total">
          <strong>Total:</strong> ${total}
        </div>
        <div className="buttons">
          <button className="btn cancel" onClick={handleCancelar} disabled={loading}>Cancelar</button>
          <button className="btn buy" onClick={handleComprar} disabled={loading || items.length === 0 || !selectedProveedorCodigo}>
            {loading ? 'Procesando...' : 'Comprar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compras;
