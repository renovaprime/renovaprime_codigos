import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SidebarEmpresa } from './SidebarEmpresa';
import { HeaderEmpresa } from './HeaderEmpresa';

interface LayoutEmpresaProps {
  children: ReactNode;
  title?: string;
}

const COLLAPSED_KEY = 'sidebar_empresa_collapsed';

export function LayoutEmpresa({ children, title }: LayoutEmpresaProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true');

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarEmpresa
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <HeaderEmpresa onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-4 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
