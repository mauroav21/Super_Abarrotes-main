/**
 * AltaUsuariosModal.jsx
 *
 * Componente React que muestra un modal para dar de alta (crear) un nuevo usuario/trabajador.
 *
 * Props:
 *  - closeModal: function (required) -> se llama closeModal(false) para cerrar el modal.
 *
 * Estado local (values):
 *  - usuario: string
 *  - nombre: string
 *  - apellido_materno: string
 *  - apellido_paterno: string
 *  - contrasena: string
 *  - confirmar_contrasena: string
 *  - rol: string ('Operario' por defecto)
 *
 * Funciones principales:
 *  - handleSubmit(event):
 *      - Evita el envío por defecto.
 *      - Valida que contrasena === confirmar_contrasena; si no coinciden muestra mensaje en el elemento con id "passerror".
 *      - Si coinciden, envía POST a http://localhost:8081/register_user con los valores.
 *      - Si el servidor responde con 200: guarda un mensaje en localStorage y recarga la página (window.location.reload()).
 *      - Si hay error relacionado con el usuario muestra el mensaje en el elemento con id "usererror".
 *
 *  - handleChange(e):
 *      - Actualiza el estado values.
 *      - Aplica límites por campo (nombre: 30, apellidos: 20, contraseñas: 20 caracteres) usando slice.
 *
 *  - handleKeyDown(e):
 *      - Para campos nombre/apellidos evita la entrada de muchos caracteres especiales (chequeo por e.key).
 *      - Intenta limitar la longitud de entrada evitando teclas cuando se alcanza el máximo (implementación con DOM y comprobación de selección).
 *
 *  - isTextSelected(input):
 *      - Comprueba si todo el texto del input está seleccionado (usa selectionStart/selectionEnd o document.selection).
 *
 * Renderizado / estructura:
 *  - Modal con clase modalBackground_user y modalContainer_user.
 *  - Formulario con inputs para nombre, apellidos, usuario, contraseña, confirmar contraseña y radio buttons para rol.
 *  - Elementos <error id="usererror"> y <error id="passerror"> usados para mostrar mensajes (manipulados mediante document.getElementById).
 *  - Botones: Aceptar (submit) y Cancelar (closeModal(false)).
 *
 * Comunicación con backend:
 *  - POST http://localhost:8081/register_user
 *
 * Observaciones y recomendaciones:
 *  - Actualmente se usan manipulaciones directas del DOM (document.getElementById, toggleAttribute, innerHTML). Es más apropiado usar useState para manejar errores y condicionales en JSX.
 *  - Evitar recargar la página (window.location.reload()) — mejor devolver un callback o actualizar la lista desde el padre.
 *  - La validación de caracteres en handleKeyDown es extensa y frágil; considerar usar expresiones regulares y atributos HTML (pattern, maxLength) para simplificar.
 *  - maxLength en los inputs está fijado a 35 pero slice limita a menos; armonizar ambos valores.
 *  - Asegurarse de que la contraseña se envía en texto plano solo porque el servidor la va a hashear; nunca almacenar contraseñas en texto plano.
 *  - Reemplazar la etiqueta personalizada <error> por un elemento semántico (p, span) con roles/accessibility attributes.
 *
 * Archivos relacionados:
 *  - Modal.css (estilos del modal)
 *  - Backend endpoint: server.js -> /register_user
 *
 * >>REVISA LOS COMENTARIOS PORFAVOOOOR<<
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
            axios.post('http://localhost:8081/register_user', values)
                .then(res => {
                    console.log(res.status)
                    if (res.status === 200) {
                        window.localStorage.setItem('showToast', 'Usuario creado con éxito');
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
            <div className="modalBackground_user">
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
                            <error id="passerror" style={{color: "red", marginLeft: "20%", fontSize: "140%"}}>Hola soy un texto</error>

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
                                        onChange={(e) => setValues({...values, rol: e.target.value})}                                        />
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
