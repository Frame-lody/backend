//emojis

(function() {
let set1 = [
	'🤨',
	'🤓',
	'😳',
	'🥳',
	'😬',
	'😂',
	'😇',
	'🤗',
	'🤔',
	'🙄',
	'😎',
	'😲',
	'🧐',
	'🤠',
	'😒',
	'😯',
	'😩',
	'😷',
	'🤫',
	'😚',
	'😌',
	'🤥',
	'😵',
	'🥴'
];

let set2 = [
	'🌭',
	'🍔',
	'🍟',
	'🍕',
	'🥪',
	'🥙',
	'🧆',
	'🌮',
	'🌯',
	'🥗',
	'🍝',
	'🍜',
	'🍲',
	'🍛',
	'🍣',
	'🍱',
	'🥟',
	'🍦',
	'🥧',
	'🧁',
	'🍰',
	'🍵'
	];

    let allsets = [];
let index = 0;
let emojis = [];
let emojiStates = [];
let startTime;

window.sketch = function(p) {
  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textAlign(p.CENTER, p.CENTER);
    allsets = [set1, set2, p.concat(set1, set2)];
    emojis = allsets[index];
    initializeEmojiStates();
    startTime = p.millis();
    setInterval(autoChange, 10000); // 每隔10秒自動切換
  }

  function initializeEmojiStates() {
    emojiStates = [];
    let y = 30;
    let ys = 15;
    let rowDelay = 0;
    while (y <= p.height) {
      let x = 0;
      while (x <= p.width + ys) {
        let state = {
          x: x,
          y: p.height, // 初始位置在畫面之外
          targetY: y,
          size: ys * p.random(0.9, 1.1),
          angle: p.random(-p.PI / 12, p.PI / 12),
          offset: p.random(p.TWO_PI),
          speed: p.random(0.1, 0.3),
          delay: rowDelay, // 每排的延遲時間相同
          emoji: p.random(emojis), // 確定的 emoji
          currentY: p.height // 初始位置在畫面之外
        };
        emojiStates.push(state);
        x += ys;
      }
      rowDelay += 500; // 每排的延遲 500 毫秒
      ys *= 1.25;
      y += ys * 0.65;
    }
  }

  function drawCrowd() {
    p.background(0);
    let currentTime = p.millis() - startTime;
    for (let i = 0; i < emojiStates.length; i++) {
      let state = emojiStates[i];
      if (currentTime > state.delay) {
        let t = (currentTime - state.delay) / 1000; // 計算進場動畫時間
        let easing = t < 1 ? p.pow(t, 4) : 1; // 緩動函數
        state.currentY = p.lerp(state.y, state.targetY, easing);

        if (t >= 1) {
          state.currentY = state.targetY + p.sin(state.offset) * 30; // 上下彈跳效果
          state.offset += state.speed; // 更新彈跳動畫
        }

        p.push();
        p.translate(state.x, state.currentY);
        p.textSize(state.size);
        p.rotate(state.angle);
        p.text(state.emoji, 0, 0); // 使用確定的 emoji
        p.pop();
      }
    }
  }

  function autoChange() {
    index = (index + 1) % allsets.length;
    emojis = allsets[index];
    initializeEmojiStates();
    startTime = p.millis();
  }

  p.draw = function() {
    drawCrowd();
  }

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    starGraphics = p.createGraphics(p.width, p.height);
};

};
})();
