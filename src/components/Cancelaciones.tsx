import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../common/AuthContext';

interface CancelacionAdmin {
  id: number;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  total: string;
  celular: string;
  estado: 'Completar devolucion' | 'Cancelación exitosa';
}

interface CancelacionUsuario {
  id: number;
  servicio: string;
  fecha: string;
  hora: string;
  total: string;
  estado: 'Cancelación pendiente' | 'Cancelación exitosa';
}

const Cancelaciones: React.FC = () => {
  const { user } = useAuth(); // 👈 Aquí obtienes el usuario del contexto
  const rol = user?.rol === 'Administrador' ? 'administrador' : 'usuario'; // 👈 Definimos el rol

  const [datosAdmin, setDatosAdmin] = useState<CancelacionAdmin[]>([
    {
      id: 1,
      cliente: 'Juan Pérez',
      servicio: 'Corte de cabello',
      fecha: '2025-05-22',
      hora: '14:00',
      total: '$15',
      celular: '123456789',
      estado: 'Completar devolucion'
    },
    {
      id: 2,
      cliente: 'Ana López',
      servicio: 'Manicure',
      fecha: '2025-05-23',
      hora: '16:30',
      total: '$20',
      celular: '987654321',
      estado: 'Completar devolucion'
    }
  ]);

  const [datosUsuario] = useState<CancelacionUsuario[]>([
    {
      id: 1,
      servicio: 'Pedicure',
      fecha: '2025-05-24',
      hora: '12:00',
      total: '$18',
      estado: 'Cancelación pendiente'
    },
    {
      id: 2,
      servicio: 'Masaje relajante',
      fecha: '2025-05-25',
      hora: '15:30',
      total: '$25',
      estado: 'Cancelación exitosa'
    }
  ]);

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
  }, [])


  const cambiarEstado = (id: number) => {
    setDatosAdmin(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, estado: 'Cancelación exitosa' }
          : item
      )
    );
  };

  return (
    <div className="container mt-4">
    <div className="d-flex justify-content-start">
        <h2 className="fw-bold mb-4" style={{ color: '#333' }}>Cancelaciones</h2>
      </div>

      {rol === 'administrador' ? (
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>Nombre del Cliente</th>
              <th>Nombre del Servicio</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Total</th>
              <th>Número Celular</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {datosAdmin.map((item) => (
              <tr key={item.id}>
                <td>{item.cliente}</td>
                <td>{item.servicio}</td>
                <td>{item.fecha}</td>
                <td>{item.hora}</td>
                <td>{item.total}</td>
                <td>{item.celular}</td>
                <td>
                  {item.estado === 'Completar devolucion' ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => cambiarEstado(item.id)}
                    >
                      Completar devolucion
                    </button>
                  ) : (
                    <span className="text-success">{item.estado}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>Nombre del Servicio</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Total</th>
              <th>Estado de Cancelación</th>
            </tr>
          </thead>
          <tbody>
            {datosUsuario.map((item) => (
              <tr key={item.id}>
                <td>{item.servicio}</td>
                <td>{item.fecha}</td>
                <td>{item.hora}</td>
                <td>{item.total}</td>
                <td>
                  {item.estado === 'Cancelación exitosa' ? (
                    <span className="text-success">{item.estado}</span>
                  ) : (
                    <span className="text-warning">{item.estado}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Cancelaciones;
