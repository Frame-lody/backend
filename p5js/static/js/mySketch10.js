//藍橘波浪

//ref 3d shader from https://www.openprocessing.org/sketch/881537


(function() {
const vert = `
	precision highp float;

    // attributes, in
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

    // attributes, out
    varying vec3 var_vertPos;
    varying vec3 var_vertNormal;
    varying vec2 var_vertTexCoord;
		varying vec4 var_centerGlPosition;//原點
    
    // matrices
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;
		uniform float u_time;


    void main() {
      vec3 pos = aPosition;
			vec4 posOut = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
      gl_Position = posOut;

      // set out value
      var_vertPos      = pos;
      var_vertNormal   =  aNormal;
      var_vertTexCoord = aTexCoord;
			var_centerGlPosition = uProjectionMatrix * uModelViewMatrix * vec4(0., 0., 0.,1.0);
    }
`;

const frag_functions_default = `
	float rand(vec2 c){
		return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
	}

	mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
	}

	mat2 scale2d(vec2 _scale){
			return mat2(_scale.x,0.0,
									0.0,_scale.y);
	}

	vec2 tile (vec2 _st, float _zoom) {
			_st *= _zoom;
			return fract(_st);
	}

	//	Classic Perlin 3D Noise 
	//	by Stefan Gustavson

	vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
	vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
	vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

	float cnoise(vec3 P){
		vec3 Pi0 = floor(P); // Integer part for indexing
		vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
		Pi0 = mod(Pi0, 289.0);
		Pi1 = mod(Pi1, 289.0);
		vec3 Pf0 = fract(P); // Fractional part for interpolation
		vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
		vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
		vec4 iy = vec4(Pi0.yy, Pi1.yy);
		vec4 iz0 = Pi0.zzzz;
		vec4 iz1 = Pi1.zzzz;

		vec4 ixy = permute(permute(ix) + iy);
		vec4 ixy0 = permute(ixy + iz0);
		vec4 ixy1 = permute(ixy + iz1);

		vec4 gx0 = ixy0 / 7.0;
		vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
		gx0 = fract(gx0);
		vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
		vec4 sz0 = step(gz0, vec4(0.0));
		gx0 -= sz0 * (step(0.0, gx0) - 0.5);
		gy0 -= sz0 * (step(0.0, gy0) - 0.5);

		vec4 gx1 = ixy1 / 7.0;
		vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
		gx1 = fract(gx1);
		vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
		vec4 sz1 = step(gz1, vec4(0.0));
		gx1 -= sz1 * (step(0.0, gx1) - 0.5);
		gy1 -= sz1 * (step(0.0, gy1) - 0.5);

		vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
		vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
		vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
		vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
		vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
		vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
		vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
		vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

		vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
		g000 *= norm0.x;
		g010 *= norm0.y;
		g100 *= norm0.z;
		g110 *= norm0.w;
		vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
		g001 *= norm1.x;
		g011 *= norm1.y;
		g101 *= norm1.z;
		g111 *= norm1.w;

		float n000 = dot(g000, Pf0);
		float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
		float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
		float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
		float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
		float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
		float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
		float n111 = dot(g111, Pf1);

		vec3 fade_xyz = fade(Pf0);
		vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
		vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
		float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
		return 2.2 * n_xyz;
	}

	vec2 random2( vec2 p ) {
			return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
	}

`

const frag = `
	precision highp float;

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;
	uniform vec3 u_lightDir;
	uniform vec3 u_col;
	uniform mat3 uNormalMatrix;
	uniform float u_pixelDensity;
	uniform sampler2D u_tex;

	//attributes, in
	varying vec4 var_centerGlPosition;
	varying vec3 var_vertNormal;
	varying vec2 var_vertTexCoord;

	${frag_functions_default}
	void main(){
		vec2 st = var_vertTexCoord.xy /u_resolution.xy;
		st.x+=cnoise(vec3(st*u_time,5.))/10.;//最後除以5的部分 數值除得越大，變動會越慢
		
		st.y+=cnoise(vec3(st*3000.,5.))/10.;//vec3(st*u_time,5.) st呈上的數字越大，代表每次渲染程度會越高
		
    //st.x+=cnoise(vec3(st*u_time,5.))/5.*u_mouse.x;//糊的程度會隨滑鼠x座標來變化，x越大會越糊
		//st.y+=cnoise(vec3(st*10.,5.))/5.*u_mouse.x;
		
		//vec3 color = vec3(st.x,st.y,1.0);
		
		//vec3 color = vec3(st.x,st.y,1.5);//1.5為控制顏色的色彩
		vec3 color = vec3(st.x,1.1,1.5);
		//vec3 color = vec3(0.);
		vec4 texColor = texture2D(u_tex,st);
		
		float d = distance(u_mouse,st);
    //color*=1.-d;
		color*=0.5-d; //0.5為像是控制顏鮮豔明亮度 越高整體畫面顏色越鮮豔明亮
		gl_FragColor= vec4(color,1.0)+texColor;
	}
`




let theShader;
let webGLCanvas;
let originalGraphics;
let circles = [];
let movingSpeed = 1;

window.sketch = function(p) {

p.preload = function(){
  theShader = new p5.Shader(this.renderer, vert, frag);
}

p.setup = function() {
  p.createCanvas(p.windowWidth, p.windowHeight);
  webGLCanvas = p.createGraphics(p.width, p.height, p.WEBGL);
  originalGraphics = p.createGraphics(p.width, p.height);
  p.noStroke();
  p.background(0);
}

p.draw = function() {

  let body_position = window.hand || window.nose || { x: p.width / 2, y: p.height / 2 };
  // 反轉 x 坐標
  let adjustedX = p.width - 5*body_position.x+400;
  let adjustedY = 1*body_position.y+150;

  webGLCanvas.shader(theShader);
  theShader.setUniform('u_resolution', [p.width / 1000, p.height / 1000]);
  theShader.setUniform('u_time', p.millis() / 1000);
  theShader.setUniform('u_mouse', [adjustedX / p.width, adjustedY / p.height]);
  theShader.setUniform('u_tex', originalGraphics);

  webGLCanvas.clear();
  webGLCanvas.rect(-p.width / 2, -p.height / 2, p.width, p.height);

  // 清除原來的圖形
  originalGraphics.clear();

  originalGraphics.fill(255);
  originalGraphics.noStroke();
  originalGraphics.ellipse(10, 10, 15, 15);
  originalGraphics.textSize(150);

  // Add new circles at random intervals
  if (frameCount % 30 === 0) {
    let newCircle = {
      x: random(width),
      y: 0,
      size: random(10, 30),
      speed: random(1*movingSpeed, 3*movingSpeed)
    };
    circles.push(newCircle);
  }

  // Update and draw circles
  for (let i = circles.length - 1; i >= 0; i--) {
    let circle = circles[i];
    circle.y += circle.speed;

    // Remove circles that fall out of canvas
    if (circle.y - circle.size / 2 > height) {
      circles.splice(i, 1);
    } else {
      // Draw glowing circle
      drawGlowingCircle(originalGraphics, circle.x, circle.y, circle.size);
    }
  }

  p.image(webGLCanvas, 0, 0);

  p.fill(255, 0.5);
}

function drawGlowingCircle(pg, x, y, size) {
  let glowSize = size * 3;
  pg.noStroke();

  for (let i = 0; i < 10; i++) {
    let alpha = map(i, 0, 10, 255, 0);
    pg.fill(255, alpha);
    pg.ellipse(x, y, glowSize - i * (glowSize / 10), glowSize - i * (glowSize / 10));
  }

  pg.fill(255);
  pg.ellipse(x, y, size, size);
}

p.windowResized = function() {
	p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

};
})();