import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setBeneficiaries,
  setLoading,
  setError,
} from "../store/slices/beneficiariesSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Search, Plus, EyeIcon, EditIcon, X, Link } from "lucide-react";
import BeneficiaryModal from "../components/Modal/BeneficiaryModal";
import BeneficiaryViewModal from "../components/Modal/BeneficiaryViewModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import EditBeneficiaryModal from "../components/Modal/EditBeneficiaryModal";
import Pagination from "../components/Pagination";

// Add these new types after the imports
interface Beneficiary {
  id: string;
  name: string;
  cpf: string;
  holder?: string;
  isActive: boolean;
  birthDate: string;
  nome_revendedor?: string;
  nome_parceiro?: string;
  nome_filial?: string;
}

interface GroupedBeneficiary extends Beneficiary {
  dependents?: Beneficiary[];
}

const Beneficiaries = () => {
  const dispatch = useDispatch();
  const { beneficiaries, loading } = useSelector(
    (state: RootState) => state.beneficiaries
  );
  const userType = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [statusToToggle, setStatusToToggle] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    reseller: "",
    branch: "",
    partner: "",
  });

  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState(beneficiaries);
  
  // Get unique values for filters
  const uniqueResellers = Array.from(new Set(beneficiaries.map(b => b.nome_revendedor).filter(Boolean)));
  const uniqueBranches = Array.from(new Set(beneficiaries.map(b => b.nome_filial).filter(Boolean)));
  const uniquePartners = Array.from(new Set(beneficiaries.map(b => b.nome_parceiro).filter(Boolean)));

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Get current beneficiaries for pagination
  const indexOfLastBeneficiary = currentPage * itemsPerPage;
  const indexOfFirstBeneficiary = indexOfLastBeneficiary - itemsPerPage;
  const currentBeneficiaries = filteredBeneficiaries.slice(indexOfFirstBeneficiary, indexOfLastBeneficiary);
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  
  const hasFilters = searchTerm.trim() !== "" || 
    filters.reseller !== "" || 
    filters.branch !== "" || 
    filters.partner !== "";

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get("/api/beneficiaries");
        dispatch(setBeneficiaries(response.data.beneficiaries));
        setFilteredBeneficiaries(response.data.beneficiaries); 
      } catch (error) {
        toast.error("Erro ao carregar lista de beneficiários");
        dispatch(setError("Erro ao carregar beneficiários"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchBeneficiaries();
  }, [dispatch]);

  // Add this new function before the return statement
  const groupBeneficiaries = (beneficiaries: Beneficiary[]): GroupedBeneficiary[] => {
    const holders: { [key: string]: GroupedBeneficiary } = {};
    const dependents: Beneficiary[] = [];

    // First pass - separate holders and dependents
    beneficiaries.forEach(beneficiary => {
      if (!beneficiary.holder) {
        holders[beneficiary.cpf] = { ...beneficiary, dependents: [] };
      } else {
        dependents.push(beneficiary);
      }
    });

    // Second pass - assign dependents to holders
    dependents.forEach(dependent => {
      if (dependent.holder && holders[dependent.holder]) {
        holders[dependent.holder].dependents?.push(dependent);
      }
    });

    return Object.values(holders);
  };

  // Modify the useEffect that filters beneficiaries
  useEffect(() => {
    const filtered = beneficiaries.filter((beneficiary) => {
      // Check if the current beneficiary matches the search
      const beneficiaryMatches = beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check filter matches
      const resellerMatch = !filters.reseller || beneficiary.nome_revendedor === filters.reseller;
      const branchMatch = !filters.branch || beneficiary.nome_filial === filters.branch;
      const partnerMatch = !filters.partner || beneficiary.nome_parceiro === filters.partner;
      
      // If this is a holder (no holder property), check their dependents
      if (!beneficiary.holder) {
        // Find all dependents of this holder
        const dependents = beneficiaries.filter(dep => dep.holder === beneficiary.cpf);
        
        // Check if any dependent matches the search
        const hasMatchingDependent = dependents.some(dep => 
          dep.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // If either the holder or any dependent matches, include this holder and their dependents
        if ((beneficiaryMatches || hasMatchingDependent) && resellerMatch && branchMatch && partnerMatch) {
          return true;
        }
      } else {
        // If this is a dependent, only include if it matches the search
        // OR if its holder matches the search
        const holder = beneficiaries.find(h => h.cpf === beneficiary.holder);
        const holderMatches = holder?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return (beneficiaryMatches || holderMatches) && resellerMatch && branchMatch && partnerMatch;
      }
      
      return false;
    });
    
    // Group the filtered beneficiaries
    const grouped = groupBeneficiaries(filtered);
    setFilteredBeneficiaries(grouped);
  }, [searchTerm, beneficiaries, filters]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      reseller: "",
      branch: "",
      partner: "",
    });
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSaveBeneficiary = async (data: any) => {
    try {
      const response = await api.post("/api/beneficiaries", data);
      if (!response.data.success) {
        return toast.error(response.data.message);
      } else {
        toast.success("Beneficiário cadastrado com sucesso!");
        const response = await api.get("/api/beneficiaries");
        dispatch(setBeneficiaries(response.data.beneficiaries));
      }
    } catch (error) {
      toast.error("Erro ao cadastrar beneficiário");
    }
  };

  const updateBeneficiary = async (updatedBeneficiaries) => {
    dispatch(setBeneficiaries(updatedBeneficiaries));
  };

  const toggleBeneficiaryStatus = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setStatusToToggle(beneficiary.isActive);
    setIsConfirmationModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedBeneficiary) return;
    try {
      await api.delete(`/api/beneficiaries/${selectedBeneficiary.uuid}`);
      dispatch(
        setBeneficiaries(
          beneficiaries.map((b) =>
            b.uuid === selectedBeneficiary.uuid
              ? { ...b, isActive: !selectedBeneficiary.isActive }
              : b
          )
        )
      );
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar status do beneficiário");
    } finally {
      setIsConfirmationModalOpen(false);
      setSelectedBeneficiary(null);
    }
  };

  const handleCopySalesLink = () => {
    const domain = window.location.origin;
    const salesLink = `${domain}/checkout?rev=${userId}`;
    navigator.clipboard.writeText(salesLink);
    toast.success("Link copiado com sucesso!");
  };

  const handleOpenSalesPage = () => {
    const domain = window.location.origin;
    const salesLink = `${domain}/checkout?rev=${userId}`;
    window.open(salesLink, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Lista de Beneficiários
        </h1>
        <div className="flex items-center space-x-4">
          {userType === 'REVENDEDOR' && (
            <>
              <button
                className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                onClick={handleCopySalesLink}
              >
                <Link size={20} />
                <span>Seu link de vendas</span>
              </button>
              <button
                className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                onClick={handleOpenSalesPage}
              >
                <Link size={20} />
                <span>Abrir página de vendas</span>
              </button>
            </>
          )}
          {userType !== 'REVENDEDOR' && (
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} />
              <span>Novo Beneficiário</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Beneficiário
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Digite o nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Revendedor
          </label>
          <select
            value={filters.reseller}
            onChange={(e) => setFilters(prev => ({ ...prev, reseller: e.target.value }))}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
          >
            <option value="">Todos</option>
            {uniqueResellers.map((reseller) => (
              <option key={reseller} value={reseller}>
                {reseller}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filial
          </label>
          <select
            value={filters.branch}
            onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
          >
            <option value="">Todas</option>
            {uniqueBranches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parceiro
          </label>
          <select
            value={filters.partner}
            onChange={(e) => setFilters(prev => ({ ...prev, partner: e.target.value }))}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
          >
            <option value="">Todos</option>
            {uniquePartners.map((partner) => (
              <option key={partner} value={partner}>
                {partner}
              </option>
            ))}
          </select>
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
                  Revendedor
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parceiro
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
              {currentBeneficiaries.map((beneficiary) => (
                <React.Fragment key={beneficiary.id}>
                  {/* Holder row */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {beneficiary.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {beneficiary.cpf}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {beneficiary.nome_revendedor || '-'}
                      {beneficiary.nome_filial && (
                        <div className="text-xs font-bold text-gray-600 mt-0.5">
                          {beneficiary.nome_filial}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {beneficiary.nome_parceiro || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={beneficiary.isActive}
                          onChange={() => toggleBeneficiaryStatus(beneficiary)}
                        />
                        <div
                          className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${
                            beneficiary.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                              beneficiary.isActive
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                      </label>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBeneficiary(beneficiary);
                            setIsViewModalOpen(true);
                          }}
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          <EyeIcon size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBeneficiary(beneficiary);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          <EditIcon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Dependent rows */}
                  {beneficiary.dependents?.map((dependent) => (
                    <tr key={dependent.id} className="hover:bg-gray-50 bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 pl-12">
                        ↳ {dependent.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {dependent.cpf}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {dependent.nome_revendedor || '-'}
                        {dependent.nome_filial && (
                          <div className="text-xs font-bold text-gray-600 mt-0.5">
                            {dependent.nome_filial}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {dependent.nome_parceiro || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={dependent.isActive}
                            onChange={() => toggleBeneficiaryStatus(dependent)}
                          />
                          <div
                            className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${
                              dependent.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                                dependent.isActive
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBeneficiary(dependent);
                              setIsViewModalOpen(true);
                            }}
                            className="text-primary hover:text-primary-dark font-medium"
                          >
                            <EyeIcon size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBeneficiary(dependent);
                              setIsEditModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 font-medium"
                          >
                            <EditIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredBeneficiaries.length > 0 && (
            <div className="p-4">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalRecords={filteredBeneficiaries.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      <BeneficiaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBeneficiary}
      />
      <BeneficiaryViewModal
        isOpen={isViewModalOpen}
        cpf={selectedBeneficiary?.cpf}
        onClose={() => setIsViewModalOpen(false)}
      />
      <EditBeneficiaryModal
        isOpen={isEditModalOpen && selectedBeneficiary != null}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={updateBeneficiary}
        beneficiary={selectedBeneficiary}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmToggleStatus}
        message={`Tem certeza que deseja ${
          statusToToggle ? "inativar" : "ativar"
        } este beneficiário? [${selectedBeneficiary?.name}]`}
      />
    </div>
  );
};

export default Beneficiaries;