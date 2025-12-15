import { useState } from 'react';
import CobrarModal from './CobrarModal';

function Cobrar({ productos }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      {/* Usamos las clases de Tailwind que ya definiste para el botón "Cobrar" */}
      <button 
        className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-150 transform hover:scale-[1.02]" 
        onClick={() => setOpenModal(true)}
      >
        Cobrar
      </button>
      {openModal && <CobrarModal closeModal={() => setOpenModal(false)} data={productos} />}
    </>
  );
}

export default Cobrar;