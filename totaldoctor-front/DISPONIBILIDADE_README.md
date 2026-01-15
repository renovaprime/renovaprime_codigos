# Tela de Configuração de Disponibilidade do Profissional

## Visão Geral

A tela de disponibilidade permite que profissionais (médicos, psicólogos, nutricionistas) configurem seus horários de atendimento semanais e gerenciem bloqueios/exceções.

## Estrutura Implementada

### Arquivos Criados

#### Tipos
- `front/src/types/availability.ts` - Tipos TypeScript para disponibilidade

#### Serviços
- `front/src/services/scheduleService.ts` - Serviço de API para schedules e blocks

#### Componentes Base
- `front/src/components/Tabs.tsx` - Sistema de abas reutilizável
- `front/src/components/TimeInput.tsx` - Input de horário estilizado
- `front/src/components/DateInput.tsx` - Input de data estilizado

#### Componentes de Disponibilidade
- `front/src/components/availability/WeeklyScheduleEditor.tsx` - Editor de agenda semanal
- `front/src/components/availability/BlocksManager.tsx` - Gerenciador de bloqueios
- `front/src/components/availability/CalendarPreview.tsx` - Prévia em calendário

#### Páginas
- `front/src/pages/profissional/Disponibilidade.tsx` - Página principal (atualizada)
- `front/src/pages/MedicosAtivos.tsx` - Badge de disponibilidade adicionado

## Funcionalidades

### Aba 1: Agenda Semanal

**Funcionalidades:**
- ✅ Ativar/desativar cada dia da semana
- ✅ Múltiplos intervalos por dia (até 5)
- ✅ Adicionar/remover intervalos dinamicamente
- ✅ Copiar horários de um dia para outro
- ✅ Limpar todos os horários
- ✅ Validação em tempo real:
  - Horário fim > início
  - Sem sobreposição de intervalos
  - Feedback visual de erros

**Layout por dia:**
```
┌─ SEGUNDA-FEIRA ─────────────────────────┐
│ [✓] Ativo          [Copiar de...]      │
│                                          │
│ Intervalo 1: [08:00] até [12:00] [🗑️]  │
│ Intervalo 2: [14:00] até [18:00] [🗑️]  │
│                                          │
│ [+ Adicionar intervalo]                 │
└──────────────────────────────────────────┘
```

### Aba 2: Bloqueios e Exceções

**Funcionalidades:**
- ✅ Listar bloqueios (ordenados por data)
- ✅ Adicionar novo bloqueio
- ✅ Editar bloqueio existente
- ✅ Excluir bloqueio (com confirmação)
- ✅ Campos:
  - Data (obrigatória)
  - Horário início/fim (opcional - dia inteiro se vazio)
  - Motivo (opcional)
- ✅ Indicação visual: bloqueios futuros vs. passados

### Aba 3: Prévia

**Funcionalidades:**
- ✅ Visualização semanal em grade
- ✅ Navegação entre semanas (anterior/próxima/hoje)
- ✅ Código de cores:
  - Verde: horário disponível
  - Vermelho: bloqueado
  - Cinza: indisponível
- ✅ Resumo de estatísticas
- ✅ Atualização automática ao mudar de aba

## Validações Implementadas

### Agenda Semanal
- ✅ Horário fim > início em cada intervalo
- ✅ Sem intervalos sobrepostos no mesmo dia
- ✅ Pelo menos 1 dia ativo com 1 intervalo válido
- ✅ Máximo de 5 intervalos por dia

### Bloqueios
- ✅ Data obrigatória
- ✅ Se tiver horário: fim > início
- ✅ Validação de duplicação

### Salvamento
- ✅ Validação completa antes de salvar
- ✅ Feedback de sucesso/erro
- ✅ Confirmação de alterações não salvas

## Endpoints de API Necessários

O frontend está preparado para consumir os seguintes endpoints:

### Schedules
```
GET    /doctor/schedules              - Buscar agenda semanal
POST   /doctor/schedules              - Salvar agenda semanal
```

