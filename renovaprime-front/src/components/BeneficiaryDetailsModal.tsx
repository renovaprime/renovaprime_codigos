import { X, Edit2 } from 'lucide-react';
import { Button, Badge } from './index';
import type { Beneficiary } from '../types/api';

interface BeneficiaryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
  onEdit?: () => void;
}

export function BeneficiaryDetailsModal({ isOpen, onClose, beneficiary, onEdit }: BeneficiaryDetailsModalProps) {
  if (!isOpen || !beneficiary) return null;

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const getServiceLabel = (serviceType: string) => {
    const labels: Record<string, string> = {
      'CLINICO': 'Clínico',
      'PREMIUM': 'Premium (Clínico + Especialistas + Psicologia + Nutrição)',
      'FAMILIAR': 'Familiar'
    };
    return labels[serviceType] || serviceType;
  };

  const getTypeLabel = (type: string) => {
    return type === 'TITULAR' ? 'Titular' : 'Dependente';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{beneficiary.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={beneficiary.type === 'TITULAR' ? 'default' : 'secondary'}>
                {getTypeLabel(beneficiary.type)}
              </Badge>
              <Badge variant={beneficiary.status === 'ACTIVE' ? 'success' : 'default'}>
                {beneficiary.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">CPF</p>
                <p className="text-sm font-medium text-foreground">{formatCPF(beneficiary.cpf)}</p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Data de Nascimento</p>
                <p className="text-sm font-medium text-foreground">{formatDate(beneficiary.birth_date)}</p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                <p className="text-sm font-medium text-foreground">{beneficiary.phone || 'Não informado'}</p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">{beneficiary.email || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          {(beneficiary.cep || beneficiary.city || beneficiary.state || beneficiary.address) && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiary.cep && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">CEP</p>
                    <p className="text-sm font-medium text-foreground">{formatCEP(beneficiary.cep)}</p>
                  </div>
                )}
                
                {(beneficiary.city || beneficiary.state) && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Cidade/UF</p>
                    <p className="text-sm font-medium text-foreground">
                      {beneficiary.city && beneficiary.state 
                        ? `${beneficiary.city}/${beneficiary.state}`
                        : beneficiary.city || beneficiary.state || 'Não informado'}
                    </p>
                  </div>
                )}
                
                {beneficiary.address && (
                  <div className="bg-muted/30 p-4 rounded-lg md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                    <p className="text-sm font-medium text-foreground">{beneficiary.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plano/Serviço */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Plano/Serviço</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Tipo de Serviço</p>
              <p className="text-sm font-medium text-foreground">{getServiceLabel(beneficiary.service_type)}</p>
            </div>
          </div>

          {/* Tipo de Beneficiário */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Tipo de Beneficiário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                <p className="text-sm font-medium text-foreground">{getTypeLabel(beneficiary.type)}</p>
              </div>
              
              {beneficiary.type === 'DEPENDENTE' && beneficiary.titular && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Titular</p>
                  <p className="text-sm font-medium text-foreground">{beneficiary.titular.name}</p>
                </div>
              )}

              {beneficiary.type === 'TITULAR' && beneficiary.dependents && beneficiary.dependents.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg md:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Dependentes ({beneficiary.dependents.length})</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {beneficiary.dependents.map(dep => (
                      <Badge key={dep.id} variant="secondary">
                        {dep.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Datas de Registro */}
          {(beneficiary.created_at || beneficiary.updated_at) && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Informações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiary.created_at && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Data de Cadastro</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(beneficiary.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                
                {beneficiary.updated_at && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Última Atualização</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(beneficiary.updated_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Fechar
            </Button>
            {onEdit && (
              <Button
                variant="primary"
                onClick={onEdit}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
