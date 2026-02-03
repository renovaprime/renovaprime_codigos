import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/content';
import Button from '../Button';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.renovaprime.com.br';

export default function Hero() {
  return (
    <section id="hero" className="relative py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: `${siteConfig.colors.secondary}20`,
                color: siteConfig.colors.secondary
              }}
            >
              Telemedicina 24 horas
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: siteConfig.colors.primary }}
            >
              Telemedicina 24h e Especialistas quando você precisar
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Atendimento rápido, seguro e no conforto da sua casa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/planos">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver planos
                </Button>
              </Link>

              <a href={`${APP_URL}/beneficiario/login`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Entrar como paciente
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-8 pt-6">
              <div>
                <p className="text-3xl font-bold" style={{ color: siteConfig.colors.cta }}>
                  24h
                </p>
                <p className="text-sm text-gray-600">Atendimento</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: siteConfig.colors.cta }}>
                  12+
                </p>
                <p className="text-sm text-gray-600">Especialidades</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: siteConfig.colors.cta }}>
                  100%
                </p>
                <p className="text-sm text-gray-600">Online</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/img4.png"
                alt="Médico em teleconsulta"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.backgroundColor = siteConfig.colors.secondary + '20';
                    parent.style.minHeight = '500px';
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                  }
                }}
              />
            </div>

            <div
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex items-center space-x-3"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: siteConfig.colors.cta }}
              >
                ✓
              </div>
              <div>
                <p className="font-bold text-gray-900">Atendimento Rápido</p>
                <p className="text-sm text-gray-600">Em poucos minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
