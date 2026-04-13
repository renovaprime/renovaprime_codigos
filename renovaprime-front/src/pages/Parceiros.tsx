import { useState, useEffect } from 'react';
import { Handshake, Plus, Search, Edit2, Trash2, Globe, Building2 } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input, Badge, Switch, ConfirmModal } from '../components';
import { PartnerFormModal } from '../components/PartnerFormModal';
import { partnerService } from '../services/partnerService';
import type { Partner, PartnerFormData } from '../types/api';

export function Parceiros() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [partnerToToggle, setPartnerToToggle] = useState<Partner | null>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPartners(partners);
    } else {
      const filtered = partners.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.cnpj && p.cnpj.includes(searchTerm))
      );
      setFilteredPartners(filtered);
    }
  }, [searchTerm, partners]);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await partnerService.list();
      setPartners(data);
      setFilteredPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar parceiros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (partner?: Partner) => {
    setEditingPartner(partner || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
  };

  const handleSave = async (data: PartnerFormData): Promise<number> => {
    let partnerId: number;
    if (editingPartner) {
      await partnerService.update(editingPartner.id, data);
      partnerId = editingPartner.id;
      showSuccess('Parceiro atualizado com sucesso!');
    } else {
      const created = await partnerService.create(data);
      partnerId = created.id;
      showSuccess('Parceiro criado com sucesso!');
    }
    await loadPartners();
    return partnerId;
  };

  const handleToggle = (partner: Partner) => {
    setPartnerToToggle(partner);
    setToggleModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!partnerToToggle) return;
    try {
      await partnerService.toggle(partnerToToggle.id);
      showSuccess(`Parceiro ${partnerToToggle.active ? 'desativado' : 'ativado'} com sucesso!`);
      await loadPartners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setPartnerToToggle(null);
    }
  };

  const handleDeleteClick = (partner: Partner) => {
    setPartnerToDelete(partner);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;
    try {
      await partnerService.delete(partnerToDelete.id);
      showSuccess('Parceiro excluído com sucesso!');
      await loadPartners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir parceiro');
    } finally {
      setPartnerToDelete(null);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <Layout title="Parceiros">
      <div className="space-y-6">
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              {successMessage}
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Parceiros</h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">Gerencie parceiros da plataforma.</p>
            </div>
            <Button onClick={() => handleOpenModal()} className="self-start sm:self-auto">
              <Plus className="w-4 h-4" />
              Novo Parceiro
            </Button>
          </div>
        </div>

        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CNPJ..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
        ) : filteredPartners.length === 0 ? (
          <Card>
            <EmptyState
              icon={Handshake}
              title={searchTerm ? 'Nenhum parceiro encontrado' : 'Nenhum parceiro cadastrado'}
              description={
                searchTerm
                  ? 'Tente ajustar sua busca'
                  : 'Adicione parceiros para começar a gerenciar suas integrações.'
              }
              action={
                !searchTerm ? (
                  <Button variant="secondary" onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4" />
                    Adicionar Parceiro
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CNPJ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Filiais</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((partner) => (
                    <tr
                      key={partner.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Handshake className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{partner.name}</p>
                            {partner.website_url && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="w-3 h-3" />
                                {partner.website_url}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {partner.cnpj || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {partner.email}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {partner.branches?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={partner.active ? 'success' : 'default'}>
                          {partner.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(partner)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <Switch
                            checked={partner.active}
                            onCheckedChange={() => handleToggle(partner)}
                          />
                          <button
                            onClick={() => handleDeleteClick(partner)}
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

      <PartnerFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingPartner={editingPartner}
      />

      <ConfirmModal
        isOpen={toggleModalOpen}
        onClose={() => { setToggleModalOpen(false); setPartnerToToggle(null); }}
        onConfirm={handleConfirmToggle}
        title={partnerToToggle?.active ? 'Desativar Parceiro' : 'Ativar Parceiro'}
        description={`Tem certeza que deseja ${partnerToToggle?.active ? 'desativar' : 'ativar'} o parceiro "${partnerToToggle?.name}"?`}
        confirmText={partnerToToggle?.active ? 'Desativar' : 'Ativar'}
        variant={partnerToToggle?.active ? 'danger' : 'warning'}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setPartnerToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Excluir Parceiro"
        description={`Tem certeza que deseja excluir permanentemente o parceiro "${partnerToDelete?.name}"? Todas as filiais e revendedores associados também serão excluídos. Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </Layout>
  );
}
