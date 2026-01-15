import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setBranches, setLoading, setError } from "../store/slices/branchesSlice";
import { setPartners } from "../store/slices/partnersSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Search, Plus, Eye, Trash, X, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import BranchDetailsModal from "../components/Modal/BranchDetailsModal";
import BranchModal from "../components/Modal/BranchModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import Pagination from "../components/Pagination";

interface Branch {
  id: number;
  id_parceiro: number;
  titulo: string;
  apelido: string;
  endereco: string;
  email: string;
  senha?: string;
  ativo: boolean;
  data_registro: string;
  parceiro: {
    nome: string;
  };
}

const Branches = () => {
  const dispatch = useDispatch();
  const { branches, loading } = useSelector((state: RootState) => state.branches);
  const { partners } = useSelector((state: RootState) => state.partners);
  
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    title: "",
    partner: "",
    email: "",
  });

  const [filteredBranches, setFilteredBranches] = useState<Branch[]>(branches);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const indexOfLastBranch = currentPage * itemsPerPage;
  const indexOfFirstBranch = indexOfLastBranch - itemsPerPage;
  const currentBranches = filteredBranches.slice(indexOfFirstBranch, indexOfLastBranch);
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  const hasFilters =
    filters.title.trim() !== "" || filters.partner.trim() !== "" || filters.email.trim() !== "";

  const fetchBranches = async () => {
    dispatch(setLoading(true));
    try {

      const response = await api.get('/api/branches');
      
      dispatch(setBranches(response.data.data));
      setFilteredBranches(response.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error("Erro ao carregar lista de filiais");
      dispatch(setError("Erro ao carregar filiais"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await api.get('/api/partners');
      dispatch(setPartners(response.data.data));
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error("Erro ao carregar lista de parceiros");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchPartners();
  }, [dispatch]);

  useEffect(() => {
    const filtered = branches.filter((branch) => {
      const matchesTitle = branch.titulo
        .toLowerCase()
        .includes(filters.title.toLowerCase());
      const matchesPartner = branch.parceiro?.nome
        .toLowerCase()
        .includes(filters.partner.toLowerCase());
      const matchesEmail = branch.email
        .toLowerCase()
        .includes(filters.email.toLowerCase());

      return matchesTitle && matchesPartner && matchesEmail;
    });

    setFilteredBranches(filtered);
  }, [filters, branches]);

  const clearFilters = () => {
    setFilters({
      title: "",
      partner: "",
      email: "",
    });
    setCurrentPage(1);
  };
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteBranch = async () => {
    try {
      await api.delete(`/api/branches/${selectedBranch?.id}`);
      dispatch(
        setBranches(branches.filter((b) => b.id !== selectedBranch?.id))
      );
      setIsConfirmationModalOpen(false);
      toast.success("Filial removida com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover filial");
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      await api.put(`/api/branches/${branch.id}`, {
        ...branch,
        ativo: !branch.ativo
      });
      
      // Update the branch in the Redux store
      dispatch(setBranches(branches.map(b => 
        b.id === branch.id ? { ...b, ativo: !b.ativo } : b
      )));
      
      toast.success(`Filial ${branch.ativo ? 'desativada' : 'ativada'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status da filial');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Lista de Filiais
        </h1>
        <button
          onClick={() => setIsBranchModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Filial
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro de Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="title"
              placeholder="Digite o título"
              value={filters.title}
              onChange={(e) =>
                setFilters({ ...filters, title: e.target.value })
              }
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>
        </div>

        {/* Filtro de Parceiro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parceiro
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="partner"
              placeholder="Digite o nome do parceiro"
              value={filters.partner}
              onChange={(e) =>
                setFilters({ ...filters, partner: e.target.value })
              }
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>
        </div>

        {/* Filtro de E-mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="email"
              placeholder="Digite o e-mail"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>
        </div>

        {/* Botão para limpar filtros */}
        {hasFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm"
            >
              <X size={14} />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parceiro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {branch.titulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {branch.parceiro?.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {branch.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleToggleStatus(branch)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                        branch.ativo 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {branch.ativo ? (
                        <>
                          <ToggleRight size={16} />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} />
                          <span>Inativo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="pl-9 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsViewModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 font-medium ml-4"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setIsConfirmationModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 font-medium ml-4"
                    >
                      <Trash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredBranches.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRecords={filteredBranches.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}

      <BranchDetailsModal
        isOpen={isViewModalOpen && selectedBranch != null}
        onClose={() => setIsViewModalOpen(false)}
        branch={selectedBranch}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeleteBranch}
        message={`Tem certeza que deseja remover a filial ${selectedBranch?.titulo}? Esta ação não pode ser desfeita.`}
      />

      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onSuccess={() => {
          setIsBranchModalOpen(false);
          fetchBranches();
        }}
        partners={partners}
      />

      <BranchModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBranch(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedBranch(null);
          fetchBranches();
        }}
        branch={selectedBranch}
        partners={partners}
      />
    </div>
  );
};

export default Branches; 