import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarioMensalProps {
  year: number;
  month: number;
  availableDays: number[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

export function CalendarioMensal({
  year,
  month,
  availableDays,
  selectedDay,
  onSelectDay
}: CalendarioMensalProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Criar array com dias vazios no início + dias do mês
  const calendarDays: (number | null)[] = [];
  
  // Adicionar dias vazios antes do primeiro dia
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Adicionar dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isAvailable = (day: number | null) => {
    if (day === null) return false;
    return availableDays.includes(day);
  };

  const isSelected = (day: number | null) => {
    if (day === null) return false;
    return day === selectedDay;
  };

  const handleDayClick = (day: number | null) => {
    if (day && isAvailable(day)) {
      onSelectDay(day);
    }
  };

  const getDayClassName = (day: number | null) => {
    if (day === null) {
      return 'invisible';
    }

    const baseClasses = 'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors';
    
    if (isSelected(day)) {
      return `${baseClasses} bg-primary text-primary-foreground`;
    }
    
    if (isAvailable(day)) {
      return `${baseClasses} bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer`;
    }
    
    return `${baseClasses} text-muted-foreground cursor-not-allowed opacity-50`;
  };

  return (
    <div className="w-full">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {monthNames[month - 1]} {year}
        </h3>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="w-10 h-10 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day)}
            disabled={!isAvailable(day)}
            className={getDayClassName(day)}
            type="button"
          >
            {day}
          </button>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-50 border border-green-200" />
          <span className="text-muted-foreground">Disponível</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-muted-foreground">Selecionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted opacity-50" />
          <span className="text-muted-foreground">Indisponível</span>
        </div>
      </div>
    </div>
  );
}
