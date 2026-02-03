import { useState, useEffect } from 'react';
import { UserPlus, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input, Badge, Switch, ConfirmModal } from '../components';
import { ResellerFormModal } from '../components/ResellerFormModal';
import { resellerService } from '../services/resellerService';
import { branchService } from '../services/branchService';
import type { Reseller, ResellerFormData, PartnerBranch } from '../types/api';

export function Revendedores() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [filteredResellers, setFilteredResellers] = useState<Reseller[]>([]);
  const [branches, setBranches] = useState<PartnerBranch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resellerToDelete, setResellerToDelete] = useState<Reseller | null>(null);

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [resellerToToggle, setResellerToToggle] = useState<Reseller | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = resellers;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.cpf.includes(searchTerm) ||
          (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (branchFilter) {
      filtered = filtered.filter((r) => r.branch_id === parseInt(branchFilter));
    }

    setFilteredResellers(filtered);
  }, [searchTerm, branchFilter, resellers]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [resellerData, branchData] = await Promise.all([
        resellerService.list(),
        branchService.list(),
      ]);
      setResellers(resellerData);
      setFilteredResellers(resellerData);
      setBranches(branchData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar revendedores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (reseller?: Reseller) => {
    setEditingReseller(reseller || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReseller(null);
  };

  const handleSave = async (data: ResellerFormData) => {
    if (editingReseller) {
      await resellerService.update(editingReseller.id, data);
      showSuccess('Revendedor atualizado com sucesso!');
    } else {
      await resellerService.create(data);
      showSuccess('Revendedor criado com sucesso!');
    }
    await loadData();
  };

  const handleToggle = (reseller: Reseller) => {
    setResellerToToggle(reseller);
    setToggleModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!resellerToToggle) return;
    try {
      await resellerService.toggle(resellerToToggle.id);
      showSuccess(`Revendedor ${resellerToToggle.active ? 'desativado' : 'ativado'} com sucesso!`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setResellerToToggle(null);
    }
  };

  const handleDeleteClick = (reseller: Reseller) => {
    setResellerToDelete(reseller);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resellerToDelete) return;
    try {
      await resellerService.delete(resellerToDelete.id);
      showSuccess('Revendedor excluído com sucesso!');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir revendedor');
    } finally {
      setResellerToDelete(null);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <Layout title="Revendedores">
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
            <h1 className="font-display text-2xl text-foreground">Revendedores</h1>
            <p className="text-muted-foreground mt-1">Gerencie os revendedores das filiais</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Novo Revendedor
          </Button>
        </div>

        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm transition-all duration-200 ease-out hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="">Todas as filiais</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.Partner ? `(${b.Partner.name})` : ''}
                </option>
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
        ) : filteredResellers.length === 0 ? (
          <Card>
            <EmptyState
              icon={UserPlus}
              title={searchTerm || branchFilter ? 'Nenhum revendedor encontrado' : 'Nenhum revendedor cadastrado'}
              description={
                searchTerm || branchFilter
                  ? 'Tente ajustar seus filtros'
                  : 'Adicione revendedores para gerenciar a equipe de vendas.'
              }
              action={
                !searchTerm && !branchFilter ? (
                  <Button variant="secondary" onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4" />
                    Adicionar Revendedor
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CPF</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Filial</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cargo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResellers.map((reseller) => (
                    <tr
                      key={reseller.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium text-foreground">{reseller.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {reseller.cpf}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {reseller.PartnerBranch?.name || '-'}
                        {reseller.PartnerBranch?.Partner && (
                          <span className="text-xs text-muted-foreground/70 block">
                            {reseller.PartnerBranch.Partner.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {reseller.role || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-muted-foreground">
                          {reseller.email && <p>{reseller.email}</p>}
                          {reseller.phone && <p className="text-xs">{reseller.phone}</p>}
                          {!reseller.email && !reseller.phone && '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={reseller.active ? 'success' : 'default'}>
                          {reseller.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(reseller)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <Switch
                            checked={reseller.active}
                            onCheckedChange={() => handleToggle(reseller)}
                          />
                          <button
                            onClick={() => handleDeleteClick(reseller)}
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

      <ResellerFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingReseller={editingReseller}
        branches={branches}
      />

      <ConfirmModal
        isOpen={toggleModalOpen}
        onClose={() => { setToggleModalOpen(false); setResellerToToggle(null); }}
        onConfirm={handleConfirmToggle}
        title={resellerToToggle?.active ? 'Desativar Revendedor' : 'Ativar Revendedor'}
        description={`Tem certeza que deseja ${resellerToToggle?.active ? 'desativar' : 'ativar'} o revendedor "${resellerToToggle?.name}"?`}
        confirmText={resellerToToggle?.active ? 'Desativar' : 'Ativar'}
        variant={resellerToToggle?.active ? 'danger' : 'warning'}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setResellerToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Excluir Revendedor"
        description={`Tem certeza que deseja excluir permanentemente o revendedor "${resellerToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </Layout>
  );
}
