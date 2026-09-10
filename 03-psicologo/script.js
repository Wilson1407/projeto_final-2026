/* ============================================================
   SCRIPT.JS — Página da Psicóloga
   Funções: 1) Agendamento  2) Chatbox  3) Melhorias de navegação
   ============================================================ */

// Envolve todo o código em uma função para evitar conflitos
// de nomes caso outros scripts sejam adicionados no futuro
(function () {
  "use strict"; // Modo estrito: torna erros comuns visíveis

  /* ----------------------------------------------------------
     1) AGENDAMENTO
     Ao enviar o formulário, valida os dados e mostra
     uma mensagem de confirmação na tela.
  ---------------------------------------------------------- */
  const formAgendamento = document.getElementById("form-agendamento");
  const msgConfirmacao = document.getElementById("confirmacao");

  formAgendamento.addEventListener("submit", function (evento) {
    // Impede o comportamento padrão do formulário,
    // que seria recarregar a página
    evento.preventDefault();

    // Captura os valores escolhidos pelo usuário
    const data = document.getElementById("campo-data").value;
    const horario = document.getElementById("campo-horario").value;

    // Validação: impede agendamento em data passada
    const hoje = new Date().toISOString().split("T")[0]; // "AAAA-MM-DD" de hoje
    if (data < hoje) {
      msgConfirmacao.style.color = "#c62828"; // vermelho para erro
      msgConfirmacao.textContent = "Escolha uma data futura para o agendamento.";
      return; // Encerra sem confirmar
    }

    // Se passou na validação, monta a mensagem de confirmação
    msgConfirmacao.style.color = ""; // volta à cor padrão (verde do CSS)
    msgConfirmacao.textContent =
      "✅ Agendamento solicitado para " +
      formatarData(data) +
      " às " +
      horario +
      ". Confirmaremos por WhatsApp em breve!";

    // Limpa o formulário após o envio
    formAgendamento.reset();
  });

  /* Função auxiliar: transforma "2026-09-20" em "20/09/2026" */
  function formatarData(dataISO) {
    const partes = dataISO.split("-"); // separa ano, mês e dia
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  /* ----------------------------------------------------------
     2) CHATBOX (simulado)
     Exibe a mensagem do usuário na área de conversa
     e responde com um aviso automático.
     (Num site real, aqui entraria uma API de atendimento.)
  ---------------------------------------------------------- */
  const formChat = document.getElementById("form-chat");
  const areaChat = document.getElementById("chat-area");
  const campoMensagem = document.getElementById("campo-mensagem");

  formChat.addEventListener("submit", function (evento) {
    evento.preventDefault(); // não recarrega a página

    const texto = campoMensagem.value.trim(); // remove espaços extras

    // Ignora envio de mensagem vazia
    if (texto === "") return;

    // Cria o balão com a mensagem do usuário
    const bolhaUsuario = document.createElement("div");
    bolhaUsuario.className = "chat-bolha usuario"; // estilo de quem fala
    bolhaUsuario.textContent = texto;
    areaChat.appendChild(bolhaUsuario);

    // Cria a resposta automática simulada
    const bolhaResposta = document.createElement("div");
    bolhaResposta.className = "chat-bolha resposta";
    bolhaResposta.textContent =
      "Recebemos sua mensagem! Respondemos em até 24 horas. 💜";
    areaChat.appendChild(bolhaResposta);

    // Rolagem automática para ver a última mensagem
    areaChat.scrollTop = areaChat.scrollHeight;

    // Limpa o campo e devolve o foco para digitar de novo
    campoMensagem.value = "";
    campoMensagem.focus();
  });

  /* ----------------------------------------------------------
     3) MELHORIAS DE NAVEGAÇÃO
     Destaca o link do menu da seção que está visível
     e fecha o scroll suavemente ao clicar.
  ---------------------------------------------------------- */

  // Scroll suave: ao clicar em um link do menu (#pagamento etc.),
  // a página desliza até a seção em vez de "pular" de vez
  document.querySelectorAll('header nav a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (evento) {
      evento.preventDefault();

      // Localiza a seção destino pelo id do href (ex.: "#contato")
      const destino = document.querySelector(link.getAttribute("href"));
      if (destino) {
        destino.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
})();

/* ============================================================
   MODO DIA E NOITE
   Alterna o tema, salva a preferência no navegador
   e aplica automaticamente na próxima visita.
============================================================ */
(function () {
  // Referências usadas em todo o bloco
  const botaoTema = document.getElementById("botao-tema");
  if (!botaoTema) return; // proteção: só executa se o botão existir

  const CHAVE_MEMORIA = "tema-preferido"; // chave única do localStorage

  /* Função aplicarModo: aplica/remove o tema e atualiza o botão */
  function aplicarModo(escuro) {
    document.body.classList.toggle("modo-noite", escuro);
    botaoTema.textContent = escuro ? "☀️ Dia" : "🌙 Noite";
  }

  /* Ao carregar a página: restaura a preferência salva */
  if (localStorage.getItem(CHAVE_MEMORIA) === "noite") {
    aplicarModo(true);
  }

  /* Clique no botão: inverte o estado e salva a escolha */
  botaoTema.addEventListener("click", function () {
    const escuro = !document.body.classList.contains("modo-noite");
    aplicarModo(escuro);
    localStorage.setItem(CHAVE_MEMORIA, escuro ? "noite" : "dia");
  });
})();