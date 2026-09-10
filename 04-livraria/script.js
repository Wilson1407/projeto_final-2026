// ===== 1. BOTÃO DIA/NOITE =====
const btnTema = document.getElementById('btn-tema');

if (localStorage.getItem('tema') === 'dark') {
  document.body.classList.add('dark');
  btnTema.textContent = '☀️';
}

btnTema.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const escuro = document.body.classList.contains('dark');
  btnTema.textContent = escuro ? '☀️' : '🌙';
  localStorage.setItem('tema', escuro ? 'dark' : 'light');
});

// ===== 2. CHATBOX =====
const chatbox = document.getElementById('chatbox');
const btnAbrirChat = document.getElementById('btn-abrir-chat');
const btnFecharChat = document.getElementById('btn-fechar-chat');
const chatMensagens = document.getElementById('chat-mensagens');
const formChat = document.getElementById('form-chat');
const chatInput = document.getElementById('chat-input');

btnAbrirChat.addEventListener('click', () => {
  chatbox.classList.add('aberto');
  if (!chatMensagens.hasChildNodes()) {
    adicionarMensagem('bot', 'Olá! 👋 Bem-vindo à Livraria Página Virada! Como posso ajudar?');
  }
});

btnFecharChat.addEventListener('click', () => {
  chatbox.classList.remove('aberto');
});

formChat.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto) return;

  adicionarMensagem('usuario', texto);
  chatInput.value = '';
  setTimeout(() => responder(texto), 600);
});

function adicionarMensagem(tipo, texto) {
  const div = document.createElement('div');
  div.classList.add('mensagem', tipo);
  div.textContent = texto;
  chatMensagens.appendChild(div);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function responder(texto) {
  const msg = texto.toLowerCase();

  if (msg.includes('horário') || msg.includes('hora')) {
    adicionarMensagem('bot', 'Funcionamos de segunda a sábado, das 9h às 18h. Você também pode agendar uma visita na seção Agendamento! 📅');
  } else if (msg.includes('livro') || msg.includes('catálogo') || msg.includes('catalogo')) {
    adicionarMensagem('bot', 'Temos um ótimo catálogo! Role até a seção "Nosso Catálogo" para ver os títulos disponíveis. 📚');
  } else if (msg.includes('pagamento') || msg.includes('pagar')) {
    adicionarMensagem('bot', 'Aceitamos PIX, cartão de crédito e boleto. É só clicar em "Comprar" no livro desejado! 💳');
  } else if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola')) {
    adicionarMensagem('bot', 'Olá! Em que posso ajudar hoje? 😊');
  } else {
    adicionarMensagem('bot', 'Entendi! Para mais detalhes, use a seção Contato ou ligue para nossa loja. Posso ajudar com algo mais?');
  }
}

// ===== 3. COMPRAR → PAGAMENTO =====
const btnsComprar = document.querySelectorAll('.btn-comprar');
const pagItem = document.getElementById('pag-item');
const pagTotal = document.getElementById('pag-total');

