import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setResellers, setLoading, setError } from "../store/slices/resellersSlice";
import { setPartners } from "../store/slices/partnersSlice";
import { setBranches } from "../store/slices/branchesSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Search, Plus, Eye, Trash, X, Edit, ToggleLeft, ToggleRight, Download } from "lucide-react";
import ResellerDetailsModal from "../components/Modal/ResellerDetailsModal";
import ResellerModal from "../components/Modal/ResellerModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import Pagination from "../components/Pagination";
import * as XLSX from 'xlsx';

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
  data_registro: string;
  filial_titulo: string;
  parceiro_nome: string;
}

const Resellers = () => {
  const dispatch = useDispatch();
  const { resellers, loading } = useSelector((state: RootState) => state.resellers);
  const { partners } = useSelector((state: RootState) => state.partners);
  const { branches } = useSelector((state: RootState) => state.branches);
  
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isResellerModalOpen, setIsResellerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    partner: "",
    branch: "",
    cpf: "",
  });

  const [filteredResellers, setFilteredResellers] = useState(resellers);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const indexOfLastReseller = currentPage * itemsPerPage;
  const indexOfFirstReseller = indexOfLastReseller - itemsPerPage;
  const currentResellers = filteredResellers.slice(indexOfFirstReseller, indexOfLastReseller);
  const totalPages = Math.ceil(filteredResellers.length / itemsPerPage);

  const hasFilters =
    filters.name.trim() !== "" || 
    filters.partner.trim() !== "" || 
    filters.branch.trim() !== "" || 
    filters.cpf.trim() !== "";

  const fetchResellers = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get("/api/resellers");
      dispatch(setResellers(response.data.data));
      setFilteredResellers(response.data.data);
    } catch (error) {
      toast.error("Erro ao carregar lista de revendedores");
      dispatch(setError("Erro ao carregar revendedores"));
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

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/branches');
      dispatch(setBranches(response.data.data));
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error("Erro ao carregar lista de filiais");
    }
  };

  useEffect(() => {
    fetchResellers();
    fetchPartners();
    fetchBranches();
  }, [dispatch]);

  useEffect(() => {
    const filtered = resellers.filter((reseller) => {
      const matchesName = reseller.nome
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesPartner = reseller.parceiro_nome
        .toLowerCase()
        .includes(filters.partner.toLowerCase());
      const matchesBranch = reseller.filial_titulo
        .toLowerCase()
        .includes(filters.branch.toLowerCase());
      const matchesCpf = reseller.cpf
        .includes(filters.cpf);

      return matchesName && matchesPartner && matchesBranch && matchesCpf;
    });

    setFilteredResellers(filtered);
  }, [filters, resellers]);

  const clearFilters = () => {
    setFilters({
      name: "",
      partner: "",
      branch: "",
      cpf: "",
    });
    setCurrentPage(1);
  };
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteReseller = async () => {
    try {
      await api.delete(`/api/resellers/${selectedReseller?.id}`);
      dispatch(
        setResellers(resellers.filter((r) => r.id !== selectedReseller?.id))
      );
      setIsConfirmationModalOpen(false);
      toast.success("Revendedor removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover revendedor");
    }
  };

  const handleToggleStatus = async (reseller: Reseller) => {
    try {
      await api.put(`/api/resellers/${reseller.id}`, {
        ...reseller,
        ativo: !reseller.ativo
      });
      
      dispatch(setResellers(resellers.map(r => 
        r.id === reseller.id ? { ...r, ativo: !r.ativo } : r
      )));
      
      toast.success(`Revendedor ${reseller.ativo ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status do revendedor');
    }
  };

  const handleOpenResellerModal = async () => {
    if (branches.length === 0) {
      await fetchBranches();
    }
    setIsResellerModalOpen(true);
  };

  const handleOpenEditModal = async (reseller: Reseller) => {
    if (branches.length === 0) {
      await fetchBranches();
    }
    setSelectedReseller(reseller);
    setIsEditModalOpen(true);
  };

  const handleExportExcel = async () => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/api/resellers/report/export');
      
      const data = response.data.data;
      
      if (data.length === 0) {
        toast.warning('Nenhum dado encontrado para exportar');
        return;
      }

      // Preparar dados para o Excel
      const excelData = data.map((item: any) => ({
        'Parceiro': item.parceiro,
        'Título Filial': item.titulo_filial,
        'Apelido Filial': item.apelido_filial,
        'Nome': item.nome,
        'CPF': item.cpf,
        'Cargo': item.cargo || '',
        'Email': item.email || '',
        'Telefone': item.telefone || '',
        'Unidade Funcional': item.unidade_funcional || '',
        'Matrícula': item.matricula || ''
      }));

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Definir larguras das colunas
      const colWidths = [
        { wch: 30 }, // Parceiro
        { wch: 25 }, // Título Filial
        { wch: 20 }, // Apelido Filial
        { wch: 30 }, // Nome
        { wch: 15 }, // CPF
        { wch: 20 }, // Cargo
        { wch: 30 }, // Email
        { wch: 15 }, // Telefone
        { wch: 20 }, // Unidade Funcional
        { wch: 15 }  // Matrícula
      ];
      ws['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Vendedores');

      // Gerar nome do arquivo com data atual
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `relatorio_vendedores_${dateStr}.xlsx`;

      // Baixar arquivo
      XLSX.writeFile(wb, fileName);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Lista de Revendedores
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
          >
            <Download size={20} className="mr-2" />
            Exportar Excel
          </button>
          <button
            onClick={handleOpenResellerModal}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Novo Revendedor
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filtro de Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="name"
              placeholder="Digite o nome"
              value={filters.name}
              onChange={(e) =>
                setFilters({ ...filters, name: e.target.value })
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

        {/* Filtro de Filial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filial
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="branch"
              placeholder="Digite o nome da filial"
              value={filters.branch}
              onChange={(e) =>
                setFilters({ ...filters, branch: e.target.value })
              }
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>
        </div>

        {/* Filtro de CPF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="cpf"
              placeholder="Digite o CPF"
              value={filters.cpf}
              onChange={(e) =>
                setFilters({ ...filters, cpf: e.target.value })
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parceiro
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentResellers.map((reseller) => (
                <tr key={reseller.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-ellipsis overflow-hidden max-w-[200px]">
                    {reseller.nome}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {reseller.cpf}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {reseller.parceiro_nome}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {reseller.filial_titulo}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleToggleStatus(reseller)}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        reseller.ativo 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {reseller.ativo ? (
                        <>
                          <ToggleRight size={14} />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={14} />
                          <span>Inativo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReseller(reseller);
                          setIsViewModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(reseller)}
                        className="text-blue-500 hover:text-blue-700 font-medium"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReseller(reseller);
                          setIsConfirmationModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredResellers.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRecords={filteredResellers.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}

      <ResellerDetailsModal
        isOpen={isViewModalOpen && selectedReseller != null}
        onClose={() => setIsViewModalOpen(false)}
        reseller={selectedReseller}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeleteReseller}
        message={`Tem certeza que deseja remover o revendedor ${selectedReseller?.nome}? Esta ação não pode ser desfeita.`}
      />

      <ResellerModal
        isOpen={isResellerModalOpen}
        onClose={() => setIsResellerModalOpen(false)}
        onSuccess={() => {
          setIsResellerModalOpen(false);
          fetchResellers();
        }}
        partners={partners}
        branches={branches}
      />

      <ResellerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReseller(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedReseller(null);
          fetchResellers();
        }}
        reseller={selectedReseller}
        partners={partners}
        branches={branches}
      />
    </div>
  );
};

export default Resellers; 