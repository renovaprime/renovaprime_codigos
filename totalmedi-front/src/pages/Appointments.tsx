import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setAppointments,
  setLoading,
  setError,
} from "../store/slices/appointmentsSlice";
import {
  setRequests,
  setLoading as setRequestsLoading,
  removeRequest,
} from "../store/slices/consultationRequestsSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Plus, Eye, Trash, X, Calendar, UserPlus, Loader2 } from "lucide-react";
import AppointmentModal from "../components/Modal/AppointmentModal";
import AppointmentViewModal from "../components/Modal/AppointmentViewModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import ScheduleConsultationModal from "../components/Modal/ScheduleConsultationModal";
import Pagination from "../components/Pagination";
import { ConsultationRequest } from "../types";

const Appointments = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector(
    (state: RootState) => state.appointments
  );
  const { requests: consultationRequests, loading: requestsLoading } = useSelector(
    (state: RootState) => state.consultationRequests
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"agendamentos" | "solicitacoes">("agendamentos");

  // Schedule consultation modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);

  // Two-step flow: create beneficiary then schedule
  const [beneficiaryUuids, setBeneficiaryUuids] = useState<Record<number, string>>({});
  const [creatingBeneficiary, setCreatingBeneficiary] = useState<Record<number, boolean>>({});

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

  // Pagination for consultation requests
  const [requestsPage, setRequestsPage] = useState(1);

  // Get current appointments for pagination
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Get current requests for pagination
  const indexOfLastRequest = requestsPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = consultationRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalRequestPages = Math.ceil(consultationRequests.length / itemsPerPage);

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

  const fetchConsultationRequests = async () => {
    dispatch(setRequestsLoading(true));
    try {
      const response = await api.get("/api/consultation-requests");
      dispatch(setRequests(response.data.data));
    } catch {
      toast.error("Erro ao carregar solicitações de consulta");
    } finally {
      dispatch(setRequestsLoading(false));
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get("/api/appointments");
        dispatch(setAppointments(response.data));
        setFilteredAppointments(response.data);
      } catch {
        toast.error("Erro ao carregar lista de consultas");
        dispatch(setError("Erro ao carregar consultas"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchAppointments();
    fetchConsultationRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Função para converter data de DD/MM/YYYY para YYYY-MM-DD
  const convertToApiDateFormat = (date: string) => {
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
    const filtered = appointments.filter((appointment: any) => {
      const appointmentDate = convertToApiDateFormat(appointment.detail.date);

      const matchesDate =
        (!filters.startDate || (appointmentDate && appointmentDate >= filters.startDate)) &&
        (!filters.endDate || (appointmentDate && appointmentDate <= filters.endDate));
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
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSaveAppointment = async (data: any) => {
    try {
      const response = await api.post("/api/appointments", data);
      dispatch(setAppointments([...appointments, response.data]));
    } catch {
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
          appointments.filter((a: any) => a.uuid !== appointmentData.uuid)
        )
      );
      setIsConfirmationModalOpen(false);
      toast.success("Consulta cancelada com sucesso!");
    } catch {
      toast.error("Erro ao cancelar consulta");
    }
  };

  const handleCreateBeneficiary = async (request: ConsultationRequest) => {
    setCreatingBeneficiary((prev) => ({ ...prev, [request.id]: true }));
    try {
      const response = await api.post(
        `/api/consultation-requests/${request.id}/create-beneficiary`
      );
      if (response.data.success) {
        setBeneficiaryUuids((prev) => ({
          ...prev,
          [request.id]: response.data.beneficiaryUuid,
        }));
        toast.success("Beneficiário criado com sucesso!");
      } else {
        toast.error(response.data.message || "Erro ao criar beneficiário");
      }
    } catch {
      toast.error("Erro ao criar beneficiário");
    } finally {
      setCreatingBeneficiary((prev) => ({ ...prev, [request.id]: false }));
    }
  };

  const handleScheduleRequest = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setIsScheduleModalOpen(true);
  };

  const handleScheduled = async () => {
    if (selectedRequest) {
      dispatch(removeRequest(selectedRequest.id));
    }
    // Reload appointments to show the newly scheduled one
    try {
      const response = await api.get("/api/appointments");
      dispatch(setAppointments(response.data));
    } catch {
      // silent
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Agenda de Consultas
        </h1>
        {activeTab === "agendamentos" && (
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            <span>Nova Consulta</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("agendamentos")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "agendamentos"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Agendamentos
          </button>
          <button
            onClick={() => setActiveTab("solicitacoes")}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 hidden ${
              activeTab === "solicitacoes"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>Solicitações de Consulta</span>
            {consultationRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {consultationRequests.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab: Agendamentos */}
      {activeTab === "agendamentos" && (
        <>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="Alergia e Imunologia">Alergia e Imunologia</option>
                <option value="Anestesiologia">Anestesiologia</option>
                <option value="Angiologia">Angiologia</option>
                <option value="Cardiologia">Cardiologia</option>
                <option value="Cirurgia Cardiovascular">Cirurgia Cardiovascular</option>
                <option value="Cirurgia da Mão">Cirurgia da Mão</option>
                <option value="Cirurgia de Cabeça e Pescoço">Cirurgia de Cabeça e Pescoço</option>
                <option value="Cirurgia do Aparelho Digestivo">Cirurgia do Aparelho Digestivo</option>
                <option value="Cirurgia Geral">Cirurgia Geral</option>
                <option value="Cirurgia Oncológica">Cirurgia Oncológica</option>
                <option value="Cirurgia Pediátrica">Cirurgia Pediátrica</option>
                <option value="Cirurgia Plástica">Cirurgia Plástica</option>
                <option value="Cirurgia Torácica">Cirurgia Torácica</option>
                <option value="Cirurgia Vascular">Cirurgia Vascular</option>
                <option value="Coloproctologia">Coloproctologia</option>
                <option value="Dermatologia">Dermatologia</option>
                <option value="Endocrinologia">Endocrinologia</option>
                <option value="Endoscopia">Endoscopia</option>
                <option value="Gastroenterologia">Gastroenterologia</option>
                <option value="Generalista">Generalista</option>
                <option value="Geriatria">Geriatria</option>
                <option value="Ginecologia e Obstetrícia">Ginecologia e Obstetrícia</option>
                <option value="Hematologia e Hemoterapia">Hematologia e Hemoterapia</option>
                <option value="Homeopatia">Homeopatia</option>
                <option value="Infectologia">Infectologia</option>
                <option value="Mastologia">Mastologia</option>
                <option value="Medicina de Família e Comunidade">Medicina de Família e Comunidade</option>
                <option value="Medicina Esportiva">Medicina Esportiva</option>
                <option value="Medicina Física e Reabilitação">Medicina Física e Reabilitação</option>
                <option value="Medicina Nuclear">Medicina Nuclear</option>
                <option value="Medicina Preventiva e Social">Medicina Preventiva e Social</option>
                <option value="Nefrologia">Nefrologia</option>
                <option value="Neurologia">Neurologia</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Nutrologia">Nutrologia</option>
                <option value="Oftalmologia">Oftalmologia</option>
                <option value="Oncologia Clínica">Oncologia Clínica</option>
                <option value="Ortopedia">Ortopedia</option>
                <option value="Otorrinolaringologia">Otorrinolaringologia</option>
                <option value="Pediatria">Pediatria</option>
                <option value="Pneumologia">Pneumologia</option>
                <option value="Psicologia">Psicologia</option>
                <option value="Psiquiatria">Psiquiatria</option>
                <option value="Radioterapia">Radioterapia</option>
                <option value="Reumatologia">Reumatologia</option>
                <option value="Urologia">Urologia</option>
              </select>
            </div>

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
                    {currentAppointments.map((appointment: any) => (
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
        </>
      )}

      {/* Tab: Solicitações de Consulta */}
      {activeTab === "solicitacoes" && (
        <>
          {requestsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : consultationRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Nenhuma solicitação de consulta pendente.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
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
                        Email
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Especialidade
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-ellipsis overflow-hidden max-w-[200px]">
                          {request.nome}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {request.cpf?.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-ellipsis overflow-hidden max-w-[200px]">
                          {request.email}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {request.telefone ? (
                            <a
                              href={`https://wa.me/55${request.telefone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 hover:underline"
                            >
                              {request.telefone.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {request.especialidade_nome}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          R$ {Number(request.valor).toFixed(2).replace(".", ",")}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.data_criacao)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {(request.beneficiary_uuid || beneficiaryUuids[request.id]) ? (
                            <button
                              onClick={() => handleScheduleRequest(request)}
                              className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 text-sm"
                            >
                              <Calendar size={14} />
                              <span>Agendar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCreateBeneficiary(request)}
                              disabled={creatingBeneficiary[request.id]}
                              className={`text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 text-sm ${
                                creatingBeneficiary[request.id]
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {creatingBeneficiary[request.id] ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <UserPlus size={14} />
                              )}
                              <span>
                                {creatingBeneficiary[request.id]
                                  ? "Criando..."
                                  : "Criar Beneficiário"}
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {consultationRequests.length > itemsPerPage && (
                  <div className="p-4">
                    <Pagination
                      currentPage={requestsPage}
                      totalPages={totalRequestPages}
                      onPageChange={setRequestsPage}
                      totalRecords={consultationRequests.length}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
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

      <ScheduleConsultationModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduled={handleScheduled}
        consultationRequest={selectedRequest}
        beneficiaryUuid={selectedRequest ? (selectedRequest.beneficiary_uuid || beneficiaryUuids[selectedRequest.id] || "") : ""}
      />
    </div>
  );
};

export default Appointments;
