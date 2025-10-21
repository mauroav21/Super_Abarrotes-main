/**
 * Logout.jsx
 *
 * Propósito:
 *  - Componente que verifica si el usuario está autenticado y muestra un enlace para cerrar sesión.
 *
 * Comportamiento:
 *  - Al montarse (useEffect) hace una petición GET a http://localhost:8081/ para comprobar la sesión.
 *    - Si la respuesta contiene { Status: "Exito" } pone auth = true.
 *    - Si no, redirige al inicio de sesión en http://localhost:5173/.
 *  - axios.defaults.withCredentials = true para enviar cookies (JWT) en las peticiones.
 *
 * Estado:
 *  - auth (boolean): indica si el usuario está autenticado (muestra el enlace de "Cerrar Sesión" cuando es true).
 *
 * Funciones:
 *  - handleDelete:
 *      - Llama a GET http://localhost:8081/logout para invalidar la sesión (backend debería eliminar la cookie).
 *      - Tras la respuesta recarga la página con location.reload(true).
 *
 * Render:
 *  - Si auth === true: muestra un <a> que actúa como botón (onClick) para cerrar sesión.
 *  - Si auth === false: no muestra nada relevante (div vacío).
 *
 */

import { useEffect, useState } from 'react';
import axios from 'axios';

function Logout(){
    const [auth, setAuth] = useState(false);
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:8081/')
        .then(res => {
            console.log(res.data); 
            if(res.data.Status === "Exito"){
                setAuth(true);
            }else{
                setAuth(false);
                window.location.href = 'http://localhost:5173/';
             }
        })
        .then(err => console.log(err));
    }, [])

    const handleDelete = () => {
        axios.get('http://localhost:8081/logout')
        // eslint-disable-next-line no-unused-vars
        .then(res => {
            location.reload(true);
        }).catch(err=>console.log(err));
    }
    return (
        <div>
            {
                auth  ?
                <div>
                    <a onClick={handleDelete} style={{cursor: 'pointer',fontSize: '1.2em'}}>Cerrar Sesión</a>
                </div>
                :
                <div>
                </div>
            }
        </div>
    )
}
export default Logout;