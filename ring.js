const canvas = document.getElementById('lensCanvas');
const ctx = canvas.getContext('2d');

const N = 1000;
const fov = 100;
let theta_E = Math.floor(10 + Math.random() * 20);
let sigma = Math.floor(1 + Math.random() * 2); // 1 to 5 inclusive
let amp = Math.floor(1 + Math.random() * 5);

let x_start, y_start, x_end, y_end;
let t = 0;
const steps = 300;

let mode = "fade-in"; // "fade-in", "run", "fade"
let fadeFrames = 0;
const maxFadeFrames = 30;
const framerate = 20;

// Coordinate grid
const x_vals = new Array(N);
const y_vals = new Array(N);
for (let i = 0; i < N; i++) {
  x_vals[i] = (i - N / 2) * (fov / N);
  y_vals[i] = (i - N / 2) * (fov / N);
}

let imageData = ctx.createImageData(N, N);
let pixels = imageData.data;

function computeFrame() {
  // Clear both canvas and pixel buffer
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (mode !== "fade") {
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = 0;
    }
  }
  

  const x0 = x_start + (x_end - x_start) * (t / steps);
  const y0 = y_start + (y_end - y_start) * (t / steps);
  t++;

  if (mode === "fade-in" || mode === "run") {
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = x_vals[i];
        const y = y_vals[j];
        const r2 = x * x + y * y + 1e-9;
        const x_src = x - (theta_E ** 2) * x / r2;
        const y_src = y - (theta_E ** 2) * y / r2;

        const intensity = amp * Math.exp(
          -((x_src - x0) ** 2 + (y_src - y0) ** 2) / (2 * sigma ** 2)
        );

        let adjustedIntensity = intensity;
        if (mode === "fade-in") {
          adjustedIntensity *= (fadeFrames / maxFadeFrames);
        }

        const color = Math.min(255, Math.floor(adjustedIntensity * 255));
        if (color < 1) continue;

        let r, g, b;
        if (color < 85) {
          r = color * 3;
          g = color * 1.5;
          b = 0;
        } else if (color < 170) {
          r = 255;
          g = (color - 85) * 3;
          b = 0;
        } else {
          r = 255;
          g = 255;
          b = (color - 170) * 3;
        }

        const index = 4 * (j * N + i);
        pixels[index] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Handle transitions
  if (mode === "fade-in") {
    fadeFrames++;
    if (fadeFrames >= maxFadeFrames) {
      mode = "run";
    }
  }

  if (mode === "run" && t > steps) {
    mode = "fade";
    fadeFrames = 0;
  }

  if (mode === "fade") {
    // Only draw a fading overlay — don't touch imageData
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; // Adjust opacity to control fade speed
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fadeFrames++;
    if (fadeFrames >= maxFadeFrames) {
      setNewPath();
    }
  }
  setTimeout(computeFrame, framerate);
}

function setNewPath() {
  let theta;
  if (Math.random() < 0.5) {
    // Right side arc: −π/4 to +π/4
    theta = (Math.random() - 0.5) * (Math.PI / 3);
  } else {
    // Left side arc: 3π/4 to 5π/4 => π ± π/4
    theta = Math.PI + (Math.random() - 0.5) * (Math.PI / 3);
  }

  const radius = 200;

  x_start = radius * Math.cos(theta);
  y_start = radius * Math.sin(theta);

  const spread = 20; // how far the end point can vary
  x_end = -x_start + (Math.random() - 0.5) * spread;
  y_end = -y_start + (Math.random() - 0.5) * spread;
  
  t = 0;
  fadeFrames = 0;
  mode = "fade-in";
  theta_E = Math.floor(10 + Math.random() * 20);
  sigma = Math.floor(1 + Math.random() * 2); // 1 to 5 inclusive
  amp = Math.floor(1 + Math.random() * 5);
}

setNewPath();
computeFrame();
