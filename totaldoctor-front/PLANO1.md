# PLANO (ClaudeCode) — Itens 1 e 2 (Status + Lista do Médico)

## Objetivo final

* Médico acessa o portal e vê **suas consultas** (dia/semana).
* Médico consegue **iniciar** e **finalizar** uma consulta.
* Status muda corretamente:
  `SCHEDULED → IN_PROGRESS → FINISHED`
  `SCHEDULED → CANCELED` (já existe para paciente)

---

# 0) Checklist de pré-requisitos (antes de codar)

* Confirmar que existe `permissionMiddleware('medico')`
* Confirmar que `doctors.user_id -> users.id` está funcionando
* Confirmar que `appointments.status` já está no banco:
  `enum('SCHEDULED','IN_PROGRESS','FINISHED','CANCELED')`

Se algum item não existir, criar.

---

# 1) BACKEND — Ajustar status da consulta (Item 1)

## 1.1 Criar endpoints do médico (routes)

Criar arquivo ou adicionar no `routes/doctorRoutes.js`:

### Endpoints necessários

1. **Listar consultas do médico**

* `GET /doctor/appointments?date=YYYY-MM-DD`
* ou `GET /doctor/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD`

2. **Iniciar consulta**

* `POST /doctor/appointments/:id/start`

3. **Finalizar consulta**

* `POST /doctor/appointments/:id/finish`

> Importante: o médico só pode mexer em consultas onde `appointments.doctor_id` é dele.

---

## 1.2 Criar controller: `doctorController.js`

Funções:

### `getMyAppointments(req,res)`

* Pegar `userId` do token
* Buscar `doctor.id` pelo `doctors.user_id = userId`
* Filtrar por data (padrão: hoje)
* Retornar lista ordenada por `date, start_time`

**SQL mental:**

* `appointments` join `specialties`
* `appointments` join `patients` (e opcional join `users` do paciente)
* Retornar também `teleconsult_rooms` (se já existir) opcional

---

### `startAppointment(req,res)`

Regras:

* Só pode iniciar se `status === 'SCHEDULED'`
* Atualizar status para `IN_PROGRESS`
* Inserir log em `appointment_logs` com action `STARTED`
* Opcional: setar `teleconsult_rooms.started_at = now()` se existir sala

---

### `finishAppointment(req,res)`

Regras:

* Só pode finalizar se `status === 'IN_PROGRESS'`
* Atualizar status para `FINISHED`
* Inserir log em `appointment_logs` com action `FINISHED`
* Opcional: setar `teleconsult_rooms.ended_at = now()`

---

## 1.3 Validar transições (regra central)

Criar helper tipo:

```js
const canTransition = (from, to) => {
  const allowed = {
    SCHEDULED: ['IN_PROGRESS', 'CANCELED'],
    IN_PROGRESS: ['FINISHED'],
    FINISHED: [],
    CANCELED: []
  };
  return allowed[from]?.includes(to);
};
```

Usar isso no start/finish.

---

## 1.4 Ajustar cancelamento do paciente (se necessário)

Hoje paciente cancela com:
`POST /patient/appointments/:id/cancel`

Garantir regra:

* Só cancela se status == `SCHEDULED`
* Se estiver `IN_PROGRESS`, bloquear (ou permitir somente admin)

---

## 1.5 Garantir logs consistentes

Em todos os pontos:

* created → `CREATED`
* start → `STARTED`
* finish → `FINISHED`
* cancel → `CANCELED`

Se hoje não existe log no create, adicionar no `createAppointment`.

---

# 2) FRONTEND — Lista de consultas do médico (Item 2)

## 2.1 Criar página

Criar rota/página:
`src/pages/Medico/MedicoConsultas.tsx`

Layout:

* `LayoutMedico`
* título: **Minhas Consultas**
* filtro rápido:

  * Hoje / Amanhã / Semana
  * ou seletor de data

---

## 2.2 Criar service

`src/services/doctorAppointmentService.ts`

Funções:

* `listMyAppointments(date?: string)`
* `startAppointment(id)`
* `finishAppointment(id)`

Exemplo de endpoints:

* `GET /doctor/appointments?date=2026-01-16`
* `POST /doctor/appointments/:id/start`
* `POST /doctor/appointments/:id/finish`

---

## 2.3 Criar card do médico

Componente:
`src/components/DoctorConsultaCard.tsx`

Campos no card:

* Especialidade
* Data e hora
* Paciente (nome)
* Status (badge)
* Ações:

### Se `SCHEDULED`

* botão: **Iniciar consulta**

  * chama `startAppointment`
  * depois recarrega lista

### Se `IN_PROGRESS`

* botão: **Finalizar**

  * chama `finishAppointment`
  * depois recarrega lista

### Se `FINISHED/CANCELED`

* sem ações (apenas visualizar)

---

## 2.4 UX mínimo (já incluso)

* Loading
* Empty state (“Nenhuma consulta para esta data”)
* Error toast/alert

---

# 3) Contrato de dados (retorno da API)

Padronizar retorno para frontend do médico:

```ts
type DoctorAppointment = {
  id: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELED';

  specialty: { id: number; name: string };

  patient: {
    id: number;
    name: string; // se tiver via join em users
  };

  teleconsult?: {
    room_name: string;
    doctor_link?: string;
    patient_link?: string;
    started_at?: string | null;
    ended_at?: string | null;
  };
}
```

Se hoje seu backend não retorna `patient.name`, retornar pelo menos:

* `patient_id`
* e no futuro melhora.

---

# 4) Testes rápidos (manual)

## Médico

1. Abrir lista do médico (hoje)
2. Ver consulta `SCHEDULED`
3. Clicar **Iniciar** → status vira `IN_PROGRESS`
4. Clicar **Finalizar** → status vira `FINISHED`

## Paciente

1. Agendar consulta
2. Cancelar consulta → status vira `CANCELED`
3. Tentar cancelar consulta já `IN_PROGRESS` → deve bloquear


