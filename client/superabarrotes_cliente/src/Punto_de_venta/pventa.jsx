import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import toast, { Toaster } from 'react-hot-toast';
import 'tailwindcss/tailwind.css'; // Asegúrate de que Tailwind esté importado

// Componentes externos (mantienen su lógica, solo el contenedor fue estilizado)
import AddProduct from './addProduct';
import DataTableComponent from './DataTableComponent';
import GetUser from '../GetUser';
import Logout from '../Logout';
import Cobrar from './Cobrar';

//import Truck from './proveedores';

// ----------------------------------------------------------------------
// SVG ICONS (Copiados de CorteCaja para la línea de diseño)
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
    <svg {...props} {...baseIconProps}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);

const X = (props) => (
    <svg {...props} {...baseIconProps}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const Store = (props) => (
    <svg {...props} {...baseIconProps}><path d="M2 7l4 4l8-8l4 4l-2 2L10 18H5L2 15z" /><path d="M7 16l-4 4" /><path d="M12 5l-2 2" /><path d="M16 9l-2 2" /><path d="M20 13l-2 2" /><path d="M22 17l-4 4" /></svg>
);

const Package = (props) => (
    <svg {...props} {...baseIconProps}><path d="M12.89 1.45l8.69 8.69a2 2 0 010 2.83l-7.77 7.77a2 2 0 01-2.83 0l-8.69-8.69a2 2 0 010-2.83l7.77-7.77a2 2 0 012.83 0z" /><path d="M7 10h4" /><path d="M10 7v4" /></svg>
);

const Users = (props) => (
    <svg {...props} {...baseIconProps}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
);

const LogOut = (props) => (
    <svg {...props} {...baseIconProps}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
);

const CalendarDays = (props) => (
    <svg {...props} {...baseIconProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
);

const ShoppingBag = (props) => (
    <svg {...props} {...baseIconProps}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 00-8 0" /></svg>
);

// Icono para  y Compras (Se reutiliza DollarSign para Compras)
const DollarSign = (props) => (
    <svg {...props} {...baseIconProps}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
);

//Icono nvo para proveedores


const Truck = (props) => (
    <svg {...props} {...baseIconProps}>
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <path d="M16 8h4l3 3v5h-4" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: PVenta
// ----------------------------------------------------------------------

class Pventa extends Component {
    constructor(props) {
        super(props);
        this.ui = createRef(); // Mantener UI ref
        // Las referencias sidenav, storeButton, sidenavmenu ahora se usan para manejar el estado de la barra lateral
        this.state = {
            isAuthenticated: false,
            rol: null,
            selectedProduct: null,
            productosEnTabla: [],
            showModal: false,
            isNavOpen: false, // Nuevo estado para controlar la barra lateral
        };
    }

    componentDidMount() {
        this.verifyUser();
    }

    async verifyUser() {
        // Lógica de autenticación (NO TOCADA)
        try {
            const res = await fetch('http://localhost:8081/', { credentials: 'include' });
            const data = await res.json();
            if (data.Status !== 'Exito') {
                window.location.replace('/');
            } else {
                this.setState({ isAuthenticated: true, rol: data.rol });
            }
        } catch (err) {
            console.error(err);
        }
    }

    handleProductSelect = (productWithQty) => {
        // Lógica de selección de producto y stock (NO TOCADA)
        if (!productWithQty || productWithQty.cantidad <= 0) return;

        this.setState(prevState => {
            const productos = [...prevState.productosEnTabla];
            const existing = productos.find(p => p.codigo === productWithQty.value);
            const stockTotal = productWithQty.inventario;

            if (existing) {
                const nuevaCantidad = existing.cantidad + productWithQty.cantidad;
                if (nuevaCantidad > stockTotal) {
                    toast.error(`🛑 Límite de Stock: Solo hay ${stockTotal} unidades disponibles de ${existing.nombre}.`);
                    return null;
                } else {
                    return {
                        productosEnTabla: productos.map(p =>
                            p.codigo === productWithQty.value ? { ...p, cantidad: nuevaCantidad } : p
                        )
                    };
                }
            } else {
                if (productWithQty.cantidad > stockTotal) {
                    toast.error(`🛑 Límite de Stock: No puedes agregar más de ${stockTotal} unidades de ${productWithQty.nombre}.`);
                    return null;
                }
                return {
                    productosEnTabla: [
                        ...productos,
                        { ...productWithQty, codigo: productWithQty.value }
                    ]
                };
            }
        });
    };

    handleCancelar = () => {
        // Lógica de cancelar venta (NO TOCADA)
        if (window.confirm('¿Cancelar la venta actual?')) {
            this.setState({ productosEnTabla: [] });
        }
    };

    // ----------------------------------------------------------------------
    // Lógica de la barra lateral (SIMPLIFICADA con estado y Tailwind)
    // ----------------------------------------------------------------------

    toggleNavbar = () => {
        this.setState(prevState => ({ isNavOpen: !prevState.isNavOpen }));
    };

    // Los métodos openNavbar y closeNavbar originales ya no son necesarios, 
    // pero mantengo el método closeNavbar simple si se requiere desde un click de menú.
    closeNavbar = () => {
        if (this.state.isNavOpen) {
            this.setState({ isNavOpen: false });
        }
    };

    render() {
        const { productosEnTabla, isAuthenticated, isNavOpen } = this.state;
        const total = productosEnTabla.reduce((acc, p) => acc + p.precio * p.cantidad, 0).toFixed(2);

        if (!isAuthenticated) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-100">
                    <p className="text-xl font-medium">Verificando sesión...</p>
                </div>
            );
        }

        return (
            // **********************************************************************
            // Contenedor Principal: Línea de Diseño BASE (CorteCaja)
            // **********************************************************************
            <div className="bg-gray-100 font-sans h-screen overflow-hidden">
                <Toaster />

                {/* Sidebar (Sidenavbar) - Fija y colapsable */}
                <div
                    className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-gray-900 shadow-xl
                        ${isNavOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} md:translate-x-0 md:w-64`}
                >
                    <div 
                        className="p-4 flex flex-col h-full text-white" 
                        style={{
                            // Replica el estilo de fondo del componente CorteCaja
                            backgroundImage: "linear-gradient(rgba(18, 39, 75, 0.9), rgba(18, 39, 75, 0.9)), url('https://placehold.co/600x400/12274B/ffffff?text=Tienda')",
                            backgroundSize: 'cover', backgroundPosition: 'center'
                        }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-xl font-bold text-yellow-300">Super Abarrotes</h1>
                            <button onClick={this.toggleNavbar} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <ul className="space-y-3 flex-grow">
                            {/* Opciones de Navegación */}
                            <li className="flex items-center p-3 rounded-lg bg-indigo-700 text-yellow-300 transition-colors">
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
                                onClick={() => window.location.replace('/usuarios')} >
                                <Users className="w-5 h-5 mr-3" />
                                <span>Administración de Usuarios</span>
                            </li>
                            <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                onClick={() => window.location.replace('/proveedores')} >
                                <Truck className="w-5 h-5 mr-3" />
                                <span>Administración de Proveedores</span>
                            </li>
                            <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                onClick={() => window.location.replace('/corte_de_caja')} >
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
                    ref={this.ui}
                    className={`p-4 md:p-8 transition-all duration-300 md:ml-64 h-screen overflow-y-auto`}
                    onClick={this.state.isNavOpen ? this.closeNavbar : null} // Manejo de cierre de nav en móvil
                >
                    
                    {/* Header/Barra Superior - Estilo CorteCaja */}
                    <div className="bg-white rounded-xl shadow-lg mb-6 p-4 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {/* Botón para abrir/cerrar nav en móvil */}
                                <button onClick={this.toggleNavbar} className="md:hidden p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                    <Menu className="w-6 h-6" />
                                </button>
                                {/* Título principal */}
                                <h2 className="text-2xl font-extrabold text-indigo-800 flex items-center">
                                    <ShoppingBag className="w-7 h-7 mr-2 text-yellow-500" />
                                    Punto de Venta
                                </h2>
                            </div>
                            
                            {/* Información del Usuario */}
                            <div className="flex items-center space-x-2 text-sm">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold" style={{ color: '#000000' }}><GetUser /></span>
                            </div>
                        </div>
                    </div>


                    {/* Contenedor del Punto de Venta */}
                    <div className="pventa-container bg-white rounded-xl shadow-lg p-6 space-y-6"> 
                        
                        {/* Componente de Búsqueda de Productos */}
                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Agregar Producto a la Venta</h3>
                            <AddProduct onProductSelect={this.handleProductSelect} />
                        </div>
                        
                        {/* Tabla de Productos Agregados */}
                        <div className="table-wrapper">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Productos en Carrito ({productosEnTabla.length})</h3>
                            <DataTableComponent productos={productosEnTabla} />
                        </div>

                        {/* Pie de Página y Acciones (Cobrar/Cancelar) */}
                        <div className="footer-actions flex justify-between items-center pt-4 border-t border-gray-200">
                            
                            {/* Total de la Venta */}
                            <div className="total text-2xl font-extrabold text-indigo-800">
                                Total: <span className="text-green-600">${total}</span>
                            </div>

                            {/* Botones de Acción */}
                            <div className="buttons flex space-x-4">
                                <button 
                                    className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-red-600 transition duration-150 transform hover:scale-[1.02]"
                                    onClick={this.handleCancelar}
                                >
                                    Cancelar Venta
                                </button>
                                <Cobrar 
                                    productos={productosEnTabla} 
                                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-150 transform hover:scale-[1.02]"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

Pventa.propTypes = {
    navigate: PropTypes.func.isRequired,
};

export default Pventa;