import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { ClipboardList, X, History, FilePlus } from 'lucide-react';
import { TeleconsultaRoom } from '../components/TeleconsultaRoom';
import { MedicalRecordForm } from '../../prontuario/components/MedicalRecordForm';
import { RecordHistory } from '../../prontuario/components/RecordHistory';
import { RecordDetail } from '../../prontuario/components/RecordDetail';
import { medicalRecordApiService } from '../../prontuario/services/medicalRecordService';
import { teleconsultService } from '../../../services/teleconsultService';
import type { MedicalRecord } from '../../prontuario/types/medicalRecord';

const log = (...args: unknown[]) => console.log('[Teleconsult:profissional]', ...args);

type PanelTab = 'history' | 'form';

export function TeleconsultaMedico() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [showProntuario, setShowProntuario] = useState(false);
  const [existingRecord, setExistingRecord] = useState<MedicalRecord | null>(null);
  const [recordLoaded, setRecordLoaded] = useState(false);
  const [beneficiaryId, setBeneficiaryId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>('form');
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<MedicalRecord | null>(null);

  const handleEnd = useCallback(() => {
    log('onEnd — navigate to consultas', { appointmentId });
    navigate('/profissional/consultas');
  }, [navigate, appointmentId]);

  const handleError = useCallback((error: string) => {
    log('TeleconsultaRoom onError', { appointmentId, error });
  }, [appointmentId]);

  useEffect(() => {
    if (appointmentId) {
      log('page mount — entering video room flow', { appointmentId });
      loadExistingRecord();
      loadBeneficiaryId();
    }
  }, [appointmentId]);

  const loadBeneficiaryId = async () => {
    try {
      const roomData = await teleconsultService.getRoom(parseInt(appointmentId!));
      if (roomData.beneficiary_id) {
        setBeneficiaryId(roomData.beneficiary_id);
        log('beneficiary_id loaded', { beneficiary_id: roomData.beneficiary_id });
      }
    } catch (err) {
      log('Failed to load beneficiary_id', { error: err });
    }
  };

  const loadExistingRecord = async () => {
    try {
      const record = await medicalRecordApiService.getRecordByAppointment(parseInt(appointmentId!));
      setExistingRecord(record);
    } catch {
      // No record yet
    } finally {
      setRecordLoaded(true);
    }
  };

  const handleRecordSaved = (record: MedicalRecord) => {
    setExistingRecord(record);
  };

  const handleRecordSigned = (record: MedicalRecord) => {
    setExistingRecord(record);
  };

  const handleSelectHistoryRecord = (record: MedicalRecord) => {
    setSelectedHistoryRecord(record);
  };

  const handleBackFromDetail = () => {
    setSelectedHistoryRecord(null);
  };

  if (!appointmentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>ID da consulta não informado</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Video */}
      <div className={`transition-all duration-300 ${showProntuario ? 'w-1/2' : 'w-full'}`}>
        <TeleconsultaRoom
          appointmentId={parseInt(appointmentId)}
          role="doctor"
          onEnd={handleEnd}
          onError={handleError}
        />
      </div>

      {/* Prontuario toggle button */}
      <button
        onClick={() => setShowProntuario(!showProntuario)}
        className={`fixed z-50 flex items-center gap-2 px-3 py-2 rounded-l-lg text-sm font-medium shadow-lg transition-all duration-300 ${
          showProntuario
            ? 'top-2 right-[50%] bg-gray-800 text-white hover:bg-gray-700'
            : 'top-2 right-0 bg-cyan-600 text-white hover:bg-cyan-700'
        }`}
        title={showProntuario ? 'Fechar prontuário' : 'Abrir prontuário'}
      >
        {showProntuario ? <X className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
        {!showProntuario && 'Prontuário'}
      </button>

      {/* Prontuario panel */}
      {showProntuario && (
        <div className="w-1/2 h-full bg-background border-l border-border flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => { setActiveTab('form'); setSelectedHistoryRecord(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'form'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              Nova Evolução
            </button>
            <button
              onClick={() => { setActiveTab('history'); setSelectedHistoryRecord(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <History className="w-4 h-4" />
              Histórico
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'form' && (
              <>
                <h2 className="text-lg font-semibold text-foreground mb-4">Prontuario da Consulta</h2>
                {recordLoaded ? (
                  <MedicalRecordForm
                    appointmentId={parseInt(appointmentId)}
                    existingRecord={existingRecord}
                    onSaved={handleRecordSaved}
                    onSigned={handleRecordSigned}
                  />
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <>
                {selectedHistoryRecord ? (
                  <RecordDetail
                    record={selectedHistoryRecord}
                    onBack={handleBackFromDetail}
                  />
                ) : beneficiaryId ? (
                  <>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Histórico do Paciente</h2>
                    <RecordHistory
                      beneficiaryId={beneficiaryId}
                      onSelectRecord={handleSelectHistoryRecord}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
