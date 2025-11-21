import { useState } from 'react';
import compraIcon from '../assets/inventario/-.svg'; // reemplaza con un icono adecuado para compras
import './AltaProductos.css';
import RegistrarCompraModal from './RegistrarCompraModal'; // nuevo modal para compras

function RegistrarCompra() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', color: 'black' }}>
        <img
          src={compraIcon}
          id='registrarCompra'
          onClick={() => setOpenModal(true)}
          alt='Registrar Compra'
          style={{ cursor: 'pointer' }}
        />
        {openModal && <RegistrarCompraModal closeModal={setOpenModal} />}
      </div>
    </>
  );
}

export default RegistrarCompra;
