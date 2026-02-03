import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input, Badge, Switch, ConfirmModal } from '../components';
import { BranchFormModal } from '../components/BranchFormModal';
import { branchService } from '../services/branchService';
import { partnerService } from '../services/partnerService';
import type { PartnerBranch, BranchFormData, Partner } from '../types/api';

export function Filiais() {
  const [branches, setBranches] = useState<PartnerBranch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<PartnerBranch[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerFilter, setPartnerFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<PartnerBranch | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<PartnerBranch | null>(null);

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [branchToToggle, setBranchToToggle] = useState<PartnerBranch | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = branches;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.alias && b.alias.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (partnerFilter) {
      filtered = filtered.filter((b) => b.partner_id === parseInt(partnerFilter));
    }

    setFilteredBranches(filtered);
  }, [searchTerm, partnerFilter, branches]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [branchData, partnerData] = await Promise.all([
        branchService.list(),
        partnerService.list(),
      ]);
      setBranches(branchData);
      setFilteredBranches(branchData);
      setPartners(partnerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar filiais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (branch?: PartnerBranch) => {
    setEditingBranch(branch || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const handleSave = async (data: BranchFormData) => {
    if (editingBranch) {
      await branchService.update(editingBranch.id, data);
      showSuccess('Filial atualizada com sucesso!');
    } else {
      await branchService.create(data);
      showSuccess('Filial criada com sucesso!');
    }
    await loadData();
  };

  const handleToggle = (branch: PartnerBranch) => {
    setBranchToToggle(branch);
    setToggleModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!branchToToggle) return;
    try {
      await branchService.toggle(branchToToggle.id);
      showSuccess(`Filial ${branchToToggle.active ? 'desativada' : 'ativada'} com sucesso!`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setBranchToToggle(null);
    }
  };

  const handleDeleteClick = (branch: PartnerBranch) => {
    setBranchToDelete(branch);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;
    try {
      await branchService.delete(branchToDelete.id);
      showSuccess('Filial excluída com sucesso!');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir filial');
    } finally {
      setBranchToDelete(null);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <Layout title="Filiais">
      <div className="space-y-6">
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              {successMessage}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Filiais</h1>
            <p className="text-muted-foreground mt-1">Gerencie as filiais dos parceiros</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Nova Filial
          </Button>
        </div>

        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou apelido..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="">Todos os parceiros</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : filteredBranches.length === 0 ? (
          <Card>
            <EmptyState
              icon={Building2}
              title={searchTerm || partnerFilter ? 'Nenhuma filial encontrada' : 'Nenhuma filial cadastrada'}
              description={
                searchTerm || partnerFilter
                  ? 'Tente ajustar seus filtros'
                  : 'Adicione filiais para gerenciar as unidades dos parceiros.'
              }
              action={
                !searchTerm && !partnerFilter ? (
                  <Button variant="secondary" onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4" />
                    Adicionar Filial
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Parceiro</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revendedores</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{branch.name}</p>
                            {branch.alias && (
                              <p className="text-xs text-muted-foreground">{branch.alias}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {branch.Partner?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {branch.email}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {branch.resellers?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={branch.active ? 'success' : 'default'}>
                          {branch.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(branch)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <Switch
                            checked={branch.active}
                            onCheckedChange={() => handleToggle(branch)}
                          />
                          <button
                            onClick={() => handleDeleteClick(branch)}
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

      <BranchFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingBranch={editingBranch}
        partners={partners}
      />

      <ConfirmModal
        isOpen={toggleModalOpen}
        onClose={() => { setToggleModalOpen(false); setBranchToToggle(null); }}
        onConfirm={handleConfirmToggle}
        title={branchToToggle?.active ? 'Desativar Filial' : 'Ativar Filial'}
        description={`Tem certeza que deseja ${branchToToggle?.active ? 'desativar' : 'ativar'} a filial "${branchToToggle?.name}"?`}
        confirmText={branchToToggle?.active ? 'Desativar' : 'Ativar'}
        variant={branchToToggle?.active ? 'danger' : 'warning'}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setBranchToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Excluir Filial"
        description={`Tem certeza que deseja excluir permanentemente a filial "${branchToDelete?.name}"? Todos os revendedores associados também serão excluídos. Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </Layout>
  );
}
