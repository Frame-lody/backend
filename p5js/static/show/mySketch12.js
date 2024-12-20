(function() {
  // let speed;
  let movingSpeed = speed?speed*1:1;

  var FRAME_ALPHA = 5; // background applied per frame with X% alpha
  var SPAWN_MIN_X = 0; // minimum x pos of drop spawn (set in setup())
  var SPAWN_MAX_X = 0; // maximum x pos of drop spawn (set in setup())
  var MAX_X_SPEED = 0.5; // max speed that drops can "wander" left or right
  var MAX_X_ACCEL = 0.025; // max rate that drops can accelerate left or right
  var MAX_Y_SPEED = 7.5; // maximum speed of drops in pixels per frame
  var GRAVITY = 0.0375 * movingSpeed; // gravity that moderates acceleration of drops
  var FRICTION = 0.9925; // friction multiplier that slows drops in all directions
  var MIN_RAD = 3; // minimum drop radius in pixels
  var MAX_RAD = 6; // maximum drop radius in pixels
  var MIN_RG = 130; // minimum red & green values for drops
  var MAX_RG = 180; // maximum red & green values for drops
  var EXPLODE_RAD = 250; // radius of explosion that pushes drops on click
  var EXPLODE_STR = 5; // strength of click explosion
  // let changeColors = [];//設定顏色

  var drops = [];

  window.sketch = function(p) {
    p.setup = function() {
      p.createCanvas(window.innerWidth, window.innerHeight);
      p.colorMode(p.RGB, 255, 255, 255, 100);
      p.ellipseMode(p.RADIUS);
      p.noStroke();
      SPAWN_MIN_X = 0;
      SPAWN_MAX_X = p.width;
    };

    p.draw = function() {
      p.background(0, 0, 0, FRAME_ALPHA);
      drops.push(new drop(p.random(SPAWN_MIN_X, SPAWN_MAX_X), 0)); // add a new drop each frame

      for (var i = drops.length - 1; i >= 0; i--) {
        drops[i].Run();

        if (!drops[i].isAlive()) {
          drops.splice(i, 1);
        }
      }
    };

    // drop object
    function drop(x, y) {
      this.x = x; // x pos of drop
      this.y = y; // y pos of drop
      this.rad = p.random(MIN_RAD, MAX_RAD); // drop radius
      this.xSpeed = 0; // drop wander speed
      this.ySpeed = 0; // drop fall speed

      if (changeColors.length > 0) {
        // 使用 changeColors 陣列中的顏色
        let colorHex = p.random(changeColors);
        let c = p.color(colorHex);
        this.r = p.red(c);
        this.g = p.green(c);
        this.b = p.blue(c);
      } else {
        // 原本顏色邏輯
        if (p.random(1) < 0.3) {
          this.r = 0;
          this.g = 0;
          this.b = p.random(MIN_RG, MAX_RG);
        } else {
          this.r = p.random(MIN_RG, MAX_RG);
          this.g = p.random(MIN_RG, MAX_RG);
          this.b = 255;
        }
      }

      this.Run = function() {
        this.Update();
        this.Display();
      };

      this.Update = function() {
        let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
        let adjustedX = p.width - 5 * body_position.x + 400;
        let adjustedY = 1 * body_position.y + 50;

        this.ySpeed += GRAVITY;

        var a = p.random(-MAX_X_ACCEL, MAX_X_ACCEL);
        this.xSpeed += a;

        this.xSpeed *= FRICTION;
        this.ySpeed *= FRICTION;
        this.y += this.ySpeed;
        this.x += this.xSpeed;

        var dist = p.sqrt(p.sq(this.x - adjustedX) + p.sq(this.y - adjustedY));
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
        return this.y < window.innerHeight + this.rad;
      };
    }

    p.windowResized = function() {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };
  };
  })();