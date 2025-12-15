// AltaProveedoresModal.jsx (CÓDIGO FINAL CON max-w-6xl)

import PropTypes from 'prop-types';
import axios from 'axios'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'; 

// Definición de íconos (X y Truck)
const baseIconProps = {
    stroke: "currentColor",
    fill: "none",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
};

const X = (props) => (
    <svg {...props} {...baseIconProps} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const Truck = (props) => (
    <svg {...props} {...baseIconProps} viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><path d="M16 8h4l3 3v5h-4" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
);


function AltaProveedoresModal({ closeModal }) {
    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        telefono: '',
        correo: ''
    });
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. BLOQUEO DE SCROLL
    useEffect(() => {
        const body = document.body;
        const originalOverflow = body.style.overflow;
        const originalPaddingRight = body.style.paddingRight;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden'; 
        if (scrollBarWidth > 0) {
            body.style.paddingRight = `${scrollBarWidth}px`;
        }

        return () => {
            body.style.overflow = originalOverflow;
            body.style.paddingRight = originalPaddingRight;
        };
    }, []);

    // 2. MANEJO DE ESTADO Y SUBMIT (Código omitido por brevedad, es el mismo)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSubmit = (event) => {
        event.preventDefault();
        setLocalError('');

        if (!values.codigo || !values.nombre || !values.telefono || !values.correo) {
            setLocalError('Todos los campos son obligatorios.');
            return;
        }

        if (values.correo && !emailRegex.test(values.correo)) {
            setLocalError('Error: El formato del correo electrónico no es válido.');
            return;
        }
        if (!/^\d{10}$/.test(values.telefono)) {
            setLocalError('Error: El campo Teléfono debe contener exactamente 10 dígitos y solo números.');
            return;
        }
        
        setLoading(true);

        axios.post('http://localhost:8081/insertarProveedor', values)
            .then(res => {
                setLoading(false);
                if (res.status === 200 && !res.data.Error) {
                    toast.success(res.data.message || 'Proveedor registrado con éxito');
                    closeModal(true);
                } else if (res.data.Error) {
                    setLocalError(res.data.Error);
                } else {
                    setLocalError('Error desconocido al registrar el proveedor.');
                }
            })
            .catch(err => {
                setLoading(false);
                console.error("Error en la solicitud POST:", err);
                setLocalError('Error de conexión con el servidor. Intente más tarde.');
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (localError) setLocalError('');

        switch (name) {
            case 'nombre':
                newValue = value.slice(0, 50);
                break;
            case 'telefono':
                newValue = value.replace(/\D/g, '').slice(0, 10);
                break;
            case 'correo':
                newValue = value.slice(0, 50);
                break;
            case 'codigo':
                newValue = value.slice(0, 10);
                break;
            default:
                break;
        }

        setValues({ ...values, [name]: newValue });
    };

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal(false);
        }
    };

    // 3. RENDERIZADO CON ESTILOS TAILWIND MODERNOS
    return (
        // Fondo Oscuro y Posicionamiento Forzado (CSS Inline)
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
            {/* Contenedor del Modal (Ancho Extremo: max-w-6xl) */}
            <div
                className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100" // <--- CAMBIO CLAVE AQUÍ
                style={{ width: '600px', maxWidth: '90vw' }}
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="bg-indigo-700 text-white p-5 flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center">
                        <Truck className="w-5 h-5 mr-2" />
                        Alta de Proveedores
                    </h3>
                    <button
                        onClick={() => closeModal(false)}
                        className="p-2 rounded-full hover:bg-indigo-600 transition-colors disabled:opacity-50"
                        aria-label="Cerrar modal"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Formulario (Mantiene el mismo formato de dos columnas) */}
                <form onSubmit={handleSubmit} className='p-6 space-y-4'> 
                    {/* INPUTS ROW 1: Código y Nombre */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='flex flex-col'>
                            <label className="text-sm font-medium text-gray-700 mb-1" htmlFor='codigo'>Código</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                                required
                                id="codigo"
                                name='codigo'
                                type='text'
                                maxLength='10'
                                value={values.codigo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className="text-sm font-medium text-gray-700 mb-1" htmlFor='nombre'>Nombre</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                                required
                                id="nombre"
                                name='nombre'
                                type='text'
                                maxLength='50'
                                value={values.nombre}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* INPUTS ROW 2: Teléfono y Correo */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='flex flex-col'>
                            <label className="text-sm font-medium text-gray-700 mb-1" htmlFor='telefono'>Teléfono (10 dígitos)</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                                required
                                id="telefono"
                                name='telefono'
                                type='tel'
                                maxLength='10'
                                value={values.telefono}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className="text-sm font-medium text-gray-700 mb-1" htmlFor='correo'>Correo</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                                required
                                id="correo"
                                name='correo'
                                type='email'
                                maxLength='50'
                                value={values.correo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Muestra el error */}
                    {localError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm" role="alert">
                            {localError}
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className='pt-4 border-t border-gray-100 flex justify-end space-x-3'>
                        <button 
                            type='button' 
                            onClick={() => closeModal(false)}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            type='submit'
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                'Aceptar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

AltaProveedoresModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default AltaProveedoresModal;