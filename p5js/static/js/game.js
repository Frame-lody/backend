var ship;
var candy = [];
var drops = [];
var life = 80;
var enemy = 2;
var level = 1;
var balls = [];
var acceleration = 0.0091;
var rain = [];

function setup() {
	var canvas = createCanvas(windowWidth / 2, windowHeight / 2); // 縮小畫布尺寸
	canvas.parent('gameContainer'); // 將畫布附加到<div>中

	ship = new Ship();
	Dropx = loadImage("/static/img/candy.png");
	winter = loadImage("/static/img/winter.jpg");
	gift = loadImage("/static/img/gift.png");
	ginger = loadImage("/static/img/ginger.png");

	for (var i=0; i<enemy; i++) {
		candy[i] = new Candy(i*80+80,60);
	}

	/*for (i = 0; i < nRains; i++) {
	rain.push(new Rain())
  }
	*/
	/* SNOW */
	for (var k = 0; k < 500; k++) {
	balls.push(new Ball())
}


}

function draw() {
	fill(0,0,0,255)
	background(winter);
	ship.show();
	ship.move();

	fill (1)
	text("Lvl",22 ,40);
  textSize(50);

	fill (1);
	textSize (32);
	text (level, 72 , 40);

	for (var k = 0; k < balls.length; k++) {
   /* balls[k].update();*/
		balls[k].mostra();
		balls[k].rain();
	}

	for (var i = 0; i < drops.length; i++) {
		drops[i].show();
		drops[i].move();

		for (var j = 0; j < candy.length; j++) {
			if (drops[i].hits(candy[j])) {
				candy[j].grow();
				drops[i].evaporate();
			}
			if (candy[j].r > life ) {
				candy.splice(j,1)
			}



			/*LEVEL*/
			function resetSketch() {
				for (var i=0; i<enemy; i++) {
					candy[i] = new Candy(i*80+80,60);
				}
			}
		}
	}

	if(candy.length < 1){
				enemy+= 3;
				life+= 15;
				level++;
				candy.xdir+= 2;
				resetSketch();

	}

	var edge = false;

	for (var i = 0; i < candy.length; i++) {
		candy[i].show();
		candy[i].move();


		/*END GAME */
		if(candy[i].y > height) {
			noLoop();
			background
			textSize(80);
		fill(1);
			text("Game Over",1000/2,height/2);
		textSize(20);
		text("Press X Retry", 635 ,350);
		}

		if(key == 'x' || key =='X'){

		}

	}

	if (edge) {
		for (var i = 0; i < candy.length; i++) {
			candy[i].shiftDown();
		}
	}
	for (var i = drops.length-1 ; i>=0 ; i--) {
		if (drops[i].toDelete) {
				drops.splice(i, 1);
		}
	}
}

function keyReleased() {
	if(key!= ' '){
	ship.setDir(0);
	}
}

	function keyPressed() {
		if (key === ' ') {
			var drop = new Drop(ship.x, height);
			drops.push(drop);
		}

		if (keyCode === RIGHT_ARROW){ship.setDir(1);}
		else if (keyCode === LEFT_ARROW) {ship.setDir(-1);
	}

}

function Candy(x,y) {
	this.x = x;
	this.y = y;
	this.r = 50;
	this.xdir = 2; /* speed*/
	this.ydir = 0;

	this.grow = function() {
		this.r = this.r + 2;
	}

	this.shiftDown = function() {
			this.xdir *= -1;
			this.y += this.r;
	}

	this.move= function() {
		this.x += this.xdir;
		if (this.x > width - 45 || this.x < 0 ) {
			this.y += 45;
			this.xdir *= -1
		}
	}

	this.show = function() {
		image(gift, this.x,this.y, this.r*1, this.r*1);
	}

}

function Ship() {
	this.x = width/2;
	this.xdir = 0;
	this.show = function() {
	noFill();
  stroke (1)
	ellipse(ginger.x, 100,90,90);
	image(ginger, this.x, height-99, 100, 100);
	}

	this.setDir = function(dir) {
		this.xdir = dir;
	}

	this.move = function(dir) {
		this.x += this.xdir*5;
	}
}

function Drop(x,y) {
	this.x = x;
	this.y = y;
	this.r = 8;
	this.toDelete = false;
	this.show = function() {
		image(Dropx, this.x, this.y, 22,40);
	}

	this.evaporate = function() {
		this.toDelete = true;
	}

	this.hits = function(candy) {
		var d = dist(this.x, this.y, candy.x, candy.y)
		if (d < this.r + candy.r) {return true;}
		else {return false;}

	}

	this.move = function() {
		this.y = this.y -7.5;
	}
}

function Ball() {
	this.initZ = function() {
	  this.z = random() * width;
	};
	this.initW = function() {
	  this.w = -random() * height / 3;
	};
	this.w = random() * height;

	this.length = random() * 7.1;
	this.speed = random();

	this.mostra = function() {
		  fill(245);
		  stroke(1,83)
	  ellipse(this.z, this.w,this.length);
	};

	this.rain = function() {
	  if (this.w < height) {
		this.w += this.speed;
		this.speed += acceleration;
	  } else {
		this.speed = random();
		this.initW();
		this.initZ();
	  }
	};
  }
