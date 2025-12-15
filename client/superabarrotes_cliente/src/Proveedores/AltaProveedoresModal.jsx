import PropTypes from 'prop-types';
import axios from 'axios'
import { useState } from 'react'
// NOTA: Se ha quitado 'import './Modal.css'' para evitar el error de compilación.

/**
 * Componente modal para dar de alta nuevos proveedores.
 * Mantiene la estructura de clases y estilos originales.
 */
function AltaProveedoresModal({ closeModal }) {
  const [values, setValues] = useState({
    codigo: '',
    nombre: '',
    telefono: '',
    correo: ''
  });
  // Estado para manejar errores de validación locales o errores del servidor
  const [localError, setLocalError] = useState('');

  // Expresión regular para validar formato básico de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = (event) => {
    event.preventDefault();
    setLocalError(''); // Limpiar errores anteriores

    // 1. Validación de formato de correo electrónico
    if (values.correo && !emailRegex.test(values.correo)) {
      setLocalError('Error: El formato del correo electrónico no es válido.');
      return;
    }

    // 2. Validación de que el teléfono solo contenga números y tenga exactamente 10 dígitos
    if (values.telefono && !/^\d+$/.test(values.telefono)) {
      setLocalError('Error: El campo Teléfono solo debe contener números.');
      return;
    }
    
    if (values.telefono.length !== 10) {
        setLocalError('Error: El campo Teléfono debe contener exactamente 10 dígitos.');
        return;
    }

    // Si todo es válido, procede con el envío
    axios.post('http://localhost:8081/insertarProveedor', values)
      .then(res => {
        if (res.status === 200) {
          // Asumiendo que el servidor devuelve Status 200 en éxito
          window.localStorage.setItem('showToast', res.data.message || 'Proveedor registrado con éxito');
          window.location.reload();
        } else if (res.data.Error) {
          // Manejo de errores del servidor (ej: código duplicado)
          setLocalError(res.data.Error);
        } else {
            setLocalError('Error desconocido al registrar el proveedor.');
        }
      })
      .catch(err => {
        console.error("Error en la solicitud POST:", err);
        setLocalError('Error de conexión con el servidor. Intente más tarde.');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Limpiar errores locales al empezar a escribir
    if (localError) setLocalError('');

    switch (name) {
      case 'nombre':
        // Restricción de longitud para nombre
        newValue = value.slice(0, 50);
        break;
      case 'telefono':
        // 1. Permitir solo números y limitar longitud a 10
        newValue = value.replace(/\D/g, ''); // Elimina cualquier caracter que no sea dígito
        newValue = newValue.slice(0, 10); // <-- Limitado a 10
        break;
      case 'correo':
        // Restricción de longitud para correo
        newValue = value.slice(0, 50);
        break;
      case 'codigo':
        // Restricción de longitud para código
        newValue = value.slice(0, 10);
        break;
      default:
        break;
    }

    setValues({ ...values, [name]: newValue });
  };

  return (
    <div className="modalBackground_user">
      <div className="modalContainer_user">
        <div className="header">Alta de Proveedores</div>

        <div className="forms_user">
          <form onSubmit={handleSubmit} className='formModal_user'>
            <div className='rowInput'>
              <div className='inputLabel_user'>
                <label className="labelModal_user" htmlFor='codigo'>Código</label>
                <input
                  className="inputAlta_user"
                  required
                  id="codigo"
                  name='codigo'
                  type='text'
                  maxLength='10'
                  value={values.codigo}
                  onChange={handleChange}
                />
              </div>
              <div className='inputLabel_user'>
                <label className="labelModal_user" htmlFor='nombre'>Nombre</label>
                <input
                  className="inputAlta_user"
                  required
                  id="nombre"
                  name='nombre'
                  type='text'
                  maxLength='50'
                  value={values.nombre}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className='rowInput'>
              <div className='inputLabel_user'>
                <label className="labelModal_user" htmlFor='telefono'>Teléfono (10 dígitos)</label>
                <input
                  className="inputAlta_user"
                  required
                  id="telefono"
                  name='telefono'
                  // Usamos type='tel' y restringimos a 10 dígitos
                  type='tel' 
                  maxLength='10' 
                  value={values.telefono} 
                  onChange={handleChange}
                />
              </div>
              <div className='inputLabel_user'>
                <label className="labelModal_user" htmlFor='correo'>Correo</label>
                <input
                  className="inputAlta_user"
                  required
                  id="correo"
                  name='correo'
                  // Usamos type='email' para validación del navegador (además de la validación en JS)
                  type='email' 
                  maxLength='50'
                  value={values.correo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Muestra el error usando el estado local y los estilos originales */}
            {localError && (
              <error
                id="usererror"
                style={{
                  color: "red",
                  marginLeft: "20%",
                  fontSize: "120%",
                  marginTop: "1%",
                  marginBottom: '1%'
                }}
              >
                {localError}
              </error>
            )}

            <div id='buttons' style={{ marginTop: '3%' }}>
              <button id='acceptButton_user' type='submit'>Aceptar</button>
              <button id='cancelButton_user' type='button' onClick={() => closeModal(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

AltaProveedoresModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default AltaProveedoresModal;