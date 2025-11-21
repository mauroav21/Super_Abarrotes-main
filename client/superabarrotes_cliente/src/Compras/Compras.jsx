// client/superabarrotes_cliente/src/Compras/Compras.jsx
import React, { useEffect, useState, createRef } from 'react';
import axios from 'axios';
import DataTableCompras from './DataTableCompras';
import './Compras.css';

/* ICONOS & ASSETS del menú */
import tienda_bg from '../assets/inventario/tienda_bg.svg';
import tienda from '../assets/inventario/tienda.svg';
import comercial from '../assets/inventario/SuperAbarrotes.svg';
import inventario_icon from '../assets/inventario/inventario_icon.svg';
import pventa from '../assets/inventario/pventa.svg';
import usuarios from '../assets/inventario/usuarios.svg';
import logoutIcon from '../assets/inventario/logout.svg';
import usericon from '../assets/inventario/user.svg';
import logo_pventa from '../assets/compras/compras.svg';

import { Link } from 'react-router-dom';
import GetUser from '../GetUser';
import Logout from '../Logout';

const Compras = () => {

  // --- ESTADO ORIGINAL (NO SE TOCA) ---
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedProveedorCodigo, setSelectedProveedorCodigo] = useState('');
  const [selectedProductoCodigo, setSelectedProductoCodigo] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- REFERENCIAS PARA EL SIDENAV ---
  const sidenav = createRef();
  const storeButton = createRef();
  const ui = createRef();
  const sidenavmenu = createRef();

  const openNavbar = () => {
    if (sidenav.current && storeButton.current && ui.current) {
      sidenav.current.style.width = '300px';
      sidenav.current.style.background = `url(${tienda_bg}), #12274B`;
      sidenav.current.style.backgroundSize = '350%';
      storeButton.current.style.marginLeft = '28%';
      ui.current.onclick = closeNavbar;
      setTimeout(() => {
        sidenavmenu.current.style.display = 'flex';
      }, 250);
      ui.current.style.opacity = '.5';
    }
  };

  const closeNavbar = () => {
    if (sidenav.current && storeButton.current && ui.current) {
      sidenav.current.style.width = '60%';
      sidenav.current.style.background = '#12274B';
      storeButton.current.style.marginLeft = '10%';
      ui.current.onclick = null;
      sidenavmenu.current.style.display = 'none';
      ui.current.style.opacity = '1';
    }
  };

  // --- PETICIONES ORIGINALES ---
  useEffect(() => {
    fetchProveedores();
    fetchProductos();
  }, []);

  const fetchProveedores = async () => {
    try {
      const { data } = await axios.get('/api/proveedores');
      if (Array.isArray(data)) setProveedores(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar proveedores');
    }
  };

  const fetchProductos = async () => {
    try {
      const { data } = await axios.get('/api/productos');
      if (Array.isArray(data)) setProductos(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar productos');
    }
  };

  const agregarItem = () => {
    if (!selectedProveedorCodigo) return alert('Selecciona un proveedor');
    if (!selectedProductoCodigo) return alert('Selecciona un producto');

    const prod = productos.find(p => String(p.codigo) === String(selectedProductoCodigo));
    if (!prod) return alert('Producto no encontrado');

    const qty = parseInt(cantidad);
    const pu = parseFloat(precioUnitario);

    if (!qty || qty <= 0) return alert('Cantidad inválida');
    if (!pu || pu <= 0) return alert('Precio inválido');

    const subtotal = parseFloat((qty * pu).toFixed(2));

    setItems(prev => [
      ...prev,
      {
        codigo: prod.codigo,
        nombre: prod.nombre,
        cantidad: qty,
        precio_unitario: pu,
        subtotal
      }
    ]);

    setSelectedProductoCodigo('');
    setCantidad(1);
    setPrecioUnitario('');
  };

  const total = items.reduce((acc, it) => acc + Number(it.subtotal), 0).toFixed(2);

  const eliminarItem = (index) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleComprar = async () => {
    if (!selectedProveedorCodigo) return alert('Selecciona un proveedor');
    if (items.length === 0) return alert('Agrega al menos un producto');

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

      if (data?.ok) {
        alert('Compra registrada correctamente (ID: ' + data.id_compra + ')');
        setItems([]);
        setSelectedProveedorCodigo('');
      } else {
        alert('Error al registrar compra');
      }
    } catch (err) {
      console.error(err);
      alert('Error al registrar compra');
    }
    setLoading(false);
  };

  const handleCancelar = () => {
    if (!window.confirm('¿Cancelar la compra actual?')) return;
    setItems([]);
    setSelectedProveedorCodigo('');
    setSelectedProductoCodigo('');
    setCantidad(1);
    setPrecioUnitario('');
  };

  const onChangeProveedor = (codigo) => {
    if (items.length > 0)
      return alert('No puedes cambiar de proveedor con artículos agregados');
    setSelectedProveedorCodigo(codigo);
  };

  /* ======================================================
     ===============  RENDER COMPLETO  ====================
     ====================================================== */

  return (
    <div id="screen">
      
      {/* ==== SIDENAV ==== */}
      <div id="sidenavbar">
        <div className="sidenav" ref={sidenav}>
          <img src={tienda} id="tienda" ref={storeButton} onClick={openNavbar} />

          <div className="sidenavmenu" ref={sidenavmenu}>
            <img src={comercial} alt="Comercial Icon" id="logo" />

            <ul className="menu">
              <li className="menu-item" onClick={() => window.location.replace('/punto_de_venta')}>
                <img src={pventa} /> <span>Punto de Venta</span>
              </li>

              <li className="menu-item" onClick={() => window.location.replace('/inventario')}>
                <img src={inventario_icon} /> <span>Inventario</span>
              </li>

              <li className="menu-item" onClick={() => window.location.replace('/compras')}>
                <img src={inventario_icon} /> <span>Compras</span>
              </li>

              <li className="menu-item" onClick={() => window.location.replace('/usuarios')}>
                <img src={usuarios} /> <span>Usuarios</span>
              </li>

              <li className="menu-item">
                <img src={logoutIcon} /> <Logout />
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ==== CONTENIDO PRINCIPAL ==== */}
      <div className="ui" ref={ui}>

        <div id="header">
          <img src={logo_pventa} id="logoPuntoVenta" />
        </div>

        <div id="headbar">
          <div id="userinfo">
            <img src={usericon} />
            <div id="username"><GetUser /></div>
          </div>
        </div>

        {/* === Aquí va tu módulo original, con estilo nuevo === */}
        <div className="compras-container">

          {/*<h2>Módulo de Compras</h2>*/}

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
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
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
                    {prod.codigo} - {prod.nombre}
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
              <button onClick={agregarItem}>Agregar</button>
            </div>
          </div>

          <div className="table-wrapper">
            <DataTableCompras items={items} onEliminar={eliminarItem} />
          </div>

          <div className="footer-actions">
            <div className="total"><strong>Total:</strong> ${total}</div>

            <div className="buttons">
              <button className="btn cancel" onClick={handleCancelar}>Cancelar</button>
              <button className="btn buy" onClick={handleComprar} disabled={loading || items.length === 0 || !selectedProveedorCodigo}>
                {loading ? 'Procesando…' : 'Comprar'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Compras;
