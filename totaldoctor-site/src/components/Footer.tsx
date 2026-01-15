import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { siteConfig } from '../config/content';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="/assets/logo.png" 
                alt={siteConfig.name}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              {siteConfig.tagline}
            </p>
            <div className="flex space-x-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{ backgroundColor: siteConfig.colors.secondary }}
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{ backgroundColor: siteConfig.colors.secondary }}
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{ backgroundColor: siteConfig.colors.secondary }}
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: siteConfig.colors.primary }}>
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/planos" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link to="/parceiros" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Parceiros
                </Link>
              </li>
              <li>
                <Link to="/cadastro-profissional" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Seja um Profissional
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: siteConfig.colors.primary }}>
              Serviços
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">Clínico Geral 24h</li>
              <li className="text-gray-600 text-sm">Especialistas</li>
              <li className="text-gray-600 text-sm">Psicólogos</li>
              <li className="text-gray-600 text-sm">Nutricionistas</li>
              <li className="text-gray-600 text-sm">Telemedicina</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: siteConfig.colors.primary }}>
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 mt-0.5" style={{ color: siteConfig.colors.secondary }} />
                <span className="text-gray-600 text-sm">{siteConfig.contact.phone}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 mt-0.5" style={{ color: siteConfig.colors.secondary }} />
                <span className="text-gray-600 text-sm">{siteConfig.contact.email}</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5" style={{ color: siteConfig.colors.secondary }} />
                <span className="text-gray-600 text-sm">{siteConfig.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            CNPJ: 00.000.000/0000-00 | Responsável Técnico: Dr. Nome Completo - CRM 00000
          </p>
        </div>
      </div>
    </footer>
  );
}
