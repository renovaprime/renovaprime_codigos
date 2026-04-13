import { ArrowLeft, CheckCircle, Clock, Paperclip, ExternalLink } from 'lucide-react';
import type { MedicalRecord } from '../types/medicalRecord';

interface RecordDetailProps {
  record: MedicalRecord;
  onBack: () => void;
}

export function RecordDetail({ record, onBack }: RecordDetailProps) {
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');
  const formatTime = (timeStr: string) => timeStr?.substring(0, 5) || '';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{title}</h5>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao histórico
      </button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              {record.Appointment ? `${formatDate(record.Appointment.date)} as ${formatTime(record.Appointment.start_time)}` : formatDate(record.created_at)}
            </p>
            {record.Appointment?.Specialty && (
              <span className="text-xs text-primary">{record.Appointment.Specialty.name}</span>
            )}
          </div>
          {record.status === 'SIGNED' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Assinado {record.signed_at ? `em ${new Date(record.signed_at).toLocaleString('pt-BR')}` : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" /> Rascunho
            </span>
          )}
        </div>
        {record.Doctor?.User && (
          <p className="text-xs text-muted-foreground">Dr(a). {record.Doctor.User.name}</p>
        )}
      </div>

      {/* Anamnese */}
      <div className="bg-card border border-border rounded-xl p-4">
        <Section title="Anamnese">
          <Field label="Queixa principal" value={record.chief_complaint} />
          <Field label="História da doença atual" value={record.hpi} />
          <Field label="Antecedentes pessoais" value={record.personal_history} />
          <Field label="Antecedentes cirúrgicos" value={record.surgical_history} />
          <Field label="Alergias" value={record.allergies} />
          <Field label="Medicamentos em uso" value={record.current_medications} />
          <Field label="Comorbidades" value={record.comorbidities} />
          <Field label="Hábitos" value={record.habits} />
          <Field label="Histórico familiar" value={record.family_history} />
        </Section>
      </div>

      {/* Sinais Vitais */}
      {record.vitals_json && Object.values(record.vitals_json).some(v => v !== undefined && v !== null) && (
        <div className="bg-card border border-border rounded-xl p-4">
          <Section title="Sinais Vitais">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {record.vitals_json.blood_pressure && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">PA</p>
                  <p className="text-sm font-semibold">{record.vitals_json.blood_pressure}</p>
                </div>
              )}
              {record.vitals_json.heart_rate && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">FC</p>
                  <p className="text-sm font-semibold">{record.vitals_json.heart_rate} bpm</p>
                </div>
              )}
              {record.vitals_json.temperature && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Temp.</p>
                  <p className="text-sm font-semibold">{record.vitals_json.temperature}°C</p>
                </div>
              )}
              {record.vitals_json.weight && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="text-sm font-semibold">{record.vitals_json.weight} kg</p>
                </div>
              )}
              {record.vitals_json.height && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Altura</p>
                  <p className="text-sm font-semibold">{record.vitals_json.height} cm</p>
                </div>
              )}
              {record.vitals_json.spo2 && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">SpO2</p>
                  <p className="text-sm font-semibold">{record.vitals_json.spo2}%</p>
                </div>
              )}
              {record.vitals_json.respiratory_rate && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">FR</p>
                  <p className="text-sm font-semibold">{record.vitals_json.respiratory_rate} irpm</p>
                </div>
              )}
            </div>
          </Section>
        </div>
      )}

      {/* Exame e Avaliação */}
      <div className="bg-card border border-border rounded-xl p-4">
        <Section title="Exame e Avaliação">
          <Field label="Exame físico" value={record.physical_exam} />
          <Field label="Avaliação / Hipótese diagnóstica" value={record.assessment} />
          <Field label="Diagnóstico" value={record.diagnosis} />
          {record.cid10 && <Field label="CID-10" value={record.cid10} />}
        </Section>
      </div>

      {/* Conduta */}
      <div className="bg-card border border-border rounded-xl p-4">
        <Section title="Conduta">
          <Field label="Plano terapêutico" value={record.plan} />
          <Field label="Orientações ao paciente" value={record.guidance} />
          <Field label="Retorno" value={record.return_instructions} />
          <Field label="Sinais de alerta" value={record.red_flags} />
          <Field label="Solicitação de exames" value={record.exam_requests} />
          <Field label="Encaminhamentos" value={record.referrals} />
        </Section>
      </div>

      {/* Anexos */}
      {record.attachments && record.attachments.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <Section title="Anexos">
            <div className="space-y-2">
              {record.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{att.file_name}</p>
                    <p className="text-xs text-muted-foreground">{att.category}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
