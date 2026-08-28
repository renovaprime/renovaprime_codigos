import { useCallback, useEffect, useState } from 'react';
import { Plus, Users, X } from 'lucide-react';
import {
  companyBeneficiaryService,
  type CompanyBeneficiaryFormData,
  type KinshipType
} from '../services/companyBeneficiaryService';
import type { Beneficiary } from '../types/api';
import { Badge, Button, Card, EmptyState, Input } from './index';

const KINSHIP_OPTIONS: { value: KinshipType; label: string }[] = [
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'filho', label: 'Filho(a)' },
  { value: 'enteado', label: 'Enteado(a)' },
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'irmao', label: 'Irmão(ã)' },
  { value: 'outro', label: 'Outro' }
];

interface CompanyBeneficiariesPanelProps {
  companyId?: number;
  mode: 'admin' | 'portal';
}

type FormMode = 'titular' | 'dependente' | 'access' | null;

const emptyTitular = {
  name: '',
  cpf: '',
  birth_date: '',
  email: '',
  password: '',
  phone: ''
};

const emptyDependent = {
  titular_id: 0,
  kinship: 'filho' as KinshipType,
  name: '',
  cpf: '',
  birth_date: '',
  phone: '',
  email: ''
};

export function CompanyBeneficiariesPanel({ companyId, mode }: CompanyBeneficiariesPanelProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [titularForm, setTitularForm] = useState(emptyTitular);
  const [dependentForm, setDependentForm] = useState(emptyDependent);
  const [accessForm, setAccessForm] = useState({ email: '', password: '', passwordConfirmation: '' });
  const [selectedDependent, setSelectedDependent] = useState<Beneficiary | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = searchTerm ? { search: searchTerm } : undefined;
      const data = mode === 'admin' && companyId
        ? await companyBeneficiaryService.listAdmin(companyId, filters)
        : await companyBeneficiaryService.listPortal(filters);
      setBeneficiaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar beneficiários');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, mode, searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  const titulares = beneficiaries.filter((b) => b.type === 'TITULAR');

  const closeForm = () => {
    setFormMode(null);
    setFormError(null);
    setTitularForm(emptyTitular);
    setDependentForm(emptyDependent);
    setAccessForm({ email: '', password: '', passwordConfirmation: '' });
    setSelectedDependent(null);
  };

  const handleCreateTitular = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      const payload: CompanyBeneficiaryFormData = {
        type: 'TITULAR',
        ...titularForm
      };
      if (mode === 'admin' && companyId) {
        await companyBeneficiaryService.createAdmin(companyId, payload);
      } else {
        await companyBeneficiaryService.createPortal(payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao cadastrar titular');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateDependent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      const payload: CompanyBeneficiaryFormData = {
        type: 'DEPENDENTE',
        ...dependentForm
      };
      if (mode === 'admin' && companyId) {
        await companyBeneficiaryService.createAdmin(companyId, payload);
      } else {
        await companyBeneficiaryService.createPortal(payload);
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao cadastrar dependente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDependent) return;
    if (accessForm.password !== accessForm.passwordConfirmation) {
      setFormError('As senhas não coincidem');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const data = { email: accessForm.email, password: accessForm.password };
      if (mode === 'admin' && companyId) {
        await companyBeneficiaryService.grantAccessAdmin(companyId, selectedDependent.id, data);
      } else {
        await companyBeneficiaryService.grantAccessPortal(selectedDependent.id, data);
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao liberar acesso');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInactivate = async (beneficiary: Beneficiary) => {
    if (!confirm(`Inativar ${beneficiary.name}?`)) return;
    try {
      if (mode === 'admin' && companyId) {
        await companyBeneficiaryService.updateAdmin(companyId, beneficiary.id, { status: 'INACTIVE' });
      } else {
        await companyBeneficiaryService.updatePortal(beneficiary.id, { status: 'INACTIVE' });
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inativar');
    }
  };

  const formatCpf = (cpf: string) => {
    const d = cpf.replace(/\D/g, '');
    if (d.length !== 11) return cpf;
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setFormMode('dependente'); setDependentForm({ ...emptyDependent, titular_id: titulares[0]?.id ?? 0 }); }}>
            <Plus className="w-4 h-4" />
            Dependente
          </Button>
          <Button onClick={() => setFormMode('titular')}>
            <Plus className="w-4 h-4" />
            Colaborador
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : titulares.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Nenhum colaborador"
            description="Cadastre o primeiro titular (colaborador) da empresa."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {titulares.map((titular) => (
            <Card key={titular.id} padding="md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{titular.name}</h3>
                    <Badge variant={titular.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {titular.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">Titular</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">CPF: {formatCpf(titular.cpf)}</p>
                  {titular.email && <p className="text-sm text-muted-foreground">E-mail: {titular.email}</p>}
                  <p className="text-sm text-muted-foreground">Plano: {titular.service_type}</p>
                </div>
                {titular.status === 'ACTIVE' && (
                  <Button variant="outline" size="sm" onClick={() => handleInactivate(titular)}>
                    Inativar
                  </Button>
                )}
              </div>

              {titular.dependents && titular.dependents.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Dependentes</p>
                  {titular.dependents.map((dep) => (
                    <div key={dep.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
                      <div>
                        <span className="font-medium text-sm">{dep.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({dep.kinship || 'dependente'}) — CPF {formatCpf(dep.cpf)}
                        </span>
                        <Badge variant={dep.status === 'ACTIVE' ? 'success' : 'secondary'} className="ml-2">
                          {dep.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {dep.user_id ? (
                          <Badge variant="outline" className="ml-2">Com login</Badge>
                        ) : (
                          <Badge variant="secondary" className="ml-2">Sem login</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {dep.status === 'ACTIVE' && !dep.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDependent(dep);
                              setAccessForm({ email: dep.email || '', password: '', passwordConfirmation: '' });
                              setFormMode('access');
                            }}
                          >
                            Liberar acesso
                          </Button>
                        )}
                        {dep.status === 'ACTIVE' && (
                          <Button variant="outline" size="sm" onClick={() => handleInactivate(dep)}>
                            Inativar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {formMode === 'titular' && 'Novo colaborador'}
                {formMode === 'dependente' && 'Novo dependente'}
                {formMode === 'access' && 'Liberar acesso'}
              </h2>
              <button type="button" onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-4 mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{formError}</div>
            )}

            {formMode === 'titular' && (
              <form onSubmit={handleCreateTitular} className="p-4 space-y-3">
                <Input label="Nome" required value={titularForm.name} onChange={(e) => setTitularForm({ ...titularForm, name: e.target.value })} />
                <Input label="CPF" required value={titularForm.cpf} onChange={(e) => setTitularForm({ ...titularForm, cpf: e.target.value })} />
                <Input label="Data de nascimento" type="date" required value={titularForm.birth_date} onChange={(e) => setTitularForm({ ...titularForm, birth_date: e.target.value })} />
                <Input label="E-mail (login)" type="email" required value={titularForm.email} onChange={(e) => setTitularForm({ ...titularForm, email: e.target.value })} />
                <Input label="Senha" type="password" required minLength={6} value={titularForm.password} onChange={(e) => setTitularForm({ ...titularForm, password: e.target.value })} />
                <Input label="Telefone" value={titularForm.phone} onChange={(e) => setTitularForm({ ...titularForm, phone: e.target.value })} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Cadastrar'}</Button>
                </div>
              </form>
            )}

            {formMode === 'dependente' && (
              <form onSubmit={handleCreateDependent} className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">Titular</label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={dependentForm.titular_id}
                    onChange={(e) => setDependentForm({ ...dependentForm, titular_id: Number(e.target.value) })}
                    required
                  >
                    <option value={0} disabled>Selecione</option>
                    {titulares.filter((t) => t.status === 'ACTIVE').map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Parentesco</label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={dependentForm.kinship}
                    onChange={(e) => setDependentForm({ ...dependentForm, kinship: e.target.value as KinshipType })}
                    required
                  >
                    {KINSHIP_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <Input label="Nome" required value={dependentForm.name} onChange={(e) => setDependentForm({ ...dependentForm, name: e.target.value })} />
                <Input label="CPF" required value={dependentForm.cpf} onChange={(e) => setDependentForm({ ...dependentForm, cpf: e.target.value })} />
                <Input label="Data de nascimento" type="date" required value={dependentForm.birth_date} onChange={(e) => setDependentForm({ ...dependentForm, birth_date: e.target.value })} />
                <Input label="Telefone" value={dependentForm.phone} onChange={(e) => setDependentForm({ ...dependentForm, phone: e.target.value })} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving || !dependentForm.titular_id}>{isSaving ? 'Salvando...' : 'Cadastrar'}</Button>
                </div>
              </form>
            )}

            {formMode === 'access' && selectedDependent && (
              <form onSubmit={handleGrantAccess} className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground">Dependente: <strong>{selectedDependent.name}</strong></p>
                <Input label="E-mail (login)" type="email" required value={accessForm.email} onChange={(e) => setAccessForm({ ...accessForm, email: e.target.value })} />
                <Input label="Senha" type="password" required minLength={6} value={accessForm.password} onChange={(e) => setAccessForm({ ...accessForm, password: e.target.value })} />
                <Input label="Confirmar senha" type="password" required minLength={6} value={accessForm.passwordConfirmation} onChange={(e) => setAccessForm({ ...accessForm, passwordConfirmation: e.target.value })} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Liberar acesso'}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
