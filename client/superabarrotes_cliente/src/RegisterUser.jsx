/**
 * RegisterUser.jsx
 *
 * Propósito:
 *  - Renderizar un formulario para crear/registrar un nuevo usuario.
 *  - Enviar los datos del formulario al backend mediante POST a http://localhost:8081/register_user.
 *
 * Estado local (values):
 *  - name: string            -> Nombre del usuario.
 *  - first_last_name: string -> Apellido paterno.
 *  - second_last_name: string-> Apellido materno.
 *  - username: string        -> Nombre de usuario.
 *  - password: string        -> Contraseña en texto plano (se espera que el servidor la hashee).
 *  - role: string            -> Rol del usuario (ej. "admin", "empleado").
 *
 * Flujo:
 *  - El usuario completa los inputs.
 *  - Al enviar el formulario (handleSubmit) se hace axios.post con el objeto values.
 *  - Actualmente las respuestas/errores sólo se muestran en consola (console.log).
 *
 */
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function RegisterUser(){
    const [values, setValues] = useState({
        name: '',
        first_last_name: '',
        second_last_name: '',
        username: '',
        password: '',
        role: '' 
    })
    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:8081/register_user', values)
        .then(res => console.log(res))
        .then(err => console.log(err));
    }

    return (
        <form onSubmit={handleSubmit}>
                <div>
                    <input type="text" placeholder="Nombre" required name="name" 
                    onChange={(e) => setValues({...values, name: e.target.value})}/>

                </div>
                <div>
                    <input type="text" placeholder="Apellido Paterno" required name="first_last_name"
                    onChange={(e) => setValues({...values, first_last_name: e.target.value})}/>
                </div>
                <div>
                    <input type="text" placeholder="Apellido Materno" required name="second_last_name"
                    onChange={(e) => setValues({...values, second_last_name: e.target.value})}/>
                </div>
                <div>
                    <input type="text" placeholder="Usuario" required name="username"
                    onChange={(e) => setValues({...values, username: e.target.value})}/>

                </div>
                <div>
                    <input type="text" placeholder="Contraseña" required name="password"
                    onChange={(e) => setValues({...values, password: e.target.value})}/>
                </div>
                <div>
                    <input type="text" placeholder="Rol" required name="role"
                    onChange={(e) => setValues({...values, role: e.target.value})}/>

                </div> 
                <button type="submit">Registrar</button>
        </form>
        )
}

export default RegisterUser;