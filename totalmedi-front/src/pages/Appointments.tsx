import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setAppointments,
  setLoading,
  setError,
} from "../store/slices/appointmentsSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Plus, Eye, Trash, X } from "lucide-react";
import AppointmentModal from "../components/Modal/AppointmentModal";
import AppointmentViewModal from "../components/Modal/AppointmentViewModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import Pagination from "../components/Pagination";

const Appointments = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector(
    (state: RootState) => state.appointments
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Estado para os filtros
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    patientName: "",
    specialty: "",
    status: "",
    doctor: "",
  });

  // Estado para a lista filtrada
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Get current appointments for pagination
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Verifica se algum filtro está preenchido
  const isAnyFilterActive = () => {
    return (
      filters.startDate !== "" ||
      filters.endDate !== "" ||
      filters.patientName !== "" ||
      filters.specialty !== "" ||
      filters.status !== "" ||
      filters.doctor !== ""
    );
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get("/api/appointments");
        dispatch(setAppointments(response.data));
        setFilteredAppointments(response.data); // Inicializa a lista filtrada
      } catch (error) {
        toast.error("Erro ao carregar lista de consultas");
        dispatch(setError("Erro ao carregar consultas"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchAppointments();
  }, [dispatch]);

  // Função para converter data de DD/MM/YYYY para YYYY-MM-DD
  const convertToApiDateFormat = (date) => {
    if (!date) return null;
    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Agendada";
      case "FINISHED":
        return "Finalizada";
      case "UNFINISHED":
        return "Não Finalizada";
      case "CANCELED":
        return "Cancelada";
      default:
        return "-";
    }
  };
  // Aplica os filtros sempre que `filters` ou `appointments` mudar
  useEffect(() => {
    const filtered = appointments.filter((appointment) => {
      const appointmentDate = convertToApiDateFormat(appointment.detail.date);

      const matchesDate =
        (!filters.startDate || appointmentDate >= filters.startDate) &&
        (!filters.endDate || appointmentDate <= filters.endDate);
      const matchesPatientName = appointment.beneficiary.name
        .toLowerCase()
        .includes(filters.patientName.toLowerCase());
      const matchesSpecialty = !filters.specialty || 
        appointment.specialty.name.toLowerCase() === filters.specialty.toLowerCase();
      const matchesStatus = !filters.status || appointment.status === filters.status;
      const matchesDoctor = appointment.professional.name
        .toLowerCase()
        .includes(filters.doctor.toLowerCase());

      return (
        matchesDate &&
        matchesPatientName &&
        matchesSpecialty &&
        matchesStatus &&
        matchesDoctor
      );
    });

    setFilteredAppointments(filtered);
  }, [filters, appointments]);

  // Função para limpar os filtros
  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      patientName: "",
      specialty: "",
      status: "",
      doctor: "",
    });
    setCurrentPage(1); // Reset to first page when clearing filters
  };
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSaveAppointment = async (data: any) => {
    try {
      const response = await api.post("/api/appointments", data);
      dispatch(setAppointments([...appointments, response.data]));
    } catch (error) {
      toast.error("Erro ao agendar consulta");
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancelAppointment = async () => {
    try {
      await api.delete(`/api/appointments/${appointmentData.uuid}`);
      dispatch(
        setAppointments(
          appointments.filter((a) => a.uuid !== appointmentData.uuid)
        )
      );
      setIsConfirmationModalOpen(false);
      toast.success("Consulta cancelada com sucesso!");
    } catch (error) {
      toast.error("Erro ao cancelar consulta");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Agenda de Consultas
        </h1>
        <button
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          <span>Nova Consulta</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm w-full p-2"
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
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm w-full p-2"
          />
        </div>

        {/* Filtro de Nome do Paciente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Paciente
          </label>
          <input
            type="text"
            name="patientName"
            placeholder="Digite o nome"
            value={filters.patientName}
            onChange={handleFilterChange}
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
          />
        </div>

        {/* Filtro de Especialidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especialidade
          </label>
          <select
            name="specialty"
            value={filters.specialty}
            onChange={handleFilterChange}
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
          >
            <option value="">Todas</option>
            <option value="Generalista">Generalista</option>
            <option value="Pediatria">Pediatria</option>
            <option value="Dermatologia">Dermatologia</option>
            <option value="Neurologia">Neurologia</option>
            <option value="Ortopedia">Ortopedia</option>
            <option value="Endocrinologia">Endocrinologia</option>
            <option value="Cardiologia">Cardiologia</option>
            <option value="Ginecologia e Obstetrícia">Ginecologia e Obstetrícia</option>
            <option value="Psiquiatria">Psiquiatria</option>
            <option value="Otorrinolaringologia">Otorrinolaringologia</option>
            <option value="Reumatologia">Reumatologia</option>
            <option value="Geriatria">Geriatria</option>
            <option value="Urologia">Urologia</option>
            <option value="Nutrição">Nutrição</option>
            <option value="Psicologia">Psicologia</option>
            <option value="Neuropediatria">Neuropediatria</option>
            <option value="Nutrologia">Nutrologia</option>
          </select>
        </div>

        {/* Filtro de Situação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Situação
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
          >
            <option value="">Todas</option>
            <option value="SCHEDULED">Agendada</option>
            <option value="FINISHED">Finalizada</option>
            <option value="UNFINISHED">Não Finalizada</option>
            <option value="CANCELED">Cancelada</option>
          </select>
        </div>

        {/* Filtro de Profissional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profissional
          </label>
          <input
            type="text"
            name="doctor"
            placeholder="Digite o nome"
            value={filters.doctor}
            onChange={handleFilterChange}
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
          />
        </div>

        {/* Botão para limpar filtros (só aparece se algum filtro estiver ativo) */}
        {isAnyFilterActive() && (
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidade
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data e Hora
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-ellipsis overflow-hidden max-w-[200px]">
                      {appointment.beneficiary.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-ellipsis overflow-hidden max-w-[200px]">
                      {appointment.professional.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {appointment.specialty.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          appointment.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === "UNFINISHED"
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === "FINISHED"
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                       {getStatus(appointment.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {appointment.type === "presential"
                        ? "Presencial"
                        : "Online"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {appointment.detail.date} {appointment.detail.from} - {appointment.detail.to}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setAppointmentData(appointment);
                            setIsViewModalOpen(true);
                          }}
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => {
                            setAppointmentData(appointment);
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
            {filteredAppointments.length > 0 && (
              <div className="p-4">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalRecords={filteredAppointments.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
      />

      <AppointmentViewModal
        isOpen={isViewModalOpen && appointmentData != null}
        onClose={() => setIsViewModalOpen(false)}
        appointmentUuid={appointmentData.uuid}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleCancelAppointment}
        message={`Tem certeza que deseja cancelar este agendamento?`}
      />
    </div>
  );
};

export default Appointments;