(function () {
  // Canvas Setup
  const canvas2 = document.getElementById("lensCanvas2");
  const ctx2 = canvas2.getContext("2d");

  // Constants
  const WIDTH = 1000;
  const HEIGHT = 1000;
  const FOV = 200;
  const STEPS = 300;
  const MAX_FADE_FRAMES = 60;
  const FRAMERATE = 20;

  // Lens Parameters (Randomized)
  let thetaE = Math.floor(5 + Math.random() * 20);
  let sigma = Math.floor(1 + Math.random() * 1);
  let amp = Math.floor(1 + Math.random() * 4);

  // Animation State
  let xStart, yStart, xEnd, yEnd;
  let t = 0;
  let fadeFrames = 0;
  let mode = "fade-in"; // "fade-in", "run", "fade"

  // Coordinate Grid
  const xGrid = new Array(WIDTH);
  const yGrid = new Array(HEIGHT);
  for (let i = 0; i < WIDTH; i++) xGrid[i] = (i - WIDTH / 2) * (FOV / WIDTH);
  for (let j = 0; j < HEIGHT; j++) yGrid[j] = (j - HEIGHT / 2) * (FOV / HEIGHT);

  // Image Data
  let imageData = ctx2.createImageData(WIDTH, HEIGHT);
  let pixels = imageData.data;

  function computeFrame() {
    ctx2.fillStyle = "black";
    ctx2.fillRect((canvas2.width - WIDTH) / 2, (canvas2.height - HEIGHT) / 2, WIDTH, HEIGHT);

    if (mode !== "fade") pixels.fill(0);

    const x0 = xStart + (xEnd - xStart) * (t / STEPS);
    const y0 = yStart + (yEnd - yStart) * (t / STEPS);
    t++;

    if (mode === "fade-in" || mode === "run") {
      for (let j = 0; j < HEIGHT; j++) {
        for (let i = 0; i < WIDTH; i++) {
          const x = xGrid[i];
          const y = yGrid[j];
          const r2 = x * x + y * y + 1e-9;

          const xSrc = x - (thetaE ** 2) * x / r2;
          const ySrc = y - (thetaE ** 2) * y / r2;

          let intensity = amp * Math.exp(-((xSrc - x0) ** 2 + (ySrc - y0) ** 2) / (2 * sigma ** 2));
          if (mode === "fade-in") intensity *= (fadeFrames / MAX_FADE_FRAMES);

          const color = Math.min(255, Math.floor(intensity * 255));
          if (color < 1) continue;

          let r = 0, g = 0, b = 0;
          if (color < 85) {
            r = color * 3;
            g = color * 1.5;
          } else if (color < 170) {
            r = 255;
            g = (color - 85) * 3;
          } else {
            r = 255;
            g = 255;
            b = (color - 170) * 3;
          }

          const index = 4 * (j * WIDTH + i);
          pixels[index] = r;
          pixels[index + 1] = g;
          pixels[index + 2] = b;
          pixels[index + 3] = 255;
        }
      }

      ctx2.putImageData(imageData, (canvas2.width - WIDTH) / 2, (canvas2.height - HEIGHT) / 2);
    }

    // Mode transitions
    if (mode === "fade-in" && ++fadeFrames >= MAX_FADE_FRAMES) {
      mode = "run";
    }

    if (mode === "run" && t > STEPS) {
      mode = "fade";
      fadeFrames = 0;
    }

    if (mode === "fade") {
      ctx2.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx2.fillRect((canvas2.width - WIDTH) / 2, (canvas2.height - HEIGHT) / 2, WIDTH, HEIGHT);
      if (++fadeFrames >= MAX_FADE_FRAMES) initializeNewPath();
    }

    setTimeout(computeFrame, FRAMERATE);
  }

  function initializeNewPath() {
    const angle = (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * (Math.PI / 3);
    const radius = 120;
    const spread = 20;

    xStart = radius * Math.cos(angle);
    yStart = radius * Math.sin(angle);
    xEnd = -xStart + (Math.random() - 0.5) * spread;
    yEnd = -yStart + (Math.random() - 0.5) * spread;

    t = 0;
    fadeFrames = 0;
    mode = "fade-in";

    thetaE = Math.floor(10 + Math.random() * 20);
    sigma = Math.floor(1 + Math.random() * 3);
    amp = Math.floor(1 + Math.random() * 4);
  }

  // Start the animation
  setTimeout(() => {
  initializeNewPath();
  computeFrame();
}, 1000);
})();
