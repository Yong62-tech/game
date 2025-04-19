// 修复版 - 确保所有类和方法正确定义
let player;
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let showInstructions = true;
let enemySpeed = 2;
let lastEnemySpawn = 0;
let enemySpawnInterval = 60;

// 音效（简化版）
let shootSound, hitSound;

function setup() {
  createCanvas(480, 640);
  player = new Player(); // 初始化玩家
  resetGame();
  initAudio();
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

function initAudio() {
  // 使用超短静音音频触发浏览器许可
  shootSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
  hitSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
}

function draw() {
  background(20, 25, 40);
  drawStars();

  if (showInstructions) {
    drawInstructions();
    return;
  }

  if (!gameOver) {
    player.update(); // 调用玩家更新
    player.show();   // 调用玩家渲染

    // 更新子弹
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update();
      bullets[i].show();
      if (bullets[i].offscreen()) {
        bullets.splice(i, 1);
      }
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

    // 更新敌人
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

      // 游戏结束条件
      if (i < enemies.length && enemies[i].y > height - 40) {
        gameOver = true;
      }
    }

    // 显示分数
    fill(255);
    textSize(22);
    textAlign(LEFT, TOP);
    text("得分: " + score, 20, 20);
  } else {
    drawGameOver();
  }
}

// ====================== 类定义 ======================
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

// ====================== 辅助函数 ======================
function explosion(x, y) {
  for (let i = 0; i < 12; i++) {
    let angle = random(TWO_PI);
    let len = random(10, 30);
    let ex = x + cos(angle) * len;
    let ey = y + sin(angle) * len;
    stroke(255, 180, 80, 180);
    strokeWeight(random(2, 4));
    line(x, y, ex, ey);
  }
}

function drawStars() {
  for (let i = 0; i < 40; i++) {
    let sx = random(width);
    let sy = random(height);
    let alpha = random(80, 180);
    stroke(180, 220, 255, alpha);
    point(sx, sy);
  }
}

function drawInstructions() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text('炫酷射击游戏', width / 2, height / 2 - 120);
  textSize(18);
  text('玩法说明：', width / 2, height / 2 - 60);
  textSize(16);
  text('← → 方向键/触控板滑动控制飞船移动\n空格/点击/轻点发射子弹\n击落敌人获得分数\n敌人到达底部则游戏结束', width / 2, height / 2);
  textSize(16);
  fill(80, 200, 255);
  text('按任意键或轻点屏幕开始游戏', width / 2, height / 2 + 100);
}

function drawGameOver() {
  fill(255, 80, 80);
  textAlign(CENTER, CENTER);
  textSize(36);
  text('游戏结束', width / 2, height / 2 - 40);
  textSize(22);
  fill(255);
  text('你的得分：' + score, width / 2, height / 2 + 10);
  textSize(16);
  fill(80, 200, 255);
  text('按 R 键或轻点屏幕重新开始', width / 2, height / 2 + 60);
}

// ====================== 事件监听 ======================
function keyPressed() {
  if (showInstructions) {
    showInstructions = false;
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

function touchStarted() {
  if (showInstructions) {
    showInstructions = false;
    return false;
  }
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

function shoot() {
  bullets.push(new Bullet(player.x + player.w / 2, player.y));
  playShootSound();
}

function playShootSound() {
  if (!shootSound) return;
  shootSound.currentTime = 0;
  shootSound.play().catch(e => console.log("音效需用户交互后播放"));
}

function playHitSound() {
  if (!hitSound) return;
  hitSound.currentTime = 0;
  hitSound.play().catch(e => console.log("音效需用户交互后播放"));
}
