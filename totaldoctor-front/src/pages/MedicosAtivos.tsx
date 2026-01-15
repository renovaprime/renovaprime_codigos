import { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../layout';
import { Card, EmptyState, Button, Input, Badge, ConfirmModal } from '../components';
import { doctorService } from '../services/doctorService';
import type { Doctor } from '../types/api';

export function MedicosAtivos() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; doctor: Doctor | null }>({
    isOpen: false,
    doctor: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = doctors.filter((doctor) => {
        const name = doctor.name?.toLowerCase() || '';
        const email = doctor.email?.toLowerCase() || '';
        const registry = doctor.registry_number?.toLowerCase() || '';
        const specialtyNames = doctor.specialties?.map(s => s.name.toLowerCase()).join(' ') || '';
        
        return name.includes(term) || 
               email.includes(term) || 
               registry.includes(term) || 
               specialtyNames.includes(term);
      });
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await doctorService.listActiveDoctors();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDeleteModal({ isOpen: true, doctor });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.doctor) return;

    try {
      setIsDeleting(true);
      await doctorService.deleteDoctor(deleteModal.doctor.id);
      
      // Atualizar lista removendo o profissional deletado
      setDoctors(prev => prev.filter(d => d.id !== deleteModal.doctor?.id));
      setFilteredDoctors(prev => prev.filter(d => d.id !== deleteModal.doctor?.id));
      
      setDeleteModal({ isOpen: false, doctor: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir profissional');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, doctor: null });
    }
  };

  const getProfessionLabel = (profession: string) => {
    const labels: Record<string, string> = {
      'MEDICO': 'Médico',
      'PSICOLOGO': 'Psicólogo',
      'NUTRICIONISTA': 'Nutricionista'
    };
    return labels[profession] || profession;
  };

  const getRegistryLabel = (registryType: string, registryNumber: string, registryUf?: string) => {
    return `${registryType} ${registryNumber}${registryUf ? `/${registryUf}` : ''}`;
  };

  return (
    <Layout title="Profissionais">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Profissionais</h1>
            <p className="text-muted-foreground mt-1">Visualize e gerencie profissionais ativos na plataforma</p>
          </div>
          <Button onClick={() => navigate('/profissionais/cadastro')}>
            <Plus className="w-4 h-4" />
            Novo Profissional
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, registro ou especialidade..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : filteredDoctors.length === 0 ? (
          /* Empty State */
          <Card>
            <EmptyState
              icon={UserCheck}
              title={searchTerm ? 'Nenhum profissional encontrado' : 'Nenhum profissional ativo'}
              description={
                searchTerm
                  ? 'Tente ajustar sua busca'
                  : 'Profissionais ativos aparecerão aqui. Adicione novos profissionais ou aprove cadastros pendentes.'
              }
              action={
                !searchTerm ? (
                  <Button variant="secondary" onClick={() => navigate('/profissionais/cadastro')}>
                    <Plus className="w-4 h-4" />
                    Adicionar Profissional
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          /* Table */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Profissão
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Registro
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Especialidades
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Disponibilidade
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {getProfessionLabel(doctor.profession)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {getRegistryLabel(doctor.registry_type, doctor.registry_number, doctor.registry_uf)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {doctor.specialties && doctor.specialties.length > 0 ? (
                            doctor.specialties.slice(0, 2).map((specialty) => (
                              <Badge key={specialty.id} variant="default">
                                {specialty.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                          {doctor.specialties && doctor.specialties.length > 2 && (
                            <Badge variant="default">
                              +{doctor.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">
                          Não configurada
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={doctor.status === 'ACTIVE' ? 'success' : 'default'}>
                          {doctor.status === 'ACTIVE' ? 'Ativo' : doctor.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/profissionais/editar/${doctor.id}`)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(doctor)}
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Profissional"
        description={`Tem certeza que deseja excluir ${deleteModal.doctor?.name}? Esta ação não pode ser desfeita e todos os dados do profissional serão permanentemente removidos.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </Layout>
  );
}
