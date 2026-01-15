import { Globe, FileText, Image, Settings, Link, Eye } from 'lucide-react';
import { Layout } from '../layout';
import { Card, Button, Badge } from '../components';

export function GestaoSite() {
  return (
    <Layout title="Gestao do Site">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">Gestao do Site</h1>
            <p className="text-muted-foreground mt-1">Gerencie conteudo e configuracoes do site publico</p>
          </div>
          <Button variant="secondary">
            <Eye className="w-4 h-4" />
            Visualizar Site
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: FileText, label: 'Paginas', description: 'Gerencie paginas do site', count: '0 paginas' },
            { icon: Image, label: 'Midias', description: 'Biblioteca de imagens e arquivos', count: '0 arquivos' },
            { icon: Link, label: 'Links', description: 'Links rapidos e redirecionamentos', count: '0 links' },
            { icon: Settings, label: 'SEO', description: 'Otimizacao para buscadores', status: 'Configurar' },
            { icon: Globe, label: 'Dominio', description: 'Configuracoes de dominio', status: 'Ativo' },
          ].map((item) => (
            <Card key={item.label} interactive className="cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-accent group-hover:shadow-accent-lg transition-shadow">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant={item.status === 'Ativo' ? 'success' : 'default'}>
                  {item.count || item.status}
                </Badge>
              </div>
              <h3 className="font-display text-lg text-foreground mb-1">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-foreground">Estatisticas do Site</h2>
            <Badge variant="primary">Ultimo mes</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Visitantes', value: '0' },
              { label: 'Paginas vistas', value: '0' },
              { label: 'Taxa de rejeicao', value: '0%' },
              { label: 'Tempo medio', value: '0:00' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-display text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
