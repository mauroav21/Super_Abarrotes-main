import { Component, createRef } from 'react';
import { Link } from "react-router-dom";
import DataTableComponentFaltantes from './DataTableComponentFaltantes';
import GetUser from '../GetUser';
import axios from 'axios';
import Logout from '../Logout'
import PropTypes from 'prop-types';
import 'tailwindcss/tailwind.css';

// ----------------------------------------------------------------------
// IMPORTACIÓN DE ÍCONOS
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

const ShoppingBag = (props) => ( // Punto de Venta
    <svg {...props} {...baseIconProps}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 00-8 0" />
    </svg>
);

const Package = (props) => ( // Inventario
    <svg {...props} {...baseIconProps}>
        <path d="M12.89 1.45l8.69 8.69a2 2 0 010 2.83l-7.77 7.77a2 2 0 01-2.83 0l-8.69-8.69a2 2 0 010-2.83l7.77-7.77a2 2 0 012.83 0z" />
        <path d="M7 10h4" />
        <path d="M10 7v4" />
    </svg>
);

const Users = (props) => ( // Usuarios
    <svg {...props} {...baseIconProps}>
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6M23 11h-6" />
    </svg>
);

const LogOut = (props) => ( // Cerrar Sesión
    <svg {...props} {...baseIconProps}>
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
);

const ListMinus = (props) => ( // Lista de Faltantes (Ícono de página actual)
    <svg {...props} {...baseIconProps}>
        <path d="M11 12H3" />
        <path d="M16 6H3" />
        <path d="M16 18H3" />
        <path d="M21 12V6" />
        <path d="M21 18V18" />
    </svg>
);

const Download = (props) => ( // Descargar PDF
    <svg {...props} {...baseIconProps}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const DollarSign = (props) => ( // Compras / Corte de Caja
    <svg {...props} {...baseIconProps}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
);

const Truck = (props) => ( // Proveedores
    <svg {...props} {...baseIconProps}>
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <path d="M16 8h4l3 3v5h-4" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: Faltantes
// ----------------------------------------------------------------------

class Faltantes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: false,
            isNavOpen: false, 
        };
        this.toggleNavbar = this.toggleNavbar.bind(this);
    }

    async componentDidMount() {
        await this.verifyUser();
    }

    async verifyUser() {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.get('http://localhost:8081/');
            if (res.data.Status !== 'Exito') {
                window.location.replace('/');
            } else {
                this.setState({ isAuthenticated: true });
            }
        } catch (error) {
            console.error('Error verifying user', error);
        }
    }

    async descargarPdf() {
        // Mantenemos la función por si se necesita lógica de error, aunque el botón usa un <a> directo.
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await axios.get('http://localhost:8081/generar-pdf');
        }
        catch (error) {
            console.error('Error descargando el pdf', error);
        }
    }

    toggleNavbar() {
        this.setState(prevState => ({ isNavOpen: !prevState.isNavOpen }));
    }

    render() {
        const { isNavOpen, isAuthenticated } = this.state;

        return (
            <>
                {
                    isAuthenticated ? (
                        <div className="bg-gray-100 font-sans h-screen overflow-hidden">
                            {/* Sidebar (Sidenavbar) */}
                            <div
                                className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-gray-900 shadow-xl
                                ${isNavOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} md:translate-x-0 md:w-64`}
                            >
                                <div className="p-4 flex flex-col h-full text-white" style={{
                                    backgroundImage: "linear-gradient(rgba(18, 39, 75, 0.9), rgba(18, 39, 75, 0.9)), url('https://placehold.co/600x400/12274B/ffffff?text=Tienda')",
                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                }}>
                                    <div className="flex items-center justify-between mb-8">
                                        <h1 className="text-xl font-bold text-yellow-300">Super Abarrotes CC</h1>
                                        <button onClick={this.toggleNavbar} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <ul className="space-y-3 flex-grow">
                                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                            onClick={() => window.location.replace('/punto_de_venta')}>
                                            <ShoppingBag className="w-5 h-5 mr-3" />
                                            <span>Punto de Venta</span>
                                        </li>
                                        {/* Inventario (Padre) - Activo */}
                                        <li className="flex flex-col rounded-lg bg-indigo-700/80 text-white cursor-pointer transition-colors">
                                            <div className="flex items-center p-3" onClick={() => window.location.replace('/inventario')}>
                                                <Package className="w-5 h-5 mr-3 text-yellow-300" />
                                                <span className="font-bold text-yellow-300">Inventario</span>
                                            </div>
                                            {/* Faltantes (Hijo) - Página actual resaltada */}
                                            <div className="flex items-center p-3 pl-10 rounded-lg bg-indigo-900 text-yellow-300 cursor-default">
                                                <ListMinus className="w-4 h-4 mr-2" />
                                                <span>Lista de Faltantes</span>
                                            </div>
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
                                            <DollarSign className="w-5 h-5 mr-3" />
                                            <span>Corte de Caja</span>
                                        </li>
                                    </ul>
                                    <div className="mt-8 pt-4 border-t border-indigo-700">
                                        <div className="flex items-center p-3 rounded-lg hover:bg-red-700/50 cursor-pointer transition-colors">
                                            <LogOut className="w-5 h-5 mr-3" />
                                            <Logout />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido Principal (UI) - Resto del componente sin cambios */}
                            <div className={`p-4 md:p-8 transition-all duration-300 md:ml-64 h-screen overflow-y-auto`}>
                                
                                {/* Header y Opciones */}
                                <div className="bg-white rounded-xl shadow-lg mb-6 p-4 sticky top-0 z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <button onClick={this.toggleNavbar} className="md:hidden p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                                <Menu className="w-6 h-6" />
                                            </button>
                                            <h2 className="text-2xl font-extrabold text-indigo-800 flex items-center">
                                                <ListMinus className="w-7 h-7 mr-2 text-red-500" />
                                                Lista de Faltantes
                                            </h2>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Users className="w-5 h-5 text-gray-500" />
                                                <span className="font-semibold text-gray-800"><GetUser /></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-4">
                                        
                                        {/* Botón Descargar PDF */}
                                        <a 
                                            href="http://localhost:8081/generar-pdf" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center bg-red-600 text-black font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 transition duration-150 transform hover:scale-[1.02]"
                                        >
                                            <Download className='w-5 h-5 mr-2' />
                                            Descargar PDF
                                        </a>

                                        {/* Botón Volver a Inventario */}
                                        <button 
                                            onClick={() => window.location.replace('/inventario')} 
                                            className="inline-flex items-center bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.02]"
                                        >
                                            <Package className='w-5 h-5 mr-2'/>
                                            Volver a Inventario
                                        </button>
                                    </div>
                                </div>

                                {/* Componente de la Tabla de Datos Faltantes */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Productos con Stock Bajo</h3>
                                    <DataTableComponentFaltantes />
                                </div>
                            </div>
                        </div>
                    )
                        :
                        // Pantalla de Carga/No Autenticado
                        <div className="flex items-center justify-center h-screen bg-gray-100">
                            <p className="text-xl font-medium text-indigo-700">Verificando sesión...</p>
                        </div>
                }
            </>
        );
    }
}
Faltantes.propTypes = {
    navigate: PropTypes.func.isRequired,
};

export default Faltantes;