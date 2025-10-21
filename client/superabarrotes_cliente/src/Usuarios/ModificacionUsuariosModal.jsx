/**
 * ModificacionUsuariosModal.jsx
 *
 * Componente React que muestra un modal para modificar los datos de un usuario (trabajador).
 *
 * Props:
 *  - closeModal (func): función para cerrar el modal. Se llama como closeModal(false) desde el botón Cancelar.
 *  - usuario (string): identificador del usuario cuyos datos se deben cargar y modificar.
 *
 * Estado local (values):
 *  - usuario: string (campo deshabilitado en el formulario)
 *  - nombre: string
 *  - apellido_materno: string
 *  - apellido_paterno: string
 *  - contrasena: string (se carga desde res.data.texto_plano actualmente)
 *  - confirmar_contrasena: string (para validar coincidencia)
 *  - rol: string ('Operario' o 'Administrador')
 *
 * Comportamiento principal:
 *  - useEffect: si existe prop `usuario`, realiza GET a /GetUserData/:usuario y setea `values` con la respuesta.
 *  - handleChange: limita longitud de campos (nombre, apellidos, contraseñas) y actualiza estado.
 *  - handleKeyDown: evita caracteres especiales en campos de nombre/apellidos y controla longitudes.
 *  - handleSubmit:
 *      - previene comportamiento por defecto del form.
 *      - valida que contrasena === confirmar_contrasena; si no coinciden, muestra error en el elemento con id "passerror".
 *      - si coinciden, envía POST a /update_user con `values`.
 *      - si respuesta 200: guarda mensaje en localStorage y recarga la página (window.location.reload()).
 *      - si error relacionado con usuario: muestra mensaje en el elemento con id "usererror".
 *
 * Validaciones / UX:
 *  - Todos los inputs tienen required y maxLength.
 *  - Los campos de usuario están deshabilitados (no editables) y ocultos visualmente.
 *  - Los mensajes de error se muestran usando elementos <error id="usererror"> y <error id="passerror"> manipulados vía DOM.
 *
 * Llamadas HTTP:
 *  - GET  http://localhost:8081/GetUserData/:usuario
 *  - POST http://localhost:8081/update_user
 *
 * Riesgos y recomendaciones:
 *  - Seguridad: el backend devuelve `texto_plano` para rellenar la contraseña. Esto es inseguro en producción.
 *    Recomendación: no rellenar la contraseña en el formulario; dejarla vacía y sólo enviar una nueva contraseña si el usuario la proporciona.
 *  - Evitar manipulación directa del DOM (document.getElementById, toggleAttribute). Mejor usar estado React (useState / useRef).
 *  - Evitar recargar la página tras una actualización; en lugar de window.location.reload(), actualizar el estado/props o usar un callback.
 *  - Reemplazar el elemento <error> personalizado por un componente de error controlado por estado para accesibilidad.
 *  - Considerar normalizar y sanitizar entradas antes de enviarlas al backend.
 *
 * Puntos de mejora práctico:
 *  - Extraer validaciones en funciones reutilizables.
 *  - Limitar maxLength de inputs y keyDown de forma coherente (los atributos maxLength en JSX ya evitan exceso de caracteres).
 *  - Usar axios interceptors para manejo centralizado de errores y mostrar toasts informativos.
 *
 * Rutas/archivos relacionados:
 *  - Backend endpoints: server.js (GetUserData, update_user)
 *  - Estilos: Modal.css
 *
 * >>>JULIA POR FAVOR REVISA LOS COMENTARIOS<<<
 */

import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';

