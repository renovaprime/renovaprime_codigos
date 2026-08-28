import { useState, useEffect } from 'react';
import { ClipboardList, Search, FileText, Calendar, CheckCircle, AlertCircle, ArrowLeft, User } from 'lucide-react';
import { Layout } from '../../layout';
import { Card, Input, Badge, PageHeader } from '../../components';
import { beneficiaryService } from '../../services/beneficiaryService';
import { RecordDetail, medicalRecordApiService } from '../../modules/prontuario';
import type { Beneficiary } from '../../types/api';
import type { MedicalRecord } from '../../modules/prontuario';

export function AdminProntuarios() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected beneficiary and their records
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    loadBeneficiaries();
  }, [searchTerm]);

  const loadBeneficiaries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: Record<string, string> = {};
      if (searchTerm) filters.search = searchTerm;

      const data = await beneficiaryService.list(filters);
      setBeneficiaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar beneficiários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBeneficiary = async (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setSelectedRecord(null);
    setRecordsLoading(true);

    try {
      const data = await medicalRecordApiService.getPatientRecords(beneficiary.id);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prontuários');
      setRecords([]);
    } finally {
      setRecordsLoading(false);
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

  const handleBackToList = () => {
    setSelectedBeneficiary(null);
    setRecords([]);
    setSelectedRecord(null);
  };

  const handleBackToRecords = () => {
    setSelectedRecord(null);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');
  const formatTime = (timeStr: string) => timeStr?.substring(0, 5) || '';

  // Viewing a specific record
  if (selectedRecord) {
    return (
      <Layout title="Prontuários">
        <div className="space-y-6">
          <button
            onClick={handleBackToRecords}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para prontuários de {selectedBeneficiary?.name}
          </button>
          <div className="rounded-2xl border border-border/60 bg-card p-2">
            <RecordDetail record={selectedRecord} onBack={handleBackToRecords} />
          </div>
        </div>
      </Layout>
    );
  }

  // Viewing records of a beneficiary
  if (selectedBeneficiary) {
    return (
      <Layout title="Prontuários">
        <div className="space-y-6">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista de beneficiários
          </button>

          <PageHeader
            title={
              <span className="inline-flex items-center gap-4">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-7 w-7 text-primary" />
                </span>
                {selectedBeneficiary.name}
              </span>
            }
            subtitle={`CPF: ${selectedBeneficiary.cpf} | ${selectedBeneficiary.type === 'TITULAR' ? 'Titular' : 'Dependente'}`}
          />

          {recordsLoading && (
            <Card className="p-10">
              <div className="flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            </Card>
          )}

          {!recordsLoading && records.length === 0 && (
            <Card className="p-12">
              <div className="py-4 text-center">
                <FileText className="mx-auto mb-4 h-14 w-14 text-muted-foreground/30" />
                <h3 className="mb-1 text-lg font-medium text-foreground">Nenhum prontuario encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Este beneficiário ainda não possui registros clínicos.
                </p>
              </div>
            </Card>
          )}

          {!recordsLoading && records.length > 0 && (
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
      </Layout>
    );
  }

  // Main list of beneficiaries
  return (
    <Layout title="Prontuários">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Prontuários"
          subtitle="Visualize os prontuários médicos dos beneficiários."
          actions={
            <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-5 py-3">
              <ClipboardList className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{beneficiaries.length}</p>
                <p className="text-xs text-muted-foreground">Beneficiários</p>
              </div>
            </div>
          }
        />

        {/* Search */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
              <h2 className="text-xl font-display text-foreground">Erro ao carregar</h2>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <button
                onClick={loadBeneficiaries}
                className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Tentar novamente
              </button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <Card className="p-10">
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && beneficiaries.length === 0 && (
          <Card className="p-12">
            <div className="py-4 text-center">
              <ClipboardList className="mx-auto mb-4 h-14 w-14 text-muted-foreground/30" />
              <h3 className="mb-1 text-lg font-medium text-foreground">Nenhum beneficiário encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          </Card>
        )}

        {/* Beneficiaries list */}
        {!isLoading && !error && beneficiaries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {beneficiaries.map((beneficiary) => (
              <button
                key={beneficiary.id}
                onClick={() => handleSelectBeneficiary(beneficiary)}
                className="group rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{beneficiary.name}</h3>
                    <p className="text-sm text-muted-foreground">CPF: {beneficiary.cpf}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={beneficiary.type === 'TITULAR' ? 'primary' : 'default'}>
                        {beneficiary.type === 'TITULAR' ? 'Titular' : 'Dependente'}
                      </Badge>
                      <Badge variant={beneficiary.status === 'ACTIVE' ? 'success' : 'error'}>
                        {beneficiary.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <ClipboardList className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
