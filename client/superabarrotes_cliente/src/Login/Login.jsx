import { useEffect, useState } from 'react'
import ellipse from '../assets/login/ellipse.svg'
import tienda from '../assets/login/tienda.webp'
import logo from '../assets/login/logo.svg'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// --- ESTILOS EN LÍNEA DEFINIDOS COMO OBJETOS JAVASCRIPT ---

const styles = {
    // 1. Estilos del Contenedor Principal (Simulando body/login-container)
    container: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
    },
    loginBox: {
        display: 'flex',
        width: '80%',
        maxWidth: '1000px',
        minHeight: '600px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        // Nota: Manejo de media queries omitido en JS simple, se asume un entorno de escritorio.
    },
    // 2. Lado de Ilustración (Izquierda)
    illustrationSide: {
        flex: 1,
        background: 'linear-gradient(135deg, #1e90ff, #00bfff)',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '20px',
    },
    tiendaImage: {
        maxWidth: '80%',
        height: 'auto',
        zIndex: 2,
    },
    backgroundEllipse: {
        position: 'absolute',
        width: '150%',
        height: '150%',
        opacity: 0.1,
        zIndex: 1,
    },
    overlayText: {
        position: 'absolute',
        bottom: '40px',
        textAlign: 'center',
        zIndex: 3,
        padding: '0 20px',
    },
    h2: {
        marginBottom: '5px',
        fontSize: '1.8em',
        fontWeight: 600,
    },
    p: {
        fontSize: '1.1em',
        fontWeight: 300,
    },
    // 3. Lado del Formulario (Derecha)
    formSide: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        textAlign: 'center',
    },
    logoForm: {
        width: '100px',
        marginBottom: '20px',
    },
    h1: {
        fontSize: '2.5em',
        color: '#333',
        marginBottom: '5px',
        fontWeight: 700,
    },
    subtitle: {
        color: '#666',
        marginBottom: '40px',
        fontSize: '1.1em',
    },
    loginForm: {
        width: '100%',
        maxWidth: '350px',
    },
    // 4. Estilos de Input (Ajuste para color de texto)
    inputGroup: {
        marginBottom: '20px',
    },
    inputFieldBase: {
        width: '100%',
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        fontSize: '1em',
        boxSizing: 'border-box',
        outline: 'none',
        backgroundColor: '#f9f9f9',
        transition: 'all 0.3s ease',
        color: '#000', // <--- ESTE ES EL AJUSTE CLAVE: Texto de las credenciales en negro
    },
    // 5. Estilos de Botón
    submitButton: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#1e90ff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s ease',
    },
    // 6. Estilos de Error
    errorMessage: {
        color: '#ff4d4f',
        fontSize: '0.9em',
        marginTop: '-10px',
        marginBottom: '20px',
        textAlign: 'left',
        paddingLeft: '5px',
    },
    footerText: {
        color: '#aaa',
        fontSize: '0.8em',
        marginTop: 'auto',
    }
};

function Login() {
    const [values, setValues] = useState({
        username: '',
        password: '',
    })
    const [showLogin, setShowLogin] = useState(false);
    const [error, setError] = useState({ user: '', password: '' });
    const navigate = useNavigate();
    
    axios.defaults.withCredentials = true;

    const handleSubmit = (event) => {
        event.preventDefault();
        setError({ user: '', password: '' });
        
        axios.post('http://localhost:8081/login', values)
        .then(res => {
            if(res.data.Status === 'Exito'){
                navigate('/punto_de_venta');
            } else {
                const errorMessage = res.data.Error || 'Error de conexión';
                if(errorMessage.toLowerCase().includes("usuario")){
                    setError({ ...error, user: errorMessage });
                } else if(errorMessage.toLowerCase().includes("contraseña")){
                    setError({ ...error, password: errorMessage });
                } else {
                    setError({ user: errorMessage, password: '' }); 
                }
            }
        })
        .catch(err => {
             console.error(err);
             setError({ user: 'Error al conectar con el servidor', password: '' });
        });
    }

    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.get("http://localhost:8081/")
            .then((res) => {
                if (res.data?.Status === "Exito") {
                    setShowLogin(false);
                    navigate("/punto_de_venta");
                }else{
                    setShowLogin(true);
                }
            })
            .catch(() => {
                setShowLogin(true);
            });
    
    }, [navigate]);

    return (
        <div style={styles.container}>
        { showLogin ? (
            <div style={styles.loginBox}>
                {/* Lado Izquierdo - Ilustración o Marca */}
                <div style={styles.illustrationSide}>
                    <img src={tienda} style={styles.tiendaImage} alt="Ilustración de Tienda" />
                    <img src={ellipse} style={styles.backgroundEllipse} alt="Fondo" />
                    <div style={styles.overlayText}>
                        <h2 style={styles.h2}></h2>
                        <p style={styles.p}></p>
                    </div>
                </div>

                {/* Lado Derecho - Formulario de Login */}
                <div style={styles.formSide}>
                    <img src={logo} style={styles.logoForm} alt='Logo de la Aplicación' />
                    <h1 style={styles.h1}>Bienvenido</h1>
                    <p style={styles.subtitle}>Ingresa tus credenciales para continuar</p>
                    
                    <form onSubmit={handleSubmit} id="loginform" style={styles.loginForm}>
                        
                        {/* Campo Usuario */}
                        <div style={styles.inputGroup}>
                            <input 
                                style={{
                                    ...styles.inputFieldBase, 
                                    ...(error.user ? { borderColor: '#ff4d4f' } : {})
                                }}
                                type="text" 
                                placeholder="Nombre de usuario"
                                required
                                maxLength={20}
                                name='username'
                                onChange={(e) => setValues({...values, username: e.target.value})}
                            />
                        </div>
                        {error.user && <p style={styles.errorMessage}>{error.user}</p>}
                        
                        {/* Campo Contraseña */}
                        <div style={styles.inputGroup}>
                            <input 
                                style={{
                                    ...styles.inputFieldBase,
                                    ...(error.password ? { borderColor: '#ff4d4f' } : {})
                                }}
                                type="password" 
                                placeholder="Contraseña"
                                required
                                maxLength={20}
                                name='password'
                                onChange={(e) => setValues({...values, password: e.target.value})}
                            />
                        </div>
                        {error.password && <p style={styles.errorMessage}>{error.password}</p>}
                        
                        <button type="submit" style={styles.submitButton}>
                            INGRESAR
                        </button>
                        
                    </form>
                    
                    <p style={styles.footerText}>© 2025 mauro.av - Algunos los derechos reservados.</p>
                </div>
            </div>
        ) : (
            <div style={styles.container}>
                {/* Contenido de carga */}
            </div>
        )
        }
        </div>
    )
}

export default Login;