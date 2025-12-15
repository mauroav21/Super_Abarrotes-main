import React, { Component, createRef } from 'react';
// Se elimina la importación de './Inventario.css' y las imágenes de íconos que serán reemplazadas por SVGs
import axios from 'axios';
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import toast, { Toaster } from 'react-hot-toast';
import 'tailwindcss/tailwind.css'; // Aseguramos Tailwind
import download from '../assets/inventario/download.svg';

// ----------------------------------------------------------------------
// MOCK COMPONENTS & HELPERS (Se asume que existen y se mantienen como lógica)
// ----------------------------------------------------------------------
import DataTableComponent from './DataTableComponent';
import GetUser from '../GetUser';
import Logout from '../Logout';
import AltaProductos from './AltaProductos';
import ListaDeFaltantes from './ListaDeFaltantes';
import Faltantes from './Faltantes';

// ----------------------------------------------------------------------
// SVG ICONS (Copiados de CorteCaja.js para mantener la línea de diseño)
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

const Package = (props) => ( // Inventario/Productos
    <svg {...props} {...baseIconProps}>
        <path d="M12.89 1.45l8.69 8.69a2 2 0 010 2.83l-7.77 7.77a2 2 0 01-2.83 0l-8.69-8.69a2 2 0 010-2.83l7.77-7.77a2 2 0 012.83 0z" />
        <path d="M7 10h4" />
        <path d="M10 7v4" />
    </svg>
);

const Users = (props) => ( // Usuarios / Proveedores
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

const CalendarDays = (props) => ( // Corte de Caja
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

const ShoppingBag = (props) => ( // Punto de Venta
    <svg {...props} {...baseIconProps}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 00-8 0" />
    </svg>
);

const DollarSign = (props) => ( // Compras
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
// COMPONENTE PRINCIPAL: Inventario
// ----------------------------------------------------------------------

class Inventario extends Component {
    constructor(props) {
        super(props);
        
        this.sidenav = createRef();
        this.storeButton = createRef();
        this.ui = createRef();
        this.sidenavmenu = createRef();
        
        this.state = {
            isAuthenticated: false,
            searchTerm: "",
            isNavOpen: false, 
        };

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this); 
    }

    async componentDidMount() {
        console.log('Component Mounted, isAuthenticated prop:', this.state.isAuthenticated);
        await this.verifyUser();
        const message = localStorage.getItem('showToast');
        if (message) {
            toast.success(message);
            localStorage.removeItem('showToast');
        }
    }

    async verifyUser() {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.get('http://localhost:8081/');
            if (res.data.Status !== 'Exito') {
                window.location.replace('/');
                console.log(" notverified");
            } else {
                this.setState({ isAuthenticated: true });
                console.log("verified");
            }
        } catch (error) {
            console.error('Error verifying user', error);
        }
    }

    handleSearchChange(event) {
        this.setState({ searchTerm: event.target.value });
    }

    toggleNavbar() {
        this.setState(prevState => ({ isNavOpen: !prevState.isNavOpen }));
    }

    render() {
        if (!this.state.isAuthenticated) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-100">
                    <p className="text-xl font-medium">Redireccionando al login...</p>
                </div>
            );
        }

        const { searchTerm, isNavOpen } = this.state;
        
        return (
            // Contenedor principal de la línea de diseño
            <div className="bg-gray-100 font-sans h-screen overflow-hidden"> 
                <Toaster/>

                {/* Sidebar (Sidenavbar) - Fija y colapsable (Tailwind styling) */}
                <div
                    className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-gray-900 shadow-xl
                        ${isNavOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} md:translate-x-0 md:w-64`}
                >
                    <div className="p-4 flex flex-col h-full text-white" style={{ 
                        backgroundImage: "linear-gradient(rgba(18, 39, 75, 0.9), rgba(18, 39, 75, 0.9)), url('https://placehold.co/600x400/12274B/ffffff?text=Tienda')",
                        backgroundSize: 'cover', backgroundPosition: 'center'
                    }}>
                        
                        {/* Título y botón de cerrar */}
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-xl font-bold text-yellow-300">Super Abarrotes</h1>
                            <button onClick={this.toggleNavbar} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Opciones de Navegación */}
                        <ul className="space-y-3 flex-grow">
                            
                            {/* Punto de Venta */}
                            <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                onClick={() => window.location.replace('/punto_de_venta')}>
                                <ShoppingBag className="w-5 h-5 mr-3" /> 
                                <span>Punto de Venta</span>
                            </li>
                            
                            {/* Inventario (Activo) */}
                            <li className="flex items-center p-3 rounded-lg bg-indigo-700 text-yellow-300 transition-colors">
                                <Package className="w-5 h-5 mr-3" /> 
                                <span>Inventario</span>
                            </li>
                            
                            {/* Compras */}
                            <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                onClick={() => window.location.replace('/compras')}>
                                <DollarSign className="w-5 h-5 mr-3" /> 
                                <span>Compras</span>
                            </li>
                            
                            {/* Administración de Usuarios */}
                            <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                onClick={() => window.location.replace('/usuarios')} >
                                <Users className="w-5 h-5 mr-3" /> 
                                <span>Administración de Usuarios</span>
                            </li>

                            {/* Administración de Proveedores */}
                            <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                onClick={() => window.location.replace('/proveedores')} >
                                <Truck className="w-5 h-5 mr-3" />
                                <span>Administración de Proveedores</span>
                            </li>
                            
                            {/* Corte de Caja */}
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
                                <Logout/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido Principal (UI) */}
                <div
                    ref={this.ui}
                    // Aplicamos el margen condicional para el sidebar y forzamos el scroll interno
                    className={`p-4 md:p-8 transition-all duration-300 md:ml-64 h-screen overflow-y-auto`}
                >
                    
                    {/* Header y Filtro (Sticky) */}
                    <div className="bg-white rounded-xl shadow-lg mb-6 p-4 sticky top-0 z-10">
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {/* Botón de abrir/cerrar sidebar para móviles */}
                                <button onClick={this.toggleNavbar} className="md:hidden p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                    <Menu className="w-6 h-6" />
                                </button>
                                
                                {/* Título del Módulo */}
                                <h2 className="text-2xl font-extrabold text-indigo-800 flex items-center">
                                    <Package className="w-7 h-7 mr-2 text-yellow-500" />
                                    Administración de Inventario
                                </h2>
                            </div>
                            
                            {/* Info de Usuario */}
                            <div className="flex items-center space-x-2 text-sm">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold" style={{ color: '#000000' }}><GetUser /></span>
                            </div>
                        </div>

                        {/* Barra de Búsqueda y Opciones */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                            
                            {/* Campo de Búsqueda: TAMAÑO INTERMEDIO max-w-xl */}
                            <div className='flex flex-col **max-w-lg**'>
                                <label htmlFor="inputBuscar" className="text-sm font-semibold text-gray-700 mb-1">Buscar Inventario</label>
                                <input 
                                    id='inputBuscar' 
                                    placeholder='Nombre o código del producto'
                                    value={searchTerm} 
                                    onChange={this.handleSearchChange}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>

                            {/* Opciones (Alta y Faltantes) */}
                            <div className='flex space-x-4' id='opciones'>
                                <AltaProductos/>
                                <ListaDeFaltantes/>
                                
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabla de Productos */}
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Lista de Productos</h3>
                    <DataTableComponent searchTerm={searchTerm}></DataTableComponent>
                </div>
            </div>
        );
    }
}

Inventario.propTypes = {
    navigate: PropTypes.func.isRequired,
};

export default Inventario;