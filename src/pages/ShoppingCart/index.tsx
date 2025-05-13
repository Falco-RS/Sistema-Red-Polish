import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from '../../common/NavBar'


interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

const ShoppingCart: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, nombre: 'Camiseta Deportiva', precio: 25.0, cantidad: 1 },
    { id: 2, nombre: 'Botella de Agua', precio: 10.0, cantidad: 2 },
    { id: 3, nombre: 'Mochila Mediana', precio: 45.5, cantidad: 1 },
  ]);

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    setProductos((prev) =>
      prev.map((producto) =>
        producto.id === id ? { ...producto, cantidad: nuevaCantidad } : producto
      )
    );
  };

  const totalCarrito = productos.reduce(
    (acc, prod) => acc + prod.precio * prod.cantidad,
    0
  );

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <h2 className="mb-4 text-center">🛒 Carrito de Compras</h2>

        <div className="d-flex justify-content-end mb-2">
          <button className="btn btn-outline-danger btn-sm" disabled>
            Vaciar Carrito
          </button>
        </div>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Producto</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>${producto.precio.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={producto.cantidad}
                    onChange={(e) =>
                      actualizarCantidad(producto.id, Number(e.target.value))
                    }
                    className="form-control"
                    style={{ maxWidth: '80px' }}
                  />
                </td>
                <td>${(producto.precio * producto.cantidad).toFixed(2)}</td>
                <td className="text-center">
                  <button className="btn btn-danger btn-sm" disabled>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-end fw-bold fs-5">
          Total: ${totalCarrito.toFixed(2)}
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-success">Finalizar Compra</button>
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;
