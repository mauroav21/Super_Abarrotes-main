/**
 * AltaUsuarios.jsx
 *
 * Componente que renderiza un trigger visual para abrir el modal de alta de usuarios.
 *
 * Propósito:
 *  - Mostrar un icono (SVG) y la etiqueta "Alta de Usuarios".
 *  - Abrir el componente modal AltaUsuariosModal al hacer clic en el icono.
 *
 * Importaciones:
 *  - useState: hook de React para controlar estado local (openModal).
 *  - AltaUsuariosModal: componente modal que contiene el formulario de registro.
 *  - alta: asset SVG usado como botón.
 *  - './AltaUsuarios.css': estilos del componente.
 *
 * Estado:
 *  - openModal (boolean): false por defecto. Si es true, se renderiza el modal.
 *
 * Comportamiento:
 *  - Al hacer click en la imagen (id='altaUsuarios') se ejecuta setOpenModal(true) y aparece el modal.
 *  - El modal recibe la función setOpenModal como prop closeModal. El modal debe cerrarse llamando closeModal(false).
 *  - El componente solo abre/cierra el modal; la lógica de creación de usuarios está en AltaUsuariosModal.
 *
 * Accesibilidad y mejoras recomendadas:
 *  - Añadir alt en la imagen: <img alt="Alta de usuarios" ... /> para accesibilidad.
 *  - Considerar role="button" y tabIndex="0" para permitir interacción por teclado.
 *  - Evitar recargas de página dentro del modal; usar callbacks para actualizar la lista de usuarios.
 *
 * >>REVISA LOS COMENTARIOSSS<<
 */
 
import { useState } from 'react'
import AltaProveedoresModal from './AltaProveedoresModal';
import alta from '../assets/inventario/altaproductos.svg'
import './AltaProveedores.css'

function AltaProveedores() {
const [openModal, setOpenModal] = useState(false);
  return (
    <>
    <div style={{display:'flex', color:'black'}}>
        <img src={alta} id='altaUsuarios' onClick={()=>{
        setOpenModal(true);
        }}></img>
    <p id='label'>Alta de Proveedores</p>
     {openModal && <AltaProveedoresModal closeModal={setOpenModal}/>}
    </div>
    </>
  )
}

export default AltaProveedores