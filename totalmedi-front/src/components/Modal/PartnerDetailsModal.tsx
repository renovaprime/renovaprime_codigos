import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../../services/api';

interface CommissionPlan {
  id: number;
  plano: string;
  comissao_parceiro: number;
  comissao_revendedor: number;
  nome_parceiro?: string;
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
  data_registro: string;
  logotipo?: string;
  url?: string;
}

interface PartnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
}

const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  isOpen,
  onClose,
  partner,
}) => {
  const [commissionPlans, setCommissionPlans] = useState<CommissionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  // Available plans mapping
  const planNames: { [key: string]: string } = {
    'plano_individual': 'Individual',
    'plano_individual_site': 'Individual Site',
    'plano_individual_premium': 'Individual Premium',
    'plano_familiar': 'Familiar'
  };

  // Load commission plans when partner changes
  useEffect(() => {
    if (partner && isOpen) {
      loadCommissionPlans(partner.id);
    }
  }, [partner, isOpen]);

  const loadCommissionPlans = async (partnerId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/commission-plans/partner/${partnerId}`);
      setCommissionPlans(response.data.data);
    } catch (error) {
      console.error('Error loading commission plans:', error);
      setCommissionPlans([]);
    } finally {
      setLoading(false);
    }
  };

  if (!partner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Parceiro">
      <div className="px-6">
        <div className="flex items-center space-x-4 mb-6">
          {partner.logotipo ? (
            <img
              src={partner.logotipo}
              alt="Logo do parceiro"
              className="h-32 w-32 object-contain border rounded-full p-2"
            />
          ) : (
            <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Sem logo</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {partner.nome}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nome</h3>
            <p className="mt-1 text-sm text-gray-900">{partner.nome}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">CNPJ</h3>
            <p className="mt-1 text-sm text-gray-900">{partner.cnpj}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-sm text-gray-900">{partner.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                partner.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {partner.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Agência</h3>
            <p className="mt-1 text-sm text-gray-900">{partner.agencia}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Conta</h3>
            <p className="mt-1 text-sm text-gray-900">{partner.conta}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Dígito</h3>
            <p className="mt-1 text-sm text-gray-900">{partner.digito}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">PIX</h3>
            <p className="mt-1 text-sm text-gray-900">{partner.pix}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">URL</h3>
            <p className="mt-1 text-sm text-gray-900">
              {partner.url ? (
                <a 
                  href={partner.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark"
                >
                  {partner.url}
                </a>
              ) : (
                'Não informado'
              )}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Registro</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(partner.data_registro).toLocaleDateString()}
            </p>
          </div>

          {/* Comissões por Plano */}
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Comissões por Plano</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Carregando comissões...</p>
            ) : commissionPlans.length > 0 ? (
              <div className="space-y-3">
                {commissionPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-3 bg-gray-50">
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                    <h4 className="font-medium text-gray-800">
                      {planNames[plan.plano] || plan.plano}
                    </h4>
                      <div>
                        <span className="text-gray-500">Parceiro:</span>
                        <span className="ml-1 font-medium">R$ {plan.comissao_parceiro}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Revendedor:</span>
                        <span className="ml-1 font-medium">R$ {plan.comissao_revendedor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma comissão configurada</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PartnerDetailsModal; 