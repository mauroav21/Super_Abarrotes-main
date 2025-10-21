/**
 * main.jsx
 *
 * Propósito:
 *  - Punto de entrada de la aplicación React.
 *  - Monta el componente raíz <App /> en el DOM bajo el elemento con id="root".
 *
 * Qué hace exactamente:
 *  1. Importa estilos globales (index.css) y el componente raíz App.
 *  2. Crea la raíz de React usando createRoot (API de React 18+).
 *  3. Renderiza <App /> envuelto en <StrictMode>, que habilita comprobaciones y advertencias adicionales en desarrollo
 *     (por ejemplo: chequeos de efectos, detección de APIs obsoletas, render doble en desarrollo para detectar efectos secundarios).
 *
 * Requisitos:
 *  - Debe existir en public/index.html un elemento <div id="root"></div>.
 *  - El bundler (Vite, Webpack, etc.) debe procesar este archivo y servirlo correctamente.
 *
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
