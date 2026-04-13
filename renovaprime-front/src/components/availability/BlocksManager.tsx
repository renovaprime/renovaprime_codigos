import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { DateInput } from '../DateInput';
import { TimeInput } from '../TimeInput';
import { Input } from '../Input';
import { ConfirmModal } from '../ConfirmModal';
import { EmptyState } from '../EmptyState';
import type { ScheduleBlock } from '../../types/availability';

interface BlocksManagerProps {
  blocks: ScheduleBlock[];
  onAdd: (block: ScheduleBlock) => Promise<void>;
  onEdit: (id: number, block: ScheduleBlock) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

interface BlockFormData {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export function BlocksManager({ blocks, onAdd, onEdit, onDelete }: BlocksManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; block: ScheduleBlock | null }>({
    isOpen: false,
    block: null
  });

  const [formData, setFormData] = useState<BlockFormData>({
    date: '',
    start_time: '',
    end_time: '',
    reason: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<BlockFormData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<BlockFormData> = {};

    if (!formData.date) {
      errors.date = 'Data é obrigatória';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errors.end_time = 'Horário de término deve ser maior que o de início';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const blockData: ScheduleBlock = {
        date: formData.date,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        reason: formData.reason || undefined
      };

      if (editingBlock?.id) {
        await onEdit(editingBlock.id, blockData);
      } else {
        await onAdd(blockData);
      }

      handleCloseForm();
    } catch (error) {
      console.error('Erro ao salvar bloqueio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setFormData({
      date: block.date,
      start_time: block.start_time || '',
      end_time: block.end_time || '',
      reason: block.reason || ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (block: ScheduleBlock) => {
    setDeleteModal({ isOpen: true, block });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.block?.id) return;

    setIsSubmitting(true);
    try {
      await onDelete(deleteModal.block.id);
      setDeleteModal({ isOpen: false, block: null });
    } catch (error) {
      console.error('Erro ao excluir bloqueio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBlock(null);
    setFormData({
      date: '',
      start_time: '',
      end_time: '',
      reason: ''
    });
    setFormErrors({});
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr?: string): string => {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
  };

  const isBlockPast = (dateStr: string): boolean => {
    const blockDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return blockDate < today;
  };

  const sortedBlocks = [...blocks].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Header com botão adicionar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Bloqueios e Exceções</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure férias, folgas e períodos indisponíveis
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4" />
          Adicionar Bloqueio
        </Button>
      </div>

      {/* Formulário */}
      {isFormOpen && (
        <Card padding="md">
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">
              {editingBlock ? 'Editar Bloqueio' : 'Novo Bloqueio'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateInput
                label="Data *"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={formErrors.date}
              />

              <Input
                label="Motivo"
                placeholder="Ex: Férias, Congresso, Folga"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />

              <TimeInput
                label="Horário início (opcional)"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                hint="Deixe vazio para bloquear o dia inteiro"
              />

              <TimeInput
                label="Horário término (opcional)"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                error={formErrors.end_time}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting}>
                {editingBlock ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de bloqueios */}
      {sortedBlocks.length === 0 ? (
        <Card>
          <EmptyState
            icon={Calendar}
            title="Nenhum bloqueio cadastrado"
            description="Adicione bloqueios para períodos de férias, folgas ou outros compromissos."
            action={
              <Button variant="secondary" onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Bloqueio
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Horário
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Motivo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedBlocks.map((block) => {
                  const isPast = isBlockPast(block.date);
                  
                  return (
                    <tr
                      key={block.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                        isPast ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground font-medium">
                          {formatDate(block.date)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {block.start_time && block.end_time
                            ? `${formatTime(block.start_time)} - ${formatTime(block.end_time)}`
                            : 'Dia inteiro'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {block.reason || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={isPast ? 'default' : 'warning'}>
                          {isPast ? 'Passado' : 'Futuro'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(block)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(block)}
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, block: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Bloqueio"
        description={`Tem certeza que deseja excluir o bloqueio do dia ${
          deleteModal.block ? formatDate(deleteModal.block.date) : ''
        }?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
