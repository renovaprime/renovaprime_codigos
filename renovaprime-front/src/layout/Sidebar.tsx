import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Clock,
  Calendar,
  History,
  Stethoscope,
  Users,
  X,
  Handshake,
  Building2,
  UserPlus,
  LogOut,
  User,
  FileText,
  ShoppingCart,
  Percent,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
} from 'lucide-react';
import logoImage from '../assets/images/logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  { id: 'nav-admin-dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'nav-admin-beneficiaries', name: 'Beneficiários', href: '/beneficiarios', icon: Users },
  { id: 'nav-admin-partners', name: 'Parceiros', href: '/parceiros', icon: Handshake },
  { id: 'nav-admin-branches', name: 'Filiais', href: '/filiais', icon: Building2 },
  { id: 'nav-admin-resellers', name: 'Revendedores', href: '/revendedores', icon: UserPlus },
  { id: 'nav-admin-professionals', name: 'Profissionais', href: '/profissionais', icon: UserCheck },
  { id: 'nav-admin-pending-requests', name: 'Solicitações Pendentes', href: '/solicitacoes-pendentes', icon: Clock },
  { id: 'nav-admin-appointments', name: 'Consultas', href: '/consultas', icon: Calendar },
  { id: 'nav-admin-history', name: 'Histórico de Atendimentos', href: '/historico', icon: History },
  { id: 'nav-admin-medical-records', name: 'Prontuários', href: '/prontuarios', icon: ClipboardList },
  { id: 'nav-admin-specialties', name: 'Especialidades', href: '/especialidades', icon: Stethoscope },
  { id: 'nav-admin-sales', name: 'Vendas', href: '/vendas', icon: ShoppingCart },
  { id: 'nav-admin-commissions', name: 'Comissões', href: '/comissoes', icon: Percent },
  { id: 'nav-admin-cms', name: 'Gestão de Conteúdo', href: '/cms', icon: FileText },
  // No app, essa área e logada com `ADMIN`. "Superadmin" aqui significa admin da area principal.
  { id: 'nav-admin-manual', name: 'Manual', href: '/admin/manual', icon: FileText },
  { id: 'nav-admin-profile', name: 'Meu Perfil', href: '/admin/perfil', icon: User },
];

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase();
  const canSeeManual = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

  const handleLogout = () => {
    onClose();
    navigate('/login');
  };

  const sidebarContent = (isCollapsed: boolean) => (
    <>
      <div className={`flex items-center justify-between px-6 py-6 border-b border-border/50 ${isCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center w-full justify-center ${isCollapsed ? 'overflow-hidden' : ''}`}>
          <img
            src={logoImage}
            alt="TotalDoctor"
            className={`w-auto transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-16'}`}
          />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {navigation.map((item) => {
          if (item.id === 'nav-admin-manual' && !canSeeManual) return null;
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.id}
              data-testid={item.id}
              to={item.href}
              onClick={onClose}
              title={isCollapsed ? item.name : undefined}
              className={`
                group flex items-center gap-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200 relative
                ${isCollapsed ? 'justify-center px-2' : 'px-3'}
                ${isActive
                  ? 'bg-gradient-primary text-white shadow-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-0 w-1 h-6 bg-white rounded-l-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={`py-4 border-t border-border/50 space-y-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button
          data-testid="nav-admin-logout"
          onClick={handleLogout}
          title={isCollapsed ? 'Sair' : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && 'Sair'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border/50 transition-all duration-300 ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        {sidebarContent(collapsed)}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border/50 rounded-full hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        >
          {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-card z-50 lg:hidden flex flex-col shadow-elevated-lg"
            >
              {sidebarContent(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
