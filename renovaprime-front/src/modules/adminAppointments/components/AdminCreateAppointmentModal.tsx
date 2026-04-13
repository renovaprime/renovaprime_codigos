import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { CalendarioMensal } from '../../../components/CalendarioMensal';
import type { Beneficiary, Specialty } from '../../../types/api';
import type { AdminAppointmentSlot } from '../types/adminAppointments.types';
import { adminAppointmentsService } from '../services/adminAppointmentsService';

interface AdminCreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminCreateAppointmentModal({ isOpen, onClose, onSuccess }: AdminCreateAppointmentModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<number | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [slots, setSlots] = useState<AdminAppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AdminAppointmentSlot | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [specialtiesData, beneficiariesData] = await Promise.all([
        adminAppointmentsService.listAppointmentSpecialties(),
        adminAppointmentsService.listActiveBeneficiaries(),
      ]);
      setSpecialties(specialtiesData);
      setBeneficiaries(beneficiariesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados para agendamento');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMonthAvailability = useCallback(async () => {
    if (!selectedSpecialty) return;
    setIsLoading(true);
    setError(null);
    try {
      const days = await adminAppointmentsService.getMonthAvailability(
        selectedSpecialty,
        selectedMonth.year,
        selectedMonth.month
      );
      setAvailableDays(days);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar disponibilidade');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSpecialty, selectedMonth.month, selectedMonth.year]);

  const loadDaySlots = useCallback(async () => {
    if (!selectedSpecialty || !selectedDay) return;
    setIsLoading(true);
    setError(null);
    try {
      const date = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      const slotsData = await adminAppointmentsService.getDaySlots(selectedSpecialty, date);
      setSlots(slotsData);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar horarios');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDay, selectedMonth.month, selectedMonth.year, selectedSpecialty]);

  useEffect(() => {
    if (isOpen && step === 1) {
      void loadInitialData();
    }
  }, [isOpen, step, loadInitialData]);

  useEffect(() => {
    if (isOpen && step === 2 && selectedSpecialty) {
      void loadMonthAvailability();
    }
  }, [isOpen, step, selectedSpecialty, selectedMonth, loadMonthAvailability]);

  useEffect(() => {
    if (isOpen && step === 2 && selectedSpecialty && selectedDay) {
      void loadDaySlots();
    }
  }, [isOpen, step, selectedSpecialty, selectedDay, loadDaySlots]);

  const handleNextStep = () => {
    if (!selectedBeneficiary || !selectedSpecialty) {
      setError('Selecione beneficiario e especialidade');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
      setSelectedDay(null);
      setSelectedSlot(null);
      setSlots([]);
      return;
    }
    if (step === 3) {
      setStep(2);
      setSelectedSlot(null);
      setSelectedDay(null);
    }
  };

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    const month = selectedMonth.month;
    const year = selectedMonth.year;
    const nextMonth =
      direction === 'next'
        ? month === 12
          ? { year: year + 1, month: 1 }
          : { year, month: month + 1 }
        : month === 1
          ? { year: year - 1, month: 12 }
          : { year, month: month - 1 };
    setSelectedMonth(nextMonth);
    setSelectedDay(null);
    setSlots([]);
    setSelectedSlot(null);
  };

  const handleCreateAppointment = async () => {
    if (!selectedBeneficiary || !selectedSpecialty || !selectedSlot || !selectedDay) {
      setError('Selecione todos os campos obrigatorios');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const date = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      await adminAppointmentsService.create({
        beneficiary_id: selectedBeneficiary,
        specialty_id: selectedSpecialty,
        date,
        start_time: selectedSlot.time,
      });
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setError(null);
    setSelectedSpecialty(null);
    setSelectedBeneficiary(null);
    setSelectedDay(null);
    setSlots([]);
    setSelectedSlot(null);
    setAvailableDays([]);
    const now = new Date();
    setSelectedMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-display font-semibold text-foreground">Nova consulta</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Beneficiario *</label>
                <select
                  value={selectedBeneficiary || ''}
                  onChange={(e) => setSelectedBeneficiary(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                >
                  <option value="">Selecione um beneficiario</option>
                  {beneficiaries.map((beneficiary) => (
                    <option key={beneficiary.id} value={beneficiary.id}>
                      {beneficiary.name} ({beneficiary.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Especialidade *</label>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <Button variant="secondary" size="sm" onClick={() => handleChangeMonth('prev')} disabled={isLoading}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleChangeMonth('next')} disabled={isLoading}>
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

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Escolha um horário</label>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum horário disponível para este dia</p>
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
                      {slot.time.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t">
          <Button variant="secondary" onClick={step === 1 ? handleClose : handlePrevStep} disabled={isLoading}>
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          {step === 1 && (
            <Button onClick={handleNextStep} disabled={isLoading}>
              Proximo
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleCreateAppointment} disabled={isLoading || !selectedSlot}>
              {isLoading ? 'Agendando...' : 'Criar consulta'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
