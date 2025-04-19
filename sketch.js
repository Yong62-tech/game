// ========== 游戏核心对象 ==========
let player;
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let enemySpeed = 2;
let lastEnemySpawn = 0;

// ========== 玩家控制类 ==========
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
    push();
    translate(this.x + this.w/2, this.y + this.h/2);
    noStroke();
    fill(80, 200, 255, 220);
    ellipse(0, 0, this.w, this.h*1.2);
    fill(255, 255, 255, 180);
    ellipse(0, -5, this.w*0.5, this.h*0.7);
    pop();
  }

  setDir(dir) {
    this.dir = dir;
  }
}

// ========== 初始化游戏 ==========
function setup() {
  createCanvas(480, 640);
  player = new Player();
  frameRate(60);
}

// ========== 游戏主循环 ==========
function draw() {
  background(20, 25, 40);
  
  if (!gameOver) {
    // 更新玩家状态
    player.update();
    player.show();

    // 敌人生成逻辑
    if (frameCount - lastEnemySpawn > 60) {
      enemies.push(new Enemy());
      lastEnemySpawn = frameCount;
    }

    // 更新敌人状态
    enemies.forEach((enemy, index) => {
      enemy.update();
      enemy.show();
      if (enemy.y > height - 40) gameOver = true;
    });

    // 显示得分
    fill(255);
    textSize(22);
    textAlign(LEFT, TOP);
    text("得分: " + score, 20, 20);
  } else {
    fill(255, 0, 0);
    textSize(36);
    textAlign(CENTER, CENTER);
    text("游戏结束", width/2, height/2);
  }
}

// ========== 敌人控制类 ==========
class Enemy {
  constructor() {
    this.r = random(20, 30);
    this.x = random(this.r, width - this.r);
    this.y = -this.r;
    this.speed = enemySpeed + random(-0.5, 0.5);
  }

  update() {
    this.y += this.speed;
  }

  show() {
    fill(255, 100, 100);
    noStroke();
    ellipse(this.x, this.y, this.r*2, this.r*2);
  }
}

// ========== 事件监听 ==========
function keyPressed() {
  if (keyCode === LEFT_ARROW) player.setDir(-1);
  if (keyCode === RIGHT_ARROW) player.setDir(1);
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.setDir(0);
  }
}

// ========== 触控支持 ==========
let lastTouchX = null;

function touchStarted() {
  lastTouchX = mouseX;
  return false; // 阻止默认滚动行为
}

function touchMoved() {
  if (lastTouchX !== null) {
    player.x += mouseX - lastTouchX;
    player.x = constrain(player.x, 0, width - player.w);
    lastTouchX = mouseX;
  }
  return false;
}
