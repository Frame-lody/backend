//紫色瀑布

(function() {
let movingSpeed = 1;
var FRAME_ALPHA = 5; // background applied per frame with X% alpha
var SPAWN_MIN_X = 0; // minimum x pos of drop spawn (set in setup())
var SPAWN_MAX_X = 0; // maximum x pos of drop spawn (set in setup())
var MAX_X_SPEED = 0.5; // max speed that drops can "wander" left or right
var MAX_X_ACCEL = 0.025; // max rate that drops can accelerate left or right
var MAX_Y_SPEED = 7.5; // maximum speed of drops in pixels per frame
var GRAVITY = 0.0375*movingSpeed; // gravity that moderates acceleration of drops
var FRICTION = 0.9925; // friction multiplier that slows drops in all directions
var MIN_RAD = 3; // minimum drop radius in pixels
var MAX_RAD = 6; // maximum drop radius in pixels
var MIN_RG = 130; // minimum red & green values for drops  改變顏色
var MAX_RG = 180; // maximum red & green values for drops  改變顏色
var EXPLODE_RAD = 250; // radius of explosion that pushes drops on click
var EXPLODE_STR = 5; // strength of click explosion

var drops = [];

window.sketch = function(p) {
p.setup  = function() {
  p.createCanvas(p.windowWidth, p.windowHeight);
  p.colorMode(p.RGB, 255, 255, 255, 100);
  p.ellipseMode(p.RADIUS);
  p.noStroke();
  SPAWN_MIN_X = 0;
  SPAWN_MAX_X = p.width;
}

p.draw = function() {

  

  p.background(0, 0, 0, FRAME_ALPHA);
  drops.push(new drop(p.random(SPAWN_MIN_X, SPAWN_MAX_X), 0)); // add a new drop each frame

  for (var i = drops.length - 1; i >= 0; i--) {
    drops[i].Run();

    if (!drops[i].isAlive()) {
      drops.splice(i, 1);
    }
  }
}

// drop object
function drop(x, y) {
  this.x = x; // x pos of drop
  this.y = y; // y pos of drop
  this.rad = p.random(MIN_RAD, MAX_RAD); // drop radius
  this.xSpeed = 0; // drop wander speed
  this.ySpeed = 0; // drop fall speed
  
  // 隨機設置水滴顏色，有些是藍色
  if (p.random(1) < 0.3) { // 30%的機會變成藍色
    this.r = 0;
    this.g = 0;
    this.b = random(MIN_RG, MAX_RG);
  } else {
    this.r = random(MIN_RG, MAX_RG);
    this.g = random(MIN_RG, MAX_RG);
    this.b = 255; // blue is always max for non-blue drops
  }

  this.Run = function() {
    this.Update();
    this.Display();
  };

  this.Update = function() {

    let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
    // 反轉 x 坐標
    let adjustedX = p.width - 5*body_position.x+400;
    let adjustedY = 1*body_position.y+50;

    this.ySpeed += GRAVITY;

    var a = random(-MAX_X_ACCEL, MAX_X_ACCEL);
    this.xSpeed += a;

    this.xSpeed *= FRICTION;
    this.ySpeed *= FRICTION;
    this.y += this.ySpeed;
    this.x += this.xSpeed;

    var dist = p.sqrt(sq(this.x - adjustedX) + sq(this.y - adjustedY));
    if (dist < EXPLODE_RAD) {
      var v = p.createVector(this.x - adjustedX, this.y - adjustedY);
      var str = EXPLODE_STR * (EXPLODE_RAD - dist) / EXPLODE_RAD;
      v.normalize();
      v.mult(str);
      this.xSpeed += v.x;
      this.ySpeed += v.y;
    }
  };

  this.Display = function() {
    p.fill(this.r, this.g, this.b, 100);
    p.ellipse(this.x, this.y, this.rad, this.rad);
  };

  this.isAlive = function() {
    return this.y < p.windowHeight + this.rad;
  };
}

p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

// function mouseClicked() {
//   for (var i = 0; i < drops.length; i++) {
//     var dist = sqrt(sq(drops[i].x - mouseX) + sq(drops[i].y - mouseY));
//     if (dist > EXPLODE_RAD) {
//       continue;
//     }

//     var v = createVector(drops[i].x - mouseX, drops[i].y - mouseY);
//     var str = EXPLODE_STR * (EXPLODE_RAD - dist) / EXPLODE_RAD;
//     v.normalize();
//     v.mult(str);
//     drops[i].xSpeed += v.x;
//     drops[i].ySpeed += v.y;
//   }
// }

}
})();