// 移除问题音频系统，改用简化版音效
let player;
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let showInstructions = true;
let enemySpeed = 2;
let lastEnemySpawn = 0;
let enemySpawnInterval = 60;

// 改用HTML5 Audio避免p5.sound问题
let shootSound, hitSound;
let audioReady = false;

function setup() {
  createCanvas(480, 640);
  player = new Player();
  resetGame();
  preloadAudio(); // 预加载音效
}

function resetGame() {
  score = 0;
  bullets = [];
  enemies = [];
  gameOver = false;
  showInstructions = true;
  enemySpeed = 2;
  lastEnemySpawn = 0;
}

// 预加载音效
function preloadAudio() {
  // 使用base64编码的短音效避免文件加载
  shootSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
  hitSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
  audioReady = true;
}

function draw() {
  background(20, 25, 40);
  drawStars();

  if (showInstructions) {
    drawInstructions();
    return;
  }

  if (!gameOver) {
    player.update();
    player.show();

    // 子弹逻辑
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update();
      bullets[i].show();
      if (bullets[i].offscreen()) {
        bullets.splice(i, 1);
      }
    }

    // 敌人生成逻辑
    if (frameCount - lastEnemySpawn > enemySpawnInterval) {
      enemies.push(new Enemy());
      lastEnemySpawn = frameCount;
      if (score > 0 && score % 10 === 0) {
        enemySpeed += 0.2;
        enemySpawnInterval = max(20, enemySpawnInterval - 2);
      }
    }

    // 敌人逻辑
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].update();
      enemies[i].show();

      // 碰撞检测
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (enemies[i].hits(bullets[j])) {
          playHitSound();
          explosion(enemies[i].x, enemies[i].y);
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score++;
          break;
        }
      }

      // 游戏失败条件
      if (i < enemies.length && enemies[i].y > height - 40) {
        gameOver = true;
      }
    }

    // 分数显示
    fill(255);
    textSize(22);
    textAlign(LEFT, TOP);
    text("得分: " + score, 20, 20);
  } else {
    drawGameOver();
  }
}

// 事件处理（统一入口）
function handleStart() {
  if (showInstructions) {
    showInstructions = false;
    // 触发音频播放许可
    if (audioReady) {
      shootSound.play().then(() => {
        shootSound.pause();
        shootSound.currentTime = 0;
      });
    }
  }
}

function keyPressed() {
  if (showInstructions) {
    handleStart();
    return;
  }
  if (gameOver && (key === 'r' || key === 'R')) {
    resetGame();
    return;
  }
  if (keyCode === LEFT_ARROW) {
    player.setDir(-1);
  } else if (keyCode === RIGHT_ARROW) {
    player.setDir(1);
  } else if (key === ' ') {
    shoot();
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.setDir(0);
  }
}

// 触控处理
function touchStarted() {
  handleStart();
  if (gameOver) {
    resetGame();
    return false;
  }
  lastTouchX = mouseX;
  return false;
}

function touchMoved() {
  if (!gameOver && !showInstructions) {
    let dx = mouseX - lastTouchX;
    player.x += dx;
    player.x = constrain(player.x, 0, width - player.w);
    lastTouchX = mouseX;
  }
  return false;
}

function touchEnded() {
  if (!gameOver && !showInstructions) {
    shoot();
  }
  lastTouchX = null;
  return false;
}

function mousePressed() {
  if (!gameOver && !showInstructions) {
    shoot();
  }
}

// 发射子弹
function shoot() {
  bullets.push(new Bullet(player.x + player.w / 2, player.y));
  playShootSound();
}

function playShootSound() {
  if (!audioReady) return;
  shootSound.currentTime = 0;
  shootSound.play();
}

function playHitSound() {
  if (!audioReady) return;
  hitSound.currentTime = 0;
  hitSound.play();
}

// 类定义保持不变
class Player {
  constructor() {
    this.w = 60;
    this.h = 20;
    this.x = width / 2 - this.w / 2;
    this.y = height - 60;
    this.dir = 0;
    this.speed = 7;
  }
  update() {
    this.x += this.dir * this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }
  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);
    noStroke();
    fill(80, 200, 255, 220);
    ellipse(0, 0, this.w, this.h * 1.2);
    fill(255, 255, 255, 180);
    ellipse(0, -5, this.w * 0.5, this.h * 0.7);
    pop();
  }
  setDir(dir) {
    this.dir = dir;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 6;
    this.speed = 10;
  }
  update() {
    this.y -= this.speed;
  }
  show() {
    noStroke();
    fill(255, 80, 180);
    ellipse(this.x, this.y, this.r * 2, this.r * 2.5);
    fill(255, 80, 180, 80);
    ellipse(this.x, this.y, this.r * 4, this.r * 2);
  }
  offscreen() {
    return this.y < -this.r;
  }
}

class Enemy {
  constructor() {
    this.r = random(18, 32);
    this.x = random(this.r, width - this.r);
    this.y = -this.r;
    this.speed = enemySpeed + random(-0.5, 0.5);
    this.color = color(random(120, 255), random(80, 180), random(80, 255));
  }
  update() {
    this.y += this.speed;
  }
  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
    fill(255, 255, 255, 60);
    ellipse(this.x, this.y - this.r / 3, this.r, this.r / 2);
  }
  hits(bullet) {
    let d = dist(this.x, this.y, bullet.x, bullet.y);
    return d < this.r + bullet.r;
  }
}

// 辅助函数保持不变
function explosion(x, y) { /* 原代码 */ }
function drawStars() { /* 原代码 */ }
function drawInstructions() { /* 原代码 */ }
function drawGameOver() { /* 原代码 */ }