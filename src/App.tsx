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
import AddProduct from './pages/AddProduct'
import ProductView from './pages/ProductView'
import EditProduct from './pages/EditProduct'
import AddService from './pages/Add_Service'
import EditService from './pages/EditService'
import EditCalendar from './pages/EditCalendar'
import PayService from './pages/PayService'
import ShoppingCart from './pages/ShoppingCart'
import PayProduct from './pages/PayProducts'
import PaymentFailure from './pages/PaymentFailure'
import PaymentSuccess from './pages/PaymentSuccess'



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
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/product/:id" element={<ProductView />} />
      <Route path="/edit-product/:id" element={<EditProduct />} />
      <Route path="/add-service" element={<AddService />} />
      <Route path="/edit-service" element={<EditService />} />
      <Route path="/edit-calendar" element={<EditCalendar />} />
      <Route path="/pay-service" element={<PayService />} />
      <Route path="/shopping-cart" element={<ShoppingCart />} />
      <Route path="/pay-products" element={<PayProduct />} />
      <Route path="/payment-failure" element={<PaymentFailure />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes>
  )
}

export default App
