let particles = [];
let particlesCount = 4000;
let noiseScale = 800;
let noiseStrength;
let biasAngle;
let pAlpha = 30;
let strokeWidth = 0.3;
let img;

function preload() {
  img = loadImage("w2.png"); // 正确方式加载图片
}

function setup() {
  createCanvas(640, 800);
  pixelDensity(2);
  background("#000000");

  noiseStrength = TWO_PI;      // ✅ 在 setup() 中使用
  biasAngle = PI / 2;

  img.loadPixels();

  for (let i = 0; i < particlesCount; i++) {
    particles[i] = new Particle();
  }
}

function draw() {
  // 尾迹效果：半透明覆盖
  noStroke();
  fill("#415a77" + "10");  // hex alpha "10" ~ 6% 不透明
  rect(0, 0, width, height);

  for (let p of particles) {
    p.run();
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE) background("#415a77");
  if (key === ' ') noiseSeed(floor(random(10000)));
}

// -------------------------------------------------------

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.posOld = this.pos.copy();
    this.baseSpeed = random(0.1, 2);
  }

  update() {
  let x = constrain(floor(this.pos.x), 0, width - 1);
  let y = constrain(floor(this.pos.y), 0, height - 1);
  let col = img.get(x, y);
  let b = brightness(col);

  let angle = noise(this.pos.x / noiseScale, this.pos.y / noiseScale) * noiseStrength;
  angle = lerp(angle, biasAngle, 0.5); // 偏向左上

  // ✨ 滞留 + 减速机制 ✨
  let brightnessFactor = map(b, 0, 100, 0.1, 0.5);  // 原始速度因子

  // linger: 黑色区域更强缩放 + 概率卡住
  if (b < 15) {
    if (random() < 0.5) {
      brightnessFactor *= 0.05; // 极限减速
    } else {
      brightnessFactor *= 0.2; // 保持移动但缓慢
    }
  }

  let step = this.baseSpeed * brightnessFactor;

  this.pos.x += cos(angle) * step;
  this.pos.y += sin(angle) * step;

  // 边界处理
  if (this.pos.x < -10 || this.pos.x > width + 10 || this.pos.y < -10 || this.pos.y > height + 10) {
    this.pos.set(random(width), random(height));
    this.posOld.set(this.pos);
  }

  this.angle = angle;
  this.step = step;
}

  draw() {
    stroke("#ffffff");
    strokeWeight(0.3 * this.step);
    line(this.posOld.x, this.posOld.y, this.pos.x, this.pos.y);
    this.posOld.set(this.pos);
  }

  run() {
    this.update();
    this.draw();
  }
}

