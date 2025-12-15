import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import 'tailwindcss/tailwind.css';
import './CorteCaja.css';
import GetUser from '../GetUser';
import Logout from '../Logout';

// ----------------------------------------------------------------------
// SVG ICONS (Integrados como componentes)
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

const Menu = (props) => (
    <svg {...props} {...baseIconProps}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const X = (props) => (
    <svg {...props} {...baseIconProps}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Store = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M2 7l4 4l8-8l4 4l-2 2L10 18H5L2 15z" />
        <path d="M7 16l-4 4" />
        <path d="M12 5l-2 2" />
        <path d="M16 9l-2 2" />
        <path d="M20 13l-2 2" />
        <path d="M22 17l-4 4" />
    </svg>
);

const Package = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M12.89 1.45l8.69 8.69a2 2 0 010 2.83l-7.77 7.77a2 2 0 01-2.83 0l-8.69-8.69a2 2 0 010-2.83l7.77-7.77a2 2 0 012.83 0z" />
        <path d="M7 10h4" />
        <path d="M10 7v4" />
    </svg>
);

const Users = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6M23 11h-6" />
    </svg>
);

const LogOut = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
);

const CalendarDays = (props) => (
    <svg {...props} {...baseIconProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
    </svg>
);

const ShoppingBag = (props) => (
    <svg {...props} {...baseIconProps}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 00-8 0" />
    </svg>
);

const DollarSign = (props) => (
    <svg {...props} {...baseIconProps}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
);

const Truck = (props) => (
    <svg {...props} {...baseIconProps}>
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <path d="M16 8h4l3 3v5h-4" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);


// ----------------------------------------------------------------------
// MOCK COMPONENTS & HELPERS (Se mantienen para la estructura de la tabla)
// ----------------------------------------------------------------------

const DataTable = ({ columns, data, noDataText }) => {
    return (
        <div className="overflow-x-auto rounded-lg shadow-inner border border-gray-100 mt-2">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {col.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data && data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-indigo-50/50">
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {col.cell ? col.cell(row) : col.selector(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                                {noDataText}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
DataTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    noDataText: PropTypes.string,
};

const GetUserDisplay = () => {
    const [username, setUsername] = useState('AdminCaja');
    useEffect(() => {
        // Lógica de usuario real aquí
    }, []);
    return <span className="font-semibold text-gray-800">{username}</span>;
};

const LogoutButton = () => {
    const handleLogout = () => {
        toast.success('Sesión Cerrada (Simulación)', { duration: 1500 });
        // Lógica de logout real aquí
        // window.location.replace('/');
    };
    return <span onClick={handleLogout} className="cursor-pointer hover:text-red-300 transition-colors">Cerrar Sesión</span>;
};


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: CorteCaja
// ----------------------------------------------------------------------

const CorteCaja = () => {
    const today = new Date().toISOString().split('T')[0];

    const [isAuthenticated, setIsAuthenticated] = useState(true); 
    const [ventas, setVentas] = useState([]);
    const [totalPeriodo, setTotalPeriodo] = useState(0);
    const [rangoFechaDisplay, setRangoFechaDisplay] = useState('Hoy');
    const [fechaInicio, setFechaInicio] = useState(today); 
    const [fechaFin, setFechaFin] = useState(today); 
    const [openVentas, setOpenVentas] = useState([]);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const uiRef = useRef(null);

    const productColumns = [
        { name: 'Producto', selector: row => row.producto, sortable: true },
        { name: 'Cantidad', selector: row => row.cantidad, sortable: true },
        { 
            name: 'Total', 
            selector: row => row.total, 
            sortable: true,
            cell: row => `$${Number(row.total).toFixed(2)}`
        },
    ];

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('es-ES', options); 
    }, []);


    /**
     * Obtiene el corte de caja del backend. Sin datos mock.
     */
    const obtenerCorteCaja = useCallback(async (startDate = today, endDate = today) => {
        let url = 'http://localhost:8081/corte-caja-fecha'; 
        let display = '';
        let params = {}; 

        if (startDate === endDate) {
            params = { fecha: startDate }; 
            display = `Día: ${startDate}`;
        } else {
            url = 'http://localhost:8081/corte-caja-rango'; 
            params = { 
                fecha_inicio: startDate, 
                fecha_fin: endDate 
            };
            display = `${startDate} al ${endDate}`;
        }

        // Limpiar estados antes de la llamada
        setVentas([]); 
        setTotalPeriodo(0);
        setRangoFechaDisplay(display);
        setOpenVentas([]);

        try {
            axios.defaults.withCredentials = true;
            
            const res = await axios.get(url, { params: params }); 
            
            // Cargar datos reales
            setVentas(res.data.ventas || []);
            setTotalPeriodo(Number(res.data.totalDia) || 0); 
            
            if (res.data.ventas?.length === 0) {
                toast('No se encontraron ventas en el rango seleccionado.', { icon: '🗓️' });
            }

        } catch (error) {
            // Manejo de errores sin datos mock
            console.error('Error al obtener el corte de caja.', error);
            toast.error('Error de conexión o datos inválidos desde el backend. Verifique el servidor.');
        }
    }, [today]);

    // Lógica de carga inicial
    useEffect(() => {
        const verifyAndLoad = async () => {
            setIsAuthenticated(true);
            obtenerCorteCaja(today, today); 
        };
        verifyAndLoad();
    }, [obtenerCorteCaja, today]);

    // Manejadores de UI
    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const handleDateChange = (event) => {
        const { name, value } = event.target;
        if (name === 'fechaInicio') setFechaInicio(value);
        if (name === 'fechaFin') setFechaFin(value);
    };

    const handleFilter = () => {
        if (!fechaInicio || !fechaFin) {
            toast.error('Debes seleccionar ambas fechas (inicio y fin) para filtrar.');
            return;
        }
        
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            toast.error('La fecha de inicio no puede ser posterior a la fecha de fin.');
            return;
        }

        obtenerCorteCaja(fechaInicio, fechaFin);
    };
    
    const toggleVentaDetails = (numVenta) => {
        setOpenVentas(prev => {
            const index = prev.indexOf(numVenta);
            if (index === -1) {
                return [...prev, numVenta];
            } else {
                return prev.filter(id => id !== numVenta);
            }
        });
    };

    // ----------------------------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------------------------

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-xl font-medium">Redireccionando al login...</p>
            </div>
        );
    }

    return (
        // **********************************************************************
        // CAMBIO 1: Contenedor Principal. Usamos h-screen y overflow-hidden para bloquear el scroll global.
        // **********************************************************************
        <div className="bg-gray-100 font-sans h-screen overflow-hidden"> 

            <Toaster />

            {/* Sidebar (Sidenavbar) - Fija y colapsable */}
            <div
                className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-gray-900 shadow-xl
                    ${isNavOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} md:translate-x-0 md:w-64`}
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
                        {/* Opciones de Navegación */}
                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                            onClick={() => window.location.replace('/punto_de_venta')}>
                            <ShoppingBag className="w-5 h-5 mr-3" />
                            <span>Punto de Venta</span>
                        </li>
                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                            onClick={() => window.location.replace('/inventario')}>
                            <Package className="w-5 h-5 mr-3" />
                            <span>Inventario</span>
                        </li>
                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                            onClick={() => window.location.replace('/compras')}>
                            <DollarSign className="w-5 h-5 mr-3" />
                            <span>Compras</span>
                        </li>
                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                            onClick={() => window.location.replace('/usuarios')}>
                            <Users className="w-5 h-5 mr-3" />
                            <span>Administración de Usuarios</span>
                        </li>
                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                            onClick={() => window.location.replace('/proveedores')}>
                            <Truck className="w-5 h-5 mr-3" />
                            <span>Administración de Proveedores</span>
                        </li>
                        <li className="flex items-center p-3 rounded-lg bg-indigo-700 text-yellow-300 transition-colors">
                            <CalendarDays className="w-5 h-5 mr-3" />
                            <span>Corte de Caja</span>
                        </li>
                    </ul>
                    {/* Logout */}
                    <div className="mt-8 pt-4 border-t border-indigo-700">
                            <div className="flex items-center p-3 rounded-lg hover:bg-red-700/50 cursor-pointer transition-colors">
                                <LogOut className="w-5 h-5 mr-3" />
                                {/* Componente Logout original */}
                                <span className="cursor-pointer hover:text-red-300 transition-colors"><Logout /></span>
                            </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal (UI) */}
            <div
                ref={uiRef}
                // **********************************************************************
                // CAMBIO 2: Contenedor de Contenido. Usamos h-screen y overflow-y-auto para forzar el scroll interno.
                // **********************************************************************
                className={`p-4 md:p-8 transition-all duration-300 md:ml-64 h-screen overflow-y-auto`}
            >
                {/* Header y Filtro (Sticky) */}
                <div className="bg-white rounded-xl shadow-lg mb-6 p-4 sticky top-0 z-10">
                    
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <button onClick={toggleNav} className="md:hidden p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-extrabold text-indigo-800 flex items-center">
                                <Store className="w-7 h-7 mr-2 text-yellow-500" />
                                Corte de Caja
                            </h2>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold" style={{ color: '#000000' }}><GetUser /></span>
                        </div>
                    </div>

                    {/* Filtro de Fechas */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4" id="filtro-fechas">
                        
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                            <div className="flex flex-col">
                                <label htmlFor="fechaInicio" className="text-sm font-semibold text-gray-700 mb-1">Fecha Inicio:</label>
                                <input
                                    type="date"
                                    id="fechaInicio"
                                    name="fechaInicio"
                                    value={fechaInicio}
                                    onChange={handleDateChange}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="fechaFin" className="text-sm font-semibold text-gray-700 mb-1">Fecha Fin:</label>
                                <input
                                    type="date"
                                    id="fechaFin"
                                    name="fechaFin"
                                    value={fechaFin}
                                    onChange={handleDateChange}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleFilter} 
                            id="btn-filtrar"
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-150 transform hover:scale-[1.02]"
                        >
                            Filtrar
                        </button>
                    </div>
                </div>

                {/* Resumen del Período */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-indigo-500">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Resumen del Período</h2>
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                        <p>
                            <b className="font-semibold">Período:</b> {rangoFechaDisplay}
                        </p>
                        <p className="text-right text-2xl font-extrabold text-green-600">
                            <b className="font-semibold">Total:</b> ${Number(totalPeriodo).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Detalle de Ventas */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detalle de {ventas.length} Ventas</h3>
                
                {ventas.length > 0 ? (
                    <div className="space-y-4">
                        {ventas.map((venta) => {
                            const numVenta = venta.num_venta;
                            const isOpen = openVentas.includes(numVenta); 

                            return (
                                <div
                                    key={numVenta} 
                                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4 border-indigo-300"
                                >
                                    
                                    {/* ENCABEZADO DE LA VENTA (Clickeable) */}
                                    <div
                                        onClick={() => toggleVentaDetails(numVenta)} 
                                        className="p-4 flex justify-between items-center cursor-pointer bg-indigo-50/70"
                                    >
                                        <h4 className="text-lg font-bold text-indigo-900 m-0">
                                            Venta #{numVenta} — Total: <span className="text-green-600">${Number(venta.total).toFixed(2)}</span>
                                        </h4>
                                        <span className="text-xl font-bold text-indigo-700 transition-transform duration-300">
                                            {isOpen ? '▲' : '▼'}
                                        </span>
                                    </div>

                                    {/* DETALLES DE LA VENTA (Condicionalmente visible) */}
                                    {isOpen && (
                                        <div className="p-4 bg-white border-t border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-4 text-sm text-gray-700">
                                                <p>
                                                    <b>Usuario:</b> {venta.usuario}
                                                </p>
                                                <p>
                                                    <b>Fecha/Hora:</b> {formatDate(venta.fecha)}
                                                </p>
                                            </div>
                                            
                                            <h5 className="font-semibold mt-4 mb-2 text-gray-800">Productos vendidos:</h5>
                                            <DataTable
                                                data={venta.productos.map((p) => ({
                                                    producto: p.nombre,
                                                    cantidad: p.cantidad,
                                                    total: p.precioUnitario * p.cantidad 
                                                }))}
                                                columns={productColumns}
                                                noDataText="No hay productos registrados"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Mensaje cuando NO hay ventas
                    <p className="text-center mt-8 p-6 bg-yellow-50 rounded-lg text-gray-700 border-l-4 border-yellow-400">
                        No hay ventas registradas para el período: <span className="font-semibold">{rangoFechaDisplay}</span>.
                        Por favor, revisa la conexión a la base de datos o ajusta el filtro de fechas.
                    </p>
                )}
            </div>
        </div>
    );
};

CorteCaja.propTypes = {
    navigate: PropTypes.func, 
};

export default CorteCaja;