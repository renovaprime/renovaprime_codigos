import { useState, useEffect, Fragment } from 'react';
import { Users, Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input, Badge, Switch, ConfirmModal, BeneficiaryDetailsModal } from '../components';
import { TitularFormModal } from '../components/TitularFormModal';
import { DependenteFormModal } from '../components/DependenteFormModal';
import { beneficiaryService, type BeneficiaryFilters, type FaceScanListFilter } from '../services/beneficiaryService';
import type { Beneficiary } from '../types/api';

export function Beneficiarios() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [faceScanFilter, setFaceScanFilter] = useState<FaceScanListFilter | ''>('');

  const [titularModalOpen, setTitularModalOpen] = useState(false);
  const [dependenteModalOpen, setDependenteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; beneficiary: Beneficiary | null }>({
    isOpen: false,
    beneficiary: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [toggleStatusModal, setToggleStatusModal] = useState<{
    isOpen: boolean;
    beneficiary: Beneficiary | null;
  }>({
    isOpen: false,
    beneficiary: null
  });
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    loadBeneficiaries();
  }, [searchTerm, typeFilter, statusFilter, faceScanFilter]);

  const loadBeneficiaries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: BeneficiaryFilters = {};
      if (searchTerm) filters.name = searchTerm;
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (faceScanFilter) filters.faceScan = faceScanFilter;

      const data = await beneficiaryService.list(filters);
      setBeneficiaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar beneficiários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = (beneficiary: Beneficiary) => {
    if (beneficiary.type === 'TITULAR' &&
        beneficiary.dependents &&
        beneficiary.dependents.length > 0) {
      setToggleStatusModal({ isOpen: true, beneficiary });
    } else {
      doToggleStatus(beneficiary.id, false);
    }
  };

  const doToggleStatus = async (beneficiaryId: number, includeDependents: boolean) => {
    try {
      setIsTogglingStatus(true);
      await beneficiaryService.toggleStatus(beneficiaryId, includeDependents);
      await loadBeneficiaries();
      setToggleStatusModal({ isOpen: false, beneficiary: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeleteClick = (beneficiary: Beneficiary) => {
    setDeleteModal({ isOpen: true, beneficiary });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.beneficiary) return;

    try {
      setIsDeleting(true);
      await beneficiaryService.delete(deleteModal.beneficiary.id);
      await loadBeneficiaries();
      setDeleteModal({ isOpen: false, beneficiary: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir beneficiário');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setDetailsModalOpen(true);
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsEditing(true);
    if (beneficiary.type === 'TITULAR') {
      setTitularModalOpen(true);
    } else {
      setDependenteModalOpen(true);
    }
  };

  const handleNewTitular = () => {
    setSelectedBeneficiary(null);
    setIsEditing(false);
    setTitularModalOpen(true);
  };

  const handleNewDependente = () => {
    setSelectedBeneficiary(null);
    setIsEditing(false);
    setDependenteModalOpen(true);
  };

  const handleFormClose = () => {
    setTitularModalOpen(false);
    setDependenteModalOpen(false);
    setSelectedBeneficiary(null);
    setIsEditing(false);
    loadBeneficiaries();
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getServiceLabel = (serviceType: string) => {
    const labels: Record<string, string> = {
      'CLINICO': 'Clínico',
      'PREMIUM': 'Premium',
      'FAMILIAR': 'Familiar'
    };
    return labels[serviceType] || serviceType;
  };

  const getFaceScanBadge = (b: Beneficiary) => {
    const enabled = Boolean(b.face_scan_enabled);
    const requested = Boolean(b.face_scan_requested);
    if (enabled) {
      return { label: 'Ativo', variant: 'success' as const };
    }
    if (requested) {
      return { label: 'Solicitado', variant: 'warning' as const };
    }
    return { label: 'Desativado', variant: 'secondary' as const };
  };

  return (
    <Layout title="Beneficiários">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Beneficiários</h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">Gerencie titulares e dependentes do sistema.</p>
            </div>
            <div className="flex flex-col gap-2 self-start sm:flex-row sm:self-auto">
              <Button onClick={handleNewTitular} data-cy="new-beneficiary-button">
                <Plus className="w-4 h-4" />
                Novo Beneficiário
              </Button>
              <Button onClick={handleNewDependente} data-cy="new-dependent-button" variant="secondary">
                <Plus className="w-4 h-4" />
                Novo Dependente
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-cy="error-message">
            {error}
          </div>
        )}

        <Card padding="sm">
          <div className="flex flex-col gap-3 p-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  className="pl-10"
                  value={searchTerm}
                  data-cy="beneficiary-search-input"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={typeFilter}
                data-cy="beneficiary-type-filter"
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os tipos</option>
                <option value="TITULAR">Titular</option>
                <option value="DEPENDENTE">Dependente</option>
              </select>
              <select
                value={statusFilter}
                data-cy="beneficiary-status-filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos os status</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
              <select
                value={faceScanFilter}
                data-cy="beneficiary-face-scan-filter"
                onChange={(e) => setFaceScanFilter((e.target.value || '') as FaceScanListFilter | '')}
                className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[12rem]"
              >
                <option value="">Face Scan: todos</option>
                <option value="disabled">Face Scan: desativado</option>
                <option value="pending">Face Scan: solicitado</option>
                <option value="active">Face Scan: ativo</option>
              </select>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : beneficiaries.length === 0 ? (
          <Card>
            <EmptyState
              icon={Users}
              title="Nenhum beneficiário encontrado"
              description={
                searchTerm || typeFilter || statusFilter || faceScanFilter
                  ? 'Tente ajustar os filtros de busca'
                  : 'Cadastre o primeiro beneficiário do sistema'
              }
              action={
                !searchTerm && !typeFilter && !statusFilter && !faceScanFilter ? (
                  <Button variant="secondary" onClick={handleNewTitular}>
                    <Plus className="w-4 h-4" />
                    Adicionar Titular
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Titular</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Telefone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plano/Serviço</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Face Scan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((titular) => {
                    const titularFaceScan = getFaceScanBadge(titular);
                    return (
                    <Fragment key={titular.id}>
                      {/* Linha do Titular */}
                      <tr
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{titular.name}</p>
                            {titular.email && (
                              <p className="text-xs text-muted-foreground">{titular.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{formatCPF(titular.cpf)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default" data-cy="beneficiary-type-badge">Titular</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">-</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{titular.phone || '-'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="primary" data-cy="beneficiary-service-badge">{getServiceLabel(titular.service_type)}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={titularFaceScan.variant} data-cy="beneficiary-face-scan-badge">
                            {titularFaceScan.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Switch
                            checked={titular.status === 'ACTIVE'}
                            onCheckedChange={() => handleToggleStatus(titular)}
                            data-cy="beneficiary-status-switch"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(titular)}
                              data-cy="view-beneficiary-button"
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(titular)}
                              data-cy="edit-beneficiary-button"
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(titular)}
                              data-cy="delete-beneficiary-button"
                              className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Linhas dos Dependentes */}
                      {titular.dependents?.map((dependente) => {
                        const depFaceScan = getFaceScanBadge(dependente);
                        return (
                        <tr
                          key={dependente.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors bg-muted/10"
                        >
                          <td className="py-3 px-4 pl-12">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">└─</span>
                              <div>
                                <p className="text-sm font-medium text-foreground">{dependente.name}</p>
                                {dependente.email && (
                                  <p className="text-xs text-muted-foreground">{dependente.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-foreground">{formatCPF(dependente.cpf)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">Dependente</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-foreground">{titular.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-foreground">{dependente.phone || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="primary">{getServiceLabel(dependente.service_type)}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={depFaceScan.variant} data-cy="dependent-face-scan-badge">
                              {depFaceScan.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Switch
                              checked={dependente.status === 'ACTIVE'}
                              onCheckedChange={() => handleToggleStatus(dependente)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(dependente)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(dependente)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(dependente)}
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
                    </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Confirmacao de Exclusao */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, beneficiary: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Beneficiário"
        description={`Tem certeza que deseja excluir ${deleteModal.beneficiary?.name}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Modal de Toggle Status com Dependentes */}
      {toggleStatusModal.isOpen && toggleStatusModal.beneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isTogglingStatus && setToggleStatusModal({ isOpen: false, beneficiary: null })} />

          <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {toggleStatusModal.beneficiary.status === 'ACTIVE' ? 'Inativar Beneficiário Titular' : 'Ativar Beneficiário Titular'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Este titular possui {toggleStatusModal.beneficiary.dependents?.length} dependente(s).
              {toggleStatusModal.beneficiary.status === 'ACTIVE'
                ? ' Deseja inativar os dependentes tambem?'
                : ' Deseja ativar os dependentes tambem?'}
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setToggleStatusModal({ isOpen: false, beneficiary: null })}
                disabled={isTogglingStatus}
                className="flex-1"
              >
                Cancelar
              </Button>
              {toggleStatusModal.beneficiary.status === 'ACTIVE' && (
                <Button
                  variant="secondary"
                  onClick={() => doToggleStatus(toggleStatusModal.beneficiary!.id, false)}
                  disabled={isTogglingStatus}
                  className="flex-1"
                >
                  Apenas titular
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => doToggleStatus(toggleStatusModal.beneficiary!.id, true)}
                disabled={isTogglingStatus}
                className="flex-1"
              >
                {toggleStatusModal.beneficiary.status === 'ACTIVE'
                  ? 'Titular e dependentes'
                  : 'Confirmar ativacao'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Titular */}
      <TitularFormModal
        isOpen={titularModalOpen}
        onClose={handleFormClose}
        beneficiary={selectedBeneficiary}
        isEditing={isEditing}
      />

      {/* Modal Dependente */}
      <DependenteFormModal
        isOpen={dependenteModalOpen}
        onClose={handleFormClose}
        beneficiary={selectedBeneficiary}
        isEditing={isEditing}
      />

      {/* Modal de Detalhes */}
      <BeneficiaryDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedBeneficiary(null);
        }}
        beneficiary={selectedBeneficiary}
        onEdit={() => {
          setDetailsModalOpen(false);
          handleEdit(selectedBeneficiary!);
        }}
      />
    </Layout>
  );
}
