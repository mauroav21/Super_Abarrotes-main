import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// ----------------------------------------------------
// ICONOS SVG
// ----------------------------------------------------
const X = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const Box = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.01V12" />
    </svg>
);

// ----------------------------------------------------
// Componente de Reutilización (InputGroup)
// ----------------------------------------------------
const InputGroup = ({ label, name, value, onChange, onKeyDown, type = "text", required = false, disabled = false, step = "any", min = "0", maxLength }) => {
    const displayValue = (typeof value === 'number' && !isNaN(value)) ? value.toString() : (value || '');

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
                {label}
            </label>
            <input className={`w-full p-2.5 border rounded-lg transition duration-150 ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                required={required} id={name} name={name} type={type}
                value={displayValue} onChange={onChange} onKeyDown={onKeyDown} disabled={disabled}
                step={step} min={min} maxLength={maxLength}
            />
        </div>
    );
};
InputGroup.propTypes = {
    label: PropTypes.string.isRequired, name: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired, onKeyDown: PropTypes.func, type: PropTypes.string,
    required: PropTypes.bool, disabled: PropTypes.bool, step: PropTypes.string, min: PropTypes.string,
    maxLength: PropTypes.string,
};
// ----------------------------------------------------


function ModificacionProductosModal({ closeModal, codigo }) {

    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        cantidad_minima: '',
        cantidad: '', // Stock actual
    });
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Bloqueo de scroll y manejo de clic en el fondo (correcto)
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

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal(false);
        }
    };


    // ----------------------------------------------------
    // CARGA DE DATOS INICIALES
    // ----------------------------------------------------
    useEffect(() => {
        if (codigo) {
            setLoading(true);
            setLoadError(null);
            axios.get(`http://localhost:8081/getProducto/${codigo}`)
                .then(res => {
                    if (res.data.Status === 'Exito' && res.data.Producto) {
                        
                        let rawPrice = String(res.data.Producto.precio || 0);

                        // Lógica de limpieza: Remover .0 o .00 si existen
                        if (rawPrice.includes('.') && Number(rawPrice) === Math.floor(Number(rawPrice))) {
                             rawPrice = String(Math.floor(Number(rawPrice)));
                        }
                        // La limpieza previa era:
                        // if (rawPrice.endsWith('.00')) { rawPrice = rawPrice.slice(0, -3); } 
                        // else if (rawPrice.endsWith('.0')) { rawPrice = rawPrice.slice(0, -2); }
                        // La nueva simplificación es más robusta si el precio es un entero.

                        setValues({
                            codigo: res.data.Producto.codigo || '',
                            nombre: res.data.Producto.nombre || '',
                            precio: rawPrice, 
                            cantidad_minima: String(res.data.Producto.cantidad_minima || 0), 
                            cantidad: String(res.data.Producto.cantidad || 0), // STOCK ACTUAL
                        });
                    } else {
                        toast.error(res.data.Error || 'Datos del producto incompletos o incorrectos.');
                        setLoadError('No se pudieron cargar los datos del producto. Intente de nuevo.');
                    }
                })
                .catch((error) => {
                    console.error("Error al cargar datos del producto:", error);
                    toast.error('Error obteniendo los datos del producto, revise la conexión.');
                    setLoadError('Error al conectar con el servidor o al obtener los datos.');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [codigo]);

    // ----------------------------------------------------
    // MANEJO DEL ENVÍO DEL FORMULARIO (CORRECCIÓN IMPLEMENTADA)
    // ----------------------------------------------------
    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        // 🛑 CRÍTICO: Incluir 'cantidad' (stock actual)
        const { codigo, nombre, precio, cantidad_minima, cantidad } = values; 
        
        const dataToSend = { 
             codigo, 
             nombre, 
             precio: parseFloat(precio) || 0, 
             cantidad_minima: parseInt(cantidad_minima, 10) || 0,
             cantidad: parseInt(cantidad, 10) || 0 // 🛑 Asegura que el stock actual se envíe como ENTERO
        };

        try {
            const res = await axios.post('http://localhost:8081/modificarProducto', dataToSend);
            setLoading(false);

            if (res.data.Status === 'Exito') {
                const serverMessage = res.data?.message || 'Producto modificado con éxito';

                if (serverMessage.includes('No se detectaron cambios')) {
                    toast('⚠️ No se detectaron cambios para guardar.', { icon: '💡' });
                    setTimeout(() => closeModal(false), 1500);
                } else {
                    // 🛑 ARREGLO DE UX: Muestra el toast aquí
                    toast.success(serverMessage);
                    // Cierra el modal e indica al padre que DEBE recargar
                    closeModal(true); 
                }
            } else {
                toast.error(res.data.Error || 'Error desconocido al modificar.');
            }
        } catch (err) {
            setLoading(false);
            console.error("Error al modificar producto:", err);
            const errorMsg = err.response?.data?.Error || "Error al conectar con el servidor o error desconocido.";
            toast.error(errorMsg);
        }
    };

    // ----------------------------------------------------
    // MANEJO DE CAMBIOS Y TECLAS
    // ----------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case 'nombre':
                newValue = value.slice(0, 35);
                break;
            case 'precio':
                // Permite dígitos, un punto, y limita a dos decimales y longitud 10
                newValue = value.replace(/[^\d.]/g, ''); 
                const parts = newValue.split('.');
                if (parts.length > 2) {
                    newValue = parts[0] + '.' + parts.slice(1).join('');
                }
                if (newValue.includes('.')) {
                    const decimalPart = newValue.substring(newValue.indexOf('.') + 1);
                    if (decimalPart.length > 2) {
                        newValue = newValue.slice(0, newValue.indexOf('.') + 3);
                    }
                }
                newValue = newValue.slice(0, 10);
                break;
            case 'cantidad_minima':
                // Solo enteros, sin decimales ni otros caracteres
                const intValue = value.replace(/[^0-9]/g, '');
                newValue = intValue.slice(0, 5);
                break;
            default:
                break;
        }

        setValues({ ...values, [name]: newValue });
    };

    const handleKeyDown = (e) => {
        const { name } = e.target;
        
        // Prevenir el signo de menos
        if (['precio', 'cantidad_minima'].includes(name) && e.key === '-') {
             e.preventDefault();
        }
        
        // Permite el punto decimal en precio, solo si no existe ya
        if (name === 'precio' && e.key === '.') {
             if (e.target.value.includes('.')) {
                 e.preventDefault();
             }
        }

        // Prevenir caracteres especiales en nombre
        if (name === 'nombre') {
            const forbiddenKeys = /[-?!@#$%^&*()+={\[}\]:;"'<>,./\\]/;
            if (forbiddenKeys.test(e.key) && e.key.length === 1) {
                e.preventDefault();
            }
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    return (
        <>
            <Toaster />
            <div
                onClick={handleBackgroundClick}
                style={{
                    position: 'fixed', zIndex: 999999, top: 0, left: 0,
                    height: '100vh', width: '100vw', display: 'flex',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(17, 24, 39, 0.75)'
                }}
            >
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
                    style={{ width: '600px', maxWidth: '90vw' }} 
                    onClick={(e) => e.stopPropagation()}
                >

                    <div className="p-4 sm:p-6 bg-indigo-700 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <Box className="w-8 h-8 text-yellow-300 mr-3" />
                            <h3 className="text-xl font-bold text-white">Modificación de Producto</h3>
                        </div>
                        <button
                            className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                            onClick={() => closeModal(false)}
                            disabled={loading} 
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className='space-y-5'>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                <InputGroup label="Nombre del Producto" name="nombre" value={values.nombre} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading} maxLength="35"/>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código (No Editable)</label>
                                    <div className="w-full bg-gray-100 text-gray-800 font-semibold p-2.5 rounded-lg border border-gray-300 select-none cursor-not-allowed">
                                        {values.codigo || 'Cargando...'}
                                    </div>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                <InputGroup 
                                    label="Precio ($)" name="precio" 
                                    type="text" 
                                    value={values.precio} onChange={handleChange} onKeyDown={handleKeyDown} 
                                    required={true} disabled={loading} min="0"
                                />
                                <InputGroup 
                                    label="Cantidad Mínima" name="cantidad_minima" 
                                    type="number" 
                                    value={values.cantidad_minima} onChange={handleChange} onKeyDown={handleKeyDown} 
                                    required={true} disabled={loading} min="0" step="1"
                                />
                            </div>

                            {/* Campo de Cantidad Actual: Es importante para el envío, aunque sea solo lectura */}
                            <div className='pt-2'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Actual en Stock (Solo Lectura)</label>
                                <InputGroup 
                                    label="" name="cantidad" type="number" 
                                    value={values.cantidad} 
                                    onChange={() => {}} // No permite cambios, pero se usa en el state
                                    disabled={true} 
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Para modificar la cantidad de stock, use las opciones de Entrada/Salida en la tabla principal.
                                </p>
                            </div>

                            <div className='pt-4 border-t border-gray-100 flex justify-end space-x-3'>
                                <button
                                    type='button'
                                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150 disabled:opacity-50'
                                    onClick={() => closeModal(false)}
                                    disabled={loading} 
                                >
                                    Cancelar
                                </button>
                                <button
                                    type='submit'
                                    disabled={loading} 
                                    className='px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400'
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
                                        'Guardar Cambios'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

// ----------------------------------------------------
// PropTypes
// ----------------------------------------------------

ModificacionProductosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    codigo: PropTypes.string.isRequired,
};

export default ModificacionProductosModal;