import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Search } from 'lucide-react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components';
import { EmptyState } from '../../components/EmptyState';
import { patientPrescriptionService } from '../../services/patientPrescriptionService';
import type { PrescriptionWithAppointment } from '../../types/api';

export function BeneficiarioReceitas() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingPrescriptionId, setLoadingPrescriptionId] = useState<number | null>(null);

  const getAppointment = (prescription: PrescriptionWithAppointment) => {
    // Sequelize pode serializar como `appointment` ou `Appointment`.
    return (prescription as any).appointment ?? (prescription as any).Appointment;
  };

  const getSpecialtyName = (appointment: any) => {
    return appointment?.specialty?.name ?? appointment?.Specialty?.name ?? '—';
  };

  const getDoctorName = (appointment: any) => {
    // O model `Doctor` não tem `name` diretamente; o nome vem de `Doctor.User.name`.
    return (
      appointment?.doctor?.User?.name ??
      appointment?.Doctor?.User?.name ??
      appointment?.doctor?.name ??
      appointment?.Doctor?.name ??
      '—'
    );
  };

  const loadPrescriptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientPrescriptionService.listMyPrescriptions();
      setPrescriptions(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar receitas';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const formatDate = (dateStr: string) => {
    const safe = dateStr?.trim();
    if (!safe) return '—';
    const date = new Date(safe + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateTimeStr: string) => {
    const safe = dateTimeStr?.trim();
    if (!safe) return '—';
    const date = new Date(safe);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const handleViewPrescription = async (prescription: PrescriptionWithAppointment) => {
    // Se já tem link em cache, abre direto
    if (prescription.memed_patient_link) {
      window.open(prescription.memed_patient_link, '_blank');

      // Caso o link esteja em cache mas o código ainda não, busca apenas o código
      if (!prescription.memed_patient_digits) {
        setLoadingPrescriptionId(prescription.id);
        try {
          const { digits } = await patientPrescriptionService.getPrescriptionLink(prescription.id);
          setPrescriptions(prev =>
            prev.map(p =>
              p.id === prescription.id
                ? { ...p, memed_patient_digits: digits }
                : p
            )
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Erro ao obter código da receita';
          alert(message);
          console.error(err);
        } finally {
          setLoadingPrescriptionId(null);
        }
      }

      return;
    }

    // Senão, busca o link via API
    setLoadingPrescriptionId(prescription.id);
    try {
      const { link, digits } = await patientPrescriptionService.getPrescriptionLink(prescription.id);
      window.open(link, '_blank');
      // Atualiza o cache local para não buscar novamente
      setPrescriptions(prev =>
        prev.map(p =>
          p.id === prescription.id
            ? { ...p, memed_patient_link: link, memed_patient_digits: digits }
            : p
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao obter link da receita';
      alert(message);
      console.error(err);
    } finally {
      setLoadingPrescriptionId(null);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const search = searchTerm.toLowerCase();
    const appointment = getAppointment(prescription);
    const specialtyName = getSpecialtyName(appointment).toLowerCase();
    const doctorName = getDoctorName(appointment).toLowerCase();
    const consultationDate = formatDate(appointment?.date || '').toLowerCase();

    return (
      doctorName.includes(search) ||
      specialtyName.includes(search) ||
      consultationDate.includes(search)
    );
  });

  const signedCount = prescriptions.filter((prescription) => prescription.signed).length;

  if (isLoading) {
    return (
      <LayoutBeneficiario title="Minhas receitas">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </LayoutBeneficiario>
    );
  }

  if (error) {
    return (
      <LayoutBeneficiario title="Minhas receitas">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-display text-foreground">Erro ao carregar receitas</h2>
              <p className="text-muted-foreground max-w-md">{error}</p>
              <button
                onClick={loadPrescriptions}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        </div>
      </LayoutBeneficiario>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <LayoutBeneficiario title="Minhas receitas">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12">
            <EmptyState
              icon={FileText}
              title="Nenhuma receita encontrada"
              description="Você ainda não tem receitas médicas emitidas."
            />
          </Card>
        </div>
      </LayoutBeneficiario>
    );
  }

  return (
    <LayoutBeneficiario title="Minhas receitas">
      <div className="w-full mx-auto space-y-6">
        <PageHeader
          title="Minhas Receitas"
          subtitle="Acompanhe suas prescricoes emitidas e acesse o documento com um clique."
        />

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por médico, especialidade ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/70 py-3 pl-12 pr-4 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {searchTerm && filteredPrescriptions.length === 0 && (
          <Card className="border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma receita encontrada para "{searchTerm}"
            </p>
          </Card>
        )}

        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => (
            <Card
              key={prescription.id}
              className={`group cursor-pointer overflow-hidden border border-border/70 p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md ${loadingPrescriptionId === prescription.id ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => handleViewPrescription(prescription)}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-1 text-primary transition-colors group-hover:bg-primary/15">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Receita #{prescription.id}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Clique para abrir a receita no portal MeMed
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-2.5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Medico
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {getDoctorName(getAppointment(prescription))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Especialidade
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {getSpecialtyName(getAppointment(prescription))}
                    </p>
                  </div>
                  <div className="sm:col-span-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Datas
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 text-sm text-foreground sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">Consulta:</span>{' '}
                        {formatDate(getAppointment(prescription)?.date || '')} às{' '}
                        {getAppointment(prescription)?.start_time
                          ? formatTime(getAppointment(prescription).start_time)
                          : '—'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Emissao:</span>{' '}
                        {formatDateTime(prescription.issued_at || '')}
                      </p>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Codigo de Acesso
                    </p>
                    <p className="break-all rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5 font-mono text-sm text-foreground">
                      {prescription.memed_patient_digits ?? '—'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </LayoutBeneficiario>
  );
}
