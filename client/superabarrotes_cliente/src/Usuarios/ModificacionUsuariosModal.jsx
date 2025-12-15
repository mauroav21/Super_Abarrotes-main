/**
 * ModificacionUsuariosModal.jsx
 *
 * Componente React refactorizado para modificar los datos de un usuario.
 *
 * Correcciones:
 * - Se reemplazó la etiqueta <error> por <span>.
 * - Se eliminó la manipulación directa del DOM (document.getElementById) para errores.
 * - Los errores y mensajes se manejan con estado de React (useState).
 * - Seguridad: Los campos de contraseña se inicializan vacíos (no se carga la contraseña en texto plano).
 * - Manejo de errores de red (500) usando toast.
 */

import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';

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

    // ----------------------------------------------------
    // 3. CARGA DE DATOS INICIALES (useEffect)
    // ----------------------------------------------------
    useEffect(() => {
        if (usuario) {
            setLoading(true);
            axios.get(`http://localhost:8081/GetUserData/${usuario}`)
                .then(res => { 
                    // Si el servidor responde correctamente, inicializamos los campos.
                    // IMPORTANTÍSIMO: NO se carga la contraseña.
                    setValues({
                        usuario: res.data.usuario,
                        nombre: res.data.Nombre,
                        apellido_materno: res.data.apellido_materno,
                        apellido_paterno: res.data.apellido_paterno,
                        contrasena: '', 
                        confirmar_contrasena: '',
                        rol: res.data.rol
                    });
                })
                .catch((error) => {
                    // Manejo del ERROR 500 del servidor
                    console.error("Error al cargar datos del usuario (500):", error);
                    toast.error('Error cargando los datos del usuario. Por favor, revise la consola del servidor (Backend).');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [usuario, closeModal]);


    // ----------------------------------------------------
    // 4. MANEJO DE ENVÍO DE FORMULARIO (handleSubmit)
    // ----------------------------------------------------
    const handleSubmit = (event) => {
        event.preventDefault();
        
        // Limpiar errores previos
        setPasswordError('');
        setUserError('');
        
        const { contrasena, confirmar_contrasena } = values;

        // Validación de Contraseñas (solo si se está intentando cambiar)
        if (contrasena || confirmar_contrasena) {
            if (contrasena !== confirmar_contrasena) {
                setPasswordError("Las contraseñas NO coinciden.");
                return;
            }
            if (contrasena.length < 6) { 
                setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
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
        };

        // Solo incluir la contraseña si se proporcionó una nueva
        if (contrasena) {
            dataToSend.contrasena = contrasena;
        }

        axios.post('http://localhost:8081/update_user', dataToSend)
            .then(res => {
                if (res.status === 200) {
                    toast.success('Usuario modificado con éxito.');
                    // Usamos setTimeout para dar tiempo a ver el toast antes de cerrar el modal
                    setTimeout(() => closeModal(true), 1500); 
                } else {
                    const errorMsg = res.data?.Error || "Error desconocido al actualizar.";
                    if(errorMsg.toLowerCase().includes("usuario")){
                        setUserError(errorMsg);
                    } else {
                        toast.error(errorMsg);
                    }
                }
            })
            .catch(err => {
                console.error("Error al actualizar usuario:", err);
                toast.error("Error al conectar con el servidor o error desconocido.");
            });
    };

    // ----------------------------------------------------
    // 5. MANEJO DE CAMBIOS (handleChange)
    // ----------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Truncamiento de valores para que coincida con el maxLength de 35
        const maxLengths = {
            nombre: 35,
            apellido_paterno: 35,
            apellido_materno: 35,
            contrasena: 35,
            confirmar_contrasena: 35,
        };
        
        if (maxLengths[name] !== undefined) {
             newValue = value.slice(0, maxLengths[name]);
        }
        
        // Limpiar mensajes de error relacionados al escribir
        if (name === 'contrasena' || name === 'confirmar_contrasena') {
            setPasswordError('');
        }
        if (name === 'usuario') {
            setUserError('');
        }

        setValues({ ...values, [name]: newValue });
    };

    // ----------------------------------------------------
    // 6. MANEJO DE TECLAS (handleKeyDown)
    // ----------------------------------------------------
    const handleKeyDown = (e) => {
        const { name } = e.target;
        
        // Evitar caracteres especiales en campos de nombre y apellidos
        if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(name)) {
            const forbiddenKeys = /[-?!@#$%^&*()+={\[}\]:;"'<>,./\\]/;
            
            if (forbiddenKeys.test(e.key) && e.key.length === 1) { 
                e.preventDefault();
            }
        }
        // Se recomienda confiar en el atributo maxLength de JSX para limitar la longitud
    };
    
    // ----------------------------------------------------
    // 7. RENDERIZADO
    // ----------------------------------------------------
    if (loading) {
        return (
            <div className="modalBackground_user" style={{ zIndex: 9999 }}>
                <div className="modalContainer_user">
                    <p>Cargando datos del usuario...</p>
                    <button id='cancelButton_user' onClick={() => closeModal(false)}>Cerrar</button>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground_user" style={{ zIndex: 9999 }}>
                <div className="modalContainer_user">
                    <div className="header">
                        Modificación de Usuarios
                    </div>
                    <div className="forms_user">
                        <form onSubmit={handleSubmit} className='formModal_user'>
                            
                            {/* USUARIO (Valor del ID) */}
                            <input type="hidden" name='usuario' value={values.usuario} readOnly />

                            <div className='rowInput'>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='nombre'>Nombre</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="nombre"
                                        name='nombre'
                                        size='30'
                                        type='text'
                                        maxLength='35'
                                        value={values.nombre}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='apellido_paterno'>Apellido Paterno</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="apellido_paterno"
                                        name='apellido_paterno'
                                        size='30'
                                        maxLength='35'
                                        value={values.apellido_paterno}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                            </div>
                            <div className='rowInput'>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='apellido_materno'>Apellido Materno</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="apellido_materno"
                                        name='apellido_materno'
                                        type='text'
                                        size='30'
                                        maxLength='35'
                                        value={values.apellido_materno}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                {/* Mostrar el usuario a modificar como texto, no como input editable */}
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user">Usuario a Modificar</label>
                                    <p className="inputAlta_user" style={{
                                        fontWeight: 'bold', 
                                        backgroundColor: '#eee', 
                                        padding: '6px', 
                                        borderRadius: '4px',
                                        fontSize: '1em',
                                        border: '1px solid #ccc'
                                    }}>
                                        {values.usuario || 'Cargando...'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* MOSTRAR ERROR DE USUARIO (REEMPLAZO DE <error id="usererror">) */}
                            {userError && (
                                <span style={{color: "red", marginLeft: "20%", fontSize: "140%", marginTop: "0%", marginBottom: '0%'}}>
                                    {userError}
                                </span>
                            )}

                            <div className='rowInput'>
                                <div className='inputLabel_user' style={{marginTop:'7%'}}>
                                    <label className="labelModal_user" htmlFor='contrasena'>Contraseña (Dejar vacío para no cambiar)</label>
                                    <input className="inputAlta_user"
                                        id="contrasena"
                                        name='contrasena'
                                        size='30'
                                        type='password'
                                        maxLength='35'
                                        value={values.contrasena}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='confirmar_contrasena'> Confirmar contraseña</label>
                                    <input className="inputAlta_user"
                                        id="confirmar_contrasena"
                                        name='confirmar_contrasena'
                                        size='30'
                                        type='password'
                                        maxLength='35'
                                        value={values.confirmar_contrasena}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            {/* MOSTRAR ERROR DE CONTRASEÑA (REEMPLAZO DE <error id="passerror">) */}
                            {passwordError && (
                                <span style={{color: "red", marginLeft: "20%", fontSize: "140%"}}>
                                    {passwordError}
                                </span>
                            )}

                            <div style={{display:'flex', flexDirection:'column', marginTop:'4%', color:'black'}}>
                                    <label className="labelModal_user" htmlFor='rol'> Rol</label>
                                    <div>
                                    <input className="inputAlta_user"
                                        required
                                        id="rol_operario"
                                        name='rol'
                                        type='radio'
                                        value="Operario"
                                        onChange={(e) => setValues({...values, rol: e.target.value})} 
                                        checked={values.rol === "Operario"}/>
                                    <label htmlFor="rol_operario" style={{marginRight: '5%'}}> Operario</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="rol_admin"
                                        name='rol'
                                        type='radio'
                                        value="Administrador"
                                        onChange={(e) => setValues({...values, rol: e.target.value})}
                                        checked={values.rol === "Administrador"}
                                        />
                                    <label htmlFor="rol_admin"> Administrador</label>
                                    </div>
                            </div>
                            <div id='buttons' style={{marginTop:'3%'}}>
                                <button id='acceptButton_user' type='submit'>Aceptar</button>
                                <button id='cancelButton_user' type='button' onClick={() => closeModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

ModificacionUsuariosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    usuario: PropTypes.string.isRequired,
};

export default ModificacionUsuariosModal;