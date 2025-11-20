/**
 * EliminarProveedorModal.jsx
 *
 * Modal para confirmar y ejecutar la eliminación de un proveedor.
 *
 * Props:
 *  - closeModal (func): Función para cerrar el modal.
 *  - codigo (string): Código del proveedor a eliminar.
 *
 * Estado local:
 *  - values: contiene los datos del proveedor (codigo, nombre, contacto, teléfono, etc.)
 *
 * Efectos:
 *  - Al cambiar `codigo`, se obtiene la información del proveedor desde:
 *      GET http://localhost:8081/GetProveedorData/:codigo
 *
 * Funciones:
 *  - handleDelete(codigo): Envía DELETE a:
 *      DELETE http://localhost:8081/deleteProveedor/:codigo
 *    y si es exitoso, muestra confirmación y recarga la vista.
 *
 */

import './Modal.css';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function EliminarProveedorModal({ closeModal, codigo }) {
  const [values, setValues] = useState({
    codigo: '',
    nombre: '',
    contacto: '',
    telefono: '',
    direccion: '',
  });

  // Obtener los datos del proveedor al abrir el modal
  useEffect(() => {
    if (!codigo) return;

    const fetchProveedorData = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/GetProveedorData/${codigo}`);
        if (res.status === 200) {
          const prov = res.data;
          setValues({
            codigo: prov.codigo,
            nombre: prov.nombre,
            contacto: prov.contacto,
            telefono: prov.telefono,
            direccion: prov.direccion,
          });
        } else {
          toast.error(res.data.Error || 'Error al obtener los datos del proveedor.');
        }
      } catch (error) {
        toast.error('Error al obtener los datos. Intenta nuevamente.');
        console.error(error);
      }
    };

    fetchProveedorData();
  }, [codigo]);

  // Eliminar proveedor
  const handleDelete = async () => {
    try {
      const res = await axios.delete(`http://localhost:8081/deleteProveedor/${values.codigo}`);
      if (res.status === 200) {
        toast.success('Proveedor eliminado correctamente.');
        setTimeout(() => {
          closeModal(false);
          window.location.reload(); // idealmente refrescar tabla padre
        }, 1000);
      } else {
        toast.error('Error al eliminar el proveedor.');
      }
    } catch (error) {
      toast.error('No se pudo eliminar el proveedor.');
      console.error(error);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="modalBackground">
        <div
          className="modalContainer"
          style={{ backgroundImage: 'unset', maxHeight: '33%', marginTop: '6%' }}
        >
          <div className="header">¿Estás seguro de que deseas eliminar este proveedor?</div>

          <div className="forms" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ul style={{ color: 'black', fontSize: '170%' }}>
              <li><strong>Código:</strong> {values.codigo}</li>
              <li><strong>Nombre:</strong> {values.nombre}</li>
              <li><strong>Contacto:</strong> {values.contacto}</li>
              <li><strong>Teléfono:</strong> {values.telefono}</li>
            </ul>

            <p style={{ color: 'black', fontSize: '200%', fontWeight: '800' }}>
              Esta acción no puede deshacerse
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '5%' }}>
              <button className="button_delete" onClick={handleDelete}>
                Sí
              </button>
              <button className="button_delete" onClick={() => closeModal(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

EliminarProveedorModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  codigo: PropTypes.string, // puede ser null al inicio
};

export default EliminarProveedorModal;
