import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

function AltaProductosModal({ closeModal }) {
    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        cantidad: 0, // siempre inicia en 0
        cantidad_minima: '',
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        // Forzamos que cantidad siempre sea 0 al enviar
        const dataToSend = {
            ...values,
            cantidad: 0,
        };

        axios.post('http://localhost:8081/insertarProducto', dataToSend)
            .then(res => {
                if (res.data.Status === 'Exito') {
                    window.location.reload();
                } else {
                    toast.error(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case 'codigo':
                newValue = value.slice(0, 13);
                break;
            case 'cantidad_minima':
                newValue = value.slice(0, 5);
                break;
            case 'precio':
                newValue = value.slice(0, 10);
                break;
            default:
                break;
        }

        setValues({ ...values, [name]: newValue });
    };

    const handleKeyDown = (e) => {
        const { name } = e.target;
        const maxLength = {
            codigo: 13,
            cantidad_minima: 5,
            precio: 10,
        };
        const actualLength = values[name]?.replace(/\./g, '').length || 0;

        if (['codigo', 'cantidad_minima', 'precio'].includes(name)) {
            if (e.key === '-') e.preventDefault();
            const inputElement = document.getElementById(name);
            if (!isTextSelected(inputElement)) {
                if (
                    e.key !== 'Backspace' &&
                    e.key !== 'Delete' &&
                    e.key !== 'Tab' &&
                    actualLength >= maxLength[name]
                ) {
                    e.preventDefault();
                }
            }
        }
    };

    function isTextSelected(input) {
        if (typeof input?.selectionStart === 'number') {
            return input.selectionStart === 0 && input.selectionEnd === input.value.length;
        } else if (typeof document.selection !== 'undefined') {
            input.focus();
            return document.selection.createRange().text === input.value;
        }
    }

    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer">
                    <div className="header">
                        Alta de Productos
                    </div>
                    <div className="forms">
                        <form onSubmit={handleSubmit}>
                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='nombre'>Nombre</label>
                                <input
                                    className="inputAlta"
                                    required
                                    id="nombre"
                                    name='nombre'
                                    maxLength='35'
                                    value={values.nombre}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='codigo'>Código</label>
                                <input
                                    className="inputAlta"
                                    required
                                    type='number'
                                    id="codigo"
                                    name='codigo'
                                    step="any"
                                    min='0'
                                    value={values.codigo}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='precio'>Precio</label>
                                <input
                                    className="inputAlta"
                                    required
                                    type='number'
                                    id="precio"
                                    min='0'
                                    step='0.01'
                                    name='precio'
                                    value={values.precio}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='cantidad_minima'>Cantidad Min.</label>
                                <input
                                    className="inputAlta"
                                    required
                                    type='number'
                                    id="cantidad_minima"
                                    min='0'
                                    step="any"
                                    name='cantidad_minima'
                                    value={values.cantidad_minima}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            {/* Mostrar cantidad en 0 y bloqueada */}
                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='cantidad'>Cantidad Actual</label>
                                <input
                                    className="inputAlta"
                                    type='number'
                                    id="cantidad"
                                    name='cantidad'
                                    value={values.cantidad}
                                    readOnly
                                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div id='buttons'>
                                <button id='acceptButton' type='submit'>Aceptar</button>
                                <button id='cancelButton' onClick={() => closeModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

AltaProductosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default AltaProductosModal;
