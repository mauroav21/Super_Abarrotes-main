import { Component, createRef } from 'react';
import { Link } from "react-router-dom";
import DataTableComponent from './DataTableComponent';
import GetUser from '../GetUser';
import axios from 'axios';
import Logout from '../Logout';
import AltaProveedoresModal from './AltaProveedoresModal';
import toast, { Toaster } from 'react-hot-toast';
import 'tailwindcss/tailwind.css';

// ----------------------------------------------------------------------
// IMPORTACIÓN DE ÍCONOS (SVG COMPONENTS)
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
    <svg {...props} {...baseIconProps}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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

const ShoppingBag = (props) => (
    <svg {...props} {...baseIconProps}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 00-8 0" /></svg>
);

const DollarSign = (props) => (
    <svg {...props} {...baseIconProps}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
);

const Truck = (props) => (
    <svg {...props} {...baseIconProps}><rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><path d="M16 8h4l3 3v5h-4" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
);

const CalendarDays = (props) => (
    <svg {...props} {...baseIconProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
);


// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: Admin_provedores
// ----------------------------------------------------------------------

class Admin_provedores extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: false,
            rol: null,
            user: null,
            isNavOpen: false,
            showAltaModal: false,
            refreshKey: 0, // Clave para forzar la recarga de datos en la tabla
        };
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.openAltaModal = this.openAltaModal.bind(this);
        this.closeAltaModal = this.closeAltaModal.bind(this);
    }

    async componentDidMount() {
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
            } else {
                this.setState({ isAuthenticated: true, rol: res.data.rol });
            }
        } catch (error) {
            console.error('Error verifying user', error);
        }
    }
    
    toggleNavbar() {
        this.setState(prevState => ({ isNavOpen: !prevState.isNavOpen }));
    }

    openAltaModal() {
        setTimeout(() => {
            this.setState({ showAltaModal: true });
        }, 0);
    }

    // shouldReload: Si es TRUE, significa que se guardó un proveedor y debemos recargar la tabla.
    closeAltaModal(shouldReload = false) {
        this.setState({ showAltaModal: false });
        if (shouldReload) {
            // Forzar la recarga del DataTableComponent cambiando la clave
            this.setState(prevState => ({ refreshKey: prevState.refreshKey + 1 }));
        }
    }

    render() {
        const { isNavOpen, rol, isAuthenticated, showAltaModal, refreshKey } = this.state;
        const isAdmin = rol !== 'Operario'; 

        if (!isAuthenticated) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-100">
                    <p className="text-xl font-medium text-indigo-700">Verificando sesión...</p>
                </div>
            );
        }

        if (isAuthenticated && !isAdmin) {
            // Caso 1: Usuario Operario (Sin Permisos) 
            return (
                <div className="bg-gray-100 font-sans h-screen overflow-hidden flex flex-col">
                    <Toaster />
                    
                    {/* Sidebar para móviles */}
                    <div
                        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-gray-900 shadow-xl
                        ${isNavOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} md:translate-x-0 md:w-64`}
                    >
                         {/* ... Sidebar Content (Omitido por espacio, similar a abajo) ... */}
                    </div>

                    {/* Contenido Principal (UI) - Adaptado para mostrar el mensaje de error */}
                    <div className={`flex-grow p-4 md:p-8 transition-all duration-300 md:ml-64 h-full overflow-y-auto`}>
                        
                        {/* Header y Filtro (Estilo del archivo de diseño) */}
                        <div className="bg-white rounded-xl shadow-lg mb-6 p-4 sticky top-0 z-10">
                            {/* ... Header Content ... */}
                        </div>

                        {/* Mensaje de Error (Acceso Denegado) */}
                        <div className="text-center mt-12 p-10 bg-red-50 rounded-xl shadow-lg text-red-700 border-l-4 border-red-500">
                            <p className="font-extrabold text-3xl sm:text-4xl">
                                🚫 Error: No tienes permisos para acceder a esta sección.
                            </p>
                            <p className="mt-4 text-lg">
                                Tu rol actual es: **{rol}**. Si crees que esto es un error, contacta a un administrador.
                            </p>
                            <button 
                                onClick={() => window.location.replace('/punto_de_venta')}
                                className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                            >
                                Ir a Punto de Venta
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Caso 2: Usuario Administrador (Acceso Completo)
        return (
            <>
                {
                    isAuthenticated ? ( 
                        <div className="bg-gray-100 font-sans h-screen overflow-hidden">
                            <Toaster />
                            
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
                                        <h1 className="text-xl font-bold text-yellow-300">Super Abarrotes</h1>
                                        <button onClick={this.toggleNavbar} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <ul className="space-y-3 flex-grow">
                                        {/* Menú de Navegación */}
                                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                            onClick={() => window.location.replace('/punto_de_venta')}><ShoppingBag className="w-5 h-5 mr-3" /><span>Punto de Venta</span></li>
                                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                            onClick={() => window.location.replace('/inventario')}><Package className="w-5 h-5 mr-3" /><span>Inventario</span></li>
                                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                            onClick={() => window.location.replace('/compras')}><DollarSign className="w-5 h-5 mr-3" /><span>Compras</span></li>
                                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                            onClick={() => window.location.replace('/usuarios')} ><Users className="w-5 h-5 mr-3" /><span>Administración de Usuarios</span></li>
                                        <li className="flex items-center p-3 rounded-lg bg-indigo-700 text-yellow-300 transition-colors">
                                            <Truck className="w-5 h-5 mr-3" /><span>Administración de Proveedores</span></li>
                                        <li className="flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
                                            onClick={() => window.location.replace('/corte_de_caja')} ><CalendarDays className="w-5 h-5 mr-3" /><span>Corte de Caja</span></li>
                                    </ul>
                                    <div className="mt-8 pt-4 border-t border-indigo-700">
                                        <div className="flex items-center p-3 rounded-lg hover:bg-red-700/50 cursor-pointer transition-colors">
                                            <LogOut className="w-5 h-5 mr-3" /><Logout />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido Principal (UI) - Aquí se usa refreshKey */}
                            <div className={`p-4 md:p-8 transition-all duration-300 md:ml-64 h-screen overflow-y-auto`}>
                                
                                {/* Header y Opciones */}
                                <div className="bg-white rounded-xl shadow-lg mb-6 p-4 sticky top-0 z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <button onClick={this.toggleNavbar} className="md:hidden p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                                <Menu className="w-6 h-6" />
                                            </button>
                                            <h2 className="text-2xl font-extrabold text-indigo-800 flex items-center">
                                                <Truck className="w-7 h-7 mr-2 text-yellow-500" />
                                                Administración de Proveedores
                                            </h2>
                                        </div>

                                        <div className="flex items-center space-x-2 text-sm">
                                            <Users className="w-5 h-5 text-gray-500" />
                                            <span className="font-semibold" style={{ color: '#000000' }}><GetUser /></span>
                                        </div>
                                    </div>

                                    {/* Botón de Alta Proveedores */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end" id='opciones'>
                                        <button
                                            onClick={this.openAltaModal}
                                            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-150 transform hover:scale-[1.02]"
                                        >
                                            Dar de Alta Proveedor
                                        </button>
                                    </div>
                                </div>

                                {/* Componente de la Tabla de Datos */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Listado de Proveedores</h3>
                                    {/* 🔑 PASAMOS refreshKey para que DataTableComponent sepa cuándo recargar */}
                                    <DataTableComponent key={refreshKey} />
                                </div>
                            </div>

                            {/* MODAL RENDERIZADO */}
                            {showAltaModal && <AltaProveedoresModal closeModal={this.closeAltaModal} />}
                        </div>
                    )
                        :
                        // Pantalla de Carga/No Autenticado (Fallback)
                        <div className="flex items-center justify-center h-screen bg-gray-100">
                            <p className="text-xl font-medium text-indigo-700">Verificando sesión...</p>
                        </div>
                }
            </>
        );
    }
}

export default Admin_provedores;