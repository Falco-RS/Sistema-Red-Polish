import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../common/NavBar';
import image from '../../assets/pulido.png';
import { FaFacebook, FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function Homepage() {
  const [products, setProducts] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [promotions, setPromotions] = useState<any[]>([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_IP_API;
  const { t } = useTranslation('global');

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    fetchProducts();
    fetchPromotions();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/products/get_all`);
      if (!res.ok) throw new Error('Error al obtener productos');
      const data = await res.json();
      setProducts(Array.isArray(data) && data.length > 0 ? data : [getFallbackProduct()]);
    } catch (err) {
      console.error('❌ Error al obtener productos:', err);
      setProducts([getFallbackProduct()]);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/promotions`);
      const data = await res.json();
      setPromotions(data);
    } catch (err) {
      console.error('❌ Error al obtener promociones:', err);
    }
  };

  const getFallbackProduct = () => ({
    id: 0,
    name: 'Cera Premium',
    description: 'Cera especial, rojo, 150ml',
    price: 2500,
    image: image,
  });

  const nextSlide = () => {
    if (startIndex + 6 < products.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleProducts = products.slice(startIndex, startIndex + 6);

  return (
    <>
      <NavBar />

      {/* Sección de fondo */}
      <div
        className="position-relative text-white d-flex justify-content-center align-items-center"
        style={{
          height: '350px',
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: "'Montserrat', 'Open Sans', Arial, sans-serif",
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
        <div className="position-relative text-center px-3">
          <h1 className="display-4 fw-light text-uppercase mb-3">RED POLISH</h1>
          <p
            className="fs-5 fst-italic lh-lg"
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            {t('slogan')}
          </p>
        </div>
      </div>

      <div className="container my-5">
        <div className="text-center mb-5">
          <p className="fs-5 text-dark lh-lg">
            {t('description_home')}
            <br />
            <br />
            {t('des')}
            {t('des2')}
          </p>
        </div>

        {/* Carrusel real */}
        <div className="mb-5">
          <h3 className="fw-semibold text-center mb-4 text-capitalize text-dark">
            {t('recommended_products')}
          </h3>
          <div className="d-flex align-items-center justify-content-between">
            <button className="btn btn-outline-dark me-2" onClick={prevSlide}>
              &lt;
            </button>
            <div className="d-flex overflow-hidden" style={{ gap: '1rem', flex: 1 }}>
              {visibleProducts.map((product) => {
                const promo = promotions.find((p) => p.id === product.promotionId);
                const oldPrice = promo?.porcentage
                  ? Math.round(product.price / (1 - promo.porcentage / 100))
                  : null;

                return (
                  <div
                    key={product.id}
                    className="card shadow-sm position-relative"
                    style={{
                      minWidth: '200px',
                      maxWidth: '200px',
                      minHeight: '300px',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {promo && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                        {promo.title}
                      </span>
                    )}
                    <div
                      className="card-img-top bg-light d-flex justify-content-center align-items-center"
                      style={{ height: '160px' }}
                    >
                      <img
                        src={product.image || image}
                        alt={product.name}
                        className="img-fluid"
                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="card-body">
                      <h6 className="fw-bold card-title">{product.name}</h6>
                      <p className="text-muted mb-1 small">{product.description}</p>
                      {promo?.porcentage ? (
                        <div>
                          <span className="text-muted text-decoration-line-through me-2">
                            ${oldPrice?.toLocaleString()}
                          </span>
                          <span className="fw-bold text-danger">
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <p className="mb-0 fw-bold">${product.price.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btn btn-outline-dark ms-2" onClick={nextSlide}>
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-dark text-white py-5">
        <div className="container">
          <h3 className="text-center fw-bold mb-4">{t('contact_us')}</h3>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="d-flex align-items-start gap-3">
              <FaMapMarkerAlt className="fs-3 text-danger" />
              <div>
                <p className="mb-1 fw-semibold">{t('location')}</p>
                <p>Quesada, San Carlos, Costa Rica</p>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaWhatsapp className="fs-3 text-success" />
              <div>
                <p className="mb-1 fw-semibold">{t('Whatsapp')}</p>
                <a href="https://wa.me/50683582929" className="text-white">
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaEnvelope className="fs-3 text-primary" />
              <div>
                <p className="mb-1 fw-semibold">{t('email')}</p>
                <a href="mailto:agenda@redpolishcr.com" className="text-white">
                  agenda@redpolishcr.com
                </a>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <FaFacebook className="fs-3 text-info" />
              <div>
                <p className="mb-1 fw-semibold">Facebook</p>
                <a
                  href="https://www.facebook.com/share/19EaKxAE8s/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white"
                >
                  Red Polish Costa Rica
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Homepage;
