import { siteConfig, howItWorks } from '../../config/content';

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            Como Funciona
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acesse saúde de qualidade em apenas três passos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {howItWorks.map((item) => (
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
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
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
