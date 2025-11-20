import { Component, createRef } from 'react';
import axios from 'axios';
import tienda_bg from '../assets/inventario/tienda_bg.svg';
import './CorteCaja.css';
import tienda from '../assets/inventario/tienda.svg';
import comercial from '../assets/inventario/SuperAbarrotes.svg';
import inventario_icon from '../assets/inventario/inventario_icon.svg';
import usericon from '../assets/inventario/user.svg';
import usuarios from '../assets/inventario/usuarios.svg';
import logoutIcon from '../assets/inventario/logout.svg';
import logo_ccaja from '../assets/cortecaja/cc.svg';
import pventa from '../assets/inventario/pventa.svg';
import GetUser from '../GetUser';
import Logout from '../Logout';
import PropTypes from 'prop-types';
import toast, { Toaster } from 'react-hot-toast';
import DataTableComponent from './DataTableComponent'; // Tu componente de tabla

class CorteCaja extends Component {
  constructor(props) {
    super(props);
    this.sidenav = createRef();
    this.storeButton = createRef();
    this.ui = createRef();
    this.sidenavmenu = createRef();
    this.state = {
      isAuthenticated: false,
      rol: null,
      user: null,
      ventas: [],
      totalDia: 0,
      fecha: '',
    };
    this.openNavbar = this.openNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
  }

  async componentDidMount() {
    await this.verifyUser();
    await this.obtenerCorteDia();
  }

  async verifyUser() {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get('http://localhost:8081/');
      if (res.data.Status !== 'Exito') {
        window.location.replace('/');
      } else {
        this.setState({ isAuthenticated: true, rol: res.data.rol });
      }
    } catch (error) {
      console.error('Error verifying user', error);
    }
  }

  async obtenerCorteDia() {
    try {
      const res = await axios.get('http://localhost:8081/corte-caja-dia', {
        withCredentials: true,
      });
      this.setState({
        ventas: res.data.ventas || [],
        totalDia: res.data.totalDia || 0,
        fecha: res.data.fecha || new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error('Error al obtener el corte de caja', error);
      toast.error('Error al obtener el corte de caja del día.');
    }
  }

  openNavbar() {
    if (this.sidenav.current && this.storeButton.current && this.ui.current) {
      this.sidenav.current.style.width = '300px';
      this.sidenav.current.style.background = `url(${tienda_bg}), #12274B`;
      this.sidenav.current.style.backgroundPosition = 'left 5%';
      this.sidenav.current.style.backgroundPositionX = 'center';
      this.sidenav.current.style.backgroundSize = '350%';
      this.storeButton.current.style.marginLeft = '28%';
      this.ui.current.onclick = this.closeNavbar;
      this.sleep(250).then(() => {
        this.sidenavmenu.current.style.display = 'flex';
      });
      this.ui.current.style.opacity = '.5';
    }
  }

  closeNavbar() {
    if (this.sidenav.current && this.storeButton.current && this.ui.current) {
      this.sidenav.current.style.width = '60%';
      this.sidenav.current.style.background = '#12274B';
      this.storeButton.current.style.marginLeft = '10%';
      this.ui.current.onclick = null;
      this.sidenavmenu.current.style.display = 'none';
      document.body.style.backgroundColor = 'rgba(255, 255, 255, 0)';
      this.ui.current.style.opacity = '1';
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  render() {
    const { isAuthenticated, ventas, totalDia, fecha } = this.state;

    return (
      <>
        {isAuthenticated ? (
          <div id="screen">
            <Toaster />
            <div id="sidenavbar">
              <div className="sidenav" id="mySidenav" ref={this.sidenav}>
                <img
                  src={tienda}
                  id="tienda"
                  ref={this.storeButton}
                  onClick={this.openNavbar}
                  alt="Store Icon"
                />
                <div className="sidenavmenu" ref={this.sidenavmenu}>
                  <img src={comercial} alt="Comercial Icon" id="logo" />
                  <ul className="menu">
                    <li
                      className="menu-item"
                      onClick={() => window.location.replace('/punto_de_venta')}
                    >
                      <img
                        src={pventa}
                        alt="Punto de Venta"
                        style={{ width: '25%' }}
                      />
                      <span>Punto de Venta</span>
                    </li>
                    <li
                      className="menu-item"
                      style={{ paddingLeft: '22px' }}
                      onClick={() => window.location.replace('/inventario')}
                    >
                      <img
                        src={inventario_icon}
                        className="imageIcon"
                        alt="Inventario"
                        style={{ width: '25%' }}
                      />
                      <span>Inventario</span>
                    </li>
                    <li
                      className="menu-item"
                      style={{ paddingLeft: '19px' }}
                      onClick={() => window.location.replace('/usuarios')}
                    >
                      <img
                        src={usuarios}
                        className="imageIcon"
                        alt="Administración"
                        style={{ width: '25%' }}
                      />
                      <span>Administración de Usuarios</span>
                    </li>
                    <li className="menu-item">
                      <img src={logoutIcon} className="imageIcon" alt="Cerrar Sesión" />
                      <Logout />
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="ui" id="ui" ref={this.ui}>
              <div id="header">
                <img src={logo_ccaja} id="logoPuntoVenta" alt="logo" />
              </div>

              <div id="headbar">
                <div id="userinfo">
                  <img src={usericon} alt="user" />
                  <div id="username">
                    <GetUser />
                  </div>
                </div>
                <div id="opciones">
                  <button
                    id="acceptButton"
                    onClick={() => toast('Generar PDF próximamente')}
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>

              <div className="corte-info" style={{ color: 'black' }}>
                <h2>Corte de Caja del Día</h2>
                <p>
                  <b>Fecha:</b> {fecha || new Date().toLocaleDateString()}
                </p>
                <p>
                  <b>Total del Día:</b> ${Number(totalDia || 0).toFixed(2)}
                </p>
              </div>

              {/* VENTAS */}
              {ventas.length > 0 ? (
                ventas.map((venta) => (
                  <div
                    key={venta.id}
                    className="border rounded-lg p-4 mb-6 shadow-md bg-white"
                  >
                    <h3 className="text-lg font-bold mb-2" style={{color: 'black'}}>
                      Venta #{venta.id} — Usuario: {venta.usuario}
                    </h3>
                    <p style={{color: 'black'}}>
                      <b>Fecha:</b> {venta.fecha}
                    </p>
                    <p style={{color: 'black'}}>
                      <b>Total:</b> ${Number(venta.total).toFixed(2)}
                    </p>

                    <h4 className="font-semibold mt-4 mb-2" style={{color: 'black'}}>Productos vendidos:</h4>
                    <DataTableComponent
                      data={venta.productos.map((p) => ({
                        producto: p.nombre,
                        cantidad: p.cantidad,
                        total: Number(p.precioUnitario).toFixed(2),
                      }))}
                      columns={[
                        { name: 'Producto', selector: row => row.producto, sortable: true },
                        { name: 'Cantidad', selector: row => row.cantidad, sortable: true },
                        { name: 'Total', selector: row => row.total, sortable: true },
                      ]}
                      noDataText="No hay productos registrados"
                      searchTerm="" // puedes agregar input de búsqueda si quieres
                    />
                  </div>
                ))
              ) : (
                <p>No hay ventas registradas</p>
              )}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </>
    );
  }
}

CorteCaja.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default CorteCaja;
