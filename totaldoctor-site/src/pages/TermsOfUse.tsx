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
            Estes Termos de Uso definem as regras para acesso e utilização da plataforma {siteConfig.name}.
            Ao navegar no site ou contratar nossos serviços, você concorda com as condições abaixo.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                1. Aceitação dos termos
              </h2>
              <p>
                O uso da plataforma implica concordância integral com estes termos e com a Política de Privacidade.
                Caso não concorde com qualquer condição, recomendamos que não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                2. Cadastro e responsabilidade
              </h2>
              <p>
                O usuário se compromete a fornecer informações verdadeiras, atualizadas e completas durante o cadastro,
                sendo responsável pela guarda de suas credenciais de acesso e por toda atividade realizada em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                3. Uso adequado da plataforma
              </h2>
              <p>
                É proibido utilizar a plataforma para finalidades ilegais, fraudulentas ou que violem direitos de
                terceiros. Também é vedada qualquer tentativa de acesso não autorizado, engenharia reversa ou
                comprometimento da segurança do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                4. Propriedade intelectual
              </h2>
              <p>
                Todo o conteúdo disponibilizado na plataforma, incluindo marcas, textos, imagens e elementos visuais,
                pertence a {siteConfig.name} ou a seus licenciadores, sendo proibida sua reprodução sem autorização
                prévia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                5. Limitação de responsabilidade
              </h2>
              <p>
                A plataforma empenha melhores esforços para manter disponibilidade e segurança dos serviços, mas não
                garante ausência de indisponibilidades temporárias, falhas técnicas ou interrupções causadas por
                terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                6. Alterações destes termos
              </h2>
              <p>
                Estes termos podem ser atualizados periodicamente para refletir mudanças legais, operacionais ou
                técnicas. A versão mais recente estará sempre disponível nesta página.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                7. Contato
              </h2>
              <p>
                Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail {siteConfig.contact.email}.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
