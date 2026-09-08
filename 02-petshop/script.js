// ============================================================
// PET SHOP Moradia dos Pets— Script principal
// Funções: tema dia/noite, pesquisa, filtros de categoria,
// pagamento, modal dos pets e agendamento.
// ============================================================

// Link usado no QR Code do Pix.
// ⚠️ SUBSTITUA pelo código "Pix Copia e Cola" real da loja!
const chavePix = "EXEMPLO-CHAVE-PIX-00020126580014BR.GOV.BCB.PIX";

// ---------- TEMA DIA / NOITE ----------
// Troca o atributo data-tema no <html>; o CSS cuida das cores.
function alternarTema() {
  const html = document.documentElement;
  const escuro = html.getAttribute('data-tema') === 'escuro';

  if (escuro) {
    html.removeAttribute('data-tema');
    document.getElementById('btn-tema').textContent = '🌙';
  } else {
    html.setAttribute('data-tema', 'escuro');
    document.getElementById('btn-tema').textContent = '☀️';
  }
}

// ---------- PESQUISA ----------
// Filtra os cards de produto pelo texto digitado (título ou data-nome).
function filtrarProdutos() {
  const termo = document.getElementById('campo-pesquisa').value.toLowerCase().trim();
  const produtos = document.querySelectorAll('.produto');
  let encontrados = 0;

  produtos.forEach(card => {
    const texto = (card.dataset.nome + ' ' + card.querySelector('h3').innerText).toLowerCase();
    const aparece = texto.includes(termo);
    card.classList.toggle('oculto', !aparece);   // mostra/esconde o card
    if (aparece) encontrados++;
  });

  // Mensagem quando nada é encontrado
  document.getElementById('sem-resultados').classList.toggle('oculto', encontrados > 0);
}

// ---------- FILTRO POR CATEGORIA ----------
// Mostra apenas os produtos da categoria clicada (combina com a pesquisa).
let categoriaAtiva = 'todos';   // guarda a seleção atual

function filtrarCategoria(cat, botao) {
  categoriaAtiva = cat;

  // Atualiza o destaque visual dos botões
  document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('ativo'));
  botao.classList.add('ativo');

  aplicarFiltros();
}

// Função central: aplica pesquisa + categoria juntos
function aplicarFiltros() {
  const termo = document.getElementById('campo-pesquisa').value.toLowerCase().trim();
  const produtos = document.querySelectorAll('.produto');
  let encontrados = 0;

  produtos.forEach(card => {
    const texto = (card.dataset.nome + ' ' + card.querySelector('h3').innerText).toLowerCase();
    const combinaBusca = texto.includes(termo);
    const combinaCategoria = categoriaAtiva === 'todos' || card.dataset.cat === categoriaAtiva;

    const visivel = combinaBusca && combinaCategoria;
    card.classList.toggle('oculto', !visivel);
    if (visivel) encontrados++;
  });

  document.getElementById('sem-resultados').classList.toggle('oculto', encontrados > 0);
}

// ---------- PAGAMENTO ----------
// Alterna entre as abas Pix / Crédito / Débito.
function selecionarMetodo(metodo, botaoClicado) {
  document.querySelectorAll('.area-pagamento').forEach(a => a.classList.remove('ativa'));
  document.querySelectorAll('.btn-pagamento').forEach(b => b.classList.remove('ativo'));

  const area = document.getElementById('pagamento-' + metodo);
  if (area) area.classList.add('ativa');
  if (botaoClicado) botaoClicado.classList.add('ativo');
}

// ---------- MODAL DOS PETS ----------
function mostrarPet(nome, mensagem, imgUrl) {
  document.getElementById('modal-nome').innerText = nome;
  document.getElementById('modal-mensagem').innerText = mensagem;
  document.getElementById('modal-img').src = imgUrl;
  document.getElementById('pet-modal').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('pet-modal').style.display = 'none';
}

// Fecha o modal ao clicar fora da caixa branca
window.addEventListener('click', event => {
  if (event.target.id === 'pet-modal') fecharModal();
});

// ---------- AGENDAMENTO ----------
// Valida o formulário e mostra uma confirmação na própria página.
function configurarAgendamento() {
  const form = document.getElementById('form-agendamento');
  form.addEventListener('submit', event => {
    event.preventDefault();  // impede o recarregamento da página

    const nome = document.getElementById('ag-nome').value.trim();
    const servico = document.getElementById('ag-servico').value;
    const data = document.getElementById('ag-data').value;
    const hora = document.getElementById('ag-hora').value;

    const confirmacao = document.getElementById('agendamento-ok');
    confirmacao.innerText =
      `✅ Obrigado, ${nome}! Seu pedido de "${servico}" em ${data} às ${hora} foi registrado. Confirmaremos pelo WhatsApp!`;
    confirmacao.classList.remove('oculto');

    form.reset();  // limpa os campos para novo agendamento
  });
}

