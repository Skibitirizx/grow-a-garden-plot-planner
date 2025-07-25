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
const plantGrid = document.getElementById("plantGrid");
const plantListDiv = document.getElementById("plantList");

const bgImage = new Image();
bgImage.src = "garden-layout.png";
bgImage.onload = () => {
  canvas.width = bgImage.width;
  canvas.height = bgImage.height;
  ctx.drawImage(bgImage, 0, 0);
};

darkToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

// Display filter-style plant selection (not floating suggestions)
function updatePlantGrid(query = "") {
  plantGrid.innerHTML = "";
  const filtered = plantData.filter(p => p.toLowerCase().includes(query.toLowerCase()));

  filtered.forEach(plant => {
    const plantDiv = document.createElement("div");
    plantDiv.className = "plant-grid-item";
    plantDiv.textContent = plant;
    plantDiv.onclick = () => {
      searchInput.value = plant;
    };
    plantGrid.appendChild(plantDiv);
  });
}

searchInput.addEventListener("input", () => {
  updatePlantGrid(searchInput.value);
});

// Initial grid render
updatePlantGrid();

// Quantity inputs for AI layout logic
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

function generateLayout() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0);

  const inputs = document.querySelectorAll(".plant-item input[type='number']");
  let count = 0;

  for (let input of inputs) {
    const quantity = parseInt(input.value);
    if (isNaN(quantity) || quantity <= 0) continue;

    for (let i = 0; i < quantity; i++) {
      const x = 50 + (count * 60) % (canvas.width - 100);
      const y = 100 + Math.floor(count * 60 / (canvas.width - 100)) * 50;

      ctx.fillStyle = "rgba(80, 172, 84, 0.85)";
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.font = "12px sans-serif";
      ctx.fillText(input.dataset.plant.slice(0, 3), x - 10, y - 12);
      count++;
    }
  }
}

populatePlantList();
