import { siteConfig } from '../../config/content';
import { useCms } from '../../contexts/CmsContext';

const defaultSteps = [
  { step: 1, titleKey: 'how_step_1_title', textKey: 'how_step_1_text', fallbackTitle: 'Escolha um plano', fallbackText: 'Selecione o plano ideal para você e sua família com total flexibilidade.' },
  { step: 2, titleKey: 'how_step_2_title', textKey: 'how_step_2_text', fallbackTitle: 'Faça login e agende', fallbackText: 'Acesse sua conta e escolha o especialista e horário que melhor se encaixa na sua rotina.' },
  { step: 3, titleKey: 'how_step_3_title', textKey: 'how_step_3_text', fallbackTitle: 'Realize a consulta online', fallbackText: 'Conecte-se por vídeo de onde estiver, com segurança e qualidade profissional.' },
];

export default function HowItWorks() {
  const cms = useCms();

  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            {cms('how_it_works_title', 'Como Funciona')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {cms('how_it_works_subtitle', 'Acesse saúde de qualidade em apenas três passos')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {defaultSteps.map((item) => (
              <div key={item.step} className="flex gap-6">
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                  style={{ backgroundColor: siteConfig.colors.cta }}
                >
                  {item.step}
                </div>
                <div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    {cms(item.titleKey, item.fallbackTitle)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {cms(item.textKey, item.fallbackText)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/img5.png"
                alt="Teleconsulta em andamento"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.backgroundColor = siteConfig.colors.secondary + '20';
                    parent.style.minHeight = '400px';
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