// ---------- INICIALIZAÇÃO ----------
// Executa quando o HTML terminou de carregar.
window.addEventListener('DOMContentLoaded', () => {
  // Gera o QR Code do Pix com a biblioteca externa
  new QRCode(document.getElementById('qrcode'), {
    text: chavePix,
    width: 180,
    height: 180
  });

  // Liga os eventos aos elementos da página
  document.getElementById('btn-tema').addEventListener('click', alternarTema);
  document.getElementById('campo-pesquisa').addEventListener('input', aplicarFiltros);

  document.querySelectorAll('.btn-cat').forEach(botao => {
    botao.addEventListener('click', () => filtrarCategoria(botao.dataset.cat, botao));
  });

   configurarAgendamento();
  configurarChat();        // ✅ ativa o chatbot
});

// ============================================================
// CHATBOT "TOBIAS" — atendente virtual carismático 🐶
// Funciona por palavras-chave: nenhum servidor é necessário.
// ============================================================

// Base de conhecimento: cada entrada tem palavras-chave e respostas.
// A resposta pode ser uma string OU um array (o JS escolhe uma aleatória).
const baseConhecimento = [
  {
    chaves: ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'hey'],
    respostas: [
      'Au au! 🐾 Olá! Eu sou o Tobias, o cachorrinho do atendimento. Como posso ajudar?',
      'Oi oi! 🐕 Pronto pra te ajudar! Quer saber sobre produtos, serviços ou agendar algo?'
    ]
  },
  {
    chaves: ['horario', 'horário', 'aberto', 'fechado', 'funciona'],
    respostas: 'Estamos abertos de segunda a sábado, das 8h às 19h! ⏰ No domingo, só o sofá funciona (o meu, especialmente). 😴'
  },
  {
    chaves: ['entrega', 'delivery', 'frete', 'prazo'],
    respostas: [
      'Entregamos em até 2h na região central! 🚚 E o frete é GRÁTIS acima de R$ 150. Au au! 🐾',
      'Nossa patinha expressa entrega em até 2h! 🛴 Pedidos acima de R$ 150 nem pagam frete.'
    ]
  },
  {
    chaves: ['banho', 'tosa', 'grooming'],
    respostas: 'Banho e tosa é minha especialidade (sou muito fofo depois do banho, aliás ✨). Você pode agendar logo abaixo na seção "📅 Agende um Serviço"!'
  },
  {
    chaves: ['preco', 'preço', 'quanto custa', 'valor'],
    respostas: 'Os preços estão todos na página! 🏷️ E olha essa: o Combo Banho + Tosa está de R$ 120 por R$ 89,90. Cachorro esperto não deixa passar! 😉'
  },
  {
    chaves: ['veterinario', 'veterinária', 'vacina', 'consulta', 'doente', 'médico'],
    respostas: 'Temos consultas veterinárias e vacinação com profissionais excelentes! 🩺 Use o formulário de agendamento ou chame no WhatsApp que eu latinho pra eles.'
  },
  {
    chaves: ['pagamento', 'pix', 'cartão', 'cartao', 'débito', 'debito', 'credito'],
    respostas: 'Aceitamos Pix, crédito e débito! 💳 O QR Code do Pix está na seção de pagamento. Au au! 🐾'
  },
  {
    chaves: ['agendar', 'agenda', 'marcar', 'horário banho'],
    respostas: 'É só rolar até a seção "📅 Agende um Serviço", preencher nome, telefone, serviço, data e hora. Confirmamos pelo WhatsApp rapidinho! 🗓️'
  },
  {
    chaves: ['gato', 'gatos', 'miau', 'felino'],
    respostas: 'Ah, um amigo felino! 🐱 Temos areia sanitária premium, arranhadores e as melhores guloseimas. Meu primo gato aprova!'
  },
  {
    chaves: ['pássaro', 'passaro', 'calopsita', 'canário', 'ave', 'periquito'],
    respostas: 'Pássaros também são clientes VIPs aqui! 🦜 Temos mix de alpiste, gaiolas e poleiros. Piu piu! 🐤'
  },
  {
    chaves: ['obrigado', 'obrigada', 'valeu', 'vlw', 'brigado'],
    respostas: [
      'Eu que agradeço! 🐕 Qualquer coisa é só latir... digo, me chamar! 💚',
      'Por nada! Volte sempre, que aqui tem petisco! 🦴😄'
    ]
  },
  {
    chaves: ['piada', 'engraçado', 'engracado'],
    respostas: [
      'Por que o cachorro entrou no banco? Para fazer um depósito no ossato! 🦴😂',
      'O que o gato foi fazer na escola? Miauditar! 🐱📚'
    ]
  },
  {
    chaves: ['whatsapp', 'contato', 'telefone', 'email', 'e-mail', 'falar com humano'],
    respostas: 'Você pode falar com a equipe humana pelo WhatsApp (11) 99999-9999 ou pelo e-mail contato@auaumiau.com.br. Ambos estão na seção "📞 Fale Conosco"! 📲'
  },
  {
    chaves: ['tchau', 'adeus', 'flw', 'ate mais', 'até mais'],
    respostas: 'Tchau tchau! 🐾 VOLTE SEMPRE — prometo guardar um petisco virtual pra você! 🦴💚'
  }
];

