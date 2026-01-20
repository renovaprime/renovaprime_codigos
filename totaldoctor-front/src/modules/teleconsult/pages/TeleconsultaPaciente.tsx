import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Clock } from 'lucide-react';
import { TeleconsultaRoom } from '../components/TeleconsultaRoom';
import { teleconsultService } from '../../../services/teleconsultService';
import { Button } from '../../../components/Button';

export function TeleconsultaPaciente() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string>('');

  useEffect(() => {
    if (!appointmentId) return;

    const checkAvailability = async () => {
      try {
        const result = await teleconsultService.checkAvailability(parseInt(appointmentId));
        setIsAvailable(result.available);
        if (!result.available) {
          setUnavailableReason(result.reason || 'Teleconsulta não disponível');
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao verificar disponibilidade';
        setUnavailableReason(message);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();

    // Poll a cada 5 segundos se não estiver disponível
    const interval = setInterval(() => {
      if (!isAvailable) {
        checkAvailability();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [appointmentId, isAvailable]);

  if (!appointmentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>ID da consulta não informado</p>
      </div>
    );
  }

  const handleEnd = () => {
    navigate('/beneficiario/consultas');
  };

  const handleError = (error: string) => {
    console.error('Teleconsulta error:', error);
  };

  // Verificando disponibilidade
  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>Verificando disponibilidade...</p>
      </div>
    );
  }

  // Teleconsulta não disponível (aguardando médico)
  if (!isAvailable) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Aguardando o Profissional</h2>
          <p className="text-gray-400 mb-6">
            {unavailableReason === 'Waiting for doctor to start the consultation'
              ? 'O profissional ainda não iniciou a teleconsulta. Por favor, aguarde.'
              : unavailableReason === 'Waiting for doctor to connect to the video room'
              ? 'O profissional está entrando na sala de vídeo. Por favor, aguarde.'
              : unavailableReason}
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Verificando automaticamente...</span>
          </div>
          <Button variant="secondary" onClick={() => navigate('/beneficiario/consultas')}>
            Voltar para consultas
          </Button>
        </div>
      </div>
    );
  }

  // Teleconsulta disponível
  return (
    <div className="h-screen">
      <TeleconsultaRoom
        appointmentId={parseInt(appointmentId)}
        role="patient"
        onEnd={handleEnd}
        onError={handleError}
      />
    </div>
  );
}
