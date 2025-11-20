/**
 * ModificacionProveedoresModal.jsx
 *
 * Modal para modificar los datos de un proveedor.
 *
 * Props:
 *  - closeModal (func): función para cerrar el modal. Se llama como closeModal(false).
 *  - codigo (string): identificador del proveedor cuyos datos se deben cargar y modificar.
 *
 * Estado local (values):
 *  - codigo: string (campo deshabilitado)
 *  - nombre: string
 *  - telefono: string
 *  - correo: string
 *
 * Comportamiento:
 *  - useEffect: al recibir `codigo`, realiza GET a /GetProveedorData/:codigo y carga los datos.
 *  - handleChange: actualiza el estado conforme se modifican los campos.
 *  - handleSubmit: envía POST a /update_proveedor con los valores modificados.
 *
 * Validaciones:
 *  - Todos los inputs son requeridos.
 *  - Se muestra toast para errores o confirmaciones.
 *
 * Endpoints:
 *  - GET  http://localhost:8081/GetProveedorData/:codigo
 *  - POST http://localhost:8081/update_proveedor
 *
 */

import './Modal.css';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function ModificacionProveedoresModal({ closeModal, codigo }) {
  const [values, setValues] = useState({
    codigo: '',
    nombre: '',
    telefono: '',
    correo: '',
  });

  // Cargar datos del proveedor
  useEffect(() => {
    if (codigo) {
      axios
        .get(`http://localhost:8081/GetProveedorData/${codigo}`)
        .then((res) => {
          if (res.status === 200) {
            const data = res.data;
            setValues({
              codigo: data.codigo,
              nombre: data.nombre,
              telefono: data.telefono,
              correo: data.correo,
            });
          } else {
            toast.error(res.data.Error || 'Error al obtener los datos del proveedor.');
          }
        })
        .catch((error) => {
          toast.error('Error al obtener los datos del proveedor.');
          console.error(error);
        });
    }
  }, [codigo]);

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // Enviar actualización
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.post('http://localhost:8081/update_proveedor', values);
      if (res.status === 200) {
        toast.success('Proveedor modificado correctamente.');
        setTimeout(() => {
          closeModal(false);
          window.location.reload();
        }, 1200);
      } else {
        toast.error(res.data.Error || 'Error al actualizar el proveedor.');
      }
    } catch (err) {
      toast.error('No se pudo actualizar el proveedor.');
      console.error(err);
    }
  };

  return (
    <>
      <Toaster />
      <div className="modalBackground_user">
        <div className="modalContainer_user">
          <div className="header">Modificación de Proveedores</div>

          <div className="forms_user">
            <form onSubmit={handleSubmit} className="formModal_user">
              <div className="rowInput">
                <div className="inputLabel_user">
                  <label className="labelModal_user" htmlFor="codigo">Código</label>
                  <input
                    className="inputAlta_user"
                    id="codigo"
                    name="codigo"
                    type="text"
                    value={values.codigo}
                    disabled
                  />
                </div>

                <div className="inputLabel_user">
                  <label className="labelModal_user" htmlFor="nombre">Nombre</label>
                  <input
                    className="inputAlta_user"
                    required
                    id="nombre"
                    name="nombre"
                    type="text"
                    maxLength="50"
                    value={values.nombre}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="rowInput">
                <div className="inputLabel_user">
                  <label className="labelModal_user" htmlFor="telefono">Teléfono</label>
                  <input
                    className="inputAlta_user"
                    required
                    id="telefono"
                    name="telefono"
                    type="text"
                    maxLength="20"
                    value={values.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="inputLabel_user">
                  <label className="labelModal_user" htmlFor="correo">Correo</label>
                  <input
                    className="inputAlta_user"
                    required
                    id="correo"
                    name="correo"
                    type="email"
                    maxLength="50"
                    value={values.correo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div id="buttons" style={{ marginTop: '3%' }}>
                <button id="acceptButton_user" type="submit">Aceptar</button>
                <button id="cancelButton_user" type="button" onClick={() => closeModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

ModificacionProveedoresModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  codigo: PropTypes.string.isRequired,
};

export default ModificacionProveedoresModal;