// Resposta quando nenhuma palavra-chave combina
const respostasPadrao = [
  'Hmm... essa passou direto pelas minhas orelhas! 🐶 Tente perguntar sobre:\ndelivery • banho e tosa • veterinário • pagamento • agendamento',
  'Au au? 🤔 Não entendi muito bem, mas sei TUDO sobre produtos, serviços, delivery e agendamentos. Pode reformular?'
];

// ---------- FUNÇÕES DO CHAT ----------

// Adiciona um balão de mensagem na tela. quem='eu' (usuário) ou 'bot'.
function adicionarMensagem(texto, quem) {
  const area = document.getElementById('chat-mensagens');
  const balao = document.createElement('div');
  balao.className = 'msg msg-' + quem;
  balao.innerText = texto;
  area.appendChild(balao);
  area.scrollTop = area.scrollHeight;   // rola para a última mensagem
  limparSugestoes();
}

// Mostra "digitando..." por um tempo e SÓ DEPOIS responde (parece humano!)
function respostaBot(texto) {
  const area = document.getElementById('chat-mensagens');

  const digitando = document.createElement('div');
  digitando.className = 'msg msg-bot msg-digitando';
  digitando.innerText = 'Tobias está digitando...';
  area.appendChild(digitando);
  area.scrollTop = area.scrollHeight;

  // Tempo proporcional ao tamanho da resposta (máx. 1,2s)
  const espera = Math.min(600 + texto.length * 12, 1200);
  setTimeout(() => {
    digitando.remove();
    adicionarMensagem(texto, 'bot');
    mostrarSugestoes();   // reaparece as dicas do que perguntar
  }, espera);
}

// Procura na base de conhecimento qual resposta combina com a mensagem
function processarMensagem(textoUsuario) {
  const texto = texto.toLowerCase();

  for (const item of baseConhecimento) {
    const achou = item.chaves.some(chave => texto.includes(chave));
    if (achou) {
      // Se a resposta for um array, sorteia uma opção aleatória
      return Array.isArray(item.respostas)
        ? item.respostas[Math.floor(Math.random() * item.respostas.length)]
        : item.respostas;
    }
  }
  // Nada combinou: resposta genérica aleatória
  return respostasPadrao[Math.floor(Math.random() * respostasPadrao.length)];
}

// Mostra botões de sugestão (facilita quem não sabe o que perguntar)
function mostrarSugestoes() {
  const area = document.getElementById('chat-sugestoes');
  area.innerHTML = '';   // limpa as antigas

  ['🚚 Delivery', '🛁 Banho e tosa', '🩺 Veterinário', '💳 Pagamento'].forEach(sugestao => {
    const btn = document.createElement('button');
    btn.className = 'btn-sugestao';
    btn.innerText = sugestao;
    // ✅ agora chama a função certa (era enviarTexto, que não existia)
    btn.onclick = () => enviarMensagem(sugestao.replace(/^\S+\s/, '')); // remove o emoji
    area.appendChild(btn);
  });
}

function limparSugestoes() {
  document.getElementById('chat-sugestoes').innerHTML = '';
}

// Recebe o texto do usuário, mostra e dispara a resposta
// (parâmetro renomeado p/ 'textoManual' — não pode repetir o nome
//  de uma constante interna, senão dá SyntaxError no arquivo TODO)
function enviarMensagem(textoManual) {
  const input = document.getElementById('chat-input');
  const texto = (textoManual || input.value).trim();
  if (!texto) return;                 // ignora mensagens vazias

  adicionarMensagem(texto, 'eu');     // balão do usuário
  input.value = '';                   // limpa o campo
  respostaBot(processarMensagem(texto));
}

// Abre/fecha a janela do chat + boas-vindas na primeira vez
let chatAberto = false;
function alternarChat() {
  const janela = document.getElementById('chat-janela');
  chatAberto = !chatAberto;
  janela.classList.toggle('oculto', !chatAberto);

  // Primeira abertura: Tobias se apresenta
  if (chatAberto && !janela.dataset.iniciado) {
    janela.dataset.iniciado = 'sim';
    respostaBot('AU AU! 🐕 Sou o Tobias, o assistente de quatro patas do AuAu & Miau!\nPergunte sobre delivery, banho, tosa, veterinário, pagamento ou agendamento. O que você precisa? 🐾');
  }
}

// Configura o formulário e o botão de alternância
function configurarChat() {
  document.getElementById('chat-form').addEventListener('submit', e => {
    e.preventDefault();
    enviarMensagem();
  });

  // Deixo o botão do chat com pulso discreto para chamar atenção
  const botao = document.getElementById('chat-toggle');
  setInterval(() => {
    if (!chatAberto) {
      botao.style.transform = 'scale(1.08)';
      setTimeout(() => { if (!chatAberto) botao.style.transform = 'scale(1)'; }, 300);
    }
  }, 4000);
}