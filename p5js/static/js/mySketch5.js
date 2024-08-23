(function() {

  //滿版眼睛效果
    let mic;
    let blinkState = false;
    let blinkTimer = 0;
    let blinkDuration = 10;
    let eyeSize = 200;
  
    window.sketch = function(p) {
      p.setup = function() {
        p.createCanvas(p.windowWidth, p.windowHeight);
        // mic = new p5.AudioIn();
        // mic.start(() => {
        //   console.log('Microphone is active');
        // });
        p.background(0);
      }
  
      function drawEye(x, y, sc) {
        p.push();
        p.translate(x, y);
        p.scale(sc);
        p.fill(255);
        p.ellipse(0, 0, eyeSize);
  
        if (blinkState) {
          p.fill(255);
          p.ellipse(0, 0, 200, 50);  // 眨眼效果
        } else {
          p.fill(0);
          // let secondFinger = window.secondFinger || { x: p.width / 2, y: p.height / 2 }; // 默認值防止未偵測到手指
          
          // // 反轉手指的 x 坐標
          // let adjustedX = p.width - secondFinger.x;

          let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
          // 反轉 x 坐標
          let adjustedX = p.width - 5*body_position.x+400;
          let adjustedY = 1*body_position.y;

          let ang = p.atan2(adjustedY - y, adjustedX - x);
          p.rotate(ang);
          p.ellipse(50, 0, eyeSize * 0.5);
        }
        p.pop();
      }
  
      p.draw = function() {
        p.background(0);
  
        // let vol = mic.getLevel();
        // // 若音量超過就會眨眼
        // if (vol > 0.04 && blinkTimer == 0) {
        //   blinkState = true;
        //   blinkTimer = blinkDuration;
        //   eyeSize = p.random(150, 250);  // 隨機改變眼睛大小
        // }
  
        // if (blinkTimer > 0) {
        //   blinkTimer--;
        // } else {
        //   blinkState = false;
        // }
  
        // 繪製所有的眼睛
        for (let j = 0; j < p.height; j += 100) {
          for (let i = 0; i < p.width; i += 100) {
            drawEye(i, j, 0.3);
          }
        }
  
        // 繪製手指位置
        // let secondFinger = window.secondFinger || { x: p.width / 2, y: p.height / 2 };
        // p.fill(255, 0, 0);  // 紅色
        // p.noStroke();
        // p.ellipse(p.width - secondFinger.x, secondFinger.y, 15, 15);  // 手指位置的圓點
      }

      p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    }
  })();
  