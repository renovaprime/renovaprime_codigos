# TotalDoctor - Site Institucional

Site institucional de telemedicina com foco em conversão e usabilidade.

## Sobre o Projeto

Site responsivo desenvolvido para a TotalDoctor, plataforma de telemedicina que oferece atendimento médico 24h com clínico geral, especialistas, psicólogos e nutricionistas.

## Padrão de Cores

O projeto utiliza um padrão de cores específico e obrigatório:

- **Azul Oceano** (#1A4B84) - Títulos, header e elementos principais
- **Verde Água** (#26A69A) - Ícones, badges e detalhes de destaque
- **Ciano Vivo** (#00BCD4) - Botões principais e CTAs
- **Cinza Gelo** (#F4F7F9) - Background geral

## Páginas

1. **Home** (`/`) - Página principal com todas as seções
2. **Quem Somos** (`/sobre`) - História, missão, visão e valores
3. **Parceiros** (`/parceiros`) - Informações sobre parcerias
4. **Planos** (`/planos`) - Detalhamento dos planos disponíveis
5. **Cadastro Profissional** (`/cadastro-profissional`) - Em breve

## Estrutura do Projeto

```
src/
├── components/
│   ├── home/           # Componentes específicos da home
│   ├── Header.tsx      # Cabeçalho com navegação
│   ├── Footer.tsx      # Rodapé com links e contato
│   ├── Button.tsx      # Botão reutilizável
│   └── Card.tsx        # Card reutilizável
├── pages/              # Páginas do site
├── config/
│   └── content.ts      # Configurações e conteúdo
└── App.tsx             # Configuração de rotas

public/
└── assets/             # Placeholders de imagens
```

## Funcionalidades

- Layout responsivo (desktop + mobile)
- Navegação com dropdown para diferentes tipos de login
- Formulário de contato funcional
- Sistema de planos com destaque para o mais escolhido
- Seções de especialidades e serviços
- Footer completo com redes sociais
- Placeholders para imagens

## Tecnologias

- React 18
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React (ícones)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Verificação de Tipos

```bash
npm run typecheck
```

## Imagens Placeholder

As imagens devem ser adicionadas na pasta `public/assets/`. Consulte o arquivo `public/assets/README.md` para a lista completa de imagens necessárias.

## Edição de Conteúdo

Todo o conteúdo editável está centralizado em `src/config/content.ts`:

- Informações da empresa
- Especialidades médicas
- Planos e preços
- Serviços oferecidos
- Depoimentos
- Dados de contato

## Responsividade

O site é totalmente responsivo com breakpoints para:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## Acessibilidade

- Contraste adequado de cores
- Labels em formulários
- Navegação por teclado
- Alt text em imagens

## SEO

- Meta tags configuradas
- Título e descrição personalizados
- Open Graph tags
- Estrutura semântica HTML5
# totaldoctor-site
