import { Clock, UserCog, Heart } from 'lucide-react';
import { siteConfig, services } from '../../config/content';
import Card from '../Card';

const iconMap = {
  Clock,
  UserCog,
  Heart,
};

export default function Services() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            Nossos Serviços
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cuidado completo para você e sua família, quando e onde você precisar
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

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/placeholder-app.png"
                alt="Aplicativo RenovaPrime"
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
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Imagem: Aplicativo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
