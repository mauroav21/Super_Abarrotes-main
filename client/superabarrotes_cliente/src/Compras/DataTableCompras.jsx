import React from 'react';
import PropTypes from 'prop-types';

// Definición de icono SVG para Eliminar
const Trash2 = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);


const DataTableCompras = ({ items, onEliminar }) => {
    
    const total = items.reduce((acc, it) => acc + Number(it.subtotal), 0).toFixed(2);
    
    return (
        <div className="overflow-x-auto rounded-lg shadow-inner border border-gray-100">
            
            <table className="w-full table-fixed divide-y divide-gray-200">
                
                {/* ENCABEZADOS (HEAD) */}
                <thead className="bg-indigo-700"><tr> 
                    <th scope="col" className="!w-1/12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-yellow-300">
                        Código
                    </th>
                    <th scope="col" className="!w-4/12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-yellow-300">
                        Producto
                    </th>
                    <th scope="col" className="!w-1/12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-yellow-300">
                        Cantidad
                    </th>
                    <th scope="col" className="!w-2/12 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-yellow-300">
                        Precio Unitario
                    </th>
                    <th scope="col" className="!w-2/12 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-yellow-300">
                        Subtotal
                    </th>
                    <th scope="col" className="!w-2/12 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-yellow-300">
                        Acción
                    </th>
                </tr></thead> 

                <tbody className="bg-white divide-y divide-gray-200">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500 italic">
                                No hay productos agregados a la orden de compra.
                            </td>
                        </tr>
                    ) : (
                        items.map((it, idx) => ( // <-- Este es el único map
                            <tr key={it.codigo || idx} className="hover:bg-indigo-50 transition duration-150"> 
                                {/* FILA 1: Código -> CORRECCIÓN DE ESTILO EN LÍNEA */}
                                <td className="w-1/12 px-4 py-3 text-sm font-medium bg-white text-center" style={{ color: 'black' }}>{it.codigo}</td>
                                
                                {/* FILA 2: Producto -> CORRECCIÓN DE ESTILO EN LÍNEA */}
                                <td className="w-4/12 px-4 py-3 text-sm bg-white text-left" style={{ color: 'black' }}>{it.nombre}</td>
                                
                                {/* FILA 3: Cantidad -> CORRECCIÓN DE ESTILO EN LÍNEA */}
                                <td className="w-1/12 px-4 py-3 text-sm bg-white text-center" style={{ color: 'black' }}>{it.cantidad}</td>
                                
                                {/* FILA 4: Precio Unitario -> CORRECCIÓN DE ESTILO EN LÍNEA */}
                                <td className="w-2/12 px-4 py-3 text-sm bg-white text-right" style={{ color: 'black' }}>${Number(it.precio_unitario).toFixed(2)}</td>
                                
                                {/* FILA 5: Subtotal -> CORRECCIÓN DE ESTILO EN LÍNEA */}
                                <td className="w-2/12 px-4 py-3 text-sm font-bold bg-white text-right" style={{ color: 'black' }}>${Number(it.subtotal).toFixed(2)}</td>
                                
                                {/* FILA 6: Acción */}
                                <td className="w-2/12 px-4 py-3 text-sm text-center">
                                    <button 
                                        className="inline-flex items-center text-red-700 hover:text-red-900 bg-red-100 p-2 rounded-lg shadow-md transition duration-150 hover:bg-red-200" 
                                        onClick={() => onEliminar(idx)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
                
                {/* PIE DE PÁGINA (TFOOT) */}
                {items.length > 0 && (
                    <tfoot className="bg-indigo-600 border-t-2 border-indigo-700"><tr>
                        <td colSpan="4" className="px-6 py-3 text-right text-lg font-bold text-white">TOTAL:</td>
                        <td className="px-6 py-3 text-right text-xl font-extrabold text-yellow-300">${total}</td>
                        <td className="px-6 py-3 text-center"></td>
                    </tr></tfoot>
                )}
            </table>
        </div>
    );
};

DataTableCompras.propTypes = {
    items: PropTypes.array.isRequired,
    onEliminar: PropTypes.func.isRequired,
};

export default DataTableCompras;