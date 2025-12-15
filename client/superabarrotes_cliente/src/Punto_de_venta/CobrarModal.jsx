import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import NotificacionInventario from './NotificacionInventario';

function CobrarModal({ closeModal, data}) {
    const [costo, setCosto] = useState(0.0);
    const [pago, setPago] = useState(0.0);
    const [selectedFaltantes, setFaltantes] = useState([]);
    const [showNotification, setShowNotification] = useState(false); 
    const [username, setUsername] = useState('');

    // 1. Calcular el costo inicial de la venta y obtener el usuario al cargar
    useEffect(() => {
        calcularCosto();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('http://localhost:8081/GetUser', { withCredentials: true });
            setUsername(response.data.username);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            toast.error('No se pudo obtener el usuario. Inicie sesión nuevamente.', { duration: 4000 });
        }
    };

    const calcularCosto = () => {
        if (data && data.length > 0) {
            const costo_aux = data.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            setCosto(costo_aux);
        }
    };
      
    // 2. Función de cobro usando async/await
    const realizarCobro = async () => {
        if (!username) {
            toast.error('Usuario no autenticado o no cargado.', { duration: 4000 });
            return;
        }
        
        if (pago < costo) {
            toast.error('MONTO INSUFICIENTE');
            return;
        }
        
        if (!data || data.length === 0) {
            toast.error('No hay productos en la lista de venta.');
            return;
        }

        const productosParaVenta = data.map(item => ({
            codigo: item.value,
            cantidad: item.cantidad,
            precio: item.precio, 
            nombre: item.nombre
        }));

        try {
            // Paso 1: Realizar el cobro POST al backend
            const response = await axios.post('http://localhost:8081/realizarCobro', { 
                pago, 
                costo, 
                data: productosParaVenta,
                username 
            });

            // Respuesta 200: Venta exitosa
            if (response.data.Status === 'Exito') {
                const faltantes = response.data.Faltantes;
                const payload = { pago, costo, data: productosParaVenta };
                localStorage.setItem('showToast', 'Venta exitosa');

                // Paso 2: Generar el ticket PDF y abrirlo automáticamente
                try {
                    const pdfResponse = await axios.post('http://localhost:8081/imprimir-ticket', payload, {
                        responseType: 'blob' 
                    });
                    
                    // 1. Crea el URL temporal a partir del Blob
                    const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
                    const fileURL = window.URL.createObjectURL(blob);
                    
                    // 2. Abre el PDF en una nueva pestaña
                    const pdfWindow = window.open(fileURL, '_blank'); 

                    // 3. (Opcional) Limpia el objeto URL una vez que la ventana se abre/cierra
                    if (pdfWindow) {
                        pdfWindow.onload = () => {
                            window.URL.revokeObjectURL(fileURL);
                        };
                        // En caso de que el navegador bloquee la ventana emergente
                    } else {
                        toast.error('El navegador bloqueó la apertura automática del ticket. Descargando...', { duration: 4000 });
                        
                        // Si se bloquea, forzar la descarga manual
                        const link = document.createElement('a');
                        link.href = fileURL;
                        const ventaNum = response.data.num_venta ? response.data.num_venta : new Date().getTime();
                        link.setAttribute('download', `ticket_venta_${ventaNum}.pdf`); 
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(fileURL);
                    }
                    
                } catch (err) {
                    console.error('Error al generar/abrir el ticket PDF:', err);
                    toast.error('Venta exitosa, pero no se pudo generar el ticket PDF.', { duration: 4000 });
                }

                // Paso 3: Mostrar notificación de inventario bajo o cerrar modal
                if (faltantes && faltantes.length > 0) {
                    setFaltantes(faltantes);
                    setShowNotification(true); 
                } else {
                    // Si no hay faltantes, cerramos el modal y redirigimos
                    closeModal(false); 
                    window.location.replace('/punto_de_venta');
                }
            }

        } catch (err) {
            // Captura errores HTTP (400, 500, etc.)
            console.error('Error en el POST /realizarCobro:', err);

            if (err.response && err.response.data) {
                const resData = err.response.data;
                let fullMessage = resData.Error || `Error del servidor (${err.response.status}).`;
                
                if (resData.detalles && Array.isArray(resData.detalles) && resData.detalles.length > 0) {
                    fullMessage += '. Revise la lista: ' + resData.detalles.join(', ');
                }

                toast.error(fullMessage, { duration: 6000 });
            } else {
                toast.error('Error de conexión o servidor no disponible.', { duration: 4000 });
            }
        }
    };
      
    const getCambio = () => {
        const cambio = pago - costo;
        return cambio < 0 ? 0 : cambio;
    };

    const handleNotificationClose = () => {
        setShowNotification(false);
        closeModal(false);
        window.location.replace('/punto_de_venta'); 
    };

    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer" style={{/* ...estilos... */}}>
                    <div className="header">
                        Cobro
                    </div>
                    <div className="forms" style={{alignItems: 'center', justifyContent: 'center'}}>
                        {/* Muestra el costo */}
                        <p style={{color: 'black', fontSize: '250%', fontWeight: '800', marginLeft: '30%', marginTop: '63'}}>Total: ${costo.toFixed(2)}</p>
                        
                        {/* Input de Pago */}
                        <label htmlFor='pago'  style={{color: 'black', fontSize: '250%', fontWeight: '800', marginLeft: '30%'}}>Pago: </label>
                        <input 
                            name="pago" 
                            type="number" 
                            placeholder="Ingrese el monto" 
                            style={{width: '20%', height: '10%', borderRadius: '5px', borderColor: '#CD1C18', marginTop: '5%', marginLeft: '0%'}} 
                            onChange={e => setPago(e.target.valueAsNumber || 0)} 
                        />
                        
                        {/* Muestra el cambio */}
                        <p style={{color: 'black', fontSize: '250%', fontWeight: '800', marginLeft: '30%'}}>Cambio:  ${getCambio().toFixed(2)}</p>
                        
                        <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '5%'}}>
                            {/* Botones */}
                            <button className='button_delete' onClick={realizarCobro}>Cobrar</button>
                            <button className='button_delete' onClick={() => closeModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Renderiza el modal de notificación si es necesario */}
            {showNotification && (
                <NotificacionInventario
                    closeModal={handleNotificationClose}
                    faltantes={selectedFaltantes}
                />
            )}
        </>
    );
}

CobrarModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
};

export default CobrarModal;