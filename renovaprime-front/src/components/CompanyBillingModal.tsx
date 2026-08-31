import { useState, useEffect, useCallback } from 'react';
import { Receipt, RefreshCw, Zap } from 'lucide-react';
import { Button, Badge, Card } from './';
import { ModalOverlay } from './ModalOverlay';
import { companyBillingService } from '../services/companyBillingService';
import type { CompanyRecord } from '../types/company';
import type {
  CompanyBillingPreview,
  CompanyBillingRecord
} from '../types/companyBilling';
import {
  BILLING_STATUS_LABELS,
  BILLING_STATUS_VARIANTS
} from '../types/companyBilling';

interface CompanyBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyRecord | null;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCompetence(competence: string) {
  const [year, month] = competence.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function CompanyBillingModal({ isOpen, onClose, company }: CompanyBillingModalProps) {
  const [preview, setPreview] = useState<CompanyBillingPreview | null>(null);
  const [billings, setBillings] = useState<CompanyBillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!company) return;
    try {
      setIsLoading(true);
      setError(null);
      const [previewData, billingsData] = await Promise.all([
        companyBillingService.getPreview(company.id),
        companyBillingService.listAdmin(company.id)
      ]);
      setPreview(previewData);
      setBillings(billingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar faturamento');
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [company]);

  useEffect(() => {
    if (isOpen && company) {
      loadData();
    }
  }, [isOpen, company, loadData]);

  const handleGenerate = async () => {
    if (!company) return;
    try {
      setIsGenerating(true);
      setError(null);
      await companyBillingService.generate(company.id);
      setSuccess('Fatura gerada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar fatura');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <ModalOverlay>
      <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
          <div>
            <h2 className="text-lg font-semibold">Faturamento — {company.trade_name}</h2>
            <p className="text-sm text-muted-foreground">Prévia e histórico de faturas mensais</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>

        <div className="p-4 space-y-6">
          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm">{success}</div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>
          )}

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Prévia da competência
              </h3>
              <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {isLoading && !preview ? (
              <p className="text-sm text-muted-foreground">Carregando prévia...</p>
            ) : preview ? (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Competência:</span>{' '}
                  <strong>{formatCompetence(preview.competence)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Vencimento:</span>{' '}
                  <strong>{new Date(preview.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Vidas ativas:</span>{' '}
                  <strong>{preview.lives_active}</strong>
                  {preview.billing_type === 'PER_FAMILY' && (
                    <span className="text-muted-foreground"> ({preview.titulars_active} titulares)</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Valor unitário:</span>{' '}
                  <strong>{formatCurrency(preview.unit_price)}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Total:</span>{' '}
                  <strong className="text-lg">{formatCurrency(preview.total_amount)}</strong>
                  {preview.already_billed && (
                    <Badge variant="secondary" className="ml-2">Já faturada</Badge>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !preview || preview.already_billed}
              >
                <Zap className="w-4 h-4" />
                {isGenerating ? 'Gerando...' : 'Gerar fatura'}
              </Button>
            </div>
          </Card>

          <div>
            <h3 className="font-medium mb-3">Histórico</h3>
            {billings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma fatura gerada ainda.</p>
            ) : (
              <div className="space-y-2">
                {billings.map((billing) => (
                  <Card key={billing.id} padding="sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{formatCompetence(billing.competence)}</p>
                        <p className="text-sm text-muted-foreground">
                          {billing.total_lives} vidas · {formatCurrency(billing.total_amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={BILLING_STATUS_VARIANTS[billing.status]}>
                          {BILLING_STATUS_LABELS[billing.status]}
                        </Badge>
                        {billing.asaas_invoice_url && (
                          <a
                            href={billing.asaas_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Link ASAAS
                          </a>
                        )}
                      </div>
                    </div>
                    {billing.status === 'ERROR' && billing.error_message && (
                      <p className="text-xs text-red-600 mt-2">{billing.error_message}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
