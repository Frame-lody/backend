(function() {
    // 星星效果


    let particles = [];
    let starGraphics;
    // let colors = 0 ; // 設定顏色

    window.sketch = function(p) {
        p.setup = function() {
            p.createCanvas(window.innerWidth, window.innerHeight);
            starGraphics = p.createGraphics(p.width, p.height);
            p.colorMode(p.HSB);
            p.background(0);
        };

        p.draw = function() {
            p.noStroke();
            p.background(0, 0.03);

            let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
            let adjustedX = p.width - 5 * body_position.x + 400;
            let adjustedY = 1 * body_position.y;

            if (adjustedX >= 0 && adjustedX <= p.width && adjustedY >= 0 && adjustedY <= p.height) {
                let colorIndex = colors.length>0? Math.floor(p.random(colors.length)) : null; // 檢查是否有顏色陣列
                let newParticle = {
                    x: adjustedX + p.random(-80, 100),
                    y: adjustedY + p.random(-80, 100),
                    clr: colorIndex !== null && colors[colorIndex] ? colors[colorIndex] : p.color(p.noise(adjustedX  / 40, adjustedY/ 40) * 30 + 20, p.random(100) + 20, 100), // 防止 clr 為 undefined
                };
                particles.push(newParticle);
            }

            for (let i = 0; i < particles.length; i++) {
                let pnt = particles[i];
                if (!pnt || !pnt.clr) continue; // 跳過未正確初始化的粒子
                p.fill(pnt.clr);
                p.ellipse(pnt.x, pnt.y, 3);

                pnt.x += (p.noise((pnt.x + adjustedX) / 200, (pnt.y + adjustedY) / 200, 1000) - 0.5) * 3;
                pnt.y += (p.noise((pnt.x + adjustedX) / 250, pnt.y / 250, 10000) - 0.5) * 3;

                let angle = p.atan2(adjustedY - pnt.y, adjustedX - pnt.x);
                pnt.x += p.cos(angle) * 0.5;
                pnt.y += p.sin(angle) * 0.5;
            }

            starGraphics.clear();
            starGraphics.push();

            let sx = adjustedX;
            let sy = adjustedY;
            starGraphics.translate(sx, sy);

            starGraphics.rotate(p.map(p.noise(1000, p.frameCount / 300), 0, 1, -1, 1));
            starGraphics.beginShape();
            starGraphics.noStroke();
            starGraphics.fill(colors.length > 0 ? colors[Math.floor(p.frameCount / 60) % colors.length] : p.color(p.noise(adjustedX  / 40, adjustedY/ 40) * 30 + 20, p.random(100) + 20, 100)); // 使用顏色陣列或原本設定

            let p0x, p0y;
            for (let ang = 0; ang < 2 * p.PI; ang += 0.1) {
                let r = 50 + p.sin(ang * 5 + p.frameCount / 30) * 10 + p.noise(ang, p.frameCount / 5) * 20;
                let x = p.cos(ang) * r, y = p.sin(ang) * r;
                starGraphics.curveVertex(x, y);
                if (ang == 0) {
                    p0x = x;
                    p0y = y;
                    starGraphics.curveVertex(x, y);
                }
            }
            starGraphics.curveVertex(p0x, p0y);
            starGraphics.endShape();

            starGraphics.fill(0);
            starGraphics.circle(-10 + p.random(-3, 3), -10 + p.random(-3, 3), 10);
            starGraphics.circle(10 + p.random(-3, 3), -10 + p.random(-3, 3), 10);

            starGraphics.strokeWeight(5);
            starGraphics.stroke(0);
            starGraphics.beginShape();
            starGraphics.noFill();
            for (let o = -20; o < 20; o += 1) {
                starGraphics.curveVertex(o, p.noise(o / 20 + 50, p.frameCount / 20) * 30 + 0);
            }
            starGraphics.endShape();

            starGraphics.pop();

            p.push();
            p.image(starGraphics, 0, 0);
            p.drawingContext.filter = "blur(10px)";
            p.blendMode(p.SCREEN);
            p.image(starGraphics, 0, 0);
            p.pop();
        };

        p.windowResized = function() {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
            starGraphics = p.createGraphics(p.width, p.height);
        };
    };
})();
