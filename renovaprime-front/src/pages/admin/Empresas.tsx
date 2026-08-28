import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, FileText, Users, Receipt } from 'lucide-react';
import { Layout } from '../../layout';
import { Card, EmptyState, Button, Input, Badge, Switch, ConfirmModal, PageHeader } from '../../components';
import { CompanyFormModal } from '../../components/CompanyFormModal';
import { CompanyContractModal } from '../../components/CompanyContractModal';
import { CompanyBeneficiariesModal } from '../../components/CompanyBeneficiariesModal';
import { CompanyBillingModal } from '../../components/CompanyBillingModal';
import { companyService } from '../../services/companyService';
import type { CompanyFormData, CompanyRecord } from '../../types/company';

export function Empresas() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<CompanyRecord | null>(null);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [companyToToggle, setCompanyToToggle] = useState<CompanyRecord | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [companyForContract, setCompanyForContract] = useState<CompanyRecord | null>(null);
  const [beneficiariesModalOpen, setBeneficiariesModalOpen] = useState(false);
  const [companyForBeneficiaries, setCompanyForBeneficiaries] = useState<CompanyRecord | null>(null);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [companyForBilling, setCompanyForBilling] = useState<CompanyRecord | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCompanies(
        companies.filter(
          (c) =>
            c.trade_name.toLowerCase().includes(term) ||
            c.legal_name.toLowerCase().includes(term) ||
            c.cnpj.includes(term) ||
            c.responsible_email.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, companies]);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyService.list();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSave = async (data: CompanyFormData) => {
    if (editingCompany) {
      await companyService.update(editingCompany.id, data);
      showSuccess('Empresa atualizada com sucesso!');
    } else {
      await companyService.create(data);
      showSuccess('Empresa criada com sucesso!');
    }
    await loadCompanies();
  };

  const handleConfirmToggle = async () => {
    if (!companyToToggle) return;
    try {
      await companyService.updateStatus(companyToToggle.id, !companyToToggle.active);
      showSuccess(`Empresa ${companyToToggle.active ? 'desativada' : 'ativada'} com sucesso!`);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setCompanyToToggle(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    try {
      await companyService.delete(companyToDelete.id);
      showSuccess('Empresa excluída com sucesso!');
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir empresa');
    } finally {
      setCompanyToDelete(null);
    }
  };

  return (
    <Layout title="Empresas">
      <div className="space-y-6">
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {successMessage}
          </div>
        )}

        <PageHeader
          title="Empresas"
          subtitle="Cadastre empresas clientes e credenciais do portal."
          actions={
            <Button onClick={() => { setEditingCompany(null); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4" />
              Nova Empresa
            </Button>
          }
        />

        {error && <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

        <Card padding="sm">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CNPJ ou e-mail..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <EmptyState icon={Building2} title="Nenhuma empresa" description="Cadastre a primeira empresa cliente." />
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} padding="md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{company.trade_name}</h3>
                      <Badge variant={company.active ? 'success' : 'secondary'}>
                        {company.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{company.legal_name}</p>
                    <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                    <p className="text-sm text-muted-foreground">Login: {company.responsible_email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setCompanyForBilling(company); setBillingModalOpen(true); }}
                    >
                      <Receipt className="w-4 h-4" />
                      Faturas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setCompanyForBeneficiaries(company); setBeneficiariesModalOpen(true); }}
                    >
                      <Users className="w-4 h-4" />
                      Vidas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setCompanyForContract(company); setContractModalOpen(true); }}
                    >
                      <FileText className="w-4 h-4" />
                      Plano
                    </Button>
                    <Switch
                      checked={company.active}
                      onCheckedChange={() => {
                        setCompanyToToggle(company);
                        setToggleModalOpen(true);
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => { setEditingCompany(company); setIsModalOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setCompanyToDelete(company); setDeleteModalOpen(true); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <CompanyFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingCompany(null); }}
          onSave={handleSave}
          editingCompany={editingCompany}
        />

        <CompanyContractModal
          isOpen={contractModalOpen}
          onClose={() => { setContractModalOpen(false); setCompanyForContract(null); }}
          company={companyForContract}
        />

        <CompanyBeneficiariesModal
          isOpen={beneficiariesModalOpen}
          onClose={() => { setBeneficiariesModalOpen(false); setCompanyForBeneficiaries(null); }}
          company={companyForBeneficiaries}
        />

        <CompanyBillingModal
          isOpen={billingModalOpen}
          onClose={() => { setBillingModalOpen(false); setCompanyForBilling(null); }}
          company={companyForBilling}
        />

        <ConfirmModal
          isOpen={toggleModalOpen}
          onClose={() => { setToggleModalOpen(false); setCompanyToToggle(null); }}
          onConfirm={handleConfirmToggle}
          title={companyToToggle?.active ? 'Desativar empresa' : 'Ativar empresa'}
          message={`Confirma ${companyToToggle?.active ? 'desativar' : 'ativar'} ${companyToToggle?.trade_name}?`}
        />

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setCompanyToDelete(null); }}
          onConfirm={handleConfirmDelete}
          title="Excluir empresa"
          message={`Confirma excluir ${companyToDelete?.trade_name}? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          variant="danger"
        />
      </div>
    </Layout>
  );
}
