import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from '../../common/NavBar';

const ShoppingCart: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<{ [id: number]: number }>({});
  const apiUrl = import.meta.env.VITE_IP_API;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products/get_all`);
        if (!res.ok) throw new Error('Error al obtener productos');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProductos(data);
          setSeleccionados({});
        }
      } catch (err) {
        console.error('❌ Error al obtener productos:', err);
      }
    };
    fetchProducts();
  }, []);

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 0) return; 
    setSeleccionados((prev) => ({
      ...prev,
      [id]: nuevaCantidad,
    }));
  };

  const totalSeleccionados = productos.reduce((acc, p) => {
    if (p.id in seleccionados && seleccionados[p.id] > 0) {
      return acc + p.price * seleccionados[p.id];
    }
    return acc;
  }, 0);

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <h2 className="mb-4 text-center text-dark">🛒 Carrito de Compras</h2>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {productos.map((producto) => {
            const seleccionado = producto.id in seleccionados;
            return (
              <div className="col" key={producto.id}>
                <div className={`card h-100 ${seleccionado ? 'border-success' : ''}`}>
                  <div className="card-body d-flex align-items-center">
                    <img
                      src={producto.image}
                      alt={producto.name}
                      className="me-3"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h5 className="card-title mb-1">{producto.name}</h5>
                      <p className="card-text mb-1 text-muted">${producto.price.toFixed(2)}</p>
                      <input
                        type="number"
                        min="0"
                        value={seleccionados[producto.id] ?? 0}
                        onChange={(e) =>
                          actualizarCantidad(producto.id, Number(e.target.value))
                        }
                        className="form-control form-control-sm mb-2"
                        style={{ width: '80px' }}
                      />
                      <button className="btn btn-outline-danger btn-sm" onClick={() => {}}>
                        Eliminar producto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-end fw-bold fs-5 mt-4 text-dark">
          Total: ${totalSeleccionados.toFixed(2)}
        </div>

        <div className="text-center mt-4 d-flex justify-content-center gap-3">
          <button
            className="btn btn-danger"
            onClick={() => {}}
            disabled={Object.keys(seleccionados).length === 0}
          >
            Vaciar carrito
          </button>
          <button
            className="btn btn-success"
            disabled={Object.keys(seleccionados).length === 0}
          >
            Finalizar Compra
          </button>
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;
