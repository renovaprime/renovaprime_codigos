import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Check, Loader2, ExternalLink, Stethoscope, FileText, Award, Shield, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { siteConfig } from '../config/content';
import { 
  professionalService, 
  type ProfessionalFormData, 
  type Specialty, 
  type DocumentType,
  type Profession,
  type RegistryType
} from '../services/professionalService';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Função para formatar telefone: (XX) XXXXX-XXXX
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

interface UploadState {
  url: string;
  uploading: boolean;
  preview?: string;
  fileName?: string;
}

export default function ProfessionalSignup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dados' | 'documentos'>('dados');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<ProfessionalFormData>({
    name: '',
    email: '',
    phone: '',
    profession: 'MEDICO',
    registry_type: 'CRM',
    registry_number: '',
    registry_uf: '',
    rqe: '',
    specialty_ids: [],
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
  }, []);

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
      const data = await professionalService.listActiveSpecialties();
      setSpecialties(data);
    } catch (err) {
      setError('Erro ao carregar especialidades');
    }
  };

  // Verifica se os dados profissionais estao completos
  const isDadosComplete = (): boolean => {
    return !!(
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.profession &&
      formData.registry_type &&
      formData.registry_number &&
      formData.registry_uf &&
      formData.specialty_ids.length > 0
    );
  };

  const handleTabChange = (tab: 'dados' | 'documentos') => {
    if (tab === 'documentos' && !isDadosComplete()) {
      setError('Preencha todos os dados profissionais antes de continuar para os documentos.');
      return;
    }
    setError(null);
    setActiveTab(tab);
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
      const url = await professionalService.uploadDocument(file, documentType);
      
      setUploads(prev => ({
        ...prev,
        [documentType]: { 
          ...prev[documentType], 
          url, 
          uploading: false,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : prev[documentType].preview
        }
      }));

      // Atualizar formData
      const urlField = `${documentType.replace('-', '_')}_url` as keyof ProfessionalFormData;
      setFormData(prev => ({ ...prev, [urlField]: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setUploads(prev => ({ ...prev, [documentType]: { url: '', uploading: false } }));
    }
  };

  const removeFile = (documentType: DocumentType) => {
    setUploads(prev => ({
      ...prev,
      [documentType]: { url: '', uploading: false, preview: undefined, fileName: undefined }
    }));

    const urlField = `${documentType.replace('-', '_')}_url` as keyof ProfessionalFormData;
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
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Preencha todos os campos obrigatórios');
      return false;
    }

    if (!formData.profession || !formData.registry_number || !formData.registry_uf) {
      setError('Preencha todos os dados profissionais obrigatórios');
      return false;
    }

    if (formData.specialty_ids.length === 0) {
      setError('Selecione pelo menos uma especialidade');
      return false;
    }

    if (!formData.photo_url || !formData.council_doc_url || !formData.specialization_doc_url || !formData.acceptance_term_url) {
      setError('Todos os documentos são obrigatórios');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      await professionalService.createProfessional(formData);
      setSuccessMessage('Cadastro enviado com sucesso! Você receberá um email quando for aprovado.');

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar cadastro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAcceptanceTermPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');

    const name = formData.name || '[NOME DO PROFISSIONAL]';
    const registryNumber = formData.registry_number || '[NUMERO DO REGISTRO]';
    const registryType = formData.registry_type || 'CRM';

    const pdfContent = [
      {
        text: 'TERMO DE ACEITE E CONTRATO DE PRESTACAO DE SERVICOS MEDICOS',
        bold: true,
      },
      { text: 'PARTES:', bold: true },
      {
        text: `De um lado, ${siteConfig.name.toUpperCase()}, pessoa juridica de direito privado, doravante denominada CONTRATANTE.`,
        bold: false,
      },
      {
        text: `De outro lado, o PROFISSIONAL PARCEIRO ${name}, profissional autonomo, registrado no ${registryType} sob o numero ${registryNumber}, doravante denominado "CONTRATADO".`,
        bold: false,
      },
      {
        text: 'As partes resolvem firmar o presente Termo de Aceite e Contrato de Prestacao de Servicos, mediante as seguintes clausulas e condicoes:',
        bold: false,
      },
      { text: 'CLAUSULA PRIMEIRA - OBJETO', bold: true },
      {
        text: '1.1. O presente contrato tem por objeto a prestacao de servicos pelo CONTRATADO, por meio da plataforma de telemedicina da CONTRATANTE, consistindo na realizacao de atendimentos online, conforme regulamentacao vigente do Conselho Federal de Medicina (CFM) e demais normas aplicaveis.',
        bold: false,
      },
      {
        text: 'CLAUSULA SEGUNDA - RESPONSABILIDADES DAS PARTES',
        bold: true,
      },
      {
        text: '2.1. O CONTRATADO se compromete a: (a) Realizar atendimentos com zelo, diligencia e dentro dos padroes eticos da profissao; (b) Cumprir as normas do CFM e legislacao vigente sobre telemedicina; (c) Manter sigilo absoluto sobre as informacoes obtidas durante as consultas; (d) Garantir a atualizacao de suas credenciais e documentacao profissional.',
        bold: false,
      },
      {
        text: '2.2. A CONTRATANTE se compromete a: (a) Disponibilizar a infraestrutura tecnologica necessaria para a realizacao dos atendimentos; (b) Garantir a seguranca e privacidade dos dados compartilhados na plataforma; (c) Efetuar o pagamento dos valores acordados, conforme estipulado na Clausula Quinta.',
        bold: false,
      },
      { text: 'CLAUSULA TERCEIRA - REGULAMENTACAO E SIGILO', bold: true },
      {
        text: '3.1. O CONTRATADO devera cumprir rigorosamente todas as normas eticas e regulatorias estabelecidas pelo CFM e demais orgaos competentes.',
        bold: false,
      },
      {
        text: '3.2. O CONTRATADO declara estar ciente de que todas as informacoes compartilhadas durante os atendimentos sao sigilosas e protegidas pela Lei Geral de Protecao de Dados Pessoais (LGPD).',
        bold: false,
      },
      { text: 'CLAUSULA QUARTA - VIGENCIA E RESCISAO', bold: true },
      {
        text: '4.1. O presente contrato tem vigencia por prazo indeterminado, podendo ser rescindido por qualquer das partes mediante aviso previo de 30 (trinta) dias.',
        bold: false,
      },
      {
        text: '4.2. A CONTRATANTE podera rescindir o contrato, a qualquer tempo, caso o CONTRATADO descumpra suas obrigacoes contratuais ou eticas.',
        bold: false,
      },
      { text: 'CLAUSULA QUINTA - REMUNERACAO E REPASSE', bold: true },
      {
        text: '5.1. O CONTRATADO recebera da CONTRATANTE a titulo de repasse pelos atendimentos realizados o valor de 37% do valor da consulta, ou sob demanda avulsa de consulta, conforme periodicidade e condicoes estabelecidas pela CONTRATANTE.',
        bold: false,
      },
      {
        text: '5.2. O pagamento sera realizado por meio de RPA, ate o Quinto dia do mes subsequente aos atendimentos prestados.',
        bold: false,
      },
      { text: 'CLAUSULA SEXTA - DISPOSICOES GERAIS', bold: true },
      {
        text: '6.1. O presente contrato nao caracteriza vinculo empregaticio entre as partes, sendo o CONTRATADO responsavel por suas obrigacoes fiscais e previdenciarias.',
        bold: false,
      },
      {
        text: '6.2. As partes elegem o foro da Comarca de Sao Paulo - SP, com renuncia a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer duvidas ou litigios oriundos do presente contrato.',
        bold: false,
      },
      {
        text: 'Por estar de acordo com as condicoes aqui estabelecidas, o CONTRATADO manifesta seu aceite eletronicamente por meio da plataforma.',
        bold: false,
      },
      { text: '', bold: false },
      { text: '[ ] LI E ACEITO OS TERMOS DO CONTRATO', bold: true },
      { text: '', bold: false },
      { text: `Data: ____/____/________`, bold: false },
      { text: '', bold: false },
      { text: `Assinatura: _________________________________`, bold: false },
      { text: `Nome: ${name}`, bold: false },
      { text: `${registryType}: ${registryNumber}`, bold: false },
    ];

    // Set initial font settings and starting Y position
    doc.setFontSize(12);
    let y = 60;
    const lineSpacing = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 40;
    const maxWidth = pageWidth - marginLeft * 2;

    // Add title/header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(siteConfig.name.toUpperCase(), pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(12);

    // Loop through each content object and add text to the PDF
    pdfContent.forEach((item) => {
      if (item.bold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(item.text, maxWidth);

      lines.forEach((line: string) => {
        if (y > 780) {
          doc.addPage();
          y = 40;
        }
        doc.text(line, marginLeft, y);
        y += lineSpacing;
      });

      y += lineSpacing / 2;
    });

    doc.save('termo-de-aceite.pdf');
  };

  return (
    <main>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div 
            className="text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ backgroundColor: siteConfig.colors.secondary }}
          >
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

        {/* Hero Section */}
        <section className="relative py-12 md:py-16" style={{ backgroundColor: siteConfig.colors.background }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{
                  backgroundColor: `${siteConfig.colors.secondary}20`,
                  color: siteConfig.colors.secondary
                }}
              >
                <Stethoscope className="w-4 h-4" />
                Cadastro Profissional
              </div>
              
              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ color: siteConfig.colors.primary }}
              >
                Junte-se à Nossa Equipe
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Faça parte da maior plataforma de telemedicina do Brasil e transforme a vida de milhares de pacientes
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                  >
                    <Award className="w-6 h-6" style={{ color: siteConfig.colors.secondary }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Flexibilidade</h3>
                  <p className="text-sm text-gray-600">Trabalhe de onde quiser</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${siteConfig.colors.cta}20` }}
                  >
                    <Shield className="w-6 h-6" style={{ color: siteConfig.colors.cta }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Segurança</h3>
                  <p className="text-sm text-gray-600">Plataforma certificada</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${siteConfig.colors.primary}20` }}
                  >
                    <FileText className="w-6 h-6" style={{ color: siteConfig.colors.primary }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Suporte Total</h3>
                  <p className="text-sm text-gray-600">Equipe dedicada</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5" />
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-100">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => handleTabChange('dados')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                    activeTab === 'dados'
                      ? 'text-white relative'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={activeTab === 'dados' ? {
                    backgroundColor: siteConfig.colors.primary
                  } : {}}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Dados Profissionais
                    {isDadosComplete() && <Check className="w-4 h-4" />}
                  </span>
                </button>
                <button
                  onClick={() => handleTabChange('documentos')}
                  className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                    activeTab === 'documentos'
                      ? 'text-white relative'
                      : !isDadosComplete()
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={activeTab === 'documentos' ? {
                    backgroundColor: siteConfig.colors.primary
                  } : {}}
                >
                  <span className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentos
                    {!isDadosComplete() && (
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                        Bloqueado
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dados' && (
              <div className="space-y-6">
                {/* Dados Pessoais */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                    >
                      <Stethoscope className="w-5 h-5" style={{ color: siteConfig.colors.secondary }} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: siteConfig.colors.primary }}>
                      Dados Pessoais
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome completo"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-opacity-100 transition-colors"
                        style={{ focusBorderColor: siteConfig.colors.primary }}
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setFormData(prev => ({ ...prev, phone: formatted }));
                        }}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Profissionais */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${siteConfig.colors.cta}20` }}
                    >
                      <Award className="w-5 h-5" style={{ color: siteConfig.colors.cta }} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: siteConfig.colors.primary }}>
                      Dados Profissionais
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profissão <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.profession}
                        onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value as Profession }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      >
                        <option value="MEDICO">Médico</option>
                        <option value="PSICOLOGO">Psicólogo</option>
                        <option value="NUTRICIONISTA">Nutricionista</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de registro <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.registry_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, registry_type: e.target.value as RegistryType }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      >
                        <option value="CRM">CRM</option>
                        <option value="CRP">CRP</option>
                        <option value="CFN">CFN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número do registro <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.registry_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, registry_number: e.target.value }))}
                        placeholder="123456"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        UF do registro <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.registry_uf}
                        onChange={(e) => setFormData(prev => ({ ...prev, registry_uf: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      >
                        <option value="">Selecione</option>
                        {UFS.map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">RQE (opcional)</label>
                      <input
                        type="text"
                        value={formData.rqe}
                        onChange={(e) => setFormData(prev => ({ ...prev, rqe: e.target.value }))}
                        placeholder="RQE"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors"
                        onFocus={(e) => e.target.style.borderColor = siteConfig.colors.primary}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Especialidades <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 max-h-96 overflow-y-auto gap-2">
                      {specialties.map(specialty => (
                        <button
                          key={specialty.id}
                          type="button"
                          onClick={() => handleSpecialtyToggle(specialty.id)}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                            formData.specialty_ids.includes(specialty.id)
                              ? 'border-transparent'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={
                            formData.specialty_ids.includes(specialty.id)
                              ? { 
                                  backgroundColor: `${siteConfig.colors.secondary}20`,
                                  color: siteConfig.colors.secondary,
                                  borderColor: siteConfig.colors.secondary
                                }
                              : { color: '#6B7280' }
                          }
                        >
                          <span className="text-sm">{specialty.name}</span>
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                              formData.specialty_ids.includes(specialty.id)
                                ? 'scale-100'
                                : 'scale-100 border-gray-300'
                            }`}
                            style={
                              formData.specialty_ids.includes(specialty.id)
                                ? {
                                    backgroundColor: siteConfig.colors.secondary,
                                    borderColor: siteConfig.colors.secondary
                                  }
                                : {}
                            }
                          >
                            {formData.specialty_ids.includes(specialty.id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botao Continuar */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleTabChange('documentos')}
                    disabled={!isDadosComplete()}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isDadosComplete()
                        ? 'text-white hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    style={isDadosComplete() ? { backgroundColor: siteConfig.colors.cta } : {}}
                  >
                    Continuar para Documentos
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'documentos' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${siteConfig.colors.primary}20` }}
                  >
                    <FileText className="w-5 h-5" style={{ color: siteConfig.colors.primary }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: siteConfig.colors.primary }}>
                    Documentos Obrigatórios
                  </h2>
                </div>

                <div className="space-y-6">
                  <DocumentUpload
                    label="Foto do profissional"
                    documentType="photo"
                    upload={uploads['photo']}
                    onFileSelect={handleFileSelect}
                    onRemove={removeFile}
                    primaryColor={siteConfig.colors.primary}
                    secondaryColor={siteConfig.colors.secondary}
                  />

                  <DocumentUpload
                    label="Documento do conselho"
                    documentType="council-doc"
                    upload={uploads['council-doc']}
                    onFileSelect={handleFileSelect}
                    onRemove={removeFile}
                    primaryColor={siteConfig.colors.primary}
                    secondaryColor={siteConfig.colors.secondary}
                  />

                  <DocumentUpload
                    label="Comprovante especialidade / RQE"
                    documentType="specialization-doc"
                    upload={uploads['specialization-doc']}
                    onFileSelect={handleFileSelect}
                    onRemove={removeFile}
                    primaryColor={siteConfig.colors.primary}
                    secondaryColor={siteConfig.colors.secondary}
                  />

                  {/* Termo de Aceite Section */}
                  <div
                    className="p-6 rounded-xl border-2"
                    style={{
                      backgroundColor: `${siteConfig.colors.cta}10`,
                      borderColor: `${siteConfig.colors.cta}40`
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${siteConfig.colors.cta}20` }}
                      >
                        <AlertCircle className="w-6 h-6" style={{ color: siteConfig.colors.cta }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">Termo de Aceite</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Antes de finalizar o cadastro, baixe o Termo de Aceite, leia atentamente,
                          assine e faca o upload do documento assinado no campo abaixo.
                        </p>
                        <button
                          type="button"
                          onClick={generateAcceptanceTermPDF}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg"
                          style={{ backgroundColor: siteConfig.colors.cta }}
                        >
                          <Download className="w-5 h-5" />
                          Baixar Termo de Aceite
                        </button>
                      </div>
                    </div>
                  </div>

                  <DocumentUpload
                    label="Termo de aceite assinado"
                    documentType="acceptance-term"
                    upload={uploads['acceptance-term']}
                    onFileSelect={handleFileSelect}
                    onRemove={removeFile}
                    primaryColor={siteConfig.colors.primary}
                    secondaryColor={siteConfig.colors.secondary}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 border-2 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                style={{ borderColor: '#E5E7EB' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: siteConfig.colors.cta }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Enviar Cadastro
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
    </main>
  );
}

