//彩色橢圓

(function() {
let ratio = 0.8;
let t = 0;
let palette;
let offset;
let scaleFactor;
let movingSpeed = 1;

window.sketch = function(p) {
p.setup = function() {
  p.createCanvas(p.windowWidth, p.windowHeight); // 設定畫布大小為螢幕寬高
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.angleMode(p.DEGREES);
  p.scaleFactor = p.min(p.windowWidth, p.windowHeight) / 800;
}

p.draw = function() {
  p.background(0, 0, 15);
  p.randomSeed(int(p.frameCount / 160) * 10000000);
  palette = p.random(colorScheme).colors.concat();
  // palette = window.bgcolor;

  t += 1 / 80*movingSpeed;

  let num = 5; // 分割數量，可以根據需要調整
  let d = p.min(p.windowWidth, p.windowHeight);
  let w = p.sqrt(sq(d) * 2);
  let totalWidth = w * p.sqrt(2) + d / num;
  let totalHeight = w * p.sqrt(2) + d / num;
  let xOffset = (p.windowWidth - totalWidth) / 2;
  let yOffset = (p.windowHeight - totalHeight) / 2;

  p.herringboneInRect(xOffset, yOffset, totalWidth, totalHeight, num, 1);
}

p.herringboneInRect = function(x, y, width, height, num, depth) {
  let d = p.min(width, height);
  let rd = d / num;
  let w = p.sqrt(sq(d) * 2);
  let v = p.easeInOutCirc(t % 1);
  z = p.random() > 0.5 ? v : 1 - v;
  p.rectMode(CENTER);
  p.noStroke();
  p.fill(0, 0, 100, 0);
  p.rect(x + width / 2, y + height / 2, width, height);
  p.drawingContext.clip();
  p.push();
  p.translate(x + width / 2, y + height / 2);
  p.rotate(45 + (int(p.random(4)) * 360) / 4);
  p.scale(p.random() > 0.5 ? -1 : 1, p.random() > 0.5 ? -1 : 1);
  p.translate(-w, -w);
  let ox = -w;
  let i = 0;
  while (ox < w * sqrt(2) + rd) { // 調整為 w * sqrt(2) + rd 以確保右下角也有覆蓋
    let nx = ox;
    let ny = (-i * rd) / 2;
    while (ny < w * p.sqrt(2) + rd) { // 調整為 w * sqrt(2) + rd 以確保右下角也有覆蓋
      p.push();
      p.translate(nx + rd / 2, ny + rd / 2 / 2);
      let v2 = ((nx + rd / 2 / 2 + (ny + rd / 2) * width) / (width * height) + t) % 1;
      v2 = p.easeInOutCirc(v2);
      p.scale(ratio);
      p.rectMode(p.CENTER);
      p.noStroke();
      p.fill(0, 0, 100, 0);
      p.rect(0, 0, rd, rd / 2, rd * v2);
      p.drawingContext.clip();
      p.strokeCap(p.SQUARE);
      p.stroke(p.random(palette));
      if (p.random() > 0.5) {
        p.push();
        p.scale(random() > 0.5 ? -1 : 1, p.random() > 0.5 ? -1 : 1);
        p.strokeWeight(rd / 2);
        p.drawingContext.setLineDash([(rd / 2) * v2 * 2]);
        p.drawingContext.lineDashOffset = (rd / 2) * v2 * 2 * 2;
        p.line(-rd, 0, +rd, 0);
        p.pop();
      } else {
        p.push();
        p.scale(p.random() > 0.5 ? -1 : 1, p.random() > 0.5 ? -1 : 1);
        p.strokeWeight(rd * 2);
        p.drawingContext.setLineDash([rd * v2 * 2]);
        p.drawingContext.lineDashOffset = rd * v2 * 2 * 2;
        p.line(0, -rd / 2 / 2, 0, +rd / 2 / 2);
        p.pop();
      }
      p.pop();

      nx += rd;
      p.push();
      p.translate(nx + rd / 2 / 2, ny + rd / 2);
      v2 = ((nx + rd / 2 / 2 + (ny + rd / 2) * width) / (width * height) + t) % 1;

      p.scale(ratio);
      p.rectMode(CENTER);
      p.noStroke();
      p.fill(0, 0, 100, 0);
      p.rect(0, 0, rd / 2, rd, rd * (1 - v));
      p.drawingContext.clip();
      p.stroke(p.random(palette));
      p.strokeCap(p.SQUARE);
      if (p.random() > 0.5) {
        p.push();
        p.scale(p.random() > 0.5 ? -1 : 1, p.random() > 0.5 ? -1 : 1);
        p.strokeWeight(rd * 2);
        p.drawingContext.setLineDash([rd * (1 - v2) * 2]);
        p.drawingContext.lineDashOffset = rd * (1 - v2) * 2 * 2;
        p.line(-rd / 2 / 2, 0, +rd / 2 / 2, 0);
        p.pop();
      } else { 
        p.push();
        p.scale(p.random() > 0.5 ? -1 : 1, p.random() > 0.5 ? -1 : 1);
        p.strokeWeight(rd / 2);
        p.drawingContext.setLineDash([(rd / 2) * (1 - v2) * 2]);
        p.drawingContext.lineDashOffset = (rd / 2) * (1 - v2) * 2 * 2;
        p.line(0, -rd / 2, 0, +rd / 2);
        p.pop();
      }
      p.pop();
      ny += rd;
    }
    ox += rd / 2;
    i++;
  }
  p.pop();
}

p.easeInOutCirc = function(x) {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

p.easeInOutElastic = function(x) {
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
  p.resizeCanvas(p.windowWidth, p.windowHeight);
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


}
})();
