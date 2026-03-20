import { siteConfig } from '../config/content';

export default function PrivacyPolicy() {
  return (
    <main>
      <section className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: siteConfig.colors.primary }}
          >
            Politica de Privacidade
          </h1>
          <p className="text-gray-600 mb-10">
            Esta Politica de Privacidade descreve como a {siteConfig.name} coleta, utiliza, armazena e protege os
            dados pessoais de usuarios e visitantes da plataforma.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                1. Dados coletados
              </h2>
              <p>
                Podemos coletar dados cadastrais, dados de contato e informacoes de navegacao necessarias para
                prestacao dos servicos, seguranca da conta e melhoria da experiencia do usuario.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                2. Finalidade do tratamento
              </h2>
              <p>
                Os dados sao tratados para viabilizar o atendimento, cumprir obrigacoes legais e regulatórias, prestar
                suporte, prevenir fraudes e aperfeicoar funcionalidades da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                3. Compartilhamento de dados
              </h2>
              <p>
                O compartilhamento ocorre apenas quando necessario para execucao dos servicos, cumprimento legal ou com
                parceiros que atuem sob obrigacao de confidencialidade e seguranca.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                4. Armazenamento e seguranca
              </h2>
              <p>
                Adotamos medidas tecnicas e administrativas para proteger os dados pessoais contra acesso nao
                autorizado, perda, alteracao ou divulgacao indevida.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                5. Direitos do titular
              </h2>
              <p>
                O titular pode solicitar confirmacao de tratamento, acesso, correcao, exclusao, portabilidade e demais
                direitos previstos na legislacao aplicavel, conforme os limites legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                6. Cookies e tecnologias similares
              </h2>
              <p>
                Utilizamos cookies para funcionamento da plataforma, metricas de desempenho e personalizacao de
                conteudo. O usuario pode gerenciar preferencias no navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                7. Atualizacoes desta politica
              </h2>
              <p>
                Esta politica pode ser revisada periodicamente. Recomendamos consulta regular para ciencia de eventuais
                alteracoes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                8. Contato
              </h2>
              <p>
                Para exercicio de direitos ou duvidas sobre privacidade, entre em contato pelo e-mail{' '}
                {siteConfig.contact.email}.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
