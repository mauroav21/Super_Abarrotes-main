import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// ----------------------------------------------------
// ICONOS SVG (sin cambios)
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
// Componente de Reutilización (InputGroup) (sin cambios)
// ----------------------------------------------------
const InputGroup = ({ label, name, value, onChange, onKeyDown, type = "text", required = false, disabled = false, step = "any", min = "0" }) => {
    // Controlar la visualización de valores numéricos como string
    const displayValue = (type === 'number' && typeof value === 'number') ? value.toString() : (value || '');

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
                {label}
            </label>
            <input className={`w-full p-2.5 border rounded-lg transition duration-150 ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                required={required} id={name} name={name} type={type}
                value={displayValue} onChange={onChange} onKeyDown={onKeyDown} disabled={disabled}
                step={step} min={min}
            />
        </div>
    );
};
InputGroup.propTypes = {
    label: PropTypes.string.isRequired, name: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired, onKeyDown: PropTypes.func, type: PropTypes.string,
    required: PropTypes.bool, disabled: PropTypes.bool, step: PropTypes.string, min: PropTypes.string,
};
// ----------------------------------------------------


function ModificacionProductosModal({ closeModal, codigo }) {

    // ----------------------------------------------------
    // 1. ESTADO DEL FORMULARIO Y CARGA (sin cambios)
    // ----------------------------------------------------
    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        cantidad_minima: '',
        cantidad: '',
    });
    const [loading, setLoading] = useState(false); // Para carga de datos y envío
    const [loadError, setLoadError] = useState(null); // Error de carga inicial

    // ----------------------------------------------------
    // 2. BLOQUEO DE SCROLL Y CLIC EN EL FONDO (sin cambios)
    // ----------------------------------------------------
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
    // 3. CARGA DE DATOS INICIALES (useEffect) (sin cambios)
    // ----------------------------------------------------
    useEffect(() => {
        if (codigo) {
            setLoading(true);
            setLoadError(null);
            axios.get(`http://localhost:8081/getProducto/${codigo}`)
                .then(res => {
                    if (res.data.Status === 'Exito' && res.data.Producto) {
                        setValues({
                            codigo: res.data.Producto.codigo || '',
                            nombre: res.data.Producto.nombre || '',
                            // Asegurarse de que precio se cargue como string o number, pero sin forzar a entero aquí
                            precio: res.data.Producto.precio || '', 
                            cantidad_minima: res.data.Producto.cantidad_minima || '',
                            cantidad: res.data.Producto.cantidad || '', // solo lectura
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
    // 4. MANEJO DEL ENVÍO DEL FORMULARIO (handleSubmit) (sin cambios)
    // ----------------------------------------------------
    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        // Los campos a enviar son los modificables
        const { codigo, nombre, precio, cantidad_minima } = values;
        const dataToSend = { 
             codigo, 
             nombre, 
             // Asegurarse de enviar números enteros
             precio: parseInt(precio, 10) || 0, 
             cantidad_minima: parseInt(cantidad_minima, 10) || 0 
        };

        try {
            const res = await axios.post('http://localhost:8081/modificarProducto', dataToSend);
            setLoading(false);

            if (res.data.Status === 'Exito') {
                const serverMessage = res.data?.message || 'Producto modificado con éxito';

                if (serverMessage.includes('No se detectaron cambios')) {
                    toast('⚠️ No se detectaron cambios para guardar.', { icon: '💡' });
                    setTimeout(() => closeModal(false), 1500); // Cierra sin recargar
                } else {
                    localStorage.setItem('showToast', serverMessage);
                    window.location.reload(); // Recarga la página para refrescar la tabla
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
    // 5. MANEJO DE CAMBIOS Y TECLAS (CORREGIDO)
    // ----------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Lógica de limpieza y truncamiento
        switch (name) {
            case 'nombre':
                newValue = value.slice(0, 35);
                break;
            case 'precio':
                // ************ CORRECCIÓN APLICADA ************
                // FORZAR ENTEROS: Solo números, eliminando cualquier caracter que no sea dígito.
                newValue = value.replace(/[^0-9]/g, ''); 
                newValue = newValue.slice(0, 10);
                break;
            case 'cantidad_minima':
                // FORZAR ENTEROS POSITIVOS: Solo números sin decimales (ya estaba correcto)
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
        
        // Prevenir el signo de menos en campos numéricos
        if (['precio', 'cantidad_minima'].includes(name) && e.key === '-') {
             e.preventDefault();
        }
        
        // Prevenir el punto decimal en el campo precio
        if (name === 'precio' && e.key === '.') {
             e.preventDefault();
        }

        // Prevenir caracteres especiales en nombre (excepto espacios, acentos, ñ)
        if (name === 'nombre') {
            const forbiddenKeys = /[-?!@#$%^&*()+={\[}\]:;"'<>,./\\]/;

            if (forbiddenKeys.test(e.key) && e.key.length === 1) {
                e.preventDefault();
            }
        }
    };

    // ----------------------------------------------------
    // 6. RENDERIZADO CONDICIONAL (sin cambios)
    // ----------------------------------------------------
    // ... (El código de renderizado condicional es largo y se omite por brevedad)

    return (
        <>
            <Toaster />
            {/* Fondo Oscuro y Posicionamiento Forzado */}
            <div
                onClick={handleBackgroundClick}
                style={{
                    position: 'fixed', zIndex: 999999, top: 0, left: 0,
                    height: '100vh', width: '100vw', display: 'flex',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(17, 24, 39, 0.75)'
                }}
            >
                {/* Contenedor del Modal */}
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
                    style={{ width: '600px', maxWidth: '90vw' }} 
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Header - Color Indigo (sin cambios) */}
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

                    {/* Formulario */}
                    <div className="p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className='space-y-5'>

                            {/* Fila 1: Nombre y Código (Solo Lectura) (sin cambios) */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                <InputGroup label="Nombre del Producto" name="nombre" value={values.nombre} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading} maxLength="35"/>
                                
                                {/* Código no editable (Estilo mejorado) (sin cambios) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código (No Editable)</label>
                                    <div className="w-full bg-gray-100 text-gray-800 font-semibold p-2.5 rounded-lg border border-gray-300 select-none cursor-not-allowed">
                                        {values.codigo || 'Cargando...'}
                                    </div>
                                </div>
                            </div>

                            {/* Fila 2: Precio (CORREGIDO) y Cantidad Mínima */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                <InputGroup 
                                    label="Precio ($)" name="precio" type="number" 
                                    // step="1" para asegurar que la validación nativa solo acepte enteros
                                    step="1" 
                                    min="0" 
                                    value={values.precio} onChange={handleChange} onKeyDown={handleKeyDown} 
                                    required={true} disabled={loading}
                                />
                                <InputGroup 
                                    label="Cantidad Mínima" name="cantidad_minima" type="number" 
                                    value={values.cantidad_minima} onChange={handleChange} onKeyDown={handleKeyDown} 
                                    required={true} disabled={loading} min="0" step="1"
                                />
                            </div>

                            {/* Fila 3: Cantidad Actual (Solo Lectura) (sin cambios) */}
                            <div className='pt-2'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Actual en Stock (Solo Lectura)</label>
                                <InputGroup 
                                    label="" name="cantidad" type="number" 
                                    value={values.cantidad} 
                                    onChange={() => {}} // No permitir cambio
                                    disabled={true} // Siempre deshabilitado
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Para modificar la cantidad de stock, use las opciones de Entrada/Salida en la tabla principal.
                                </p>
                            </div>

                            {/* Botones de Acción (sin cambios) */}
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
// PropTypes (sin cambios)
// ----------------------------------------------------

ModificacionProductosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    codigo: PropTypes.string.isRequired,
};

export default ModificacionProductosModal;