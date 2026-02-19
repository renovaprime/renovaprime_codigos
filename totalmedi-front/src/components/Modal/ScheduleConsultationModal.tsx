import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import api from "../../services/api";
import { ConsultationRequest } from "../../types";

interface Specialty {
  uuid: string;
  name: string;
}

interface AvailabilitySlot {
  uuid: string;
  date: string;
  from: string;
  to: string;
}

interface ScheduleConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  consultationRequest: ConsultationRequest | null;
  beneficiaryUuid: string;
}

const ScheduleConsultationModal: React.FC<ScheduleConsultationModalProps> = ({
  isOpen,
  onClose,
  onScheduled,
  consultationRequest,
  beneficiaryUuid,
}) => {
  const [formData, setFormData] = useState({
    specialty: "",
    monthYear: "",
    date: "",
    time: "",
  });
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [availability, setAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSpecialties = async () => {
      try {
        const response = await api.get("/api/specialties");
        setSpecialties(response.data);
      } catch {
        toast.error("Erro ao carregar especialidades");
      } finally {
        setLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
    setFormData({ specialty: "", monthYear: "", date: "", time: "" });
    setAvailability({});
  }, [isOpen]);

  // Fetch availability when specialty + monthYear selected
  useEffect(() => {
    if (!formData.specialty || !formData.monthYear) return;

    const [year, month] = formData.monthYear.split("-");
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < new Date()) {
      startDate.setDate(new Date().getDate());
    }

    const endDate = new Date(Number(year), Number(month), 0);
    endDate.setHours(23, 59, 59, 999);

    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, "0");
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const y = d.getFullYear();
      return `${day}/${m}/${y}`;
    };

    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const response = await api.get("/api/specialty-availability", {
          params: {
            specialtyUuid: formData.specialty,
            dateInitial: formatDate(startDate),
            dateFinal: formatDate(endDate),
            beneficiaryUuid,
          },
        });

        const groupedByDay = response.data.reduce(
          (acc: Record<string, AvailabilitySlot[]>, slot: AvailabilitySlot) => {
            const day = slot.date;
            if (!acc[day]) acc[day] = [];
            acc[day].push(slot);
            return acc;
          },
          {}
        );

        setAvailability(groupedByDay);
      } catch {
        toast.error("Erro ao carregar disponibilidade");
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [formData.specialty, formData.monthYear, beneficiaryUuid]);

  const getNext12Months = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = date.toLocaleString("pt-BR", { month: "long" });
      const year = date.getFullYear();
      const value = date.toISOString().substring(0, 7);
      months.push({
        label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`,
        value,
      });
    }
    return months;
  };

  const getAvailableDays = () => {
    if (!availability) return [];
    return Object.keys(availability)
      .sort()
      .map((date) => ({ value: date, label: date }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "specialty") {
      setFormData((prev) => ({ ...prev, specialty: value, date: "", time: "", monthYear: "" }));
      setAvailability({});
    } else if (name === "monthYear") {
      setFormData((prev) => ({ ...prev, monthYear: value, date: "", time: "" }));
    } else if (name === "date") {
      setFormData((prev) => ({ ...prev, date: value, time: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.specialty || !formData.time) {
      toast.error("Selecione a especialidade e o horário");
      return;
    }

    if (!consultationRequest) return;

    setSubmitting(true);
    try {
      const response = await api.post(
        `/api/consultation-requests/${consultationRequest.id}/schedule`,
        {
          specialtyUuid: formData.specialty,
          availabilityUuid: formData.time,
          beneficiaryUuid,
        }
      );

      if (response.data.success) {
        toast.success("Consulta agendada com sucesso!");
        onScheduled();
        onClose();
      } else {
        toast.error(response.data.message || "Erro ao agendar consulta");
      }
    } catch {
      toast.error("Erro ao agendar consulta");
    } finally {
      setSubmitting(false);
    }
  };

  if (!consultationRequest) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Consulta">
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Paciente:</strong> {consultationRequest.nome}
        </p>
        <p className="text-sm text-gray-600">
          <strong>CPF:</strong> {consultationRequest.cpf}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Especialidade solicitada:</strong> {consultationRequest.especialidade_nome}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Valor pago:</strong> R$ {Number(consultationRequest.valor).toFixed(2).replace(".", ",")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especialidade
          </label>
          <select
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
          >
            <option value="">Selecione a especialidade</option>
            {loadingSpecialties ? (
              <option value="" disabled>Carregando...</option>
            ) : (
              specialties.map((s) => (
                <option key={s.uuid} value={s.uuid}>
                  {s.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês/Ano
            </label>
            <select
              disabled={!formData.specialty}
              name="monthYear"
              value={formData.monthYear}
              onChange={handleChange}
              className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
            >
              <option value="">Selecione o mês</option>
              {getNext12Months().map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {formData.monthYear && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <select
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
              >
                <option value="">Selecione o dia</option>
                {getAvailableDays().map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horários
            </label>
            <div className="mt-1">
              {loadingAvailability ? (
                <div className="text-sm text-gray-500">Carregando horários...</div>
              ) : formData.date && availability[formData.date] ? (
                <div className="flex flex-wrap gap-2">
                  {availability[formData.date].map((slot) => (
                    <button
                      key={slot.uuid}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, time: slot.uuid }))
                      }
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        formData.time === slot.uuid
                          ? "bg-primary text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {slot.from}h - {slot.to}h
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {formData.date ? "Sem horários disponíveis" : "Selecione uma data"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.time}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              submitting || !formData.time
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {submitting ? "Agendando..." : "Agendar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleConsultationModal;
