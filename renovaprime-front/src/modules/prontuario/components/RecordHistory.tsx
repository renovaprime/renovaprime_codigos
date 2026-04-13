import { useEffect, useState } from 'react';
import { Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import type { MedicalRecord } from '../types/medicalRecord';
import { medicalRecordApiService } from '../services/medicalRecordService';

interface RecordHistoryProps {
  beneficiaryId: number;
  onSelectRecord: (record: MedicalRecord) => void;
}

export function RecordHistory({ beneficiaryId, onSelectRecord }: RecordHistoryProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecords();
  }, [beneficiaryId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordApiService.getPatientRecords(beneficiaryId);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar historico');
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

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">Nenhuma evolução registrada para este paciente.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');
  const formatTime = (timeStr: string) => timeStr?.substring(0, 5) || '';

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <button
          key={record.id}
          onClick={() => onSelectRecord(record)}
          className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {record.Appointment ? `${formatDate(record.Appointment.date)} as ${formatTime(record.Appointment.start_time)}` : formatDate(record.created_at)}
                </span>
                {record.Appointment?.Specialty && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {record.Appointment.Specialty.name}
                  </span>
                )}
              </div>
              {record.Doctor?.User && (
                <p className="text-xs text-muted-foreground mb-2">
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
                  {record.cid10 && ` (${record.cid10})`}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 ml-3">
              {record.status === 'SIGNED' ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Assinado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> Rascunho
                </span>
              )}
            </div>
          </div>
          {record.attachments && record.attachments.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              {record.attachments.length} anexo(s)
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
