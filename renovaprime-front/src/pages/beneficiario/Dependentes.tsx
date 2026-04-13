import { useCallback, useEffect, useState } from 'react';
import { Users, X } from 'lucide-react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { EmptyState } from '../../components/EmptyState';
import { Card } from '../../components/Card';
import { Button, Input } from '../../components';
import { appointmentService } from '../../services/appointmentService';
import type { Beneficiary } from '../../types/api';

const MAX_DEPENDENTS = 3;

export function BeneficiarioDependentes() {
  const [dependents, setDependents] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDependent, setSelectedDependent] = useState<Beneficiary | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isSavingAccess, setIsSavingAccess] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingDependent, setIsCreatingDependent] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    cpf: '',
    birth_date: '',
    phone: '',
    email: ''
  });

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message;
    return fallback;
  };

  const loadDependents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const beneficiaries = await appointmentService.getMyBeneficiaries();
      setDependents(beneficiaries.filter((beneficiary) => beneficiary.type === 'DEPENDENTE'));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao carregar dependentes'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDependents();
  }, [loadDependents]);

  const formatCpf = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  const openAccessModal = (dependent: Beneficiary) => {
    setSelectedDependent(dependent);
    setEmail(dependent.email || '');
    setPassword('');
    setPasswordConfirmation('');
    setAccessError(null);
  };

  const closeAccessModal = () => {
    setSelectedDependent(null);
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setAccessError(null);
  };

  const openCreateModal = () => {
    setCreateForm({
      name: '',
      cpf: '',
      birth_date: '',
      phone: '',
      email: ''
    });
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreatingDependent) return;
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  const formatCpfInput = (value: string) => {
    let cpf = value.replace(/\D/g, '').slice(0, 11);

    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
      cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    return cpf;
  };

  const formatPhoneInput = (value: string) => {
    let phone = value.replace(/\D/g, '').slice(0, 11);

    if (phone.length > 10) {
      phone = phone.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    } else if (phone.length > 6) {
      phone = phone.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else if (phone.length > 2) {
      phone = phone.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    }

    return phone;
  };

  const handleCreateDependent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasReachedDependentLimit) {
      setCreateError(`Limite de ${MAX_DEPENDENTS} dependentes atingido.`);
      return;
    }

    const normalizedName = createForm.name.trim();
    const normalizedCpf = createForm.cpf.replace(/\D/g, '');
    const normalizedEmail = createForm.email.trim();

    if (normalizedName.length < 3) {
      setCreateError('Informe um nome com no minimo 3 caracteres.');
      return;
    }

    if (normalizedCpf.length !== 11) {
      setCreateError('Informe um CPF valido com 11 digitos.');
      return;
    }

    if (!createForm.birth_date) {
      setCreateError('Informe a data de nascimento.');
      return;
    }

    if (normalizedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        setCreateError('Informe um e-mail valido.');
        return;
      }
    }

    setIsCreatingDependent(true);
    setCreateError(null);

    try {
      await appointmentService.createDependent({
        name: normalizedName,
        cpf: normalizedCpf,
        birth_date: createForm.birth_date,
        phone: createForm.phone || undefined,
        email: normalizedEmail || undefined
      });

      await loadDependents();
      closeCreateModal();
    } catch (err: unknown) {
      setCreateError(getErrorMessage(err, 'Erro ao cadastrar dependente.'));
    } finally {
      setIsCreatingDependent(false);
    }
  };

  const validateAccessForm = () => {
    if (!email.trim()) {
      setAccessError('Informe um e-mail para acesso.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAccessError('Informe um e-mail valido.');
      return false;
    }

    if (password.length < 6) {
      setAccessError('A senha deve ter no minimo 6 caracteres.');
      return false;
    }

    if (password !== passwordConfirmation) {
      setAccessError('As senhas nao coincidem.');
      return false;
    }

    return true;
  };

  const handleSaveAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDependent) return;
    if (!validateAccessForm()) return;

    setIsSavingAccess(true);
    setAccessError(null);

    try {
      await appointmentService.manageDependentAccess(selectedDependent.id, {
        email: email.trim(),
        password
      });

      await loadDependents();
      closeAccessModal();
    } catch (err: unknown) {
      setAccessError(getErrorMessage(err, 'Erro ao salvar dados de acesso.'));
    } finally {
      setIsSavingAccess(false);
    }
  };

  const dependentsCount = dependents.length;
  const hasReachedDependentLimit = dependentsCount >= MAX_DEPENDENTS;

  return (
    <LayoutBeneficiario title="Dependentes">
      <div className="w-full mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Dependentes</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Gerencie os dependentes vinculados ao seu plano com cadastro e controle de acesso.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreateModal}
              disabled={hasReachedDependentLimit}
              className="self-start md:self-auto"
            >
              Cadastrar dependente
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cadastrados</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{dependentsCount}</p>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Limite</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-700 dark:text-cyan-400">
              {MAX_DEPENDENTS}
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 via-card/90 to-secondary/10 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Disponiveis</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
              {Math.max(MAX_DEPENDENTS - dependentsCount, 0)}
            </p>
          </Card>
        </div>

        {hasReachedDependentLimit && (
          <Card className="border-amber-300 bg-amber-50/70 p-3 text-amber-700">
            <p className="text-sm">Limite de {MAX_DEPENDENTS} dependentes atingido.</p>
          </Card>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <Card className="p-10">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          </Card>
        ) : dependents.length === 0 ? (
          <Card className="p-10">
            <EmptyState
              icon={Users}
              title="Nenhum dependente encontrado"
              description={`Voce ainda nao possui dependentes ativos vinculados ao seu cadastro. E permitido cadastrar ate ${MAX_DEPENDENTS} dependentes.`}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dependents.map((dependent) => (
              <div
                key={dependent.id}
                className="group space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <p className="text-base font-semibold text-foreground">{dependent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    CPF: {dependent.cpf ? formatCpf(dependent.cpf) : '-'}
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="text-foreground">E-mail:</span> {dependent.email || '-'}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Telefone:</span> {dependent.phone || '-'}
                  </p>
                </div>

                <div className="pt-1">
                  <Button
                    type="button"
                    variant={dependent.user_id ? 'secondary' : 'primary'}
                    onClick={() => openAccessModal(dependent)}
                    className="w-full"
                  >
                    {dependent.user_id ? 'Alterar acesso' : 'Criar acesso'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDependent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeAccessModal} />

          <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedDependent.user_id ? 'Alterar acesso do dependente' : 'Criar acesso do dependente'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedDependent.name}</p>
              </div>
              <button
                type="button"
                onClick={closeAccessModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccess} className="p-6 space-y-4">
              {accessError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {accessError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">E-mail *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Senha *</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirmar senha *</label>
                <Input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Repita a senha"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeAccessModal}
                  disabled={isSavingAccess}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSavingAccess} className="flex-1">
                  {isSavingAccess ? 'Salvando...' : 'Salvar acesso'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeCreateModal} />

          <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-xl animate-in fade-in zoom-in duration-200">
            <div className="border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Cadastrar dependente</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha os dados do novo dependente.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDependent} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome completo *</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do dependente"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CPF *</label>
                  <Input
                    value={createForm.cpf}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        cpf: formatCpfInput(e.target.value)
                      }))
                    }
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Data de nascimento *
                  </label>
                  <Input
                    type="date"
                    value={createForm.birth_date}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, birth_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                  <Input
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        phone: formatPhoneInput(e.target.value)
                      }))
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeCreateModal}
                  disabled={isCreatingDependent}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isCreatingDependent} className="flex-1">
                  {isCreatingDependent ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutBeneficiario>
  );
}
