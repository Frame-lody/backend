(function() {
//變化三等份彩色圓圈


let originalpalette = [
	"#FF5F5F",
	"#F8907C",
	"#FFC2A7",
	"#FFEC57",
	"#9EF2BB",
	"#6CBAF4",
	"#4AD0E8",
  ];

//   let palette  = window.bgcolor;
  let target;
  

  let urlParams = new URLSearchParams(window.location.search);   // 創建一個 URLSearchParams 的物件用來解析查詢字串
  let key = urlParams.get('key'); // 使用 get() 方法來獲取指定參數的值
  //console.log(key); // "value"

  let movingSpeed = key||1;
  let freq =300/movingSpeed ;
  let R, s;
  let hexagons;
  let global_n = 0;

  let colors = urlParams.get('colors');
  //console.log(colors);

  // 將 colors 字串轉換為陣列
  let palette = colors ? colors.split(',') : originalpalette; 
  console.log(palette);
  

  window.sketch = function(p) {
  
  p.setup = function() {
	p.createCanvas(p.windowWidth, p.windowHeight);
	p.colorMode(p.HSB, 360, 100, 100, 100);
	p.angleMode(p.DEGREES);
	p.textAlign(p.CENTER, p.CENTER);
	R = p.min(p.width, p.height) / p.int(p.random(5, 15));
	s = p.sqrt((3 * p.sq(R)) / 4);
	hexagons = [];
	for (let y = -s; y < p.height + s; y += 2 * s) {
	  for (let x = -s; x < p.width + R; x += 3 * R) {
		hexagons.push(new Hexagon(x, y, R));
		hexagons.push(new Hexagon(x + 1.5 * R, y + s, R));
	  }
	}
  }
  
  p.draw = function() {

	// movingSpeed = window.speed || 1;
	// freq = 300*movingSpeed;
	// consol*e.log(window.speed);
	p.background(0, 0, 10);
	p.randomSeed(230617 + p.frameCount / freq);
  
	if (p.frameCount % freq == 0) {
	  global_n += p.int(p.random(1, 9));
	  R = p.min(p.width, p.height) / p.int(p.random(5, 15));
	  s = p.sqrt((3 * p.sq(R)) / 4);
	  hexagons = [];
  
	  for (let y = -s; y < p.height + s; y += 2 * s) {
		for (let x = -s; x < p.width + R; x += 3 * R) {
		  hexagons.push(new Hexagon(x, y, R));
		  hexagons.push(new Hexagon(x + 1.5 * R, y + s, R));
		}
	  }
	}
  
	let offset = p.width / 10;
  
	for (let h of hexagons) {
	  h.render();
	}
	// noLoop();
  }
  
  class Hexagon {
	constructor(x, y, r) {
	  this.x = x;
	  this.y = y;
	  this.r = r;
	  this.t;
	  this.colors = [
		p.shuffle(palette.concat()),
		p.shuffle(palette.concat()),
		p.shuffle(palette.concat()),
	  ];
	  this.shape = [
		p.random()>0.5,
		p.random()>0.5,
		p.random()>0.5,
	  ];    
	  this.limit = [
		p.int(p.random(2, this.colors[0].length)),
		p.int(p.random(2, this.colors[1].length)),
		p.int(p.random(2, this.colors[2].length)),
	  ];
	  this.dir = p.random() > 0.5 ? -1 : 1;
	}
  
	draw(x, y, r) {
		p.push();
		p.translate(x, y);
		p.rotate((p.int(p.random(6)) * 360) / 6 + this.t * 60 * this.dir);
		p.noStroke();
		p.stroke(0, 0, 0);
		p.fill(0, 0, 100);
		p.scale(this.t);
	  p.push();
	  let n = 0;
	  for (let angle = 0; angle < 360; angle += 360 / 3) {
		p.push();
		p.fill(0, 0, 100);
		p.stroke(0, 0, 0);
		let m = 0;
		let sclStep = 1 / p.int(p.random(2, 8));
		let d = r * p.sqrt(3);
		let sw = d * sclStep;
		for (let scl = 1; scl > 1/2; scl -= sclStep) {
		  p.stroke(this.colors[n][m++ % this.limit[n]]);
		  p.noFill();
		  p.strokeWeight(sw/2);
		  p.strokeCap(p.SQUARE);
		  p.arc(
			p.cos(angle + 60) * r,
			p.sin(angle + 60) * r,
			r * scl * p.sqrt(3)-sw/2,
			r * scl * p.sqrt(3)-sw/2,
			angle + 180 + this.t * 360,
			angle + 300 + this.t * 360,
		  );
		}
		n++;
		p.pop();
	  }
	  p.pop();
	  p.pop();
	}
	render() {
	  this.t = this.getTime(global_n % 9);
	  this.t *= 0.5;
	  this.t += (1 / freq) * (p.frameCount % freq) * 3;
	  this.t = this.t % 3;
	  this.t = p.constrain(p.abs(this.t - 1.5), 0, 1);
	  this.t = p.sq(this.t);
	  this.t = easeInOutCirc(1 - this.t);
	  // this.t = 1;
	  this.draw(this.x, this.y, this.r);
	}
	getTime(num) {
	  let n;
	  switch (num) {
		case 0:
		  n =
		  p.dist(this.x, this.y, p.width / 2, p.height / 2) /
		  p.sqrt(p.sq(p.width) + p.sq(p.height));
		  break;
		case 1:
		  n = this.x / p.width;
		  break;
		case 2:
		  n = 1 - this.x / p.width;
		  break;
		case 3:
		  n = 1 - this.y / p.height;
		  break;
		case 4:
		  n = this.y / p.height;
		  break;
		case 5:
		  n = (this.x + this.y * p.width * 2) / (p.width * p.height);
		  break;
		case 6:
		  n = p.dist(mouseX, mouseY, this.x, this.y) / p.sqrt(p.sq(p.width) + p.sq(p.height));
		  break;
		case 7:
		  n = p.dist(p.width/2, this.y, this.x, this.y) / p.sqrt(p.sq(p.width) + p.sq(p.height));
		  break;
		case 8:
		  n = p.dist(this.x, p.height/2, this.x, this.y) / p.sqrt(p.sq(p.width) + p.sq(p.height));
		  break;
	  }
	  return n;
	}
  
	get distanceToMouse() {
	  return p.dist(mouseX, mouseY, this.x, this.y);
	}
  }
  
  function easeInOutCirc(x) {
	return x < 0.5
	  ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
	  : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
  }
  
  function easeInOutElastic(x) {
	const c5 = (2 * Math.PI) / 4.5;
  
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : x < 0.5
	  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
	  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  }
  
  p.windowResized = function() {
	resizeCanvas(p.windowWidth, p.windowHeight);
  }
};
})();