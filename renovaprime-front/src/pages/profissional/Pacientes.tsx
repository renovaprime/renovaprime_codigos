import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ClipboardList, Users } from 'lucide-react';
import { LayoutProfissional } from '../../layout/LayoutProfissional';
import { PageHeader } from '../../components';
import { apiClient } from '../../services/api';
import type { ApiResponse, PatientWithAppointment } from '../../types/api';

export function ProfissionalPacientes() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientWithAppointment[]>([]);
  const [filtered, setFiltered] = useState<PatientWithAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(patients);
    } else {
      const q = search.toLowerCase();
      setFiltered(patients.filter(p =>
        p.name?.toLowerCase().includes(q) || p.cpf?.includes(q)
      ));
    }
  }, [search, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse<PatientWithAppointment[]>>('/doctors/patients-with-appointments');
      setPatients(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProntuario = (patient: PatientWithAppointment) => {
    if (patient.beneficiaryId) {
      navigate(`/profissional/prontuario/${patient.beneficiaryId}`);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <LayoutProfissional>
      <div className="w-full mx-auto">
        <PageHeader
          title="Pacientes"
          subtitle="Lista de pacientes atendidos. Clique para acessar o prontuario."
          className="mb-6"
        />

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente atendido'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'Tente buscar com outro termo.' : 'Seus pacientes aparecerão aqui após os atendimentos.'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((patient, index) => (
              <div
                key={`${patient.beneficiaryId || patient.patientId}-${index}`}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    CPF: {patient.cpf}
                    {patient.specialty && ` | ${patient.specialty.name}`}
                    {patient.lastAppointmentDate && ` | Ultimo: ${formatDate(patient.lastAppointmentDate)}`}
                  </p>
                </div>
                {patient.beneficiaryId && (
                  <button
                    onClick={() => handleOpenProntuario(patient)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-3"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Prontuário
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutProfissional>
  );
}
