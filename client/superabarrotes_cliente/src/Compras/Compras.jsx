import React, { useEffect, useState, useRef, useCallback } from 'react';
import DataTableCompras from './DataTableCompras'; // <-- Importación del componente externo
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import 'tailwindcss/tailwind.css';
import PropTypes from 'prop-types';
import GetUser from '../GetUser';
import Logout from '../Logout'; // Asumo que este componente maneja la lógica de cerrar sesión

// ----------------------------------------------------------------------
// 1. SVG ICONS (Integrados y sin cambios)
// ----------------------------------------------------------------------

const baseIconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

const Menu = (props) => (<svg {...props} {...baseIconProps}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);
const X = (props) => (<svg {...props} {...baseIconProps}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const Package = (props) => (<svg {...props} {...baseIconProps}><path d="M12.89 1.45l8.69 8.69a2 2 0 010 2.83l-7.77 7.77a2 2 0 01-2.83 0l-8.69-8.69a2 2 0 010-2.83l7.77-7.77a2 2 0 012.83 0z" /><path d="M7 10h4" /><path d="M10 7v4" /></svg>);
const Users = (props) => (<svg {...props} {...baseIconProps}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>);
const LogOut = (props) => (<svg {...props} {...baseIconProps}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>);
const CalendarDays = (props) => (<svg {...props} {...baseIconProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>);
const ShoppingBag = (props) => (<svg {...props} {...baseIconProps}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 00-8 0" /></svg>);
const DollarSign = (props) => (<svg {...props} {...baseIconProps}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>);
const Truck = (props) => ( <svg {...props} {...baseIconProps}><rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><path d="M16 8h4l3 3v5h-4" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>);

// --- MOCKS y AYUDAS (Se mantienen) ---
const GetUserDisplay = () => { return <span className="font-semibold text-gray-800">CajaPrincipal</span>; };
// LogoutComponent ya no es necesario, usamos el componente Logout directamente
// const LogoutComponent = () => { /* ... */ };

const navItems = [
    { name: 'Punto de Venta', icon: ShoppingBag, path: '/punto_de_venta' },
    { name: 'Inventario', icon: Package, path: '/inventario' },
    { name: 'Compras', icon: DollarSign, path: '/compras' },
    { name: 'Administración de Usuarios', icon: Users, path: '/usuarios' },
    { name: 'Administración de Proveedores', icon: Truck, path: '/proveedores' },
    { name: 'Corte de Caja', icon: CalendarDays, path: '/corte_de_caja' },
];

// ----------------------------------------------------------------------
// 2. COMPONENTE PRINCIPAL DE COMPRAS
// ----------------------------------------------------------------------
const Compras = () => {
    // ESTADOS
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [selectedProveedorCodigo, setSelectedProveedorCodigo] = useState('');
    const [selectedProductoCodigo, setSelectedProductoCodigo] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [precioUnitario, setPrecioUnitario] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // --- ESTADO Y FUNCIÓN DEL SIDEBAR ---
    const [isNavOpen, setIsNavOpen] = useState(false);
    const uiRef = useRef(null); 
    const toggleNav = () => setIsNavOpen(!isNavOpen);
    
    // Función de navegación CORREGIDA para redireccionar
    const handleNavigate = (path) => {
        if (isNavOpen) {
            setIsNavOpen(false);
        }
        
        // ******* NAVEGACIÓN REAL A TRAVÉS DE REDIRECCIÓN *******
        console.log(`Navegando a: ${path}`);
        window.location.href = path;
    };
    // ------------------------------------------

    // ----------------------------------------------------------------------
    // LÓGICA DE CONEXIÓN AL SERVIDOR 
    // ----------------------------------------------------------------------

    const fetchProveedores = useCallback(async () => {
        setLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const url = 'http://localhost:8081/api/proveedores'; 
            
            const res = await axios.get(url); 
            
            if (Array.isArray(res.data) && res.data.length > 0) {
                setProveedores(res.data);
            } else {
                setProveedores([]);
                toast.error('No se devolvieron proveedores. Revise su base de datos.', { duration: 3000 });
            }
        } catch (error) {
            console.error('Error FATAL al obtener proveedores:', error.message || error);
            if (error.code === 'ERR_NETWORK') {
                 toast.error('ERROR DE CONEXIÓN: Asegúrese que el backend esté ejecutándose en http://localhost:8081.');
            } else {
                 toast.error(`Error al cargar proveedores. Código: ${error.response?.status || 'N/A'}`);
            }
        }
    }, []);

    const fetchProductos = useCallback(async () => {
        try {
            axios.defaults.withCredentials = true;
            const url = 'http://localhost:8081/api/productos'; 

            const res = await axios.get(url); 
            
            if (Array.isArray(res.data) && res.data.length > 0) {
                setProductos(res.data);
            } else {
                setProductos([]);
                toast.error('No se devolvieron productos. Revise su base de datos.', { duration: 3000 });
            }
        } catch (error) {
            console.error('Error FATAL al obtener productos:', error.message || error);
            if (error.code === 'ERR_NETWORK') {
                 toast.error('ERROR DE CONEXIÓN al obtener productos.');
            } else {
                 toast.error(`Error al cargar productos. Código: ${error.response?.status || 'N/A'}`);
            }
        } finally {
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            await fetchProveedores();
            await fetchProductos();
        };
        loadInitialData();
    }, [fetchProveedores, fetchProductos]);


    // ----------------------------------------------------------------------
    // LÓGICA DE GESTIÓN DE COMPRA
    // ----------------------------------------------------------------------
    
    const agregarItem = () => {
        if (!selectedProveedorCodigo) return toast.error('Selecciona un proveedor');
        
        const prod = productos.find(p => String(p.codigo) === String(selectedProductoCodigo));
        if (!prod) return toast.error('Producto no seleccionado.');

        const qty = parseInt(cantidad);
        const pu = parseFloat(precioUnitario);

        if (!qty || qty <= 0 || isNaN(qty)) return toast.error('Cantidad inválida.');
        if (!pu || pu <= 0 || isNaN(pu)) return toast.error('Precio unitario inválido.');

        const subtotal = parseFloat((qty * pu).toFixed(2));

        const existingItemIndex = items.findIndex(item => item.codigo === prod.codigo);
        if (existingItemIndex !== -1) {
             const newItems = [...items];
             newItems[existingItemIndex] = {
                 ...newItems[existingItemIndex],
                 cantidad: newItems[existingItemIndex].cantidad + qty,
                 subtotal: newItems[existingItemIndex].subtotal + subtotal,
             };
             setItems(newItems);
             toast.success(`Se sumó cantidad al producto ${prod.nombre}.`);
        } else {
            setItems(prev => [
                ...prev,
                { codigo: prod.codigo, nombre: prod.nombre, cantidad: qty, precio_unitario: pu, subtotal }
            ]);
            toast.success('Producto agregado a la compra.');
        }
        
        setSelectedProductoCodigo('');
        setCantidad(1);
        setPrecioUnitario('');
    };

    const eliminarItem = (index) => {
        const copy = [...items];
        copy.splice(index, 1);
        setItems(copy);
        toast.success('Producto eliminado de la lista');
    };
    
    const handleComprar = async () => {
        if (items.length === 0) return toast.error('No hay artículos en la lista de compra.');
        if (!selectedProveedorCodigo) return toast.error('Debe seleccionar un proveedor.');

        setLoading(true);
        
        const compraData = {
            codigo_proveedor: selectedProveedorCodigo,
            total: items.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2),
            detalles: items.map(item => ({
                codigo: item.codigo, 
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal 
            })),
        };

        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post('http://localhost:8081/api/compras', compraData);
            
            if (res.status === 200 || res.status === 201) {
                toast.success(`Compra registrada con éxito!`);
                setItems([]);
                setSelectedProveedorCodigo('');
                setSelectedProductoCodigo('');
                setCantidad(1);
                setPrecioUnitario('');
            } else {
                toast.error(res.data?.error || 'Error al registrar la compra. Respuesta inesperada.');
            }

        } catch (error) {
            console.error('Error al registrar la compra:', error);
            const errorMessage = error.response?.data?.error || 'Error de conexión o en el servidor.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancelar = () => {
        if (!window.confirm('¿Desea cancelar la compra actual?')) return;
        setItems([]); // <- Uso correcto del setter
        setSelectedProveedorCodigo('');
        setSelectedProductoCodigo('');
        setCantidad(1);
        setPrecioUnitario('');
        toast.info('Compra cancelada');
    };

    const onChangeProveedor = (codigo) => {
        if (items.length > 0 && codigo !== selectedProveedorCodigo)
            return toast.error('No puedes cambiar de proveedor con artículos agregados.');
        setSelectedProveedorCodigo(codigo);
    };


    // ----------------------------------------------------------------------
    // 3. RENDER: Estructura Visual Completa
    // ----------------------------------------------------------------------
    
    return (
        <div className="bg-gray-100 font-sans h-screen overflow-hidden"> 
            <Toaster />
            
            {/* --------------------------------------------------------- */}
            {/* --- SIDEBAR FUNCIONAL E INTEGRADO --- */}
            {/* --------------------------------------------------------- */}
            <div
                className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-gray-900 shadow-xl w-64
                    ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                <div className="p-4 flex flex-col h-full text-white" style={{ 
                    backgroundImage: "linear-gradient(rgba(18, 39, 75, 0.9), rgba(18, 39, 75, 0.9)), url('https://placehold.co/600x400/12274B/ffffff?text=Tienda')",
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }}>
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-xl font-bold text-yellow-300">Super Abarrotes</h1>
                        <button onClick={toggleNav} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <ul className="space-y-3 flex-grow">
                        {navItems.map((item) => (
                            <li 
                                key={item.name}
                                // CLASE ACTIVA
                                className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors 
                                    ${item.name === 'Compras' ? 'bg-indigo-700 text-yellow-300' : '' 
                                }`}
                                // FUNCIÓN DE NAVEGACIÓN REAL
                                onClick={() => handleNavigate(item.path)}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 pt-4 border-t border-indigo-700">
                                <div className="flex items-center p-3 rounded-lg hover:bg-red-700/50 cursor-pointer transition-colors">
                                    <LogOut className="w-5 h-5 mr-3" />
                                    {/* Componente Logout original (Debe manejar el cierre de sesión) */}
                                    <span className="cursor-pointer hover:text-red-300 transition-colors"><Logout /></span>
                                </div>
                        </div>
                </div>
            </div>
            {/* --------------------------------------------------------- */}


            {/* Contenido Principal (Scrollable) */}
            <div 
                ref={uiRef} 
                className={`p-4 md:p-8 transition-all duration-300 md:ml-64 h-screen overflow-y-auto`}
            > 
                
                {/* Header (Mantiene la integración con el toggle) */}
                <div className="bg-white rounded-xl shadow-lg mb-6 p-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button onClick={toggleNav} className="md:hidden p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="2xl font-extrabold text-indigo-800 flex items-center">
                                <DollarSign className="w-7 h-7 mr-2 text-yellow-500" />
                                Módulo de Compras
                            </h2>
                        </div>
                        {/* Información del Usuario */}
                        <div className="flex items-center space-x-2 text-sm">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold" style={{ color: '#000000' }}><GetUser /></span>
                        </div>
                    </div>
                </div>

                {/* CUERPO DEL CONTENIDO (*** CLASE CORREGIDA AQUÍ ***) */}
                <div className="py-2 w-full flex flex-col min-w-0"> 

                    {/* === 1. BLOQUE DE CONTROLES DE COMPRA === */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-indigo-500">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Registrar Nueva Compra</h3>
                        
                        {loading && proveedores.length === 0 && productos.length === 0 ? (
                            <div className="flex items-center justify-center p-8 text-indigo-600 font-medium text-lg">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Cargando datos iniciales...
                            </div>
                        ) : (
                            // La grilla es de 6 columnas: 2 + 2 + 1 + 1 = 6/6
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                {/* Proveedor (col-span-2) */}
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Proveedor</label>
                                    <select
                                        value={selectedProveedorCodigo}
                                        onChange={(e) => onChangeProveedor(e.target.value)}
                                        disabled={items.length > 0 || loading || proveedores.length === 0}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-black font-semibold focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">-- {proveedores.length === 0 ? 'No hay proveedores' : 'Selecciona proveedor'} --</option>
                                        {proveedores.map(p => (
                                            <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Producto (col-span-2) */}
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Producto</label>
                                    <select
                                        value={selectedProductoCodigo}
                                        onChange={(e) => setSelectedProductoCodigo(e.target.value)}
                                        disabled={loading || productos.length === 0}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-black font-semibold focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">-- {productos.length === 0 ? 'No hay productos' : 'Selecciona producto'} --</option>
                                        {productos.map(prod => (
                                            <option key={prod.codigo} value={prod.codigo}>
                                                {prod.codigo} - {prod.nombre} (Existencia: {prod.cantidad})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Cantidad (col-span-1) */}
                                <div className="col-span-1">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Cantidad</label>
                                    <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} disabled={loading} className="w-full p-2 border border-gray-300 rounded-lg text-right text-black font-semibold focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>

                                {/* Precio unitario (col-span-1) */}
                                <div className="col-span-1">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Precio/u</label>
                                    <input type="number" min="0.01" step="0.01" value={precioUnitario} onChange={e => setPrecioUnitario(e.target.value)} disabled={loading} className="w-full p-2 border border-gray-300 rounded-lg text-right text-black font-semibold focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>

                                {/* Botón Agregar (col-span-full) */}
                                <div className="col-span-full mt-2">
                                    <button 
                                        onClick={agregarItem}
                                        disabled={loading || !selectedProductoCodigo || !selectedProveedorCodigo || !cantidad || !precioUnitario || productos.length === 0 || proveedores.length === 0}
                                        className="w-full bg-green-500 text-white font-bold py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-150 disabled:bg-gray-400"
                                    >
                                        Agregar Producto a la Compra
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* === 2. DETALLE Y TOTAL DE LA COMPRA (Tabla) === */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6 !text-black">
                        {/* El componente interno DataTableCompras DEBE contener la clase w-full table-fixed */}
                        <DataTableCompras items={items} onEliminar={eliminarItem} /> 
                    </div>

                    {/* === 3. ACCIONES FINALES Y TOTAL === */}
                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center border-t-4 border-indigo-700">
                        
                        <div className="total mb-4 md:mb-0">
                            <strong className="text-2xl text-gray-800">Total de la Compra:</strong> 
                            <span className="text-3xl font-extrabold text-green-700 ml-4">${items.reduce((acc, it) => acc + Number(it.subtotal), 0).toFixed(2)}</span>
                        </div>

                        <div className="buttons space-x-4 flex">
                            <button 
                                className="btn bg-gray-300 text-red-700 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 hover:text-white transition disabled:opacity-50" 
                                onClick={handleCancelar}
                                disabled={loading || items.length === 0}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition disabled:bg-indigo-300 disabled:opacity-50" 
                                onClick={handleComprar} 
                                disabled={loading || items.length === 0 || !selectedProveedorCodigo}
                            >
                                {loading ? 'Procesando…' : 'Finalizar Compra'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Compras.propTypes = {
    // Si usas React Router, podrías necesitar PropTypes.func para navigate
};

export default Compras;