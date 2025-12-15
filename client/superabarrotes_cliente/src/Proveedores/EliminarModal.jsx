import PropTypes from 'prop-types';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Icono de X (Cerrar)
const X = (props) => (
    <svg {...props} stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// Icono de Advertencia / Eliminación
const AlertTriangle = (props) => (
    <svg {...props} stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

// NOTA: closeModal ahora acepta un booleano (true para recargar la tabla)
function EliminarProveedorModal({ closeModal, codigo }) {
    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        contacto: '',
        telefono: '',
        direccion: '',
    });
    const [loading, setLoading] = useState(false);

    // 1. Bloqueo de scroll
    useEffect(() => {
        const body = document.body;
        const originalOverflow = body.style.overflow;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollBarWidth > 0) {
            body.style.paddingRight = `${scrollBarWidth}px`;
        }

        return () => {
            body.style.overflow = originalOverflow;
            body.style.paddingRight = ''; // Restaura el padding
        };
    }, []);

    // 2. Obtener los datos del proveedor al abrir el modal
    useEffect(() => {
        if (!codigo) return;

        const fetchProveedorData = async () => {
            try {
                // Asume la misma estructura de URL: GetProveedorData
                const res = await axios.get(`http://localhost:8081/GetProveedor/${codigo}`);
                
                if (res.status === 200 && res.data) {
                    const prov = res.data;
                    setValues({
                        // Usamos || '' para evitar warnings y asegurar que el estado se inicialice
                        codigo: prov.codigo || '',
                        nombre: prov.nombre || '',
                        contacto: prov.contacto || '',
                        telefono: prov.telefono || '',
                        direccion: prov.direccion || '',
                    });
                } else {
                    toast.error(res.data?.Error || 'Error al obtener los datos del proveedor.');
                    closeModal(false); // Cierra si falla la carga
                }
            } catch (error) {
                toast.error('Error de conexión al obtener los datos.');
                console.error(error);
                closeModal(false); // Cierra si falla la conexión
            }
        };

        fetchProveedorData();
    }, [codigo, closeModal]);

    // 3. Eliminar proveedor y notificar recarga
    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await axios.delete(`http://localhost:8081/deleteProveedor/${values.codigo}`);
            
            if (res.status === 200) {
                toast.success('Proveedor eliminado correctamente.');
                // ⭐️ CAMBIO CLAVE: Llama a closeModal(true) para recargar la tabla padre
                closeModal(true); 
            } else {
                toast.error(res.data?.Error || 'Error al eliminar el proveedor.');
                closeModal(false); // Cierra sin recargar si hay error
            }
        } catch (error) {
            toast.error('No se pudo eliminar el proveedor. Error de conexión.');
            console.error(error);
            closeModal(false); // Cierra sin recargar si hay error
        } finally {
            setLoading(false);
        }
    };
    
    // Maneja el click fuera del modal
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal(false); // Cierra sin recargar
        }
    };


    return (
        <>
            <Toaster position="top-center" />
            
            {/* Fondo Oscuro y Posicionamiento Fijo (Simula modalBackground) */}
            <div
                onClick={handleBackgroundClick}
                style={{
                    position: 'fixed',
                    zIndex: 999999,
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: '100vw',
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center', 
                    backgroundColor: 'rgba(17, 24, 39, 0.75)'
                }}
            >
                {/* Contenedor del Modal (Simula modalContainer con estilo moderno) */}
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
                    style={{ width: '500px', maxWidth: '90vw' }}
                    onClick={(e) => e.stopPropagation()} 
                >
                    {/* Header - Usamos el color de alerta (rojo) para la eliminación */}
                    <div className="bg-red-600 text-white p-5 flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-2" />
                            Confirmación de Eliminación
                        </h3>
                        <button
                            onClick={() => closeModal(false)}
                            className="p-2 rounded-full hover:bg-red-500 transition-colors disabled:opacity-50"
                            aria-label="Cerrar modal"
                            disabled={loading}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Cuerpo del Modal (Simula forms) */}
                    <div className="p-6 space-y-6 flex flex-col items-center text-center">
                        <p className='text-gray-700 text-lg font-semibold'>
                            ¿Estás seguro de que deseas eliminar permanentemente este proveedor?
                        </p>

                        {/* Detalle del proveedor a eliminar */}
                        <div className='bg-red-50 border border-red-200 p-4 rounded-lg w-full'>
                            <ul className='text-sm text-gray-800 space-y-1 text-left'>
                                <li><strong>Código:</strong> {values.codigo}</li>
                                <li><strong>Nombre:</strong> {values.nombre}</li>
                                {/* Asumo que los campos Contacto y Teléfono son relevantes para la confirmación */}
                                <li><strong>Contacto:</strong> {values.contacto}</li>
                                <li><strong>Teléfono:</strong> {values.telefono}</li>
                            </ul>
                        </div>

                        <p className='text-red-700 text-xl font-extrabold'>
                            Esta acción no puede deshacerse
                        </p>

                        {/* Botones de Acción */}
                        <div className='pt-4 border-t border-gray-100 flex justify-center space-x-6 w-full'>
                            <button 
                                type='button' 
                                onClick={() => closeModal(false)} // Cierra sin recargar
                                disabled={loading}
                                className="px-5 py-2 text-base font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 disabled:opacity-50"
                            >
                                No (Cancelar)
                            </button>
                            <button 
                                type='button'
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-6 py-2 text-base font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Eliminando...
                                    </>
                                ) : (
                                    'Sí (Eliminar)'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

EliminarProveedorModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    codigo: PropTypes.string, // puede ser null al inicio
};

export default EliminarProveedorModal;