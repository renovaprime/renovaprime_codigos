import { Quote, MessageCircle, Star } from 'lucide-react';
import { siteConfig, testimonials } from '../../config/content';
import Card from '../Card';

export default function Testimonials() {
  const hasTestimonials = testimonials && testimonials.length > 0;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            O Que Dizem Nossos Pacientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Histórias reais de quem confia na RenovaPrime
          </p>
        </div>

        {hasTestimonials ? (
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} hover>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${siteConfig.colors.cta}20` }}
                >
                  <Quote
                    className="w-6 h-6"
                    style={{ color: siteConfig.colors.cta }}
                  />
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.style.display = 'flex';
                          parent.style.alignItems = 'center';
                          parent.style.justifyContent = 'center';
                          parent.innerHTML = `<span class="text-lg font-bold" style="color: ${siteConfig.colors.secondary}">${testimonial.name.charAt(0)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                  >
                    <MessageCircle
                      className="w-10 h-10"
                      style={{ color: siteConfig.colors.secondary }}
                    />
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: siteConfig.colors.cta }}
                  >
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              </div>
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: siteConfig.colors.primary }}
              >
                Em breve, depoimentos de nossos pacientes
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Estamos construindo nossa base de clientes satisfeitos. Seja um dos primeiros a experimentar nossos serviços e compartilhar sua experiência!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: siteConfig.colors.cta }}></div>
                  <span>Atendimento humanizado</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: siteConfig.colors.cta }}></div>
                  <span>Profissionais qualificados</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: siteConfig.colors.cta }}></div>
                  <span>Tecnologia de ponta</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
