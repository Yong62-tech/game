// ========== 游戏核心对象 ==========
let player, bullets = [], enemies = [], score = 0;
let gameOver = false, enemySpeed = 2, lastEnemySpawn = 0;

// ========== 音效系统 ==========
let shootSound, hitSound;
let audioEnabled = false;

function setup() {
  createCanvas(480, 640);
  player = new Player();
  
  // 初始化音效（Base64编码的短音效）
  shootSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...");
  hitSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...");
  
  // 绑定音效按钮
  document.getElementById('audio-btn').onclick = () => {
    shootSound.play().then(() => {
      shootSound.pause();
      audioEnabled = true;
      document.getElementById('audio-btn').remove();
    });
  };
}

// ========== 游戏主循环 ==========
function draw() {
  background(20, 25, 40);
  
  if (!gameOver) {
    player.update();
    player.show();

    // 敌人生成逻辑
    if (frameCount - lastEnemySpawn > 60) {
      enemies.push(new Enemy());
      lastEnemySpawn = frameCount;
    }

    // 更新敌人状态
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].update();
      enemies[i].show();
      
      // 碰撞检测
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (dist(enemies[i].x, enemies[i].y, bullets[j].x, bullets[j].y) < enemies[i].r + bullets[j].r) {
          if (audioEnabled) playHitSound();
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score++;
          break;
        }
      }
      
      if (enemies[i] && enemies[i].y > height - 40) gameOver = true;
    }

    // 显示得分
    fill(255);
    textSize(22);
    text("得分: " + score, 20, 20);
  } else {
    fill(255, 0, 0);
    textSize(36);
    textAlign(CENTER, CENTER);
    text("游戏结束\n按R键重玩", width/2, height/2);
  }
}

// ========== 控制类 ==========
class Player {
  constructor() {
    this.w = 60;
    this.h = 20;
    this.x = width/2 - this.w/2;
    this.y = height - 60;
    this.dir = 0;
    this.speed = 7;
  }
  update() { 
    this.x += this.dir * this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }
  show() {
    fill(80, 200, 255);
    rect(this.x, this.y, this.w, this.h);
  }
  setDir(dir) { this.dir = dir; }
}

class Enemy {
  constructor() {
    this.r = random(20, 30);
    this.x = random(this.r, width - this.r);
    this.y = -this.r;
    this.speed = enemySpeed;
  }
  update() { this.y += this.speed; }
  show() { fill(255, 100, 100); ellipse(this.x, this.y, this.r*2); }
}

// ========== 事件监听 ==========
function keyPressed() {
  if (keyCode === LEFT_ARROW) player.setDir(-1);
  if (keyCode === RIGHT_ARROW) player.setDir(1);
  if (key === ' ') bullets.push(new Bullet(player.x + player.w/2, player.y));
  if (gameOver && key === 'R') resetGame();
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) player.setDir(0);
}

// ========== 触控支持 ==========
let lastTouchX = null;

function touchStarted() {
  lastTouchX = mouseX;
  bullets.push(new Bullet(player.x + player.w/2, player.y));
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

// ========== 辅助函数 ==========
function resetGame() {
  score = 0;
  bullets = [];
  enemies = [];
  gameOver = false;
}

function playShootSound() {
  shootSound.currentTime = 0;
  shootSound.play();
}

function playHitSound() {
  hitSound.currentTime = 0;
  hitSound.play();
}
