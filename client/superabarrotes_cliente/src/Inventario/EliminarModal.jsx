import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import ConfirmacionModal from './ConfirmacionModal';
// No necesitas importar './Modal.css' si usas Tailwind

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


function EliminarModal({ closeModal, codigo}) {
    const [openConfirmModal, setOpenConfirmModal] = useState(false); // Renombrado para claridad
    const [loadingData, setLoadingData] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);
    
    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        cantidad: 0, // Usar 0 como default numérico
        cantidad_minima: '',
    });

    // ----------------------------------------------------------------------
    // 1. Manejo de la Eliminación (Diferencia si hay stock o no)
    // ----------------------------------------------------------------------
    const handleDelete = async (codigo) => {
        // Si la cantidad es 0 o menor, eliminamos directamente
        if(values.cantidad <= 0){
            setLoadingDelete(true);
            try {
                const res = await axios.delete(`http://localhost:8081/deleteProducto/${codigo}`);
                
                if (res.status === 200) {
                    localStorage.setItem('showToast', 'Producto eliminado con éxito');
                    // Recarga la página
                    window.location.replace('/inventario'); 
                } else {
                    toast.error(res.data.Error || 'Error desconocido al eliminar el producto.');
                    console.error('Error eliminando el producto:', res.data);
                    setLoadingDelete(false);
                }
            }catch (error) {
                toast.error('Error de conexión o del servidor al eliminar.');
                console.error('Error deleting data:', error);
                setLoadingDelete(false);
            }
        }else{
            // Si hay stock, abrimos el modal de confirmación forzada
            setOpenConfirmModal(true);
        }
    }
    
    // Función para cerrar el modal de Confirmación forzada
    const handleCloseConfirmModal = () => {
        setOpenConfirmModal(false);
    };

    // ----------------------------------------------------------------------
    // 2. Obtener datos del producto
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (codigo) {
            setLoadingData(true);
            axios.get(`http://localhost:8081/getProducto/${codigo}`)
                .then(res => {  
                    if (res.data.Status === 'Exito' && res.data.Producto) {
                        setValues({
                            codigo: res.data.Producto.codigo,
                            nombre: res.data.Producto.nombre,
                            precio: res.data.Producto.precio,
                            cantidad: res.data.Producto.cantidad,
                            cantidad_minima: res.data.Producto.cantidad_minima,
                        });
                        setLoadingData(false);
                    } else {
                        toast.error(res.data.Error || 'No se encontraron datos del producto.');
                        setLoadingData(false);
                    }
                })
                .catch((error) => {
                    toast.error('Error obteniendo los datos del producto, recargue la página');
                    console.error(error);
                    setLoadingData(false);
                });
        }
    }, [codigo]);

    // Bloqueo de Scroll
    useEffect(() => {
        const body = document.body;
        body.style.overflow = 'hidden';
        return () => {
            body.style.overflow = '';
        };
    }, []);

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal(false);
        }
    };
    
    // Determinar el mensaje y el color de advertencia
    const hasStock = values.cantidad > 0;

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
                    backgroundColor: 'rgba(17, 24, 39, 0.75)'
                }}
            >
                {/* Contenedor del Modal (Tailwind CSS) */}
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 p-0"
                    style={{ width: '550px', maxWidth: '90vw' }} 
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Header de Advertencia - Rojo */}
                    <div className="p-4 sm:p-6 bg-red-600 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-300 mr-3" />
                            <h3 className="text-xl font-bold text-white">
                                Confirmación de Eliminación de Producto
                            </h3>
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
                            ¿Estás seguro de que deseas eliminar este producto del inventario?
                        </p>
                        
                        {loadingData ? (
                            <p className="text-indigo-600 font-medium my-4">Cargando datos...</p>
                        ) : (
                            <div className={`p-4 rounded-lg border mb-6 text-left ${hasStock ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'}`}>
                                <ul className="text-gray-700 text-lg space-y-1">
                                    <li className="font-bold">Producto: <span className="font-normal">{values.nombre}</span></li>
                                    <li className="font-bold">Código: <span className="font-normal">{values.codigo}</span></li>
                                    <li className="font-bold">Precio: <span className="font-normal">${parseFloat(values.precio).toFixed(2)}</span></li>
                                    <li className={`font-bold ${hasStock ? 'text-yellow-700' : 'text-red-700'}`}>
                                        Stock Actual: <span className="font-extrabold text-xl">{values.cantidad}</span> unidad(es)
                                    </li>
                                </ul>
                            </div>
                        )}
                        
                        <p className="text-red-600 text-xl font-extrabold mb-6">
                            ¡Esta acción es irreversible y podría afectar el registro de ventas!
                        </p>

                        {/* Botones de Acción */}
                        <div className='flex justify-center space-x-4 pt-2'>
                            {/* Botón CANCELAR */}
                            <button
                                type='button'
                                className='px-6 py-2 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition duration-150 disabled:opacity-50'
                                onClick={() => closeModal(false)}
                                disabled={loadingDelete || loadingData} 
                            >
                                Cancelar
                            </button>
                            
                            {/* Botón ACEPTAR (Llama a handleDelete) */}
                            <button
                                type='button'
                                disabled={loadingDelete || loadingData} 
                                onClick={() => handleDelete(values.codigo)}
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
                                    'Aceptar (Eliminar)'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal de Confirmación Forzada (si hay stock) */}
            {openConfirmModal && (
                <ConfirmacionModal 
                    closeModal={handleCloseConfirmModal} 
                    codigo={values.codigo}
                />
            )}
        </>
    );
}

EliminarModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    codigo: PropTypes.string.isRequired,
};

export default EliminarModal;