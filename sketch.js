// 修复说明界面和音效的版本
let player;
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let showInstructions = true;
let enemySpeed = 2;
let lastEnemySpawn = 0;
let enemySpawnInterval = 60;

// 改用 HTML5 Audio 音效
let shootSound, hitSound;

function setup() {
  createCanvas(480, 640);
  player = new Player();
  resetGame();
  initAudio(); // 初始化音效
}

function resetGame() {
  score = 0;
  bullets = [];
  enemies = [];
  gameOver = false;
  showInstructions = true; // 确保显示说明
  enemySpeed = 2;
  lastEnemySpawn = 0;
}

// 初始化音效（Base64编码的短音效）
function initAudio() {
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
    player.update();
    player.show();

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

// 键盘控制
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

// 触控控制
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

// 发射子弹
function shoot() {
  bullets.push(new Bullet(player.x + player.w / 2, player.y));
  playShootSound();
}

// 播放音效
function playShootSound() {
  if (!shootSound) return;
  shootSound.currentTime = 0;
  shootSound.play().catch(e => console.log("射击音效播放失败（需用户先点击页面）"));
}

function playHitSound() {
  if (!hitSound) return;
  hitSound.currentTime = 0;
  hitSound.play().catch(e => console.log("击中音效播放失败"));
}

// 游戏说明界面
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

// 游戏结束界面
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

// 以下是原有类定义（保持不变）
class Player { /* ... */ }
class Bullet { /* ... */ }
class Enemy { /* ... */ }
function explosion(x, y) { /* ... */ }
function drawStars() { /* ... */ }
