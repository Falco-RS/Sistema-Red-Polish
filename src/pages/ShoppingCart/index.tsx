import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from '../../common/NavBar';
import { useAuth } from '../../common/AuthContext'
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';


const ShoppingCart: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<{ [id: number]: number }>({});
  const apiUrl = import.meta.env.VITE_IP_API;
  const { user, token } = useAuth();
  const userEmail = user?.email
  const userId = user?.id
  const navigate = useNavigate();
  const { t } = useTranslation('global');



  const actualizarProductoEnCarrito = async (cartItemId: number, nuevaCantidad: number) => {
    if (!userEmail || !token) return;

    try {
      const res = await fetch(`${apiUrl}/api/cart/update/${cartItemId}/${nuevaCantidad}/${userEmail}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al actualizar producto en el carrito');

      console.log(`✅ Producto ${cartItemId} actualizado con cantidad ${nuevaCantidad}`);
    } catch (err) {
      console.error('❌ Error actualizando producto:', err);
    }
  };

  const eliminarProductoDelCarrito = async (cartItemId: number) => {
    if (!userEmail || !token) return;

    try {
      const res = await fetch(`${apiUrl}/api/cart/remove/${cartItemId}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar el producto');

      // Quitar el producto eliminado del estado local
      setProductos((prev) => prev.filter(p => p.cartItemId !== cartItemId));
      setSeleccionados((prev) => {
        const nuevo = { ...prev };
        const idProducto = productos.find(p => p.cartItemId === cartItemId)?.id;
        if (idProducto !== undefined) delete nuevo[idProducto];
        return nuevo;
      });

      console.log(`✅ Producto con ID carrito ${cartItemId} eliminado`);
    } catch (err) {
      console.error('❌ Error al eliminar producto del carrito:', err);
    }
  };

 
  const vaciarCarrito = async () => {
    if (!userId || !userEmail || !token) return;

    try {
      const res = await fetch(`${apiUrl}/api/cart/clear/${userId}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al vaciar el carrito');

      // Limpia el estado local del carrito
      setProductos([]);
      setSeleccionados({});

      console.log('✅ Carrito vaciado exitosamente');
    } catch (err) {
      console.error('❌ Error al vaciar el carrito:', err);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    const fetchCartAndProducts = async () => {
      if (!userId || !userEmail || !token) return;

      try {
        // 1. Obtener los items del carrito
        const resCart = await fetch(`${apiUrl}/api/cart/items/${userId}/${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!resCart.ok) throw new Error('Error al obtener carrito');
        const cartItems = await resCart.json();

        // 2. Obtener detalles de cada producto del carrito
        const productData = await Promise.all(
          cartItems.map(async (item: any) => {
            try {
              const resProduct = await fetch(`${apiUrl}/api/products/get/${item.productId}`);
              if (!resProduct.ok) throw new Error(`Producto ${item.productId} no encontrado`);
              const product = await resProduct.json();

              return {
                ...product,
                quantity: item.quantity, // Agregamos la cantidad desde el carrito
                cartItemId: item.id,     // Por si quieres eliminar/editar más adelante
              };
            } catch (err) {
              console.error(err);
              return null;
            }
          })
        );

        // 3. Filtramos productos válidos y actualizamos estado
        const validProducts = productData.filter((p) => p !== null);
        setProductos(validProducts);

        // Inicializar cantidades seleccionadas
        const inicialSeleccionados: { [id: number]: number } = {};
        validProducts.forEach((p) => {
          inicialSeleccionados[p.id] = p.quantity;
        });
        setSeleccionados(inicialSeleccionados);
      } catch (err) {
        console.error('❌ Error al obtener productos del carrito:', err);
      }
    };

    fetchCartAndProducts();
  }, [userId, userEmail, token]);



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
        <h2 className="mb-4 text-center text-dark">🛒 {t('shopping')}</h2>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {productos.map((producto) => {
            const seleccionado = producto.id in seleccionados;
            return (
              <div className="col" key={producto.id}>
                <div className={`card h-100 ${seleccionado ? 'border-dark' : ''}`}>
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
                        <p className="card-text mb-1 text-muted">{producto.description}</p>
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
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => eliminarProductoDelCarrito(producto.cartItemId)}
                      >
                        {t('delete_p')}
                      </button>

                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => actualizarProductoEnCarrito(producto.cartItemId, seleccionados[producto.id])}
                        disabled={seleccionados[producto.id] === producto.quantity}
                      >
                        {t('save_changes')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-end fw-bold fs-5 mt-4 text-dark">
          {t('total')}: ${totalSeleccionados.toFixed(2)}
        </div>

        <div className="text-center mt-4 d-flex justify-content-center gap-3">
          <button
            className="btn btn-danger"
            onClick={vaciarCarrito}
            disabled={Object.keys(seleccionados).length === 0}
          >
            {t('clear')}
          </button>
         <button
        className="btn btn-success"
        disabled={Object.keys(seleccionados).length === 0}
        onClick={() =>
          navigate('/pay-products', {
            state: {
              productosSeleccionados: productos.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: seleccionados[p.id],
                image: p.image
              })),
              total: totalSeleccionados
            }
          })
        }
      >
        {t('checkout')}
      </button>
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;
