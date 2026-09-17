/* ============================================
   CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
   ============================================ */

// Elementos do DOM - com tratamento de erro
const canvas = document.getElementById('spaceInvaders');
const ctx = canvas.getContext('2d');

if (!ctx) {
  console.error('Erro: Não foi possível obter contexto do canvas!');
}

const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');

// Configurações do jogo
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ALIEN_BULLET_SPEED = 3;

// Estado do jogo
let gameRunning = false;
let score = 0;
let lives = 3;
let level = 1;
let animationId = null;

// Jogador (nave)
let player = {
  x: CANVAS_WIDTH / 2 - 25,
  y: CANVAS_HEIGHT - 40,
  width: 50,
  height: 30,
  dx: 0,
  visible: true
};

// Arrays de objetos
let bullets = [];
let alienBullets = [];
let aliens = [];
let stars = [];

// Movimento dos aliens
let alienDirection = 1;

/* ============================================
   FUNÇÕES DE INICIALIZAÇÃO
   ============================================ */

function init() {
  console.log('Jogo iniciado!');
  
  // Cria estrelas do fundo
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      size: Math.random() * 2 + 1
    });
  }
  
  // Desenha tela inicial
  drawInitialScreen();
}

function drawInitialScreen() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SPACE INVADERS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
  
  ctx.font = '16px Arial';
  ctx.fillText('Clique em Iniciar para começar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  
  // Desenha estrelas
  ctx.fillStyle = '#FFFFFF';
  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  bullets = [];
  alienBullets = [];
  player.x = CANVAS_WIDTH / 2 - 25;
  player.dx = 0;
  player.visible = true;
  alienDirection = 1;
  
  scoreElement.textContent = score;
  livesElement.textContent = lives;
  levelElement.textContent = level;
  
  createAliens();
}

function createAliens() {
  aliens = [];
  const cols = 8;
  const rows = 4;
  const startX = 50;
  const startY = 50;
  const alienWidth = 40;
  const alienHeight = 30;
  const padding = 15;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      aliens.push({
        x: startX + col * (alienWidth + padding),
        y: startY + row * (alienHeight + padding),
        width: alienWidth,
        height: alienHeight,
        alive: true,
        type: row
      });
    }
  }
}

/* ============================================
   SISTEMA DE JOGO PRINCIPAL
   ============================================ */

function startGame() {
  if (gameRunning) return;
  
  resetGame();
  gameRunning = true;
  startBtn.textContent = 'Reiniciar';
  gameLoop();
}

function gameLoop() {
  if (!gameRunning) return;
  
  update();
  draw();
  
  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  // Move jogador
  player.x += player.dx;
  
  // Limites da nave
  if (player.x < 0) player.x = 0;
  if (player.x > CANVAS_WIDTH - player.width) {
    player.x = CANVAS_WIDTH - player.width;
  }
  
  // Atualiza tiros do jogador
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= BULLET_SPEED;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }
  
  // Atualiza tiros dos aliens
  for (let i = alienBullets.length - 1; i >= 0; i--) {
    alienBullets[i].y += ALIEN_BULLET_SPEED;
    if (alienBullets[i].y > CANVAS_HEIGHT) {
      alienBullets.splice(i, 1);
    }
  }
  
  // Move aliens
  moveAliens();
  
  // Verifica colisões
  checkCollisions();
  
  // Verifica fim do nível
  checkLevelComplete();
}

function moveAliens() {
  let hitEdge = false;
  const aliveAliens = aliens.filter(a => a.alive);
  
  if (aliveAliens.length === 0) return;
  
  // Verifica bordas
  for (let alien of aliveAliens) {
    if (alienDirection === 1 && alien.x + alien.width > CANVAS_WIDTH - 10) {
      hitEdge = true;
    } else if (alienDirection === -1 && alien.x < 10) {
      hitEdge = true;
    }
  }
  
  // Desce e inverte se bateu na borda
  if (hitEdge) {
    alienDirection *= -1;
    for (let alien of aliens) {
      alien.y += 20;
    }
  }
  
  // Move na direção atual
  for (let alien of aliveAliens) {
    alien.x += alienDirection * 1.5;
  }
  
  // Tiro aleatório dos aliens
  if (Math.random() < 0.02 && aliveAliens.length > 0) {
    const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
    alienBullets.push({
      x: shooter.x + shooter.width / 2 - 2,
      y: shooter.y + shooter.height,
      width: 4,
      height: 12
    });
  }
  
  // Verifica se aliens chegaram na base
  for (let alien of aliveAliens) {
    if (alien.y + alien.height >= player.y - 10) {
      gameOver();
    }
  }
}

