import { Mail, AlertCircle } from 'lucide-react';
import { siteConfig } from '../config/content';

export default function AccountDeletion() {
  return (
    <main>
      <section className="py-16 md:py-24" style={{ backgroundColor: siteConfig.colors.background }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: siteConfig.colors.primary }}
          >
            Exclusão de Conta e Dados
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Esta página orienta como solicitar a exclusão da sua conta e dos seus dados pessoais na plataforma{' '}
            {siteConfig.name}.
          </p>

          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: siteConfig.colors.primary }}>
              Como solicitar a exclusão
            </h2>
            <p className="text-gray-700 mb-4">
              Para iniciar o processo, envie um e-mail para:
            </p>

            <a
              href="mailto:contato@renovaprime.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20exclus%C3%A3o%20de%20conta"
              className="inline-flex items-center gap-2 font-semibold underline"
              style={{ color: siteConfig.colors.secondary }}
            >
              <Mail className="w-5 h-5" />
              contato@renovaprime.com.br
            </a>

            <div className="mt-6 text-gray-700">
              <p className="mb-2">No e-mail, inclua:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nome completo do titular da conta;</li>
                <li>E-mail cadastrado na plataforma;</li>
                <li>Telefone para contato (opcional);</li>
                <li>Assunto: "Solicitação de exclusão de conta".</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6 text-gray-700">
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: siteConfig.colors.primary }}>
                O que acontece após a solicitação
              </h2>
              <p>
                Nossa equipe analisará o pedido e poderá entrar em contato para validar identidade e garantir a
                segurança da solicitação. Após confirmação, a conta será desativada e os dados tratados conforme a
                legislação aplicável.
              </p>
            </div>

            <div className="rounded-xl p-4" style={{ backgroundColor: `${siteConfig.colors.secondary}15` }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: siteConfig.colors.secondary }} />
                <p className="text-sm">
                  Algumas informações podem ser mantidas por período mínimo necessário para cumprimento de obrigações
                  legais, regulatórias ou para defesa em processos, quando aplicável.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Em caso de dúvidas sobre privacidade e proteção de dados, entre em contato pelo e-mail acima.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
