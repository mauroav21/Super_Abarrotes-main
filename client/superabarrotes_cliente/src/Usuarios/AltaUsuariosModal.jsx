import PropTypes from 'prop-types';
import axios from 'axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// ----------------------------------------------------
// 1. ICONOS SVG (SIMPLIFICADOS/MANTENIDOS)
// Hemos quitado CheckCircle y XCircle.
// ----------------------------------------------------

// Icono principal del encabezado (Se mantiene el SVG de cabecera)
const UserCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18.685 19.03A99.673 99.673 0 0012 17.25c-2.31 0-4.516.336-6.685.91A1.75 1.75 0 004 19.826v1.424c0 .966.784 1.75 1.75 1.75h14.5c.966 0 1.75-.784 1.75-1.75v-1.424c0-.784-.469-1.47-1.155-1.796zM12 14.25a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
    </svg>
);

// Ícono X para cerrar (Se mantiene)
const X = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);


// ----------------------------------------------------
// 2. COMPONENTE PRINCIPAL
// ----------------------------------------------------

function AltaUsuariosModal({ closeModal }) {
    const [values, setValues] = useState({
        usuario: '',
        nombre: '',
        apellido_materno: '',
        apellido_paterno: '',
        contrasena: '',
        rol: 'Operario',
        confirmar_contrasena: '',
    });

    const [passwordError, setPasswordError] = useState('');
    const [userError, setUserError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estado para la validación en tiempo real
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasCapital: false,
        hasNumber: false,
        isConfirmed: false,
        isValid: false,
    });

    // Lógica de validación de la contraseña
    const validatePassword = (password, confirmation) => {
        const minLength = password.length >= 8;
        const hasCapital = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        // La confirmación debe ser igual Y el campo de contraseña debe tener contenido
        const isConfirmed = password === confirmation && password.length > 0; 

        const isValid = minLength && hasCapital && hasNumber && isConfirmed;

        setPasswordValidation({
            minLength,
            hasCapital,
            hasNumber,
            isConfirmed,
            isValid,
        });

        return isValid;
    };


    // Bloqueo de Scroll (Se mantiene)
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

    // Manejo del envío del formulario (Se mantiene)
    const handleSubmit = (event) => {
        event.preventDefault();
        
        setPasswordError('');
        setUserError('');

        const isValid = validatePassword(values.contrasena, values.confirmar_contrasena);

        if (!isValid) {
            if (!passwordValidation.isConfirmed) {
                setPasswordError("Las contraseñas no coinciden.");
            } else {
                setPasswordError("La contraseña no cumple con todos los requisitos de seguridad.");
            }
            return; 
        }

        setLoading(true);
        
        axios.post('http://localhost:8081/register_user', values)
            .then(res => {
                setLoading(false);
                
                // 🛑 LÓGICA DE CIERRE: Se llama a closeModal(true) directamente
                
                // Opción 1: Éxito evidente (status 200 y/o tiene un mensaje de éxito)
                if (res.status === 200 && res.data && (res.data.message || !res.data.Error)) {
                    toast.success('Usuario creado con éxito');
                    closeModal(true); // <-- CIERRE DIRECTO
                    
                } 
                // Opción 2: Error Específico (La respuesta del backend solo contiene el error)
                else if (res.data && res.data.Error) { 
                    if(res.data.Error.toLowerCase().includes("usuario")){
                        setUserError(res.data.Error);
                    } else {
                        toast.error(res.data.Error);
                    }
                } 
                // Opción 3: Respuesta inesperada pero se resolvió la promesa (Tratar como éxito si no hay error explícito)
                else {
                    toast.success('Usuario creado con éxito (Respuesta ambigua del servidor).');
                    closeModal(true); // <-- CIERRE DIRECTO
                }
            })
            .catch(err => {
                setLoading(false);
                console.error("Error al registrar usuario:", err);
                if (err.response && err.response.data && err.response.data.Error) {
                    toast.error(`Error: ${err.response.data.Error}`);
                } else {
                    toast.error("Error al conectar con el servidor o error desconocido.");
                }
            });
    };
    // Manejo de cambios en los inputs (Se mantiene la lógica de validación)
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        const maxLengths = {
            nombre: 35, apellido_paterno: 35, apellido_materno: 35,
            contrasena: 35, confirmar_contrasena: 35, usuario: 35,
        };

        if (maxLengths[name] !== undefined) {
            newValue = value.slice(0, maxLengths[name]);
        }
        
        if (name === 'contrasena' || name === 'confirmar_contrasena') {
            setPasswordError('');
            
            const newValues = { ...values, [name]: newValue };
            
            const password = newValues.contrasena;
            const confirmation = newValues.confirmar_contrasena;

            validatePassword(
                password, 
                confirmation
            );
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
        
        if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(name)) {
            const forbiddenKeys = /[-?!@#$%^&*()+={\[}\]:;"'<>,./\\]/;
            
            if (forbiddenKeys.test(e.key) && e.key.length === 1) { 
                e.preventDefault();
            }
        }
    };


    // RENDERIZADO
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
                {/* Contenedor del Modal */}
                <div
                    className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
                    style={{ width: '900px', maxWidth: '90vw' }} 
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 bg-indigo-700 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                            <UserCircleIcon className="w-8 h-8 text-yellow-300 mr-3" />
                            <h3 className="text-xl font-bold text-white">Alta de Usuarios</h3>
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

                            {/* Fila 1 y 2 (Datos personales) */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <InputGroup label="Nombre" name="nombre" value={values.nombre} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading} maxLength="30"/>
                                <InputGroup label="Apellido Paterno" name="apellido_paterno" value={values.apellido_paterno} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading}/>
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <InputGroup label="Apellido Materno" name="apellido_materno" value={values.apellido_materno} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading}/>
                                <InputGroup label="Usuario" name="usuario" value={values.usuario} onChange={handleChange} onKeyDown={handleKeyDown} required={true} disabled={loading}/>
                            </div>

                            {/* Mensaje de Error de Usuario */}
                            {userError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm text-center" role="alert">
                                    {userError}
                                </div>
                            )}

                            {/* Fila 3: Contraseña y Confirmar Contraseña */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200'>
                                <InputGroup 
                                    label="Contraseña" name="contrasena" type="password" 
                                    value={values.contrasena} onChange={handleChange} required={true} 
                                    disabled={loading} 
                                />
                                <InputGroup 
                                    label="Confirmar Contraseña" name="confirmar_contrasena" type="password" 
                                    value={values.confirmar_contrasena} onChange={handleChange} required={true} 
                                    disabled={loading} 
                                />
                            </div>

                            {/* 🛑 FEEDBACK CON CARACTERES UNICODE */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className="space-y-1 text-sm pt-1">
                                    <PasswordRequirement status={passwordValidation.minLength} text="Mínimo 8 caracteres" />
                                    <PasswordRequirement status={passwordValidation.hasCapital} text="Al menos 1 mayúscula (A-Z)" />
                                    <PasswordRequirement status={passwordValidation.hasNumber} text="Al menos 1 número (0-9)" />
                                </div>
                                <div className="space-y-1 text-sm pt-1">
                                    <PasswordRequirement 
                                        status={passwordValidation.isConfirmed} 
                                        text="Contraseñas coinciden" 
                                        isConfirmation={true} 
                                    />
                                </div>
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
                                    <RadioOption id="rol_operario_alta" name="rol" value="Operario" label="Operario" checked={values.rol === "Operario"} onChange={handleRoleChange} disabled={loading} />
                                    <RadioOption id="rol_admin_alta" name="rol" value="Administrador" label="Administrador" checked={values.rol === "Administrador"} onChange={handleRoleChange} disabled={loading} />
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
                                    disabled={loading || !passwordValidation.isValid} 
                                    className='px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-150 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400'
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Registrando...
                                        </>
                                    ) : (
                                        'Aceptar'
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
// 3. COMPONENTES AUXILIARES (PasswordRequirement con Unicode)
// ----------------------------------------------------

const PasswordRequirement = ({ status, text, isConfirmation = false }) => {
    // Si la condición es verdadera (status: true), usamos color verde.
    // Si la condición es falsa, usamos color rojo.
    const finalColor = status ? 'text-green-600' : 'text-red-600';
    
    // Si estamos en el campo de confirmación y el campo de contraseña está vacío (para evitar el rojo inmediato)
    const isGray = isConfirmation && !status && text === "Contraseñas coinciden" && !document.getElementById('contrasena')?.value;

    const displayColor = isGray ? 'text-gray-500' : finalColor;
    const symbol = status ? '✓' : '•'; // Usamos un checkmark o un bullet

    return (
        // Usamos font-bold en el símbolo para destacarlo
        <div className={`flex items-center transition-colors duration-200 ${displayColor}`}>
            <span className="w-4 h-4 mr-2 text-center font-extrabold">{symbol}</span>
            <span className="font-normal">{text}</span>
        </div>
    );
};

PasswordRequirement.propTypes = {
    status: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    isConfirmation: PropTypes.bool,
};


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


AltaUsuariosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default AltaUsuariosModal;