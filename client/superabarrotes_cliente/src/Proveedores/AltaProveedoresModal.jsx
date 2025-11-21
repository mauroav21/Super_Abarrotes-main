import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useState } from 'react'

function AltaProveedoresModal({ closeModal }) {
  const [values, setValues] = useState({
    codigo: '',
    nombre: '',
    telefono: '',
    correo: ''
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const usererror = document.getElementById("usererror");

    axios.post('http://localhost:8081/insertarProveedor', values)
      .then(res => {
        if (res.status === 200) {
          window.localStorage.setItem('showToast', 'Proveedor registrado con éxito');
          window.location.reload();
        } else {
          if (res.data.Error?.toLowerCase().includes("codigo")) {
            usererror.innerHTML = res.data.Error;
            if (!usererror.hasAttribute("open")) usererror.toggleAttribute("open");
          }
        }
      })
      .catch(err => console.log(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    switch (name) {
      case 'nombre':
        newValue = value.slice(0, 50);
        break;
      case 'telefono':
        newValue = value.slice(0, 20);
        break;
      case 'correo':
        newValue = value.slice(0, 50);
        break;
      case 'codigo':
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
                <label className="labelModal_user" htmlFor='telefono'>Teléfono</label>
                <input
                  className="inputAlta_user"
                  required
                  id="telefono"
                  name='telefono'
                  type='text'
                  maxLength='20'
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
                  type='email'
                  maxLength='50'
                  value={values.correo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <error
              id="usererror"
              style={{
                color: "red",
                marginLeft: "20%",
                fontSize: "120%",
                marginTop: "1%",
                marginBottom: '1%'
              }}
            ></error>

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
