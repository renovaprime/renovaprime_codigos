import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Check, Loader2, ExternalLink } from 'lucide-react';
import { Layout } from '../layout';
import { Card, Button, Input, Switch } from '../components';
import { doctorService } from '../services/doctorService';
import { uploadService } from '../services/uploadService';
import type { Specialty, DoctorFormData, Profession, RegistryType, UserStatus, DocumentType } from '../types/api';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface UploadState {
  url: string;
  signedUrl?: string;
  uploading: boolean;
  preview?: string;
  fileName?: string;
}

export function CadastroMedico() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState<'dados' | 'documentos'>('dados');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'ACTIVE',
    profession: 'MEDICO',
    registry_type: 'CRM',
    registry_number: '',
    registry_uf: '',
    rqe: '',
    specialty_ids: [],
    approved: false,
    photo_url: '',
    council_doc_url: '',
    specialization_doc_url: '',
    acceptance_term_url: ''
  });

  // Upload states
  const [uploads, setUploads] = useState<Record<DocumentType, UploadState>>({
    'photo': { url: '', uploading: false },
    'council-doc': { url: '', uploading: false },
    'specialization-doc': { url: '', uploading: false },
    'acceptance-term': { url: '', uploading: false }
  });

  useEffect(() => {
    loadSpecialties();
    if (isEditing && id) {
      loadDoctorData(parseInt(id));
    }
  }, [isEditing, id]);

  // Auto-ajustar registry_type baseado na profissão
  useEffect(() => {
    if (formData.profession === 'MEDICO') {
      setFormData(prev => ({ ...prev, registry_type: 'CRM' }));
    } else if (formData.profession === 'PSICOLOGO') {
      setFormData(prev => ({ ...prev, registry_type: 'CRP' }));
    } else if (formData.profession === 'NUTRICIONISTA') {
      setFormData(prev => ({ ...prev, registry_type: 'CFN' }));
    }
  }, [formData.profession]);

  const loadSpecialties = async () => {
    try {
      const data = await doctorService.listActiveSpecialties();
      setSpecialties(data);
    } catch (err) {
      setError('Erro ao carregar especialidades');
    }
  };

  const loadDoctorData = async (doctorId: number) => {
    try {
      setIsLoadingData(true);
      setError(null);
      const doctor = await doctorService.getDoctorById(doctorId);
      
      // Preencher formulário com dados do médico
      setFormData({
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        password: '', // Não carregar senha
        status: doctor.status || 'ACTIVE',
        profession: doctor.profession,
        registry_type: doctor.registry_type,
        registry_number: doctor.registry_number || '',
        registry_uf: doctor.registry_uf || '',
        rqe: doctor.rqe || '',
        specialty_ids: doctor.specialties?.map(s => s.id) || [],
        approved: !!doctor.approved_at,
        photo_url: doctor.photo_url || '',
        council_doc_url: doctor.council_doc_url || '',
        specialization_doc_url: doctor.specialization_doc_url || '',
        acceptance_term_url: doctor.acceptance_term_url || ''
      });

      // Buscar URLs assinadas para os documentos
      const signedUrls = await uploadService.getSignedUrlsForDoctor({
        photo_url: doctor.photo_url,
        council_doc_url: doctor.council_doc_url,
        specialization_doc_url: doctor.specialization_doc_url,
        acceptance_term_url: doctor.acceptance_term_url
      });

      // Preencher uploads com URLs existentes e URLs assinadas
      const uploadStates: Record<DocumentType, UploadState> = {
        'photo': {
          url: doctor.photo_url || '',
          signedUrl: signedUrls.photo_url,
          uploading: false,
          preview: signedUrls.photo_url,
          fileName: doctor.photo_url ? 'Arquivo existente' : undefined
        },
        'council-doc': {
          url: doctor.council_doc_url || '',
          signedUrl: signedUrls.council_doc_url,
          uploading: false,
          fileName: doctor.council_doc_url ? 'Arquivo existente' : undefined
        },
        'specialization-doc': {
          url: doctor.specialization_doc_url || '',
          signedUrl: signedUrls.specialization_doc_url,
          uploading: false,
          fileName: doctor.specialization_doc_url ? 'Arquivo existente' : undefined
        },
        'acceptance-term': {
          url: doctor.acceptance_term_url || '',
          signedUrl: signedUrls.acceptance_term_url,
          uploading: false,
          fileName: doctor.acceptance_term_url ? 'Arquivo existente' : undefined
        }
      };
      setUploads(uploadStates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do profissional');
      navigate('/profissionais');
    } finally {
      setIsLoadingData(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, documentType: DocumentType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    // Atualizar estado com nome do arquivo e iniciar upload
    setUploads(prev => ({ 
      ...prev, 
      [documentType]: { ...prev[documentType], fileName: file.name, uploading: true } 
    }));
    setError(null);

    try {
      const url = await uploadService.uploadDoctorDocument(file, documentType);
      
      // Buscar URL assinada para o arquivo recém-enviado
      const signedUrl = await uploadService.getSignedUrl(url);
      
      setUploads(prev => ({
        ...prev,
        [documentType]: { 
          ...prev[documentType], 
          url, 
          signedUrl: signedUrl || undefined,
          uploading: false,
          preview: file.type.startsWith('image/') ? signedUrl || undefined : prev[documentType].preview
        }
      }));

      // Atualizar formData
      const urlField = `${documentType.replace('-', '_')}_url` as keyof DoctorFormData;
      const updatedFormData = { ...formData, [urlField]: url };
      setFormData(updatedFormData);

      // Se estiver editando, atualizar automaticamente no backend
      if (isEditing && id) {
        try {
          const dataToUpdate = { ...updatedFormData };
          // Remover senha se vazia
          if (!dataToUpdate.password || dataToUpdate.password.trim() === '') {
            delete dataToUpdate.password;
          }
          await doctorService.updateDoctor(parseInt(id), dataToUpdate);
          setSuccessMessage('Documento enviado e profissional atualizado com sucesso!');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao atualizar profissional após upload');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setUploads(prev => ({ ...prev, [documentType]: { url: '', uploading: false } }));
    }
  };

  const removeFile = (documentType: DocumentType) => {
    setUploads(prev => ({
      ...prev,
      [documentType]: { url: '', signedUrl: undefined, uploading: false, preview: undefined, fileName: undefined }
    }));

    const urlField = `${documentType.replace('-', '_')}_url` as keyof DoctorFormData;
    setFormData(prev => ({ ...prev, [urlField]: '' }));
  };

  const handleSpecialtyToggle = (specialtyId: number) => {
    setFormData(prev => ({
      ...prev,
      specialty_ids: prev.specialty_ids.includes(specialtyId)
        ? prev.specialty_ids.filter(id => id !== specialtyId)
        : [...prev.specialty_ids, specialtyId]
    }));
  };

  const validate = (): boolean => {
    if (!formData.name || !formData.email || !formData.profession || !formData.registry_number) {
      setError('Preencha todos os campos obrigatórios');
      return false;
    }

    if (formData.specialty_ids.length === 0) {
      setError('Selecione pelo menos uma especialidade');
      return false;
    }

    // UF obrigatório para Médico e Psicólogo
    if ((formData.profession === 'MEDICO' || formData.profession === 'PSICOLOGO') && !formData.registry_uf) {
      setError('UF do registro é obrigatório para Médicos e Psicólogos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (configureSchedule = false) => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && id) {
        // Modo edição - remover senha se vazia
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password || dataToUpdate.password.trim() === '') {
          delete dataToUpdate.password;
        }
        await doctorService.updateDoctor(parseInt(id), dataToUpdate);
        setSuccessMessage('Profissional atualizado com sucesso!');
        setTimeout(() => navigate('/profissionais'), 2000);
      } else {
        // Modo criação
        const doctor = await doctorService.createDoctor(formData);
        setSuccessMessage(`Profissional cadastrado com sucesso!${doctor.temporary_password ? ` Senha temporária: ${doctor.temporary_password}` : ''}`);
        
        if (configureSchedule) {
          // TODO: Redirecionar para configuração de agenda
          setTimeout(() => navigate('/profissionais'), 2000);
        } else {
          setTimeout(() => navigate('/profissionais'), 2000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} profissional`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={isEditing ? "Editar Profissional" : "Cadastrar Profissional"}>
      <div className="space-y-6">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Check className="w-5 h-5" />
              {successMessage}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingData ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={() => navigate('/profissionais')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="font-display text-2xl text-foreground">
                    {isEditing ? 'Editar Profissional' : 'Cadastrar Profissional'}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {isEditing ? 'Atualize os dados do profissional' : 'Preencha os dados do profissional'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => navigate('/profissionais')}>
                  Cancelar
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </Button>
                {!isEditing && (
                  <Button onClick={() => handleSubmit(true)} disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar e configurar agenda
                  </Button>
                )}
              </div>
            </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <Card padding="sm">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('dados')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'dados'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dados do Profissional
            </button>
            <button
              onClick={() => setActiveTab('documentos')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'documentos'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Documentos
            </button>
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === 'dados' && (
          <div className="space-y-6">
            {/* Dados de Acesso */}
            <Card>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Dados de Acesso</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Nome completo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {isEditing ? 'Nova senha (opcional)' : 'Senha temporária'}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={isEditing ? 'Deixe em branco para não alterar' : 'Deixe em branco para gerar automaticamente'}
                      />
                      {!isEditing && (
                        <Button variant="secondary" onClick={generatePassword}>
                          Gerar
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as UserStatus }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="ACTIVE">Ativo</option>
                      <option value="BLOCKED">Bloqueado</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dados Profissionais */}
            <Card>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Dados Profissionais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Profissão <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.profession}
                      onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value as Profession }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="MEDICO">Médico</option>
                      <option value="PSICOLOGO">Psicólogo</option>
                      <option value="NUTRICIONISTA">Nutricionista</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Tipo de registro <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.registry_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, registry_type: e.target.value as RegistryType }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="CRM">CRM</option>
                      <option value="CRP">CRP</option>
                      <option value="CFN">CFN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Número do registro <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.registry_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, registry_number: e.target.value }))}
                      placeholder="123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      UF do registro {(formData.profession === 'MEDICO' || formData.profession === 'PSICOLOGO') && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={formData.registry_uf}
                      onChange={(e) => setFormData(prev => ({ ...prev, registry_uf: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecione</option>
                      {UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">RQE (opcional)</label>
                    <Input
                      value={formData.rqe}
                      onChange={(e) => setFormData(prev => ({ ...prev, rqe: e.target.value }))}
                      placeholder="RQE"
                    />
                  </div>
                </div>

                {/* Especialidades */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Especialidades <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                    {specialties.map(specialty => (
                      <label key={specialty.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.specialty_ids.includes(specialty.id)}
                          onChange={() => handleSpecialtyToggle(specialty.id)}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{specialty.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Aprovado */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Aprovar profissional?</label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Se aprovado, o profissional poderá acessar o sistema imediatamente
                    </p>
                  </div>
                  <Switch
                    checked={formData.approved}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, approved: checked }))}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'documentos' && (
          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Documentos</h2>

              {/* Foto do profissional */}
              <DocumentUpload
                label="Foto do profissional"
                documentType="photo"
                upload={uploads['photo']}
                onFileSelect={handleFileSelect}
                onRemove={removeFile}
              />

              {/* Documento do conselho */}
              <DocumentUpload
                label="Documento do conselho"
                documentType="council-doc"
                upload={uploads['council-doc']}
                onFileSelect={handleFileSelect}
                onRemove={removeFile}
              />

              {/* Comprovante especialidade/RQE */}
              <DocumentUpload
                label="Comprovante especialidade / RQE"
                documentType="specialization-doc"
                upload={uploads['specialization-doc']}
                onFileSelect={handleFileSelect}
                onRemove={removeFile}
              />

              {/* Termo de aceite */}
              <DocumentUpload
                label="Termo de aceite assinado"
                documentType="acceptance-term"
                upload={uploads['acceptance-term']}
                onFileSelect={handleFileSelect}
                onRemove={removeFile}
              />
            </div>
          </Card>
        )}
          </>
        )}
      </div>
    </Layout>
  );
}

interface DocumentUploadProps {
  label: string;
  documentType: DocumentType;
  upload: UploadState;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>, documentType: DocumentType) => void;
  onRemove: (documentType: DocumentType) => void;
}

function DocumentUpload({ label, documentType, upload, onFileSelect, onRemove }: DocumentUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      
      {!upload.url ? (
        <div className="relative">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={(e) => onFileSelect(e, documentType)}
            disabled={upload.uploading}
            className="hidden"
            id={`upload-${documentType}`}
          />
          <label
            htmlFor={`upload-${documentType}`}
            className={`flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors ${
              upload.uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {upload.uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Fazendo upload...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para fazer upload ou arraste o arquivo aqui
                </span>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
          {upload.preview ? (
            <img src={upload.preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
          ) : (
            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">PDF</span>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{upload.fileName || 'Arquivo enviado'}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <Check className="w-3 h-3" />
              Upload completo
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(upload.signedUrl || upload.url, '_blank')}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(documentType)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover arquivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
