export interface TimeInterval {
  id: string; // UUID para controle na UI (permite adicionar/remover dinamicamente)
  start_time: string; // "HH:MM" formato 24h
  end_time: string;   // "HH:MM" formato 24h
}

export interface DaySchedule {
  weekday: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  enabled: boolean;
  intervals: TimeInterval[]; // Array para suportar múltiplos intervalos
}

export interface ScheduleBlock {
  id?: number;
  date: string; // "YYYY-MM-DD"
  start_time?: string; // opcional para bloquear dia inteiro
  end_time?: string;   // opcional para bloquear dia inteiro
  reason?: string;     // ex: "Férias", "Congresso", "Folga"
}

export interface WeeklyScheduleData {
  schedules: DaySchedule[]; // 7 dias (0-6)
}

export interface ScheduleBlockFormData {
  date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

// Helper para conversão de dados da API
export interface ApiSchedule {
  id?: number;
  doctor_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface ApiScheduleBlock {
  id?: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}
