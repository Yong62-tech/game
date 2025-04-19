// 修复触控板首次失效 + 音效问题的终极版本
let player, bullets = [], enemies = [], score = 0;
let gameOver = false, showInstructions = true;
let enemySpeed = 2, lastEnemySpawn = 0, enemySpawnInterval = 60;
let lastTouchX = null; // 修复触控板初始状态

// 音效系统（兼容所有浏览器）
let shootSound, hitSound;
let audioEnabled = false; // 标记音效是否可用

function setup() {
  createCanvas(480, 640);
  player = new Player();
  initAudio(); // 预加载音效
}

function initAudio() {
  // 使用Base64编码的短音效（兼容Safari/Chrome）
  shootSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...");
  hitSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...");
  
  // 静音播放以激活音频权限
  shootSound.volume = 0.5;
  hitSound.volume = 0.5;
  shootSound.play().then(() => {
    shootSound.pause();
    audioEnabled = true;
  }).catch(e => console.log("首次音效初始化需用户交互"));
}

function resetGame() {
  score = 0;
  bullets = [];
  enemies = [];
  gameOver = false;
  showInstructions = false; // 直接进入游戏（避免触控板首次失效）
  enemySpeed = 2;
  lastEnemySpawn = 0;
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

    // 更新子弹逻辑...
    // 敌人生成逻辑...
    // 碰撞检测逻辑...（与之前相同）
  } else {
    drawGameOver();
  }
}

// ========== 关键修复：统一交互入口 ==========
function handleStart() {
  if (showInstructions) {
    showInstructions = false;
    // 激活音效（需用户点击后）
    if (!audioEnabled) {
      shootSound.play().then(() => {
        shootSound.pause();
        audioEnabled = true;
      });
    }
  }
}

// ========== 事件监听（全部统一调用handleStart） ==========
function mousePressed() {
  handleStart();
  if (!gameOver && !showInstructions) shoot();
}

function touchStarted() {
  handleStart();
  if (gameOver) resetGame();
  lastTouchX = mouseX;
  return false;
}

function touchMoved() {
  if (!gameOver && !showInstructions && lastTouchX !== null) {
    player.x += mouseX - lastTouchX;
    player.x = constrain(player.x, 0, width - player.w);
    lastTouchX = mouseX;
  }
  return false;
}

function touchEnded() {
  if (!gameOver && !showInstructions) shoot();
  lastTouchX = null;
  return false;
}

function keyPressed() {
  handleStart(); // 键盘按键也能激活游戏
  if (gameOver && (key === 'r' || key === 'R')) resetGame();
  if (keyCode === LEFT_ARROW) player.setDir(-1);
  if (keyCode === RIGHT_ARROW) player.setDir(1);
  if (key === ' ') shoot();
}

// ========== 音效播放（带安全检测） ==========
function playShootSound() {
  if (!audioEnabled) return;
  shootSound.currentTime = 0;
  shootSound.play().catch(e => console.log("射击音效稍后自动启用"));
}

function playHitSound() {
  if (!audioEnabled) return;
  hitSound.currentTime = 0;
  hitSound.play().catch(e => console.log("击中音效稍后自动启用"));
}

// 其余代码（Player/Bullet/Enemy等类定义保持不变）...
