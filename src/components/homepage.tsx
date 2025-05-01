import { Link } from 'react-router-dom'
import image from '../assets/pulido.jpg' // asegurate que la imagen esté ahí o usá una URL pública

function Homepage() {
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container">
          <span className="navbar-brand fw-bold">🧼 Red Polish</span>
          <div className="collapse navbar-collapse justify-content-between">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#">Productos</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Servicios</a>
              </li>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#">Login</a>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">Register</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* CONTENIDO CENTRAL */}
      <div className="container text-center mt-5">
        <div className="mb-4">
          <img
            src={image}
            alt="Pulido"
            className="img-fluid border border-primary rounded"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        </div>

        <div className="mb-5">
          <h2 className="fw-bold">Bienvenido a Red Polish</h2>
          <p className="fw-bold">
            Nos especializamos en el cuidado y embellecimiento de tu vehículo. Ofrecemos un servicio profesional de abrillantado y detallado automotriz, asegurando que tu auto luzca impecable en todo momento.
            Además, contamos con una amplia selección de productos de alta calidad para el mantenimiento y protección de tu automóvil.
            <br />
            Explora nuestra web para conocer más sobre nuestros servicios, productos y promociones. ¡Déjanos ayudarte a mantener tu auto en su mejor estado!
          </p>
        </div>

        {/* Carrusel Placeholder */}
        <div className="mb-5">
          <div id="carouselPlaceholder" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: '200px' }}>
                  <span className="text-muted">Carrusel de productos próximamente</span>
                </div>
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselPlaceholder" data-bs-slide="prev">
              <span className="carousel-control-prev-icon"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselPlaceholder" data-bs-slide="next">
              <span className="carousel-control-next-icon"></span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Homepage


  