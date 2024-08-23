
//黑白三角形
(function() {
let block_size = 30;
let block_num = 12;
let triangleNum = 20;
let zMin = -2500;
let zMax = 1000;
let cylinderHeight;
let textures = [];
let offsetX = 0;
let speed = 1;  // 速度調整


window.sketch = function(p) {
p.setup = function() {
  p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
  cylinderHeight = p.abs(zMin - zMax) / triangleNum;

  for (let i = 0; i < triangleNum; i++) {
    let g = p.createGraphics(block_num * block_size, block_size);
    g.pixelDensity(5);
    g.noSmooth();
    g.background(0);
    for (let j = 0; j < block_num; j++) {
      let x = block_size * j;
      g.push();
      g.translate(x + block_size / 2, block_size / 2);
      g.rotate((p.int(p.random(4)) * TWO_PI) / 4);
      let sclStep = p.int(p.random(1, 5));
      for (let scl = 1; scl > 0; scl -= 1 / sclStep) {
        g.arc(
          -block_size / 2,
          -block_size / 2,
          block_size * 2 * scl,
          block_size * 2 * scl,
          0,
          PI / 2,
          PIE
        );
      }
      g.pop();
    }
    textures.push(g);
  }
}

p.draw = function() {
  p.background(20);
  p.orbitControl();

  for (let i = 0; i < triangleNum; i++) {
    offsetX = p.int(p.map(p.sin(p.frameCount/100+i/triangleNum *p.TWO_PI),-1,1,-3,3));  // deltaTimeを使ってフレーム間の時間経過を考慮
    let z = p.map(i, 0, triangleNum, zMin, zMax);
    p.push();
    p.translate(0, 0, z);
    p.rotateX(PI / 2);
    let tex = textures[i];
    tex.image(tex, offsetX % tex.width+tex.width, 0);
    tex.image(tex, offsetX % tex.width, 0);
    tex.image(tex, -tex.width + offsetX % tex.width, 0);
    p.texture(tex);
    p.noStroke();
    p.cylinder(cylinderHeight * 2, cylinderHeight, 3+1, 1, false, false);
    p.pop();
  }
}

p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

};
})();