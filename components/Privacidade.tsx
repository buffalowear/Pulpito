'use client';
import { Cabecalho } from './Cabecalho';

/** Política de privacidade (texto-base — o administrador deve revisar). */
export function Privacidade({ publico }: { publico?: boolean }) {
  return (
    <>
      {publico ? null : <Cabecalho titulo="Privacidade" voltar="/perfil" />}
      <main className="mx-auto max-w-2xl p-5 leading-relaxed">
        {publico ? <p><a className="underline" href="#/">← Voltar</a></p> : null}
        <h2 className="mb-3 text-2xl">Política de privacidade do Púlpito</h2>
        <h3 className="mt-5 text-lg">Que dados guardamos</h3>
        <p>Seu e-mail (para o login), nome, cargo, igreja e cidade; as mensagens que você cria (digitadas e escritas à mão), os registros de pregação, as anotações de versículo e os textos marcados.</p>
        <h3 className="mt-5 text-lg">Dados sensíveis</h3>
        <p>Cargo e igreja indicam a sua convicção religiosa, que a Lei Geral de Proteção de Dados (LGPD) trata como dado sensível. Eles são usados apenas para identificar a autoria das mensagens e só são guardados com o seu consentimento, dado no cadastro.</p>
        <h3 className="mt-5 text-lg">Quem vê o quê</h3>
        <p>Suas mensagens são privadas, a menos que você mesmo as marque como públicas. Numa mensagem pública, os demais usuários veem o conteúdo e a sua linha de autoria (nome, cargo e igreja); nunca veem os registros de pregação, as suas anotações de versículo nem o seu e-mail. O administrador vê a lista de usuários (nome, e-mail, cargo, igreja, cidade).</p>
        <h3 className="mt-5 text-lg">Onde ficam os dados</h3>
        <p>No Supabase (banco de dados), que pode manter servidores fora do Brasil. Uma cópia das suas mensagens e da Bíblia fica no seu aparelho, para uso sem internet. Nesta versão o app não usa inteligência artificial e não envia o que você escreve a nenhum outro serviço.</p>
        <h3 className="mt-5 text-lg">Seus direitos</h3>
        <p>Você pode corrigir seus dados na tela de Perfil, apagar suas mensagens e anotações a qualquer momento e pedir ao administrador a exclusão completa da sua conta.</p>
        <h3 className="mt-5 text-lg">Créditos</h3>
        <p>Bíblia Livre (BLIVRE) © 2018 Diego Santos, Mario Sérgio e Marco Teles — licença Creative Commons Atribuição 4.0 Brasil. King James Version (1769) e Textus Receptus (1550): domínio público. Westminster Leningrad Codex: texto hebraico de uso livre. Dados das versões: repositório midvash/bible-data. Referências cruzadas: OpenBible.info, licença CC BY. Os títulos das seções foram escritos para o Púlpito.</p>
      </main>
    </>
  );
}
