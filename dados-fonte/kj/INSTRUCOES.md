# Tradução da King James para o português do Brasil — instruções

Você vai traduzir capítulos da **King James Version (1769, domínio público)** do inglês para o português do Brasil, em **duas versões** de cada versículo. O texto será lido por pregadores de uma igreja evangélica (Igreja Cristã Maranata) como texto bíblico. Exige fidelidade e reverência.

## Como trabalhar

Diretório: `/home/user/pulpito`

1. Leia o inglês: `node scripts/ver-kjv.mjs <livro> <capIni> <capFim>` — peça **no máximo 3 capítulos por comando** (1 por vez nos capítulos longos), para a saída não ser cortada. Nunca traduza de memória sem ter lido o versículo em inglês na saída do comando.
2. Para cada capítulo, grave um arquivo `dados-fonte/kj/<livro>/<capítulo>.json` (crie a pasta se preciso) com este formato exato:
   `{"c": ["versículo 1 clássico", "versículo 2 clássico", ...], "a": ["versículo 1 atual", "versículo 2 atual", ...]}`
   - `c` = versão clássica, `a` = versão atual.
   - Cada lista tem **exatamente** o número de versículos do capítulo em inglês, na mesma ordem. Um versículo por item. Não junte nem divida versículos.
   - Só o texto: sem número do versículo, sem título, sem nota.
   - JSON válido (aspas dentro do texto: use aspas tipográficas “ ” ou escape \").
3. Depois de cada 5 a 8 capítulos, valide: `node scripts/validar-kj.mjs <livro> <livro> <capIni> <capFim>` e corrija o que ele apontar.
4. Trabalhe capítulo por capítulo até o fim do seu bloco. Não pare no meio; não deixe capítulos sem arquivo. Se um arquivo do seu bloco já existir e passar na validação, pule-o.

## Regras de tradução (valem para as duas versões)

- Traduza **o que a King James diz**, frase por frase, sem acrescentar, omitir, resumir, explicar ou interpretar. Nada de paráfrase.
- Traduza a partir do inglês que você leu. **Não reproduza de memória** traduções portuguesas publicadas (Almeida Revista e Corrigida, Revista e Atualizada, NVI, NVT, King James Atualizada, BKJ 1611 etc.). Semelhanças inevitáveis em frases simples são normais.
- Nomes de pessoas e lugares na forma tradicional em português: Moisés, Isaías, Jeremias, Jerusalém, Egito, Faraó, João, Tiago, Pedro, Paulo, Timóteo etc.
- "LORD" (em maiúsculas no inglês) → "SENHOR"; "Lord" → "Senhor"; "God" → "Deus"; "Holy Ghost"/"Holy Spirit" → "Espírito Santo"; "Christ" → "Cristo"; "charity" → "amor"; "the Word" (João 1) → "a Palavra".
- Pronomes referentes a Deus e a Jesus com inicial minúscula (ele, seu), como é usual em Bíblias em português; "Senhor", "Deus", "Pai", "Filho", "Espírito" com maiúscula.
- Mantenha a pontuação natural do português. Falas com dois-pontos, sem travessão novo de linha.
- Medidas e moedas: mantenha o termo bíblico (côvado, siclo, talento, denário).
- Títulos dos Salmos e a palavra "Selah" ("Selá") ficam como estão na King James (se o título fizer parte do versículo 1 no inglês, traduza junto).

## Versão clássica (`c`)

- Estilo tradicional de Bíblia em português: **tu** e **vós**, com as conjugações corretas (tu és, vós sois, amarás, não temais).
- Vocabulário solene e conhecido da igreja: "eis que", "porquanto", "bem-aventurado", "em verdade vos digo", "para sempre".
- O mais próximo possível da ordem e das palavras do inglês, sem ficar agramatical.

## Versão atual (`a`)

- Português do Brasil de hoje: **você** e **vocês**, frases diretas, palavras comuns.
- Mesma fidelidade: cada ideia do versículo continua lá, só muda a linguagem. Não simplifique a doutrina nem troque termos centrais (graça, justificação, santificação, arrependimento, glória, pecado, salvação continuam com esses nomes).
- A Deus e a Jesus: "tu" pode virar "você" nas falas dirigidas a pessoas; nas orações dirigidas a Deus use "tu" com verbo simples ("tu és o meu Deus") ou "o Senhor" — nunca "você" para Deus.

## Exemplo (João 3:16)

Inglês: For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.
- `c`: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."
- `a`: "Porque Deus amou tanto o mundo que deu o seu único Filho, para que todo aquele que crê nele não se perca, mas tenha a vida eterna."

## Ao terminar

Rode a validação do bloco inteiro e corrija até dar zero problemas. Não altere nenhum outro arquivo do projeto e não faça commit. Responda só com: quantos capítulos gravou, se a validação final passou, e qualquer capítulo que tenha ficado sem fazer.
