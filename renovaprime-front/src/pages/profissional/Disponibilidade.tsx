import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Clock } from 'lucide-react';
import { LayoutProfissional } from '../../layout/LayoutProfissional';
import { PageHeader } from '../../components';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/Tabs';
import { InfoModal } from '../../components/InfoModal';
import { WeeklyScheduleEditor } from '../../components/availability/WeeklyScheduleEditor';
import { BlocksManager } from '../../components/availability/BlocksManager';
import { CalendarPreview } from '../../components/availability/CalendarPreview';
import { scheduleService } from '../../services/scheduleService';
import type { DaySchedule, ScheduleBlock } from '../../types/availability';

export function ProfissionalDisponibilidade() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [backendNotReady, setBackendNotReady] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [weeklySchedules, setWeeklySchedules] = useState<DaySchedule[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setBackendNotReady(false);

      const [schedulesData, blocksData] = await Promise.all([
        scheduleService.getSchedules(),
        scheduleService.getBlocks()
      ]);

      setWeeklySchedules(schedulesData);
      setBlocks(blocksData);
      
      // Se ambos retornaram vazios, provavelmente o backend não está implementado
      if (schedulesData.every(s => !s.enabled) && blocksData.length === 0) {
        setBackendNotReady(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleChange = (schedules: DaySchedule[]) => {
    setWeeklySchedules(schedules);
    setHasUnsavedChanges(true);
  };

  const handleAddBlock = async (block: ScheduleBlock) => {
    const newBlock = await scheduleService.createBlock(block);
    setBlocks([...blocks, newBlock]);
    setHasUnsavedChanges(true);
  };

  const handleEditBlock = async (id: number, block: ScheduleBlock) => {
    await scheduleService.updateBlock(id, block);
    setBlocks(blocks.map(b => b.id === id ? { ...block, id } : b));
    setHasUnsavedChanges(true);
  };

  const handleDeleteBlock = async (id: number) => {
    await scheduleService.deleteBlock(id);
    setBlocks(blocks.filter(b => b.id !== id));
    setHasUnsavedChanges(true);
  };

  const validateSchedules = (): string | null => {
    // Verificar se há pelo menos 1 dia ativo
    const activeDays = weeklySchedules.filter(s => s.enabled);
    if (activeDays.length === 0) {
      return 'É necessário ativar pelo menos um dia da semana';
    }

    // Verificar se dias ativos têm pelo menos 1 intervalo válido
    for (const day of activeDays) {
      const validIntervals = day.intervals.filter(
        i => i.start_time && i.end_time && i.start_time < i.end_time
      );
      
      if (validIntervals.length === 0) {
        return `É necessário ter pelo menos um intervalo válido em ${getWeekdayName(day.weekday)}`;
      }
    }

    return null;
  };

  const handleSave = async (shouldNavigateBack: boolean = false) => {
    const validationError = validateSchedules();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await scheduleService.saveSchedules(weeklySchedules);
      
      setHasUnsavedChanges(false);
      setSuccessMessage('Disponibilidade salva com sucesso!');
      setShowSuccessModal(true);

      if (shouldNavigateBack) {
        setTimeout(() => {
          navigate('/profissional/dashboard');
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar disponibilidade');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja realmente sair?'
      );
      if (!confirmed) return;
    }
    navigate('/profissional/dashboard');
  };

  const getWeekdayName = (weekday: number): string => {
    const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return names[weekday];
  };

  // Calcular estatísticas
  const stats = {
    activeDays: weeklySchedules.filter(s => s.enabled).length,
    totalIntervals: weeklySchedules.reduce((sum, s) => sum + (s.enabled ? s.intervals.length : 0), 0),
    totalHours: weeklySchedules.reduce((sum, day) => {
      if (!day.enabled) return sum;
      
      return sum + day.intervals.reduce((daySum, interval) => {
        if (!interval.start_time || !interval.end_time) return daySum;
        
        const [startHour, startMin] = interval.start_time.split(':').map(Number);
        const [endHour, endMin] = interval.end_time.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        return daySum + (endMinutes - startMinutes) / 60;
      }, 0);
    }, 0),
    futureBlocks: blocks.filter(b => new Date(b.date) >= new Date()).length
  };

  if (isLoading) {
    return (
      <LayoutProfissional title="Disponibilidade">
        <div className="max-w-7xl mx-auto">
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        </div>
      </LayoutProfissional>
    );
  }

  return (
    <LayoutProfissional title="Disponibilidade">
      <div className="w-full mx-auto space-y-6">
        <PageHeader
          title="Configuração de Disponibilidade"
          subtitle="Configure seus horários de atendimento e bloqueios."
          actions={
            <>
              {hasUnsavedChanges && (
                <Badge variant="warning">Alterações não salvas</Badge>
              )}
              <Button
                onClick={() => handleSave(false)}
                isLoading={isSaving}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                Salvar
              </Button>
            </>
          }
        />

        {/* Mensagens de feedback */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Dias ativos</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">
              {stats.activeDays}
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Total de intervalos</div>
            <div className="mt-1 text-2xl font-semibold text-cyan-700 dark:text-cyan-400">
              {stats.totalIntervals}
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Horas semanais</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
              {stats.totalHours.toFixed(1)}h
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
            <div className="text-sm text-muted-foreground">Bloqueios futuros</div>
            <div className="mt-1 text-2xl font-semibold text-amber-700 dark:text-amber-400">
              {stats.futureBlocks}
            </div>
          </Card>
        </div>

        {/* Abas principais */}
        <Tabs defaultValue="agenda">
          <TabsList>
            <TabsTrigger value="agenda">Agenda Semanal</TabsTrigger>
            <TabsTrigger value="bloqueios">Bloqueios</TabsTrigger>
            <TabsTrigger value="previa">Prévia</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda">
            <WeeklyScheduleEditor
              schedules={weeklySchedules}
              onChange={handleScheduleChange}
            />
          </TabsContent>

          <TabsContent value="bloqueios">
            <BlocksManager
              blocks={blocks}
              onAdd={handleAddBlock}
              onEdit={handleEditBlock}
              onDelete={handleDeleteBlock}
            />
          </TabsContent>

          <TabsContent value="previa">
            <CalendarPreview
              schedules={weeklySchedules}
              blocks={blocks}
            />
          </TabsContent>
        </Tabs>
      </div>

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Disponibilidade Atualizada"
        description="As datas e horários configuradas serão válidas para novos agendamentos, mas não afetam agendamentos já existentes. Se já havia uma consulta agendada em um horário que agora está indisponível, ainda será necessário atender à consulta."
        actionText="Entendi"
        variant="success"
      />
    </LayoutProfissional>
  );
}
