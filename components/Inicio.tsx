'use client';
import { useState } from 'react';
import { LIVROS } from '@/lib/biblia';
import { versaoPorId, VERSOES } from '@/lib/versoes';
import { novaMensagem, pendentes, salvarMensagem, useDados } from '@/lib/cliente/dados';
import { pref } from '@/lib/cliente/local';
import { ir, useApp } from './contexto';

function saudacao(h: number) { return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }

/** Página inicial: a Bíblia em primeiro lugar (com a escolha da versão) e os atalhos. */
export function Inicio() {
  const { perfil } = useApp();
  const dados = useDados();
  const [versao, setVersao] = useState<string>(() => pref.ler('biblia-versao', 'blivre'));
  const [pos] = useState<{ l: number; c: number }>(() => pref.ler('biblia-pos', { l: 42, c: 0 }));
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const primeiro = perfil.nome.trim().split(/\s+/)[0];
  const minhas = dados.mensagens.filter((m) => m.autor_id === perfil.id);
  const fila = pendentes(dados);
  const escolher = (id: string) => { setVersao(id); pref.gravar('biblia-versao', id); };
  const nova = () => { const m = novaMensagem(perfil.id); salvarMensagem(m); ir(`/mensagens/${m.id}`); };

  return (
    <>
    <header className="topo px-5 pb-9" style={{ paddingTop: 'max(28px, env(safe-area-inset-top))' }}>
      <div className="mx-auto max-w-2xl">
        <p className="m-0 text-[30px] font-black leading-none">Púl<span className="text-ouro">pito</span></p>
        <h1 className="mt-5 text-[26px]">{saudacao(agora.getHours())}{primeiro ? `, ${primeiro}` : ''}.</h1>
        <p className="rot m-0 mt-2 first-letter:uppercase">{data}</p>
      </div>
    </header>
    <main className="mx-auto -mt-5 flex max-w-2xl flex-col gap-5 px-5 pb-8">

      <section className="cartao" aria-label="Bíblia">
        <p className="rot m-0">Bíblia</p>
        <h2 className="tit mt-1 !text-[34px]">{LIVROS[pos.l]} {pos.c + 1}</h2>
        <label className="rotulo mt-4" htmlFor="iVersao">Qual Bíblia ler</label>
        <select id="iVersao" className="campo" value={versao} onChange={(e) => escolher(e.target.value)}>{VERSOES.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}</select>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="#/biblia" className="btn btn-pri no-underline">Continuar</a>
          <a href="#/biblia/0/0" className="btn no-underline">Do início</a>
        </div>
        <p className="ajuda">{versaoPorId(versao).credito}</p>
      </section>

      <section className="cartao" aria-label="Mensagens">
        <p className="rot m-0">Mensagens</p>
        <h2 className="tit mt-1">{minhas.length ? `${minhas.length} ${minhas.length === 1 ? 'mensagem' : 'mensagens'}` : 'Nenhuma ainda'}</h2>
        {minhas.slice(0, 3).map((m) => (
          <a key={m.id} href={`#/mensagens/${m.id}`} className="mt-2 block rounded-xl border border-line px-3 py-2 no-underline">
            <b className="block leading-tight">{m.titulo || 'Sem título'}</b>{m.tema ? <span className="text-[14px] italic text-mute">{m.tema}</span> : null}
          </a>
        ))}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-pri" onClick={nova}>Nova mensagem</button>
          <a href="#/mensagens" className="btn no-underline">Ver e buscar</a>
        </div>
      </section>

      {fila ? <p className="aviso m-0">{fila} {fila === 1 ? 'alteração aguardando' : 'alterações aguardando'} internet para sincronizar.</p> : null}
    </main>
    </>
  );
}
