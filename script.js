const plantData = [
  "Bone Blossom", "Candy Blossom", "Maple Apple", "Spiked Mango", "Moon Mango", "Dragon Pepper", "Fossilight Fruit", "Elephant Ears", "Sugar Apple", "Giant Pinecone", "Traveler's Fruit", 
  "Moon Blossom", "Hive Fruit", "Beanstalk", "Lily of the Valley", "Lilac", "Nectarine", "Serenity", "Guanabana", "Rosy Delight", "Grand Volcania", "Parasol Flower", "Amber Spine", "Sunflower",
  "Nectar Thorn", "Bendboo", "Mushroom", "Boneboo", "Burning Bud", "Lingonberry", "Zen Rocks", "Cocovine", "Soft Sunshine", "Firefly Fern", "Taro Flower", "Paradise Petal",
  "Honeysuckle", "Lumira", "Venus Fly Trap", "Mango", "Hinomai", "Candy Sunflower", "Celestiberry", "Suncoil", "Feijoa", "Purple Dahlia", "Moon Melon", "Aloe Vera",
  "Horned Dinoshroom", "Ember Lily", "Pink Lily", "Prickly Pear", "Starfruit", "Violet Corn", "Nectarshade", "Dandelion", "Red Lollipop", "Rose", "Cacao", "Loquat",
  "Pear", "Grape", "Eggplant", "Lotus", "Stonebite", "Cantaloupe", "Pepper", "Pitcher Plant", "Crocus", "Horsetail", "Moonflower", "Cursed Fruit",
  "Moonglow", "Manuka Flower", "Lavender", "Wild Carrot", "Succulent", "Blood Banana", "Delphinium", "Peace Lily", "Durian", "Monoblooma", "Zenflare", "Foxglove",
  "Kiwi", "Bee Balm", "Bell Pepper", "Soul Fruit", "Dragon Fruit", "Cranberry", "Coconut", "Chocolate Carrot", "Passionfruit", "Cactus", "Easter Egg", "Banana",
  "Mint", "Bamboo", "Rafflesia", "Nightshade", "Cherry Blossom", "Pumpkin", "Watermelon", "Glowshroom", "Papaya", "Apple", "Lemon", "Avocado",
  "Pineapple", "Green Apple", "Peach", "Daffodil", "Raspberry", "Orange Tulip", "Blueberry", "Tomato", "Strawberry", "Corn", "Cauliflower", "Carrot"
];


const canvas = document.getElementById("plotCanvas");
const ctx = canvas.getContext("2d");
const plantListDiv = document.getElementById("plantList");
let backgroundImage = null;
let plotBoxes = [];
let imageData = null;
const borderSet = new Set();

window.onload = () => {
  const img = new Image();
  img.src = 'garden-layout.png';
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    backgroundImage = img;
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    detectBorders();
    detectPlots();
  };
};

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

const searchInput = document.querySelector('.sidebar input[type="text"]');
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const items = document.querySelectorAll('.plant-item');

  items.forEach(item => {
    const label = item.querySelector('label').textContent.toLowerCase();
    item.style.display = label.includes(query) ? 'flex' : 'none';
  });
});

function isPlotColor(r, g, b) {
  return (r > 130 && r < 190 && g > 100 && g < 150 && b < 90);
}

function isBorderColor(r, g, b) {
  const darkBrown = (r < 100 && g < 80 && b < 60);
  const green = (g > 120 && r < 100 && b < 100);
  return darkBrown || green;
}

function detectBorders() {
  borderSet.clear();
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = imageData.data[idx], g = imageData.data[idx + 1], b = imageData.data[idx + 2];
      if (isBorderColor(r, g, b)) {
        borderSet.add(${x},${y});
      }
    }
  }
}

function detectPlots() {
  plotBoxes = [];
  const visited = new Set();

  for (let y = 0; y < canvas.height; y += 5) {
    for (let x = 0; x < canvas.width; x += 5) {
      const idx = (y * canvas.width + x) * 4;
      const r = imageData.data[idx], g = imageData.data[idx + 1], b = imageData.data[idx + 2];

      if (isPlotColor(r, g, b) && !borderSet.has(${x},${y})) {
        const key = ${x},${y};
        if (!visited.has(key)) {
          const box = floodFill(x, y, visited);
          if (box.width > 50 && box.height > 30) {
            plotBoxes.push(box);
          }
        }
      }
    }
  }

  plotBoxes.sort((a, b) => (b.width * b.height) - (a.width * a.height));
}

