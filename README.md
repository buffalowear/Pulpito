# Púlpito

Aplicativo web (instalável no celular) de Bíblia, anotações e mensagens para pregadores da Igreja Cristã Maranata.

**Etapa 1 — sem inteligência artificial.** Tudo o que dependia de IA (gerar mensagens, comentários automáticos, dons espirituais) foi retirado e fica para uma segunda etapa. O código dessa parte continua no histórico do repositório.

## O que o app faz

- **Bíblia** com escolha da versão: Bíblia Livre (base Almeida), King James (inglês), hebraico (Antigo Testamento) e grego (Novo Testamento). Dá para comparar duas versões, uma abaixo da outra.
- **Títulos de seção** em toda a Bíblia (3.976 títulos escritos para o Púlpito) e cada versículo em uma linha.
- **Hebraico** com transliteração (como se lê) e o português embaixo.
- **Referências cruzadas** de cada versículo, separadas em Antigo e Novo Testamento, com o texto e o contexto de cada uma. Sem interpretação.
- **Marca-texto**, **anotação por versículo** (digitada ou à mão) e **cartão de versículo** para compartilhar como imagem.
- **Apostilas da ICM** ao lado do texto: os trechos das apostilas que citam o capítulo aberto.
- **Mensagens**: título, tema, textos usados com marca-texto, texto digitado e folha de **escrita à mão** (dedo ou Apple Pencil), registro de pregações, privada ou pública, PDF.
- **Busca** na Bíblia e nas mensagens por palavra.
- **Sem internet**: Bíblia e mensagens continuam disponíveis; o que for alterado sincroniza depois.

---

## 1. O que você precisa ter

