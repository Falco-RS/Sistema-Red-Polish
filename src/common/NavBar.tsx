import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../common/AuthContext';
import logo from '../assets/logo.png';
import carritoIcon from '../assets/carrito-de-compras.png';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { t } = useTranslation('global');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav className="navbar navbar-expand-lg bg-light" style={{ borderBottom: '2px solid #ccc' }}>
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center fw-bold">
          <img
            src={logo}
            alt="Red Polish Logo"
            style={{ width: '100px', height: '50px', marginRight: '10px' }}
          />
          Red Polish
        </Link>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/catalog" className="nav-link">{t('products')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/services" className="nav-link">{t('services')}</Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-center">
            {user && user.rol !== 'Administrador' && (
              <li className="nav-item me-3">
                <Link to="/shopping-cart" className="nav-link">
                  <img
                    src={carritoIcon}
                    alt="Carrito de compras"
                    style={{ width: '30px', height: '30px' }}
                  />
                </Link>
              </li>
            )}


            {!user ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">{t('login')}</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">{t('register')}</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/user" className="nav-link">{t('user')}</Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn" onClick={handleLogout}>{t('sign_out')}</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
