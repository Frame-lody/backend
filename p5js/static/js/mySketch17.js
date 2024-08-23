//彩色幾何圖形

(function() {

let myGraphices = [];
let myGraphices2 = [];
let canvas;
let graphics;
let palette;

window.sketch = function(p) {
p.setup = function() {
  myGraphices = [];
  myGraphices2 = [];
  canvas = p.createCanvas(800, 800);
  graphics = p.createGraphics(100, 100);
  canvas.position((p.windowWidth - p.width) / 2, (p.windowHeight - p.height) / 2);
  palette = p.shuffle(p.random(colorScheme).colors,true);
  // canvas.hide();
  let offset = p.max(p.width, p.height) / 15;
  let x = offset;
  let y = offset;
  let d = p.max(p.width, p.height) - offset * 2;
  let minD = d / 5;
  p.separateGrid(x, y, d, minD, myGraphices);
  p.separateGrid(0, 0, graphics.width, graphics.width / 3, myGraphices2);
}

p. windowResized = function() {
  canvas.position((p.windowWidth - p.width) / 2, (p.windowHeight - p.height) / 2);
}

p.separateGrid = function(x, y, d, minD, arr) {
  let sepNum = p.int(p.random(1, 4));
  let w = d / sepNum;
  for (let i = x; i < x + d - 1; i += w) {
    for (let j = y; j < y + d - 1; j += w) {
      if (p.random(100) < 95 && d > minD) {
        p.separateGrid(i, j, w, minD, arr);
      } else {
        if (i + w > 0 && i < p.width && j + w > 0 && j < p.height) {
          let myGraphics = new MyGraphics(i, j, w, w, 3);
          arr.push(myGraphics);
        }
      }
    }
  }
}

p.draw = function() {
  p.background(0);
  graphics.background(0);
  
  for (myGraphics of myGraphices) {
    myGraphics.update();
    myGraphics.draw(this);
  }
  for (myGraphics of myGraphices2) {
    myGraphics.update();
    myGraphics.draw(graphics);
  }

  document.body.style.backgroundImage = `url(${graphics.elt.toDataURL()})`;
}

class Shape {
  constructor(type, color, angle) {
    this.type = type;
    this.color = color;
    this.angle = angle;
  }

  draw(g, x, y, size) {
    g.push();
    g.translate(x, y);
    g.rotate(this.angle);
    g.fill(this.color);
    g.noStroke();

    if (this.type === 'circle') {
      g.circle(0, 0, size);
    } else if (this.type === 'triangle') {
      g.triangle(-size / 2, -size / 2, size / 2, -size / 2, -size / 2, size / 2);
    } else if (this.type === 'rectangle') {
      g.rectMode(CENTER);
      g.rect(0, 0, size, size);
    } else if (this.type === 'arc') {
      g.arc(-size / 2, -size / 2, size * 2, size * 2, 0, PI / 2);
    }

    g.pop();
  }
}

class MyGraphics {
  constructor(x, y, width, height, changeInterval) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    
    let centerX = width / 2;
    let centerY = height / 2;
    let distance = p.dist(this.x + this.width / 2, this.y + this.height / 2, centerX, centerY);
    let maxDistance = p.dist(0, 0, centerX, centerY);
    this.changeInterval = changeInterval * 1000;
    let delay = p.map(distance, 0, maxDistance, 0, this.changeInterval / 10);
    this.lastChangeTime = delay;

    this.directions = ["T", "D", "L", "R"];
    this.currentDirection = p.random(this.directions);
    this.easing = Easing.easeOutBounce;

    this.shapes = [];
    this.createShapes();
  }

  createShapes() {
    let shapeTypes = ['circle', 'triangle', 'rectangle', 'arc'];
    let colors = ['red', 'green', 'blue', 'yellow'];
    let angles = [0, HALF_PI, PI, PI + HALF_PI];

    for (let i = 0; i < 10; i++) { 
      let type = p.random(shapeTypes);
      let color = p.random(palette);
      let angle = p.random(angles);
      this.shapes.push(new Shape(type, color, angle));
    }
  }

  update() {
    let currentTime = p.millis();
    let elapsedTime = currentTime - this.lastChangeTime;
    let t = (elapsedTime % this.changeInterval) / this.changeInterval;
    let animationProgress = p.constrain(t, 0, 0.5) * 2;
    let offsetX = 0;
    let offsetY = 0;

    if (elapsedTime >= this.changeInterval) {
      this.lastChangeTime = currentTime;
      elapsedTime = 0; 
      t = 0; 
      animationProgress = 0; 
      let nextDirection = this.currentDirection;
      while (nextDirection == this.currentDirection) {
        nextDirection = p.random(this.directions);
      }
      this.currentDirection = nextDirection;

     
      let shape = this.shapes.shift();
      this.shapes.push(shape);
    }

    if (this.currentDirection === "T") {
      offsetY = -this.easing(animationProgress) * this.height;
      this.offsetY = offsetY;
    } else if (this.currentDirection === "D") {
      offsetY = this.easing(animationProgress) * this.height;
      this.offsetY = offsetY;
    } else if (this.currentDirection === "L") {
      offsetX = -this.easing(animationProgress) * this.width;
      this.offsetX = offsetX;
    } else if (this.currentDirection === "R") {
      offsetX = this.easing(animationProgress) * this.width;
      this.offsetX = offsetX;
    }
  }

  draw(g) {
    g.push();
    g.translate(this.x, this.y);
    g.rectMode(CORNER);
    g.noStroke();
    g.fill(255, 0);
    g.rect(0, 0, this.width, this.height);

    g.drawingContext.clip();

    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      if (this.currentDirection === "T") {
        shape.draw(g, this.width / 2, this.height / 2 + this.offsetY + i * this.height, this.width);
      } else if (this.currentDirection === "D") {
        shape.draw(g, this.width / 2, this.height / 2 + this.offsetY - i * this.height, this.width);
      } else if (this.currentDirection === "L") {
        shape.draw(g, this.width / 2 + this.offsetX + i * this.width, this.height / 2, this.width);
      } else if (this.currentDirection === "R") {
        shape.draw(g, this.width / 2 + this.offsetX - i * this.width, this.height / 2, this.width);
      }
    }

    g.drawingContext.restore();
    g.pop();
  }
}


class Easing {
  static easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2);
  }

  static easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
  }

  static easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  static easeInQuad(x) {
    return x * x;
  }

  static easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }

  static easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  static easeInCubic(x) {
    return x * x * x;
  }

  static easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  static easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  static easeInQuart(x) {
    return x * x * x * x;
  }

  static easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
  }

  static easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
  }

  static easeInQuint(x) {
    return x * x * x * x * x;
  }

  static easeOutQuint(x) {
    return 1 - Math.pow(1 - x, 5);
  }

  static easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
  }

  static easeInExpo(x) {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
  }

  static easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  static easeInOutExpo(x) {
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? Math.pow(2, 20 * x - 10) / 2
      : (2 - Math.pow(2, -20 * x + 10)) / 2;
  }

  static easeInCirc(x) {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
  }

  static easeOutCirc(x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
  }

  static easeInOutCirc(x) {
    return x < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
  }

  static easeInBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
  }

  static easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  static easeInOutBack(x) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  }
  static easeInElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
  }

  static easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  static easeInOutElastic(x) {
    const c5 = (2 * Math.PI) / 4.5;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  }

  static easeInBounce(x) {
    return 1 - Easing.easeOutBounce(1 - x);
  }

  static easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }

  static easeInOutBounce(x) {
    return x < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * x)) / 2
      : (1 + Easing.easeOutBounce(2 * x - 1)) / 2;
  }
}



};

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
})();
