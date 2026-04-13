import { useState } from 'react';
import { Upload, Loader2, Trash2, Paperclip } from 'lucide-react';
import type { RecordAttachment, AttachmentCategory, AddAttachmentData } from '../types/medicalRecord';
import { medicalRecordApiService } from '../services/medicalRecordService';
import { apiClient } from '../../../services/api';
import type { ApiResponse } from '../../../types/api';

interface AttachmentUploadProps {
  recordId: number;
  attachments: RecordAttachment[];
  disabled?: boolean;
  onAttachmentAdded: (attachment: RecordAttachment) => void;
  onAttachmentRemoved: (attachmentId: number) => void;
}

const CATEGORIES: { value: AttachmentCategory; label: string }[] = [
  { value: 'EXAM', label: 'Exame' },
  { value: 'IMAGE', label: 'Imagem' },
  { value: 'REPORT', label: 'Laudo' },
  { value: 'CERTIFICATE', label: 'Atestado' },
  { value: 'REFERRAL', label: 'Encaminhamento' },
  { value: 'OTHER', label: 'Outro' },
];

export function AttachmentUpload({ recordId, attachments, disabled, onAttachmentAdded, onAttachmentRemoved }: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<AttachmentCategory>('EXAM');
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');

      // Get presigned URL
      const uploadResponse = await apiClient.post<ApiResponse<{ url: string; key: string }>>('/upload/presigned-url', {
        file_name: file.name,
        content_type: file.type,
        folder: 'prontuario',
      });

      const { url: presignedUrl, key } = uploadResponse.data;

      // Upload to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // Build the final URL from the key
      const fileUrl = presignedUrl.split('?')[0];

      // Register attachment in backend
      const attachmentData: AddAttachmentData = {
        category,
        file_name: file.name,
        file_url: fileUrl,
        mime_type: file.type,
      };

      const attachment = await medicalRecordApiService.addAttachment(recordId, attachmentData);
      onAttachmentAdded(attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (attachmentId: number) => {
    try {
      await medicalRecordApiService.deleteAttachment(recordId, attachmentId);
      onAttachmentRemoved(attachmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover anexo');
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
      )}

      {!disabled && (
        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AttachmentCategory)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Enviando...' : 'Enviar arquivo'}
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
              accept="image/*,.pdf,.doc,.docx"
            />
          </label>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/30">
              <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate block">
                  {att.file_name}
                </a>
                <span className="text-xs text-muted-foreground">
                  {CATEGORIES.find(c => c.value === att.category)?.label || att.category}
                </span>
              </div>
              {!disabled && (
                <button
                  onClick={() => handleDelete(att.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Nenhum anexo adicionado.</p>
      )}
    </div>
  );
}
