import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { medicalRecordApiService } from '../services/medicalRecordService';

interface ConsentModalProps {
  appointmentId: number;
  beneficiaryId: number;
  onAccepted: () => void;
  onDeclined: () => void;
}

const CONSENT_VERSION = '1.0';

const CONSENT_TEXT = `TERMO DE CONSENTIMENTO PARA TELECONSULTA

Eu, paciente/responsavel, declaro que:

1. Estou ciente de que este atendimento sera realizado por meio de teleconsulta (atendimento remoto por video), conforme previsto na Lei n. 14.510/2022 que regulamenta a telessaude no Brasil.

2. Compreendo que a teleconsulta possui limitacoes inerentes a modalidade remota, como a impossibilidade de realizacao de exame fisico completo.

3. Fui informado(a) de que tenho o direito de recusar esta modalidade de atendimento e solicitar consulta presencial a qualquer momento.

4. Autorizo o registro das informacoes clinicas em prontuario eletronico, conforme Lei n. 13.787/2018.

5. Estou ciente de que meus dados pessoais de saude serao tratados conforme a Lei Geral de Protecao de Dados (LGPD - Lei n. 13.709/2018), sendo classificados como dados sensiveis.

Ao clicar em "Aceitar e continuar", confirmo que li e concordo com os termos acima.`;

export function ConsentModal({ appointmentId, beneficiaryId, onAccepted, onDeclined }: ConsentModalProps) {
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError('');
      await medicalRecordApiService.createConsent({
        appointment_id: appointmentId,
        beneficiary_id: beneficiaryId,
        version: CONSENT_VERSION,
        accepted: true,
      });
      onAccepted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar consentimento');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Termo de Consentimento</h2>
              <p className="text-xs text-muted-foreground">Teleconsulta - Versao {CONSENT_VERSION}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{CONSENT_TEXT}</pre>
        </div>

        {error && (
          <div className="px-6 pb-2">
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
          </div>
        )}

        <div className="p-6 border-t border-border flex items-center gap-3">
          <button
            onClick={onDeclined}
            disabled={accepting}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Recusar
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {accepting && <Loader2 className="w-4 h-4 animate-spin" />}
            Aceitar e continuar
          </button>
        </div>
      </div>
    </div>
  );
}
