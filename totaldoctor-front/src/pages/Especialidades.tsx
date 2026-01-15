import { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input, Badge, Switch, ConfirmModal } from '../components';
import { SpecialtyModal } from '../components/SpecialtyModal';
import { specialtyService } from '../services/specialtyService';
import type { Specialty } from '../types/api';

export function Especialidades() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [specialtyToToggle, setSpecialtyToToggle] = useState<Specialty | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);

  useEffect(() => {
    loadSpecialties();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSpecialties(specialties);
    } else {
      const filtered = specialties.filter((specialty) =>
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpecialties(filtered);
    }
  }, [searchTerm, specialties]);

  const loadSpecialties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await specialtyService.listSpecialties();
      setSpecialties(data);
      setFilteredSpecialties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar especialidades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (specialty?: Specialty) => {
    setEditingSpecialty(specialty || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSpecialty(null);
  };

  const handleSave = async (name: string) => {
    if (editingSpecialty) {
      await specialtyService.updateSpecialty(editingSpecialty.id, { name });
      showSuccess('Especialidade atualizada com sucesso!');
    } else {
      await specialtyService.createSpecialty({ name });
      showSuccess('Especialidade criada com sucesso!');
    }
    await loadSpecialties();
  };

  const handleToggle = (specialty: Specialty) => {
    setSpecialtyToToggle(specialty);
    setConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!specialtyToToggle) return;

    try {
      await specialtyService.toggleSpecialty(specialtyToToggle.id);
      showSuccess(`Especialidade ${specialtyToToggle.active ? 'desativada' : 'ativada'} com sucesso!`);
      await loadSpecialties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar especialidade');
    } finally {
      setSpecialtyToToggle(null);
    }
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setSpecialtyToToggle(null);
  };

  const handleDeleteClick = (specialty: Specialty) => {
    setSpecialtyToDelete(specialty);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!specialtyToDelete) return;

    try {
      await specialtyService.deleteSpecialty(specialtyToDelete.id);
      showSuccess('Especialidade excluída com sucesso!');
      await loadSpecialties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir especialidade');
    } finally {
      setSpecialtyToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSpecialtyToDelete(null);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <Layout title="Especialidades">
      <div className="space-y-6">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              {successMessage}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Especialidades</h1>
            <p className="text-muted-foreground mt-1">Gerencie especialidades medicas da plataforma</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Nova Especialidade
          </Button>
        </div>

        {/* Search Bar */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar especialidade..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : filteredSpecialties.length === 0 ? (
          /* Empty State */
          <Card>
            <EmptyState
              icon={Stethoscope}
              title={searchTerm ? 'Nenhuma especialidade encontrada' : 'Nenhuma especialidade cadastrada'}
              description={
                searchTerm
                  ? 'Tente ajustar sua busca'
                  : 'Adicione especialidades para categorizar os medicos da plataforma.'
              }
              action={
                !searchTerm ? (
                  <Button variant="secondary" onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4" />
                    Adicionar Especialidade
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          /* Table */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Especialidade
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
                  {filteredSpecialties.map((specialty) => (
                    <tr
                      key={specialty.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-foreground font-medium">
                        {specialty.name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={specialty.active ? 'success' : 'default'}>
                          {specialty.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(specialty)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <Switch
                            checked={specialty.active}
                            onCheckedChange={() => handleToggle(specialty)}
                          />
                          <button
                            onClick={() => handleDeleteClick(specialty)}
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal */}
      <SpecialtyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingSpecialty={editingSpecialty}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmToggle}
        title={specialtyToToggle?.active ? 'Desativar Especialidade' : 'Ativar Especialidade'}
        description={`Tem certeza que deseja ${specialtyToToggle?.active ? 'desativar' : 'ativar'} a especialidade "${specialtyToToggle?.name}"? ${specialtyToToggle?.active ? 'Isso impedirá que novos médicos sejam associados a ela.' : 'Isso permitirá que a especialidade seja utilizada novamente.'}`}
        confirmText={specialtyToToggle?.active ? 'Desativar' : 'Ativar'}
        variant={specialtyToToggle?.active ? 'danger' : 'warning'}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Especialidade"
        description={`Tem certeza que deseja excluir permanentemente a especialidade "${specialtyToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </Layout>
  );
}
