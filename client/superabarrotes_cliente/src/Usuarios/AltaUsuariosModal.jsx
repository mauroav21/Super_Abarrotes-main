/**
 * AltaUsuariosModal.jsx
 *
 * Componente React que muestra un modal para dar de alta (crear) un nuevo usuario/trabajador.
 *
 * Mejoras aplicadas:
 * - Se corrigió el error de etiqueta no reconocida reemplazando <error> por <span>.
 * - Se implementó el manejo de errores (contraseñas no coinciden, error de usuario duplicado)
 * utilizando el estado de React (useState) en lugar de document.getElementById y toggleAttribute.
 * - Se mantuvo el alto z-index para asegurar que el modal se muestre encima de otros elementos (como sidebars).
 */

import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useState } from 'react'

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

    // Estado para manejar los mensajes de error
    const [passwordError, setPasswordError] = useState('');
    const [userError, setUserError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // 1. Limpiar errores previos
        setPasswordError('');
        setUserError('');

        // 2. Validación de Contraseñas
        if(values.contrasena !== values.confirmar_contrasena){
            setPasswordError("Las contraseñas NO coinciden");
            return;
        }

        console.log(values);
        
        // 3. Envío al Backend
        axios.post('http://localhost:8081/register_user', values)
            .then(res => {
                console.log(res.status)
                if (res.status === 200) {
                    window.localStorage.setItem('showToast', 'Usuario creado con éxito');
                    // Idealmente: closeModal(true) para que el componente padre sepa que fue exitoso
                    window.location.reload(); 
                } else {
                    // 4. Manejo de Errores del Servidor (asumiendo que res.data.Error contiene el mensaje)
                    if(res.data.Error && res.data.Error.toLowerCase().includes("usuario")){
                        setUserError(res.data.Error);
                    } else {
                        setUserError("Ocurrió un error al registrar el usuario.");
                    }
                }
            })
            .catch(err => {
                console.error("Error al registrar usuario:", err);
                setUserError("Error al conectar con el servidor o error desconocido.");
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Limpieza y limitación de longitud
        switch (name) {
            case 'nombre':
                newValue = value.slice(0, 30);
                break;
            case 'apellido_paterno':
            case 'apellido_materno':
                newValue = value.slice(0, 35); 
                break;
            case 'contrasena':
            case 'confirmar_contrasena':
                newValue = value.slice(0, 35); 
                break;
            default:
                break;
        }

        setValues({ ...values, [name]: newValue });
    };

    const handleKeyDown = (e) => {
        const { name } = e.target;
        
        // Validar solo en campos de nombre y apellidos para evitar caracteres especiales
        if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(name)) {
            // Expresión regular para caracteres no permitidos (signos de puntuación, símbolos)
            const forbiddenKeys = /[-?!@#$%^&*()+={\[}\]:;"'<>,./\\]/;
            
            if (forbiddenKeys.test(e.key) && e.key.length === 1) { 
                e.preventDefault();
            }
        }
    };

    // Función que estaba en tu código original, se mantiene por compatibilidad
    function isTextSelected(input) {
        if (typeof input.selectionStart == "number") {
            return input.selectionStart == 0 && input.selectionEnd == input.value.length;
        } else if (typeof document.selection != "undefined") {
            input.focus();
            return document.selection.createRange().text == input.value;
        }
    }

    return (
        <>
            {/* Aplica zIndex alto para el fondo del modal */}
            <div className="modalBackground_user" style={{ zIndex: 9999 }}>
                <div className="modalContainer_user">
                    <div className="header">
                        Alta de Usuarios
                    </div>
                    <div className="forms_user">
                        <form onSubmit={handleSubmit} className='formModal_user'>
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
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='usuario'>Usuario</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="usuario"
                                        name='usuario'
                                        size='30'
                                        type='text'
                                        maxLength='35'
                                        value={values.usuario}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                            </div>
                            
                            {/* Mostrar Error de Usuario (usando estado y <span>) */}
                            {userError && (
                                <span style={{color: "red", marginLeft: "20%", fontSize: "140%", marginTop: "0%", marginBottom: '0%'}}>
                                    {userError}
                                </span>
                            )}
                            
                            <div className='rowInput'>
                                <div className='inputLabel_user' style={{marginTop:'7%'}}>
                                    <label className="labelModal_user" htmlFor='contrasena'>Contraseña</label>
                                    <input className="inputAlta_user"
                                        required
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
                                        required
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
                            
                            {/* Mostrar Error de Contraseña (usando estado y <span>) */}
                            {passwordError && (
                                <span style={{color: "red", marginLeft: "20%", fontSize: "140%"}}>
                                    {passwordError}
                                </span>
                            )}

                            <div style={{display:'flex', flexDirection:'column', marginTop:'4%'}}>
                                    <label className="labelModal_user" htmlFor='rol'> Rol</label>
                                    <div>
                                    <input className="inputAlta_user"
                                        required
                                        id="rol_operario"
                                        name='rol'
                                        type='radio'
                                        defaultChecked
                                        value='Operario'
                                        onChange={(e) => setValues({...values, rol: e.target.value})}
                                        />
                                    <label htmlFor="rol" style={{marginRight: '5%'}}> Operario</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="rol_admin"
                                        name='rol'
                                        type='radio'
                                        value='Administrador'
                                        onChange={(e) => setValues({...values, rol: e.target.value})}
                                        />
                                    <label htmlFor="rol"> Administrador</label>
                                    </div>
                            </div>
                            <div id='buttons' style={{marginTop:'3%'}}>
                                <button id='acceptButton_user' type='submit'>Aceptar</button>
                                <button id='cancelButton_user' onClick={() => closeModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

AltaUsuariosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default AltaUsuariosModal;