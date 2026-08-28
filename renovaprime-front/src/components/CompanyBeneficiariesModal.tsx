import { X } from 'lucide-react';
import { Button } from './Button';
import { CompanyBeneficiariesPanel } from './CompanyBeneficiariesPanel';
import type { CompanyRecord } from '../types/company';

interface CompanyBeneficiariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyRecord | null;
}

export function CompanyBeneficiariesModal({ isOpen, onClose, company }: CompanyBeneficiariesModalProps) {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
          <div>
            <h2 className="text-lg font-semibold">Vidas — {company.trade_name}</h2>
            <p className="text-sm text-muted-foreground">Colaboradores e dependentes da empresa</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4">
          <CompanyBeneficiariesPanel companyId={company.id} mode="admin" />
        </div>
      </div>
    </div>
  );
}
