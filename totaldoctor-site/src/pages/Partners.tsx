import { Handshake, Building2, TrendingUp, Shield } from 'lucide-react';
import { siteConfig } from '../config/content';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Partners() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Crescimento Conjunto',
      description: 'Amplie sua base de clientes e fortaleça sua marca através da nossa rede de parceiros.',
    },
    {
      icon: Shield,
      title: 'Confiança e Credibilidade',
      description: 'Associe-se a uma marca reconhecida no mercado de telemedicina e saúde digital.',
    },
    {
      icon: Building2,
      title: 'Soluções Corporativas',
      description: 'Ofereça benefícios de saúde diferenciados para seus colaboradores.',
    },
    {
      icon: Handshake,
      title: 'Suporte Dedicado',
      description: 'Equipe especializada para dar todo o suporte necessário à parceria.',
    },
  ];

  const partnerTypes = [
    {
      title: 'Empresas',
      description: 'Ofereça telemedicina como benefício para seus colaboradores e reduza custos com planos de saúde.',
      features: ['Planos corporativos', 'Gestão simplificada', 'Relatórios de uso', 'Onboarding assistido'],
    },
    {
      title: 'Operadoras de Saúde',
      description: 'Integre nossa solução de telemedicina ao seu portfólio de serviços de saúde.',
      features: ['API de integração', 'Customização de marca', 'Dashboard gerencial', 'Suporte técnico'],
    },
    {
      title: 'Instituições de Ensino',
      description: 'Proporcione acesso facilitado à saúde para alunos, professores e funcionários.',
      features: ['Condições especiais', 'Atendimento 24h', 'Planos flexíveis', 'Suporte acadêmico'],
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
              Seja Nosso Parceiro
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Juntos, podemos transformar o acesso à saúde e criar soluções inovadoras
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/placeholder-partners.png"
                  alt="Parceiros TotalDoctor"
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
                  Imagem: Parceiros
                </div>
              </div>
            </div>

            <div>
              <div
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{
                  backgroundColor: `${siteConfig.colors.secondary}20`,
                  color: siteConfig.colors.secondary
                }}
              >
                Parcerias Estratégicas
              </div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: siteConfig.colors.primary }}
              >
                Por Que Ser Nosso Parceiro?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Na TotalDoctor, acreditamos no poder das parcerias estratégicas. Trabalhamos com empresas, instituições e profissionais que compartilham nossa visão de tornar a saúde mais acessível e de qualidade para todos.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Se você busca agregar valor aos seus serviços, oferecer benefícios diferenciados ou expandir seu alcance no mercado de saúde, uma parceria com a TotalDoctor pode ser a solução ideal.
              </p>
            </div>
          </div>

          <div className="mb-20">
            <h2
              className="text-3xl font-bold text-center mb-12"
              style={{ color: siteConfig.colors.primary }}
            >
              Benefícios da Parceria
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} hover>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: siteConfig.colors.secondary }} />
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: siteConfig.colors.primary }}
                    >
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mb-20">
            <h2
              className="text-3xl font-bold text-center mb-12"
              style={{ color: siteConfig.colors.primary }}
            >
              Tipos de Parceria
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {partnerTypes.map((type) => (
                <Card key={type.title} hover>
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    {type.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: siteConfig.colors.secondary }}
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: siteConfig.colors.primary }}
            >
              Interessado em uma Parceria?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Entre em contato com nossa equipe de parcerias e descubra como podemos trabalhar juntos para transformar o acesso à saúde.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contato">
                <Button size="lg">
                  Fale com Nossa Equipe
                </Button>
              </a>
              <a href={`mailto:${siteConfig.contact.email}`}>
                <Button variant="outline" size="lg">
                  Enviar Email
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
