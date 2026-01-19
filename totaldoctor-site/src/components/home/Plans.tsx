import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { siteConfig, plans } from '../../config/content';
import Card from '../Card';
import Button from '../Button';
import CheckoutModal from '../CheckoutModal';

interface SelectedPlan {
  id: number;
  name: string;
  price: number;
}

export default function Plans() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);

  const handleSelectPlan = (plan: typeof plans[0]) => {
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      price: plan.price
    });
    setIsCheckoutOpen(true);
  };

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            Nossos Planos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano perfeito para suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
                onClick={() => handleSelectPlan(plan)}
              >
                Assinar agora
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Dúvidas sobre os planos?{' '}
            <a
              href="#contato"
              className="font-semibold hover:underline"
              style={{ color: siteConfig.colors.cta }}
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
        />
      )}
    </section>
  );
}
