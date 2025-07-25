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

const targetHex = "#ab6b3f"; // allowed hex color for seeds placement
let allowedPositions = []; // to store x,y of allowed pixels

// Convert hex to RGB object for comparison
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#",""), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}
const targetRgb = hexToRgb(targetHex);

// Check if two colors are equal within a tolerance (to allow slight differences)
function colorMatch(r1,g1,b1, r2,g2,b2, tolerance=10) {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

// Set canvas size and background, then scan pixels for allowed seed spots
const bgImage = new Image();
bgImage.src = "garden-layout.png";
bgImage.onload = () => {
  canvas.width = bgImage.width;
  canvas.height = bgImage.height;
  ctx.drawImage(bgImage, 0, 0);

  // Scan image data for allowed hex color pixels
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  allowedPositions = [];
  for(let y=0; y<canvas.height; y++) {
    for(let x=0; x<canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      if(colorMatch(r,g,b, targetRgb.r, targetRgb.g, targetRgb.b)) {
        allowedPositions.push({x, y});
      }
    }
  }
};

// Dark mode toggle
darkToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

// Live search
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

// Populate plant list with quantity inputs
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

// Generate layout with seed placement ONLY on allowed positions (#ab6b3f)
function generateLayout() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0);

  const inputs = document.querySelectorAll(".plant-item input[type='number']");
  let count = 0;

  // Make a copy of allowedPositions so we can remove used spots
  let availablePositions = allowedPositions.slice();

  for (let input of inputs) {
    const quantity = parseInt(input.value);
    if (isNaN(quantity) || quantity <= 0) continue;

    for (let i = 0; i < quantity; i++) {
      if (availablePositions.length === 0) {
        console.warn("No more allowed positions available to place seeds.");
        return; // no more space
      }

      // Pick random position from availablePositions
      const posIndex = Math.floor(Math.random() * availablePositions.length);
      const pos = availablePositions[posIndex];

      // Remove that position so it can't be used again
      availablePositions.splice(posIndex, 1);

      // Draw seed circle
      ctx.fillStyle = "rgba(80, 172, 84, 0.85)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw plant short label
      ctx.fillStyle = "black";
      ctx.font = "12px sans-serif";
      ctx.fillText(input.dataset.plant.slice(0, 3), pos.x - 10, pos.y - 12);

      count++;
    }
  }
}

populatePlantList();
