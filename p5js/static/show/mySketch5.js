(function() {

  //滿版眼睛效果
  let mic;
  let blinkState = false;
  let blinkTimer = 0;
  let blinkDuration = 10;
  let eyeSize = 200;
  // let changeColors = [] ; //設定顏色，依序為背景、眼白、眼珠 = ["#9EF2BB", "#ffffff", "#000000"]

  window.sketch = function(p) {
    p.setup = function() {
      p.createCanvas(window.innerWidth, window.innerHeight);
      p.background(0);
    }

    function drawEye(x, y, sc) {
      p.push();
      p.translate(x, y);
      p.scale(sc);

      // 如果有提供顏色，則使用 changeColors 陣列中的顏色
      if (changeColors.length >= 3) {
        // 使用顏色陣列中的顏色設定背景、眼白和眼珠
        p.fill(changeColors[1]);  // 眼白
        p.ellipse(0, 0, eyeSize);

        // 繪製眼珠
        p.fill(changeColors[2]);  // 眼珠
        let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
        let adjustedX = p.width - 5 * body_position.x + 400;
        let adjustedY = 1 * body_position.y;

        let ang = p.atan2(adjustedY - y, adjustedX - x);
        p.rotate(ang);
        p.ellipse(50, 0, eyeSize * 0.5);
      } else {
        // 如果沒有顏色設定，使用原本的顏色設定
        p.fill(255); // 眼白
        p.ellipse(0, 0, eyeSize);

        // 繪製眼珠
        p.fill(0); // 眼珠
        let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
        let adjustedX = p.width - 5 * body_position.x + 400;
        let adjustedY = 1 * body_position.y;

        let ang = p.atan2(adjustedY - y, adjustedX - x);
        p.rotate(ang);
        p.ellipse(50, 0, eyeSize * 0.5);
      }
      p.pop();
    }

    p.draw = function() {
      // 如果有顏色設定，則使用 changeColors 中的顏色來設置背景
      if (changeColors.length >= 1) {
        p.background(changeColors[0]); // 背景顏色
      } else {
        p.background(0);  // 預設背景顏色
      }

      // 繪製所有的眼睛
      for (let j = 0; j < p.height; j += 100) {
        for (let i = 0; i < p.width; i += 100) {
          drawEye(i, j, 0.3);
        }
      }
    }

    p.windowResized = function() {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };
  }

})();
