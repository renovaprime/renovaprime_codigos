import { useRef, useState, useCallback, useEffect } from 'react';
import { memedService } from '../services/memedService';
import { memedManager, MEMED_MODULE_NAME } from '../services/memedManager';

export type MemedStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MemedPatient {
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string; // formato: dd/mm/YYYY
}

interface PrescricaoImpressaPayload {
  alterada?: boolean;
  reimpressao?: boolean;
  prescricao?: {
    id: number;
    prescriptionUuid: string;
    signed?: number;
    paciente?: {
      id: number;
      nome?: string;
      cpf?: string;
    };
    medicamentos?: unknown[];
    documents?: unknown[];
    [key: string]: unknown;
  };
}

export function useMemed() {
  const [status, setStatus] = useState<MemedStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const handlerRef = useRef<((data: unknown) => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  /** Initialize Memed: fetch token from backend, load script, wait for module */
  const init = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      await memedManager.init();
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao inicializar Memed';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  /** Set the patient data in the Memed prescription module */
  const setPaciente = useCallback((patient: MemedPatient) => {
    if (!memedManager.isReady()) {
      console.warn('[Memed] Módulo não está pronto para setPaciente');
      return;
    }

    const cpf = patient.cpf ? patient.cpf.replace(/\D/g, '') : undefined;
    const telefone = patient.telefone ? patient.telefone.replace(/\D/g, '') : undefined;

    window.MdHub.command.send(MEMED_MODULE_NAME, 'setPaciente', {
      nome: patient.nome,
      ...(cpf && { cpf }),
      ...(telefone && { telefone }),
      ...(patient.email && { email: patient.email }),
      ...(patient.data_nascimento && { data_nascimento: patient.data_nascimento }),
    });
  }, []);

  /** Open the Memed prescription module */
  const show = useCallback(() => {
    if (typeof window.MdHub === 'undefined') {
      console.warn('[Memed] MdHub não disponível');
      return;
    }
    window.MdHub.module.show(MEMED_MODULE_NAME);
  }, []);

  /** Listen for the prescricaoImpressa event and persist to backend */
  const onPrescricaoImpressa = useCallback(
    (appointmentId: number, callback?: (prescriptionId: string) => void) => {
      if (typeof window.MdHub === 'undefined') {
        console.warn('[Memed] MdHub não disponível para eventos');
        return;
      }

      if (cleanupRef.current) {
        cleanupRef.current();
      }

      const handler = async (data: unknown) => {
        const payload = data as PrescricaoImpressaPayload;

        if (!payload?.prescricao) return;

        const { id, prescriptionUuid } = payload.prescricao;

        if (!id || !prescriptionUuid) {
          console.warn('[Memed] Prescrição sem ID válido', payload);
          return;
        }

        try {
          await memedService.savePrescription(appointmentId, payload);
          callback?.(String(id));
        } catch (err) {
          console.error('[Memed] Erro ao salvar prescrição:', err);
        }
      };

      handlerRef.current = handler;
      window.MdHub.event.add('prescricaoImpressa', handler);

      cleanupRef.current = () => {
        if (handlerRef.current) {
          window.MdHub.event.remove('prescricaoImpressa', handlerRef.current);
          handlerRef.current = null;
        }
        cleanupRef.current = null;
      };
    },
    []
  );

  /** Listen for the prescricaoExcluida event and mark prescription as deleted */
  const onPrescricaoExcluida = useCallback(
    (callback?: (prescriptionId: string) => void) => {
      if (typeof window.MdHub === 'undefined') {
        console.warn('[Memed] MdHub não disponível para eventos');
        return;
      }

      const handler = async (data: unknown) => {
        const payload = data as { prescricaoId?: number };

        if (!payload?.prescricaoId) {
          console.warn('[Memed] prescricaoExcluida sem ID válido', payload);
          return;
        }

        console.log('[Memed] Prescrição excluída:', payload.prescricaoId);

        try {
          await memedService.markPrescriptionDeleted(payload.prescricaoId);
          callback?.(String(payload.prescricaoId));
        } catch (err) {
          console.error('[Memed] Erro ao marcar prescrição como excluída:', err);
        }
      };

      window.MdHub.event.add('prescricaoExcluida', handler);

      return () => {
        window.MdHub.event.remove('prescricaoExcluida', handler);
      };
    },
    []
  );

  /** View a prescription using the Memed SDK */
  const viewPrescription = useCallback(async (prescriptionId: number) => {
    try {
      await init();
      // Doc Memed: plataforma.prescricao + ID como string (sem show — abre nova receita)
      await Promise.resolve(
        window.MdHub.command.send(
          MEMED_MODULE_NAME,
          'viewPrescription',
          String(prescriptionId)
        )
      );
    } catch (err) {
      console.error('[Memed] Erro ao abrir receita:', err);
      throw err;
    }
  }, [init]);

  /** Logout from Memed */
  const logout = useCallback(() => {
    memedManager.logout();
    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return {
    status,
    error,
    init,
    setPaciente,
    show,
    onPrescricaoImpressa,
    onPrescricaoExcluida,
    viewPrescription,
    logout,
  };
}
