import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { CalendarioMensal } from './CalendarioMensal';
import { appointmentService } from '../services/appointmentService';
import { availabilityService } from '../services/availabilityService';
import { apiClient } from '../services/api';
import type { Specialty, Beneficiary, AvailableSlot, ApiResponse } from '../types/api';

interface AgendarConsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AgendarConsultaModal({ isOpen, onClose, onSuccess }: AgendarConsultaModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Especialidade e Beneficiário
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<number | null>(null);

  // Step 2: Mês e Dia
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Step 3: Horário
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen && step === 1) {
      loadInitialData();
    }
  }, [isOpen, step]);

  // Carregar disponibilidade do mês quando especialidade ou mês mudar
  useEffect(() => {
    if (step === 2 && selectedSpecialty) {
      loadMonthAvailability();
    }
  }, [step, selectedSpecialty, selectedMonth]);

  // Carregar horários do dia quando dia for selecionado
  useEffect(() => {
    if (step === 2 && selectedDay && selectedSpecialty) {
      loadDaySlots();
    }
  }, [selectedDay]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Buscar especialidades via endpoint do paciente
      const specialtiesResponse = await apiClient.get<ApiResponse<Specialty[]>>('/patient/specialties');
      const specialtiesData = specialtiesResponse.data;
      
      const beneficiariesData = await appointmentService.getMyBeneficiaries();
      
      setSpecialties(specialtiesData);
      setBeneficiaries(beneficiariesData);
      
      // Se houver apenas um beneficiário (titular), selecionar automaticamente
      if (beneficiariesData.length === 1) {
        setSelectedBeneficiary(beneficiariesData[0].id);
      }
    } catch (err) {
      setError('Erro ao carregar dados. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMonthAvailability = async () => {
    if (!selectedSpecialty) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const days = await availabilityService.getMonthAvailability(
        selectedSpecialty,
        selectedMonth.year,
        selectedMonth.month
      );
      setAvailableDays(days);
    } catch (err) {
      setError('Erro ao carregar disponibilidade. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDaySlots = async () => {
    if (!selectedSpecialty || !selectedDay) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const date = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      const slotsData = await availabilityService.getDaySlots(selectedSpecialty, date);
      setSlots(slotsData);
      setStep(3);
    } catch (err) {
      setError('Erro ao carregar horários. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedSpecialty) {
        setError('Selecione uma especialidade');
        return;
      }
      if (beneficiaries.length > 1 && !selectedBeneficiary) {
        setError('Selecione para quem é a consulta');
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setSelectedDay(null);
      setSlots([]);
      setSelectedSlot(null);
      setStep(1);
    } else if (step === 3) {
      setSelectedSlot(null);
      setStep(2);
    }
  };

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'next' 
      ? selectedMonth.month === 12 
        ? { year: selectedMonth.year + 1, month: 1 }
        : { ...selectedMonth, month: selectedMonth.month + 1 }
      : selectedMonth.month === 1
        ? { year: selectedMonth.year - 1, month: 12 }
        : { ...selectedMonth, month: selectedMonth.month - 1 };
    
    setSelectedMonth(newMonth);
    setSelectedDay(null);
    setSlots([]);
    setSelectedSlot(null);
  };

  const handleAgendarConsulta = async () => {
    if (!selectedSpecialty || !selectedDay || !selectedSlot) {
      setError('Selecione todos os campos necessários');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const date = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      
      await appointmentService.createAppointment({
        specialty_id: selectedSpecialty,
        date,
        start_time: selectedSlot.time,
        beneficiary_id: selectedBeneficiary || undefined
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar consulta. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSpecialty(null);
    setSelectedBeneficiary(null);
    setSelectedMonth({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
    setSelectedDay(null);
    setSelectedSlot(null);
    setSlots([]);
    setAvailableDays([]);
    setError(null);
    onClose();
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Agendar Nova Consulta
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Step 1: Especialidade e Beneficiário */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Especialidade *
                </label>
                <select
                  value={selectedSpecialty || ''}
                  onChange={(e) => setSelectedSpecialty(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                >
                  <option value="">Selecione uma especialidade</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              {beneficiaries.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Para quem é a consulta? *
                  </label>
                  <div className="space-y-2">
                    {beneficiaries.map((beneficiary) => (
                      <label
                        key={beneficiary.id}
                        className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="beneficiary"
                          value={beneficiary.id}
                          checked={selectedBeneficiary === beneficiary.id}
                          onChange={(e) => setSelectedBeneficiary(Number(e.target.value))}
                          className="w-4 h-4 text-primary"
                        />
                        <div>
                          <p className="font-medium text-foreground">{beneficiary.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {beneficiary.type === 'TITULAR' ? 'Titular' : 'Dependente'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Mês e Dia */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeMonth('prev')}
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeMonth('next')}
                  disabled={isLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <CalendarioMensal
                  year={selectedMonth.year}
                  month={selectedMonth.month}
                  availableDays={availableDays}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />
              )}
            </div>
          )}

          {/* Step 3: Horários */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Escolha um horário disponível
                </label>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum horário disponível para este dia
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={`${slot.time}-${slot.doctor_id}`}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedSlot?.time === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        }`}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : handlePrevStep}
            disabled={isLoading}
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          
          {step === 1 && (
            <Button onClick={handleNextStep} disabled={isLoading}>
              Próximo
            </Button>
          )}
          
          {step === 3 && (
            <Button
              onClick={handleAgendarConsulta}
              disabled={isLoading || !selectedSlot}
            >
              {isLoading ? 'Agendando...' : 'Agendar Consulta'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
