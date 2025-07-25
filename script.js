const plantData = [
  "Bone Blossom", "Candy Blossom", "Maple Apple", "Spiked Mango", "Moon Mango",
  "Dragon Pepper", "Fossilight Fruit", "Elephant Ears", "Sugar Apple", "Giant Pinecone",
  "Traveler's Fruit", "Moon Blossom", "Hive Fruit", "Beanstalk", "Lily of the Valley",
  "Lilac", "Nectarine", "Serenity", "Guanabana", "Burning Bud", "Cacao", "Avocado",
  "Sweet Root", "Solarmelon", "Wiggly Leaf", "Glow Bulb", "Frost Bloom"
];

const canvas = document.getElementById("plotCanvas");
const ctx = canvas.getContext("2d");
const darkToggle = document.querySelector(".dark-toggle");
const body = document.body;
const searchInput = document.getElementById("plantSearch");
const suggestionsBox = document.getElementById("suggestions");
const plantListDiv = document.getElementById("plantList");

const allowedHex = "#ab6b3f";
const forbiddenHex = "#7a4427";

let allowedPositions = [];

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#",""), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}
const allowedRgb = hexToRgb(allowedHex);
const forbiddenRgb = hexToRgb(forbiddenHex);

function colorMatch(r1,g1,b1, r2,g2,b2, tolerance=10) {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

function neighborsForbidden(x, y, imageData, width, height, forbiddenRgb, tolerance=10) {
  const data = imageData.data;
  const neighbors = [
    [-1,-1], [0,-1], [1,-1],
    [-1, 0],         [1, 0],
    [-1, 1], [0, 1], [1, 1],
  ];
  for (let [dx, dy] of neighbors) {
    const nx = x + dx;
    const ny = y + dy;
    if(nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const idx = (ny * width + nx) * 4;
    const r = data[idx];
    const g = data[idx+1];
    const b = data[idx+2];
    if(colorMatch(r, g, b, forbiddenRgb.r, forbiddenRgb.g, forbiddenRgb.b, tolerance)) {
      return true;
    }
  }
  return false;
}

const bgImage = new Image();
bgImage.src = "garden-layout.png";
bgImage.onload = () => {
  canvas.width = bgImage.width;
  canvas.height = bgImage.height;
  ctx.drawImage(bgImage, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  allowedPositions = [];
  for(let y=0; y<canvas.height; y++) {
    for(let x=0; x<canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx+1];
      const b = imageData.data[idx+2];

      if(colorMatch(r, g, b, allowedRgb.r, allowedRgb.g, allowedRgb.b)) {
        if(!neighborsForbidden(x, y, imageData, canvas.width, canvas.height, forbiddenRgb)) {
          allowedPositions.push({x, y});
        }
      }
    }
  }
};

darkToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  suggestionsBox.innerHTML = "";

  if (!query) return;

  const matches = plantData.filter(p => p.toLowerCase().includes(query));
  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = match;
    div.onclick = () => {
      searchInput.value = match;
      suggestionsBox.innerHTML = "";
    };
    suggestionsBox.appendChild(div);
  });
});

function populatePlantList() {
  plantListDiv.innerHTML = "";
  plantData.forEach(plant => {
    const wrapper = document.createElement("div");
    wrapper.className = "plant-item";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = "0";
    input.dataset.plant = plant;

    const label = document.createElement("label");
    label.textContent = plant;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    plantListDiv.appendChild(wrapper);
  });
}

// Score a point based on surroundings (open radius, edge proximity)
function scorePosition(pos, others, width, height) {
  let score = 0;

  // Prefer center-ish placements
  const dx = pos.x - width / 2;
  const dy = pos.y - height / 2;
  score -= Math.sqrt(dx*dx + dy*dy) * 0.05;

  // Prefer positions far from other seeds
  for (let o of others) {
    const dist = Math.sqrt((pos.x - o.x)**2 + (pos.y - o.y)**2);
    if (dist < 30) score -= 100; // too close
    else score += dist * 0.1;
  }

  return score;
}

function generateLayout() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0);

  const inputs = document.querySelectorAll(".plant-item input[type='number']");
  let available = allowedPositions.slice();
  let placed = [];

  for (let input of inputs) {
    const qty = parseInt(input.value);
    if (isNaN(qty) || qty <= 0) continue;

    const plant = input.dataset.plant;
    let bestCluster = [];

    // Try 50 different starting positions and pick best scoring cluster
    for (let trial = 0; trial < 50; trial++) {
      const center = available[Math.floor(Math.random() * available.length)];
      const cluster = [];

      for (let p of available) {
        if (cluster.length >= qty) break;
        const dist = Math.hypot(center.x - p.x, center.y - p.y);
        if (dist <= 40) cluster.push(p);
      }

      // Score the entire cluster as a group
      const totalScore = cluster.reduce((sum, pt) => sum + scorePosition(pt, placed, canvas.width, canvas.height), 0);
      if (bestCluster.length === 0 || totalScore > bestCluster.score) {
        bestCluster = cluster.slice();
        bestCluster.score = totalScore;
      }
    }

    for (let pos of bestCluster) {
      ctx.fillStyle = "rgba(80, 172, 84, 0.85)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.font = "12px sans-serif";
      ctx.fillText(plant.slice(0, 3), pos.x - 10, pos.y - 12);

      placed.push(pos);
      available = available.filter(p => p !== pos);
    }
  }
}

populatePlantList();
