import { HistoryCard } from './HistoryCard';
import type { AppointmentHistoryItem } from '../types/appointmentsHistory.types';

interface HistoryListProps {
  appointments: AppointmentHistoryItem[];
  viewType: 'doctor' | 'patient';
  onViewDetails?: (appointment: AppointmentHistoryItem) => void;
}

export function HistoryList({ appointments, viewType, onViewDetails }: HistoryListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appointment) => (
        <HistoryCard
          key={appointment.id}
          appointment={appointment}
          viewType={viewType}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
