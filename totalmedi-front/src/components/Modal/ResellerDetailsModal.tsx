import React from 'react';
import Modal from './Modal';

interface Reseller {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
  email: string;
  telefone: string;
  pix: string;
  unidade_funcional: string;
  matricula: string;
  ativo: boolean;
  data_registro: string;
  filial_titulo: string;
  parceiro_nome: string;
}

interface ResellerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reseller: Reseller | null;
}

const ResellerDetailsModal: React.FC<ResellerDetailsModalProps> = ({
  isOpen,
  onClose,
  reseller,
}) => {
  if (!reseller) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Revendedor">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nome</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.nome}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">CPF</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.cpf}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Cargo</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.cargo}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.telefone || 'Não informado'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Unidade Funcional</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.unidade_funcional || 'Não informado'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Matrícula</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.matricula || 'Não informado'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Parceiro</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.parceiro_nome}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Filial</h3>
            <p className="mt-1 text-sm text-gray-900">{reseller.filial_titulo}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                reseller.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {reseller.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Registro</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(reseller.data_registro).toLocaleDateString()}
            </p>
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

export default ResellerDetailsModal; 