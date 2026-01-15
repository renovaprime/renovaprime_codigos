# Exemplos de Uso - Disponibilidade

## Exemplo 1: Configuração Básica - Médico Clínico Geral

```typescript
// Agenda semanal: Segunda a Sexta, 8h-12h e 14h-18h
const schedules: DaySchedule[] = [
  { weekday: 0, enabled: false, intervals: [] }, // Domingo - não atende
  { 
    weekday: 1, // Segunda
    enabled: true,
    intervals: [
      { id: 'uuid-1', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-2', start_time: '14:00', end_time: '18:00' }
    ]
  },
  { 
    weekday: 2, // Terça
    enabled: true,
    intervals: [
      { id: 'uuid-3', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-4', start_time: '14:00', end_time: '18:00' }
    ]
  },
  { 
    weekday: 3, // Quarta
    enabled: true,
    intervals: [
      { id: 'uuid-5', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-6', start_time: '14:00', end_time: '18:00' }
    ]
  },
  { 
    weekday: 4, // Quinta
    enabled: true,
    intervals: [
      { id: 'uuid-7', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-8', start_time: '14:00', end_time: '18:00' }
    ]
  },
  { 
    weekday: 5, // Sexta
    enabled: true,
    intervals: [
      { id: 'uuid-9', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-10', start_time: '14:00', end_time: '18:00' }
    ]
  },
  { weekday: 6, enabled: false, intervals: [] } // Sábado - não atende
];

// Total: 50 horas semanais
```

## Exemplo 2: Psicólogo com Horários Flexíveis

```typescript
// Atende em horários diferentes por dia
const schedules: DaySchedule[] = [
  { weekday: 0, enabled: false, intervals: [] },
  { 
    weekday: 1, // Segunda: manhã e tarde
    enabled: true,
    intervals: [
      { id: 'uuid-1', start_time: '09:00', end_time: '12:00' },
      { id: 'uuid-2', start_time: '14:00', end_time: '19:00' }
    ]
  },
  { 
    weekday: 2, // Terça: apenas tarde
    enabled: true,
    intervals: [
      { id: 'uuid-3', start_time: '14:00', end_time: '20:00' }
    ]
  },
  { 
    weekday: 3, // Quarta: manhã e noite
    enabled: true,
    intervals: [
      { id: 'uuid-4', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-5', start_time: '18:00', end_time: '21:00' }
    ]
  },
  { 
    weekday: 4, // Quinta: dia inteiro
    enabled: true,
    intervals: [
      { id: 'uuid-6', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-7', start_time: '13:00', end_time: '17:00' }
    ]
  },
  { 
    weekday: 5, // Sexta: apenas manhã
    enabled: true,
    intervals: [
      { id: 'uuid-8', start_time: '09:00', end_time: '13:00' }
    ]
  },
  { 
    weekday: 6, // Sábado: algumas horas
    enabled: true,
    intervals: [
      { id: 'uuid-9', start_time: '09:00', end_time: '12:00' }
    ]
  }
];
```

## Exemplo 3: Nutricionista com Múltiplos Intervalos

```typescript
// Atende com múltiplos horários espaçados
const schedules: DaySchedule[] = [
  { weekday: 0, enabled: false, intervals: [] },
  { 
    weekday: 1, // Segunda: 3 períodos
    enabled: true,
    intervals: [
      { id: 'uuid-1', start_time: '07:00', end_time: '09:00' }, // Manhã cedo
      { id: 'uuid-2', start_time: '10:00', end_time: '12:00' }, // Meio da manhã
      { id: 'uuid-3', start_time: '14:00', end_time: '16:00' }  // Tarde
    ]
  },
  // ... outros dias
];
```

## Exemplo 4: Bloqueios Comuns

### Férias (dia inteiro)
```typescript
const ferias: ScheduleBlock = {
  date: '2026-02-01',
  // start_time e end_time vazios = dia inteiro bloqueado
  reason: 'Férias'
};
```

### Congresso (período específico)
```typescript
const congresso: ScheduleBlock = {
  date: '2026-03-15',
  start_time: '14:00',
  end_time: '18:00',
  reason: 'Congresso de Medicina'
};
```

### Folga Médica
```typescript
const folga: ScheduleBlock = {
  date: '2026-04-10',
  reason: 'Folga médica'
};
```

### Compromisso Pessoal
```typescript
const compromisso: ScheduleBlock = {
  date: '2026-05-20',
  start_time: '10:00',
  end_time: '12:00',
  reason: 'Compromisso pessoal'
};
```

## Exemplo 5: Validações

### ✅ Válido: Intervalos sem sobreposição
```typescript
intervals: [
  { id: '1', start_time: '08:00', end_time: '12:00' },
  { id: '2', start_time: '14:00', end_time: '18:00' }
]
// OK: Há um gap de 2h entre os intervalos
```

### ❌ Inválido: Intervalos sobrepostos
```typescript
intervals: [
  { id: '1', start_time: '08:00', end_time: '13:00' },
  { id: '2', start_time: '12:00', end_time: '18:00' }
]
// ERRO: 12:00-13:00 está em ambos os intervalos
```

