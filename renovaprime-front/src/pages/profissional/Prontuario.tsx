import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ClipboardList, FileText, History, Paperclip } from 'lucide-react';
import { LayoutProfissional } from '../../layout/LayoutProfissional';
import {
  PatientSummary,
  MedicalRecordForm,
  RecordHistory,
  RecordDetail,
  AttachmentUpload,
  medicalRecordApiService,
} from '../../modules/prontuario';
import type { MedicalRecord, RecordAttachment } from '../../modules/prontuario';

type Tab = 'resumo' | 'evolucao' | 'historico';

export function ProfissionalProntuario() {
  const { beneficiaryId } = useParams<{ beneficiaryId: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [activeTab, setActiveTab] = useState<Tab>(appointmentId ? 'evolucao' : 'resumo');
  const [existingRecord, setExistingRecord] = useState<MedicalRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [attachments, setAttachments] = useState<RecordAttachment[]>([]);

  const benefId = parseInt(beneficiaryId || '0');

  // Load existing record if coming from appointment
  useEffect(() => {
    if (appointmentId) {
      loadExistingRecord(parseInt(appointmentId));
    }
  }, [appointmentId]);

  const loadExistingRecord = async (apptId: number) => {
    try {
      setLoadingRecord(true);
      const record = await medicalRecordApiService.getRecordByAppointment(apptId);
      setExistingRecord(record);
      if (record?.attachments) setAttachments(record.attachments);
    } catch {
      // No existing record, that's fine
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleRecordSaved = (record: MedicalRecord) => {
    setExistingRecord(record);
  };

  const handleRecordSigned = (record: MedicalRecord) => {
    setExistingRecord(record);
  };

  const handleSelectHistoryRecord = async (record: MedicalRecord) => {
    try {
      const full = await medicalRecordApiService.getRecord(record.id);
      setSelectedRecord(full);
    } catch {
      setSelectedRecord(record);
    }
  };

  const handleAttachmentAdded = (att: RecordAttachment) => {
    setAttachments(prev => [att, ...prev]);
  };

  const handleAttachmentRemoved = (attId: number) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const tabs = [
    { id: 'resumo' as Tab, label: 'Resumo', icon: ClipboardList },
    ...(appointmentId ? [{ id: 'evolucao' as Tab, label: 'Evolução', icon: FileText }] : []),
    { id: 'historico' as Tab, label: 'Histórico', icon: History },
  ];

  return (
    <LayoutProfissional>
      <div className="max-w-5xl mx-auto">
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Prontuário</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Visualize e registre dados clínicos do paciente.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedRecord(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'resumo' && (
          <PatientSummary beneficiaryId={benefId} />
        )}

        {activeTab === 'evolucao' && appointmentId && (
          <div className="space-y-6">
            {loadingRecord ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                <MedicalRecordForm
                  appointmentId={parseInt(appointmentId)}
                  existingRecord={existingRecord}
                  onSaved={handleRecordSaved}
                  onSigned={handleRecordSigned}
                />

                {existingRecord && (
                  <div className="border-t border-border pt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" /> Anexos
                    </h4>
                    <AttachmentUpload
                      recordId={existingRecord.id}
                      attachments={attachments}
                      disabled={existingRecord.status === 'SIGNED'}
                      onAttachmentAdded={handleAttachmentAdded}
                      onAttachmentRemoved={handleAttachmentRemoved}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'historico' && (
          selectedRecord ? (
            <RecordDetail record={selectedRecord} onBack={() => setSelectedRecord(null)} />
          ) : (
            <RecordHistory beneficiaryId={benefId} onSelectRecord={handleSelectHistoryRecord} />
          )
        )}
      </div>
    </LayoutProfissional>
  );
}
