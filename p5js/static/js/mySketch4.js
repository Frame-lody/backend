(function() {
  //彩色變換螢光棒
    const CLRS = "6b2737-e08e45-f8f4a6-bdf7b7-3943b7"
      .split("-")
      .map((i) => "#" + i);
    
    const vertSrc = `
      precision mediump float;
      
      attribute vec3 aPosition;
      varying vec2 vTexCoord;
    
      void main() {
        gl_Position = vec4(aPosition, 1.0);
        vTexCoord = (aPosition.xy + 1.0) / 2.0;
      }
    `;
    
    const fragSrc = `
      precision mediump float;
      
      varying vec2 vTexCoord;
      uniform vec2 iResolution;
      uniform float iTime;
      
      float sdCircle(vec2 p, float r) {
        return length(p) - r;
      }
      
      float glowCircle(vec2 p, float r, float maxd) {
        return (maxd - min(maxd, sdCircle(p, r))) / maxd;
      }
      
      #define PI 3.14159265
      
      float random(in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      float noise(in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
      
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
      
        vec2 u = f * f * (3.0 - 2.0 * f);
      
        return mix(a, b, u.x) +
               (c - a) * u.y * (1.0 - u.x) +
               (d - b) * u.x * u.y;
      }
      
      float distCircRad(in vec2 uv, in vec2 c, in float r, in float a) {
        vec2 p = c + vec2(cos(a), sin(a)) * r;
        return length(uv - p);
      }
      
      float distSegment(in vec2 p, in vec2 a, in vec2 b) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h_c = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        float h = dot(pa, ba) / dot(ba, ba);
        float d = max(0.0, length(pa - ba * h));
        float d_c = max(0.0, length(pa - ba * h_c));
        if (h < 0.0) d_c += abs(h);
        if (h > 1.0) d_c += h - 1.0;
        return d_c;
      }
      
      float easeInOutCubic(in float x) {
        return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
      }
      
      float easeInElastic(in float x) {
        float c4 = (2.0 * PI) / 3.0;
        return x == 0.0 ?
               0.0 :
               x == 1.0 ?
               1.0 :
               -pow(2.0, 10.0 * x - 10.0) * sin((x * 10.0 - 10.75) * c4);
      }
      
      float easeDouble(in float x) {
        float v = easeInElastic(fract(x * 2.0)) * 0.5;
        return x < 0.5 ? v : 0.5 + v;
      }
      
      vec3 getClrNeonPts(in vec2 p, in vec2 a, in vec2 b, in vec3 clr, in float its) {
        float d = distSegment(p, a, b);
        float br = its / d;
        br = min(1.86, br);
        return clr * br + vec3(1.0) * br * 0.15;
      }
      
      vec3 getClrNeonBar(in vec2 p, in vec2 pos, in float len, in float ang, in float dag, in vec3 clr, in float its) {
        float f = easeDouble(fract(iTime / PI)); //調整變動頻率
        float cag = ang + dag * f;
        vec2 w = vec2(cos(cag), sin(cag)) * len * 0.5;
        vec2 a = pos + w;
        vec2 b = pos - w;
        float d = distSegment(p, a, b);
        float br = its / d;
        br = min(1.86, br);
        return clr * br + vec3(1.0) * br * 0.15;
      }
      
      vec3 getColor(in vec2 pos, in float iTime) {
        float n = noise(pos);
        return n < sin(iTime * 0.5) * 0.5 ? vec3(0.8, 0.2, 0.7) : n < sin(iTime * 0.3) ? vec3(0.2, 0.7, 0.8) : vec3(0.9);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy - 0.5;
        uv.x *= iResolution.x / iResolution.y;
      
        vec3 clr = vec3(0.01, 0.01, vTexCoord.y * 0.35);
      
        clr -= 0.3 * random(uv * PI + floor(iTime * 5.0));
      
        for (float y = -1.0; y <= 1.0; y += 0.15) {
          for (float x = -1.0; x <= 1.0; x += 0.15) {
            vec2 pos = vec2(x + 0.05, y - 0.1);
            float n = noise(pos);
            vec3 col = n < sin(iTime * 0.5) * 0.3 ? vec3(0.9) : n < sin(iTime * 0.5) ? vec3(0.2, 0.7, 0.8) : vec3(0.8, 0.2, 0.7);
            float da = floor((n * 10.0) * 10.0) < 5.0 ? -PI : PI;
            clr += getClrNeonBar(uv, pos, 0.2, sign(da) * PI / 4.0, da, col, 0.005);
          }
        }
      
        gl_FragColor = vec4(clr, 1.0);
      }
    `;
    
    let movingSpeed = 1;
    window.sketch = function(p) {
      p.setup = function() {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        const gl = p._renderer.GL;
    
        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertSrc);
        gl.compileShader(vertShader);
        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
          console.error("Vertex Shader Compilation Error: ", gl.getShaderInfoLog(vertShader));
        }
    
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragSrc);
        gl.compileShader(fragShader);
        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
          console.error("Fragment Shader Compilation Error: ", gl.getShaderInfoLog(fragShader));
        }
    
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          console.error("Shader Program Linking Error: ", gl.getProgramInfoLog(shaderProgram));
        }
    
        p.shNeon = p.createShader(vertSrc, fragSrc);
        p.shader(p.shNeon);
        
        p.pixelDensity(1);
        p.frameRate(60);
      }
    
      p.draw = function() {
        p.background(0, 0, 8);
        p.shNeon.setUniform("iTime", p.millis() / 1000*movingSpeed);
        p.shNeon.setUniform("iResolution", [p.width * p.displayDensity(), p.height * p.displayDensity()]);
        p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
      }

      p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    }
    })();
    