interface DocumentUploadProps {
  label: string;
  documentType: DocumentType;
  upload: UploadState;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>, documentType: DocumentType) => void;
  onRemove: (documentType: DocumentType) => void;
  primaryColor: string;
  secondaryColor: string;
}

function DocumentUpload({ label, documentType, upload, onFileSelect, onRemove, primaryColor, secondaryColor }: DocumentUploadProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} <span className="text-red-500">*</span>
      </label>
      
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
            className={`flex flex-col items-center justify-center gap-3 w-full px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              upload.uploading 
                ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                : 'hover:bg-gray-50 hover:border-gray-400'
            }`}
            style={{ borderColor: upload.uploading ? '#E5E7EB' : primaryColor + '40' }}
          >
            {upload.uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                <span className="text-sm font-medium text-gray-600">Fazendo upload...</span>
              </>
            ) : (
              <>
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${secondaryColor}20` }}
                >
                  <Upload className="w-6 h-6" style={{ color: secondaryColor }} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    Clique para fazer upload
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou PDF • Máx. 5MB
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 border-2 rounded-xl bg-gray-50" style={{ borderColor: `${secondaryColor}40` }}>
          {upload.preview ? (
            <img src={upload.preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg shadow-sm" />
          ) : (
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-sm border-2" style={{ borderColor: `${primaryColor}20` }}>
              <FileText className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{upload.fileName || 'Arquivo enviado'}</p>
            <p className="text-xs font-medium flex items-center gap-1.5 mt-1" style={{ color: secondaryColor }}>
              <Check className="w-3.5 h-3.5" />
              Upload completo
            </p>
          </div>
          <div className="flex gap-2">
            {upload.url && (
              <button
                onClick={() => window.open(upload.url, '_blank')}
                className="p-2.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                style={{ color: primaryColor }}
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onRemove(documentType)}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
              title="Remover arquivo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
