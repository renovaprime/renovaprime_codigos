import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { setResellers } from '../../store/slices/resellersSlice';

interface Partner {
  id: number;
  nome: string;
}

interface Branch {
  id: number;
  id_parceiro: number;
  titulo: string;
}

interface Reseller {
  id: number;
  id_filial: number;
  nome: string;
  cpf: string;
  cargo: string;
  email: string;
  telefone: string;
  pix: string;
  unidade_funcional: string;
  matricula: string;
  senha?: string;
  ativo: boolean;
}

interface ResellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reseller?: Reseller | null;
  partners: Partner[];
  branches: Branch[];
}

const ResellerModal: React.FC<ResellerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reseller,
  partners,
  branches
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const userType = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');
  const isPartner = userType === 'PARCEIRO';
  const isBranch = userType === 'FILIAL';

  const [formData, setFormData] = useState({
    id_parceiro: '',
    id_filial: '',
    nome: '',
    cpf: '',
    cargo: '',
    email: '',
    telefone: '',
    pix: '',
    unidade_funcional: '',
    matricula: '',
    senha: '',
    ativo: true
  });

  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (reseller) {
      const branch = branches.find(b => b.id === reseller.id_filial);
      const partnerId = branch?.id_parceiro.toString() || '';
      
      // First filter branches
      setFilteredBranches(branches.filter(b => b.id_parceiro.toString() === partnerId));
      
      // Then set form data with a delay
      setTimeout(() => {
        setFormData({
          id_parceiro: partnerId,
          id_filial: reseller.id_filial.toString(),
          nome: reseller.nome,
          cpf: reseller.cpf,
          cargo: reseller.cargo || '',
          email: reseller.email || '',
          telefone: reseller.telefone || '',
          pix: reseller.pix || '',
          unidade_funcional: reseller.unidade_funcional || '',
          matricula: reseller.matricula || '',
          senha: '',
          ativo: reseller.ativo
        });
      }, 500);
    } else {
      if(isPartner) {
        setFilteredBranches(branches.filter(b => b.id_parceiro.toString() === userId));
      } else if(isBranch) {
        setFilteredBranches(branches.filter(b => b.id.toString() === userId));
      } else {
        setFilteredBranches(branches);
      }
      setFormData({
        id_parceiro: isPartner ? userId || '' : '',
        id_filial: isBranch ? userId || '' : '',
        nome: '',
        cpf: '',
        cargo: '',
        email: '',
        telefone: '',
        pix: '',
        unidade_funcional: '',
        matricula: '',
        senha: '',
        ativo: true
      });
    }
  }, [isOpen, reseller, branches, isPartner, isBranch, userId]);

  useEffect(() => {
    if (formData.id_parceiro && !isBranch) {
      setFilteredBranches(branches.filter(b => b.id_parceiro.toString() === formData.id_parceiro));
      if (!reseller) {
        setFormData(prev => ({ ...prev, id_filial: '' }));
      }
    } else {
      if (!isBranch) {
        setFilteredBranches([]);
        setFormData(prev => ({ ...prev, id_filial: '' }));
      }
    }
  }, [formData.id_parceiro, branches, reseller, isBranch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (reseller) {
        await api.put(`/api/resellers/${reseller.id}`, formData);
        toast.success('Revendedor atualizado com sucesso!');
      } else {
        await api.post('/api/resellers', formData);
        toast.success('Revendedor cadastrado com sucesso!');
      }
      
      const response = await api.get('/api/resellers');
      dispatch(setResellers(response.data.data));

      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Erro ao ${reseller ? 'atualizar' : 'cadastrar'} revendedor`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={reseller ? "Editar Revendedor" : "Cadastrar Revendedor"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isPartner && !isBranch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parceiro *
              </label>
              <select
                name="id_parceiro"
                value={formData.id_parceiro}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
              >
                <option value="">Selecione um parceiro</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isBranch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filial *
              </label>
              <select
                name="id_filial"
                value={formData.id_filial}
                onChange={handleChange}
                required
                disabled={!formData.id_parceiro}
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2 disabled:bg-gray-100"
              >
                <option value="">Selecione uma filial</option>
                {filteredBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.titulo}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF *
            </label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade Funcional
            </label>
            <input
              type="text"
              name="unidade_funcional"
              value={formData.unidade_funcional}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matrícula
            </label>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {!reseller && '*'}
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required={!reseller}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

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
            {loading ? 'Salvando...' : reseller ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResellerModal; 