import { Target, Eye, Award, Users } from 'lucide-react';
import { siteConfig } from '../config/content';
import Card from '../components/Card';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Missão',
      description: 'Democratizar o acesso à saúde de qualidade através da telemedicina, proporcionando atendimento médico acessível, rápido e humanizado para todos.',
    },
    {
      icon: Eye,
      title: 'Visão',
      description: 'Ser referência nacional em telemedicina, reconhecida pela excelência no atendimento e inovação tecnológica na área da saúde.',
    },
    {
      icon: Award,
      title: 'Valores',
      description: 'Ética, qualidade, acessibilidade, inovação e compromisso com a saúde e bem-estar dos nossos pacientes.',
    },
    {
      icon: Users,
      title: 'Equipe',
      description: 'Profissionais altamente qualificados e comprometidos em oferecer o melhor atendimento médico com tecnologia de ponta.',
    },
  ];

  return (
    <main>
      <section className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: siteConfig.colors.primary }}
            >
              Quem Somos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Somos uma plataforma de telemedicina comprometida em revolucionar o acesso à saúde no Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{
                  backgroundColor: `${siteConfig.colors.secondary}20`,
                  color: siteConfig.colors.secondary
                }}
              >
                Nossa História
              </div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: siteConfig.colors.primary }}
              >
                Transformando o Cuidado com a Saúde
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  A RenovaPrime nasceu com o propósito de tornar o atendimento médico mais acessível e conveniente para todos os brasileiros. Entendemos que a saúde não pode esperar e que nem sempre é possível se deslocar até um consultório.
                </p>
                <p>
                  Com uma equipe de profissionais experientes e tecnologia de ponta, oferecemos consultas médicas por vídeo com a mesma qualidade do atendimento presencial, mas com muito mais praticidade e agilidade.
                </p>
                <p>
                  Nosso compromisso é proporcionar um atendimento humanizado, seguro e de qualidade, 24 horas por dia, 7 dias por semana, para que você e sua família tenham acesso à saúde quando mais precisarem.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/placeholder-app.png"
                  alt="Plataforma RenovaPrime"
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
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  Imagem: Plataforma RenovaPrime
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} hover>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${siteConfig.colors.cta}20` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: siteConfig.colors.cta }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p
                  className="text-5xl font-bold mb-2"
                  style={{ color: siteConfig.colors.cta }}
                >
                  50k+
                </p>
                <p className="text-gray-600 font-medium">Pacientes Atendidos</p>
              </div>
              <div>
                <p
                  className="text-5xl font-bold mb-2"
                  style={{ color: siteConfig.colors.cta }}
                >
                  100+
                </p>
                <p className="text-gray-600 font-medium">Profissionais de Saúde</p>
              </div>
              <div>
                <p
                  className="text-5xl font-bold mb-2"
                  style={{ color: siteConfig.colors.cta }}
                >
                  24/7
                </p>
                <p className="text-gray-600 font-medium">Atendimento Disponível</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
