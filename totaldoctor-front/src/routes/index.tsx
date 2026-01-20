import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components';
import {
  Login,
  LoginProfissional,
  Dashboard,
  Parceiros,
  MedicosAtivos,
  CadastroMedico,
  MedicosPendentes,
  Consultas,
  Historico,
  Especialidades,
  Relatorios,
  GestaoSite,
  Configuracoes,
  Beneficiarios,
  AdminPerfil,
  ProfissionalDashboard,
  ProfissionalConsultas,
  ProfissionalDisponibilidade,
  ProfissionalReceitas,
  ProfissionalHistorico,
  ProfissionalPerfil,
  LoginBeneficiario,
  BeneficiarioConsultas,
  BeneficiarioHistorico,
  BeneficiarioReceitas,
  BeneficiarioPerfil,
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
    path: '/relatorios',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Relatorios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gestao-site',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <GestaoSite />
      </ProtectedRoute>
    ),
  },
  {
    path: '/configuracoes',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'medico', 'paciente']}>
        <Configuracoes />
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
    path: '/beneficiario/perfil',
    element: (
      <ProtectedRoute allowedRoles={['paciente']}>
        <BeneficiarioPerfil />
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
]);
