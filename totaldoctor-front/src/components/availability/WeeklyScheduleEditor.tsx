import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '../Button';
import { Switch } from '../Switch';
import { TimeInput } from '../TimeInput';
import { Card } from '../Card';
import { Badge } from '../Badge';
import type { DaySchedule, TimeInterval } from '../../types/availability';

interface WeeklyScheduleEditorProps {
  schedules: DaySchedule[];
  onChange: (schedules: DaySchedule[]) => void;
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export function WeeklyScheduleEditor({ schedules, onChange }: WeeklyScheduleEditorProps) {
  const handleDayToggle = (weekday: number, enabled: boolean) => {
    const newSchedules = schedules.map(schedule => {
      if (schedule.weekday === weekday) {
        return {
          ...schedule,
          enabled,
          intervals: enabled && schedule.intervals.length === 0 
            ? [{ id: crypto.randomUUID(), start_time: '', end_time: '' }]
            : schedule.intervals
        };
      }
      return schedule;
    });
    onChange(newSchedules);
  };

  const handleAddInterval = (weekday: number) => {
    const newSchedules = schedules.map(schedule => {
      if (schedule.weekday === weekday) {
        return {
          ...schedule,
          intervals: [
            ...schedule.intervals,
            { id: crypto.randomUUID(), start_time: '', end_time: '' }
          ]
        };
      }
      return schedule;
    });
    onChange(newSchedules);
  };

  const handleRemoveInterval = (weekday: number, intervalId: string) => {
    const newSchedules = schedules.map(schedule => {
      if (schedule.weekday === weekday) {
        const newIntervals = schedule.intervals.filter(interval => interval.id !== intervalId);
        return {
          ...schedule,
          intervals: newIntervals.length > 0 ? newIntervals : schedule.intervals
        };
      }
      return schedule;
    });
    onChange(newSchedules);
  };

  const handleIntervalChange = (
    weekday: number,
    intervalId: string,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    const newSchedules = schedules.map(schedule => {
      if (schedule.weekday === weekday) {
        return {
          ...schedule,
          intervals: schedule.intervals.map(interval => {
            if (interval.id === intervalId) {
              return { ...interval, [field]: value };
            }
            return interval;
          })
        };
      }
      return schedule;
    });
    onChange(newSchedules);
  };

  const handleCopyFromDay = (targetWeekday: number, sourceWeekday: number) => {
    const sourceSchedule = schedules.find(s => s.weekday === sourceWeekday);
    if (!sourceSchedule) return;

    const newSchedules = schedules.map(schedule => {
      if (schedule.weekday === targetWeekday) {
        return {
          ...schedule,
          enabled: sourceSchedule.enabled,
          intervals: sourceSchedule.intervals.map(interval => ({
            ...interval,
            id: crypto.randomUUID() // Nova ID para o intervalo copiado
          }))
        };
      }
      return schedule;
    });
    onChange(newSchedules);
  };

  const handleClearAll = () => {
    const newSchedules = schedules.map(schedule => ({
      ...schedule,
      enabled: false,
      intervals: []
    }));
    onChange(newSchedules);
  };

  const validateInterval = (interval: TimeInterval): string | null => {
    if (!interval.start_time || !interval.end_time) {
      return null; // Campos vazios não são erro ainda
    }

    if (interval.start_time >= interval.end_time) {
      return 'Horário de término deve ser maior que o de início';
    }

    return null;
  };

  const checkOverlap = (intervals: TimeInterval[]): boolean => {
    const validIntervals = intervals.filter(
      i => i.start_time && i.end_time && i.start_time < i.end_time
    );

    for (let i = 0; i < validIntervals.length; i++) {
      for (let j = i + 1; j < validIntervals.length; j++) {
        const a = validIntervals[i];
        const b = validIntervals[j];
        
        // Verifica sobreposição
        if (
          (a.start_time < b.end_time && a.end_time > b.start_time) ||
          (b.start_time < a.end_time && b.end_time > a.start_time)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Ações rápidas */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-3 p-3">
          <span className="text-sm font-medium text-muted-foreground">Ações rápidas:</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearAll}
          >
            Limpar tudo
          </Button>
        </div>
      </Card>

      {/* Lista de dias */}
      <div className="space-y-4">
        {schedules.map((schedule) => {
          const hasOverlap = checkOverlap(schedule.intervals);
          
          return (
            <Card key={schedule.weekday} padding="md">
              <div className="space-y-4">
                {/* Header do dia */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(enabled) => handleDayToggle(schedule.weekday, enabled)}
                    />
                    <h3 className="text-base font-semibold text-foreground">
                      {WEEKDAY_NAMES[schedule.weekday]}
                    </h3>
                    {hasOverlap && (
                      <Badge variant="error">❌ Conflito de horários</Badge>
                    )}
                  </div>

                  {schedule.enabled && (
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          const sourceWeekday = parseInt(e.target.value);
                          if (!isNaN(sourceWeekday)) {
                            handleCopyFromDay(schedule.weekday, sourceWeekday);
                          }
                          e.target.value = '';
                        }}
                        className="text-sm px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:border-primary/30 transition-colors"
                        defaultValue=""
                      >
                        <option value="" disabled>Copiar de...</option>
                        {schedules
                          .filter(s => s.weekday !== schedule.weekday && s.enabled)
                          .map(s => (
                            <option key={s.weekday} value={s.weekday}>
                              {WEEKDAY_NAMES[s.weekday]}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>

                {/* Intervalos */}
                {schedule.enabled && (
                  <div className="space-y-3">
                    {schedule.intervals.map((interval, index) => {
                      const error = validateInterval(interval);
                      
                      return (
                        <div
                          key={interval.id}
                          className="flex flex-wrap items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          <span className="text-sm text-muted-foreground pt-3">
                            Intervalo {index + 1}:
                          </span>
                          
                          <TimeInput
                            value={interval.start_time}
                            onChange={(e) => handleIntervalChange(
                              schedule.weekday,
                              interval.id,
                              'start_time',
                              e.target.value
                            )}
                            className="w-32"
                            error={error || undefined}
                          />
                          
                          <span className="text-sm text-muted-foreground pt-3">até</span>
                          
                          <TimeInput
                            value={interval.end_time}
                            onChange={(e) => handleIntervalChange(
                              schedule.weekday,
                              interval.id,
                              'end_time',
                              e.target.value
                            )}
                            className="w-32"
                          />

                          {schedule.intervals.length > 1 && (
                            <button
                              onClick={() => handleRemoveInterval(schedule.weekday, interval.id)}
                              className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                              title="Remover intervalo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Botão adicionar intervalo */}
                    {schedule.intervals.length < 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddInterval(schedule.weekday)}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar intervalo
                      </Button>
                    )}

                    {schedule.intervals.length >= 5 && (
                      <p className="text-xs text-muted-foreground">
                        Máximo de 5 intervalos por dia atingido
                      </p>
                    )}
                  </div>
                )}

                {!schedule.enabled && (
                  <p className="text-sm text-muted-foreground">
                    Dia desativado - não haverá atendimento
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
