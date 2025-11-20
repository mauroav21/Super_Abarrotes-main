import  { Component, createRef } from 'react';
import axios from 'axios';
import tienda_bg from '../assets/inventario/tienda_bg.svg';
import '../Inventario/Inventario.css';
import tienda from '../assets/inventario/tienda.svg';
import comercial from '../assets/inventario/SuperAbarrotes.svg';
import inventario_icon from '../assets/inventario/inventario_icon.svg'
import usericon from '../assets/inventario/user.svg'
import usuarios from '../assets/inventario/usuarios.svg'
import logoutIcon from '../assets/inventario/logout.svg'
import {Link} from "react-router-dom";
import logo_pventa from '../assets/pventa/pv.svg';
import pventa from '../assets/inventario/pventa.svg';
import DataTableComponent from './DataTableComponent';
import GetUser from '../GetUser';
import Logout from '../Logout'
import PropTypes from 'prop-types';
import toast, { Toaster } from 'react-hot-toast';
import AddProduct  from './addProduct';
import './modal.css';



class Pventa extends Component { 
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
      };
        this.openNavbar = this.openNavbar.bind(this);
        this.closeNavbar = this.closeNavbar.bind(this);
      }

      handleProductSelect = (selectedOption) => {
        this.setState({ selectedProduct: selectedOption });
        setTimeout(() => {
          this.setState({ selectedProduct: null });
          console.log("Selected from AddProduct:", selectedOption);
        }, 100); 
      };

      async printDataaa(){
        console.log("hola")
        console.log(this.state.selectedProduct);
      }

      // --- Manejo del Corte de Caja ---
      handleCorteCaja = async () => {
        try {
          const response = await axios.get('http://localhost:8081/corte-caja-dia', {
            withCredentials: true,
          });
          // Suponiendo que response.data tiene { fecha: "...", total: ... }
          const corteResumido = {
            fecha: response.data.fecha,
            total: response.data.totalDia
          };
          this.setState({ corteData: corteResumido }); // Guardamos solo lo necesario
          toast.success('Corte de caja diario generado.');
        } catch (error) {
          console.error(error);
          toast.error('Error al obtener el corte de caja.');
        }
      };

      // --- Abrir modal ---
      openModal = async () => {
        this.setState({ showModal: true, corteData: null }, this.handleCorteCaja);
      };


      closeModal = () => {
        this.setState({ showModal: false, corteData: null });
      };

      async componentDidMount() {
        console.log('Component Mounted, isAuthenticated prop:', this.state.isAuthenticated);
        await this.verifyUser();
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
            console.log(" notverified");
    
          } else {
            this.setState({ isAuthenticated: true});
            this.setState({ rol: res.data.rol });
            console.log("verified");
          }
        } catch (error) {
          console.error('Error verifying user', error);
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
            this.sleep(250).then(() => {this.sidenavmenu.current.style.display = 'flex';
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
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        render() {

            return (
              <>
              {
                this.state.isAuthenticated ?(
                  <div id="screen">
                    <Toaster/>
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
                        <img src={comercial} alt="Comercial Icon" id="logo"/>
                        <ul className="menu">
                          <li className="menu-item"  onClick={() => this.closeNavbar()}>
                              <img src={pventa}  alt="Punto de Venta" style={{width: "25%"}}/> <span>Punto de Venta</span>
                          </li>
                          <li className="menu-item" style={{paddingLeft: "22px"}} onClick={() => window.location.replace('/inventario')}>
                              <img src={inventario_icon} className="imageIcon" alt="Inventario" style={{width: "25%"}}/> <span>Inventario</span>
        
                          </li>
                          <li className="menu-item" style={{paddingLeft: "19px"}} onClick={() => window.location.replace('/usuarios')} >
                              <img src={usuarios} className="imageIcon" alt="Messages" style={{width: "25%"}} /> <span>Administración de Usuarios</span>
                          </li>
                          <li className="menu-item" style={{paddingLeft: "19px"}} onClick={() => window.location.replace('/proveedores')} >
                              <img src={usuarios} className="imageIcon" alt="Messages" style={{width: "25%"}} /> <span>Administración de Proveedores</span>
                          </li>
                          <li className="menu-item" style={{paddingLeft: "19px"}} onClick={() => window.location.replace('/corte_de_caja')} >
                              <img src={usuarios} className="imageIcon" alt="Messages" style={{width: "25%"}} /> <span>Corte de Caja</span>
                          </li>
                          <li className="menu-item">
                              <img src={logoutIcon} className="imageIcon" alt="Cerrar Sesión"/> <Logout/>
                          </li>
                      </ul>    
                        <Link to="/login">  </Link>
                      </div>
                    </div>
                  </div>
                  <div className="ui" id="ui" ref={this.ui}>
                    <div id="header">
                      <img src={logo_pventa} id="logoPuntoVenta"></img>
                    </div>
                    <div id="headbar">
                      <div id="userinfo">
                        <img src={usericon}/>
                        <div id="username">
                        <GetUser></GetUser>
                        </div>
                      </div>
                      <div id='buscarDiv' style={{paddingLeft: '50%', paddingTop: '2%'}}>
                        <AddProduct onProductSelect={this.handleProductSelect}></AddProduct>
                      </div>
                      <div id='opciones'>
                      </div>
                    </div>
                      <DataTableComponent searchTerm={this.state.selectedProduct}></DataTableComponent>
                  </div>
                </div>
                )
        :
                <div>
                </div>
          }
                          {this.state.showModal && (
                  <div className="modalBackground">
                    <div className="modalContainer">
                      <div className="header">Corte de Caja Diario</div>
                      <div className="forms">
                        {this.state.corteData ? (
                          <pre className="labelModal">{JSON.stringify(this.state.corteData, null, 2)}</pre>
                        ) : (
                          <div className="labelModal">Generando corte...</div>
                        )}
                      </div>
                      <div id="buttons">
                        <button id="acceptButton" onClick={this.closeModal}>Cerrar</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          }

}

Pventa.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default Pventa;