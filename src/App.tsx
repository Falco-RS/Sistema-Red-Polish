import { Routes, Route } from 'react-router-dom'
import Homepage from './components/homepage'
import Register from './components/register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