function checkCollisions() {
  // Tiros do jogador atingem aliens
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    for (let alien of aliens) {
      if (!alien.alive) continue;
      
      if (bullet.x < alien.x + alien.width &&
          bullet.x + bullet.width > alien.x &&
          bullet.y < alien.y + alien.height &&
          bullet.y + bullet.height > alien.y) {
        
        alien.alive = false;
        bullets.splice(i, 1);
        score += 10 * (alien.type + 1);
        scoreElement.textContent = score;
        break;
      }
    }
  }
  
  // Tiros dos aliens atingem jogador
  for (let bullet of alienBullets) {
    if (bullet.x < player.x + player.width &&
        bullet.x + bullet.width > player.x &&
        bullet.y < player.y + player.height &&
        bullet.y + bullet.height > player.y) {
      
      playerHit();
      break;
    }
  }
}

function playerHit() {
  lives--;
  livesElement.textContent = lives;
  
  if (lives <= 0) {
    gameOver();
  } else {
    // Efeito visual de dano
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

function checkLevelComplete() {
  const aliveCount = aliens.filter(a => a.alive).length;
  
  if (aliveCount === 0) {
    level++;
    levelElement.textContent = level;
    showMessage('NÍVEL ' + level + '!');
    
    setTimeout(() => {
      createAliens();
    }, 1500);
  }
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  ctx.fillStyle = '#CC0000';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px Arial';
  ctx.fillText('Pontuação: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
}

let messageText = '';
let messageTimer = 0;

function showMessage(text) {
  messageText = text;
  messageTimer = 100;
}

/* ============================================
   FUNÇÕES DE DESENHO
   ============================================ */

function draw() {
  // Limpa canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Desenha estrelas
  ctx.fillStyle = '#FFFFFF';
  for (let star of stars) {
    star.y += 0.5;
    if (star.y > CANVAS_HEIGHT) star.y = 0;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Desenha jogador
  drawPlayer();
  
  // Desenha aliens
  drawAliens();
  
  // Desenha tiros
  drawBullets();
  
  // Desenha mensagem
  if (messageTimer > 0) {
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(messageText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    messageTimer--;
  }
}

function drawPlayer() {
  if (!player.visible) return;
  
  // Nave (triângulo)
  ctx.fillStyle = '#CC0000';
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.closePath();
  ctx.fill();
  
  // Detalhe branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(player.x + 23, player.y + 5, 4, player.height - 10);
}

function drawAliens() {
  for (let alien of aliens) {
    if (!alien.alive) continue;
    
    switch (alien.type) {
      case 0: ctx.fillStyle = '#00FF00'; break;
      case 1: ctx.fillStyle = '#FFFF00'; break;
      case 2: ctx.fillStyle = '#00FFFF'; break;
      default: ctx.fillStyle = '#CC0000';
    }
    
    ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
    
    // Olhos
    ctx.fillStyle = '#000000';
    ctx.fillRect(alien.x + 8, alien.y + 8, 8, 8);
    ctx.fillRect(alien.x + alien.width - 16, alien.y + 8, 8, 8);
  }
}

function drawBullets() {
  // Tiros do jogador
  ctx.fillStyle = '#FF3333';
  for (let bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
  
  // Tiros dos aliens
  ctx.fillStyle = '#00FF00';
  for (let bullet of alienBullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

/* ============================================
   CONTROLES DE TECLADO
   ============================================ */

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    player.dx = -PLAYER_SPEED;
    event.preventDefault();
  }
  
  if (event.key === 'ArrowRight') {
    player.dx = PLAYER_SPEED;
    event.preventDefault();
  }
  
  if (event.key === ' ' && gameRunning) {
    if (bullets.length < 3) {
      bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 12
      });
    }
    event.preventDefault();
  }
  
  if (event.key.toLowerCase() === 'r') {
    startGame();
    event.preventDefault();
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    player.dx = 0;
  }
});

/* ============================================
   EVENTOS DE BOTÕES
   ============================================ */

startBtn.addEventListener('click', startGame);

/* ============================================
   INICIALIZAÇÃO
   ============================================ */

init();