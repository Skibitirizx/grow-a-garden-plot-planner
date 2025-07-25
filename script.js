const plantData = [
  "Spiked Mango", "Burning Bud", "Cacao", "Avocado",
  "Sweet Root", "Solarmelon", "Wiggly Leaf", "Glow Bulb", "Frost Bloom"
];

const canvas = document.getElementById("plotCanvas");
const ctx = canvas.getContext("2d");
const plantListDiv = document.getElementById("plantList");

let backgroundImage = null;
let plotBoxes = [];

window.onload = () => {
  const img = new Image();
  img.src = 'garden-layout.png';
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    backgroundImage = img;

    detectPlots(); // Find plot areas automatically
  };
};

// Build sidebar input list
plantData.forEach(plant => {
  const div = document.createElement("div");
  div.className = "plant-item";

  const input = document.createElement("input");
  input.type = "number";
  input.min = 0;
  input.value = 0;
  input.dataset.name = plant;

  const label = document.createElement("label");
  label.textContent = plant;

  div.appendChild(input);
  div.appendChild(label);
  plantListDiv.appendChild(div);
});

// Basic soil plot detection (brown areas)
function detectPlots() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const visited = new Set();

  for (let y = 0; y < canvas.height; y += 5) {
    for (let x = 0; x < canvas.width; x += 5) {
      const index = (y * canvas.width + x) * 4;
      const r = data[index], g = data[index + 1], b = data[index + 2];

      const isBrown = r > 100 && r < 180 && g > 60 && g < 130 && b < 80;
      const key = `${x},${y}`;
      if (isBrown && !visited.has(key)) {
        const box = floodFill(data, x, y, canvas.width, canvas.height, visited);
        if (box.width > 50 && box.height > 30) {
          plotBoxes.push(box);
        }
      }
    }
  }
}

// Flood-fill plot region to get bounding box
function floodFill(data, startX, startY, width, height, visited) {
  const stack = [{ x: startX, y: startY }];
  let minX = startX, minY = startY, maxX = startX, maxY = startY;

  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const key = `${x},${y}`;
    if (visited.has(key) || x < 0 || y < 0 || x >= width || y >= height) continue;
    visited.add(key);

    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];

    const isBrown = r > 100 && r < 180 && g > 60 && g < 130 && b < 80;
    if (!isBrown) continue;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Distribute plant labels
function generateLayout() {
  if (!backgroundImage) {
    alert("Background image not loaded.");
    return;
  }

  ctx.drawImage(backgroundImage, 0, 0);

  const inputs = document.querySelectorAll(".plant-item input");
  const seeds = [];

  inputs.forEach(input => {
    const count = parseInt(input.value);
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        seeds.push(input.dataset.name);
      }
    }
  });

  if (plotBoxes.length === 0) {
    alert("No plot areas found.");
    return;
  }

  let seedIndex = 0;
  for (const plot of plotBoxes) {
    const maxSeedsInPlot = Math.floor(plot.width * plot.height / 2500); // Density control
    for (let i = 0; i < maxSeedsInPlot && seedIndex < seeds.length; i++) {
      const plant = seeds[seedIndex++];
      const randX = plot.x + 20 + Math.random() * (plot.width - 40);
      const randY = plot.y + 20 + Math.random() * (plot.height - 40);

      ctx.fillStyle = "rgba(0, 100, 0, 0.75)";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(plant, randX, randY);
    }
    if (seedIndex >= seeds.length) break;
  }
}
