import PropTypes from 'prop-types';
import axios from 'axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// ----------------------------------------------------
// ICONO SVG (Círculo de Usuario)
// ----------------------------------------------------
const UserCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18.685 19.03A99.673 99.673 0 0012 17.25c-2.31 0-4.516.336-6.685.91A1.75 1.75 0 004 19.826v1.424c0 .966.784 1.75 1.75 1.75h14.5c.966 0 1.75-.784 1.75-1.75v-1.424c0-.784-.469-1.47-1.155-1.796zM12 14.25a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
    </svg>
);

// Ícono X para cerrar
const X = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);


function ModificacionUsuariosModal({ closeModal, usuario }) {

    // ----------------------------------------------------
    // 1. ESTADO DEL FORMULARIO
    // ----------------------------------------------------
    const [values, setValues] = useState({
        usuario: '',
        nombre: '',
        apellido_materno: '',
        apellido_paterno: '',
        contrasena: '',
        rol: 'Operario',
        confirmar_contrasena: '',
    });

    // ----------------------------------------------------
    // 2. ESTADO DE ERRORES Y CARGA
    // ----------------------------------------------------
    const [passwordError, setPasswordError] = useState('');
    const [userError, setUserError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null); // Nuevo: Estado para manejar errores de carga inicial

    // ----------------------------------------------------
    // 3. BLOQUEO DE SCROLL Y CLIC EN EL FONDO
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
    // 4. CARGA DE DATOS INICIALES
    // ----------------------------------------------------
    useEffect(() => {
        if (usuario) {
            setLoading(true);
            setLoadError(null); // Reinicia el error de carga
            axios.get(`http://localhost:8081/GetUserData/${usuario}`)
                .then(res => {
                    if (res.data) {
                        setValues({
                            usuario: res.data.usuario || '',
                            nombre: res.data.Nombre || '',
                            apellido_materno: res.data.apellido_materno || '',
                            apellido_paterno: res.data.apellido_paterno || '',
                            contrasena: '',
                            confirmar_contrasena: '',
                            rol: res.data.rol || 'Operario'
                        });
                    } else {
                        toast.error('Datos del usuario incompletos o incorrectos.');
                        setLoadError('No se pudieron cargar los datos del usuario. Intente de nuevo.');
                    }
                })
                .catch((error) => {
                    console.error("Error al cargar datos del usuario (500):", error);
                    toast.error('Error cargando los datos del usuario.');
                    setLoadError('No se pudieron cargar los datos. Por favor, revise la conexión o reintente.');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [usuario]);


    // ----------------------------------------------------
    // 5. MANEJO DE ENVÍO DE FORMULARIO (handleSubmit)
    // ----------------------------------------------------
    const handleSubmit = async (event) => {
        event.preventDefault();

        setPasswordError('');
        setUserError('');
        setLoading(true); // <--- INICIA CARGA

        const { contrasena, confirmar_contrasena } = values;

        // Validación de Contraseñas (solo si se está intentando cambiar)
        if (contrasena || confirmar_contrasena) {
            if (contrasena !== confirmar_contrasena) {
                setPasswordError("Las contraseñas NO coinciden.");
                setLoading(false); 
                return;
            }
            if (contrasena.length > 0 && contrasena.length < 6) {
                setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
                setLoading(false); 
                return;
            }
        }

        // Objeto de datos a enviar
        const dataToSend = {
            usuario: values.usuario,
            nombre: values.nombre,
            apellido_materno: values.apellido_materno,
            apellido_paterno: values.apellido_paterno,
            rol: values.rol,
            contrasena: contrasena, // Se envía el valor, vacío si no se cambió.
        };

        try {
            const res = await axios.post('http://localhost:8081/update_user', dataToSend);
            setLoading(false); // Detiene carga

            if (res.status === 200) {
                
                const serverMessage = res.data?.message || 'Operación completada.';

                if (serverMessage.includes('No se detectaron cambios')) {
                    // Caso: El servidor indica que el usuario existe pero no hubo cambios en los datos.
                    toast('⚠️ No se detectaron cambios para guardar.', { icon: '💡' });
                    // Cierra el modal sin recargar la tabla
                    setTimeout(() => closeModal(false), 1500); 
                } else {
                    // Caso: Éxito con cambios (datos actualizados o contraseña cambiada)
                    toast.success(serverMessage);
                    // Cierra el modal y recarga la tabla
                    setTimeout(() => closeModal(true), 1500); 
                }

            } else {
                // Manejo de errores 4xx/5xx (ej: 404 Usuario no encontrado)
                const errorMsg = res.data?.Error || "Error desconocido al actualizar.";
                if(errorMsg.toLowerCase().includes("usuario")){
                    setUserError(errorMsg);
                } else {
                    toast.error(errorMsg);
                }
            }
        } catch (err) {
            setLoading(false); // Detiene carga
            console.error("Error al actualizar usuario:", err);
            // Mensajes específicos para el usuario basados en el error
            if (err.response && err.response.data && err.response.data.Error) {
                 toast.error(`Error: ${err.response.data.Error}`);
            } else {
                 toast.error("Error al conectar con el servidor o error desconocido.");
            }
           
        }
    };

    // ----------------------------------------------------
    // 6. MANEJO DE CAMBIOS Y TECLAS
    // ----------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Truncamiento de valores 
        const maxLengths = {
            nombre: 35, apellido_paterno: 35, apellido_materno: 35,
            contrasena: 35, confirmar_contrasena: 35,
        };

        if (maxLengths[name] !== undefined) {
              newValue = value.slice(0, maxLengths[name]);
        }

        // Limpiar mensajes de error
        if (name === 'contrasena' || name === 'confirmar_contrasena') {
            setPasswordError('');
        }
        if (name === 'usuario') {
            setUserError('');
        }

        setValues({ ...values, [name]: newValue });
    };

    const handleRoleChange = (e) => {
        setValues({ ...values, rol: e.target.value });
    };

    const handleKeyDown = (e) => {
        const { name } = e.target;

        // Evitar caracteres especiales en campos de nombre y apellidos
        if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(name)) {
            const forbiddenKeys = /[-?!@#$%^&*()+={\[}\]:;"'<>,./\\]/;

            if (forbiddenKeys.test(e.key) && e.key.length === 1) {
                e.preventDefault();
            }
        }
    };

    // ----------------------------------------------------
    // 7. RENDERIZADO
    // ----------------------------------------------------
    
    // Muestra la pantalla de carga inicial
    if (loading && !values.usuario) { 
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-[9999] flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <p className="text-lg font-medium text-indigo-700">Cargando datos del usuario...</p>
                    <button
                        className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => closeModal(false)}>Cerrar</button>
                </div>
            </div>
        );
    }
    
    // Muestra error si la carga inicial falló
    if (loadError) {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-[9999] flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <p className="text-lg font-medium text-red-700 mb-4">{loadError}</p>
                    <button
                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => closeModal(false)}>Cerrar</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster />
            {/* Fondo Oscuro y Posicionamiento Forzado */}
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
                {/* Contenedor del Modal */}
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
                    style={{ width: '900px', maxWidth: '90vw' }} 
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Header */}
                    <div className="p-4 sm:p-6 bg-indigo-700 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <UserCircle className="w-8 h-8 text-yellow-300 mr-3" />
                            <h3 className="text-xl font-bold text-white">Modificación de Usuario</h3>
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
                        <form onSubmit={handleSubmit} className='space-y-4'>

                            <input type="hidden" name='usuario' value={values.usuario} readOnly />

                            {/* Fila 1: Nombre y Apellido Paterno */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <InputGroup label="Nombre" name="nombre" value={values.nombre} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading} />
                                <InputGroup label="Apellido Paterno" name="apellido_paterno" value={values.apellido_paterno} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading} />
                            </div>

                            {/* Fila 2: Apellido Materno y Usuario a Modificar */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <InputGroup label="Apellido Materno" name="apellido_materno" value={values.apellido_materno} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading} />

                                {/* Usuario no editable (Estilo mejorado) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario a Modificar</label>
                                    <div className="w-full bg-gray-100 text-gray-800 font-semibold p-2.5 rounded-lg border border-gray-300 select-none cursor-not-allowed">
                                        {values.usuario || 'Cargando...'}
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje de Error de Usuario */}
                            {userError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm text-center" role="alert">
                                    {userError}
                                </div>
                            )}

                            {/* Fila 3: Contraseña y Confirmar Contraseña */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200'>
                                <InputGroup label="Nueva Contraseña (Dejar vacío para no cambiar)" name="contrasena" type="password" value={values.contrasena} onChange={handleChange} maxLength="35" disabled={loading} />
                                <InputGroup label="Confirmar Contraseña" name="confirmar_contrasena" type="password" value={values.confirmar_contrasena} onChange={handleChange} maxLength="35" disabled={loading} />
                            </div>

                            {/* Mensaje de Error de Contraseña */}
                            {passwordError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm text-center" role="alert">
                                    {passwordError}
                                </div>
                            )}

                            {/* Selector de Rol */}
                            <div className='pt-2'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <div className="flex space-x-6">
                                    <RadioOption id="rol_operario" name="rol" value="Operario" label="Operario" checked={values.rol === "Operario"} onChange={handleRoleChange} disabled={loading} />
                                    <RadioOption id="rol_admin" name="rol" value="Administrador" label="Administrador" checked={values.rol === "Administrador"} onChange={handleRoleChange} disabled={loading} />
                                </div>
                            </div>

                            {/* Botones de Acción */}
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
                                    className='px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-150 flex items-center justify-center disabled:opacity-50'
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
// Componentes de Reutilización (InputGroup y RadioOption)
// ----------------------------------------------------

const InputGroup = ({ label, name, value, onChange, onKeyDown, type = "text", required = false, maxLength = "35", disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
            {label}
        </label>
        <input className={`w-full p-2.5 border rounded-lg transition duration-150 ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
            required={required} id={name} name={name} type={type} maxLength={maxLength}
            value={value} onChange={onChange} onKeyDown={onKeyDown} disabled={disabled}
        />
    </div>
);

InputGroup.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    type: PropTypes.string,
    required: PropTypes.bool,
    maxLength: PropTypes.string,
    disabled: PropTypes.bool,
};


const RadioOption = ({ id, name, value, label, checked, onChange, disabled }) => (
    <div className="flex items-center">
        <input
            id={id} name={name} type="radio" value={value} checked={checked} onChange={onChange} disabled={disabled}
            className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <label htmlFor={id} className={`ml-2 block text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
            {label}
        </label>
    </div>
);

RadioOption.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};


ModificacionUsuariosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    usuario: PropTypes.string.isRequired,
};

export default ModificacionUsuariosModal;