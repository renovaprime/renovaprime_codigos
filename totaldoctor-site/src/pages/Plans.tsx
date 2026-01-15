import { Check, Star, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, plans } from '../config/content';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Plans() {
  const faqs = [
    {
      question: 'Como funciona a assinatura?',
      answer: 'Você escolhe o plano, realiza o pagamento mensal e tem acesso imediato à plataforma para agendar suas consultas.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas de cancelamento.',
    },
    {
      question: 'Quantas consultas posso fazer por mês?',
      answer: 'Não há limite de consultas. Você pode agendar quantas consultas precisar dentro das especialidades do seu plano.',
    },
    {
      question: 'O atendimento é realmente 24 horas?',
      answer: 'Sim, nosso clínico geral está disponível 24 horas por dia, 7 dias por semana para atendimentos de urgência.',
    },
  ];

  return (
    <main>
      <section className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }} id="planos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: siteConfig.colors.primary }}
            >
              Nossos Planos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Escolha o plano ideal para você e sua família. Sem carência, sem burocracia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.recommended ? 'scale-105' : ''
                }`}
                style={plan.recommended ? {
                  boxShadow: `0 0 0 4px white, 0 0 0 6px ${siteConfig.colors.cta}`
                } : {}}
                hover={!plan.recommended}
              >
                {plan.recommended && (
                  <div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-semibold flex items-center space-x-1"
                    style={{ backgroundColor: siteConfig.colors.cta }}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span>Mais Escolhido</span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-gray-600 text-lg">R$</span>
                    <span
                      className="text-5xl font-bold"
                      style={{ color: siteConfig.colors.primary }}
                    >
                      {plan.price.toFixed(2).split('.')[0]}
                    </span>
                    <span className="text-gray-600 text-lg">
                      ,{plan.price.toFixed(2).split('.')[1]}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">por mês</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: siteConfig.colors.secondary }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.recommended ? 'primary' : 'outline'}
                  className="w-full"
                >
                  Assinar Agora
                </Button>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
            <div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: siteConfig.colors.primary }}
              >
                Por Que Escolher a TotalDoctor?
              </h2>
              <div className="space-y-6">
                <Card>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Sem Carência
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Comece a usar imediatamente após a contratação. Não há período de carência para nenhuma especialidade.
                  </p>
                </Card>
                <Card>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Atendimento 24/7
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Clínico geral disponível 24 horas por dia, todos os dias da semana, incluindo feriados.
                  </p>
                </Card>
                <Card>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Receitas Digitais
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Receba suas receitas e laudos médicos de forma digital, com validade em todo território nacional.
                  </p>
                </Card>
                <Card>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: siteConfig.colors.primary }}
                  >
                    Histórico Completo
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tenha acesso ao histórico completo de suas consultas, receitas e exames em um só lugar.
                  </p>
                </Card>
              </div>
            </div>

            <div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: siteConfig.colors.primary }}
              >
                Perguntas Frequentes
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <div className="flex items-start space-x-3">
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                        style={{ backgroundColor: `${siteConfig.colors.cta}20` }}
                      >
                        <HelpCircle className="w-4 h-4" style={{ color: siteConfig.colors.cta }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: siteConfig.colors.primary }}
            >
              Ainda com Dúvidas?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Nossa equipe está pronta para ajudá-lo a escolher o melhor plano para suas necessidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#contato">
                <Button size="lg">
                  Falar com Especialista
                </Button>
              </Link>
              <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
