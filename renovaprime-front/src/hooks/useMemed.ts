import { useRef, useState, useCallback, useEffect } from 'react';
import { memedService } from '../services/memedService';

const MEMED_SCRIPT_URL =
  import.meta.env.VITE_MEMED_SCRIPT_URL ||
  'https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js';

const MODULE_NAME = 'plataforma.prescricao';
const INIT_TIMEOUT_MS = 30_000;

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
  const scriptLoadedRef = useRef(false);
  const moduleReadyRef = useRef(false);
  const handlerRef = useRef<((data: unknown) => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  /** Remove the Memed script tag from the DOM */
  const removeScript = useCallback(() => {
    const existing = document.querySelector('script[data-memed="true"]');
    if (existing) {
      existing.remove();
    }
    scriptLoadedRef.current = false;
    moduleReadyRef.current = false;
  }, []);

  /** Load the Memed script dynamically and wait for the module to init */
  const loadScript = useCallback(
    (token: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // If script already loaded with same token, skip
        const existing = document.querySelector<HTMLScriptElement>('script[data-memed="true"]');
        if (existing) {
          const currentToken = existing.getAttribute('data-token');
          if (currentToken === token && moduleReadyRef.current) {
            resolve();
            return;
          }
          // Different token or module not ready — remove and re-inject
          removeScript();
        }

        const script = document.createElement('script');
        script.src = MEMED_SCRIPT_URL;
        script.setAttribute('data-token', token);
        script.setAttribute('data-memed', 'true');
        script.setAttribute('data-color', '#1A4B84');

        const timeout = setTimeout(() => {
          reject(new Error('Memed: timeout ao aguardar inicialização do módulo'));
        }, INIT_TIMEOUT_MS);

        script.onerror = () => {
          clearTimeout(timeout);
          removeScript();
          reject(new Error('Memed: falha ao carregar o script'));
        };

        script.addEventListener('load', () => {
          scriptLoadedRef.current = true;

          // Wait for module init
          if (typeof window.MdSinapsePrescricao !== 'undefined') {
            window.MdSinapsePrescricao.event.add('core:moduleInit', (module) => {
              if (module.name === MODULE_NAME) {
                clearTimeout(timeout);
                moduleReadyRef.current = true;
                resolve();
              }
            });
          } else {
            // Fallback: poll for MdSinapsePrescricao availability
            const poll = setInterval(() => {
              if (typeof window.MdSinapsePrescricao !== 'undefined') {
                clearInterval(poll);
                window.MdSinapsePrescricao.event.add('core:moduleInit', (module) => {
                  if (module.name === MODULE_NAME) {
                    clearTimeout(timeout);
                    moduleReadyRef.current = true;
                    resolve();
                  }
                });
              }
            }, 200);

            // Clear poll on timeout
            setTimeout(() => clearInterval(poll), INIT_TIMEOUT_MS);
          }
        });

        document.body.appendChild(script);
      });
    },
    [removeScript]
  );

  /** Initialize Memed: fetch token from backend, load script, wait for module */
  const init = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const token = await memedService.getPrescriberToken();
      await loadScript(token);
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao inicializar Memed';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, [loadScript]);

  /** Set the patient data in the Memed prescription module */
  const setPaciente = useCallback((patient: MemedPatient) => {
    if (!moduleReadyRef.current || typeof window.MdHub === 'undefined') {
      console.warn('[Memed] Módulo não está pronto para setPaciente');
      return;
    }

    const cpf = patient.cpf ? patient.cpf.replace(/\D/g, '') : undefined;
    const telefone = patient.telefone ? patient.telefone.replace(/\D/g, '') : undefined;

    window.MdHub.command.send(MODULE_NAME, 'setPaciente', {
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
    window.MdHub.module.show(MODULE_NAME);
  }, []);

  /** Listen for the prescricaoImpressa event and persist to backend */
  const onPrescricaoImpressa = useCallback(
    (appointmentId: number, callback?: (prescriptionId: string) => void) => {
      if (typeof window.MdHub === 'undefined') {
        console.warn('[Memed] MdHub não disponível para eventos');
        return;
      }

      // Evita duplicação do listener
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

      // Store cleanup function
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
      window.MdHub.command.send(MODULE_NAME, 'viewPrescription', prescriptionId);
    } catch (err) {
      console.error('[Memed] Erro ao abrir receita:', err);
      throw err;
    }
  }, [init]);

  /** Logout from Memed */
  const logout = useCallback(() => {
    try {
      if (typeof window.MdHub !== 'undefined') {
        window.MdHub.command.send(MODULE_NAME, 'logout');
      }
    } catch {
      // best-effort
    }
    removeScript();
    setStatus('idle');
    moduleReadyRef.current = false;
  }, [removeScript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      try {
        if (typeof window.MdHub !== 'undefined') {
          window.MdHub.command.send(MODULE_NAME, 'logout');
        }
      } catch {
        // best-effort
      }
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
