import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Input } from './index';
import { beneficiaryService } from '../services/beneficiaryService';
import type { Beneficiary, BeneficiaryFormData, BeneficiaryType, ServiceType } from '../types/api';

interface BeneficiaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary?: Beneficiary | null;
  isEditing?: boolean;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function BeneficiaryFormModal({ isOpen, onClose, beneficiary, isEditing = false }: BeneficiaryFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titulares, setTitulares] = useState<Beneficiary[]>([]);
  
  const [formData, setFormData] = useState<BeneficiaryFormData>({
    type: 'TITULAR',
    name: '',
    cpf: '',
    birth_date: '',
    phone: '',
    email: '',
    password: '',
    cep: '',
    city: '',
    state: '',
    address: '',
    service_type: 'CLINICO'
  });
  
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTitulares();
      
      if (isEditing && beneficiary) {
        setFormData({
          type: beneficiary.type,
          titular_id: beneficiary.titular_id,
          name: beneficiary.name,
          cpf: beneficiary.cpf,
          birth_date: beneficiary.birth_date,
          phone: beneficiary.phone || '',
          email: beneficiary.email || '',
          password: '',
          cep: beneficiary.cep || '',
          city: beneficiary.city || '',
          state: beneficiary.state || '',
          address: beneficiary.address || '',
          service_type: beneficiary.service_type
        });
        setPasswordConfirmation('');
      } else {
        resetForm();
      }
    }
  }, [isOpen, beneficiary, isEditing]);

  const loadTitulares = async () => {
    try {
      const data = await beneficiaryService.listTitulares();
      setTitulares(data);
    } catch (err) {
      console.error('Erro ao carregar titulares:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'TITULAR',
      name: '',
      cpf: '',
      birth_date: '',
      phone: '',
      email: '',
      password: '',
      cep: '',
      city: '',
      state: '',
      address: '',
      service_type: 'CLINICO'
    });
    setPasswordConfirmation('');
    setError(null);
  };

  const handleChange = (field: keyof BeneficiaryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCPFChange = (value: string) => {
    // Remover não-dígitos
    let cpf = value.replace(/\D/g, '');
    
    // Limitar a 11 dígitos
    cpf = cpf.substring(0, 11);
    
    // Formatar
    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
      cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    
    setFormData(prev => ({ ...prev, cpf }));
    setError(null);
  };

  const handleCEPChange = async (value: string) => {
    // Remover não-dígitos
    let cep = value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    cep = cep.substring(0, 8);
    
    // Formatar
    if (cep.length > 5) {
      cep = cep.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    
    setFormData(prev => ({ ...prev, cep }));
    
    // Buscar endereço se CEP completo
    if (cep.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            city: data.localidade || '',
            state: data.uf || '',
            address: data.logradouro || ''
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remover não-dígitos
    let phone = value.replace(/\D/g, '');
    
    // Limitar a 11 dígitos
    phone = phone.substring(0, 11);
    
    // Formatar
    if (phone.length > 10) {
      phone = phone.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    } else if (phone.length > 6) {
      phone = phone.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else if (phone.length > 2) {
      phone = phone.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    }
    
    setFormData(prev => ({ ...prev, phone }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      setError('Nome deve ter ao menos 3 caracteres');
      return false;
    }
    
    const cpfDigits = formData.cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      setError('CPF inválido');
      return false;
    }
    
    if (!formData.birth_date) {
      setError('Data de nascimento é obrigatória');
      return false;
    }
    
    if (formData.type === 'DEPENDENTE' && !formData.titular_id) {
      setError('Selecione o titular do dependente');
      return false;
    }
    
    // Validação de senha (obrigatória no cadastro, opcional na edição)
    if (!isEditing) {
      if (!formData.password || formData.password.length < 6) {
        setError('Senha deve ter ao menos 6 caracteres');
        return false;
      }
      
      if (formData.password !== passwordConfirmation) {
        setError('As senhas não coincidem');
        return false;
      }
    } else {
      // Na edição, validar apenas se senha foi informada
      if (formData.password) {
        if (formData.password.length < 6) {
          setError('Senha deve ter ao menos 6 caracteres');
          return false;
        }
        
        if (formData.password !== passwordConfirmation) {
          setError('As senhas não coincidem');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        password: formData.password || undefined,
        cep: formData.cep || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        address: formData.address || undefined,
        titular_id: formData.type === 'DEPENDENTE' ? formData.titular_id : undefined
      };

      if (isEditing && beneficiary) {
        await beneficiaryService.update(beneficiary.id, dataToSubmit);
      } else {
        await beneficiaryService.create(dataToSubmit);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar beneficiário');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            {isEditing ? 'Editar Beneficiário' : 'Novo Beneficiário'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Tipo de Beneficiário */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Beneficiário *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="TITULAR"
                  checked={formData.type === 'TITULAR'}
                  onChange={(e) => handleChange('type', e.target.value as BeneficiaryType)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-foreground">Titular</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="DEPENDENTE"
                  checked={formData.type === 'DEPENDENTE'}
                  onChange={(e) => handleChange('type', e.target.value as BeneficiaryType)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-foreground">Dependente</span>
              </label>
            </div>
          </div>

          {/* Titular (se for dependente) */}
          {formData.type === 'DEPENDENTE' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Titular *
              </label>
              <select
                value={formData.titular_id || ''}
                onChange={(e) => handleChange('titular_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Selecione o titular</option>
                {titulares.map(titular => (
                  <option key={titular.id} value={titular.id}>
                    {titular.name} - {titular.cpf}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome Completo *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                CPF *
              </label>
              <Input
                value={formData.cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Data de Nascimento *
              </label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Telefone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Senha {!isEditing && '*'}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={isEditing ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
                required={!isEditing}
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe em branco para não alterar a senha
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmar Senha {!isEditing && '*'}
              </label>
              <Input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Repita a senha"
                required={!isEditing}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                CEP
              </label>
              <Input
                value={formData.cep}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cidade
              </label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estado
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione o estado</option>
                {BRAZILIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Endereço
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>
          </div>

          {/* Plano/Serviço */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Serviço *
            </label>
            <select
              value={formData.service_type}
              onChange={(e) => handleChange('service_type', e.target.value as ServiceType)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="CLINICO">Clínico</option>
              <option value="PREMIUM">Premium (Clínico + Especialistas + Psicologia + Nutrição)</option>
              <option value="FAMILIAR">Familiar</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
