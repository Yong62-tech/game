// 音效系统（强制用户交互后启用）
let shootSound, hitSound;
let audioEnabled = false;

function initAudio() {
  // 使用超短音效Base64（兼容所有浏览器）
  const soundBase64 = "UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...";
  
  shootSound = new Audio(`data:audio/wav;base64,${soundBase64}`);
  hitSound = new Audio(`data:audio/wav;base64,${soundBase64}`);
  
  // 静音预加载（绕过浏览器限制）
  shootSound.volume = 0.5;
  hitSound.volume = 0.5;
  shootSound.play().then(() => {
    shootSound.pause();
    console.log("音效系统已就绪");
  }).catch(e => console.log("等待用户交互后启用音效"));
}

function enableAudio() {
  if (audioEnabled) return;
  // 尝试播放音效以激活系统
  shootSound.play().then(() => {
    shootSound.pause();
    audioEnabled = true;
    console.log("音效已激活");
  });
}

function playShootSound() {
  if (!audioEnabled) return;
  shootSound.currentTime = 0;
  shootSound.play().catch(e => console.log("音效延迟生效"));
}

function playHitSound() {
  if (!audioEnabled) return;
  hitSound.currentTime = 0;
  hitSound.play().catch(e => console.log("音效延迟生效"));
}

// 在首次交互时调用（点击/按键）
function mousePressed() {
  enableAudio();
  // ...原有游戏逻辑
}

function touchStarted() {
  enableAudio(); 
  // ...原有游戏逻辑
  return false;
}

function keyPressed() {
  enableAudio();
  // ...原有游戏逻辑
}
