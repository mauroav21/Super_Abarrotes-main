import { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import delIcon from '../assets/inventario/-.svg'
import modIcon from '../assets/inventario/modIcon.svg'
import showIcon from '../assets/usuarios/mostrar.svg'
import hideIcon from '../assets/usuarios/esconder.svg'
import ModificacionUsuariosModal from './ModificacionUsuariosModal';
import EliminarModal from './EliminarModal.jsx';
import PropTypes from 'prop-types'; // 🛑 Importar PropTypes

// 🛑 Recibir la prop shouldReload
function DataTableComponent({ shouldReload }) { 
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    const customStyles = { /* ... (tus estilos) ... */
        headRow: {
            style: {
                backgroundColor: "#12274b",
                color: "white",
                fontSize: "170%",
                height: "200%",
            },
        },
    }

    // ----------------------------------------------------
    // 1. FUNCIÓN PARA CARGAR/RECARGAR DATOS
    // ----------------------------------------------------
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/data_usuarios');
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []); // Dependencias vacías: fetchData es estable

    // ----------------------------------------------------
    // 2. USE EFFECT PARA CARGA INICIAL
    // ----------------------------------------------------
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ----------------------------------------------------
    // 🛑 3. USE EFFECT PARA RECARGA EXTERNA (DESDE Admin_usuarios)
    // ----------------------------------------------------
    useEffect(() => {
        // Recargar si la prop shouldReload es verdadera (trigger del modal de Alta)
        if (shouldReload) {
            console.log("DataTableComponent: Recargando datos por trigger de Alta de Usuario.");
            fetchData(); 
            // NOTA: El componente padre (Admin_usuarios) es el responsable de resetear 
            // shouldReloadTable a false después de este ciclo de renderizado (ya lo hace
            // a través de componentDidUpdate, aunque en este caso solo necesitamos 
            // el valor true para disparar la recarga aquí).
        }
    }, [shouldReload, fetchData]);


    // ----------------------------------------------------
    // 4. MANEJO DE CIERRE DE MODALES (CON RECARGA CONDICIONAL)
    // ----------------------------------------------------
    const handleCloseModal = (shouldRefresh = false) => {
        setOpenModal(false);
        setSelectedUsuario(null);
        if (shouldRefresh) {
            fetchData();
        }
    };
        
    const handleCloseDeleteModal = (shouldRefresh = false) => {
        setOpenModalDelete(false);
        setSelectedUsuario(null);
        if (shouldRefresh) {
            fetchData();
        }
    };


    // ----------------------------------------------------
    // 5. HANDLERS DE ACCIONES
    // ----------------------------------------------------
    const handleDelete = (codigo) => {
        setSelectedUsuario(codigo);
        setOpenModalDelete(true);
    };

    const handleModify = (usuario) => {
        setSelectedUsuario(usuario);
        setOpenModal(true);
    };
    
    const togglePassword = (usuario) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [usuario]: !prev[usuario],
        }));
    };

    // ----------------------------------------------------
    // 6. DEFINICIÓN DE COLUMNAS
    // ----------------------------------------------------
    const columns = [
        { name: 'Usuario', selector: (row) => row.usuario, sortable: true },
        { name: 'Nombre', selector: (row) => `${row.nombre}  ${row.apellido_paterno} ${row.apellido_materno}`, sortable: true },
        { name: 'Rol', selector: (row) => row.rol, sortable: true },
        {
            name: 'Contraseña',
            selector: (row) => (
                <div>
                    {visiblePasswords[row.usuario] ? row.texto_plano : '********'}
                </div>
            ),
        },
        {
            name: '',
            cell: (row) => (
                <div> 
                    <img src={visiblePasswords[row.usuario] ? hideIcon : showIcon} alt="Toggle Password" onClick={() => togglePassword(row.usuario)}
                    style={{ marginBottom: '6%', marginRight: '3%', cursor: 'pointer'}}
                    />
                    <img src={delIcon} alt="Delete" onClick={() => handleDelete(row.usuario)} style={{ cursor: 'pointer' }}/>
                    <img src={modIcon} alt="Modify" onClick={() => handleModify(row.usuario) }
                    style={{ width: '30%', height: '40%', marginBottom: '10%', marginLeft: '8%', cursor: 'pointer'}} />        
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    if (loading) return <p className="text-center p-4 text-lg text-indigo-700 font-medium">Cargando usuarios...</p>;
    if (error) return <p className="text-center p-4 text-red-600">Error al cargar datos: {error.message}</p>;

    // ----------------------------------------------------
    // 7. RENDERIZADO PRINCIPAL
    // ----------------------------------------------------
    return (
        <>
        <DataTable
            columns={columns}
            data={data} 
            noDataComponent="No hay usuarios"
            defaultSortFieldId={1}
            responsive
            aginationPerPage={5}
            fixedHeader
            fixedHeaderScrollHeight="50%"
            customStyles={customStyles}
        />

        {openModal && <ModificacionUsuariosModal 
            closeModal={handleCloseModal} 
            usuario={selectedUsuario}
        />}
        
        {openModalDelete && <EliminarModal 
            closeModal={handleCloseDeleteModal} 
            usuario={selectedUsuario}
        />}

        </>
    );
}

DataTableComponent.propTypes = {
    shouldReload: PropTypes.bool, // 🛑 Definición de la prop
};

export default DataTableComponent;