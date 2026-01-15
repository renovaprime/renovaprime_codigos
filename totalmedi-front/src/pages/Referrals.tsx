import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { Search, X, Filter } from "lucide-react";
import Pagination from "../components/Pagination";

// First, let's add an interface for the Referral type
interface Referral {
  uuid: string;
  createdAt: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'NON_SCHEDULABLE';
  beneficiary: {
    name: string;
    cpf: string;
  };
  professional?: {
    name: string;
  };
  partner?: {
    name: string;
  };
}

const Referrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para os filtros
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    searchTerm: "", // Para paciente, profissional ou parceiro
    status: "",
  });
  
  // Estado para a lista filtrada
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Get current referrals for pagination
  const indexOfLastReferral = currentPage * itemsPerPage;
  const indexOfFirstReferral = indexOfLastReferral - itemsPerPage;
  const currentReferrals = filteredReferrals.slice(indexOfFirstReferral, indexOfLastReferral);
  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/appointments/referrals");
        setReferrals(response.data);
        setFilteredReferrals(response.data);
      } catch {
        toast.error("Erro ao carregar lista de encaminhamentos");
      } finally {
        setLoading(false);
      }
    };

    if (referrals.length === 0) {
      fetchReferrals();
    }
  }, []);
  
  // Update the date conversion function to handle time
  const convertToDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Handle date with time format (DD/MM/YYYY HH:mm:ss)
    if (dateStr.includes('/')) {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      
      // If there's a time part, use it, otherwise use start/end of day based on context
      if (timePart) {
        return new Date(`${year}-${month}-${day}T${timePart}`);
      }
      return new Date(`${year}-${month}-${day}`);
    }
    
    // Handle YYYY-MM-DD format (from input type="date")
    return new Date(dateStr);
  };
  
  // Remove the manual applyFilters function and modify handleFilterChange
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    };
    setFilters(newFilters);
  };

  // Update the filtering useEffect
  useEffect(() => {
    const filtered = referrals.filter((referral) => {
      // Convert dates for comparison
      const referralDate = convertToDate(referral.createdAt);
      
      // For start date, set time to start of day (00:00:00)
      const startDate = filters.startDate 
        ? new Date(`${filters.startDate}T00:00:00`) 
        : null;
      
      // For end date, set time to end of day (23:59:59)
      const endDate = filters.endDate 
        ? new Date(`${filters.endDate}T23:59:59`) 
        : null;
      
      const matchesDate =
        (!startDate || (referralDate && referralDate >= startDate)) &&
        (!endDate || (referralDate && referralDate <= endDate));
        
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearchTerm = !filters.searchTerm || 
        referral.beneficiary.name.toLowerCase().includes(searchTermLower) ||
        (referral.professional?.name.toLowerCase().includes(searchTermLower) || false) ||
        (referral.partner?.name.toLowerCase().includes(searchTermLower) || false) ||
        (referral.beneficiary.cpf.toLowerCase().includes(searchTermLower) || false);
        
      const matchesStatus = !filters.status || referral.status === filters.status;
      
      return matchesDate && matchesSearchTerm && matchesStatus;
    });
    
    setFilteredReferrals(filtered);
    setCurrentPage(1);
  }, [filters, referrals]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Lista de Encaminhamentos
        </h1>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-700 mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro de Data Inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="rounded-lg border border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm w-full p-2"
            />
          </div>

          {/* Filtro de Data Final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="rounded-lg border border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm w-full p-2"
            />
          </div>

          {/* Filtro de Paciente, Profissional ou Parceiro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente (Nome ou CPF)
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                name="searchTerm"
                placeholder="Digite para pesquisar"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                className="pl-10 rounded-lg border border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
              />
            </div>
          </div>

          {/* Filtro de Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="rounded-lg border border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="SCHEDULED">Agendada</option>
              <option value="COMPLETED">Realizada</option>
              <option value="NON_SCHEDULABLE">Não Realizada</option>
            </select>
          </div>
        </div>
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
                  Beneficiário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferrals.length > 0 ? (
                currentReferrals.map((referral) => (
                  <tr key={referral.uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {referral.beneficiary.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {referral.beneficiary.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {referral.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          referral.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : referral.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : referral.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {referral.status === "PENDING" 
                          ? "Pendente" 
                          : referral.status === "SCHEDULED"
                          ? "Agendada"
                          : referral.status === "COMPLETED"
                          ? "Realizada"
                          : "Não Realizada"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum encaminhamento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredReferrals.length > 0 && (
            <div className="p-4">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalRecords={filteredReferrals.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Referrals;
