// JavaScript version of the gravitational light beam simulation with interactive slider
// Uses HTML5 Canvas

const canvas = document.getElementById("beamCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true
canvas.width = 1000;
canvas.height = 1000;

// Add slider to control launch angle
document.body.insertAdjacentHTML('beforeend', `
  <div style="position: fixed; bottom: 20px; left: 20px; color: white; font-family: sans-serif;">
    Angle: <input id="angleSlider" type="range" min="-30" max="30" value="30" step="1">
    <span id="angleValue">30</span>°
  </div>
`);

const slider = document.getElementById("angleSlider");
const angleDisplay = document.getElementById("angleValue");

// Simulation parameters
const N = 1000;
const fov = 20;
const theta_E = 4;
const dt = 0.01;
const steps = 4000;

const worldToCanvas = (x, y) => {
  const scale = canvas.width / fov;
  return [
    canvas.width / 2 + x * scale,
    canvas.height / 2 - y * scale,
  ];
};

function drawGaussian(pixels, xc, yc, intensity, size = 0.3) {
  const radius = 5;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = xc + dx;
      const y = yc + dy;
      const d2 = dx * dx + dy * dy;
      const distanceFactor = d2 / (radius * radius);
      const falloff = intensity * Math.exp(-d2 / size * 1.2);

      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;

      const index = 4 * (y * canvas.width + x);

      // White-hot core fading to orange
      const red = 255;
      const green = Math.max(0, 160 - 160 * distanceFactor); // fades outward
      const blue = Math.max(0, 60 - 100 * distanceFactor);

      pixels[index] = Math.min(255, pixels[index] + falloff * red);
      pixels[index + 1] = Math.min(255, pixels[index + 1] + falloff * green);
      pixels[index + 2] = Math.min(255, pixels[index + 2] + falloff * blue);
      pixels[index + 3] = 255; // Alpha
    }
  }
}

function simulateBeam(launchAngleDegrees) {
  const trail = ctx.createImageData(canvas.width, canvas.height);
  const pixels = trail.data;

  let x_ray = -10;
  let y_ray = 0;
  const theta = (launchAngleDegrees * Math.PI) / 180;
  let vx = Math.cos(theta);
  let vy = Math.sin(theta);

  for (let i = 0; i < steps; i++) {
    const r = Math.sqrt(x_ray * x_ray + y_ray * y_ray);
    if (r < 0.3) break;  // Only stop if beam gets too close to the black hole

    const ax = -(theta_E ** 2) * x_ray / Math.pow(r, 3);
    const ay = -(theta_E ** 2) * y_ray / Math.pow(r, 3);

    vx += ax * dt;
    vy += ay * dt;
    x_ray += vx * dt;
    y_ray += vy * dt;

    const [cx, cy] = worldToCanvas(x_ray, y_ray);
    drawGaussian(pixels, Math.floor(cx), Math.floor(cy), 10.0, 5.0);
  }

  ctx.putImageData(trail, 0, 0);
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 17, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "18px Exo 2, sans-serif";
  ctx.fillText(`Gravitational Light Beam — ${launchAngleDegrees}° Launch`, 20, 30);
}

// Auto-sweep settings
let autoAngle = 30;
let autoDirection = -1;

// Render loop: 10 times per second
setInterval(() => {
  const slowdown = Math.cos((autoAngle * Math.PI) / 60); //need to set to interval size (so 180 for -90 to 90)
autoAngle += autoDirection * 0.5 * Math.pow(Math.abs(slowdown), 0.5);
  if (autoAngle <= -30 || autoAngle >= 30) autoDirection *= -1;
  slider.value = autoAngle.toFixed(1);
  const angle = autoAngle;
  angleDisplay.textContent = angle;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  simulateBeam(angle);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
}, 10);
