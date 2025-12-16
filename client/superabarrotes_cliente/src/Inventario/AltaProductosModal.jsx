import PropTypes from 'prop-types';
import axios from 'axios'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// ----------------------------------------------------
// 1. ICONOS SVG (Para la cabecera)
// ----------------------------------------------------

// Icono de Producto (Caja o Paquete)
const PackageIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9A2.25 2.25 0 0 1 18.75 7.5v6.75A2.25 2.25 0 0 1 16.5 16.5h-9a2.25 2.25 0 0 1-2.25-2.25V7.5ZM17.25 10.5h-9A1.5 1.5 0 0 0 6.75 12v2.25A1.5 1.5 0 0 0 8.25 15h7.5A1.5 1.5 0 0 0 17.25 13.5V12a1.5 1.5 0 0 0-1.5-1.5Z" />
    </svg>
);

// Ícono X para cerrar
const X = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);


// ----------------------------------------------------
// 2. COMPONENTE PRINCIPAL (AltaProductosModal)
// ----------------------------------------------------

function AltaProductosModal({ closeModal }) {
    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        cantidad: 0, 
        cantidad_minima: '',
    });

    const [loading, setLoading] = useState(false);

    // Centrado del modal al hacer clic fuera
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const dataToSend = {
            ...values,
            cantidad: 0,
            // Aseguramos que los números sean tipos numéricos (necesario para el backend)
            precio: parseFloat(values.precio) || 0,
            cantidad_minima: parseInt(values.cantidad_minima, 10) || 0,
        };

        axios.post('http://localhost:8081/insertarProducto', dataToSend)
            .then(res => {
                setLoading(false);
                if (res.data.Status === 'Exito') {
                    toast.success('Producto registrado con éxito');
                    
                    // 🛑 Cierre automático al tener éxito
                    closeModal(true); 
                } else {
                    toast.error(res.data.Error || 'Error desconocido al registrar el producto.');
                }
            })
            .catch(err => {
                setLoading(false);
                console.error("Error al registrar producto:", err);
                toast.error("Error al conectar con el servidor.");
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case 'codigo':
                // Solo números y máximo 13
                newValue = value.replace(/[^0-9]/g, '').slice(0, 13);
                break;
            case 'cantidad_minima':
                // Solo números enteros, máximo 5 dígitos
                newValue = value.replace(/[^0-9]/g, '').slice(0, 5);
                break;
            case 'precio':
                // Decimales, máximo 10 caracteres (incluyendo punto)
                if (value.includes('.')) {
                    // Limita a dos decimales después del punto
                    const parts = value.split('.');
                    if (parts[1] && parts[1].length > 2) {
                        newValue = value.slice(0, value.length - 1);
                    }
                }
                newValue = newValue.replace(/[^\d.]/g, ''); // Limpia caracteres no deseados
                newValue = newValue.slice(0, 10);
                break;
            case 'nombre':
                newValue = value.slice(0, 35);
                break;
            default:
                break;
        }

        setValues({ ...values, [name]: newValue });
    };

    // RENDERIZADO con Tailwind
    return (
        <>
            <Toaster />
            <div
                onClick={handleBackgroundClick}
                // CLASE CLAVE: inset-0 y flex justify-center items-center para centrar
                className="fixed inset-0 z-[999999] bg-gray-900 bg-opacity-75 flex justify-center items-center transition-opacity"
            >
                {/* Contenedor del Modal */}
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 w-full max-w-lg md:max-w-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Header */}
                    <div className="p-5 bg-blue-600 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <PackageIcon className="w-7 h-7 text-white mr-3" />
                            <h3 className="text-xl font-bold text-white">Registro de Nuevo Producto</h3>
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
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className='space-y-6'>

                            {/* Fila 1: Nombre */}
                            <InputGroup 
                                label="Nombre del Producto" name="nombre" value={values.nombre} 
                                onChange={handleChange} required={true} type="text" 
                                placeholder="Nombre Producto"
                                disabled={loading}
                            />

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                {/* Código */}
                                <InputGroup 
                                    label="Código (EAN/UPC)" name="codigo" value={values.codigo} 
                                    onChange={handleChange} required={true} type="text"
                                    placeholder="Codigo Numerico"
                                    disabled={loading}
                                />
                                
                                {/* Precio */}
                                <InputGroup 
                                    label="Precio de Venta ($)" name="precio" value={values.precio} 
                                    onChange={handleChange} required={true} type="text"
                                    placeholder="Valor sin decimales"
                                    disabled={loading}
                                />
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100'>
                                {/* Cantidad Mínima */}
                                <InputGroup 
                                    label="Stock Mínimo (Alerta)" name="cantidad_minima" value={values.cantidad_minima} 
                                    onChange={handleChange} required={true} type="text"
                                    placeholder="Cantidad minima para aviso"
                                    disabled={loading}
                                />
                                
                                {/* Cantidad Actual (Bloqueada) */}
                                <InputGroup 
                                    label="Stock Actual (Inicial)" name="cantidad" value={0} 
                                    onChange={() => {}} readOnly={true} type="number"
                                    infoText="El stock se actualiza en el módulo de inventario."
                                    disabled={true}
                                />
                            </div>

                            {/* Botones de Acción */}
                            <div className='pt-6 border-t border-gray-100 flex justify-end space-x-3'>
                                <button
                                    type='button'
                                    className='px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 disabled:opacity-50'
                                    onClick={() => closeModal(false)}
                                    disabled={loading} 
                                >
                                    Cancelar
                                </button>
                                <button
                                    type='submit'
                                    disabled={loading} 
                                    className='px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400'
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
                                        'Aceptar y Guardar'
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
// 3. COMPONENTE AUXILIAR (InputGroup)
// ----------------------------------------------------

const InputGroup = ({ label, name, value, onChange, type = "text", required = false, placeholder = "", disabled = false, readOnly = false, infoText = "" }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            className={`w-full p-3 border-2 rounded-lg transition duration-200 ${
                disabled || readOnly 
                    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600 focus:outline-none'
            }`}
            required={required} id={name} name={name} type={type}
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            disabled={disabled || readOnly}
        />
        {infoText && (
             <p className="mt-1 text-xs text-gray-500">{infoText}</p>
        )}
    </div>
);

InputGroup.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    infoText: PropTypes.string,
};


AltaProductosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default AltaProductosModal;