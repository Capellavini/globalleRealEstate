# Snapshot — /profissionais (antes do reposicionamento "conteúdo + rede")

Data: 2026-07-20
Commit: `dc2550d2c41e8ea154e2c8d7fc59ddf302b481e8`

Este documento existe só como referência rápida para "voltar atrás" caso o
reposicionamento não fique bom. O backup *de verdade* é o git: qualquer
arquivo neste estado pode ser recuperado com:

```
git show dc2550d2c41e8ea154e2c8d7fc59ddf302b481e8:messages/pt.json
git show dc2550d2c41e8ea154e2c8d7fc59ddf302b481e8:"app/[locale]/profissionais/page.tsx"
```

(troque o path para `messages/en.json`, `es.json`, `it.json` para as outras
línguas — todas mudam junto quando o PT muda, mesma estrutura de chaves.)

## Estrutura da página (`app/[locale]/profissionais/page.tsx`)

1. **Hero** — headline + subheadline + `NewsletterForm` (2 passos: e-mail → nome/empresa/perfil/idiomas)
2. **01 · Abordagem** (`approach`) — headline + 2 colunas (Como Fazemos / Nosso Diferencial) + citação
3. **02 · Manifesto** (`manifesto`) — texto longo (p1–p6) + frase de fechamento
4. **03 · Proposta de Valor** (`value_props`) — 4 cards
5. **04 · Produtos** (`products`) — só a linha de Newsletter aparece; Comunidade e Consultoria ficam comentadas no código (`hidden until launch`)
6. **CTA final** (`final_cta`) — headline + subheadline + `NewsletterForm` de novo
7. Footer

## Copy atual (PT — fonte de verdade, as outras 3 línguas espelham a estrutura)

### Hero
- **Headline:** Inteligência Imobiliária Global, traduzida em ação local.
- **Subheadline:** Toda semana, mostramos o que as melhores imobiliárias do mundo estão fazendo — e como aplicar isso no seu mercado.

### 01 · Abordagem
- **Label:** Nossa Abordagem
- **Headline:** O mercado é Global, você também deve ser
- **Como Fazemos:** Analisamos em profundidade as práticas das melhores imobiliárias do mundo e traduzimos esse conhecimento em conteúdo aplicável para o mercado brasileiro e português.
- **Nosso Diferencial:** Não somos uma newsletter de notícias. Somos uma plataforma de inteligência estratégica: cada edição traz um caso real, uma técnica comprovada e um passo concreto que você pode implementar ainda esta semana.
- **Citação:** Globalle: uma plataforma que conecta o mercado imobiliário ao mundo através de conteúdos relevantes a todos os profissionais deste mercado.

### 02 · Manifesto
- **Headline:** Por que o mundo precisa de profissionais imobiliários com visão global?
- p1: O conhecimento tornou-se global, mas continua distribuído de forma desorganizada. [...]
- p2: O conhecimento que define a excelência no real estate global [...] raramente chega, em português, de forma estruturada, a quem também gostaria de replicá-las.
- p3: A Globalle nasceu para mudar isso.
- p4: Não somos um agregador de notícias do mercado. Somos seu ponto de contato entre o seu mercado local e o que há de melhor em inteligência estratégica. [...]
- p5: Acreditamos que a próxima geração de grandes nomes do imobiliário [...] vai ser formada por quem teve a curiosidade de olhar para fora e a disciplina de traduzir o que aprendeu em ação.
- p6: É isso que a Globalle oferece, semana após semana.
- **Fechamento:** As fronteiras estão abertas. Embarque nessa jornada conosco.

*(texto completo de p1/p2/p4/p5 está em `messages/pt.json` → chave `manifesto`, não repetido aqui na íntegra por brevidade — ver o git show acima para o texto exato)*

### 03 · Proposta de Valor
- **Label:** Proposta de Valor
- **Headline:** Por que a Globalle é diferente
- 1. **Curadoria Inteligente de Entrevistas** — Entrevistamos profissionais de topo de mercados ao redor do globo [...]
- 2. **Visão Cultural + Técnica** — Entendemos que as práticas de outros mercados não se copiam, se traduzem. [...]
- 3. **Experiência Vasta em Mercado Imobiliário** — Nós também respiramos e vivemos o mercado imobiliário! [...]
- 4. **Comunidade Focada em Crescer** — Nossos leitores são profissionais que aplicam o que leem, compartilham resultados e constroem juntos. [...]

### 04 · Produtos (só a newsletter visível hoje)
- **Newsletter Semanal** — O coração da Globalle. Toda semana, uma análise aprofundada de uma prática, caso ou tendência do mercado imobiliário global.
- *(Comunidade e Consultoria existem na tradução mas a seção está comentada no código — não aparecem na página ao vivo)*

### CTA final
- **Headline:** Faça parte de uma comunidade de profissionais como você.
- **Subheadline:** Inscreva-se agora e junte-se aos profissionais que já recebem inteligência imobiliária global todas as semanas.

## Como reverter de verdade, se decidirmos voltar atrás

```
git checkout dc2550d2c41e8ea154e2c8d7fc59ddf302b481e8 -- "app/[locale]/profissionais/page.tsx" messages/pt.json messages/en.json messages/es.json messages/it.json
```

(isso restaura só esses arquivos para este estado exato, sem mexer em nada que tenha sido feito depois nos outros arquivos do projeto.)
