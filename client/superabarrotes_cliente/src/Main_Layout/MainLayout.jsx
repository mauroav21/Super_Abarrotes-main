import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { LogOut, ShoppingBag, Package, Users, CalendarDays, DollarSign, Menu, X, Store } from './Icons'; // Asume que exportas tus iconos o los defines aquí
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------
// Nota: Deberías mover la definición de tus SVG Icons (Menu, X, etc.) 
// a un archivo separado (e.g., 'Iconos.jsx') para importarlos aquí.
// ----------------------------------------------------------------------

const LogoutButton = () => {
    const handleLogout = () => {
        toast.success('Sesión Cerrada (Simulación)', { duration: 1500 });
        // Lógica de logout real aquí
        // window.location.replace('/');
    };
    return <span onClick={handleLogout} className="cursor-pointer hover:text-red-300 transition-colors">Cerrar Sesión</span>;
};

/**
 * Componente Layout principal para todas las secciones.
 * Maneja el Sidebar fijo y el área de contenido con scroll.
 * @param {string} currentPage - Nombre de la página actual para resaltar en el menú.
 * @param {React.ReactNode} children - Contenido específico de la página.
 * @returns 
 */
const MainLayout = ({ currentPage, children }) => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const uiRef = useRef(null);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const navItems = [
        { name: 'Punto de Venta', icon: ShoppingBag, path: '/punto_de_venta' },
        { name: 'Inventario', icon: Package, path: '/inventario' },
        { name: 'Compras', icon: DollarSign, path: '/compras' },
        { name: 'Administración de Usuarios', icon: Users, path: '/usuarios' },
        { name: 'Administración de Proveedores', icon: Users, path: '/proveedores' },
        { name: 'Corte de Caja', icon: CalendarDays, path: '/corte_caja' },
    ];

    return (
        // **********************************************************************
        // ESTRUCTURA PRINCIPAL FIJA: h-screen overflow-hidden
        // **********************************************************************
        <div className="bg-gray-100 font-sans h-screen overflow-hidden"> 
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
                        <h1 className="text-xl font-bold text-yellow-300">Super Abarrotes CC</h1>
                        <button onClick={toggleNav} className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <ul className="space-y-3 flex-grow">
                        {/* Renderizar Items de Navegación */}
                        {navItems.map((item) => (
                            <li 
                                key={item.name}
                                className={`flex items-center p-3 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors ${
                                    currentPage === item.name ? 'bg-indigo-700 text-yellow-300' : ''
                                }`}
                                onClick={() => {
                                    // Simula la navegación o usa 'react-router-dom'
                                    // window.location.replace(item.path);
                                    toast.success(`Navegando a: ${item.name}`, { duration: 1500 });
                                }}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                    {/* Logout */}
                    <div className="mt-8 pt-4 border-t border-indigo-700">
                        <div className="flex items-center p-3 rounded-lg hover:bg-red-700/50 cursor-pointer transition-colors">
                            <LogOut className="w-5 h-5 mr-3" />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header / Toggle Móvil */}
            <div className={`p-4 md:p-8 transition-all duration-300 md:ml-64 sticky top-0 z-20 bg-gray-100`}>
                <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center">
                        <button onClick={toggleNav} className="md:hidden p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-extrabold text-indigo-800 flex items-center">
                            <Store className="w-7 h-7 mr-2 text-yellow-500" />
                            {currentPage}
                        </h2>
                    </div>
                    {/* Aquí puedes agregar el componente de usuario si lo necesitas */}
                </div>
            </div>

            {/* **********************************************************************
             * CONTENIDO ESPECÍFICO DE LA PÁGINA: h-screen overflow-y-auto
             * Renderiza el contenido que le pasamos (children).
             ********************************************************************** */}
            <div 
                ref={uiRef} 
                className={`p-4 md:p-8 transition-all duration-300 md:ml-64 pt-0 h-[calc(100vh-80px)] overflow-y-auto`}
                // Ajuste de altura: h-[calc(100vh-80px)] para que el scroll comience después del header
            >
                {children}
            </div>
        </div>
    );
};

MainLayout.propTypes = {
    currentPage: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default MainLayout;