btnsComprar.forEach(btn => {
  btn.addEventListener('click', () => {
    pagItem.value = btn.dataset.titulo;
    pagTotal.value = Number(btn.dataset.preco).toFixed(2);
    document.getElementById('pagamento').scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== 4. FUNÇÃO AUXILIAR DE MENSAGENS =====
function mostrarMensagem(idMsg, texto) {
  const elemento = document.getElementById(idMsg);
  elemento.textContent = texto;
  setTimeout(() => { elemento.textContent = ''; }, 5000);
}

// ===== 5. AGENDAMENTO (agendar, ver e cancelar) =====
const containerAgendamentos = document.getElementById('lista-agendamentos');

// Lê a lista salva no navegador
function obterAgendamentos() {
  return JSON.parse(localStorage.getItem('agendamentos') || '[]');
}

// Salva a lista completa
function salvarAgendamentos(lista) {
  localStorage.setItem('agendamentos', JSON.stringify(lista));
}

// Converte "2026-09-10" em "10/09/2026"
function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Desenha todos os agendamentos na tela
function renderizarAgendamentos() {
  const lista = obterAgendamentos();
  containerAgendamentos.innerHTML = '';

  if (lista.length === 0) {
    containerAgendamentos.innerHTML = '<em style="opacity: 0.6;">Você ainda não possui visitas agendadas.</em>';
    return;
  }

  lista.forEach(item => {
    const card = document.createElement('div');
    card.className = 'agendamento-item';

    const info = document.createElement('div');
    info.className = 'agendamento-info';
    info.innerHTML = `<strong>👤 ${item.nome}</strong><br>📅 ${formatarData(item.data)} às ${item.hora}`;

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.className = 'btn-cancelar';
    btnCancelar.addEventListener('click', () => cancelarAgendamento(item.id));

    card.appendChild(info);
    card.appendChild(btnCancelar);
    containerAgendamentos.appendChild(card);
  });
}

// Remove um agendamento pelo id
function cancelarAgendamento(id) {
  const restantes = obterAgendamentos().filter(item => item.id !== id);
  salvarAgendamentos(restantes);
  renderizarAgendamentos();
  mostrarMensagem('msg-agendamento', '❌ Visita cancelada.');
}

// Envio do formulário de agendamento
document.getElementById('form-agendamento').addEventListener('submit', (e) => {
  e.preventDefault();

  const novo = {
    id: Date.now(),
    nome: e.target.querySelector('input[type="text"]').value,
    data: e.target.querySelector('input[type="date"]').value,
    hora: e.target.querySelector('input[type="time"]').value
  };

  const lista = obterAgendamentos();
  lista.push(novo);
  salvarAgendamentos(lista);
  renderizarAgendamentos();

  mostrarMensagem('msg-agendamento', `✅ Visita agendada, ${novo.nome}! Confira os detalhes abaixo.`);
  e.target.reset();
});

// Renderiza a lista ao carregar a página
renderizarAgendamentos();

// ===== 6. PAGAMENTO =====
document.getElementById('form-pagamento').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!pagItem.value) {
    mostrarMensagem('msg-pagamento', '⚠️ Selecione um livro primeiro clicando em "Comprar".');
    return;
  }

  mostrarMensagem('msg-pagamento', `✅ Pagamento de R$ ${pagTotal.value} referente a "${pagItem.value}" realizado com sucesso!`);
  e.target.reset();
  pagItem.value = '';
  pagTotal.value = '';
});

// ===== 7. CONTATO =====
document.getElementById('form-contato').addEventListener('submit', (e) => {
  e.preventDefault();
  mostrarMensagem('msg-contato', '✅ Mensagem enviada! Responderemos em breve no seu e-mail.');
  e.target.reset();
});

// ===== 8. AVALIAÇÕES =====
const listaAvaliacoes = document.getElementById('lista-avaliacoes');

const avaliacoesIniciais = [
  { autor: 'Maria Silva', estrelas: 5, texto: 'Livraria maravilhosa, atendimento nota 10!' },
  { autor: 'João Pereira', estrelas: 4, texto: 'Ótimo acervo e preços justos.' }
];

let avaliacoes = JSON.parse(localStorage.getItem('avaliacoes'));

if (!avaliacoes || avaliacoes.length === 0) {
  avaliacoes = avaliacoesIniciais;
  localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
}

function renderizarAvaliacoes() {
  listaAvaliacoes.innerHTML = '';

  avaliacoes.forEach(av => {
    const div = document.createElement('div');
    div.classList.add('avaliacao');

    const autor = document.createElement('p');
    autor.classList.add('autor');
    autor.textContent = av.autor;

    const estrelas = document.createElement('p');
    estrelas.classList.add('estrelas');
    estrelas.textContent = '★'.repeat(av.estrelas) + '☆'.repeat(5 - av.estrelas);

    const texto = document.createElement('p');
    texto.textContent = av.texto;

    div.append(autor, estrelas, texto);
    listaAvaliacoes.appendChild(div);
  });
}

renderizarAvaliacoes();

document.getElementById('form-avaliacao').addEventListener('submit', (e) => {
  e.preventDefault();

  const novaAvaliacao = {
    autor: e.target.querySelector('input[type="text"]').value,
    estrelas: Number(document.getElementById('estrelas').value),
    texto: e.target.querySelector('textarea').value
  };

  avaliacoes.push(novaAvaliacao);
  localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
  renderizarAvaliacoes();

  e.target.reset();
});

// ===== 9. CARROSSEL ROTATIVO DO CATÁLOGO =====
const carrossel = document.getElementById('carrossel');
const trilha = carrossel.querySelector('.carrossel-trilha');
const containerDots = carrossel.querySelector('.carrossel-dots');
const btnAnterior = carrossel.querySelector('.anterior');
const btnProximo = carrossel.querySelector('.proximo');

const totalSlides = trilha.children.length;
const INTERVALO_MS = 4000;

let indiceAtual = 0;
let timerCarrossel = null;

// Quantos livros aparecem ao mesmo tempo, conforme a tela
function livrosVisiveis() {
  if (window.innerWidth < 600) return 1;
  if (window.innerWidth < 900) return 2;
  return 3;
}

function maxIndice() {
  return Math.max(0, totalSlides - livrosVisiveis());
}

function atualizarCarrossel() {
  const passo = 100 / livrosVisiveis();
  trilha.style.transform = `translateX(-${indiceAtual * passo}%)`;

  [...containerDots.children].forEach((dot, i) => {
    dot.classList.toggle('ativo', i === indiceAtual);
  });
}

function criarDots() {
  containerDots.innerHTML = '';
  for (let i = 0; i <= maxIndice(); i++) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Ir para a posição ${i + 1}`);
    dot.addEventListener('click', () => {
      indiceAtual = i;
      atualizarCarrossel();
      reiniciarIntervalo();
    });
    containerDots.appendChild(dot);
  }
}

function avancar() {
  indiceAtual = indiceAtual >= maxIndice() ? 0 : indiceAtual + 1;
  atualizarCarrossel();
}

function voltar() {
  indiceAtual = indiceAtual <= 0 ? maxIndice() : indiceAtual - 1;
  atualizarCarrossel();
}

function reiniciarIntervalo() {
  clearInterval(timerCarrossel);
  timerCarrossel = setInterval(avancar, INTERVALO_MS);
}

// Navegação manual
btnProximo.addEventListener('click', () => { avancar(); reiniciarIntervalo(); });
btnAnterior.addEventListener('click', () => { voltar(); reiniciarIntervalo(); });

// Pausa com o mouse em cima
carrossel.addEventListener('mouseenter', () => clearInterval(timerCarrossel));
carrossel.addEventListener('mouseleave', reiniciarIntervalo);

// Reajusta ao redimensionar a janela
window.addEventListener('resize', () => {
  indiceAtual = Math.min(indiceAtual, maxIndice());
  criarDots();
  atualizarCarrossel();
});

// Inicialização
criarDots();
atualizarCarrossel();
reiniciarIntervalo();