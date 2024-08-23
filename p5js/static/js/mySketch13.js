//彩色顏料

(function() {
  // GLOBALS
  let MAX_PARTICLES = 170;
  let COLORS = ['#9381ff','#fff3b0','#FDFFFC','#b8b8ff','#ffeedd','#ffb4a2'];

  // ARRAYS
  let particles = [];
  let pool = [];

  // VARIABLES
  let wander1 = 0.5;
  let wander2 = 2.0;
  let drag1 = 0.9;
  let drag2 = 0.99;
  let force1 = 2;
  let force2 = 8;
  let theta1 = -0.5;
  let theta2 = 0.5;
  let size1 = 5;
  let size2 = 180;
  let sizeScalar = 0.97;

  // ----------------------------------------
  // Particle Functions
  // ----------------------------------------

  window.sketch = function(p) {
    p.Particle = function(x, y, size) {
      this.alive = true;
      this.size = size || 5;
      this.wander = 0.2;
      this.theta = p.random(p.TWO_PI);
      this.drag = 0.95;
      this.color = '#fff';
      this.location = p.createVector(x || 0.0, y || 0.0);
      this.velocity = p.createVector(0.0, 0.0);
    };

    p.Particle.prototype.move = function() {
      this.location.add(this.velocity);
      this.velocity.mult(this.drag);
      this.theta += p.random(theta1, theta2) * this.wander;
      this.velocity.x += p.sin(this.theta) * 0.4; //調整效果範圍大小
      this.velocity.y += p.cos(this.theta) * 0.4; //調整效果範圍大小
      this.size *= sizeScalar;
      this.alive = this.size > 0.5;
    };

    p.Particle.prototype.show = function() {
      p.fill(this.color);
      p.noStroke();
      p.ellipse(this.location.x, this.location.y, this.size, this.size);
    };

    p.spawn = function(x, y) {
      

      let particle, theta, force;
      if (particles.length >= MAX_PARTICLES) {
        pool.push(particles.shift());
      }
      particle = new p.Particle(x,y, p.random(size1, size2));
      particle.wander = p.random(wander1, wander2);
      particle.color = p.random(COLORS);
      particle.drag = p.random(drag1, drag2);
      theta = p.random(p.TWO_PI);
      force = p.random(force1, force2);
      particle.velocity.x = p.sin(theta) * force;
      particle.velocity.y = p.cos(theta) * force;
      particles.push(particle);
    };

    p.update = function() {
      let i, particle;
      for (i = particles.length - 1; i >= 0; i--) {
        particle = particles[i];
        if (particle.alive) {
          particle.move();
        } else {
          pool.push(particles.splice(i, 1)[0]);
        }
      }
    };

    p.moved = function(secondFinger,adjustedX) {
      let particle, max, i;
      max = p.random(1, 4);
      for (i = 0; i < max; i++) {
        p.spawn(adjustedX, secondFinger);
      }
    };

    // ----------------------------------------
    // Runtime
    // ----------------------------------------

    p.setup = function() {
      p.createCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = function() {

      let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
      // 反轉 x 坐標
      let adjustedX = p.width - 5*body_position.x+400;
      let adjustedY = 1*body_position.y+50;

      p.update();
      p.drawingContext.globalCompositeOperation = 'lighter';
      p.background(0);
      p.drawingContext.globalCompositeOperation = 'normal';
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].show();
      }

      p.moved(adjustedY,adjustedX);
      
        // 繪製手指位置
       
        // p.fill(255, 0, 0);  // 紅色
        // p.noStroke();
        // p.ellipse(p.width - secondFinger.x, secondFinger.y, 15, 15);  // 手指位置的圓點
        
    };

    // p.mouseMoved = function() {
    //   p.moved();
    // };

    // p.touchMoved = function() {
    //   p.moved();
    // };

    p.windowResized = function() {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
})();
