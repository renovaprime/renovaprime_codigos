import { useState } from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { siteConfig } from '../../config/content';
import Card from '../Card';
import Button from '../Button';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Mensagem enviada! Entraremos em contato em breve.');
    setFormData({ name: '', email: '', whatsapp: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contato" className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteConfig.colors.primary }}
          >
            Entre em Contato
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tire suas dúvidas ou agende uma demonstração
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3
                className="text-2xl font-bold mb-6"
                style={{ color: siteConfig.colors.primary }}
              >
                Fale Conosco
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Nossa equipe responde rápido e está pronta para esclarecer suas dúvidas sobre nossos serviços e planos.
              </p>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold mb-6"
                style={{
                  backgroundColor: `${siteConfig.colors.cta}20`,
                  color: siteConfig.colors.cta
                }}
              >
                ⚡ Resposta rápida garantida
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                  >
                    <Phone className="w-6 h-6" style={{ color: siteConfig.colors.secondary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Telefone</p>
                    <p className="text-gray-600">{siteConfig.contact.phone}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${siteConfig.colors.secondary}20` }}
                  >
                    <Mail className="w-6 h-6" style={{ color: siteConfig.colors.secondary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">{siteConfig.contact.email}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = siteConfig.colors.cta;
                    e.target.style.boxShadow = `0 0 0 3px ${siteConfig.colors.cta}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = siteConfig.colors.cta;
                    e.target.style.boxShadow = `0 0 0 3px ${siteConfig.colors.cta}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = siteConfig.colors.cta;
                    e.target.style.boxShadow = `0 0 0 3px ${siteConfig.colors.cta}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition-all resize-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = siteConfig.colors.cta;
                    e.target.style.boxShadow = `0 0 0 3px ${siteConfig.colors.cta}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Enviar Mensagem</span>
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
