import {
  Heart,
  Sparkles,
  Activity,
  Users,
  User,
  Brain,
  Baby,
  HeartPulse,
  Ear,
  Stethoscope,
  Bone,
  Siren,
} from 'lucide-react';
import { siteConfig, specialties } from '../../config/content';

const iconMap = {
  Heart,
  Sparkles,
  Activity,
  Users,
  User,
  Brain,
  Baby,
  HeartPulse,
  Ear,
  Stethoscope,
  Bone,
  Siren,
};

export default function Specialties() {
  return (
    <section id="especialidades" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            Especialidades Disponíveis
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mais de 12 especialidades médicas à sua disposição
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialties.map((specialty) => {
            const Icon = iconMap[specialty.icon as keyof typeof iconMap];
            return (
              <div
                key={specialty.name}
                className="bg-white rounded-xl border-2 border-gray-100 p-6 text-center transition-all hover:shadow-xl hover:-translate-y-1 hover:border-transparent"
                style={{
                  '--hover-border-color': siteConfig.colors.secondary,
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = siteConfig.colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(243 244 246)';
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                >
                  <Icon className="w-7 h-7" style={{ color: siteConfig.colors.secondary }} />
                </div>
                <h3 className="font-semibold text-gray-900">{specialty.name}</h3>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Além dessas especialidades, também oferecemos atendimento com{' '}
            <span className="font-semibold" style={{ color: siteConfig.colors.primary }}>
              Psicólogos e Nutricionistas
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
