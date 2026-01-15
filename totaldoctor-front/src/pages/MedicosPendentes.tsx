import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, Loader2, ExternalLink, X } from 'lucide-react';
import { Layout } from '../layout';
import { Card, EmptyState, Badge, Button, ConfirmModal } from '../components';
import { doctorService } from '../services/doctorService';
import { uploadService } from '../services/uploadService';
import type { Doctor } from '../types/api';

interface DocumentUrls {
  photo_url?: string;
  council_doc_url?: string;
  specialization_doc_url?: string;
  acceptance_term_url?: string;
}

interface DoctorWithSignedUrl extends Doctor {
  signedPhotoUrl?: string;
}

export function MedicosPendentes() {
  const [pendingDoctors, setPendingDoctors] = useState<DoctorWithSignedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [documentUrls, setDocumentUrls] = useState<DocumentUrls>({});
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | null;
    doctorId: number | null;
  }>({ isOpen: false, type: null, doctorId: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const loadPendingDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const doctors = await doctorService.listPendingDoctors();
      
      // Carregar URLs assinadas para todas as fotos
      const doctorsWithSignedUrls = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const signedUrl = await uploadService.getSignedUrl(doctor.photo_url || '');
            return { ...doctor, signedPhotoUrl: signedUrl || undefined };
          } catch {
            return doctor;
          }
        })
      );
      
      setPendingDoctors(doctorsWithSignedUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais pendentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocuments = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsLoadingUrls(true);
    
    try {
      const urls = await uploadService.getSignedUrlsForDoctor({
        photo_url: doctor.photo_url,
        council_doc_url: doctor.council_doc_url,
        specialization_doc_url: doctor.specialization_doc_url,
        acceptance_term_url: doctor.acceptance_term_url
      });
      setDocumentUrls(urls);
    } catch (err) {
      console.error('Erro ao carregar URLs assinadas:', err);
    } finally {
      setIsLoadingUrls(false);
    }
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setDocumentUrls({});
  };

  const handleApprove = async (doctorId: number) => {
    setActionLoading(doctorId);
    try {
      await doctorService.approveDoctor(doctorId);
      setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
      setSuccessMessage('Profissional aprovado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar profissional');
    } finally {
      setActionLoading(null);
      setConfirmModal({ isOpen: false, type: null, doctorId: null });
    }
  };

  const handleReject = async (doctorId: number) => {
    setActionLoading(doctorId);
    try {
      await doctorService.rejectDoctor(doctorId);
      setPendingDoctors(prev => prev.filter(d => d.id !== doctorId));
      setSuccessMessage('Cadastro reprovado');
      setTimeout(() => setSuccessMessage(null), 3000);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reprovar profissional');
    } finally {
      setActionLoading(null);
      setConfirmModal({ isOpen: false, type: null, doctorId: null });
    }
  };

  const openConfirmModal = (type: 'approve' | 'reject', doctorId: number) => {
    setConfirmModal({ isOpen: true, type, doctorId });
  };

  const handleConfirm = () => {
    if (confirmModal.doctorId && confirmModal.type === 'approve') {
      handleApprove(confirmModal.doctorId);
    } else if (confirmModal.doctorId && confirmModal.type === 'reject') {
      handleReject(confirmModal.doctorId);
    }
  };

  const getProfessionLabel = (doctor: Doctor) => {
    const professionMap = {
      MEDICO: 'Médico',
      PSICOLOGO: 'Psicólogo',
      NUTRICIONISTA: 'Nutricionista'
    };
    return `${professionMap[doctor.profession]} - ${doctor.registry_type}/${doctor.registry_uf || ''} ${doctor.registry_number}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calcular estatísticas (simuladas - idealmente viriam do backend)
  const approvedToday = 0; // TODO: implementar no backend
  const rejectedToday = 0; // TODO: implementar no backend

  return (
    <Layout title="Profissionais Pendentes">
      <div className="space-y-6">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Profissionais Pendentes</h1>
            <p className="text-muted-foreground mt-1">Aprove ou rejeite cadastros de novos profissionais</p>
          </div>
          <Badge variant="warning">{pendingDoctors.length} pendentes</Badge>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card interactive className="border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{approvedToday}</p>
                <p className="text-sm text-muted-foreground">Aprovados hoje</p>
              </div>
            </div>
          </Card>

          <Card interactive className="border-l-4 border-l-red-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{rejectedToday}</p>
                <p className="text-sm text-muted-foreground">Rejeitados hoje</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Profissionais Pendentes */}
        {isLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : pendingDoctors.length === 0 ? (
          <Card>
            <EmptyState
              icon={Clock}
              title="Nenhum cadastro pendente"
              description="Novos cadastros de profissionais aparecerão aqui para sua aprovação."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingDoctors.map(doctor => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Foto */}
                  <div className="flex-shrink-0">
                    {doctor.signedPhotoUrl ? (
                      <img
                        src={doctor.signedPhotoUrl}
                        alt={doctor.name}
                        className="w-24 h-32 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-2xl text-muted-foreground">
                          {doctor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
                        <p className="text-sm text-muted-foreground">{getProfessionLabel(doctor)}</p>
                      </div>
                      <Badge variant="warning">Pendente</Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <p>{doctor.email}</p>
                      {doctor.phone && <p>{doctor.phone}</p>}
                      <p>Cadastrado em: {formatDate(doctor.created_at)}</p>
                    </div>

                    {/* Especialidades */}
                    {doctor.specialties && doctor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {doctor.specialties.map(specialty => (
                          <Badge key={specialty.id} variant="primary">
                            {specialty.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDocuments(doctor)}
                      >
                        <Eye className="w-4 h-4" />
                        Ver Documentos
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openConfirmModal('approve', doctor.id)}
                        disabled={actionLoading === doctor.id}
                      >
                        {actionLoading === doctor.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Aprovar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openConfirmModal('reject', doctor.id)}
                        disabled={actionLoading === doctor.id}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reprovar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Documentos */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
            
            <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">{selectedDoctor.name}</h2>
                  <p className="text-sm text-muted-foreground">{getProfessionLabel(selectedDoctor)}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Dados Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="text-foreground font-medium">{selectedDoctor.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Telefone</p>
                      <p className="text-foreground font-medium">{selectedDoctor.phone || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">RQE</p>
                      <p className="text-foreground font-medium">{selectedDoctor.rqe || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Especialidades */}
                {selectedDoctor.specialties && selectedDoctor.specialties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.specialties.map(specialty => (
                        <Badge key={specialty.id} variant="primary">
                          {specialty.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documentos */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Documentos</h3>
                  {isLoadingUrls ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DocumentPreview
                        label="Foto do profissional"
                        url={documentUrls.photo_url}
                        isImage
                      />
                      <DocumentPreview
                        label="Documento do conselho"
                        url={documentUrls.council_doc_url}
                      />
                      <DocumentPreview
                        label="Comprovante especialidade/RQE"
                        url={documentUrls.specialization_doc_url}
                      />
                      <DocumentPreview
                        label="Termo de aceite"
                        url={documentUrls.acceptance_term_url}
                      />
                    </div>
                  )}
                </div>

                {/* Ações no Modal */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant="secondary"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openConfirmModal('reject', selectedDoctor.id)}
                    disabled={actionLoading === selectedDoctor.id}
                    className="flex-1 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reprovar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => openConfirmModal('approve', selectedDoctor.id)}
                    disabled={actionLoading === selectedDoctor.id}
                    className="flex-1"
                  >
                    {actionLoading === selectedDoctor.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Aprovar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: null, doctorId: null })}
          onConfirm={handleConfirm}
          title={confirmModal.type === 'approve' ? 'Aprovar profissional?' : 'Reprovar cadastro?'}
          description={
            confirmModal.type === 'approve'
              ? 'O profissional será aprovado e poderá acessar o sistema. Esta ação pode ser revertida posteriormente.'
              : 'O cadastro será reprovado e o profissional será bloqueado. Esta ação pode ser revertida posteriormente.'
          }
          confirmText={confirmModal.type === 'approve' ? 'Aprovar' : 'Reprovar'}
          variant={confirmModal.type === 'reject' ? 'danger' : 'default'}
          isLoading={actionLoading !== null}
        />
      </div>
    </Layout>
  );
}

interface DocumentPreviewProps {
  label: string;
  url?: string;
  isImage?: boolean;
}

function DocumentPreview({ label, url, isImage }: DocumentPreviewProps) {
  if (!url) {
    return (
      <div className="border border-border rounded-lg p-4">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <p className="text-xs text-muted-foreground">Documento não disponível</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Abrir em nova aba"
        >
          <ExternalLink className="w-4 h-4 text-primary" />
        </a>
      </div>
      {isImage ? (
        <img
          src={url}
          alt={label}
          className="w-full h-32 object-cover rounded"
        />
      ) : (
        <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
          <span className="text-sm text-muted-foreground">PDF</span>
        </div>
      )}
    </div>
  );
}
