// Testes das funções puras: referências bíblicas, versões, textos usados e apostilas.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatarRef, lerRef, refsCitadas, textoLeitura, transcreverCitacoes, type BibliaDados } from '@/lib/biblia';
import { dividirTrechos } from '@/lib/acervo';
import { chaveDe, lerChave, rotuloChave, textoChave } from '@/lib/textos';
import { temLivro, transliterar, versaoPorId, VERSOES } from '@/lib/versoes';

const biblia = JSON.parse(readFileSync('public/biblia.json', 'utf8')).b as BibliaDados;

describe('referências bíblicas', () => {
  it.each([
    ['João 3:16', 'João 3:16'], ['jo 3.16-18', 'João 3:16-18'], ['1 Reis 19:1-18', '1 Reis 19:1-18'], ['1Rs 19', '1 Reis 19'],
    ['Sl 23', 'Salmos 23'], ['I Coríntios 13:4', '1 Coríntios 13:4'], ['Cântico dos Cânticos 2:1', 'Cânticos 2:1'], ['Jó 1:21', 'Jó 1:21'],
    ['Apocalipse 3:7–13', 'Apocalipse 3:7-13'], ['2 Tessalonicenses 2:3', '2 Tessalonicenses 2:3'],
  ])('lê "%s"', (entrada, esperado) => {
    const r = lerRef(entrada);
    expect(r && formatarRef(r)).toBe(esperado);
  });
  it('recusa o que não é referência', () => {
    expect(lerRef('amor de Deus')).toBeNull();
    expect(lerRef('Hezequias 3:1')).toBeNull();
  });
  it('tem os 66 livros e 31.102 versículos', () => {
    expect(biblia).toHaveLength(66);
    expect(biblia.reduce((s, l) => s + l[2].reduce((a, c) => a + c.length, 0), 0)).toBe(31102);
  });
  it('monta a leitura e troca as citações pelo texto da Bíblia do app', () => {
    expect(textoLeitura(biblia, lerRef('Gênesis 1:1-2')!)).toMatch(/^1 No princípio criou Deus os céus e a terra\.\n2 /);
    const t = transcreverCitacoes('Está escrito: {{Gênesis 1:1}}. E também {{Hezequias 4:4}} e {{João 99:1}}.', biblia);
    expect(t).toBe('Está escrito: “No princípio criou Deus os céus e a terra.” (Gênesis 1:1). E também (Hezequias 4:4) e (João 99:1).');
  });
  it('acha as referências citadas num trecho de apostila', () => {
    expect(new Set(refsCitadas('Como lemos em Mateus 25:1-13 e em Êx 27.1, e também 1 Reis 19.'))).toEqual(new Set(['1:27', '10:19', '39:25']));
  });
});

describe('textos usados numa mensagem', () => {
  it('converte referência em chave e de volta', () => {
    const chave = chaveDe(lerRef('Lucas 15:11-24')!);
    expect(chave).toBe('41.14.11-24');
    expect(rotuloChave(chave)).toBe('Lucas 15:11-24');
    expect(lerChave('42.2.16')).toEqual({ l: 42, c: 2, v: 16, v2: undefined });
    expect(lerChave('lixo')).toBeNull();
  });
  it('traz o texto dos versículos da Bíblia do app', () => {
    expect(textoChave('0.0.1', biblia)).toBe('No princípio criou Deus os céus e a terra.');
    expect(textoChave('0.0.1-2', biblia)).toMatch(/^1 No princípio .* 2 E a terra/);
    expect(textoChave('0.0.999', biblia)).toBe('');
  });
});

describe('dados bíblicos gerados', () => {
  const ler = (arq: string) => JSON.parse(readFileSync('public/dados/' + arq, 'utf8'));
  it('todas as versões têm 66 posições de livro e os arquivos existem', () => {
    for (const v of VERSOES.filter((x) => x.id !== 'blivre')) {
      const b = ler(v.id + '.json').b as BibliaDados;
      expect(b).toHaveLength(66);
      b.forEach((livro, i) => expect(livro[2].length > 0).toBe(temLivro(v, i)));
    }
    expect(ler('kjv.json').b[42][2][2][15]).toMatch(/^For God so loved the world/);
    expect(ler('wlc.json').b[0][2][0][0].replace(/[\u0591-\u05C7]/g, '')).toMatch(/^בראשית ברא אלהים/);
    expect(versaoPorId('nao-existe').id).toBe('blivre');
  });
  it('todo capítulo tem título de seção no versículo 1, e os versículos existem', () => {
    const t = ler('titulos.json');
    let total = 0;
    biblia.forEach((livro, l) => livro[2].forEach((cap, c) => {
      const lista = t[l]?.[c + 1] as [number, string][];
      expect(lista?.[0]?.[0], `${livro[1]} ${c + 1}`).toBe(1);
      for (const [v, titulo] of lista) { expect(v).toBeLessThanOrEqual(cap.length); expect(titulo.length).toBeGreaterThan(1); total++; }
    }));
    expect(total).toBeGreaterThan(3500);
  });
  it('as referências cruzadas apontam para versículos que existem', () => {
    const joao = ler('refs/42.json');
    const refs = joao['3.16'] as number[][];
    expect(refs.length).toBeGreaterThan(3);
    for (const [l, c, v, v2] of refs) { expect(biblia[l][2][c - 1][v - 1]).toBeTruthy(); if (v2) expect(biblia[l][2][c - 1][v2 - 1]).toBeTruthy(); }
    // Mateus 1:23 liga ao Antigo Testamento (Isaías 7:14)
    expect((ler('refs/39.json')['1.23'] as number[][]).some(([l, c, v]) => l === 22 && c === 7 && v === 14)).toBe(true);
  });
  it('translitera o hebraico de forma legível', () => {
    expect(transliterar('בְּרֵאשִׁית בָּרָא אֱלֹהִים')).toBe('bereshit bara elohim');
  });
});

describe('apostilas', () => {
  it('divide em trechos com título e referências citadas', () => {
    const texto = 'JESUS, O ALTAR\n\n' + 'O altar era o lugar do sacrifício no tabernáculo, conforme Êxodo 27:1. '.repeat(40) + '\n\nA CANDEIA\n\n' + 'A candeia fala da vida espiritual do servo, como em Mateus 25:1-13. '.repeat(40);
    const trechos = dividirTrechos(texto);
    expect(trechos.length).toBeGreaterThanOrEqual(4);
    expect(trechos[0]).toMatchObject({ titulo: 'JESUS, O ALTAR' });
    expect(trechos[0].refs).toContain('1:27');
    expect(trechos[trechos.length - 1].refs).toContain('39:25');
  });
});
