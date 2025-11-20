/**
 * Eliminar.jsx
 *
 * Componente React que muestra un botón/ícono para abrir el modal de eliminación de usuarios.
 *
 * Propósito:
 *  - Renderizar un ícono (delIcon) que actúa como trigger visual.
 *  - Al hacer clic en el ícono, abrir EliminarModal para confirmar la eliminación.
 *
 * Estado:
 *  - openModal (boolean): controla si el modal de eliminación está abierto.
 *
 * Comportamiento:
 *  - onClick en la imagen: setOpenModal(true) -> muestra <EliminarModal closeModal={setOpenModal} />.
 *  - El modal recibe la función setOpenModal como closeModal; debe llamar closeModal(false) para cerrarse.
 *
 * Importaciones:
 *  - useState: hook de React para controlar openModal.
 *  - delIcon: asset SVG usado como ícono de eliminar.
 *  - EliminarModal: componente modal que contiene la lógica de confirmación/eliminación.
 *
 */

import { useState } from 'react'
import delIcon from '../assets/inventario/-.svg'
import EliminarModal from './EliminarModal';

function Eliminar() {
const [openModal, setOpenModal] = useState(false);
  return (
    <>
    <div style={{display:'flex', color:'black'}}>
        <img src={delIcon} id='eliminar' onClick={()=>{
        setOpenModal(true);
        }}></img>
     {openModal && <EliminarModal closeModal={setOpenModal}/>}
    </div>
    </>
  )
}

export default Eliminar