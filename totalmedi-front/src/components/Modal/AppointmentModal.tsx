import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import * as yup from "yup";
import api from "../../services/api";
import Select from 'react-select';

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

interface Beneficiary {
  uuid: string;
  name: string;
}

interface Referral {
  uuid: string;
  beneficiary: Beneficiary;
  urlPath: string;
  status: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const appointmentSchema = yup.object().shape({
  //type: yup.string().required("Tipo de consulta é obrigatório"),
  patientId: yup.string().required("Paciente é obrigatório"),
  specialty: yup.string().required("Especialidade é obrigatória"),
  date: yup.string().required("Data é obrigatória"),
  time: yup.string().required("Horário é obrigatório"),
});

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    type: "",
    patientId: "",
    specialty: "",
    date: "",
    time: "",
    monthYear: "",
  });
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [availability, setAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Fetch specialties on component mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await api.get("/api/specialties");
        setSpecialties(response.data); // Assuming the response is an array of specialties
      } catch (error) {
        toast.error("Erro ao carregar especialidades");
      } finally {
        setLoadingSpecialties(false);
      }
    };

    const fetchBeneficiaries = async () => {
      try {
        const response = await api.get("/api/beneficiaries");
        setBeneficiaries(response.data.beneficiaries);
      } catch (error) {
        toast.error("Erro ao carregar lista de beneficiários");
      }
    };

    const fetchReferrals = async () => {
      try {
        const response = await api.get("/api/appointments/referrals");
        const referrals = response.data.filter((referral: Referral) => referral.status === "PENDING");
        setReferrals(referrals);
      } catch (error) {
        toast.error("Erro ao carregar lista de encaminhamentos");
      }
    };


    fetchSpecialties();
    fetchBeneficiaries();
    fetchReferrals();
  }, []);

  // Add this function after the useState declarations
  const getNext12Months = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = date.toLocaleString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      const value = date.toISOString().substring(0, 7); // Format: YYYY-MM
      
      months.push({
        label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`,
        value: value
      });
    }
    
    return months;
  };

  // Fetch availability when specialty and date are selected
  useEffect(() => {
    if (formData.specialty && formData.monthYear) {

      const [year, month] = formData.monthYear.split('-');
      //first day of the month
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      startDate.setHours(0, 0, 0, 0);

      //start date < than today
      if (startDate < new Date()) {
        startDate.setDate(new Date().getDate());
      }
      
      //last day of the month
      const endDate = new Date(Number(year), Number(month), 0);
      endDate.setHours(23, 59, 59, 999);

      // Format dates to dd/MM/yyyy
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const fetchAvailability = async () => {
        setLoadingAvailability(true);
        try {
          const response = await api.get("/api/specialty-availability", {
            params: {
              specialtyUuid: formData.specialty,
              dateInitial: formatDate(startDate),
              dateFinal: formatDate(endDate),
              beneficiaryUuid: formData.patientId,
            },
          });

          const groupedByDay = response.data.reduce((acc: { [key: string]: AvailabilitySlot[] }, slot: AvailabilitySlot) => {
            const day = slot.date;
            if (!acc[day]) {
              acc[day] = [];
            }
            acc[day].push(slot);
            return acc;
          }, {});

          setAvailability(groupedByDay);
        } catch (error) {
          console.log(error);
          toast.error("Erro ao carregar disponibilidade");
        } finally {
          setLoadingAvailability(false);
        }
      };

      fetchAvailability();
    }
  }, [formData.specialty, formData.monthYear, formData.patientId]);

  // Add this function to get available days
  const getAvailableDays = () => {
    if (!availability) return [];
    
    return Object.keys(availability).sort().map(date => {
      const [day, month, year] = date.split('/');
      const weekday = new Date(Number(year), Number(month) - 1, Number(day))
        .toLocaleDateString('pt-BR', { weekday: 'long' });
      
      return {
        value: date,
        label: date
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentSchema.validate(formData);

      const appointmentDataWithoutReferral = {
        specialtyUuid: formData.specialty,
        beneficiaryUuid: formData.patientId,
        availabilityUuid: formData.time,
        approveAdditionalPayment: true,
      };

      const appointmentDataWithReferral = {
        specialtyUuid: formData.specialty,
        beneficiaryUuid: formData.patientId,
        availabilityUuid: formData.time,
        beneficiaryMedicalReferralUuid: referrals.find((referral) => referral.beneficiary.uuid === formData.patientId)?.uuid,
      }

      onSave(formData.type === "1" ? appointmentDataWithoutReferral : appointmentDataWithReferral);
      onClose();
      toast.success("Consulta agendada com sucesso!");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        toast.error(error.message);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "type") {
      setFormData({
        type: value,
        patientId: "",
        specialty: "",
        date: "",
        time: "",
        monthYear: "",
      });
    } else if (name === "patientId") {
      setFormData((prev) => ({
        ...prev,
        patientId: value,
        specialty: "",
        date: "",
        time: "",
        monthYear: "",
      }));
    } else if (name === "specialty") {
      setFormData((prev) => ({
        ...prev,
        specialty: value,
        date: "",
        time: "",
        monthYear: "",
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePatientChange = (selectedOption: { value: string; label: string } | null) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        patientId: selectedOption.value,
        specialty: "",
        date: "",
        time: "",
        monthYear: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        patientId: "",
        specialty: "",
        date: "",
        time: "",
        monthYear: "",
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Consulta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Consulta
          </label>
          <select
            name="type"
            value={formData.type || ""}
            onChange={handleChange}
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
            required
          >
            <option value="">Selecione o tipo</option>
            <option value="1">Avulsa</option>
            <option value="2">Encaminhamento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paciente
          </label>
          <Select
            isClearable
            isSearchable
            placeholder="Selecione o paciente"
            value={formData.type === "1" 
              ? beneficiaries.find(b => b.uuid === formData.patientId) 
                ? { value: formData.patientId, label: beneficiaries.find(b => b.uuid === formData.patientId)?.name || '' }
                : null
              : referrals.find(r => r.beneficiary.uuid === formData.patientId)
                ? { value: formData.patientId, label: referrals.find(r => r.beneficiary.uuid === formData.patientId)?.beneficiary.name || '' }
                : null
            }
            onChange={handlePatientChange}
            options={formData.type === "1"
              ? beneficiaries.map(beneficiary => ({
                  value: beneficiary.uuid,
                  label: beneficiary.name
                }))
              : referrals.map(referral => ({
                  value: referral.beneficiary.uuid,
                  label: referral.beneficiary.name
                }))
            }
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm"
            classNamePrefix="select"
            noOptionsMessage={() => "Nenhum paciente encontrado"}
            loadingMessage={() => "Carregando..."}
          />
        </div>

        {formData.type === "2" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Arquivo do Encaminhamento: 
              <a className="text-gray-500 ml-2" href={referrals.find((referral) => referral.beneficiary.uuid === formData.patientId)?.urlPath} target="_blank">  
                [Clique aqui para abrir]
              </a>
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Especialidade
          </label>
          <select
            disabled={!formData.patientId}
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
          >
            <option value="">Selecione a especialidade</option>
            {loadingSpecialties ? (
              <option value="" disabled>
                Carregando...
              </option>
            ) : (
              specialties.map((specialty) => (
                <option key={specialty.uuid} value={specialty.uuid}>
                  {specialty.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mês/Ano
            </label>
            <select
              disabled={!formData.patientId || !formData.specialty}
              name="monthYear"
              value={formData.monthYear}
              onChange={handleChange}
              className="rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 w-full shadow-sm p-2"
              >
              <option value="">Selecione o mês</option>
              {getNext12Months().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {formData.monthYear && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
            <label className="block text-sm font-medium text-gray-700">
              Horários
            </label>
            <div className="mt-1">
              {loadingAvailability ? (
                <div className="text-sm text-gray-500">Carregando horários...</div>
              ) : formData.date && availability[formData.date] ? (
                <div className="flex flex-wrap gap-2">
                  {availability[formData.date].map((slot: AvailabilitySlot) => (
                    <button
                      key={slot.uuid}
                      type="button"
                      onClick={() => handleChange({
                        target: { name: 'time', value: slot.uuid },
                      } as React.ChangeEvent<HTMLInputElement>)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors
                        ${formData.time === slot.uuid
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                      {slot.from}h - {slot.to}h
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {formData.date ? 'Sem horários disponíveis' : 'Selecione uma data'}
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
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
          >
            Agendar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;
