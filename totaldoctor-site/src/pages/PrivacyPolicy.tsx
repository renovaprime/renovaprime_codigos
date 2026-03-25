import { Link } from 'react-router-dom';
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
            Política de Privacidade
          </h1>
          <p className="text-gray-600 mb-10">
            Esta Política de Privacidade descreve como a {siteConfig.name} coleta, utiliza, armazena e protege os
            dados pessoais de usuários e visitantes da plataforma.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                1. Dados coletados e Dados de Saúde (Health Data)
              </h2>
              <p>
                Além de dados cadastrais (nome, documento, e-mail, telefone) e informações de navegação, 
                nós coletamos e processamos Dados de Saúde. Isso inclui, mas não se limita a: 
                histórico médico, sintomas relatados, laudos, exames, diagnósticos, prescrições médicas 
                (receituários) e as informações trocadas entre médicos e pacientes durante as teleconsultas
                (seja por texto, áudio ou vídeo).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                2. Finalidade do tratamento dos Dados de Saúde
              </h2>
              <p>
                Os dados, especialmente os de saúde, são tratados exclusivamente para viabilizar a prestação dos serviços de telemedicina. Eles são usados para:
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>Conectar pacientes aos profissionais de saúde adequados;</li>
                  <li>Permitir o agendamento e a realização de consultas online;</li>
                  <li>Facilitar a emissão de receitas médicas e o controle de tratamentos;</li>
                  <li>Cumprir obrigações legais e regulatórias da área da saúde.</li>
                </ul>
                <br />
                Estes dados de saúde jamais são vendidos ou utilizados para fins de publicidade ou marketing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                3. Compartilhamento de dados
              </h2>
              <p>
                O compartilhamento ocorre apenas quando necessário para execução dos serviços, cumprimento legal ou com
                parceiros que atuem sob obrigação de confidencialidade e segurança.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                4. Armazenamento e segurança
              </h2>
              <p>
                Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acesso não
                autorizado, perda, alteração ou divulgação indevida.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                5. Direitos do titular
              </h2>
              <p>
                O titular pode solicitar confirmação de tratamento, acesso, correção, exclusão, portabilidade e demais
                direitos previstos na legislação aplicável, conforme os limites legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                6. Cookies e tecnologias similares
              </h2>
              <p>
                Utilizamos cookies para funcionamento da plataforma, métricas de desempenho e personalização de
                conteúdo. O usuário pode gerenciar preferências no navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                7. Atualizações desta política
              </h2>
              <p>
                Esta política pode ser revisada periodicamente. Recomendamos consulta regular para ciência de eventuais
                alterações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                8. Exclusão de conta e dados
              </h2>
              <p>
                Caso deseje solicitar a exclusão da sua conta e dos seus dados pessoais, acesse a página de{' '}
                <Link to="/exclusao-de-conta" className="font-semibold underline" style={{ color: siteConfig.colors.secondary }}>
                  exclusão de conta
                </Link>{' '}
                para ver o passo a passo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                9. Contato
              </h2>
              <p>
                Para exercício de direitos ou dúvidas sobre privacidade, entre em contato pelo e-mail{' '}
                {siteConfig.contact.email}.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
