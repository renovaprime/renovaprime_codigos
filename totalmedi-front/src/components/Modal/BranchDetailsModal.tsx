import React from 'react';
import Modal from './Modal';

interface Branch {
  id: number;
  titulo: string;
  apelido: string;
  endereco: string;
  email: string;
  ativo: boolean;
  data_registro: string;
  parceiro: {
    nome: string;
  };
}

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({
  isOpen,
  onClose,
  branch,
}) => {
  if (!branch) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Filial">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Título</h3>
            <p className="mt-1 text-sm text-gray-900">{branch.titulo}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Parceiro</h3>
            <p className="mt-1 text-sm text-gray-900">{branch.parceiro?.nome}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Apelido</h3>
            <p className="mt-1 text-sm text-gray-900">{branch.apelido}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-sm text-gray-900">{branch.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
            <p className="mt-1 text-sm text-gray-900">{branch.endereco}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                branch.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {branch.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Registro</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(branch.data_registro).toLocaleDateString()}
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

export default BranchDetailsModal; 