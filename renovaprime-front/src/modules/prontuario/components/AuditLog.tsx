import { useEffect, useState } from 'react';
import { Shield, Eye, Edit, CheckCircle, Plus, Paperclip } from 'lucide-react';
import type { RecordAuditLogEntry } from '../types/medicalRecord';
import { medicalRecordApiService } from '../services/medicalRecordService';

interface AuditLogProps {
  beneficiaryId: number;
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  CREATED: { label: 'Criado', icon: Plus, color: 'text-green-600' },
  UPDATED: { label: 'Editado', icon: Edit, color: 'text-blue-600' },
  SIGNED: { label: 'Assinado', icon: CheckCircle, color: 'text-green-700' },
  VIEWED: { label: 'Visualizado', icon: Eye, color: 'text-gray-600' },
  ATTACHMENT_ADDED: { label: 'Anexo adicionado', icon: Paperclip, color: 'text-purple-600' },
};

export function AuditLog({ beneficiaryId }: AuditLogProps) {
  const [logs, setLogs] = useState<RecordAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLogs();
  }, [beneficiaryId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordApiService.getPatientAuditLogs(beneficiaryId);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar auditoria');
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

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">Nenhum registro de auditoria encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.VIEWED;
        const Icon = config.icon;
        return (
          <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
            <div className={`mt-0.5 ${config.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{config.label}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Por: {log.actor?.name || `Usuario #${log.actor_id}`}
                {log.ip && ` | IP: ${log.ip}`}
              </p>
              {log.changes_json && (
                <details className="mt-1">
                  <summary className="text-xs text-primary cursor-pointer">Ver alterações</summary>
                  <div className="mt-1 p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
                    {Object.entries(log.changes_json).map(([field, change]) => (
                      <div key={field} className="mb-1">
                        <span className="font-semibold">{field}:</span>{' '}
                        <span className="text-red-600">"{String(change.old || '')}"</span>{' → '}
                        <span className="text-green-600">"{String(change.new || '')}"</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
