import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/index'
import Login from './pages/Login/index'
import Register from './pages/Register/index'
import UserManagement from './pages/UserManagment/index'
import Recover from './pages/Recover_password/index'
import New_Password from './pages/New_password/index'
import Authenticate_mail from './pages/Authenticate_mail/index'
import Catalog from './pages/Catalog'
import Services from './pages/Services'
import Appointment from './pages/Appointment'



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user" element={<UserManagement />} />
      <Route path="/recover" element={<Recover />} />
      <Route path="/new_password" element={<New_Password />} />
      <Route path="/authenticate_mail" element={<Authenticate_mail/>} />
      <Route path="/catalog" element={<Catalog/>} />
      <Route path="/services" element={<Services/>} />
      <Route path="/appointment" element={<Appointment/>} />
    </Routes>
  )
}

export default App
