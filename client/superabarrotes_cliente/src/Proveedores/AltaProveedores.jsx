
 
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