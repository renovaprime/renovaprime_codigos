import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Users, Search, AlertCircle } from 'lucide-react';
import { LayoutProfissional } from '../../layout/LayoutProfissional';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Badge } from '../../components/Badge';
import { PatientPrescriptionsModal } from '../../components/PatientPrescriptionsModal';
import { doctorPrescriptionService } from '../../services/doctorPrescriptionService';
import type { PatientWithAppointment } from '../../types/api';

export function ProfissionalReceitas() {
  const [patients, setPatients] = useState<PatientWithAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAppointment | null>(null);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorPrescriptionService.listPatientsWithAppointments();
      setPatients(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pacientes';
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const formatCpf = (cpf: string) => {
    if (!cpf || cpf === 'N/A') return cpf;
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const filteredPatients = patients.filter(patient => {
    const search = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(search) ||
      patient.cpf.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
    );
  });

  if (isLoading) {
    return (
      <LayoutProfissional title="Receitas">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </LayoutProfissional>
    );
  }

  if (error) {
    return (
      <LayoutProfissional title="Receitas">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-display text-foreground">Erro ao carregar dados</h2>
              <p className="text-muted-foreground max-w-md">{error}</p>
              <button
                onClick={loadPatients}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        </div>
      </LayoutProfissional>
    );
  }

  if (patients.length === 0) {
    return (
      <LayoutProfissional title="Receitas">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12">
            <EmptyState
              icon={Users}
              title="Nenhum paciente com consultas"
              description="Você não tem consultas finalizadas ou em andamento com pacientes ainda."
            />
          </Card>
        </div>
      </LayoutProfissional>
    );
  }

  return (
    <LayoutProfissional title="Receitas">
      <div className="w-full mx-auto">
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">
              Receitas
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Gerenciar receitas e histórico de consultas com seus pacientes.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Table on desktop, cards on mobile */}
        <div className="space-y-4 lg:space-y-0">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <Card className="p-0 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      CPF
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Última Consulta
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Especialidade
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedPatient(patient)}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {formatCpf(patient.cpf)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {formatDate(patient.lastAppointmentDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {patient.specialty?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {patient.hasPrescription ? (
                          <Badge variant="success" className="inline-flex">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="inline-flex">
                            <XCircle className="w-4 h-4 mr-1" />
                            Não
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {filteredPatients.map((patient, idx) => (
              <Card
                key={idx}
                className="p-4 cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Nome</p>
                    <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">CPF</p>
                      <p className="text-sm text-foreground">{formatCpf(patient.cpf)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Última Consulta</p>
                      <p className="text-sm text-foreground">
                        {formatDate(patient.lastAppointmentDate)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Especialidade</p>
                    <p className="text-sm text-foreground">
                      {patient.specialty?.name || '—'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium">Receita Emitida</p>
                    {patient.hasPrescription ? (
                      <Badge variant="success" className="inline-flex">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="inline-flex">
                        <XCircle className="w-4 h-4 mr-1" />
                        Não
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* No results message */}
        {searchTerm && filteredPatients.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Nenhum paciente encontrado para "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Prescriptions Modal */}
      {selectedPatient && (
        <PatientPrescriptionsModal
          isOpen={true}
          onClose={() => setSelectedPatient(null)}
          patientName={selectedPatient.name}
          beneficiaryId={selectedPatient.beneficiaryId}
          patientId={selectedPatient.patientId}
        />
      )}
    </LayoutProfissional>
  );
}
