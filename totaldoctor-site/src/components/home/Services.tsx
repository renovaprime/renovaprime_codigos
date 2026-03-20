import { Clock, UserCog, Heart } from 'lucide-react';
import { siteConfig, services } from '../../config/content';
import { useCms } from '../../contexts/CmsContext';
import Card from '../Card';

const iconMap = {
  Clock,
  UserCog,
  Heart,
};

export default function Services() {
  const cms = useCms();

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ backgroundColor: siteConfig.colors.background }}
    >
      {/* Decorações sutis de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-48 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ backgroundColor: `${siteConfig.colors.secondary}2f` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-48 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ backgroundColor: `${siteConfig.colors.primary}18` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.25] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.12)_1px,transparent_0)] bg-[size:24px_24px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            {cms('services_title', 'Nossos Serviços')}
          </h2>
          <div
            aria-hidden="true"
            className="h-1.5 w-24 mx-auto -mt-2 mb-6 rounded-full"
            style={{ backgroundColor: `${siteConfig.colors.secondary}` }}
          />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {cms('services_subtitle', 'Cuidado completo para você e sua família, quando e onde você precisar')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div className="grid gap-8">
            {services.map((service) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap];
              return (
                <Card key={service.title} hover>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: siteConfig.colors.secondary }} />
                    </div>
                    <div>
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: siteConfig.colors.primary }}
                      >
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="relative flex items-center justify-center md:justify-end">
            <div className="relative mx-auto max-w-[360px] md:max-w-[420px] w-full">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] blur-3xl"
                style={{ backgroundColor: `${siteConfig.colors.secondary}22` }}
              />

              {/* Desenho/moldura do celular envolvendo o print */}
              <div
                className="relative rounded-[2.75rem] border border-black/5 bg-gradient-to-b from-white/80 to-white/50 p-4 shadow-2xl backdrop-blur transform-gpu md:rotate-[1deg] md:translate-y-1"
                style={{ boxShadow: `0 30px 80px rgba(0,0,0,0.12)` }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 right-4 top-3 h-14 rounded-3xl bg-gradient-to-b from-white/70 to-transparent"
                />

                {/* Pequenos detalhes do "notch/speaker" */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 top-5 z-10 h-[10px] w-28 rounded-full bg-black/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute right-[-2px] top-1/2 -translate-y-1/2 z-10 h-28 w-2 rounded-full bg-black/5"
                />

                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-black/5 to-black/10 ring-1 ring-black/5">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),transparent_45%)]"
                  />

                  <div
                    data-fallback
                    className="absolute inset-0 flex items-center justify-center px-6 text-gray-400 text-sm"
                  >
                    Imagem: Aplicativo
                  </div>

                  <img
                    src="/assets/renovaprimeapp.jpeg"
                    alt="Aplicativo RenovaPrime"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    onLoad={(e) => {
                      const fallbackEl =
                        e.currentTarget.parentElement?.querySelector(
                          '[data-fallback]'
                        ) as HTMLDivElement | null;
                      if (fallbackEl) fallbackEl.style.display = 'none';
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const screen = e.currentTarget.parentElement;
                      const fallbackEl =
                        screen?.querySelector('[data-fallback]') as HTMLDivElement | null;

                      if (fallbackEl) fallbackEl.style.display = 'flex';
                      if (screen) {
                        screen.style.backgroundColor = siteConfig.colors.secondary + '20';
                        screen.style.minHeight = '500px';
                        screen.style.display = 'flex';
                        screen.style.alignItems = 'center';
                        screen.style.justifyContent = 'center';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
