# Duque Score

[![Quality](https://github.com/duqueroleta/DuqueSports-Codex/actions/workflows/quality.yml/badge.svg)](https://github.com/duqueroleta/DuqueSports-Codex/actions/workflows/quality.yml)

Aplicativo premium de análise estatística de futebol com foco em leitura preditiva, sinais de mercado, auditoria de recomendações e experiência visual de alto nível.

## Stack

- React
- Vite
- JavaScript
- CSS puro
- React Router DOM

## Comandos

```bash
npm install
npm run dev
npm run build
npm run verify
```

Servidor local padrão:

```bash
http://127.0.0.1:5173/
```

## Deploy na Vercel

Configuração recomendada:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

O arquivo `vercel.json` inclui rewrite para `index.html`, garantindo que rotas do React Router funcionem ao acessar URLs diretamente, como `/jogos` ou `/mercados/1`.

## Qualidade automatizada

O workflow `Quality` do GitHub Actions executa `npm ci` e `npm run verify` em pushes e pull requests para `main`. A verificacao cobre testes do Engine, testes da interface e build de producao.

Se o workflow falhar:

1. Abra a execucao mais recente na aba `Actions` e selecione o job `Tests and build`.
2. Identifique se a falha ocorreu em `Install dependencies` ou `Verify project`.
3. Reproduza localmente com `npm ci` e `npm run verify` antes de publicar a correcao.

### Captacao de leads

O formulario da Lista VIP envia os dados para um Google Apps Script conectado a uma planilha.

Endpoint configurado:

```bash
https://script.google.com/macros/s/AKfycbyoW36jLXME_tvvWhR_eTtI-Z8F9pwiaZPaQb78U_mB0XIUM7GNwKCBn1VZbCbCmi4SrA/exec
```

Tambem e possivel sobrescrever o endpoint usando `VITE_LEADS_ENDPOINT` na Vercel.

Sem essa variavel, os leads sao salvos localmente no navegador em `localStorage`, o que e util apenas para testes.

Exemplo de variavel:

```bash
VITE_LEADS_ENDPOINT=https://seu-endpoint-de-leads.com/webhook
```

Para evitar duplicidade direto na planilha, o Apps Script deve retornar `{ duplicate: true }` quando o e-mail ja existir.

## Funcionalidades

- Home premium com Hero, Duque Score, recomendação IA, mercados principais e status do sistema
- Página gratuita de Lista VIP para captação de leads
- Páginas dedicadas para Jogos, Mercados, Auditorias, Ao Vivo, Dados, Favoritos, Perfil e Análises
- Detalhes de jogos e mercados por rota dinâmica
- Busca global persistente
- Filtros funcionais persistentes por página
- Favoritos de jogos e mercados com persistência em localStorage
- Skeleton loading para carregamento assíncrono
- Estados de erro com retry
- Toasts para ações importantes
- Painel dev para simular falhas de serviços em ambiente de desenvolvimento
- Layout responsivo para desktop, tablet e mobile
- Metadados de deploy, favicon e manifest para identidade do app

## Rotas

- `/` - Home
- `/lista-vip` - Lista VIP e captação de leads
- `/jogos` - Jogos monitorados
- `/jogos/:matchId` - Detalhe do jogo
- `/mercados` - Ranking de mercados
- `/mercados/:marketId` - Detalhe do mercado
- `/auditorias` - Auditorias de sinais
- `/ao-vivo` - Monitor live
- `/dados` - Dados e integridade
- `/favoritos` - Favoritos salvos
- `/perfil` - Perfil e preferências
- `/analises` - Análises estatísticas
- `*` - Página segura para rotas não encontradas

## Arquitetura

O projeto separa responsabilidades por domínio:

- `components/` - componentes reutilizáveis por área
- `pages/` - páginas roteadas
- `styles/` - CSS separado por seção/componente
- `data/` - dados mockados centralizados
- `services/` - camada de acesso aos dados
- `hooks/` - hooks reutilizáveis
- `context/` - estados globais da aplicação

## Planejamento

- [Backlog priorizado dos próximos ciclos](docs/product-backlog.md)
- [Fechamento do segundo ciclo - Fase 75](docs/engine-phase-75.md)
- [ADR 001 - Fronteira do provedor e contrato canônico](docs/adr/001-provider-boundary-and-canonical-match.md)
- [Contrato canônico inicial - Fase 76](docs/engine-phase-76.md)

## Observações

O app ainda usa dados locais, mas a camada de `services` já prepara o caminho para substituir os mocks por APIs reais sem reescrever as telas.
