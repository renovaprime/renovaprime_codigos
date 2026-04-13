import { useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { LayoutBeneficiario } from '../../layout/LayoutBeneficiario';
import { RecordDetail, medicalRecordApiService } from '../../modules/prontuario';
import type { MedicalRecord } from '../../modules/prontuario';
import { Card } from '../../components/Card';

export function BeneficiarioMeuProntuario() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordApiService.getMyRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prontuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = async (record: MedicalRecord) => {
    try {
      const full = await medicalRecordApiService.getRecord(record.id);
      setSelectedRecord(full);
    } catch {
      setSelectedRecord(record);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');
  const formatTime = (timeStr: string) => timeStr?.substring(0, 5) || '';
  const recordsWithDiagnosis = records.filter((record) => !!record.diagnosis?.trim()).length;

  return (
    <LayoutBeneficiario title="Meu prontuario">
      <div className="w-full mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-foreground md:text-4xl">
              Meu Prontuario
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Historico de atendimentos, queixas e diagnosticos registrados em consulta.
            </p>
          </div>
        </div>

        {loading && (
          <Card className="p-10">
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              <h2 className="text-xl font-display text-foreground">Erro ao carregar prontuario</h2>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <button
                onClick={loadRecords}
                className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        )}

        {!loading && !error && selectedRecord && (
          <div className="rounded-2xl border border-border/60 bg-card p-2">
            <RecordDetail record={selectedRecord} onBack={() => setSelectedRecord(null)} />
          </div>
        )}

        {!loading && !error && !selectedRecord && records.length === 0 && (
          <Card className="p-12">
            <div className="py-4 text-center">
              <FileText className="mx-auto mb-4 h-14 w-14 text-muted-foreground/30" />
              <h3 className="mb-1 text-lg font-medium text-foreground">Nenhum registro encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Seus registros clinicos aparecerao aqui apos suas consultas.
              </p>
            </div>
          </Card>
        )}

        {!loading && !error && !selectedRecord && records.length > 0 && (
          <div className="space-y-3">
            {records.map((record) => (
              <button
                key={record.id}
                onClick={() => handleSelectRecord(record)}
                className="group w-full rounded-xl border border-border/70 bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-1 text-primary transition-colors group-hover:bg-primary/15">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {record.Appointment ? `${formatDate(record.Appointment.date)} as ${formatTime(record.Appointment.start_time)}` : formatDate(record.created_at)}
                      </span>
                      {record.Appointment?.Specialty && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {record.Appointment.Specialty.name}
                        </span>
                      )}
                    </div>
                    {record.Doctor?.User && (
                      <p className="mb-1 text-xs text-muted-foreground">
                        Dr(a). {record.Doctor.User.name}
                      </p>
                    )}
                    {record.Beneficiary && (
                      <p className="mb-1 text-xs text-muted-foreground">
                        Paciente: {record.Beneficiary.name}
                      </p>
                    )}
                    {record.chief_complaint && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        <span className="font-medium">QP:</span> {record.chief_complaint}
                      </p>
                    )}
                    {record.diagnosis && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        <span className="font-medium">Dx:</span> {record.diagnosis}
                      </p>
                    )}
                  </div>
                  <span className="ml-2 inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    <CheckCircle className="h-3 w-3" /> Assinado
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </LayoutBeneficiario>
  );
}
