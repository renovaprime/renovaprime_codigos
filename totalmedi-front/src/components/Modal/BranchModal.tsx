import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { setBranches } from '../../store/slices/branchesSlice';

interface Partner {
  id: number;
  nome: string;
}

interface Branch {
  id: number;
  id_parceiro: number;
  titulo: string;
  apelido: string;
  endereco: string;
  email: string;
  senha?: string;
  ativo: boolean;
}

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branch?: Branch | null;
  partners: Partner[];
}

const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch,
  partners
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_parceiro: '',
    titulo: '',
    apelido: '',
    endereco: '',
    email: '',
    senha: '',
    ativo: true
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        id_parceiro: branch.id_parceiro.toString(),
        titulo: branch.titulo,
        apelido: branch.apelido || '',
        endereco: branch.endereco || '',
        email: branch.email,
        senha: '', // Don't set password when editing
        ativo: branch.ativo
      });
    } else {
      const userType = localStorage.getItem('userType');
      const userId = localStorage.getItem('userId');
      
      setFormData({
        id_parceiro: userType === 'PARCEIRO' ? userId || '' : '',
        titulo: '',
        apelido: '',
        endereco: '',
        email: '',
        senha: '',
        ativo: true
      });
    }
  }, [isOpen, branch]);

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
      if (branch) {
        await api.put(`/api/branches/${branch.id}`, formData);
        toast.success('Filial atualizada com sucesso!');
      } else {
        await api.post('/api/branches', formData);
        toast.success('Filial cadastrada com sucesso!');
      }
      
      const response = await api.get('/api/branches');
      dispatch(setBranches(response.data.data));

      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || `Erro ao ${branch ? 'atualizar' : 'cadastrar'} filial`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branch ? "Editar Filial" : "Cadastrar Filial"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localStorage.getItem("userType") !== "PARCEIRO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parceiro *
              </label>

              <select
                name="id_parceiro"
                value={formData.id_parceiro}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2 disabled:bg-gray-100"
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

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Apelido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apelido
            </label>
            <input
              type="text"
              name="apelido"
              value={formData.apelido}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
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
              Senha {!branch && "*"}
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required={!branch}
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
                  {formData.ativo ? "Ativo" : "Inativo"}
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
            {loading ? "Salvando..." : branch ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchModal; 