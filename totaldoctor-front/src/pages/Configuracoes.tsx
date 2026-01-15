import { Settings, User, Bell, Shield, Palette, Database, Key, HelpCircle } from 'lucide-react';
import { Layout } from '../layout';
import { Card, Button, Input, Badge } from '../components';

export function Configuracoes() {
  return (
    <Layout title="Configuracoes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Configuracoes</h1>
            <p className="text-muted-foreground mt-1">Gerencie preferencias e configuracoes do sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card padding="sm">
              <nav className="space-y-1">
                {[
                  { icon: User, label: 'Perfil', active: true },
                  { icon: Bell, label: 'Notificacoes', active: false },
                  { icon: Shield, label: 'Seguranca', active: false },
                  { icon: Palette, label: 'Aparencia', active: false },
                  { icon: Database, label: 'Dados', active: false },
                  { icon: Key, label: 'API', active: false },
                  { icon: HelpCircle, label: 'Ajuda', active: false },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${item.active
                        ? 'bg-gradient-primary text-white shadow-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <h2 className="font-display text-xl text-foreground mb-6">Informacoes do Perfil</h2>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-accent">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <Button variant="secondary" size="sm">Alterar foto</Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome" placeholder="Seu nome" />
                <Input label="Email" type="email" placeholder="seu@email.com" />
                <Input label="Telefone" placeholder="(00) 00000-0000" />
                <Input label="Cargo" placeholder="Administrador" />
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-border">
                <Button>Salvar alteracoes</Button>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl text-foreground">Autenticacao em dois fatores</h2>
                  <p className="text-sm text-muted-foreground mt-1">Adicione uma camada extra de seguranca</p>
                </div>
                <Badge variant="warning">Desativado</Badge>
              </div>

              <Button variant="secondary">
                <Shield className="w-4 h-4" />
                Ativar 2FA
              </Button>
            </Card>

            <Card padding="lg">
              <h2 className="font-display text-xl text-foreground mb-4">Sessoes ativas</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Gerencie dispositivos conectados a sua conta
              </p>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Este dispositivo</p>
                      <p className="text-xs text-muted-foreground">Navegador atual - Ativo agora</p>
                    </div>
                  </div>
                  <Badge variant="success">Atual</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
