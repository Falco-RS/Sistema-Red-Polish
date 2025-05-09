import { useState } from 'react'
import NavBar from '../../common/NavBar'
import image from '../../assets/pulido.png'
import { FaFacebook, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa'

const recommendedProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  name: 'Cera Premium',
  description: 'Cera especial, rojo, 150ml',
  price: 2500,
  originalPrice: i % 2 === 0 ? 5000 : null,
  isNew: i % 3 === 0,
  discount: i % 2 === 0 ? '50%' : null,
}))

function Homepage() {
  const [startIndex, setStartIndex] = useState(0)

  const nextSlide = () => {
    if (startIndex + 6 < recommendedProducts.length) {
      setStartIndex(startIndex + 1)
    }
  }

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1)
    }
  }

  const visibleProducts = recommendedProducts.slice(startIndex, startIndex + 6)

  return (
    <>
      <NavBar />

      <div className="container my-5">
        {/* Banner */}
        <div className="mb-5">
          <img
            src={image}
            alt="Pulido"
            className="img-fluid w-100 rounded shadow"
            style={{ maxHeight: '350px', objectFit: 'cover' }}
          />
        </div>

        {/* Bienvenida */}
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-4">Bienvenido a <span style={{ color: '#d63384' }}>Red Polish</span></h2>
          <p className="fs-5 text-secondary">
            Nos especializamos en el cuidado y embellecimiento de tu vehículo. Ofrecemos un servicio profesional
            de abrillantado y detallado automotriz, asegurando que tu auto luzca impecable en todo momento.
            Además, contamos con una amplia selección de productos de alta calidad para el mantenimiento y
            protección de tu automóvil.
            <br /><br />
            Explora nuestra web para conocer más sobre nuestros servicios, productos y promociones.
            ¡Déjanos ayudarte a mantener tu auto en su mejor estado!
          </p>
        </div>

        {/* Carrusel */}
        <div className="mb-5">
          <h3 className="fw-bold text-center mb-4 text-white">Productos Recomendados</h3>
          <div className="d-flex align-items-center justify-content-between">
            <button className="btn btn-outline-light me-2" onClick={prevSlide}>&lt;</button>
            <div className="d-flex overflow-hidden" style={{ gap: '1rem', flex: 1 }}>
              {visibleProducts.map(product => (
                <div key={product.id} className="card shadow-sm" style={{ minWidth: '180px', maxWidth: '180px' }}>
                  <div className="card-body position-relative p-3">
                    {product.isNew && (
                      <span className="badge bg-dark text-white position-absolute top-0 end-0 m-2">NEW</span>
                    )}
                    <div className="text-center mb-3">
                      <img
                        src={image}
                        alt={product.name}
                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </div>
                    <h6 className="fw-bold">{product.name}</h6>
                    <p className="text-muted small">{product.description}</p>
                    <div className="d-flex align-items-center">
                      <span className="fw-bold me-2">₡{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-decoration-line-through text-muted small me-1">
                          ₡{product.originalPrice}
                        </span>
                      )}
                      {product.discount && (
                        <span className="text-danger small fw-semibold">-{product.discount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline-light ms-2" onClick={nextSlide}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-dark text-white py-5">
        <div className="container">
          <h3 className="text-center fw-bold mb-4">Contáctenos</h3>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="d-flex align-items-start gap-3">
              <FaMapMarkerAlt className="fs-3 text-danger" />
              <div>
                <p className="mb-1 fw-semibold">Ubicación</p>
                <p>Quesada, San Carlos, Costa Rica</p>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaPhone className="fs-3 text-success" />
              <div>
                <p className="mb-1 fw-semibold">Teléfono</p>
                <p>8358 2929</p>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaEnvelope className="fs-3 text-primary" />
              <div>
                <p className="mb-1 fw-semibold">Correo</p>
                <a href="mailto:agenda@redpolishcr.com" className="text-white">agenda@redpolishcr.com</a>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaFacebook className="fs-3 text-info" />
              <div>
                <p className="mb-1 fw-semibold">Facebook</p>
                <a href="https://www.facebook.com/share/19EaKxAE8s/" target="_blank" rel="noopener noreferrer" className="text-white">
                  Red Polish Costa Rica
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Homepage
