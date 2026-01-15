import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Stethoscope } from 'lucide-react';
import { siteConfig } from '../config/content';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Detecta scroll para adicionar sombra
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const sectionId = path.substring(2);
      
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setMobileMenuOpen(false);
    } else if (path === '/planos') {
      e.preventDefault();
      
      if (location.pathname !== '/planos') {
        navigate('/planos');
        setTimeout(() => {
          const element = document.getElementById('planos');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        const element = document.getElementById('planos');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Como funciona', path: '/#como-funciona' },
    { name: 'Planos', path: '/planos' },
    { name: 'Quem Somos', path: '/sobre' },
    { name: 'Parceiros', path: '/parceiros' },
    { name: 'Cadastro Profissional', path: '/cadastro-profissional' },
  ];

  return (
    <header 
      className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center transition-transform hover:scale-105 duration-300"
          >
            <img 
              src="/assets/logo.png" 
              alt={siteConfig.name}
              className="h-9 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleAnchorClick(e, link.path)}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 group ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={isActive(link.path) ? { backgroundColor: siteConfig.colors.primary } : {}}
                onMouseEnter={(e) => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.backgroundColor = `${siteConfig.colors.secondary}15`;
                    e.currentTarget.style.color = siteConfig.colors.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                {link.name}
                {!isActive(link.path) && (
                  <span 
                    className="absolute bottom-0 left-1/2 w-0 h-0.5 group-hover:w-3/4 transition-all duration-300 -translate-x-1/2"
                    style={{ backgroundColor: siteConfig.colors.secondary }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <Link
              to="/login/paciente"
              className="group relative px-5 py-2 rounded-lg text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg overflow-hidden"
              style={{ backgroundColor: siteConfig.colors.cta }}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Acessar
              </span>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ backgroundColor: 'white' }}
              />
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-300 hover:shadow-md"
                style={{
                  borderColor: siteConfig.colors.primary,
                  color: siteConfig.colors.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${siteConfig.colors.primary}05`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Profissionais</span>
                <ChevronDown 
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    loginDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {loginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-fade-in-down">
                  <div className="px-3 py-1.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Área Profissional
                    </p>
                  </div>
                  <Link
                    to="/login/profissional"
                    className="group flex items-center gap-2.5 px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => setLoginDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${siteConfig.colors.secondary}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                    >
                      <User className="w-4 h-4" style={{ color: siteConfig.colors.secondary }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Profissional</p>
                      <p className="text-xs text-gray-500">Acesso geral</p>
                    </div>
                  </Link>
                  <Link
                    to="/login/medico"
                    className="group flex items-center gap-2.5 px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => setLoginDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${siteConfig.colors.secondary}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${siteConfig.colors.primary}20` }}
                    >
                      <Stethoscope className="w-4 h-4" style={{ color: siteConfig.colors.primary }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Médico</p>
                      <p className="text-xs text-gray-500">Área médica</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            className="lg:hidden p-1.5 rounded-lg transition-all duration-300 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: siteConfig.colors.primary }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-fade-in-down">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleAnchorClick(e, link.path)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path) ? 'text-white shadow-md' : 'text-gray-700'
                  }`}
                  style={isActive(link.path) ? { backgroundColor: siteConfig.colors.primary } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive(link.path)) {
                      e.currentTarget.style.backgroundColor = `${siteConfig.colors.secondary}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 mt-3 space-y-2.5 border-t border-gray-100">
                <Link
                  to="/login/paciente"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-sm text-center shadow-lg"
                  style={{ backgroundColor: siteConfig.colors.cta }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Acessar
                </Link>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login/profissional"
                    className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg text-center font-medium border-2 transition-all"
                    style={{ 
                      borderColor: `${siteConfig.colors.secondary}40`,
                      color: siteConfig.colors.secondary 
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-xs">Profissional</span>
                  </Link>
                  <Link
                    to="/login/medico"
                    className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg text-center font-medium border-2 transition-all"
                    style={{ 
                      borderColor: `${siteConfig.colors.primary}40`,
                      color: siteConfig.colors.primary 
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-xs">Médico</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
