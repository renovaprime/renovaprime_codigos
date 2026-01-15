import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../../services/api";
import { toast } from "react-toastify";

interface AppointmentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentUuid: string;
}

const AppointmentViewModal: React.FC<AppointmentViewModalProps> = ({
  isOpen,
  onClose,
  appointmentUuid,
}) => {
  const [appointment, setAppointment] = useState<any>({});

  useEffect(() => {
    if (appointmentUuid) {
      getAppointmentByUuid(appointmentUuid).then((data) => {
        setAppointment(data);
      });
    }
  }, [appointmentUuid]);

  const getStatus = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Agendada";
      case "DONE":
        return "Realizada";
      case "CANCELED":
        return "Cancelada";
      default:
        return "-";
    }
  };

  const getAppointmentByUuid = async (appointmentUuid: string) => {
    try {
      const response = await api.get(`/api/appointments/${appointmentUuid}`);
      return response.data;
    } catch (error) {
      toast.error("Erro ao buscar beneficiário");
    }
  };

  if (!appointment.beneficiary) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Consulta">
      <div className="space-y-4">
        {/* Beneficiary Section */}
        <div>
          <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Beneficiário</h3>
          <p>
            <strong>Nome:</strong> {appointment.beneficiary.name}
          </p>
          <p>
            <strong>CPF:</strong> {appointment.beneficiary.cpf}
          </p>
          <p>
            <strong>Data de Nascimento:</strong> {appointment.beneficiary.birth}
          </p>
          <p>
            <strong>Telefone:</strong> {appointment.beneficiary.phone == 'null' ? 'Não informado' : appointment.beneficiary.phone}
          </p>
          <p>
            <strong>Email:</strong> {appointment.beneficiary.email}
          </p>
          </div>
        </div>

        {/* Specialty Section */}
        <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Especialidade</h3>
            <p>{appointment.specialty.name}</p>
          </div>
        </div>

        {/* Status Section */}
        <div>
          <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Status da Consulta</h3>
            <p>{getStatus(appointment.status)}</p>
          </div>
        </div>
        </div>

        {/* Professional Section */}
        <div>
          <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Profissional</h3>
          <p>
            <strong>Nome:</strong> {appointment.professional.name}
          </p>
          <p>
            <strong>Especialidades:</strong>{" "}
            {appointment.professional.specialties
              .map((specialty: any) => specialty.name)
              .join(", ")}
          </p>
          </div>
        </div>

        {/* Appointment Details Section */}
        <div>
          <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Detalhes da Consulta</h3>
          <p>
            <strong>Data:</strong> {appointment.detail.date}
          </p>
          <p>
            <strong>Horário:</strong> {appointment.detail.from} -{" "}
            {appointment.detail.to}
          </p>
          
          <h3 className="text-lg font-semibold mt-4 mb-4">Link para Atendimento</h3>
          
          <div className="flex items-center gap-2">
          <a
            href={appointment.beneficiaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark border border-gray-300 rounded-md p-2"
          >
            Acessar Atendimento
          </a>

         <button
            onClick={() => {
              navigator.clipboard.writeText(appointment.beneficiaryUrl);
              toast.success("Link copiado com sucesso!");
            }}
            className="text-primary hover:text-primary-dark border border-gray-300 rounded-md p-2 active:bg-gray-200"
          >
            Copiar Link
          </button>
          </div>
         
        </div>
        </div>
              

      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default AppointmentViewModal;