function floodFill(startX, startY, visited) {
  const stack = [{ x: startX, y: startY }];
  let minX = startX, minY = startY, maxX = startX, maxY = startY;

  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const key = ${x},${y};
    if (visited.has(key) || x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
    visited.add(key);

    const idx = (y * canvas.width + x) * 4;
    const r = imageData.data[idx], g = imageData.data[idx + 1], b = imageData.data[idx + 2];

    if (!isPlotColor(r, g, b) || borderSet.has(key)) continue;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  // Larger padding to avoid borders better
  const padding = 25;

  return {
    x: minX + padding,
    y: minY + padding,
    width: Math.max(0, (maxX - minX) - 2 * padding),
    height: Math.max(0, (maxY - minY) - 2 * padding)
  };
}

function checkSurroundingBorder(x, y, radius = 10) {
  // Checks pixels in a radius around (x,y) for border pixels.
  const startX = Math.max(0, Math.floor(x - radius));
  const endX = Math.min(canvas.width - 1, Math.floor(x + radius));
  const startY = Math.max(0, Math.floor(y - radius));
  const endY = Math.min(canvas.height - 1, Math.floor(y + radius));

  for (let yy = startY; yy <= endY; yy++) {
    for (let xx = startX; xx <= endX; xx++) {
      if (borderSet.has(${xx},${yy})) {
        return true;
      }
    }
  }
  return false;
}

function generateLayout() {
  if (!backgroundImage) {
    alert("Image not loaded yet.");
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0);

  const inputs = document.querySelectorAll(".plant-item input");
  const seedQueue = [];

  inputs.forEach(input => {
    const count = parseInt(input.value);
    const name = input.dataset.name;
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        seedQueue.push(name);
      }
    }
  });

  let plotIndex = 0;
  let seedIndex = 0;

  while (seedIndex < seedQueue.length && plotIndex < plotBoxes.length) {
    const plot = plotBoxes[plotIndex];
    const centerX = plot.x + plot.width / 2;
    const centerY = plot.y + plot.height / 2;

    const maxSeeds = Math.floor((plot.width * plot.height) / 700);
    const seedsInPlot = Math.min(maxSeeds, seedQueue.length - seedIndex);

    const angleStep = (Math.PI * 2) / seedsInPlot;
    const radius = Math.min(plot.width, plot.height) / 2 - 30; // More padding!

    for (let i = 0; i < seedsInPlot; i++) {
      let angle = i * angleStep + Math.random() * 0.3;
      let dist = radius * (Math.random() * 0.4 + 0.6);

      let x = centerX + dist * Math.cos(angle);
      let y = centerY + dist * Math.sin(angle);

      // Clamp inside plot bounds with big margin
      x = Math.max(plot.x + 30, Math.min(x, plot.x + plot.width - 30));
      y = Math.max(plot.y + 30, Math.min(y, plot.y + plot.height - 30));

      // Skip position if near border pixels
      if (checkSurroundingBorder(x, y, 12)) {
        // Try to find alternative nearby position
        let foundSpot = false;
        const attempts = 25;
        for (let attempt = 0; attempt < attempts; attempt++) {
          let newX = x + (Math.random() - 0.5) * 40;
          let newY = y + (Math.random() - 0.5) * 40;
          newX = Math.max(plot.x + 30, Math.min(newX, plot.x + plot.width - 30));
          newY = Math.max(plot.y + 30, Math.min(newY, plot.y + plot.height - 30));
          if (!checkSurroundingBorder(newX, newY, 12)) {
            x = newX;
            y = newY;
            foundSpot = true;
            break;
          }
        }
        if (!foundSpot) {
          continue; // Skip this seed placement
        }
      }

      const name = seedQueue[seedIndex];
      ctx.fillStyle = "rgba(0, 100, 0, 0.8)";
      ctx.font = "11px Arial";
      ctx.textAlign = "center";
      ctx.fillText(name, x, y);

      seedIndex++;
    }
    plotIndex++;
  }

  if (seedIndex < seedQueue.length) {
    alert("Not enough space to place all seeds!");
  }
}

// Dark mode toggle
const toggleBtn = document.querySelector('.dark-toggle');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀ Light Mode' : '🌙 Dark Mode';
});
