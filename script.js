const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

let leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 10,
    score: 0
};

let rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 5,
    speed: 5,
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: 5,
    dy: 5
};

let devToolsActive = false;
let aiPaused = false; // Nova variável para pausar o adversário

// Definir níveis de dificuldade
let difficulty = 'normal'; // Opções: 'easy', 'normal', 'hard'

function setDifficulty(level) {
    difficulty = level;
    if (level === 'easy') {
        rightPaddle.speed = 3;
    } else if (level === 'normal') {
        rightPaddle.speed = 5;
    } else if (level === 'hard') {
        rightPaddle.speed = 8;
    }
}

// Capturar a tecla pressionada para controle da raquete e dificuldade
document.addEventListener('keydown', function(event) {
    if (event.key === 'o') {
        devToolsActive = !devToolsActive;
    }

    if (devToolsActive) {
        if (event.key === 'q') {
            aiPaused = !aiPaused; // Alterna entre pausar e despausar o adversário
        } else if (event.key === 'v') {
            ball.dx *= 0.5; // Diminui a velocidade da bola
            ball.dy *= 0.5;
        }
    }

    if (event.key === '1') {
        setDifficulty('easy');
    } else if (event.key === '2') {
        setDifficulty('normal');
    } else if (event.key === '3') {
        setDifficulty('hard');
    } else if (event.key === 'w') {
        leftPaddle.dy = -leftPaddle.speed;
    } else if (event.key === 's') {
        leftPaddle.dy = leftPaddle.speed;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'w' || event.key === 's') {
        leftPaddle.dy = 0;
    }
});

let backgroundImage = new Image();
backgroundImage.src = 'pblsch.png';

let powerUp = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 15,
    dx: (Math.random() - 0.5) * 4,
    dy: (Math.random() - 0.5) * 4,
    active: true
};

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawScore() {
    const scoreColor = '#003366';

    for (let i = 0; i < leftPaddle.score; i++) {
        drawCircle(30 + i * 20, 20, 8, scoreColor);
    }
    for (let i = 0; i < rightPaddle.score; i++) {
        drawCircle(canvas.width - 30 - i * 20, 20, 8, scoreColor);
    }
}

function drawPowerUp() {
    if (powerUp.active) {
        drawCircle(powerUp.x, powerUp.y, powerUp.radius, '#FF00FF');
    }
}

function drawControlMenu() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';

    ctx.fillText('Controles:', 20, canvas.height - 90);
    ctx.fillText('Mouse: Mover a raquete', 20, canvas.height - 70);
    ctx.fillText('Teclas:', 20, canvas.height - 50);
    ctx.fillText('W: Mover para cima', 20, canvas.height - 30);
    ctx.fillText('S: Mover para baixo', 20, canvas.height - 10);

    ctx.fillText('Dificuldade:', canvas.width - 150, canvas.height - 90);
    ctx.fillText('1: Fácil', canvas.width - 150, canvas.height - 70);
    ctx.fillText('2: Normal', canvas.width - 150, canvas.height - 50);
    ctx.fillText('3: Difícil', canvas.width - 150, canvas.height - 30);

    ctx.fillText(`Nível Atual: ${difficulty}`, canvas.width - 150, canvas.height - 10);

    if (devToolsActive) {
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText('Dev Tools Active', canvas.width / 2 - 80, 40);
    }
}

function movePaddle(paddle) {
    paddle.y += paddle.dy;

    if (paddle.y < 0) {
        paddle.y = 0;
    } else if (paddle.y + paddle.height > canvas.height) {
        paddle.y = canvas.height - paddle.height;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (
        (ball.x - ball.radius < leftPaddle.x + leftPaddle.width && ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.height) ||
        (ball.x + ball.radius > rightPaddle.x && ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height)
    ) {
        ball.dx *= -1;
    }

    if (ball.x + ball.radius > canvas.width) {
        leftPaddle.score++;
        resetBall();
    } else if (ball.x - ball.radius < 0) {
        rightPaddle.score++;
        resetBall();
    }
}

function movePowerUp() {
    powerUp.x += powerUp.dx;
    powerUp.y += powerUp.dy;

    if (powerUp.x + powerUp.radius > canvas.width || powerUp.x - powerUp.radius < 0) {
        powerUp.dx *= -1;
    }
    if (powerUp.y + powerUp.radius > canvas.height || powerUp.y - powerUp.radius < 0) {
        powerUp.dy *= -1;
    }
}

function checkPowerUpCollision() {
    if (
        powerUp.active &&
        ball.x + ball.radius > powerUp.x - powerUp.radius &&
        ball.x - ball.radius < powerUp.x + powerUp.radius &&
        ball.y + ball.radius > powerUp.y - powerUp.radius &&
        ball.y - ball.radius < powerUp.y + powerUp.radius
    ) {
        powerUp.active = false;
        ball.dx *= 1.5;
        ball.dy *= 1.5;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
}

function moveAIPaddle() {
    if (!aiPaused) {
        if (rightPaddle.y + rightPaddle.height / 2 < ball.y) {
            rightPaddle.dy = rightPaddle.speed;
        } else {
            rightPaddle.dy = -rightPaddle.speed;
        }
    } else {
        rightPaddle.dy = 0; // Adversário fica parado se "aiPaused" estiver ativo
    }

    movePaddle(rightPaddle);
}

function update() {
    movePaddle(leftPaddle);
    moveBall();
    moveAIPaddle();
    movePowerUp();
    checkPowerUpCollision();
}

function draw() {
    drawBackground();
    drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#fff');
    drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#fff');
    drawCircle(ball.x, ball.y, ball.radius, '#fff');
    drawScore();
    drawPowerUp();
    drawControlMenu();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
    leftPaddle.y = event.clientY - canvas.getBoundingClientRect().top - leftPaddle.height / 2;
});

setDifficulty('normal'); // Define a dificuldade inicial para 'normal'
gameLoop();
