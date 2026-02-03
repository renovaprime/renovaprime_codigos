import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../../config/content';
import Button from '../Button';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.renovaprime.com.br';

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl"
          style={{ backgroundColor: siteConfig.colors.primary }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Comece agora com telemedicina de verdade
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Tenha acesso a médicos especialistas, clínico geral 24h e muito mais. Sua saúde merece o melhor cuidado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/planos">
                <Button
                  size="lg"
                  className="group flex items-center gap-2"
                  style={{
                    backgroundColor: siteConfig.colors.cta,
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(0, 188, 212, 0.3)'
                  }}
                >
                  <span>Ver planos</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href={`${APP_URL}/beneficiario/login`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                  style={{
                    color: siteConfig.colors.primary,
                    borderColor: 'white',
                    backgroundColor: 'white'
                  }}
                >
                  Já sou cliente
                </Button>
              </a>
            </div>
            <p className="text-sm text-blue-100 mt-6">
              ✓ Sem fidelidade • ✓ Cancele quando quiser • ✓ Suporte 24/7
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
