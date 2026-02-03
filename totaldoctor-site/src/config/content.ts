export const siteConfig = {
  name: 'RenovaPrime',
  tagline: 'Telemedicina completa para você e sua família',
  description: 'Atendimento médico 24h por telemedicina com clínico geral, especialistas, psicólogos e nutricionistas.',

  colors: {
    primary: '#1A4B84',
    secondary: '#26A69A',
    cta: '#00BCD4',
    background: '#F4F7F9',
  },

  contact: {
    phone: '(11) 98765-4321',
    email: 'contato@renovaprime.com.br',
    whatsapp: '5511987654321',
    address: 'São Paulo, SP',
  },

  social: {
    facebook: 'https://facebook.com/renovaprime',
    instagram: 'https://instagram.com/renovaprime',
    tiktok: 'https://tiktok.com/@renovaprime',
  },
};

export const specialties = [
  { name: 'Cardiologia', icon: 'Heart' },
  { name: 'Dermatologia', icon: 'Sparkles' },
  { name: 'Endocrinologia', icon: 'Activity' },
  { name: 'Geriatria', icon: 'Users' },
  { name: 'Ginecologia', icon: 'User' },
  { name: 'Neurologia', icon: 'Brain' },
  { name: 'Pediatria', icon: 'Baby' },
  { name: 'Psiquiatria', icon: 'HeartPulse' },
  { name: 'Otorrino', icon: 'Ear' },
  { name: 'Urologia', icon: 'Stethoscope' },
  { name: 'Ortopedia', icon: 'Bone' },
  { name: 'Traumatologia', icon: 'Siren' },
];

export const plans = [
  {
    id: 1,
    name: 'Individual',
    price: 39.90,
    features: [
      'Clínico Geral 24h',
      'Atendimento por vídeo',
      'Receitas digitais',
      'Histórico médico',
    ],
    recommended: false,
  },
  {
    id: 2,
    name: 'Individual Premium',
    price: 59.90,
    features: [
      'Clínico Geral 24h',
      'Todos os Especialistas',
      'Psicólogo 24h',
      'Nutricionista 24h',
      'Atendimento por vídeo',
      'Receitas e laudos digitais',
    ],
    recommended: true,
  },
  {
    id: 3,
    name: 'Familiar Master',
    price: 84.90,
    features: [
      'Tudo do Premium',
      '+ 3 integrantes da família',
      'Atendimento pediátrico',
      'Acompanhamento familiar',
      'Gerenciamento centralizado',
    ],
    recommended: false,
  },
];

export const services = [
  {
    title: 'Clínico Geral 24h',
    description: 'Atendimento imediato com médicos clínicos gerais, disponível 24 horas por dia, 7 dias por semana.',
    icon: 'Clock',
  },
  {
    title: 'Especialistas',
    description: 'Acesso a mais de 12 especialidades médicas para cuidar da sua saúde de forma completa.',
    icon: 'UserCog',
  },
  {
    title: 'Psicólogo e Nutricionista',
    description: 'Cuidado integral com sua saúde mental e nutricional, com profissionais qualificados.',
    icon: 'Heart',
  },
];

export const howItWorks = [
  {
    step: 1,
    title: 'Escolha um plano',
    description: 'Selecione o plano ideal para você e sua família com total flexibilidade.',
  },
  {
    step: 2,
    title: 'Faça login e agende',
    description: 'Acesse sua conta e escolha o especialista e horário que melhor se encaixa na sua rotina.',
  },
  {
    step: 3,
    title: 'Realize a consulta online',
    description: 'Conecte-se por vídeo de onde estiver, com segurança e qualidade profissional.',
  },
];

export const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Cliente desde 2023',
    content: 'Excelente serviço! Consegui atendimento rápido quando mais precisei. Recomendo muito!',
    avatar: '/assets/placeholder-avatar-1.png',
  },
  {
    name: 'João Santos',
    role: 'Plano Familiar',
    content: 'A praticidade de ter atendimento médico para toda família pelo celular mudou nossa rotina.',
    avatar: '/assets/placeholder-avatar-2.png',
  },
  {
    name: 'Ana Costa',
    role: 'Plano Premium',
    content: 'Profissionais qualificados e atendimento humanizado. Me sinto muito bem cuidada.',
    avatar: '/assets/placeholder-avatar-3.png',
  },
];
