// Comportamento do cartão: trocar estilo, cor e fonte, e copiar o texto.
(function () {
  var ESTILOS = [
    { id: 'estudio', nome: 'Estúdio', num: 1, fonte: 'sans' },
    { id: 'organico', nome: 'Orgânico', num: 3, fonte: 'sans' },
    { id: 'pergaminho', nome: 'Pergaminho', num: 4, fonte: 'serif' },
    { id: 'margem', nome: 'Margem', num: 5, fonte: 'serif' }
  ];
  var cartao = document.getElementById('cartao');
  var atual = 3;

  function marcar(fila, botao, atributo, rotulo) {
    fila.querySelectorAll('[role=radio]').forEach(function (b) { b.setAttribute('aria-checked', b === botao ? 'true' : 'false'); });
    cartao.setAttribute(atributo, botao.dataset[atributo.replace('data-', '')]);
    document.getElementById(rotulo).textContent = botao.dataset.nome;
  }
  function escolherFonte(id) {
    var botao = document.querySelector('#fontes [data-fonte="' + id + '"]');
    if (botao) marcar(document.getElementById('fontes'), botao, 'data-fonte', 'fonteNome');
  }
  function mostrarEstilo(i) {
    atual = (i + ESTILOS.length) % ESTILOS.length;
    var e = ESTILOS[atual];
    cartao.setAttribute('data-estilo', e.id);
    document.getElementById('estiloNome').textContent = e.nome;
    document.getElementById('estiloNum').textContent = 'ESTILO ' + e.num + ' / 6';
    escolherFonte(e.fonte);
  }

  document.getElementById('anterior').addEventListener('click', function () { mostrarEstilo(atual - 1); });
  document.getElementById('proximo').addEventListener('click', function () { mostrarEstilo(atual + 1); });
  document.getElementById('cores').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-cor]');
    if (b) marcar(this, b, 'data-cor', 'corNome');
  });
  document.getElementById('fontes').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-fonte]');
    if (b) marcar(this, b, 'data-fonte', 'fonteNome');
  });

  var aviso = document.getElementById('aviso');
  function avisar(texto) {
    aviso.textContent = texto; aviso.hidden = false;
    clearTimeout(avisar.t); avisar.t = setTimeout(function () { aviso.hidden = true; }, 3500);
  }
  document.getElementById('copiar').addEventListener('click', function () {
    var texto = document.getElementById('verso').textContent.trim() + ' (Provérbios 4:1 — Bíblia Livre)';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { avisar('TEXTO COPIADO'); }, function () { avisar('NÃO FOI POSSÍVEL COPIAR'); });
    } else avisar('NÃO FOI POSSÍVEL COPIAR');
  });
  document.getElementById('salvar').addEventListener('click', function () {
    avisar('SALVAR COMO IMAGEM ENTRA QUANDO O CARTÃO FOR LIGADO AO APP');
  });
})();
