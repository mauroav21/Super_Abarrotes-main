// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 🔑 Mantenemos el puerto si lo deseas, aunque Vite por defecto usa 5173
    port: 5173, 
    
    // ✅ CLAVE: Configuración del Proxy
    // Esto redirige todas las peticiones que empiezan con '/api'
    // desde el frontend (5173) al backend (8081).
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // <--- Puerto de tu servidor Express
        changeOrigin: true, // Esto es importante para las peticiones de desarrollo
        secure: false, // Puedes dejarlo en false en entorno local
      },
    },
  },
});