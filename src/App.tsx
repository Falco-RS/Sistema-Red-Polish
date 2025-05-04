import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/index'
import Login from './pages/Login/index'
import Register from './pages/Register/index'
import UserManagement from './pages/UserManagment/index'


import Recover from './pages/Recover_password/index'
import New_Password from './pages/New_password/index'
import UserManagement from './pages/UserManagment/index'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user" element={<UserManagement />} />
      <Route path="/recover" element={<Recover />} />
      <Route path="/new_password" element={<New_Password />} />
      <Route path="/user" element={<UserManagement />} />
    </Routes>
  )
}

export default App
