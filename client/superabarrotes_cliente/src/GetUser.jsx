/**
 * GetUser.jsx
 *
 * Propósito:
 *  - Consultar al backend el usuario autenticado y mostrar su nombre y rol.
 *
 * Comportamiento:
 *  - Al montarse el componente (useEffect) realiza una petición GET a:
 *      GET http://localhost:8081/GetUser
 *    con credenciales (withCredentials: true) para enviar la cookie JWT.
 *  - Si la petición tiene éxito, obtiene response.data.name y response.data.rol
 *    y los guarda en el estado local (name, rol).
 *  - Si ocurre un error, lo registra en la consola.
 *
 * Estado local:
 *  - name: string | undefined — nombre del usuario (mostrado en un <h2>).
 *  - rol: string | undefined  — rol del usuario (mostrado en un <p>).
 *
 * Render:
 *  - Muestra el nombre en un <h2> y el rol en un <p> con estilos inline.
 *
 */
import { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'

function GetUser(){
    const [name,setName] = useState();
    const [rol,setRol] = useState();

    useEffect(() => {
        axios.get('http://localhost:8081/GetUser',{ withCredentials: true })
          .then(response => {
            const name = response.data.name;
            const rol = response.data.rol;
            setName(name);
            setRol(rol)
            console.log(name);
          })
          .catch(error => {
            console.error(error);
          });
      }, []);

      return(
        <>
            <h2 style={{marginBottom: '0',marginLeft:'7%', textAlign:'center'}}>{name}</h2>
            <p style={{textAlign:'center',fontSize:'130%',marginTop:'0'}}>{rol}</p>
        </>
      )
}

export default GetUser