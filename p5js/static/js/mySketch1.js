(function() {

  //長方形內含旋轉圓圈效果
  let rectangle;
  let offset = 0;
  let palette;
  let movingSpeed = 1;
  
  window.sketch = function(p) {
    p.setup = function() {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.angleMode(p.DEGREES);
      palette = p.random(colorScheme).colors.concat();
      rectangle = new Rectangle(
        0,
        0,
        p.windowWidth,
        p.windowHeight,
        0,
        p.random(["T", "R", "B", "L"])
      );
    };
    
    p.draw = function() {
      p.background(0, 0, 90);
      p.push();
      p.translate(p.width / 2, p.height / 2);
      rectangle.update();
      rectangle.display();
      p.pop();
    };
    
    class Rectangle {
      constructor(x, y, w, h, target, direction) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.direction = direction;
        this.target = this.setTarget();
        this.n = 0;
        this.count = 0;
        this.seed = p.int(p.random(10000));
        this.nextSeed = p.int(p.random(10000));
      }
      
      setTarget() {
        this.angle ;
        this.r ;
        switch (this.direction) {
          case "T":
            this.angle = -90;
            this.r = this.h;
            break;
          case "R":
            this.angle = 0;
            this.r = this.w;
            break;
          case "B":
            this.angle = 90;
            this.r = this.h;
            break;
          case "L":
            this.angle = 180;
            this.r = this.w;
            break;
        }
        let ax = p.cos(this.angle) * this.r;
        let ay = p.sin(this.angle) * this.r;
        return p.createVector(ax, ay);
      }
      
      update() {
        this.n = (p.frameCount / 80) % 1;
        if (this.n === 0) {
          this.count++;
          let newDirection = p.random(["T", "R", "B", "L"]);
          while (newDirection === this.direction) {
            newDirection = p.random(["T", "R", "B", "L"]);
          }
          this.direction = newDirection;
          this.target = this.setTarget();
          this.seed = this.nextSeed;
          this.nextSeed = p.int(p.random(10000));
        }
        this.n = easeInOutCirc(this.n);
      }
      
      display() {
        let v = p5.Vector.fromAngle(p.radians(this.angle + 180)).mult(this.n * this.r);
        let w = p.sqrt(p.sq(this.w) + p.sq(this.h));
        p.rectMode(p.CENTER);
        p.noStroke();
        p.push();
        p.translate(this.x, this.y);
        p.translate(v.x, v.y);
        p.fill(0);
        p.rect(0, 0, this.w, this.h);
        p.push();
        p.drawingContext.clip();
        p.translate(-w / 2, -w / 2);
        this.drawPattern(w / 2, w / 2, w, w, this.seed);
        p.pop();
        p.fill(0);
        p.rect(this.target.x, this.target.y, this.w, this.h);
        p.push();
        p.drawingContext.clip();
        p.translate(this.target.x, this.target.y);
        p.translate(-w / 2, -w / 2);
        this.drawPattern(w / 2, w / 2, w, w, this.nextSeed);
        p.pop();
        p.pop();
      }
      
      drawPattern(x, y, w, h, seed) {
        p.randomSeed(seed);
        p.push();
        p.translate(x - w / 2, y - h / 2);
        this.recursiveRect(0, 0, w, h, 2);
        p.pop();
      }
      
      recursiveRect(x, y, w, h, depth) {
        if (depth < 0) return;
        let rsx = p.random(10000);
        let rsy = p.random(10000);
        let t = (
          ((x + w / 2 - offset + (y - offset + h / 2) * (p.width - offset * 2)) /
          ((p.width - offset * 2) * (p.height - offset * 2)) +
          (p.frameCount % 1000) / 1000) %
          1
        );
        t = easeInOutCirc(p.sin(t * 360) / 2 + 0.5);
        let nw = (p.sin(rsx + y / 20 + t * 360) / 2.5 / 1.5 + 0.5) * w;
        let nh = (p.cos(rsy + x / 20 + t * 360) / 3 / 1.5 + 0.5) * h;
  
        if (depth === 0) {
          this.drawRect(x, y, nw, nh, t, this.calcDim(w, h, nw, nh));
          this.drawRect(x + nw, y, w - nw, nh, t, this.calcDim(w, h, w - nw, nh));
          this.drawRect(x, y + nh, nw, h - nh, t, this.calcDim(w, h, nw, h - nh));
          this.drawRect(x + nw, y + nh, w - nw, h - nh, t, this.calcDim(w, h, w - nw, h - nh));
        } else {
          this.recursiveRect(x, y, nw, nh, depth - 1);
          this.recursiveRect(x + nw, y, w - nw, nh, depth - 1);
          this.recursiveRect(x, y + nh, nw, h - nh, depth - 1);
          this.recursiveRect(x + nw, y + nh, w - nw, h - nh, depth - 1);
        }
      }
      
      calcDim(a, b, c, d) {
        return (c * d) / (a * b);
      }
      
      drawRect(x, y, w, h, t, ratio) {
        let v = (t + ratio) % 1;
        v = (v < 0.5 ? v : 1 - v) * 2;
        v = easeInOutCirc(v);
        v = p.constrain(v, 0.1, 0.66);
        let angle = (p.int(p.random(4)) * 360) / 4;
        p.push();
        p.translate(x + w / 2, y + h / 2);
        p.scale(p.constrain((p.max(w, h) - 15) / p.max(w, h), 0, 1));
        p.scale(p.random() > 0.5 ? -1 : 1, p.random() > 0.5 ? -1 : 1);
        if (angle % 180 === 90) {
          let tmp = w;
          w = h;
          h = tmp;
        }
        p.imageMode(p.CENTER);
        p.rectMode(p.CENTER);
        p.rotate(angle);
        p.noStroke();
        let colors = p.shuffle(palette.concat());
        p.fill(0, 0, 100, 0);
        p.rect(0, 0, w, h);
        p.drawingContext.clip();
        p.strokeCap(p.SQUARE);
        let ld = w * 2 + h * 2;
        p.stroke(0, 0, 100);
        for (let i = 0; i < 1; i++) {
          if (i === 0) {
            let n = p.drawingContext.createConicGradient((p.int(p.random(8)) * p.PI / 4 + v * p.TWO_PI) % p.TWO_PI, 0, 0);
            n.addColorStop(0, colors[i]);
            n.addColorStop(1, colors[i]);
            n.addColorStop(1 / 3, colors[i + 1]);
            n.addColorStop(2 / 3, colors[i + 2]);
            p.drawingContext.strokeStyle = n;
            p.stroke(0, 0, 100);
            p.strokeWeight(p.min(w, h) / 4 * v);
            let d = p.constrain(p.min(w, h) / 2 - 15, 0, p.min(w, h));
            p.push();
            p.rotate(t * 360);
            p.arc(0, 0, d, d, 360 * v, 360 * (1 - v));
            p.pop();
          }
          p.stroke(0, 0, 100);
          if (p.min(w, h) > 1) {
            if (w < h) {
              p.push();
              p.scale(i % 2 === 0 ? -1 : 1, 1);
              let g = p.drawingContext.createLinearGradient(0, -h, 0, h);
              g.addColorStop(0, colors[i]);
              g.addColorStop(1, colors[i + 1]);
              p.drawingContext.strokeStyle = g;
              p.noFill();
              p.strokeWeight(10 * 2);
              p.rect(0, 0, w, h);
              // p.translate(0, -ld / 2);
              // p.rotate(p.int(p.random(8)) * 360 / 8 + t * 360 / 4);
              // p.line(0, 0, ld, 0);
              p.pop();
            } else {
              p.push();
              p.scale(1, i % 2 === 0 ? -1 : 1);
              let g = p.drawingContext.createLinearGradient(-w, 0, w, 0);
              g.addColorStop(0, colors[i]);
              g.addColorStop(1, colors[i + 1]);
              p.drawingContext.strokeStyle = g;
              p.strokeWeight(10 * 2);
              p.noFill();
              p.rect(0, 0, w, h);
              p.pop();
            }
          }
        }
        p.pop();
      }
    }
    
    function easeInOutCirc(x) {
      x = x*0.8*movingSpeed; // 設定矩形變化的速度頻率
      return x < 0.5
        ? (1 - p.sqrt(1 - p.sq(2 * x))) / 2
        : (p.sqrt(1 - p.sq(-2 * x + 2)) + 1) / 2;
    }

    function easeInOutElastic(x) {
      const c5 = (2 * p.PI) / 4.5;
      return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? -(p.pow(2, 20 * x - 10) * p.sin((20 * x - 11.125) * c5)) / 2
        : (p.pow(2, -20 * x + 10) * p.sin((20 * x - 11.125) * c5)) / 2 + 1;
    }

    let colorScheme = [
      {
        name: "Benedictus",
        colors: ["#F27EA9", "#366CD9", "#5EADF2", "#636E73", "#F2E6D8"],
      },
      {
        name: "Cross",
        colors: ["#D962AF", "#58A6A6", "#8AA66F", "#F29F05", "#F26D6D"],
      },
      {
        name: "Demuth",
        colors: ["#222940", "#D98E04", "#F2A950", "#BF3E21", "#F2F2F2"],
      },
      {
        name: "Hiroshige",
        colors: ["#1B618C", "#55CCD9", "#F2BC57", "#F2DAAC", "#F24949"],
      },
      {
        name: "Hokusai",
        colors: ["#074A59", "#F2C166", "#F28241", "#F26B5E", "#F2F2F2"],
      },
      {
        name: "Hokusai Blue",
        colors: ["#023059", "#459DBF", "#87BF60", "#D9D16A", "#F2F2F2"],
      },
      {
        name: "Java",
        colors: ["#632973", "#02734A", "#F25C05", "#F29188", "#F2E0DF"],
      },
      {
        name: "Kandinsky",
        colors: ["#8D95A6", "#0A7360", "#F28705", "#D98825", "#F2F2F2"],
      },
      {
        name: "Monet",
        colors: ["#4146A6", "#063573", "#5EC8F2", "#8C4E03", "#D98A29"],
      },
      {
        name: "Nizami",
        colors: ["#034AA6", "#72B6F2", "#73BFB1", "#F2A30F", "#F26F63"],
      },
      {
        name: "Renoir",
        colors: ["#303E8C", "#F2AE2E", "#F28705", "#D91414", "#F2F2F2"],
      },
      {
        name: "VanGogh",
        colors: ["#424D8C", "#84A9BF", "#C1D9CE", "#F2B705", "#F25C05"],
      },
      {
        name: "Mono",
        colors: ["#D9D7D8", "#3B5159", "#5D848C", "#7CA2A6", "#262321"],
      },
      {
        name: "RiverSide",
        colors: ["#906FA6", "#025951", "#252625", "#D99191", "#F2F2F2"],
      },
    ];

    p.windowResized = function() {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
})();
