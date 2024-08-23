//漂浮小怪物效果
(function() {
    let palette = [
        "#4D6F83",
        "#B1B0B1",
        "#278DD3",
        "#F8B623",
        "#3C494F",
        "#D51311",
      ];
      
      let shapes = [];
      let numShapes = 20;
      let movingSpeed = 1;
      
      window.sketch = function(p) {
        p.setup = function() {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.angleMode(p.DEGREES);
        for (let i = 0; i < numShapes; i++) {
          shapes.push(new Shape(p.random(p.width), p.random(p.height), p.random(1*movingSpeed, 2*movingSpeed))); // 調整速度範圍
        }
      }
      
      p.draw = function() {
        p.clear();
        p.blendMode(p.BLEND);
        p.background(0);
        for (let shape of shapes) {
          shape.update();
          shape.display();
        }
      }
      
      class Shape {
        constructor(x, y, speed) {
          this.pos = p.createVector(x, y);
          this.vel = p5.Vector.random2D().mult(speed);
          this.acc = p.createVector(0, 0);
          this.size = p.random(50, 150);
          this.colors = p.shuffle(palette.concat());
          this.rs = p.int(p.random(10000));
          this.alpha = 0; // 初始透明度
          this.fadeSpeed = p.random(2, 5); // 淡入淡出速度
          this.maxAlpha = p.random(50, 100); // 最大透明度
          this.shadowAlpha = p.random(50, 150); // 光圈透明度
          this.shadowFadeSpeed = p.random(2, 5); // 光圈淡入淡出速度
          this.maxShadowAlpha = p.random(50, 100); // 最大光圈透明度
        }
      
        update() {
          this.vel.add(this.acc);
          this.pos.add(this.vel);
          this.acc.mult(0);
      
          // 邊界檢查，防止圖案超出邊界
          if (this.pos.x < 0) this.pos.x = p.width;
          if (this.pos.x > p.width) this.pos.x = 0;
          if (this.pos.y < 0) this.pos.y = p.height;
          if (this.pos.y > p.height) this.pos.y = 0;
      
          // 控制透明度的變化，讓圖案忽明忽滅
          this.alpha += this.fadeSpeed;
          if (this.alpha > this.maxAlpha || this.alpha < 0) {
            this.fadeSpeed *= -1;
          }
      
          // 控制光圈透明度的變化，讓光圈忽明忽滅
          this.shadowAlpha += this.shadowFadeSpeed;
          if (this.shadowAlpha > this.maxShadowAlpha || this.shadowAlpha < 0) {
            this.shadowFadeSpeed *= -1;
          }
        }
      
        display() {
          p.randomSeed(this.rs + p.frameCount / 300);
          let cx = this.pos.x;
          let cy = this.pos.y;
      
          p.push();
          p.translate(cx, cy);
          p.scale(0.75);
          p.rectMode(p.CENTER);
          p.noStroke();
      
          // 繪製光圈效果
          p.push();
          p.drawingContext.shadowColor = p.color(255, 255, 255, this.shadowAlpha);
          p.drawingContext.shadowBlur = this.size / 2;
          p.fill(0, 0, 0, 0); // 確保光圈本身不可見
          p.circle(0, 0, this.size * 1.5);
          p.pop();
      
          let points = [];
          let n = 0;
          let num = p.int(p.random(5, 10));
          let angleStep = 360 / num;
          let rMax = this.size * 2;
          let angleN = p.noise(cx * 0.01, cy * 0.01, p.frameCount * 0.01) * 360;
          let nx = (p.cos(angleN) * rMax) / 4;
          let ny = (p.sin(angleN) * rMax) / 4;
      
          let gradient = p.drawingContext.createRadialGradient(
            nx,
            ny,
            0,
            nx,
            ny,
            rMax
          );
      
          gradient.addColorStop(0, this.colors[0]); // 不要在這裡設置透明度
          gradient.addColorStop(1, this.colors[1]);
          gradient.addColorStop(angleN / 360, this.colors[2]);
      
          p.drawingContext.fillStyle = gradient;
      
          p.beginShape();
          for (let angle = 0; angle < 360; angle += angleStep) {
            let r = p.noise(cx * 0.01, cy * 0.01, angle * 0.01, p.frameCount * 0.01) * rMax;
            let xxx = p.cos(angle) * r;
            let yyy = p.sin(angle) * r;
            xxx = p.constrain(xxx, -this.size / 2, this.size / 2);
            yyy = p.constrain(yyy, -this.size / 2, this.size / 2);
            if (n < 3) {
              points.push(p.createVector(xxx, yyy));
            }
            p.curveVertex(xxx, yyy);
            n++;
          }
          for (let po of points) {
            p.curveVertex(po.x, po.y);
          }
          p.endShape();
          let wStep = p.random(2, 6);
      
          p.push();
          p.drawingContext.clip();
          p.fill(0, 0, 20);
          p.circle(0, this.size / wStep, this.size / p.random(1, 4) * angleN / 360);
      
          p.fill(0, 0, 100);
          p.drawingContext.shadowColor = p.color(0, 0, 0, 30);
          p.drawingContext.shadowBlur = this.size / 4;
          p.circle(-this.size / wStep, 0, this.size / 6);
          p.fill(0, 0, 100);
          p.circle(this.size / wStep, 0, this.size / 6);
          p.fill(0, 0, 20);
          p.circle(-this.size / wStep, 0, this.size / 12);
          p.fill(0, 0, 20);
          p.circle(this.size / wStep, 0, this.size / 12);
      
          p.pop();
      
          p.pop();
        }
      }

      p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
      
}
})();