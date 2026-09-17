/* ============================================
   CONFIGURAÇÃO INICIAL DO JOGO
   ============================================ */

// Elementos do DOM que vamos usar
const canvas = document.getElementById('snakeGame');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const restartBtn = document.getElementById('restart-btn');

// Configurações do jogo
const gridSize = 20;           // Tamanho de cada quadrado da grade (em pixels)
const tileCount = canvas.width / gridSize;  // Quantidade de tiles no canvas (400/20 = 20)

// Velocidade do jogo (quanto menor, mais rápido)
let gameSpeed = 100;

// Variáveis de estado do jogo
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;  // Recorde salvo no navegador
let snake = [];                 // Array que guarda as posições da cobra
let food = {};                  // Posição da comida
let direction = 'right';        // Direção inicial da cobra
let nextDirection = 'right';    // Próxima direção (evita giros de 180 graus)
let gameInterval;               // Intervalo do loop do jogo
let isGameOver = false;         // Flag para saber se o jogo acabou

// Inicializa o placar ao carregar
highScoreElement.textContent = highScore;

/* ============================================
   FUNÇÃO: INICIAR/JOGAR REINICIADO
   ============================================ */

function initGame() {
  // Reinicia o estado do jogo
  snake = [
    { x: 10, y: 10 },  // Cabeça
    { x: 9, y: 10 },   // Corpo
    { x: 8, y: 10 }    // Cauda
  ];
  
  score = 0;
  scoreElement.textContent = score;
  direction = 'right';
  nextDirection = 'right';
  isGameOver = false;
  
  // Limpa qualquer intervalo anterior e cria novo
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(update, gameSpeed);
  
  // Coloca a primeira comida
  placeFood();
  
  // Desenha a cena inicial
  draw();
}

/* ============================================
   FUNÇÃO: COLocar COMIDA EM POSIÇÃO ALEATÓRIA
   ============================================ */

function placeFood() {
  // Gera posição aleatória para a comida
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  
  // Verifica se a comida não caiu em cima da cobra
  for (let segment of snake) {
    if (segment.x === food.x && segment.y === food.y) {
      placeFood();  // Tenta novamente se estiver em cima da cobra
      return;
    }
  }
}

/* ============================================
   FUNÇÃO: ATUALIZAR ESTADO DO JOGO
   ============================================ */

function update() {
  // Atualiza a direção atual (segura contra giros de 180°)
  direction = nextDirection;
  
  // Calcula nova posição da cabeça
  const head = { ...snake[0] };  // Cria uma cópia da cabeça
  
  switch (direction) {
    case 'up':    head.y--; break;
    case 'down':  head.y++; break;
    case 'left':  head.x--; break;
    case 'right': head.x++; break;
  }
  
  // VERIFICA COLISÃO com paredes
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }
  
  // VERIFICA COLISÃO com o próprio corpo
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      gameOver();
      return;
    }
  }
  
  // Adiciona nova cabeça ao início do array
  snake.unshift(head);
  
  // VERIFICA SE COMEU A COMIDA
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    placeFood();  // Coloca nova comida
    
    // Atualiza recorde se necessário
    if (score > highScore) {
      highScore = score;
      highScoreElement.textContent = highScore;
      localStorage.setItem('snakeHighScore', highScore);
    }
  } else {
    // Se não comeu, remove a cauda (movimento normal)
    snake.pop();
  }
  
  // Redesenha a tela
  draw();
}

/* ============================================
   FUNÇÃO: DESENHAR NA TELA
   ============================================ */

function draw() {
  // Limpa o canvas antes de redesenhar
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // DESENHA A COMIDA
  ctx.fillStyle = '#CC0000';  // Vermelho Drogasil
  ctx.beginPath();
  // Desenha como círculo
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // DESENHA A COBRA
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    
    // Cabeça é mais escura, corpo é mais claro
    ctx.fillStyle = i === 0 ? '#990000' : '#CC0000';
    
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
    
    // Adiciona olhos na cabeça
    if (i === 0) {
      ctx.fillStyle = '#FFFFFF';
      
      // Posiciona os olhos conforme a direção
      let eyeOffsetX1, eyeOffsetY1, eyeOffsetX2, eyeOffsetY2;
      
      switch (direction) {
        case 'right':
          eyeOffsetX1 = gridSize * 0.6; eyeOffsetY1 = gridSize * 0.25;
          eyeOffsetX2 = gridSize * 0.6; eyeOffsetY2 = gridSize * 0.75;
          break;
        case 'left':
          eyeOffsetX1 = gridSize * 0.25; eyeOffsetY1 = gridSize * 0.25;
          eyeOffsetX2 = gridSize * 0.25; eyeOffsetY2 = gridSize * 0.75;
          break;
        case 'up':
          eyeOffsetX1 = gridSize * 0.25; eyeOffsetY1 = gridSize * 0.25;
          eyeOffsetX2 = gridSize * 0.75; eyeOffsetY2 = gridSize * 0.25;
          break;
        case 'down':
          eyeOffsetX1 = gridSize * 0.25; eyeOffsetY1 = gridSize * 0.6;
          eyeOffsetX2 = gridSize * 0.75; eyeOffsetY2 = gridSize * 0.6;
          break;
      }
      
      // Desenha dois pequenos círculos brancos
      ctx.beginPath();
      ctx.arc(
        segment.x * gridSize + eyeOffsetX1,
        segment.y * gridSize + eyeOffsetY1,
        2, 0, Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        segment.x * gridSize + eyeOffsetX2,
        segment.y * gridSize + eyeOffsetY2,
        2, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  // DESenha mensagem de GAME OVER
  if (isGameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '18px Arial';
    ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Clique em Reiniciar para jogar novamente', canvas.width / 2, canvas.height / 2 + 50);
  }
}

/* ============================================
   FUNÇÃO: FIM DE JOGO
   ============================================ */

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);  // Para o loop do jogo
  draw();  // Redesenha para mostrar mensagem de Game Over
}

/* ============================================
   CONTROLE POR TECLADO
   ============================================ */

document.addEventListener('keydown', (event) => {
  // Impede rolagem da página com as setas
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
  
  // Só muda direção se NÃO for giro de 180 graus
  switch (event.key) {
    case 'ArrowUp':
      if (direction !== 'down') nextDirection = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') nextDirection = 'down';
      break;
    case 'ArrowLeft':
      if (direction !== 'right') nextDirection = 'left';
      break;
    case 'ArrowRight':
      if (direction !== 'left') nextDirection = 'right';
      break;
  }
});

/* ============================================
   CONTROLE PELO BOTÃO REINICIAR
   ============================================ */

restartBtn.addEventListener('click', initGame);

/* ============================================
   INICIALIZAÇÃO AO CARREGAR A PÁGINA
   ============================================ */

initGame();