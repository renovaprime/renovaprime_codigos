import { useParams, useNavigate } from 'react-router-dom';
import { TeleconsultaRoom } from '../components/TeleconsultaRoom';

export function TeleconsultaMedico() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  if (!appointmentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>ID da consulta não informado</p>
      </div>
    );
  }

  const handleEnd = () => {
    navigate('/profissional/consultas');
  };

  const handleError = (error: string) => {
    console.error('Teleconsulta error:', error);
  };

  return (
    <div className="h-screen">
      <TeleconsultaRoom
        appointmentId={parseInt(appointmentId)}
        role="doctor"
        onEnd={handleEnd}
        onError={handleError}
      />
    </div>
  );
}
