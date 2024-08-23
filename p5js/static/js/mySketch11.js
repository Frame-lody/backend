// A fork of Wobbly Swarm by Konstantin Makhmutov
// https://openprocessing.org/sketch/492096
//

//藍色月亮

(function() {
const num=256 // number of pieces
const balls=[]
const massMin=.005
const massMax=.03

window.sketch = function(p) {
p.setup=()=>{
  p.createCanvas(p.windowWidth, p.windowHeight)
  for(let i=num;i--;){
    balls.push({
      mass:random(massMin,massMax),
      position:createVector(p.random(p.width),p.random(p.height)),
      velocity:createVector()
    })
  }
}

p.draw=()=>{

  let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
  // 反轉 x 坐標
  let adjustedX = p.width - 5*body_position.x+400;
  let adjustedY = 1*body_position.y+50;

  p.background('black')

  const infulence=.92
  balls.push({
    mass:2,
    position:createVector(adjustedX,adjustedY),
    velocity:createVector()
  })
  
  for(const A of balls){
    const acceleration=p.createVector()
    for(const B of balls){
      if (A !== B) {
        const difference=p5.Vector.sub(B.position,A.position)
        const distance = p.max(1,p.sqrt(difference.x **2 + difference.y **2))
        const force = (distance - 320) * B.mass / distance
        acceleration.add(difference.mult(force))
      }
    }    
    A.velocity=A.velocity.mult(infulence).add(acceleration.mult(A.mass))
  }
  balls.pop()

  for (const A of balls) {
    A.position.add(A.velocity)
  }

  p.noStroke()
  for (const A of balls) {
    const r=p.map(A.mass,massMin,massMax,255,0)
    p.fill(r,r*3,255)
    p.ellipse(A.position.x, A.position.y, A.mass * 600);
    
  }

  //繪製手指位置
  // p.fill(255, 0, 0);  // 紅色
  // p.noStroke();
  // p.ellipse(p.width - secondFinger.x, secondFinger.y, 15, 15);  // 手指位置的圓點
}

p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

}
})();