### ❌ Inválido: Horário fim menor que início
```typescript
intervals: [
  { id: '1', start_time: '18:00', end_time: '12:00' }
]
// ERRO: Fim (12:00) é menor que início (18:00)
```

### ✅ Válido: Intervalos adjacentes
```typescript
intervals: [
  { id: '1', start_time: '08:00', end_time: '12:00' },
  { id: '2', start_time: '12:00', end_time: '18:00' }
]
// OK: 12:00 é o fim do primeiro e início do segundo (não há sobreposição)
```

## Exemplo 6: Uso no Código

### Copiar horários de um dia para outro
```typescript
const handleCopyDay = (fromWeekday: number, toWeekday: number) => {
  const sourceSchedule = schedules.find(s => s.weekday === fromWeekday);
  if (!sourceSchedule) return;

  const newSchedules = schedules.map(schedule => {
    if (schedule.weekday === toWeekday) {
      return {
        ...schedule,
        enabled: sourceSchedule.enabled,
        intervals: sourceSchedule.intervals.map(interval => ({
          ...interval,
          id: crypto.randomUUID() // Nova ID para evitar conflitos
        }))
      };
    }
    return schedule;
  });

  setSchedules(newSchedules);
};
```

### Adicionar intervalo a um dia
```typescript
const handleAddInterval = (weekday: number) => {
  const newSchedules = schedules.map(schedule => {
    if (schedule.weekday === weekday) {
      return {
        ...schedule,
        intervals: [
          ...schedule.intervals,
          { 
            id: crypto.randomUUID(), 
            start_time: '', 
            end_time: '' 
          }
        ]
      };
    }
    return schedule;
  });

  setSchedules(newSchedules);
};
```

### Validar sobreposição
```typescript
const checkOverlap = (intervals: TimeInterval[]): boolean => {
  const validIntervals = intervals.filter(
    i => i.start_time && i.end_time && i.start_time < i.end_time
  );

  for (let i = 0; i < validIntervals.length; i++) {
    for (let j = i + 1; j < validIntervals.length; j++) {
      const a = validIntervals[i];
      const b = validIntervals[j];
      
      // Verifica se há sobreposição
      if (
        (a.start_time < b.end_time && a.end_time > b.start_time) ||
        (b.start_time < a.end_time && b.end_time > a.start_time)
      ) {
        return true; // Há sobreposição
      }
    }
  }
  
  return false; // Sem sobreposição
};
```

## Exemplo 7: Integração com Backend

### Salvar schedules
```typescript
// Frontend envia
const frontendData: DaySchedule[] = [
  {
    weekday: 1,
    enabled: true,
    intervals: [
      { id: 'uuid-1', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-2', start_time: '14:00', end_time: '18:00' }
    ]
  }
];

// scheduleService converte para formato da API
// Backend recebe
const apiData = [
  { weekday: 1, start_time: '08:00', end_time: '12:00' },
  { weekday: 1, start_time: '14:00', end_time: '18:00' }
];
```

### Carregar schedules
```typescript
// Backend retorna
const apiResponse = [
  { id: 1, doctor_id: 5, weekday: 1, start_time: '08:00', end_time: '12:00' },
  { id: 2, doctor_id: 5, weekday: 1, start_time: '14:00', end_time: '18:00' },
  { id: 3, doctor_id: 5, weekday: 2, start_time: '08:00', end_time: '12:00' }
];

// scheduleService agrupa por weekday
const frontendData: DaySchedule[] = [
  {
    weekday: 1,
    enabled: true,
    intervals: [
      { id: 'uuid-1', start_time: '08:00', end_time: '12:00' },
      { id: 'uuid-2', start_time: '14:00', end_time: '18:00' }
    ]
  },
  {
    weekday: 2,
    enabled: true,
    intervals: [
      { id: 'uuid-3', start_time: '08:00', end_time: '12:00' }
    ]
  }
  // ... outros dias desabilitados
];
```

## Exemplo 8: Calcular Estatísticas

### Total de horas semanais
```typescript
const calculateWeeklyHours = (schedules: DaySchedule[]): number => {
  return schedules.reduce((total, day) => {
    if (!day.enabled) return total;
    
    const dayHours = day.intervals.reduce((dayTotal, interval) => {
      if (!interval.start_time || !interval.end_time) return dayTotal;
      
      const [startHour, startMin] = interval.start_time.split(':').map(Number);
      const [endHour, endMin] = interval.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      return dayTotal + (endMinutes - startMinutes) / 60;
    }, 0);
    
    return total + dayHours;
  }, 0);
};

// Uso
const totalHours = calculateWeeklyHours(schedules);
console.log(`Total: ${totalHours.toFixed(1)} horas/semana`);
```

### Dias com atendimento
```typescript
const activeDays = schedules.filter(s => s.enabled).length;
console.log(`Atende em ${activeDays} dias da semana`);
```

### Total de intervalos
```typescript
const totalIntervals = schedules.reduce(
  (sum, s) => sum + (s.enabled ? s.intervals.length : 0), 
  0
);
console.log(`Total: ${totalIntervals} intervalos configurados`);
```