| Serviço | Para quê | Custo |
|---|---|---|
| [Supabase](https://supabase.com) | Banco de dados e login | Plano gratuito (até 2 projetos). Ele **pausa o projeto após cerca de uma semana sem uso**; reativa-se pelo painel. |
| GitHub | Guardar o código e hospedar o site (GitHub Pages) | Gratuito |

Não há mais servidor próprio nem conta de IA: o app é um conjunto de arquivos (site estático) que fala direto com o Supabase.

---

## 2. Configurar o Supabase

1. Crie um projeto em supabase.com (**New project**).
2. Abra **SQL Editor** → **New query**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon / public**.
4. Em **Authentication → URL Configuration**, coloque o endereço do app em **Site URL** e em **Redirect URLs** (para testar no computador, `http://localhost:3000`).

Por padrão o Supabase exige que o usuário confirme o e-mail ao criar a conta. O envio de e-mails do plano gratuito é limitado a poucas mensagens por hora.

**Login com Google (opcional):** no Google Cloud Console crie um ID de cliente OAuth do tipo "Aplicativo da Web", com o endereço de retorno que o Supabase mostra em **Authentication → Sign In / Providers → Google**; depois copie o Client ID e o Client Secret para essa tela.

---

## 3. Rodar no computador

```bash
cp .env.example .env.local    # preencha com a URL e a chave anon do Supabase
npm install
npm run dev
```

Abra http://localhost:3000.

| Variável | O que é |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Endereço do projeto no Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública "anon" |
| `NEXT_PUBLIC_BASE_PATH` | Subpasta do site (ex.: `/pulpito`). Vazio se ficar na raiz. |

As duas chaves do Supabase são públicas por natureza. Quem protege os dados são as regras de acesso do banco (`supabase/schema.sql`), testadas em `tests/banco.test.ts`. A chave `service_role` **não é usada** pelo app: não a coloque em lugar nenhum.

---

## 4. Publicar (GitHub Pages)

1. No GitHub, crie um repositório vazio chamado `pulpito`.
2. Copie para ele o conteúdo desta pasta `pulpito/` (os arquivos ficam na raiz do repositório novo).
3. Copie `hospedagem/github-pages.yml` para `.github/workflows/publicar.yml`.
4. No repositório: **Settings → Pages → Source: GitHub Actions**.
5. **Settings → Secrets and variables → Actions → Variables**: crie `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
6. Envie para o ramo `main`. Em alguns minutos o app fica em `https://SEU-USUARIO.github.io/pulpito/`.
7. Volte ao Supabase e coloque esse endereço em **Site URL** e **Redirect URLs**.

Qualquer outra hospedagem de arquivos estáticos serve (Netlify, Cloudflare Pages, Vercel): rode `npm run build` e publique a pasta `out/`.

---

## 5. Tornar-se administrador

1. Crie a sua conta pelo app e confirme o e-mail.
2. No Supabase, **SQL Editor**:

```sql
select public.tornar_admin('seu-email@exemplo.com');
```

3. Saia e entre de novo. Em **Perfil** aparece a **Área do administrador** (usuários e apostilas).

---

## 6. Apostilas

Em **Perfil → Área do administrador → Apostilas → Enviar apostilas**, escolha os arquivos (PDF, DOCX ou TXT). A leitura é feita no próprio aparelho, sem limite de tamanho. Cada apostila é dividida em trechos, e o app anota quais capítulos da Bíblia cada trecho cita. Na leitura, o botão **Apostilas** mostra os trechos que citam o capítulo aberto.

- As apostilas ficam **visíveis a todos os usuários**. Envie só material que a igreja pode divulgar; não envie livros comerciais (dicionários, atlas, comentários de editoras).
- PDF escaneado (só imagem) não tem texto para ler.
- Arquivos `.doc` antigos precisam ser salvos como `.docx`.

---

## 7. Bíblias e licenças

| Versão | Licença |
|---|---|
| Bíblia Livre (Almeida 1819, rev. 2018) | Creative Commons Atribuição 4.0 Brasil |
| King James Version (1769) | Domínio público |
| Hebraico — Westminster Leningrad Codex | Uso livre |
| Grego — Textus Receptus (1550) | Domínio público |

**Almeida Revista e Corrigida, Revista e Atualizada e King James em português não estão no app** porque pertencem à Sociedade Bíblica do Brasil e a outras editoras. Com a licença por escrito, basta gerar o arquivo da versão no mesmo formato em `public/dados/` e acrescentar uma linha em `lib/versoes.ts`.

Os títulos de seção foram escritos para o Púlpito, com palavras próprias, e ficam em `dados-fonte/titulos/`. As referências cruzadas vêm do OpenBible.info (CC BY). Para refazer os arquivos de dados: `npm run dados`.

Limitações conhecidas: a numeração do hebraico difere do português em alguns pontos (títulos dos Salmos, Joel, Malaquias); a transliteração é automática e aproximada; o texto grego vem sem acentos.

---

## 8. Instalar no celular

- **Android (Chrome):** três pontinhos ⋮ → **Adicionar à tela inicial**.
- **iPhone/iPad (Safari):** **Compartilhar** → **Adicionar à Tela de Início**.

A Bíblia Livre e os títulos ficam guardados na instalação. As outras versões e as referências cruzadas são guardadas na primeira vez que você as abre com internet.

---

## 9. Cuidados

- **Dados pessoais (LGPD):** cargo e igreja indicam a religião da pessoa, que a lei trata como dado sensível. O app pede o aceite no cadastro e tem uma página de privacidade (`components/Privacidade.tsx`). **Revise esse texto** e inclua um contato seu.
- **Escrita à mão não entra na busca.** A busca acha o que foi digitado, o título, o tema e os textos bíblicos.
- **Conflito offline:** se a mesma mensagem for editada em dois aparelhos sem internet, vale a edição mais recente.

---

## 10. Testes

```bash
npm test        # 38 testes
npm run lint
```

- `tests/banco.test.ts` — regras de acesso do `schema.sql` num Postgres de verdade em memória: mensagem privada × pública, notas e pregações que não vazam, só o admin envia apostilas e bloqueia usuários.
- `tests/unidades.test.ts` — referências bíblicas, versões, títulos (todo capítulo tem), referências cruzadas, transliteração, apostilas.

---

## 11. Estrutura

```
app/              página única do app e estilos
components/       telas: Início, Bíblia, Painéis, Lousa (escrita à mão), Cartão, Mensagens, Perfil, Admin
lib/              Bíblia, versões, textos usados, apostilas
lib/cliente/      login, dados offline e sincronização, PDF
public/           Bíblia Livre, dados (versões, títulos, referências), ícones, service worker
dados-fonte/      títulos de seção escritos para o app
scripts/          importar a Bíblia Livre e preparar os demais dados
supabase/         schema.sql (tabelas e regras de acesso)
hospedagem/       receita de publicação no GitHub Pages
design-systems/   referências de design (cartão de versículo)
referencia/       pulpito.html, a versão anterior
tests/            testes
```
