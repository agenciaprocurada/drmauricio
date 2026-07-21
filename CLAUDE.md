# Projeto — Landing Dr. Maurício Araújo

Landing page estática de venda do e-book **"Guia Clínico de Complicações na Harmonização Orofacial (HOF)"** do Dr. Maurício Araújo. Página única, checkout na Hotmart.

## Stack

- **Astro** (^4.16) — site estático, uma única página.
- Sem framework de JS no cliente e sem dependências extras além do Astro.
- `playwright-core` só em devDependencies (uso pontual).

## Comandos

- `npm run dev` — sobe o dev server na porta **3040** (`--host` para acesso na rede).
- `npm run build` — gera o site estático em `dist/`.
- `npm run preview` — pré-visualiza o build na porta 3040.

## Estrutura

- `src/pages/index.astro` — a página inteira (conteúdo, textos, FAQ, preço, CTA).
- `src/layouts/Layout.astro` — HTML base, `<head>`, meta tags, `lang="pt-BR"`.
- `src/components/` — componentes Astro reutilizáveis (Button, Card, PriceCard, FAQItem, Badge, etc).
- `src/styles/design-system.css` — design system (tokens de cor, espaçamento, tipografia).
- `modelo-claude-design/` — kit de design de referência (não é build de produção; fonte dos componentes/tokens).

## Convenções

- Todo o conteúdo é em **português (pt-BR)**.
- Preços e CTA são hard-coded no `index.astro`:
  - CTA / checkout: `https://pay.hotmart.com/G99756037V`
  - Preço atual: 3x de R$ 24,94 ou R$ 69,90 à vista.
- Use os tokens do design system (`var(--...)`) em vez de valores fixos de cor/espaçamento.

## Tracking (Meta Pixel)

- Pixel ID: **`1537267897256406`** (mesmo da página antiga `/ebook`).
- `src/components/MetaPixel.astro` — `init` + `PageView`. Renderiza no `<head>` (`part="head"`) e o `<noscript>` no `<body>` (`part="noscript"`).
- `src/scripts/fop-tracking.ts` — eventos do funil, importado pelo `index.astro`.

| Evento | Gatilho |
|---|---|
| PageView | load |
| ViewContent | scroll 25% · 10s · play do vídeo |
| AddToWishlist | scroll 50% · 30s · 50% do vídeo |
| InitiateCheckout | clique em `a[href*="pay.hotmart.com"]` |

- Cada evento leva um `event_id` único (`window.__fopEventId()`) — necessário para deduplicar caso o CAPI seja adicionado depois.
- `external_id` persistido em cookie + localStorage (`fop_xid`).
- **Não implementado:** CAPI (site é estático, sem servidor) e `Purchase` / `AddPaymentInfo` (dependem de configurar o pixel na Hotmart).
- Advanced Matching está limitado a `external_id` — a página não coleta e-mail nem telefone.

## Infraestrutura / Domínio

- Domínio: **drmauricioaraujo.com**
- **IP principal: `45.148.96.55`** (servidor antigo).
