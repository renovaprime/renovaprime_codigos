import { useState, useEffect } from 'react';
import { X, CreditCard, User, MapPin, Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { checkoutService, type CheckoutData, type Dependent } from '../services/checkoutService';
import { siteConfig } from '../config/content';

interface Plan {
  id: number;
  name: string;
  price: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
}

type Step = 'personal' | 'address' | 'card' | 'dependents' | 'processing' | 'success' | 'error';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function CheckoutModal({ isOpen, onClose, plan }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('personal');
  const [error, setError] = useState<string>('');
  const [dependents, setDependents] = useState<Dependent[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    birthDate: '',
    cep: '',
    address: '',
    addressNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    cardNumber: '',
    cardHolder: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardCvv: ''
  });

  const [dependentForm, setDependentForm] = useState({
    name: '',
    cpf: '',
    birthDate: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('personal');
      setError('');
      setDependents([]);
      setFormData({
        name: '', cpf: '', email: '', phone: '', birthDate: '',
        cep: '', address: '', addressNumber: '', neighborhood: '', city: '', state: '',
        cardNumber: '', cardHolder: '', cardExpiryMonth: '', cardExpiryYear: '', cardCvv: ''
      });
    }
  }, [isOpen]);

  // Auto-fill address from CEP
  useEffect(() => {
    const fetchAddress = async () => {
      if (formData.cep.length === 8) {
        const address = await checkoutService.fetchAddressByCep(formData.cep);
        if (address) {
          setFormData(prev => ({
            ...prev,
            address: address.address,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state
          }));
        }
      }
    };
    fetchAddress();
  }, [formData.cep]);

  const handleInputChange = (field: string, value: string) => {
    // Apply masks for specific fields
    let maskedValue = value;

    if (field === 'cpf' || field === 'phone' || field === 'cep' || field === 'cardNumber' || field === 'cardCvv') {
      maskedValue = value.replace(/\D/g, '');
    }

    if (field === 'cardExpiryMonth' || field === 'cardExpiryYear') {
      maskedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: maskedValue }));
  };

  const handleDependentChange = (field: string, value: string) => {
    let maskedValue = value;
    if (field === 'cpf') {
      maskedValue = value.replace(/\D/g, '');
    }
    setDependentForm(prev => ({ ...prev, [field]: maskedValue }));
  };

  const addDependent = () => {
    if (!dependentForm.name || !dependentForm.cpf || !dependentForm.birthDate) {
      setError('Preencha todos os campos do dependente');
      return;
    }
    if (dependentForm.cpf.length !== 11) {
      setError('CPF do dependente deve ter 11 dígitos');
      return;
    }
    if (dependents.length >= 3) {
      setError('Máximo de 3 dependentes');
      return;
    }

    setDependents([...dependents, { ...dependentForm }]);
    setDependentForm({ name: '', cpf: '', birthDate: '' });
    setError('');
  };

  const removeDependent = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const validatePersonalStep = (): boolean => {
    if (!formData.name || formData.name.length < 3) {
      setError('Nome deve ter ao menos 3 caracteres');
      return false;
    }
    if (formData.cpf.length !== 11) {
      setError('CPF deve ter 11 dígitos');
      return false;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (formData.phone.length < 10) {
      setError('Telefone deve ter ao menos 10 dígitos');
      return false;
    }
    if (!formData.birthDate) {
      setError('Data de nascimento é obrigatória');
      return false;
    }
    return true;
  };

  const validateAddressStep = (): boolean => {
    if (formData.cep.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return false;
    }
    if (!formData.address || formData.address.length < 5) {
      setError('Endereço deve ter ao menos 5 caracteres');
      return false;
    }
    if (!formData.city || formData.city.length < 2) {
      setError('Cidade é obrigatória');
      return false;
    }
    if (!formData.state || formData.state.length !== 2) {
      setError('Estado é obrigatório');
      return false;
    }
    return true;
  };

  const validateCardStep = (): boolean => {
    if (formData.cardNumber.length < 13 || formData.cardNumber.length > 19) {
      setError('Número do cartão inválido');
      return false;
    }
    if (!formData.cardHolder || formData.cardHolder.length < 3) {
      setError('Nome no cartão deve ter ao menos 3 caracteres');
      return false;
    }
    if (formData.cardExpiryMonth.length !== 2) {
      setError('Mês de validade inválido');
      return false;
    }
    if (formData.cardExpiryYear.length !== 4) {
      setError('Ano de validade inválido (use 4 dígitos)');
      return false;
    }
    if (formData.cardCvv.length < 3 || formData.cardCvv.length > 4) {
      setError('CVV inválido');
      return false;
    }
    return true;
  };

  const validateDependentsStep = (): boolean => {
    if (plan.id === 3 && dependents.length === 0) {
      setError('Plano familiar requer ao menos 1 dependente');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');

    if (step === 'personal') {
      if (validatePersonalStep()) {
        setStep('address');
      }
    } else if (step === 'address') {
      if (validateAddressStep()) {
        setStep('card');
      }
    } else if (step === 'card') {
      if (validateCardStep()) {
        if (plan.id === 3) {
          setStep('dependents');
        } else {
          handleSubmit();
        }
      }
    } else if (step === 'dependents') {
      if (validateDependentsStep()) {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    setError('');
    if (step === 'address') setStep('personal');
    else if (step === 'card') setStep('address');
    else if (step === 'dependents') setStep('card');
  };

  const handleSubmit = async () => {
    setStep('processing');
    setError('');

    try {
      const checkoutData: CheckoutData = {
        planId: plan.id,
        name: formData.name,
        cpf: formData.cpf,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        cep: formData.cep,
        address: formData.address,
        addressNumber: formData.addressNumber || 'S/N',
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        creditCard: {
          number: formData.cardNumber,
          holderName: formData.cardHolder,
          expiryMonth: formData.cardExpiryMonth,
          expiryYear: formData.cardExpiryYear,
          cvv: formData.cardCvv
        },
        dependents: plan.id === 3 ? dependents : undefined
      };

      await checkoutService.processCheckout(checkoutData);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      setStep('error');
    }
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => {
    const steps = plan.id === 3
      ? [
        { key: 'personal', label: 'Dados', icon: User },
        { key: 'address', label: 'Endereço', icon: MapPin },
        { key: 'card', label: 'Pagamento', icon: CreditCard },
        { key: 'dependents', label: 'Dependentes', icon: Users }
      ]
      : [
        { key: 'personal', label: 'Dados', icon: User },
        { key: 'address', label: 'Endereço', icon: MapPin },
        { key: 'card', label: 'Pagamento', icon: CreditCard }
      ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="flex justify-center mb-6">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = s.key === step;
          const isCompleted = index < currentIndex;

          return (
            <div key={s.key} className="flex items-center">
              <div className={`flex flex-col items-center ${index > 0 ? 'ml-4' : ''}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive
                      ? 'text-white'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  style={isActive ? { backgroundColor: siteConfig.colors.cta } : {}}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mt-[-12px] ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPersonalStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Seu nome completo"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF (somente números)</label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            maxLength={11}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="00000000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="seu@email.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (somente números)</label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          maxLength={11}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="11999999999"
        />
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <input
            type="text"
            value={formData.cep}
            onChange={(e) => handleInputChange('cep', e.target.value)}
            maxLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="00000000"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Rua, Avenida..."
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <input
            type="text"
            value={formData.addressNumber}
            onChange={(e) => handleInputChange('addressNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="123"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
          <input
            type="text"
            value={formData.neighborhood}
            onChange={(e) => handleInputChange('neighborhood', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Bairro"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Cidade"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">UF</option>
            {BRAZILIAN_STATES.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderCardStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número do cartão</label>
        <input
          type="text"
          value={formData.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
          maxLength={19}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="0000 0000 0000 0000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome impresso no cartão</label>
        <input
          type="text"
          value={formData.cardHolder}
          onChange={(e) => handleInputChange('cardHolder', e.target.value.toUpperCase())}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="NOME COMO NO CARTÃO"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
          <input
            type="text"
            value={formData.cardExpiryMonth}
            onChange={(e) => handleInputChange('cardExpiryMonth', e.target.value)}
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="MM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <input
            type="text"
            value={formData.cardExpiryYear}
            onChange={(e) => handleInputChange('cardExpiryYear', e.target.value)}
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="AAAA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
          <input
            type="text"
            value={formData.cardCvv}
            onChange={(e) => handleInputChange('cardCvv', e.target.value)}
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="000"
          />
        </div>
      </div>
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Valor:</span> R$ {plan.price.toFixed(2)}/mês
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Pagamento processado de forma segura via Asaas
        </p>
      </div>
    </div>
  );

  const renderDependentsStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        O plano familiar permite até 3 dependentes. Adicione ao menos 1 dependente.
      </p>

      {dependents.length > 0 && (
        <div className="space-y-2 mb-4">
          {dependents.map((dep, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{dep.name}</p>
                <p className="text-sm text-gray-500">CPF: {dep.cpf}</p>
              </div>
              <button
                onClick={() => removeDependent(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {dependents.length < 3 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3">Adicionar dependente</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={dependentForm.name}
              onChange={(e) => handleDependentChange('name', e.target.value)}
              placeholder="Nome completo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={dependentForm.cpf}
                onChange={(e) => handleDependentChange('cpf', e.target.value)}
                placeholder="CPF (somente números)"
                maxLength={11}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dependentForm.birthDate}
                onChange={(e) => handleDependentChange('birthDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={addDependent}
              className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: siteConfig.colors.secondary, color: 'white' }}
            >
              + Adicionar dependente
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-16 h-16 animate-spin" style={{ color: siteConfig.colors.cta }} />
      <p className="mt-4 text-lg font-medium text-gray-700">Processando pagamento...</p>
      <p className="text-sm text-gray-500">Aguarde, não feche esta janela.</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <CheckCircle className="w-20 h-20 text-green-500" />
      <h3 className="mt-4 text-xl font-bold text-gray-800">Pagamento aprovado!</h3>
      <p className="mt-2 text-center text-gray-600">
        Sua assinatura do plano <strong>{plan.name}</strong> foi realizada com sucesso.
      </p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg w-full">
        <p className="text-sm text-blue-800 font-medium mb-2">Como acessar:</p>
        <p className="text-sm text-blue-700">
          Acesse o sistema com seu <strong>email</strong> e use seu <strong>CPF como senha</strong>.
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-6 px-8 py-3 rounded-lg text-white font-medium transition-colors"
        style={{ backgroundColor: siteConfig.colors.cta }}
      >
        Fechar
      </button>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <AlertCircle className="w-20 h-20 text-red-500" />
      <h3 className="mt-4 text-xl font-bold text-gray-800">Erro no pagamento</h3>
      <p className="mt-2 text-center text-red-600">{error}</p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setStep('card')}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          Tentar novamente
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: siteConfig.colors.cta }}
        >
          Fechar
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'personal': return renderPersonalStep();
      case 'address': return renderAddressStep();
      case 'card': return renderCardStep();
      case 'dependents': return renderDependentsStep();
      case 'processing': return renderProcessing();
      case 'success': return renderSuccess();
      case 'error': return renderError();
      default: return null;
    }
  };

  const isFormStep = ['personal', 'address', 'card', 'dependents'].includes(step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-bold" style={{ color: siteConfig.colors.primary }}>
              Assinar {plan.name}
            </h2>
            <p className="text-sm text-gray-500">R$ {plan.price.toFixed(2)}/mês</p>
          </div>
          {!['processing', 'success'].includes(step) && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isFormStep && renderStepIndicator()}

          {error && isFormStep && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {renderCurrentStep()}
        </div>

        {/* Footer with navigation buttons */}
        {isFormStep && (
          <div className="flex justify-between p-4 border-t">
            <button
              onClick={step === 'personal' ? onClose : prevStep}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {step === 'personal' ? 'Cancelar' : 'Voltar'}
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: siteConfig.colors.cta }}
            >
              {(step === 'card' && plan.id !== 3) || step === 'dependents' ? 'Finalizar pagamento' : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
