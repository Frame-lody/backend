//彩色花紋
(function() {
  let urlParams = new URLSearchParams(window.location.search); // 創建一個 URLSearchParams 的物件用來解析查詢字串
  let speed = urlParams.get('speed'); // 使用 get() 方法來獲取指定參數的值
  speed /= 100;
  let changeColors = urlParams.get('colors');
  changeColors = changeColors ? changeColors.split(',') : null;
  console.log("====in Adjust====");
  console.log(speed);
  console.log(changeColors);
  console.log("=================");
// let changeColors = ["#ffffff","#ffffff","#ffffff",] ;//設定顏色
// 將16進位顏色轉換為歸一化的RGB
let normalizedColors = changeColors.map(hex => {
  let r = parseInt(hex.substring(1, 3), 16) / 255; // 解析紅色並除以255
  let g = parseInt(hex.substring(3, 5), 16) / 255; // 解析綠色並除以255
  let b = parseInt(hex.substring(5, 7), 16) / 255; // 解析藍色並除以255
  return `vec3(${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)})`; // 格式化到小數點後兩位
});

const frag = `
// learn from https://www.shadertoy.com/view/7tK3DW

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_frame;
uniform vec2 u_mouse;

#define pi 3.14159

float sdEquilateralTriangle( in vec2 p )
{
    const float k = sqrt(4.0);
    p.x = abs(p.x) - 1.;
    p.y = p.y + 1./k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/4.0;
    p.x -= clamp( p.x, -3.0, 3.0 );
    return -length(p);//*sign(p.y);
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float thc(float a, float b) {
    return sin(a * cos(b)) / sin(a);
}

float ths(float a, float b) {
    return cos(a * sin(b)) / cos(a);
}

float arrow(vec2 uv) {
    float h = 0.25;
    h += 0.5 * thc(4.,-1. * length(uv) + 2. * atan(uv.y,uv.x) + u_time);
    h += 0.5 * (0.5 + 0.5 * thc(3., length(uv)*3. - u_time));
    float d = sdEquilateralTriangle(uv-vec2(0.,0.001 - h));
    float s = 1.-smoothstep(-0.1,0.1,d+0.5);

    float d2 = sdBox(uv - vec2(0.,-h), vec2(0.05,0.2));
    float s2 = 1.-smoothstep(-0.5,0.5,d2);

    s += s2;
    return s;
}

//顏色調整

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*sin( 6.28318*(c*t+d) );
}

float h21 (vec2 a) {
    return fract(sin(dot(a.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rot(vec2 uv, float a) {
    mat2 mat = mat2(cos(a), -sin(a),
                    sin(a), cos(a));
    return mat * uv;
}

void main( )
{
    vec2 uv = (gl_FragCoord.xy-1.0*u_resolution.xy)/u_resolution.y;

    float a = atan(uv.y, uv.x);
    float r = log(length(uv));
    a = 2. *a;
    float l = min(1., atan(0.2 * u_time)/0.95);
    r *= 0.6 + 0.25 * l * thc(1., 3. * a + 2. * length(uv) - u_time);

    float h = 1.+floor(0.25 * fract(0.1 * u_time));
		a = h * a;
    uv = rot(uv, u_time +  2. * a + 6.1415 * sin(3. * r + a - u_time));

    float s = arrow(uv);
     s *= 1. + 0.01 * s;

    //顏色調整 col



    vec3 col = 0.25 * s + s * pal(
    thc(2., s + 2. * r + a - u_time) - 0.5 * u_time,
    ${normalizedColors[0]},   // 替換第一個顏色
    ${normalizedColors[1]},   // 替換第二個顏色
    ${normalizedColors[2]},   // 替換第三個顏色
    cos(s + u_time) * vec3(0., 1., 2.) / 3.
);


    col *= smoothstep(0.,0.1,2.25-length(uv));
    col = mix(col, vec3(1, .93, .92)*2., smoothstep(0., 3.5, -r));
    gl_FragColor = vec4(col,1.0);
}
`

const vert = `
// vert file and comments from adam ferriss
// https://github.com/aferriss/p5jsShaderExamples

// our vertex data
attribute vec3 aPosition;

// our texcoordinates
attribute vec2 aTexCoord;

void main() {

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}
`;

// vec3 col = 0.25 * s + s * pal(thc(2., s + 2. * r + a- u_time)  - 0.5 * u_time, vec3(1.), vec3(1.), vec3(1.), cos(s + u_time) * vec3(0.,1.,2.)/3.);

//     vec3 weights = normalize(vec3(
//     1.0 / length(s - 0.2),
//     1.0 / length(s - 0.5),
//     1.0 / length(s - 0.8)));
//     col = weights.x * ${normalizedColors[0]} +
//       weights.y * ${normalizedColors[1]} +
//       weights.z * ${normalizedColors[2]};

// let speed;
let mySize;
let movingSpeed = speed?speed*1.1:1.1;


// a shader variable
let theShader;
window.sketch = function(p) {

p.preload = function(){
	theShader = new p5.Shader(this.renderer,vert,frag)
}

p.setup = function() {
	mySize = p.min(p.windowWidth, p.windowHeight) * 1.0;
  // shaders require WEBGL mode to work
  // createCanvas(mySize, mySize/16*9, WEBGL);
  p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
  p.noStroke();
}

p.draw = function() {
  // shader() sets the active shader with our shader
  p.shader(theShader);

  theShader.setUniform("u_resolution", [p.width, p.height]);
	theShader.setUniform("u_time", p.millis() / 1000.0 * movingSpeed); //u_time 可用來改變變動速度 ex:millis() / 1000.0*0.5會變慢
  theShader.setUniform("u_frame", p.frameCount/1.0);
  theShader.setUniform("u_mouse", [mouseX/100.0, map(mouseY, 0, p.height, p.height, 0)/100.0]);

  // rect gives us some geometry on the screen
  p.rect(0,0,p.width, p.height);
}

p.windowResized = function(){
  p.resizeCanvas(p.windowWidth, p.windowHeight);
}

}
})();