/* =======================================
   1. VARIAVEIS DE ESTADO E ELEMENTOS
   ======================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    const canvas = document.getElementById('pongCanvas');
    const startResetButton = document.getElementById('startResetButton');
    const themeSwitchBtn = document.getElementById('theme-switch-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    if (!canvas || !startResetButton) {
        console.error("Elementos 'pongCanvas' ou 'startResetButton' não encontrados.");
        return;
    }

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    let gameRunning = false;

    // =======================================
    // 2. DEFINIÇÕES DOS OBJETOS DO JOGO
    // =======================================
    const ball = {
        x: W / 2,
        y: H / 2,
        radius: 7,
        speed: 5,
        dx: 5,
        dy: 5,
        color: '#FFFFFFFF'
    };

    const player = {
        x: 10,
        y: H / 2 - 40,
        width: 10,
        height: 80,
        speed: 6,
        dy: 0,
        score: 0,
        color: '#FF0077'
    };

    const computer = {
        x: W - 20,
        y: H / 2 - 40,
        width: 10,
        height: 80,
        speed: 4,
        dy: 0,
        score: 0,
        color: '#00FFFF'
    };

    // =======================================
    // 3. FUNÇÕES DE DESENHO
    // =======================================
    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawBall(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

    function drawScore() {
        ctx.fillStyle = 'white';
        ctx.font = '30px "Segoe UI", Arial'; 
        ctx.fillText(player.score, W / 4, 30);
        ctx.fillText(computer.score, W * 3 / 4, 30);
    }

    // =======================================
    // 4. LÓGICA DE MOVIMENTO E PONTO
    // =======================================
    function moveBall() {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Colisão com teto e chão
        if (ball.y + ball.radius > H || ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }
        
        // Ponto para o computador (bola saiu pela esquerda)
        if (ball.x - ball.radius < 0) {
            computer.score++;
            resetBall();
        } 
        // Ponto para o jogador (bola saiu pela direita)
        else if (ball.x + ball.radius > W) {
            player.score++;
            resetBall();
        }
    }

    function resetBall() {
        ball.x = W / 2;
        ball.y = H / 2;
        ball.dx = -ball.dx;

        if (gameRunning) {
            ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed * 0.8; 
        } else {
            ball.dy = 0;
        }
    }

    function moveComputer() {
        const targetY = ball.y - computer.height / 2;
        const difference = targetY - computer.y;

        if (difference > 0) {
            computer.y += Math.min(computer.speed, difference);
        } else if (difference < 0) {
            computer.y += Math.max(-computer.speed, difference);
        }

        computer.y = Math.max(0, Math.min(computer.y, H - computer.height));
    }

    function movePlayer() {
        player.y += player.dy;
        player.y = Math.max(0, Math.min(player.y, H - player.height));
    }

    // =======================================
    // 5. LÓGICA DE COLISÃO
    // =======================================
    function checkCollision(b, p) {
        return (b.x + b.radius > p.x && 
                b.x - b.radius < p.x + p.width && 
                b.y + b.radius > p.y && 
                b.y - b.radius < p.y + p.height);
    }

    function handleCollision() {
        // Colisão com o jogador (esquerda)
        if (checkCollision(ball, player) && ball.dx < 0) {
            ball.dx = -ball.dx;
            let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
            ball.dy = collidePoint * ball.speed * 1.5;
        }

        // Colisão com o computador (direita)
        if (checkCollision(ball, computer) && ball.dx > 0) {
            ball.dx = -ball.dx;
            let collidePoint = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
            ball.dy = collidePoint * ball.speed * 1.5;
        }
    }

    // =======================================
    // 6. CONTROLE DO JOGO
    // =======================================
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
            startResetButton.textContent = "REINICIAR JOGO"; 
        }
    }

    function resetGame() {
        gameRunning = false;
        player.score = 0;
        computer.score = 0;
        player.y = H / 2 - player.height / 2;
        computer.y = H / 2 - computer.height / 2;
        player.dy = 0;
        resetBall();
        startResetButton.textContent = "INICIAR JOGO";
    }

    // =======================================
    // 7. LOOP PRINCIPAL
    // =======================================
    function gameLoop() {
        drawRect(0, 0, W, H, '#0D1317'); 
        drawRect(W / 2 - 1, 0, 2, H, '#444444');

        if (gameRunning) {
            moveBall();
            moveComputer();
            handleCollision();
            movePlayer();
        }

        drawRect(player.x, player.y, player.width, player.height, player.color);
        drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
        drawBall(ball.x, ball.y, ball.radius, ball.color);
        drawScore();

        requestAnimationFrame(gameLoop);
    }

    // =======================================
    // 8. EVENTOS DE ENTRADA (TECLADO)
    // =======================================
    document.addEventListener('keydown', (event) => {
        if ((event.key.toLowerCase() === 'w' || event.key.toLowerCase() === 's') && !gameRunning) {
            startGame();
        }

        if (event.key === 'w' || event.key === 'W') {
            player.dy = -player.speed;
        }
        if (event.key === 's' || event.key === 'S') {
            player.dy = player.speed;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'w' || event.key === 'W' || 
            event.key === 's' || event.key === 'S') {
            player.dy = 0;
        }
    });

    // =======================================
    // 9. EVENTO DO BOTÃO INICIAR/REINICIAR
    // =======================================
    startResetButton.addEventListener('click', () => {
        if (gameRunning) {
            resetGame();
        } else {
            startGame();
        }
    });

    // =======================================
    // 10. CONTROLE DE TEMA (opcional no Pong)
    // =======================================
    function loadTheme() {
        let savedTheme = localStorage.getItem('theme');
        if (savedTheme && themeIcon) {
            document.body.setAttribute('data-theme', savedTheme);
            if (savedTheme === 'dark') {
                themeIcon.textContent = 'light_mode';
            } else {
                themeIcon.textContent = 'dark_mode';
            }
        }
    }

    if (themeSwitchBtn && themeIcon) {
        themeSwitchBtn.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            themeIcon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
        });
    }

    loadTheme();

    // =======================================
    // 11. INICIALIZAÇÃO
    // =======================================
    resetGame();
    gameLoop();
});