function ModificacionUsuariosModal({ closeModal, usuario }) {
    const [values, setValues] = useState({
        usuario: '',
        nombre: '',
        apellido_materno: '',
        apellido_paterno: '',
        contrasena: '',
        rol: 'Operario',
        confirmar_contrasena: '',
    });

    useEffect(() => {
        if (usuario) {
            axios.get(`http://localhost:8081/GetUserData/${usuario}`)
                .then(res => {  
                    setValues({
                        usuario: res.data.usuario,
                        nombre: res.data.Nombre,
                        apellido_materno: res.data.apellido_materno,
                        apellido_paterno: res.data.apellido_paterno,
                        contrasena: res.data.texto_plano,           
                        confirmar_contrasena: res.data.texto_plano,   
                        rol: res.data.rol
                    });
                })

                .catch((error) => {
                    toast.error('Error obteniendo los datos del producto, recargue la página');
                    console.error(error);
                });
        }
    }, [usuario]);


    

    const handleSubmit = (event) => {
        event.preventDefault();
        const passError = document.getElementById("passerror")
        const usererror = document.getElementById("usererror")

        if(values.contrasena !== values.confirmar_contrasena){
            document.getElementById("passerror").innerHTML="Las contraseñas NO coinciden";
            usererror.removeAttribute("open");
            if (!passError.hasAttribute("open")) {
              passError.toggleAttribute("open");
            }
            return;
        }else{
            if (passError.hasAttribute("open")) {
                passError.toggleAttribute("open");
                document.getElementById("passerror").removeAttribute("open");
              }
            console.log(values);
            axios.post('http://localhost:8081/update_user', values)
                .then(res => {
                    if (res.status === 200) {
                        localStorage.setItem('showToast', 'Usuario modificado con éxito');
                        window.location.reload();
                    } else {
                        if(res.data.Error.toLowerCase().includes("usuario")){
                            document.getElementById("usererror").innerHTML=res.data.Error;
                            if (!usererror.hasAttribute("open")) {
                                usererror.toggleAttribute("open");
                              }
                            }
                    }
                })
                .catch(err => console.log(err));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case 'nombre':
                newValue = value.slice(0, 30);
                break;
            case 'apellido_paterno':
                newValue = value.slice(0, 20); 
                break;
            case 'apellido_materno':
                newValue = value.slice(0, 20); 
                break;
            case 'contrasena':
                newValue = value.slice(0, 20); 
                break;
            case 'confirmar_contrasena':
                newValue = value.slice(0, 20);
                break;
            default:
                break;
        }

        setValues({ ...values, [name]: newValue });
    };

    const handleKeyDown = (e) => {
        const { name } = e.target;
        const maxLength = {
            codigo: 13,
            cantidad_minima: 5,
            cantidad: 5,
            precio: 10,
        };
        const actualLength = values[name].replace(/\./g, '').length;

        if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(name)) {
            if( e.key === '-' || e.key === '?' || e.key === '!' || e.key === '@' || e.key === '#' || e.key === '$' 
                || e.key === '%' || e.key === '^' || e.key === '&' || e.key === '*' || e.key === '(' || e.key === ')' 
                || e.key === '+' || e.key === '=' || e.key === '{' || e.key === '}' || e.key === '[' || e.key === ']' 
                || e.key === ':' || e.key === ';' || e.key === '"' || e.key === "'" || e.key === '<' || e.key === '>'
                 || e.key === ',' || e.key === '.' || e.key === '/' || e.key === '\\'){
                e.preventDefault();
            }
            const inputElement = document.getElementById(name); 
            if(!isTextSelected(document.getElementById(inputElement))){
                if (e.key in ['Backspace', 'Delete', 'Tab'] && actualLength >= maxLength[name]) {
                    e.preventDefault();
                }
            }
        }
    };

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
            <div><Toaster /></div>
            <div className="modalBackground_user">
                <div className="modalContainer_user">
                    <div className="header">
                        Modificación de Usuarios
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
                                    <label className="labelModal_user" htmlFor='usuario' style={{display: 'none'}}>Usuario</label>
                                    <input className="inputAlta_user" 
                                        style={{display: 'none'}}
                                        required
                                        id="usuario"
                                        name='usuario'
                                        size='30'
                                        type='text'
                                        maxLength='35'
                                        value={values.usuario}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        disabled
                                    />
                                </div>
                            </div>
                            <error id="usererror" style={{color: "red", marginLeft: "20%", fontSize: "140%", marginTop: "0%", marginBottom: '0%'}}>Hola soy un texto</error>
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
                                        onKeyDown={handleKeyDown}
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
                                        onKeyDown={handleKeyDown}
                                        />
                                </div>
                            </div>
                            <error id="passerror" style={{color: "red", marginLeft: "20%", fontSize: "140%"}}>Hola soy un texto</error>

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
                                    <label htmlFor="rol" style={{marginRight: '5%'}}> Operario</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="rol_admin"
                                        name='rol'
                                        type='radio'
                                        value="Administrador"
                                        onChange={(e) => setValues({...values, rol: e.target.value})}
                                        checked={values.rol === "Administrador"}
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

ModificacionUsuariosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    usuario: PropTypes.string.isRequired,
};

export default ModificacionUsuariosModal;
