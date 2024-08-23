//旋轉銀河

(function() {
let xs = [];
let rs = [];
let ss = [];
let zs = [];
let colors = [];

let n = 10000;
let movingSpeed = 1;

let speed = 0.004*movingSpeed;

let tilt = 0.2;
let mx = 0;
let my = 0;

let first = 0;

window.sketch = function(p) {

p.setup = function() {
  p.createCanvas(p.windowWidth, p.windowHeight);
  p.noStroke();
  p.background(0);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.text("Loading. Please wait.", p.width / 2, p.height / 2);

  // Initialize colors array with three colors
  colors = ['#ffffff','#FFF9B6','#c1d3fe','#FFD8A9'];
	
	// colors = ['#ffffff','#fdffb6','#A0E6FA'];
}

p.draw = function() {
  let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
  // 反轉 x 坐標
  let adjustedX = p.width - 5*body_position.x+400;
  let adjustedY = 1*body_position.y+50;


  if (first === 0) {
    first = 1;
  } else if (first === 1) {
    xs = new Array(n);
    rs = new Array(n);
    ss = new Array(n);
    zs = new Array(n);
    colorsArray = new Array(n); // Add an array to store color for each point
    let m = 2;
    for (let i = 0; i < n; i++) {
      xs[i] = p.sq(p.random(1.4)) + p.random(0.05);
      rs[i] = ((p.sqrt(p.sin(p.random(p.PI / 2)))) + p.int(p.random(m)) + p.random(0.01)) / m * p.TWO_PI - (9 * p.sqrt(xs[i]));
      ss[i] = p.random(1, 4);
      zs[i] = p.sq(p.random(0.1)) * (p.random(1) > 0.5 ? -1 : 1) * xs[i] * 10;
      colorsArray[i] = p.random(colors); // Randomly assign a color from the colors array
    }
    first = 2;
  } else {
    mx += (adjustedX - mx) / 4;
    my += (adjustedY - my) / 4;
    p.background(0);

    p.translate(p.width / 2, p.height / 2);
    p.rotate(tilt);

    for (let i = 0; i < n; i++) {
      p.push();
      let r = rs[i] - mx / 1000;
      let x = xs[i];
      let close = 1 + p.sin(r - 0.5) * p.sqrt(x);

      p.translate(0, zs[i] * p.width);
      p.scale(1 / pow(2, 1 - close));
      
      p.fill(colorsArray[i]); // Set the fill color for each point
      p.ellipse(x * p.width * (p.cos(r) + p.sin(r)), 
              x * p.width * (p.sin(r) - p.cos(r)) * p.map(my, 0, p.height, -0.3, 0.3), 
              ss[i], ss[i]);
      rs[i] += (x / (x + 1) + 0 * close / 4) * speed / xs[i] * (20 / p.frameRate());
      p.pop();
    }
  }

  // 繪製手指位置
       
    // p.fill(255, 0, 0);  // 紅色
    // p.noStroke();
    // p.ellipse(p.width - adjustedX, adjustedY, 15, 15);  // 手指位置的圓點
        
}

p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    
};

};
})();
