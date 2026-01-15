import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setPartners, setLoading, setError } from "../store/slices/partnersSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Search, Plus, Eye, Trash, X, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import PartnerDetailsModal from "../components/Modal/PartnerDetailsModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import Pagination from "../components/Pagination";
import PartnerModal from '../components/Modal/PartnerModal';

const Partners = () => {
  const dispatch = useDispatch();
  const { partners, loading } = useSelector(
    (state: RootState) => state.partners
  );
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    cnpj: "",
    email: "",
  });

  const [filteredPartners, setFilteredPartners] = useState(partners);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Get current partners for pagination
  const indexOfLastPartner = currentPage * itemsPerPage;
  const indexOfFirstPartner = indexOfLastPartner - itemsPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirstPartner, indexOfLastPartner);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  const hasFilters =
    filters.name.trim() !== "" || filters.cnpj.trim() !== "" || filters.email.trim() !== "";

  // Move fetchPartners outside useEffect
  const fetchPartners = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get("/api/partners");
      dispatch(setPartners(response.data.data));
      setFilteredPartners(response.data.data);
    } catch (error) {
      toast.error("Erro ao carregar lista de parceiros");
      dispatch(setError("Erro ao carregar parceiros"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Use fetchPartners in useEffect
  useEffect(() => {
    fetchPartners();
  }, [dispatch]);

  useEffect(() => {
    const filtered = partners.filter((partner) => {
      const matchesName = partner.nome
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesCnpj = partner.cnpj?.includes(filters.cnpj) || false;
      const matchesEmail = partner.email
        .toLowerCase()
        .includes(filters.email.toLowerCase());

      return matchesName && matchesCnpj && matchesEmail;
    });

    setFilteredPartners(filtered);
  }, [filters, partners]);

  const clearFilters = () => {
    setFilters({
      name: "",
      cnpj: "",
      email: "",
    });
    setCurrentPage(1);
  };
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeletePartner = async () => {
    try {
      await api.delete(`/api/partners/${selectedPartner.id}`);
      dispatch(
        setPartners(partners.filter((p) => p.id !== selectedPartner.id))
      );
      setIsConfirmationModalOpen(false);
      toast.success("Parceiro removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover parceiro");
    }
  };

  const handleToggleStatus = async (partner: any) => {
    try {
      await api.put(`/api/partners/${partner.id}`, {
        ...partner,
        ativo: !partner.ativo
      });
      
      // Update the partner in the Redux store
      dispatch(setPartners(partners.map(p => 
        p.id === partner.id ? { ...p, ativo: !p.ativo } : p
      )));
      
      toast.success(`Parceiro ${partner.ativo ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao alterar status do parceiro');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Lista de Parceiros
        </h1>
        <button
          onClick={() => setIsPartnerModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo Parceiro
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Filtro de CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              name="cnpj"
              placeholder="Digite o CNPJ"
              value={filters.cnpj}
              onChange={(e) =>
                setFilters({ ...filters, cnpj: e.target.value })
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
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
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
              {currentPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {partner.logotipo ? (
                      <img
                        src={partner.logotipo}
                        alt={`Logo ${partner.nome}`}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sem logo</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-ellipsis overflow-hidden max-w-[200px]">
                    {partner.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.cnpj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleToggleStatus(partner)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                        partner.ativo 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {partner.ativo ? (
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
                        setSelectedPartner(partner);
                        setIsViewModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPartner(partner);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 font-medium ml-4"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPartner(partner);
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
          {filteredPartners.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRecords={filteredPartners.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}

      <PartnerDetailsModal
        isOpen={isViewModalOpen && selectedPartner != null}
        onClose={() => setIsViewModalOpen(false)}
        partner={selectedPartner}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeletePartner}
        message={`Tem certeza que deseja remover o parceiro ${selectedPartner?.nome}? Esta ação não pode ser desfeita.`}
      />

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSuccess={() => {
          setIsPartnerModalOpen(false);
          fetchPartners();
        }}
      />

      <PartnerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPartner(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedPartner(null);
          fetchPartners();
        }}
        partner={selectedPartner}
      />
    </div>
  );
};

export default Partners; 