import { Layout } from '../../layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';

export function AdminManual() {
  return (
    <Layout>
      <div className="w-full mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary md:text-4xl">Manual do Sistema</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              A seguir, veja como funciona a parte de prontuários (com foco no uso do médico e do paciente).
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>O que é o prontuário?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O prontuário é o registro clínico de cada evolução de consulta. Ele reúne as informações da anamnese, exame
              e conduta. Ao final da consulta, o prontuário é finalizado por assinatura, ficando disponível para consulta histórica.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como o médico registra o prontuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">1) Abrir o prontuário durante a consulta</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Durante a teleconsulta, o médico tem acesso ao prontuário da consulta para registrar a evolução clínica.
                  Se o prontuário ainda não existir para aquela consulta, ele será criado quando o médico iniciar o registro.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">2) Registrar em formato de rascunho</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  O prontuário começa como rascunho. Nesse momento, o médico pode preencher as informações e ir salvando
                  sem precisar finalizar tudo de uma vez. O sistema também realiza salvamento automático para reduzir o
                  risco de perder informações durante a consulta.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-semibold text-foreground">Campos que o médico preenche</h2>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>
                    <b>Queixa principal</b> e <b>história da doença atual</b>.
                  </li>
                  <li>
                    <b>Antecedentes</b> (pessoais e cirúrgicos), <b>alergias</b>, <b>medicamentos em uso</b>, <b>comorbidades</b>,
                    <b>hábitos</b> e <b>histórico familiar</b>.
                  </li>
                  <li>
                    <b>Sinais vitais</b> (quando houver informação disponível).
                  </li>
                  <li>
                    <b>Exame</b> e <b>avaliação clínica</b>.
                  </li>
                  <li>
                    <b>Diagnóstico</b> e <b>CID-10</b> (se aplicável).
                  </li>
                  <li>
                    <b>Plano/conduta</b> e <b>orientações</b> ao paciente, incluindo retorno e alertas (quando houver).
                  </li>
                  <li>
                    <b>Solicitação de exames</b> e <b>encaminhamentos</b> (quando houver).
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Para assinar e finalizar, são considerados obrigatórios os campos de queixa principal, avaliação e plano/conduta.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">3) Assinar e finalizar</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Ao concluir a consulta, o médico deve assinar e finalizar o prontuário. A assinatura é o que torna o
                  prontuário definitivo para consulta posterior.
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Depois de assinado, o prontuário fica somente leitura: não é possível editar o conteúdo ou remover anexos.
                  Para ajustes após a assinatura, o sistema assume que a correção deve acontecer em uma nova evolução (quando aplicável).
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">4) Histórico e detalhes</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  O médico consegue visualizar o histórico de evoluções do paciente e abrir os detalhes de cada registro.
                  Assim, é possível acompanhar a linha clínica ao longo do tempo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como o paciente consulta o prontuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">1) Acesso ao prontuário</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  O paciente acessa seu prontuário em <b>Meu Prontuário</b>.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">2) O que aparece para o paciente</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  O paciente consegue ver apenas prontuários que foram assinados e finalizados pelo médico. Isso garante que
                  o conteúdo exibido e o registro definitivo daquela consulta.
                </p>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">3) Visualização dos detalhes</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Ao abrir uma evolução, o paciente visualiza as informações registradas (anamnese, exame e conduta) daquela consulta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo das regras importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>O prontuário é registrado durante a consulta e pode ser salvo como rascunho.</li>
              <li>Para finalizar, o médico precisa assinar o prontuário.</li>
              <li>Depois da assinatura, o prontuário fica somente leitura.</li>
              <li>O paciente só visualiza prontuários assinados.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