### Blocks
```
GET    /doctor/schedule-blocks        - Listar bloqueios
POST   /doctor/schedule-blocks        - Criar bloqueio
PUT    /doctor/schedule-blocks/:id    - Atualizar bloqueio
DELETE /doctor/schedule-blocks/:id    - Excluir bloqueio
```

### Formato de Dados

**Schedule (API):**
```json
{
  "id": 1,
  "doctor_id": 1,
  "weekday": 1,
  "start_time": "08:00",
  "end_time": "12:00"
}
```

**Block (API):**
```json
{
  "id": 1,
  "doctor_id": 1,
  "date": "2026-01-20",
  "start_time": "08:00",
  "end_time": "12:00",
  "reason": "Férias"
}
```

## Fluxo de Uso

1. **Profissional acessa** `/profissional/disponibilidade`
2. **Sistema carrega** agenda existente e bloqueios
3. **Profissional configura**:
   - Aba 1: Define horários semanais
   - Aba 2: Adiciona bloqueios (férias, folgas, etc)
   - Aba 3: Visualiza resultado
4. **Profissional salva**:
   - Botão "Salvar": salva e permanece na página
   - Botão "Salvar e Voltar": salva e volta ao dashboard
   - Botão "Cancelar": descarta alterações (com confirmação)

## Responsividade

### Desktop (≥1024px)
- Layout em 2 colunas quando necessário
- Tabelas com largura total
- Todos os botões visíveis

### Tablet (768px - 1023px)
- Layout em coluna única
- Tabelas com scroll horizontal
- Formulários em grid 2 colunas

### Mobile (<768px)
- Layout em coluna única
- Formulários em coluna única
- Botões empilhados
- Tabelas com scroll horizontal

## Testes Recomendados

### Testes Funcionais
1. ✅ Ativar/desativar dias da semana
2. ✅ Adicionar múltiplos intervalos por dia
3. ✅ Remover intervalos
4. ✅ Copiar horários entre dias
5. ✅ Validação de horários inválidos
6. ✅ Validação de sobreposição
7. ✅ Adicionar/editar/excluir bloqueios
8. ✅ Navegação entre abas
9. ✅ Navegação no calendário de prévia
10. ✅ Salvar alterações
11. ✅ Cancelar com confirmação

### Testes de Validação
1. ✅ Tentar salvar sem dias ativos
2. ✅ Tentar salvar com horário fim < início
3. ✅ Tentar criar intervalos sobrepostos
4. ✅ Tentar adicionar mais de 5 intervalos
5. ✅ Tentar criar bloqueio sem data

### Testes de UX
1. ✅ Feedback visual de erros
2. ✅ Loading states
3. ✅ Mensagens de sucesso/erro
4. ✅ Confirmação antes de descartar alterações
5. ✅ Badge de "Alterações não salvas"

## Melhorias Futuras (Opcionais)

1. **Templates de horário**
   - Comercial (8h-18h)
   - Plantão (7h-19h)
   - Noturno (19h-23h)

2. **Cópia em massa**
   - Copiar semana para próximas N semanas
   - Aplicar bloqueio recorrente

3. **Integração com agenda**
   - Sincronização com Google Calendar
   - Exportar para iCal

4. **Relatórios**
   - Horas disponíveis por mês
   - Taxa de ocupação
   - Histórico de alterações

## Notas Técnicas

### Compatibilidade de Navegadores
- Chrome/Edge ≥90
- Firefox ≥88
- Safari ≥14

### Dependências
- React 18+
- React Router 6+
- Lucide Icons
- Framer Motion (já usado no projeto)

### Performance
- Validações otimizadas (debounce não necessário)
- Componentes memoizados quando apropriado
- Lazy loading não implementado (página leve)

### Acessibilidade
- Inputs com labels adequados
- Botões com aria-labels
- Navegação por teclado funcional
- Contraste de cores adequado

## Suporte

Para dúvidas ou problemas:
1. Verificar console do navegador
2. Verificar rede (DevTools) para erros de API
3. Confirmar que endpoints estão implementados no backend
