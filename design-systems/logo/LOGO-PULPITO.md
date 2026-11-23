# Logo do Púlpito — guia para implementação

Este arquivo reúne tudo o que é preciso para aplicar o logo escolhido ("Fita marcadora") no aplicativo Púlpito. Os códigos SVG abaixo são a fonte oficial: copie-os como estão, sem redesenhar.

## 1. O que é o símbolo

Um livro aberto visto de frente, com uma fita marcadora dourada caindo da página direita. Representa a Bíblia aberta no ponto onde a leitura parou.

## 2. Cores (usar somente estas)

| Nome | Hex | Uso |
|---|---|---|
| Vinho | `#4a1626` | Cor principal: símbolo, nome, fundo do ícone |
| Dourado | `#c9a24a` | Somente a fita e o trecho "pito" do nome sobre fundo vinho |
| Branco | `#ffffff` | Páginas do livro e "Púl" sobre fundo vinho |
| Claro de fundo | `#f6f2ef` | Fundo de telas e superfícies claras |

Sugestão de variáveis CSS:

```css
:root {
  --pulpito-vinho: #4a1626;
  --pulpito-dourado: #c9a24a;
  --pulpito-branco: #ffffff;
  --pulpito-claro: #f6f2ef;
}
```

## 3. Tipografia do nome

- Fonte: **Merriweather Black** (peso 900), do Google Fonts.
- Sempre escrito **"Púlpito"**, com acento e só a primeira letra maiúscula.
- Espaçamento entre letras: `-0.5px` no tamanho 40 px (proporcional nos demais).

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap">
```

```css
.pulpito-nome {
  font-family: 'Merriweather', serif;
  font-weight: 900;
  letter-spacing: -0.0125em;
  line-height: 1;
}
```

## 4. Arquivos SVG

Salve cada bloco no caminho indicado (sugestão: pasta `assets/logo/`).

### 4.1 Símbolo, duas cores — `simbolo.svg`

Para fundos claros (branco ou `#f6f2ef`).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M46 22C36 16 22 16 10 20V58C22 54 36 54 46 60Z" fill="#4a1626"/><path d="M50 22C60 16 74 16 86 20V58C74 54 60 54 50 60Z" fill="#4a1626"/><path d="M58 52H66V80L62 75L58 80Z" fill="#c9a24a"/></svg>
```

### 4.2 Símbolo para fundo vinho — `simbolo-fundo-vinho.svg`

Páginas brancas e fita dourada. Fundo transparente: aplicar sobre `#4a1626`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M46 22C36 16 22 16 10 20V58C22 54 36 54 46 60Z" fill="#ffffff"/><path d="M50 22C60 16 74 16 86 20V58C74 54 60 54 50 60Z" fill="#ffffff"/><path d="M58 52H66V80L62 75L58 80Z" fill="#c9a24a"/></svg>
```

### 4.3 Símbolo em uma cor — `simbolo-uma-cor.svg`

Tudo em vinho. Usa `currentColor`, então a cor pode ser trocada pelo CSS (`color: ...`).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="currentColor" color="#4a1626"><path d="M46 22C36 16 22 16 10 20V58C22 54 36 54 46 60Z"/><path d="M50 22C60 16 74 16 86 20V58C74 54 60 54 50 60Z"/><path d="M58 52H66V80L62 75L58 80Z"/></svg>
```

### 4.4 Ícone de app com cantos arredondados — `icone-app.svg`

