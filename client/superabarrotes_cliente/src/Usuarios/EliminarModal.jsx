import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// Icono de advertencia/peligro
const AlertTriangle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
// Ícono X para cerrar
const X = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

function EliminarModal({ closeModal, usuario}) {
    const [values, setValues] = useState({
        usuario: '',
        nombre: '',
        apellido_materno: '',
        apellido_paterno: '',
        rol: ''
    });
    const [loadingData, setLoadingData] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false); // Nuevo estado para la eliminación

    // Bloqueo de Scroll (Manteniendo la lógica del modal de Alta)
    useEffect(() => {
        const body = document.body;
        const originalOverflow = body.style.overflow;
        const originalPaddingRight = body.style.paddingRight;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollBarWidth > 0) {
            body.style.paddingRight = `${scrollBarBarWidth}px`;
        }
        return () => {
            body.style.overflow = originalOverflow;
            body.style.paddingRight = originalPaddingRight;
        };
    }, []);

    // 🛑 Lógica de Eliminación Corregida
    const handleDelete = async (usuario) => {
        setLoadingDelete(true);
        try {
            const res = await axios.delete(`http://localhost:8081/deleteUsuario/${usuario}`);
            
            if (res.status === 200) {
                toast.success(`Usuario ${usuario} eliminado con éxito.`);
                // 🛑 CORRECTO: Llamar a closeModal(true) para recargar la tabla y cerrar el modal.
                closeModal(true); 
            } else {
                console.error('Error eliminando el usuario:', res.data);
                toast.error(res.data.Error || 'Error desconocido al eliminar.');
                setLoadingDelete(false);
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            toast.error('Error de conexión o del servidor al eliminar.');
            setLoadingDelete(false);
        }
    }

    // Obtener datos del usuario
    useEffect(() => {
        if (usuario) {
            setLoadingData(true);
            axios.get(`http://localhost:8081/GetUserData/${usuario}`)
                .then(res => {  
                    if (res.status === 200 && res.data) {
                        setValues({
                            usuario: res.data.usuario,
                            nombre: res.data.Nombre,
                            apellido_materno: res.data.apellido_materno,
                            apellido_paterno: res.data.apellido_paterno,
                            rol: res.data.rol
                        });
                        setLoadingData(false);
                    } else {
                        toast.error(res.data.Error || 'No se encontraron datos del usuario.');
                        setLoadingData(false);
                    }
                })
                .catch((error) => {
                    toast.error('Error obteniendo los datos del usuario, recargue la página');
                    console.error(error);
                    setLoadingData(false);
                });
        }
    }, [usuario]);

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal(false);
        }
    };

    return (
        <>
            <Toaster />
            {/* Fondo del Modal (Tailwind CSS) */}
            <div
                onClick={handleBackgroundClick}
                style={{
                    position: 'fixed', zIndex: 999999, top: 0, left: 0,
                    height: '100vh', width: '100vw', display: 'flex',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(17, 24, 39, 0.75)' // bg-gray-900 con opacidad
                }}
            >
                {/* Contenedor del Modal (Tailwind CSS) */}
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 p-0"
                    style={{ width: '500px', maxWidth: '90vw' }} 
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Header de Advertencia - Rojo */}
                    <div className="p-4 sm:p-6 bg-red-600 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-300 mr-3" />
                            <h3 className="text-xl font-bold text-white">Confirmación de Eliminación</h3>
                        </div>
                        <button
                            className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                            onClick={() => closeModal(false)}
                            disabled={loadingDelete}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Cuerpo del Modal */}
                    <div className="p-6 text-center">
                        <p className="text-xl font-semibold text-gray-800 mb-4">
                            ¿Estás seguro de que deseas eliminar a este usuario?
                        </p>
                        
                        {loadingData ? (
                            <p className="text-indigo-600 font-medium my-4">Cargando datos...</p>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6 text-left">
                                <ul className="text-gray-700 text-lg space-y-1">
                                    <li className="font-bold">Usuario: <span className="font-normal">{values.usuario}</span></li>
                                    <li className="font-bold">Nombre: <span className="font-normal">{`${values.nombre} ${values.apellido_paterno} ${values.apellido_materno}`}</span></li>
                                    <li className="font-bold">Rol: <span className="font-normal">{values.rol}</span></li>
                                </ul>
                            </div>
                        )}
                        
                        <p className="text-red-600 text-xl font-extrabold mb-6">
                            ¡Esta acción no puede deshacerse!
                        </p>

                        {/* Botones de Acción */}
                        <div className='flex justify-center space-x-4 pt-2'>
                            {/* Botón NO (Cancelar) */}
                            <button
                                type='button'
                                className='px-6 py-2 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition duration-150 disabled:opacity-50'
                                onClick={() => closeModal(false)}
                                disabled={loadingDelete || loadingData} 
                            >
                                No (Cancelar)
                            </button>
                            
                            {/* Botón SÍ (Eliminar) */}
                            <button
                                type='button'
                                disabled={loadingDelete || loadingData} 
                                onClick={() => handleDelete(values.usuario)}
                                className='px-6 py-2 text-lg font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition duration-150 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400'
                            >
                                {loadingDelete ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Eliminando...
                                    </>
                                ) : (
                                    'Sí, Eliminar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

EliminarModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    usuario: PropTypes.string.isRequired,
};

export default EliminarModal;