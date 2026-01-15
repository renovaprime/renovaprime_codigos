import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setDoctors, setLoading, setError } from "../store/slices/doctorsSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Search, Plus, Eye, Trash, X } from "lucide-react";
import DoctorDetailsModal from "../components/Modal/DoctorDetailsModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import Pagination from "../components/Pagination";

const Doctors = () => {
  const dispatch = useDispatch();
  const { doctors, loading } = useSelector(
    (state: RootState) => state.doctors
  );
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    cpf: "",
    email: "",
  });

  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Get current doctors for pagination
  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  const hasFilters =
    filters.name.trim() !== "" || filters.cpf.trim() !== "" || filters.email.trim() !== "";

  useEffect(() => {
    const fetchDoctors = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get("/api/professionals");
        dispatch(setDoctors(response.data.data));
        setFilteredDoctors(response.data.data); 
      } catch (error) {
        toast.error("Erro ao carregar lista de médicos");
        dispatch(setError("Erro ao carregar médicos"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchDoctors();
  }, [dispatch]);

  // Aplica os filtros sempre que `filters` ou `doctors` mudar
  useEffect(() => {
    const filtered = doctors.filter((doctor) => {
      const matchesName = doctor.nome_completo
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesCpf = doctor.cpf.includes(filters.cpf);
      const matchesEmail = doctor.email
        .toLowerCase()
        .includes(filters.email.toLowerCase());

      return matchesName && matchesCpf && matchesEmail;
    });

    setFilteredDoctors(filtered);
  }, [filters, doctors]);

  // Função para limpar os filtros
  const clearFilters = () => {
    setFilters({
      name: "",
      cpf: "",
      email: "",
    });
    setCurrentPage(1); // Reset to first page when clearing filters
  };
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleCancelDoctor = async () => {
    try {
      await api.delete(`/api/professionals/${selectedDoctor.id}`);
      dispatch(
        setDoctors(doctors.filter((d) => d.id !== selectedDoctor.id))
      );
      setIsConfirmationModalOpen(false);
      toast.success("Médico removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover médico");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Lista de Profissionais
        </h1>
        
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
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doctor.nome_completo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.cpf}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.email}
                  </td>
                  <td className="pl-9 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setIsViewModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
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
          {filteredDoctors.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRecords={filteredDoctors.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}

      <DoctorDetailsModal
        isOpen={isViewModalOpen && selectedDoctor != null}
        onClose={() => setIsViewModalOpen(false)}
        doctor={selectedDoctor}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleCancelDoctor}
        message={`Tem certeza que deseja remover o profissional ${selectedDoctor?.nome_completo}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Doctors;