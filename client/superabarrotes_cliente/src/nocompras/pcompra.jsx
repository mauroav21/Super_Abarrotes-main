import { Component, createRef } from 'react';
import axios from 'axios';
import tienda_bg from '../assets/inventario/tienda_bg.svg';
import '../Inventario/Inventario.css';
import tienda from '../assets/inventario/tienda.svg';
import comercial from '../assets/inventario/SuperAbarrotes.svg';
import inventario_icon from '../assets/inventario/inventario_icon.svg';
import usericon from '../assets/inventario/user.svg';
import usuarios from '../assets/inventario/usuarios.svg';
import logoutIcon from '../assets/inventario/logout.svg';
import { Link } from 'react-router-dom';
import logo_pventa from '../assets/pventa/pv.svg';
import DataTableComponent from './DataTableComponent';
import GetUser from '../GetUser';
import Logout from '../Logout';
import PropTypes from 'prop-types';
import toast, { Toaster } from 'react-hot-toast';
import AddProduct from './addProduct';

class Pcompra extends Component {
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
      selectedProduct: null,
      selectedProductsList: [], // Lista de productos en la compra
      selectedProvider: '', // Proveedor elegido
      providers: [], // Lista de proveedores del backend
    };
    this.openNavbar = this.openNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
  }

  async componentDidMount() {
    await this.verifyUser();
    await this.fetchProviders();
    const message = localStorage.getItem('showToast');
    if (message) {
      toast.success(message);
      localStorage.removeItem('showToast');
    }
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

  async fetchProviders() {
    try {
      const res = await axios.get('http://localhost:8081/proveedores'); // Endpoint para obtener proveedores
      this.setState({ providers: res.data });
    } catch (error) {
      console.error('Error fetching providers', error);
    }
  }

  handleProductSelect = (product) => {
    // Se puede cambiar precio de compra más adelante
    const exists = this.state.selectedProductsList.find(p => p.idProducto === product.idProducto);
    if (!exists) {
      this.setState(prevState => ({
        selectedProductsList: [...prevState.selectedProductsList, { ...product, precioCompra: product.precio }],
      }));
      toast.success(`${product.Nombre} agregado a la compra`);
    } else {
      toast.error(`${product.Nombre} ya está agregado`);
    }
  };

  handlePriceChange = (id, newPrice) => {
    this.setState(prevState => ({
      selectedProductsList: prevState.selectedProductsList.map(p => 
        p.idProducto === id ? { ...p, precioCompra: newPrice } : p
      )
    }));
  };

  handleProviderChange = (e) => {
    this.setState({ selectedProvider: e.target.value });
  };

  handlePurchase = async () => {
    if (!this.state.selectedProvider) {
      toast.error('Seleccione un proveedor');
      return;
    }
    if (this.state.selectedProductsList.length === 0) {
      toast.error('No hay productos seleccionados');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8081/compras', {
        proveedor: this.state.selectedProvider,
        productos: this.state.selectedProductsList,
      });
      toast.success('Compra realizada con éxito');
      this.setState({ selectedProductsList: [], selectedProvider: '' });
    } catch (error) {
      console.error(error);
      toast.error('Error al realizar la compra');
    }
  };

  openNavbar() {
    if (this.sidenav.current && this.storeButton.current && this.ui.current) {
      this.sidenav.current.style.width = '300px';
      this.sidenav.current.style.background = `url(${tienda_bg}), #12274B`;
      this.sidenav.current.style.backgroundPositionX = 'center';
      this.sidenav.current.style.backgroundSize = '350%';
      this.storeButton.current.style.marginLeft = '28%';
      this.ui.current.onclick = this.closeNavbar;
      this.sleep(250).then(() => { this.sidenavmenu.current.style.display = 'flex'; });
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  render() {
    return (
      <>
        {this.state.isAuthenticated ? (
          <div id="screen">
            <Toaster />
            <div id="sidenavbar">
              <div className="sidenav" id="mySidenav" ref={this.sidenav}>
                <img src={tienda} id="tienda" ref={this.storeButton} onClick={this.openNavbar} alt="Store Icon" />
                <div className="sidenavmenu" ref={this.sidenavmenu}>
                  <img src={comercial} alt="Comercial Icon" id="logo" />
                  <ul className="menu">
                    <li className="menu-item" onClick={() => this.closeNavbar()}>Punto de Venta</li>
                    <li className="menu-item" onClick={() => window.location.replace('/inventario')}>Inventario</li>
                    <li className="menu-item" onClick={() => window.location.replace('/usuarios')}>Administración de Usuarios</li>
                    <li className="menu-item">
                      <img src={logoutIcon} className="imageIcon" alt="Cerrar Sesión" /> <Logout />
                    </li>
                  </ul>
                  <Link to="/login"> </Link>
                </div>
              </div>
            </div>

            <div className="ui" id="ui" ref={this.ui}>
              <div id="header">
                <img src={logo_pventa} id="logoPuntoVenta" alt="Logo" />
              </div>

              <div id="headbar">
                <div id="userinfo">
                  <img src={usericon} alt="User Icon" />
                  <div id="username">
                    <GetUser />
                  </div>
                </div>

                <div id='buscarDiv' style={{ paddingLeft: '10%', paddingTop: '1%' }}>
                  <label>Proveedor: </label>
                  <select value={this.state.selectedProvider} onChange={this.handleProviderChange}>
                    <option value="">Seleccione un proveedor</option>
                    {this.state.providers.map(p => (
                      <option key={p.idProveedor} value={p.idProveedor}>{p.Nombre}</option>
                    ))}
                  </select>
                  <AddProduct onProductSelect={this.handleProductSelect} />
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <h3>Productos a comprar:</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio de Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.selectedProductsList.map(product => (
                      <tr key={product.idProducto}>
                        <td>{product.Nombre}</td>
                        <td>1</td>
                        <td>
                          <input
                            type="number"
                            value={product.precioCompra}
                            onChange={e => this.handlePriceChange(product.idProducto, parseFloat(e.target.value))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button onClick={this.handlePurchase} style={{ marginTop: '20px' }}>Realizar Compra</button>
              </div>

            </div>
          </div>
        ) : <div></div>}
      </>
    );
  }
}

Pcompra.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default Pcompra;
