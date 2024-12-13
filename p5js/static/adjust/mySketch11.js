(function() {
  let urlParams = new URLSearchParams(window.location.search); // 創建一個 URLSearchParams 的物件用來解析查詢字串
  let speed = urlParams.get('speed'); // 使用 get() 方法來獲取指定參數的值
  speed /= 100;
  let changeColors = urlParams.get('colors');
  changeColors = changeColors ? changeColors.split(',') : null;
  console.log("====in Adjust====");
  console.log(speed);
  console.log(changeColors);
  console.log("=================");

  const num = 256; // number of pieces
  const balls = [];
  const massMin = 0.005;
  const massMax = 0.03;
  // let changeColors = []; // 設定顏色

  window.sketch = function(p) {
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      for (let i = num; i--;) {
        balls.push({
          mass: p.random(massMin, massMax),
          position: p.createVector(p.random(p.width), p.random(p.height)),
          velocity: p.createVector()
        });
      }
    };

    p.draw = () => {
      let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
      // 反轉 x 坐標
      let adjustedX = p.width - 5 * body_position.x + 400;
      let adjustedY = 1 * body_position.y + 50;

      p.background('black');

      const infulence = 0.92;
      balls.push({
        mass: 2,
        position: p.createVector(adjustedX, adjustedY),
        velocity: p.createVector()
      });

      for (const A of balls) {
        const acceleration = p.createVector();
        for (const B of balls) {
          if (A !== B) {
            const difference = p5.Vector.sub(B.position, A.position);
            const distance = p.max(1, p.sqrt(difference.x ** 2 + difference.y ** 2));
            const force = (distance - 320) * B.mass / distance;
            acceleration.add(difference.mult(force));
          }
        }
        A.velocity = A.velocity.mult(infulence).add(acceleration.mult(A.mass));
      }
      balls.pop();

      for (const A of balls) {
        A.position.add(A.velocity);
      }

      p.noStroke();

      // 檢查 changeColors 是否為空陣列
      let colorToUse;
      if (changeColors.length > 0) {
        colorToUse = changeColors[Math.floor(p.random(changeColors.length))]; // 隨機從 changeColors 中選擇顏色
      } else {
        // 保持原來顏色設置
        for (const A of balls) {
          const r = p.map(A.mass, massMin, massMax, 255, 0);
          p.fill(r, r * 3, 255);
          p.ellipse(A.position.x, A.position.y, A.mass * 600);
        }
        return; // 結束繪製，避免後面的顏色影響
      }

      // 如果 changeColors 非空，則使用隨機顏色
      for (const A of balls) {
        p.fill(colorToUse); // 使用選擇的顏色
        p.ellipse(A.position.x, A.position.y, A.mass * 600);
      }

      // 繪製手指位置
      // p.fill(255, 0, 0);  // 紅色
      // p.noStroke();
      // p.ellipse(p.width - secondFinger.x, secondFinger.y, 15, 15);  // 手指位置的圓點
    };

    p.windowResized = function() {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
})();
