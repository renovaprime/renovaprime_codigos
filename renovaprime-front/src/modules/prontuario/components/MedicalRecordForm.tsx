import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, CheckCircle, Loader2 } from 'lucide-react';
import type { MedicalRecord, CreateRecordData, UpdateRecordData, VitalsData } from '../types/medicalRecord';
import { medicalRecordApiService } from '../services/medicalRecordService';
import { VitalsForm } from './VitalsForm';

interface MedicalRecordFormProps {
  appointmentId: number;
  existingRecord?: MedicalRecord | null;
  onSaved?: (record: MedicalRecord) => void;
  onSigned?: (record: MedicalRecord) => void;
}

const AUTOSAVE_DELAY = 30000;

export function MedicalRecordForm({ appointmentId, existingRecord, onSaved, onSigned }: MedicalRecordFormProps) {
  const [record, setRecord] = useState<MedicalRecord | null>(existingRecord || null);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form fields
  const [chiefComplaint, setChiefComplaint] = useState(existingRecord?.chief_complaint || '');
  const [hpi, setHpi] = useState(existingRecord?.hpi || '');
  const [personalHistory, setPersonalHistory] = useState(existingRecord?.personal_history || '');
  const [surgicalHistory, setSurgicalHistory] = useState(existingRecord?.surgical_history || '');
  const [allergies, setAllergies] = useState(existingRecord?.allergies || '');
  const [currentMedications, setCurrentMedications] = useState(existingRecord?.current_medications || '');
  const [comorbidities, setComorbidities] = useState(existingRecord?.comorbidities || '');
  const [habits, setHabits] = useState(existingRecord?.habits || '');
  const [familyHistory, setFamilyHistory] = useState(existingRecord?.family_history || '');
  const [vitals, setVitals] = useState<VitalsData>(existingRecord?.vitals_json || {});
  const [physicalExam, setPhysicalExam] = useState(existingRecord?.physical_exam || '');
  const [assessment, setAssessment] = useState(existingRecord?.assessment || '');
  const [diagnosis, setDiagnosis] = useState(existingRecord?.diagnosis || '');
  const [cid10, setCid10] = useState(existingRecord?.cid10 || '');
  const [plan, setPlan] = useState(existingRecord?.plan || '');
  const [guidance, setGuidance] = useState(existingRecord?.guidance || '');
  const [returnInstructions, setReturnInstructions] = useState(existingRecord?.return_instructions || '');
  const [redFlags, setRedFlags] = useState(existingRecord?.red_flags || '');
  const [referrals, setReferrals] = useState(existingRecord?.referrals || '');
  const [examRequests, setExamRequests] = useState(existingRecord?.exam_requests || '');

  const isSigned = record?.status === 'SIGNED';

  const getFormData = useCallback(() => ({
    chief_complaint: chiefComplaint || undefined,
    hpi: hpi || undefined,
    personal_history: personalHistory || undefined,
    surgical_history: surgicalHistory || undefined,
    allergies: allergies || undefined,
    current_medications: currentMedications || undefined,
    comorbidities: comorbidities || undefined,
    habits: habits || undefined,
    family_history: familyHistory || undefined,
    vitals_json: Object.values(vitals).some(v => v !== undefined && v !== '') ? vitals : undefined,
    physical_exam: physicalExam || undefined,
    assessment: assessment || undefined,
    diagnosis: diagnosis || undefined,
    cid10: cid10 || undefined,
    plan: plan || undefined,
    guidance: guidance || undefined,
    return_instructions: returnInstructions || undefined,
    red_flags: redFlags || undefined,
    referrals: referrals || undefined,
    exam_requests: examRequests || undefined,
  }), [chiefComplaint, hpi, personalHistory, surgicalHistory, allergies, currentMedications, comorbidities, habits, familyHistory, vitals, physicalExam, assessment, diagnosis, cid10, plan, guidance, returnInstructions, redFlags, referrals, examRequests]);

  // Auto-save
  useEffect(() => {
    if (!dirty || isSigned) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, AUTOSAVE_DELAY);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [dirty, getFormData]);

  const markDirty = () => {
    if (!isSigned) setDirty(true);
  };

  const handleSave = async (isAutoSave = false) => {
    if (isSigned) return;
    try {
      setSaving(true);
      setError('');

      const formData = getFormData();

      let saved: MedicalRecord;
      if (record) {
        saved = await medicalRecordApiService.updateRecord(record.id, formData as UpdateRecordData);
      } else {
        saved = await medicalRecordApiService.createRecord({ ...formData, appointment_id: appointmentId } as CreateRecordData);
      }

      setRecord(saved);
      setDirty(false);
      setLastSaved(new Date());
      if (!isAutoSave) onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!record) {
      setError('Salve o prontuário antes de assinar');
      return;
    }
    if (!chiefComplaint.trim() || !assessment.trim() || !plan.trim()) {
      setError('Preencha os campos obrigatórios: Queixa principal, Avaliação e Plano/Conduta');
      return;
    }
    try {
      setSigning(true);
      setError('');
      // Save first
      await medicalRecordApiService.updateRecord(record.id, getFormData() as UpdateRecordData);
      const signed = await medicalRecordApiService.signRecord(record.id);
      setRecord(signed);
      onSigned?.(signed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao assinar');
    } finally {
      setSigning(false);
    }
  };

  const textareaClass = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[60px] disabled:opacity-50 disabled:bg-muted';
  const inputClass = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:bg-muted';
  const sectionTitle = 'text-sm font-semibold text-foreground mb-2 flex items-center gap-2';

  return (
    <div className="space-y-6">
      {isSigned && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" />
          Prontuário assinado em {record?.signed_at ? new Date(record.signed_at).toLocaleString('pt-BR') : ''}. Somente leitura.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Anamnese */}
      <section>
        <h4 className={sectionTitle}>Anamnese</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Queixa principal <span className="text-red-500">*</span>
            </label>
            <textarea value={chiefComplaint} onChange={(e) => { setChiefComplaint(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Descreva a queixa principal do paciente..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">História da doença atual (HDA)</label>
            <textarea value={hpi} onChange={(e) => { setHpi(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={3} placeholder="Descreva a história da doença atual..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Antecedentes pessoais</label>
              <textarea value={personalHistory} onChange={(e) => { setPersonalHistory(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Antecedentes cirúrgicos</label>
              <textarea value={surgicalHistory} onChange={(e) => { setSurgicalHistory(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Alergias</label>
              <textarea value={allergies} onChange={(e) => { setAllergies(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Alergias conhecidas..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Medicamentos em uso</label>
              <textarea value={currentMedications} onChange={(e) => { setCurrentMedications(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Medicamentos que o paciente usa..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Comorbidades</label>
              <textarea value={comorbidities} onChange={(e) => { setComorbidities(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Hábitos</label>
              <textarea value={habits} onChange={(e) => { setHabits(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Tabagismo, etilismo, exercícios..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Histórico familiar</label>
            <textarea value={familyHistory} onChange={(e) => { setFamilyHistory(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
          </div>
        </div>
      </section>

      {/* Sinais Vitais */}
      <section>
        <h4 className={sectionTitle}>Sinais Vitais</h4>
        <VitalsForm value={vitals} onChange={(v) => { setVitals(v); markDirty(); }} disabled={isSigned} />
      </section>

      {/* Exame / Avaliação */}
      <section>
        <h4 className={sectionTitle}>Exame e Avaliação</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Exame físico (tele)</label>
            <textarea value={physicalExam} onChange={(e) => { setPhysicalExam(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Observações do exame possível em teleconsulta..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Avaliação / Hipótese diagnóstica <span className="text-red-500">*</span>
            </label>
            <textarea value={assessment} onChange={(e) => { setAssessment(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Avaliação clínica e hipótese diagnóstica..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Diagnóstico</label>
              <textarea value={diagnosis} onChange={(e) => { setDiagnosis(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">CID-10</label>
              <input type="text" value={cid10} onChange={(e) => { setCid10(e.target.value); markDirty(); }} disabled={isSigned} className={inputClass} placeholder="Ex: J06.9" maxLength={10} />
            </div>
          </div>
        </div>
      </section>

      {/* Conduta */}
      <section>
        <h4 className={sectionTitle}>Conduta</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Plano terapêutico / Conduta <span className="text-red-500">*</span>
            </label>
            <textarea value={plan} onChange={(e) => { setPlan(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={3} placeholder="Descreva o plano de tratamento..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Orientações ao paciente</label>
            <textarea value={guidance} onChange={(e) => { setGuidance(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Retorno</label>
              <textarea value={returnInstructions} onChange={(e) => { setReturnInstructions(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Prazo e instruções de retorno..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Sinais de alerta (Red Flags)</label>
              <textarea value={redFlags} onChange={(e) => { setRedFlags(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} placeholder="Sinais de piora que o paciente deve observar..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Solicitação de exames</label>
              <textarea value={examRequests} onChange={(e) => { setExamRequests(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Encaminhamentos</label>
              <textarea value={referrals} onChange={(e) => { setReferrals(e.target.value); markDirty(); }} disabled={isSigned} className={textareaClass} rows={2} />
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      {!isSigned && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {lastSaved && `Salvo em ${lastSaved.toLocaleTimeString('pt-BR')}`}
            {dirty && !saving && ' (alterações não salvas)'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving || signing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar rascunho
            </button>
            <button
              onClick={handleSign}
              disabled={saving || signing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Assinar e finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
