import { siteConfig } from '../config/content';

export default function TermsOfUse() {
  return (
    <main>
      <section className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: siteConfig.colors.primary }}
          >
            Termos de Uso
          </h1>
          <p className="text-gray-600 mb-10">
            Estes Termos de Uso definem as regras para acesso e utilizacao da plataforma {siteConfig.name}.
            Ao navegar no site ou contratar nossos servicos, voce concorda com as condicoes abaixo.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                1. Aceitacao dos termos
              </h2>
              <p>
                O uso da plataforma implica concordancia integral com estes termos e com a Politica de Privacidade.
                Caso nao concorde com qualquer condicao, recomendamos que nao utilize nossos servicos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                2. Cadastro e responsabilidade
              </h2>
              <p>
                O usuario se compromete a fornecer informacoes verdadeiras, atualizadas e completas durante o cadastro,
                sendo responsavel pela guarda de suas credenciais de acesso e por toda atividade realizada em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                3. Uso adequado da plataforma
              </h2>
              <p>
                E proibido utilizar a plataforma para finalidades ilegais, fraudulentas ou que violem direitos de
                terceiros. Tambem e vedada qualquer tentativa de acesso nao autorizado, engenharia reversa ou
                comprometimento da seguranca do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                4. Propriedade intelectual
              </h2>
              <p>
                Todo o conteudo disponibilizado na plataforma, incluindo marcas, textos, imagens e elementos visuais,
                pertence a {siteConfig.name} ou a seus licenciadores, sendo proibida sua reproducao sem autorizacao
                previa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                5. Limitacao de responsabilidade
              </h2>
              <p>
                A plataforma empenha melhores esforcos para manter disponibilidade e seguranca dos servicos, mas nao
                garante ausencia de indisponibilidades temporarias, falhas tecnicas ou interrupcoes causadas por
                terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                6. Alteracoes destes termos
              </h2>
              <p>
                Estes termos podem ser atualizados periodicamente para refletir mudancas legais, operacionais ou
                tecnicas. A versao mais recente estara sempre disponivel nesta pagina.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                7. Contato
              </h2>
              <p>
                Em caso de duvidas sobre estes Termos de Uso, entre em contato pelo e-mail {siteConfig.contact.email}.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