Quadrado vinho com cantos arredondados. Usar na web: favicon, PWA (`purpose: any`) e telas internas.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="43" fill="#4a1626"/><g transform="translate(34.56 34.56) scale(1.28)"><path d="M46 22C36 16 22 16 10 20V58C22 54 36 54 46 60Z" fill="#ffffff"/><path d="M50 22C60 16 74 16 86 20V58C74 54 60 54 50 60Z" fill="#ffffff"/><path d="M58 52H66V80L62 75L58 80Z" fill="#c9a24a"/></g></svg>
```

### 4.5 Ícone de app sem cantos (fundo cheio) — `icone-app-quadrado.svg`

Quadrado vinho inteiro, com o símbolo um pouco menor. Usar onde o sistema recorta o ícone sozinho: App Store (iOS), ícone adaptativo do Android e PWA `purpose: maskable`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" fill="#4a1626"/><g transform="translate(43.2 43.2) scale(1.1)"><path d="M46 22C36 16 22 16 10 20V58C22 54 36 54 46 60Z" fill="#ffffff"/><path d="M50 22C60 16 74 16 86 20V58C74 54 60 54 50 60Z" fill="#ffffff"/><path d="M58 52H66V80L62 75L58 80Z" fill="#c9a24a"/></g></svg>
```

## 5. Versão horizontal (símbolo + nome)

O nome depende da fonte Merriweather. Por isso, **monte a versão horizontal em HTML/CSS**, com o SVG do símbolo ao lado do texto. Um SVG com `<text>` mostraria outra fonte em qualquer lugar onde a Merriweather não estiver carregada.

Proporções: altura do símbolo = 1,7 × o tamanho da fonte do nome; espaço entre símbolo e nome = 0,35 × o tamanho da fonte.

```html
<!-- Fundo claro: símbolo em duas cores, nome todo em vinho -->
<span class="pulpito-logo">
  <img src="assets/logo/simbolo.svg" alt="" class="pulpito-logo__simbolo">
  <span class="pulpito-nome">Púlpito</span>
</span>

<!-- Fundo vinho: "Púl" em branco e "pito" em dourado -->
<span class="pulpito-logo pulpito-logo--vinho">
  <img src="assets/logo/simbolo-fundo-vinho.svg" alt="" class="pulpito-logo__simbolo">
  <span class="pulpito-nome">Púl<span class="pulpito-nome__ouro">pito</span></span>
</span>
```

```css
.pulpito-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  font-size: 40px;            /* mude aqui para escalar o logo inteiro */
  color: var(--pulpito-vinho);
}
.pulpito-logo__simbolo { width: 1.7em; height: 1.7em; display: block; }
.pulpito-logo--vinho { color: var(--pulpito-branco); }
.pulpito-nome__ouro { color: var(--pulpito-dourado); }
```

Para a versão em uma cor, use `simbolo-uma-cor.svg` com o nome todo em vinho sobre o fundo claro.

## 6. Tamanhos do ícone a gerar

Gerar PNGs a partir dos SVGs da seção 4 (por exemplo com `sharp`, `rsvg-convert` ou Inkscape).

| Uso | Origem | Tamanhos (px) |
|---|---|---|
| Favicon | `icone-app.svg` | 16, 32, 48 |
| PWA `purpose: any` | `icone-app.svg` | 192, 512 |
| PWA `purpose: maskable` | `icone-app-quadrado.svg` | 192, 512 |
| Apple touch icon | `icone-app-quadrado.svg` | 180 |
| Android (launcher) | `icone-app-quadrado.svg` | 48, 72, 96, 144, 192 |
| Lojas (App Store / Play) | `icone-app-quadrado.svg` | 1024 / 512 |

## 7. Regras de uso

- **Nunca** usar cruz, crucifixo ou forma que lembre uma cruz em nenhum elemento ligado ao logo. Também não usar pomba, peixe, chama, coroa de espinhos, mãos em oração, vitral ou figura humana.
- Sem degradê, sem sombra, sem contorno e sem efeitos no símbolo.
- Não mudar as proporções, não girar e não redesenhar as formas.
- A fita fica sempre na página direita, fora do centro. Não centralizá-la: fita no centro sob o livro forma um "T".
- Dourado só na fita e no trecho "pito" sobre fundo vinho. Não escrever texto dourado sobre fundo claro (fica ilegível).
- Área de respiro: deixar em volta do logo um espaço livre de pelo menos 1/4 da altura do símbolo.
- Tamanho mínimo do símbolo: 24 px. Abaixo de 32 px, preferir o ícone de app (com fundo vinho).
- Estilo geral do app: reverente e sereno, com cara de livro encadernado, não de aplicativo de tecnologia.
