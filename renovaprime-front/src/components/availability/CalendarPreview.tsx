import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import type { DaySchedule, ScheduleBlock } from '../../types/availability';

interface CalendarPreviewProps {
  schedules: DaySchedule[];
  blocks: ScheduleBlock[];
}

const WEEKDAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarPreview({ schedules, blocks }: CalendarPreviewProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Calcular data inicial da semana (segunda-feira)
  const getWeekStart = (offset: number): Date => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + daysToMonday + (offset * 7));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Gerar array de datas da semana
  const weekDates = useMemo(() => {
    const start = getWeekStart(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [weekOffset]);

  const getBlocksForDate = (date: Date): ScheduleBlock[] => {
    const dateStr = date.toISOString().split('T')[0];
    return blocks.filter(block => block.date === dateStr);
  };

  const hasAnyBlock = (date: Date): 'full' | 'partial' | null => {
    const dateBlocks = getBlocksForDate(date);
    if (dateBlocks.length === 0) return null;
    if (dateBlocks.some(b => !b.start_time && !b.end_time)) return 'full';
    return 'partial';
  };

  const isSlotBlocked = (date: Date, time: string): ScheduleBlock | null => {
    const dateBlocks = getBlocksForDate(date);
    const slotEnd = `${String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')}:00`;

    for (const block of dateBlocks) {
      if (!block.start_time && !block.end_time) return block;
      if (block.start_time && block.end_time && time < block.end_time && slotEnd > block.start_time) {
        return block;
      }
    }
    return null;
  };

  // Formatar data
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Verificar se é hoje
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Gerar horários do dia (6h às 22h, intervalo de 1h)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Verificar se um horário está disponível
  const isTimeAvailable = (date: Date, time: string): boolean => {
    const weekday = date.getDay();
    const daySchedule = schedules.find(s => s.weekday === weekday);

    if (!daySchedule || !daySchedule.enabled) {
      return false;
    }

    // Verificar se o horário está dentro de algum intervalo
    return daySchedule.intervals.some(interval => {
      if (!interval.start_time || !interval.end_time) return false;
      return time >= interval.start_time && time < interval.end_time;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Prévia da Disponibilidade</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formatMonthYear(weekDates[0])}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWeekOffset(weekOffset - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWeekOffset(0)}
          >
            Hoje
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWeekOffset(weekOffset + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legenda */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-4 p-3">
          <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300" />
            <span className="text-sm text-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
            <span className="text-sm text-foreground">Bloqueado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted border border-border" />
            <span className="text-sm text-foreground">Indisponível</span>
          </div>
        </div>
      </Card>

      {/* Calendário Semanal */}
      <Card padding="none">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[800px]">
            {/* Header dos dias */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/30">
                Horário
              </div>
              {weekDates.map((date, index) => {
                const blockStatus = hasAnyBlock(date);
                const today = isToday(date);
                
                return (
                  <div
                    key={index}
                    className={`p-3 text-center border-l border-border ${
                      today ? 'bg-primary/5' : 'bg-muted/30'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">
                      {WEEKDAY_NAMES_SHORT[date.getDay()]}
                    </div>
                    <div className={`text-sm font-medium ${
                      today ? 'text-primary' : 'text-foreground'
                    }`}>
                      {formatDate(date)}
                    </div>
                    {blockStatus === 'full' && (
                      <Badge variant="error" className="mt-1 text-xs">
                        Bloqueado
                      </Badge>
                    )}
                    {blockStatus === 'partial' && (
                      <Badge variant="warning" className="mt-1 text-xs">
                        Bloqueio parcial
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grade de horários */}
            <div className="divide-y divide-border">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8">
                  <div className="p-3 text-sm text-muted-foreground bg-muted/30">
                    {time}
                  </div>
                  {weekDates.map((date, index) => {
                    const blocked = isSlotBlocked(date, time);
                    const available = !blocked && isTimeAvailable(date, time);
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 border-l border-border ${
                          blocked
                            ? 'bg-red-50'
                            : available
                            ? 'bg-emerald-50'
                            : 'bg-muted/20'
                        }`}
                        title={
                          blocked
                            ? `Bloqueado: ${blocked.reason || 'Sem motivo'}`
                            : available
                            ? 'Horário disponível'
                            : 'Horário indisponível'
                        }
                      >
                        <div className="h-full flex items-center justify-center">
                          {blocked && (
                            <span className="text-red-600 text-xs">🚫</span>
                          )}
                          {!blocked && available && (
                            <span className="text-emerald-600 text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Resumo da semana */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Dias com atendimento</div>
            <div className="text-2xl font-semibold text-foreground mt-1">
              {schedules.filter(s => s.enabled).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total de intervalos</div>
            <div className="text-2xl font-semibold text-foreground mt-1">
              {schedules.reduce((sum, s) => sum + (s.enabled ? s.intervals.length : 0), 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Bloqueios futuros</div>
            <div className="text-2xl font-semibold text-foreground mt-1">
              {blocks.filter(b => new Date(b.date) >= new Date()).length}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
