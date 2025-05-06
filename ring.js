(function () {
const canvas = document.getElementById("lensCanvas");
const ctx = canvas.getContext("2d");

const N = 1000; // width in pixels
const M = 1000; // height in pixels
const fov = 200;

let theta_E = Math.floor(5 + Math.random() * 20);
let sigma = Math.floor(1 + Math.random() * 1);
let amp = Math.floor(1 + Math.random() * 4);

let x_start, y_start, x_end, y_end;
let t = 0;
const steps = 300;

let mode = "fade-in"; // "fade-in", "run", "fade"
let fadeFrames = 0;
const maxFadeFrames = 60;
const framerate = 20;

// Coordinate grid
const x_vals = new Array(N);
const y_vals = new Array(M);
for (let i = 0; i < N; i++) {
  x_vals[i] = (i - N / 2) * (fov / N);
}
for (let j = 0; j < M; j++) {
  y_vals[j] = (j - M / 2) * (fov / M);
}

let imageData = ctx.createImageData(N, M);
let pixels = imageData.data;

function computeFrame() {
  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(
    Math.floor(canvas.width / 2 - N / 2),
    Math.floor(canvas.height / 2 - M / 2),
    N,
    M
  );
  

  if (mode !== "fade") {
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = 0;
    }
  }

  const x0 = x_start + (x_end - x_start) * (t / steps);
  const y0 = y_start + (y_end - y_start) * (t / steps);
  t++;

  if (mode === "fade-in" || mode === "run") {
    for (let j = 0; j < M; j++) {
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

    ctx.putImageData(
      imageData,
      Math.floor(canvas.width / 2 - N / 2),
      Math.floor(canvas.height / 2 - M / 2)
    );
    
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
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(
      canvas.width / 2 - N / 2,
      canvas.height / 2 - M / 2,
      N,
      M
    );

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
    theta = (Math.random() - 0.5) * (Math.PI / 3);
  } else {
    theta = Math.PI + (Math.random() - 0.5) * (Math.PI / 3);
  }

  const radius = 120;

  x_start = radius * Math.cos(theta);
  y_start = radius * Math.sin(theta);

  const spread = 20;
  x_end = -x_start + (Math.random() - 0.5) * spread;
  y_end = -y_start + (Math.random() - 0.5) * spread;

  t = 0;
  fadeFrames = 0;
  mode = "fade-in";
  theta_E = Math.floor(10 + Math.random() * 20);
  sigma = Math.floor(1 + Math.random() * 1);
  amp = Math.floor(1 + Math.random() * 4);
}

setNewPath();
computeFrame();

})();