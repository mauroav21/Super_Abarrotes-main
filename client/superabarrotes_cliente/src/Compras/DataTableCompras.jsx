// client/superabarrotes_cliente/src/Compras/DataTableCompras.jsx
import React from 'react';

const DataTableCompras = ({ items, onEliminar }) => {
  return (
    <table className="data-table-compras">
      <thead>
        <tr>
          <th>Código</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Unitario</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay productos agregados</td></tr>
        ) : (
          items.map((it, idx) => (
            <tr key={idx}>
              <td>{it.codigo}</td>
              <td>{it.nombre}</td>
              <td>{it.cantidad}</td>
              <td>${Number(it.precio_unitario).toFixed(2)}</td>
              <td>${Number(it.subtotal).toFixed(2)}</td>
              <td>
                <button className="btn-del" onClick={() => onEliminar(idx)}>Eliminar</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default DataTableCompras;
