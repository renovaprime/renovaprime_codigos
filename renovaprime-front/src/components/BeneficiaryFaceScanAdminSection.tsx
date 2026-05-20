import { useState, useEffect } from 'react';
import { Button } from './Button';
import { beneficiaryService } from '../services/beneficiaryService';
import type { Beneficiary } from '../types/api';

function faceScanLabel(b: Beneficiary): string {
  if (b.face_scan_enabled) return 'Ativo';
  if (b.face_scan_requested) return 'Solicitado';
  return 'Desativado';
}

export interface BeneficiaryFaceScanAdminSectionProps {
  beneficiary: Beneficiary;
  formBusy?: boolean;
  onBeneficiaryRefresh: (b: Beneficiary) => void;
}

export function BeneficiaryFaceScanAdminSection({
  beneficiary,
  formBusy = false,
  onBeneficiaryRefresh,
}: BeneficiaryFaceScanAdminSectionProps) {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
  }, [beneficiary.id, beneficiary.face_scan_enabled, beneficiary.face_scan_requested]);

  const busy = formBusy || loading;

  const handleEnable = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      const b = await beneficiaryService.setFaceScan(beneficiary.id, true);
      onBeneficiaryRefresh(b);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Falha ao ativar Face Scan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      const b = await beneficiaryService.setFaceScan(beneficiary.id, false);
      onBeneficiaryRefresh(b);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Falha ao desativar Face Scan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border p-4 space-y-3 bg-muted/20">
      <div>
        <p className="text-sm font-medium text-foreground">Face Scan (Rapidoc)</p>
        <p className="text-sm text-muted-foreground">
          Status atual:{' '}
          <span className="font-medium text-foreground">{faceScanLabel(beneficiary)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Ativar cria o cadastro na Rapidoc, se necessário, e libera o uso no app. Desativar remove a
          liberação e zera o pedido feito pelo paciente.
        </p>
      </div>
      {localError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {localError}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={busy || !!beneficiary.face_scan_enabled}
          onClick={handleEnable}
        >
          {loading && !beneficiary.face_scan_enabled ? 'Ativando...' : 'Ativar Face Scan'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy || !beneficiary.face_scan_enabled}
          onClick={handleDisable}
        >
          {loading && beneficiary.face_scan_enabled ? 'Desativando...' : 'Desativar Face Scan'}
        </Button>
      </div>
    </div>
  );
}
