import { useParams, Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { siteConfig } from '../config/content';

export default function LoginPlaceholder() {
  const { type } = useParams<{ type: string }>();

  const titles = {
    paciente: 'Login de Paciente',
    profissional: 'Login de Profissional',
    medico: 'Login de Médico',
  };

  const title = titles[type as keyof typeof titles] || 'Login';

  return (
    <main>
      <section className="py-16 md:py-24 min-h-[70vh] flex items-center" style={{ backgroundColor: siteConfig.colors.background }}>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${siteConfig.colors.cta}20` }}
            >
              <LogIn className="w-8 h-8" style={{ color: siteConfig.colors.cta }} />
            </div>

            <h1
              className="text-3xl font-bold text-center mb-8"
              style={{ color: siteConfig.colors.primary }}
            >
              {title}
            </h1>

            <div className="text-center text-gray-600 mb-8">
              <p>Página de login em desenvolvimento.</p>
              <p className="text-sm mt-2">Em breve você poderá acessar sua conta.</p>
            </div>

            <Link
              to="/"
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md text-white"
              style={{ backgroundColor: siteConfig.colors.cta }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para Home</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
