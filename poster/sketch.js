//in general chatGPT make this code.
//use perlin noise to get flow field and make praticle go throw it
//when the praticle meet the words on the png slow down ang linger longer
let particles = [];
let particlesCount =2000;
let noiseScale = 800;
let noiseStrength;
let biasAngle;
let pAlpha = 30;
let strokeWidth = 0.3;
let img;

function preload() {
  img = loadImage("w2.png"); 
}

function setup() {
  createCanvas(640, 800);
  pixelDensity(2);
  background("#000000");

  noiseStrength = TWO_PI;     // Perlin noise angle range
  biasAngle = PI / 2;         // Bias direction (downwards here)

  img.loadPixels();

  for (let i = 0; i < particlesCount; i++) {
    particles[i] = new Particle();
  }
}

function draw() {
  // Fading trail effect background layer
  noStroke();
  fill("#415a77" + "10"); // "#415a77" + alpha (hex "10" ≈ 6% opacity)
  rect(0, 0, width, height);

  for (let p of particles) {
    p.run();
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE) background("#000000"); // Reset background
  if (key === ' ') noiseSeed(floor(random(10000))); // Refresh noise field
}

// -------------------------------------------------------

class Particle {
  constructor() {
    // Spawn 
    this.pos = createVector(random(width), random(height));
    this.posOld = this.pos.copy();
    this.baseSpeed = random(0.05, 2);
  }

  update() {
    // Get brightness of the underlying image at this position
    let x = constrain(floor(this.pos.x), 0, width - 1);
    let y = constrain(floor(this.pos.y), 0, height - 1);
    let col = img.get(x, y);
    let b = brightness(col);

    // Flow field angle from Perlin noise, mixed with bias direction
    let angle = noise(this.pos.x / noiseScale, this.pos.y / noiseScale) * noiseStrength;
    angle = lerp(angle, biasAngle, 0.5); // Blend 50% with bias direction

    // Base brightness factor (darker = slower)
    let brightnessFactor = map(b, 0, 100, 0.1, 0.5);

    // Linger longer in dark areas (black parts of the image)
    if (b < 15) {
      if (random() < 0.5) {
        brightnessFactor *= 0.03; // Almost stop
      } else {
        brightnessFactor *= 0.01; // Move extremely slowly
      }
    }

    let step = this.baseSpeed * brightnessFactor;

    // Update position
    this.pos.x += cos(angle) * step;
    this.pos.y += sin(angle) * step;

    // Boundary reset:
    if (
      this.pos.x < -10 || this.pos.x > width + 10 ||
      this.pos.y < -10 || this.pos.y > height + 10
    ) {
      this.pos.set(random(width), random(height));
      this.posOld.set(this.pos);
    }

    this.angle = angle;
    this.step = step;
  }

  draw() {
    // Particle trail drawing
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
