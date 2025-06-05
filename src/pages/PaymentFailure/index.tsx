import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { Button } from 'react-bootstrap'

const PaymentFailure = () => {
  const navigate = useNavigate()

  return (
    <>
      <NavBar />
      <div className="container d-flex flex-column justify-content-center align-items-center text-center mt-5">
        <div className="p-5 rounded shadow" style={{ backgroundColor: '#ffe5e5', maxWidth: '600px' }}>
          <h2 className="text-danger mb-3 fw-bold">❌ Tu pago ha fallado</h2>
          <p className="text-muted mb-4">
            Hubo un problema al procesar el pago. Por favor, revisa tu información o intenta nuevamente.
          </p>

          <div className="mb-3">
            <p className="mb-2 fw-semibold text-dark">¿Deseas comprar algún producto?</p>
            <Button
              variant="outline-danger"
              onClick={() => navigate('/catalog')}
              className="mb-3"
            >
              Ir a Productos
            </Button>
          </div>

          <div>
            <p className="mb-2 fw-semibold text-dark">¿Deseas reservar una cita?</p>
            <Button
              variant="danger"
              onClick={() => navigate('/services')}
            >
              Reservar Cita
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentFailure