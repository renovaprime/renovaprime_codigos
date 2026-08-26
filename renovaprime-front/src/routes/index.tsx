import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, ProtectedPartnerRoute } from '../components';
import {
  Login,
  LoginProfissional,
  Dashboard,
  Parceiros,
  Filiais,
  Revendedores,
  MedicosAtivos,
  CadastroMedico,
  MedicosPendentes,
  Consultas,
  Historico,
  Especialidades,
  Vendas,
  Comissoes,
  Beneficiarios,
  AdminPerfil,
  ProfissionalDashboard,
  ProfissionalConsultas,
  ProfissionalDisponibilidade,
  ProfissionalReceitas,
  ProfissionalHistorico,
  ProfissionalPerfil,
  ProfissionalProntuario,
  ProfissionalPacientes,
  ProfissionalManual,
  LoginBeneficiario,
  BeneficiarioConsultas,
  BeneficiarioHistorico,
  BeneficiarioReceitas,
  BeneficiarioAssinatura,
  BeneficiarioDependentes,
  BeneficiarioPerfil,
  BeneficiarioMeuProntuario,
  BeneficiarioManual,
  AdminCms,
  AdminProntuarios,
  LoginParceiro,
  ParceiroDashboard,
  ParceiroVendas,
  ParceiroComissoes,
  ParceiroPerfil,
  ParceiroFiliais,
  ParceiroRevendedores,
  ParceiroManual,
  AdminManual,
} from '../pages';
import { TeleconsultaMedico, TeleconsultaPaciente } from '../modules/teleconsult';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'medico', 'paciente']}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/parceiros',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Parceiros />
      </ProtectedRoute>
    ),
  },
  {
    path: '/filiais',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Filiais />
      </ProtectedRoute>
    ),
  },
  {
    path: '/revendedores',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Revendedores />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissionais',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <MedicosAtivos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissionais/cadastro',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CadastroMedico />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissionais/editar/:id',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CadastroMedico />
      </ProtectedRoute>
    ),
  },
  {
    path: '/solicitacoes-pendentes',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <MedicosPendentes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/consultas',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'medico', 'paciente']}>
        <Consultas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/historico',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'medico', 'paciente']}>
        <Historico />
      </ProtectedRoute>
    ),
  },
  {
    path: '/especialidades',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Especialidades />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiarios',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Beneficiarios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/vendas',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Vendas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/comissoes',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Comissoes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/perfil',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminPerfil />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/manual',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminManual />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cms',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminCms />
      </ProtectedRoute>
    ),
  },
  {
    path: '/prontuarios',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminProntuarios />
      </ProtectedRoute>
    ),
  },
  // Rotas do Profissional
  {
    path: '/profissional/login',
    element: <LoginProfissional />,
  },
  {
    path: '/profissional/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/consultas',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalConsultas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/disponibilidade',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalDisponibilidade />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/receitas',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalReceitas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/historico',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalHistorico />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/perfil',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalPerfil />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/pacientes',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalPacientes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/prontuario/:beneficiaryId',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalProntuario />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profissional/manual',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <ProfissionalManual />
      </ProtectedRoute>
    ),
  },
  // Rotas do Beneficiário
  {
    path: '/beneficiario/login',
    element: <LoginBeneficiario />,
  },
  {
    path: '/beneficiario/consultas',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioConsultas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/historico',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioHistorico />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/receitas',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioReceitas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/assinatura',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioAssinatura />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/dependentes',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioDependentes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/perfil',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioPerfil />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/prontuario',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioMeuProntuario />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/manual',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioManual />
      </ProtectedRoute>
    ),
  },
  // Rotas de Teleconsulta
  {
    path: '/profissional/teleconsulta/:appointmentId',
    element: (
      <ProtectedRoute allowedRoles={['medico']}>
        <TeleconsultaMedico />
      </ProtectedRoute>
    ),
  },
  {
    path: '/beneficiario/teleconsulta/:appointmentId',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <TeleconsultaPaciente />
      </ProtectedRoute>
    ),
  },
  // Rotas do Parceiro
  {
    path: '/parceiro/login',
    element: <LoginParceiro />,
  },
  {
    path: '/parceiro/dashboard',
    element: (
      <ProtectedPartnerRoute>
        <ParceiroDashboard />
      </ProtectedPartnerRoute>
    ),
  },
  {
    path: '/parceiro/vendas',
    element: (
      <ProtectedPartnerRoute>
        <ParceiroVendas />
      </ProtectedPartnerRoute>
    ),
  },
  {
    path: '/parceiro/comissoes',
    element: (
      <ProtectedPartnerRoute>
        <ParceiroComissoes />
      </ProtectedPartnerRoute>
    ),
  },
  {
    path: '/parceiro/perfil',
    element: (
      <ProtectedPartnerRoute>
        <ParceiroPerfil />
      </ProtectedPartnerRoute>
    ),
  },
  {
    path: '/parceiro/filiais',
    element: (
      <ProtectedPartnerRoute allowedTypes={['partner']}>
        <ParceiroFiliais />
      </ProtectedPartnerRoute>
    ),
  },
  {
    path: '/parceiro/revendedores',
    element: (
      <ProtectedPartnerRoute allowedTypes={['partner', 'branch']}>
        <ParceiroRevendedores />
      </ProtectedPartnerRoute>
    ),
  },
  {
    path: '/parceiro/manual',
    element: (
      <ProtectedPartnerRoute>
        <ParceiroManual />
      </ProtectedPartnerRoute>
    ),
  },
]);
