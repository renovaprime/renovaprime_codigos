import { useEffect, useState } from 'react';
import { User, Phone, Mail, MapPin, AlertTriangle, Pill, Activity, Calendar } from 'lucide-react';
import type { PatientSummaryData } from '../types/medicalRecord';
import { medicalRecordApiService } from '../services/medicalRecordService';

interface PatientSummaryProps {
  beneficiaryId: number;
}

export function PatientSummary({ beneficiaryId }: PatientSummaryProps) {
  const [summary, setSummary] = useState<PatientSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSummary();
  }, [beneficiaryId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordApiService.getPatientSummary(beneficiaryId);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
    );
  }

  if (!summary) return null;

  const { beneficiary, clinical, stats } = summary;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  };

  const calcAge = (birthDate: string) => {
    const birth = new Date(birthDate + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const InfoItem = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    );
  };

  const ClinicalCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value?: string | null; color: string }) => {
    if (!value) return null;
    return (
      <div className={`p-3 rounded-lg border ${color}`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase">{label}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{value}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dados do Paciente */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{beneficiary.name}</h3>
            <p className="text-sm text-muted-foreground">
              CPF: {beneficiary.cpf} | {formatDate(beneficiary.birth_date)} ({calcAge(beneficiary.birth_date)} anos)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {beneficiary.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" /> {beneficiary.phone}
            </div>
          )}
          {beneficiary.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" /> {beneficiary.email}
            </div>
          )}
          {(beneficiary.city || beneficiary.state) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> {[beneficiary.city, beneficiary.state].filter(Boolean).join(' - ')}
            </div>
          )}
        </div>
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{stats.total_appointments}</p>
          <p className="text-xs text-muted-foreground">Atendimentos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Activity className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <p className="text-2xl font-bold text-foreground">{stats.total_records}</p>
          <p className="text-xs text-muted-foreground">Evoluções</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
          <p className="text-sm font-bold text-foreground">
            {stats.last_record_date ? new Date(stats.last_record_date).toLocaleDateString('pt-BR') : '—'}
          </p>
          <p className="text-xs text-muted-foreground">Último registro</p>
        </div>
      </div>

      {/* Dados Clinicos */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Dados Clínicos</h4>
        {!clinical.allergies && !clinical.current_medications && !clinical.comorbidities && !clinical.personal_history ? (
          <p className="text-sm text-muted-foreground italic">Nenhum dado clínico registrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ClinicalCard
              icon={AlertTriangle}
              label="Alergias"
              value={clinical.allergies}
              color="bg-red-50 border-red-200 text-red-800"
            />
            <ClinicalCard
              icon={Pill}
              label="Medicamentos em uso"
              value={clinical.current_medications}
              color="bg-blue-50 border-blue-200 text-blue-800"
            />
            <ClinicalCard
              icon={Activity}
              label="Comorbidades"
              value={clinical.comorbidities}
              color="bg-amber-50 border-amber-200 text-amber-800"
            />
            <InfoItem label="Antecedentes pessoais" value={clinical.personal_history} />
            <InfoItem label="Antecedentes cirúrgicos" value={clinical.surgical_history} />
            <InfoItem label="Hábitos" value={clinical.habits} />
            <InfoItem label="Histórico familiar" value={clinical.family_history} />
            <InfoItem label="Último diagnóstico" value={clinical.last_diagnosis} />
          </div>
        )}
      </div>
    </div>
  );
}
