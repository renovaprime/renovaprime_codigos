import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { setPartners } from '../../store/slices/partnersSlice';
import { Upload } from 'lucide-react';

interface CommissionPlan {
  id?: number;
  plano: string;
  comissao_parceiro: number;
  comissao_revendedor: number;
}

interface Partner {
  id: number;
  nome: string;
  cnpj: string;
  agencia: string;
  conta: string;
  digito: string;
  pix: string;
  email: string;
  ativo: boolean;
  logotipo?: string;
  url?: string;
  comissao_parceiro?: number;
  comissao_revendedor?: number;
}

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  partner?: Partner | null; // Add partner prop for editing
}

const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  partner
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    agencia: '',
    conta: '',
    digito: '',
    pix: '',
    email: '',
    senha: '',
    ativo: true,
    logotipo: '',
    url: ''
  });

  // Available plans
  const availablePlans = [
    { id: 'plano_individual', name: 'Individual' },
    //{ id: 'plano_individual_site', name: 'Individual Site' },
    { id: 'plano_individual_premium', name: 'Individual Premium' },
    { id: 'plano_familiar', name: 'Familiar' }
  ];

  const [commissionPlans, setCommissionPlans] = useState<CommissionPlan[]>(
    availablePlans.map(plan => ({
      plano: plan.id,
      comissao_parceiro: 0,
      comissao_revendedor: 0
    }))
  );

  const [activeTab, setActiveTab] = useState<'general' | 'commissions'>('general');

  // Load commission plans for partner
  const loadCommissionPlans = async (partnerId: number) => {
    try {
      const response = await api.get(`/api/commission-plans/partner/${partnerId}`);
      const existingPlans = response.data.data;
      
      // Merge existing plans with available plans
      const updatedPlans = availablePlans.map(plan => {
        const existingPlan = existingPlans.find((ep: any) => ep.plano === plan.id);
        return {
          id: existingPlan?.id,
          plano: plan.id,
          comissao_parceiro: existingPlan?.comissao_parceiro || 0,
          comissao_revendedor: existingPlan?.comissao_revendedor || 0
        };
      });
      
      setCommissionPlans(updatedPlans);
    } catch (error) {
      console.error('Error loading commission plans:', error);
      // Reset to default if error
      setCommissionPlans(availablePlans.map(plan => ({
        plano: plan.id,
        comissao_parceiro: 0,
        comissao_revendedor: 0
      })));
    }
  };

  // Reset form when modal opens/closes or partner changes
  useEffect(() => {
    if (partner) {
      setFormData({
        nome: partner.nome,
        cnpj: partner.cnpj || '',
        agencia: partner.agencia || '',
        conta: partner.conta || '',
        digito: partner.digito || '',
        pix: partner.pix || '',
        email: partner.email,
        senha: '', // Don't set password when editing
        ativo: partner.ativo,
        logotipo: partner.logotipo || '',
        url: partner.url || ''
      });
      loadCommissionPlans(partner.id);
    } else {
      setFormData({
        nome: '',
        cnpj: '',
        agencia: '',
        conta: '',
        digito: '',
        pix: '',
        email: '',
        senha: '',
        ativo: true,
        logotipo: '',
        url: ''
      });
      // Reset commission plans to default
      setCommissionPlans(availablePlans.map(plan => ({
        plano: plan.id,
        comissao_parceiro: 0,
        comissao_revendedor: 0
      })));
    }

    // Reset active tab when modal opens
    setActiveTab('general');
  }, [isOpen, partner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCommissionChange = (planId: string, field: 'comissao_parceiro' | 'comissao_revendedor', value: number) => {
    setCommissionPlans(prev => prev.map(plan => 
      plan.plano === planId 
        ? { ...plan, [field]: value }
        : plan
    ));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logotipo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCommissionPlans = async (partnerId: number) => {
    try {
      for (const plan of commissionPlans) {
        if (plan.id) {
          // Update existing commission plan
          await api.put(`/api/commission-plans/${plan.id}`, {
            comissao_parceiro: plan.comissao_parceiro,
            comissao_revendedor: plan.comissao_revendedor
          });
        } else {
          // Create new commission plan
          await api.post('/api/commission-plans', {
            id_parceiro: partnerId,
            plano: plan.plano,
            comissao_parceiro: plan.comissao_parceiro,
            comissao_revendedor: plan.comissao_revendedor
          });
        }
      }
    } catch (error) {
      console.error('Error saving commission plans:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let partnerId: number;

      if (partner) {
        // Update existing partner
        await api.put(`/api/partners/${partner.id}`, formData);
        partnerId = partner.id;
        toast.success('Parceiro atualizado com sucesso!');
      } else {
        // Create new partner
        const response = await api.post('/api/partners', formData);
        partnerId = response.data.id;
        toast.success('Parceiro cadastrado com sucesso!');
      }

      // Save commission plans
      await saveCommissionPlans(partnerId);
      
      // Refresh partners list
      const response = await api.get('/api/partners');
      dispatch(setPartners(response.data.data));

      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Erro ao ${partner ? 'atualizar' : 'cadastrar'} parceiro`);
    } finally {
      setLoading(false);
    }
  };

  // Tab component
  const TabButton = ({ label, isActive, onClick }: { 
    label: string, 
    isActive: boolean, 
    onClick: () => void 
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={partner ? "Editar Parceiro" : "Cadastrar Parceiro"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-gray-200 pb-4">
          <TabButton 
            label="Dados Gerais" 
            isActive={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
          />
          <TabButton 
            label="Comissões" 
            isActive={activeTab === 'commissions'} 
            onClick={() => setActiveTab('commissions')} 
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Logo Upload */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logotipo
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {formData.logotipo ? (
                  <img
                    src={formData.logotipo}
                    alt="Logo preview"
                    className="h-20 w-20 object-contain border rounded-lg"
                  />
                ) : (
                  <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary-dark"
                />
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG ou GIF até 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {!partner && '*'}
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required={!partner}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Agência */}
         <div className="grid grid-cols-5 gap-4 col-span-2">
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agência
            </label>
            <input
              type="text"
              name="agencia"
              value={formData.agencia}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Conta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta
            </label>
            <input
              type="text"
              name="conta"
              value={formData.conta}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Dígito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dígito
            </label>
            <input
              type="text"
              name="digito"
              value={formData.digito}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* PIX */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIX
            </label>
            <input
              type="text"
              name="pix"
              value={formData.pix}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>
         </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://"
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Status Toggle */}
          <div className="col-span-2">
            <div className="flex items-center space-x-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </label>
            </div>
          </div>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Comissões por Plano</h3>
            <div className="space-y-4">
              {availablePlans.map((plan) => {
                const commissionPlan = commissionPlans.find(cp => cp.plano === plan.id);
                return (
                  <div key={plan.id} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-3">{plan.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comissão Parceiro (R$)
                        </label>
                        <input
                          type="number"
                          value={commissionPlan?.comissao_parceiro || 0}
                          onChange={(e) => handleCommissionChange(plan.id, 'comissao_parceiro', parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comissão Revendedor (R$)
                        </label>
                        <input
                          type="number"
                          value={commissionPlan?.comissao_revendedor || 0}
                          onChange={(e) => handleCommissionChange(plan.id, 'comissao_revendedor', parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50"
          >
            {loading ? 'Salvando...' : partner ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PartnerModal; 