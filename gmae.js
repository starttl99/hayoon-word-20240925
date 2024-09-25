const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('wordDisplay');

let gameSpeed = 2;
let score = 0;
let isGameOver = false;

const words = [
    { word: 'display', meaning: '전시하다' },
    { word: 'stray', meaning: '길을 잃다' },
    { word: 'railway', meaning: '철도' },
    { word: 'relay', meaning: '중계하다' },
    { word: 'bail', meaning: '보석금을 내다' },
    { word: 'wailing', meaning: '울부짖는' },
    { word: 'frail', meaning: '약한' },
    { word: 'fainting', meaning: '기절하는' },
    { word: 'claimed', meaning: '주장한' },
    { word: 'remain', meaning: '남다' },
    { word: 'pale', meaning: '창백한' },
    { word: 'parade', meaning: '행진' },
    { word: 'mistake', meaning: '실수' },
    { word: 'ache', meaning: '아프다' },
    { word: 'nickname', meaning: '별명' },
    { word: 'break', meaning: '부서지다' },
    { word: 'steak', meaning: '스테이크' },
    { word: 'eighteen', meaning: '열여덟' },
    { word: 'obeyed', meaning: '복종한' }
];

let wordIndex = 0;

const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    dy: 0,
    jumpForce: 15,
    gravity: 0.5,
    grounded: false,
    jump() {
        if (this.grounded) {
            this.dy = -this.jumpForce;
            this.grounded = false;
        }
    },
    update() {
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y + this.height >= canvas.height - 50) {
            this.y = canvas.height - this.height - 50;
            this.dy = 0;
            this.grounded = true;
        }
    },
    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

class Obstacle {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'enemy', 'spike', 'coin'
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        if (this.type === 'enemy') {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'spike') {
            ctx.fillStyle = 'gray';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'coin') {
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 100;

function spawnObstacle() {
    const typeChance = Math.random();
    let type;
    if (typeChance < 0.3) {
        type = 'enemy';
    } else if (typeChance < 0.6) {
        type = 'spike';
    } else {
        type = 'coin';
    }

    let obstacle;
    if (type === 'coin') {
        obstacle = new Obstacle(canvas.width, Math.random() * (canvas.height - 200) + 100, 20, 20, type);
    } else {
        obstacle = new Obstacle(canvas.width, canvas.height - 80, 30, 30, type);
    }

    obstacles.push(obstacle);
}

function resetGame() {
    player.x = 50;
    player.y = 300;
    player.dy = 0;
    score = 0;
    obstacles = [];
    isGameOver = false;
    wordIndex = 0;
    wordDisplay.innerHTML = '';
}

function update() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    ctx.fillStyle = 'brown';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // 플레이어 업데이트 및 그리기
    player.update();
    player.draw();

    // 장애물 생성
    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {
        spawnObstacle();
        obstacleTimer = 0;
    }

    // 장애물 업데이트 및 그리기
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.update();
        obs.draw();

        // 플레이어와 충돌 검사
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            if (obs.type === 'coin') {
                score += 10;
                displayWord();
                obstacles.splice(i, 1);
            } else {
                isGameOver = true;
                alert('게임 오버! 점수: ' + score);
                resetGame();
                return;
            }
        }

        // 화면 밖으로 나간 장애물 제거
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }

    // 점수 표시
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('점수: ' + score, 10, 30);

    requestAnimationFrame(update);
}

function displayWord() {
    if (wordIndex < words.length) {
        const currentWord = words[wordIndex];
        wordDisplay.innerHTML = `<strong>${currentWord.word}</strong> - ${currentWord.meaning}`;
        wordIndex++;
    } else {
        wordDisplay.innerHTML = '모든 단어를 학습하였습니다!';
    }
}

document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
        player.jump();
    }
});

update();
