import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  History,
  FileText,
  User,
  LogOut,
  X,
} from 'lucide-react';
import logoImage from '../assets/images/logo.png';

interface SidebarBeneficiarioProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { id: 'nav-beneficiary-appointments', name: 'Minhas consultas', href: '/beneficiario/consultas', icon: Calendar },
  { id: 'nav-beneficiary-history', name: 'Historico', href: '/beneficiario/historico', icon: History },
  { id: 'nav-beneficiary-prescriptions', name: 'Minhas receitas', href: '/beneficiario/receitas', icon: FileText },
  { id: 'nav-beneficiary-profile', name: 'Meu Perfil', href: '/beneficiario/perfil', icon: User },
];

export function SidebarBeneficiario({ isOpen, onClose }: SidebarBeneficiarioProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    navigate('/beneficiario/login');
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-6 py-6 border-b border-border/50">
        <div className="flex items-center w-full justify-center">
          <img 
            src={logoImage} 
            alt="TotalDoctor" 
            className="h-16 w-auto"
          />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.id}
              data-testid={item.id}
              to={item.href}
              onClick={onClose}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-gradient-primary text-white shadow-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-beneficiario-indicator"
                  className="absolute right-0 w-1 h-6 bg-white rounded-l-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border/50 space-y-3">
       
        <button
          data-testid="nav-beneficiary-logout"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-card border-r border-border/50">
        {sidebarContent}
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
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
