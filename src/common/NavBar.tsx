import { Link } from 'react-router-dom'
import logo from '../assets/logo.png' // asegúrate de que este archivo exista en src/assets/

const NavBar = () => {
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
              <a className="nav-link" href="#">Productos</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Servicios</a>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">Register</Link>
            </li>
            <li className="nav-item">
              <Link to="/user" className="nav-link">Usuario</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
