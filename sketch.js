// ========== 游戏核心变量 ==========
let player, bullets = [], enemies = [], score = 0;
let gameOver = false, enemySpeed = 2;
let lastEnemySpawn = 0, enemySpawnInterval = 60;
let lastTouchX = null;

// ========== 音效系统 ==========
let shootSound, hitSound;
let audioEnabled = false;

function initAudio() {
  // 超短音效Base64（实际开发需替换为真实Base64编码）
  const soundBase64 = "UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...";
  
  shootSound = new Audio(`data:audio/wav;base64,${soundBase64}`);
  hitSound = new Audio(`data:audio/wav;base64,${soundBase64}`);
  
  // 静音预加载
  shootSound.volume = 0.5;
  hitSound.volume = 0.5;
}

function enableAudio() {
  if (audioEnabled) return;
  shootSound.play().then(() => {
    shootSound.pause();
    audioEnabled = true;
    console.log("音效已激活");
  }).catch(e => console.log("请点击页面任意位置激活音效"));
}

// ========== 游戏主逻辑 ==========
function setup() {
  createCanvas(480, 640);
  player = new Player();
  initAudio();
}

function draw() {
  background(20, 25, 40);
  drawStars();

  if (gameOver) {
    drawGameOver();
    return;
  }

  player.update();
  player.show();

  // 子弹逻辑
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    if (bullets[i].offscreen()) bullets.splice(i, 1);
  }

  // 敌人生成
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

    if (i < enemies.length && enemies[i].y > height - 40) {
      gameOver = true;
    }
  }

  // 显示分数
  fill(255);
  textSize(22);
  textAlign(LEFT, TOP);
  text("得分: " + score, 20, 20);
}

// ========== 玩家操作 ==========
function keyPressed() {
  if (gameOver && (key === 'r' || key === 'R')) resetGame();
  if (keyCode === LEFT_ARROW) player.setDir(-1);
  if (keyCode === RIGHT_ARROW) player.setDir(1);
  if (key === ' ') shoot();
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.setDir(0);
  }
}

function touchStarted() {
  enableAudio();
  if (gameOver) resetGame();
  lastTouchX = mouseX;
  shoot(); // 触摸即射击
  return false;
}

function touchMoved() {
  if (lastTouchX !== null) {
    player.x += mouseX - lastTouchX;
    player.x = constrain(player.x, 0, width - player.w);
    lastTouchX = mouseX;
  }
  return false;
}

function mousePressed() {
  enableAudio();
  shoot();
}

// ========== 游戏功能 ==========
function shoot() {
  bullets.push(new Bullet(player.x + player.w / 2, player.y));
  playShootSound();
}

function playShootSound() {
  if (!audioEnabled) return;
  shootSound.currentTime = 0;
  shootSound.play().catch(e => console.log("音效播放延迟"));
}

function playHitSound() {
  if (!audioEnabled) return;
  hitSound.currentTime = 0;
  hitSound.play().catch(e => console.log("音效播放延迟"));
}

function resetGame() {
  score = 0;
  bullets = [];
  enemies = [];
  gameOver = false;
  enemySpeed = 2;
  lastEnemySpawn = 0;
}

// ========== 游戏对象类 ==========
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
    return dist(this.x, this.y, bullet.x, bullet.y) < this.r + bullet.r;
  }
}

// ========== 视觉效果 ==========
function explosion(x, y) {
  for (let i = 0; i < 12; i++) {
    let angle = random(TWO_PI);
    let len = random(10, 30);
    stroke(255, 180, 80, 180);
    strokeWeight(random(2, 4));
    line(x, y, x + cos(angle) * len, y + sin(angle) * len);
  }
}

function drawStars() {
  for (let i = 0; i < 40; i++) {
    stroke(180, 220, 255, random(80, 180));
    point(random(width), random(height));
  }
}

function drawGameOver() {
  fill(255, 80, 80);
  textAlign(CENTER, CENTER);
  textSize(36);
  text('游戏结束', width / 2, height / 2 - 40);
  textSize(22);
  fill(255);
  text('得分: ' + score, width / 2, height / 2 + 10);
  textSize(16);
  fill(80, 200, 255);
  text('按 R 键或点击屏幕重玩', width / 2, height / 2 + 60);
}
