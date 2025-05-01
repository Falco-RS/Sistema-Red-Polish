import NavBar from '../../common/NavBar'
import image from '../../assets/pulido.jpg'

function Homepage() {
  return (
    <>
      {/* NAVBAR */}
      <NavBar />

      {/* CONTENIDO CENTRAL */}
      <div className="container my-5">
        <div className="mb-5">
          <img
            src={image}
            alt="Pulido"
            className="img-fluid w-100 rounded shadow"
            style={{ maxHeight: '350px', width: '90%', objectFit: 'cover' }}
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

        {/* Carrusel placeholder */}
        <div className="mb-5">
          <div id="carouselPlaceholder" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="d-flex justify-content-center align-items-center bg-light border rounded shadow-sm" style={{ height: '200px' }}>
                  <span className="text-muted fs-5">Carrusel de productos próximamente</span>
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
