(function() {

    let rain;
  
    let movingSpeed = 1;
    let colors = [
      "#a8d8ea",
      "#aa96da",
      "#fcbad3",
      "#fcf8f3",
      "#000000",
    ];
  
    window.sketch = function(p) {
      p.setup = function() {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noStroke();
  
        rain = new Rain(100);
      }
  
      p.draw = function() {
        p.background(colors[4]);
  
        rain.update();
        rain.draw();
      }
  
      class Rain {
        constructor(num) {
          this.rainDrops = [];
  
          for (let i = 0; i < num; i++) {
            let rainDrop = new RainDrop(this);
            this.rainDrops.push(rainDrop);
          }
        }
  
        update() {
          for (let i = 0; i < this.rainDrops.length; i++) {
            let rainDrop = this.rainDrops[i];
            rainDrop.update(15.0);
          }
        }
  
        draw() {
          for (let i = 0; i < this.rainDrops.length; i++) {
            let rainDrop = this.rainDrops[i];
            rainDrop.draw();
          }
        }
      }
  
      class RainDrop {
        constructor(rain) {
          this.rain = rain;
          this.depthScale = p.random();
  
          this.pos = p.createVector(p.random(0, p.width), this.depthScale * p.height * 0.5, p.random(-p.height * 0.5, p.height * 0.5));
          this.prevPos = this.pos.copy();
          this.splash = false;
          this.splashTime = 0.0;
          this.splashMax = 1.0;
          this.color1 = colors[1];
        }
  
        update(speed) {
          this.speed = speed;
          this.pos.add(p.createVector(0, 0, this.speed* movingSpeed * p.map(this.depthScale, 0.0, 1.0, 1.0, 0.25)));
  
          if (this.pos.z > p.height - this.pos.y) {
            this.prevPos = this.pos.copy();
            this.pos = p.createVector(p.random(0, p.width), this.depthScale * p.height * 0.5, p.random(-p.height * 0.5, -p.height));
            this.splash = true;
  
            let rnd = p.random();
            if (rnd < 0.2) {
              this.color1 = colors[2];
            } else {
              this.color1 = colors[1];
            }
          }
  
          if (this.splash == true) {
            this.splashTime += (p.deltaTime / 1000.0);
            if (this.splashTime > this.splashMax) {
              this.splashTime = 0;
              this.splash = false;
            }
          }
  
          if (this.splash == true) {
            p.push();
            p.translate(this.prevPos.x, p.height - this.prevPos.y);
            let timeval = this.splashTime / this.splashMax;
  
            let col = p.color(this.color1);
            col.setAlpha(p.map(timeval, 0.0, 1.0, 255, 0));
            p.fill(col);
            let size = p.map(this.depthScale, 0.0, 1.0, 300, 100);
            p.ellipse(0, 0, timeval * size, timeval * size / 5.0);
            p.pop();
          }
        }
  
        draw() {
          p.push();
          p.fill(255, p.map(this.depthScale, 0.0, 1.0, 200, 20));
          p.fill(colors[0]);
          let dif = p.height - this.pos.y - this.pos.z;
          let thickness = p.map(this.depthScale, 0.0, 1.0, 3, 0.5);
          p.translate(this.pos.x, this.pos.z);
          let rainheight = p.map(this.depthScale, 0.0, 1.0, this.speed * 10, this.speed * 2);
          p.beginShape();
          p.vertex(-thickness, 0);
          p.vertex(thickness, 0);
          p.vertex(thickness, p.min(rainheight, dif));
          p.vertex(-thickness, p.min(rainheight, dif));
          p.endShape(p.CLOSE);
          p.pop();
        }
      }
  
      p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };
  })();
  