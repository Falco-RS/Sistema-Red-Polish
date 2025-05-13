import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../common/AuthContext'; 
import logo from '../assets/logo.png';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirigir al home después de cerrar sesión
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center fw-bold">
          <img
            src={logo}
            alt="Red Polish Logo"
            style={{ width: '100px', height: '50px', marginRight: '10px' }}
          />
          Red Polish
        </Link>
        <div className="collapse navbar-collapse justify-content-between">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/catalog" className="nav-link">Productos</Link>
            </li>
            <li className="nav-item">
              <Link to="/services" className="nav-link">Servicios</Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/user" className="nav-link">Usuario</Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn" onClick={handleLogout}>Cerrar sesión</button>
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
