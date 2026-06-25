# Globalle — Site Institucional

Site Next.js 14 + TypeScript + Tailwind CSS + next-intl (PT/EN).

## Como rodar localmente

```bash
# Pré-requisito: Node.js 18+
npm install
npm run dev
# Abrir http://localhost:3000  (redireciona para /pt)
```

## Trocar textos / traduções

Todo o conteúdo está em dois ficheiros JSON:

- `messages/pt.json` — versão em Português (PT-PT)
- `messages/en.json` — versão em Inglês

Edite as chaves nesses ficheiros e o site atualiza automaticamente (hot reload no dev).

**Exemplo**: para mudar a headline do hero em PT, edite:
```json
// messages/pt.json
{
  "hero": {
    "headline": "Novo texto aqui"
  }
}
```

## Trocar idioma

O seletor PT/EN no header troca o locale preservando a página atual.
- Rota PT: `/pt`, `/pt/consultoria`, `/pt/contato`
- Rota EN: `/en`, `/en/consultoria`, `/en/contato`
- Locale padrão: `pt` (redirect automático de `/` para `/pt`)

## Conectar formulário de newsletter

O formulário está em `components/NewsletterForm.tsx`. Procure o comentário:
```
// TODO: conectar a ESP — ex. Mailerlite, ConvertKit, Systeme.io
```

Para ligar ao Mailerlite (exemplo):
1. Crie uma API route em `app/api/subscribe/route.ts`
2. Chame a API do Mailerlite com o email recebido
3. No NewsletterForm, descomente o `fetch('/api/subscribe', ...)`

## Deploy no Vercel

```bash
npm run build   # verificar erros antes
# Push para GitHub → importar no Vercel → deploy automático
```

## Stack

| Tecnologia | Versão |
|---|---|
| Next.js | 14 (App Router) |
| TypeScript | 5+ |
| Tailwind CSS | 4 |
| next-intl | 4 |

## Estrutura de pastas

```
app/
  layout.tsx          ← Root layout (mínimo)
  [locale]/
    layout.tsx        ← Layout com intl + fonts
    page.tsx          ← Home
    consultoria/
      page.tsx        ← Página de planos
    contato/
      page.tsx        ← Formulário de contato
components/
  Header.tsx
  Footer.tsx
  NewsletterForm.tsx
messages/
  pt.json             ← Textos PT-PT
  en.json             ← Textos EN
i18n/
  routing.ts          ← Configuração de locales
  request.ts          ← Carregamento de mensagens
middleware.ts         ← Redirecionamento de locale
```
