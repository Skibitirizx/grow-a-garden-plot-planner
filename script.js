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
const plantListDiv = document.getElementById("plantList");

let plotBoxes = [];

const bgImage = new Image();
bgImage.src = "garden-layout.png"; // Replace with your file if needed
bgImage.onload = () => {
  canvas.width = bgImage.width;
  canvas.height = bgImage.height;
  ctx.drawImage(bgImage, 0, 0);

  const boxWidth = 150;
  const boxHeight = 130;
  const startX = 185;
  const startY = 60;
  const xGap = 265;
  const yGap = 180;

  plotBoxes = [];
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 5; row++) {
      const x = startX + col * xGap;
      const y = startY + row * yGap;
      plotBoxes.push({ x, y, width: boxWidth, height: boxHeight });
    }
  }
};

darkToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const items = plantListDiv.querySelectorAll(".plant-item");

  items.forEach(item => {
    const label = item.querySelector("label").textContent.toLowerCase();
    item.style.display = label.includes(query) ? "flex" : "none";
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

function generateLayout() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0);

  const inputs = document.querySelectorAll(".plant-item input[type='number']");
  const plantsToPlace = [];

  for (let input of inputs) {
    const qty = parseInt(input.value);
    if (!isNaN(qty) && qty > 0) {
      plantsToPlace.push({ name: input.dataset.plant, quantity: qty });
    }
  }

  let boxIndex = 0;

  for (let plant of plantsToPlace) {
    const total = plant.quantity;

    let placed = 0;
    while (placed < total && boxIndex < plotBoxes.length) {
      const box = plotBoxes[boxIndex];
      const cols = Math.ceil(Math.sqrt(total));
      const rows = Math.ceil(total / cols);
      const spacingX = box.width / (cols + 1);
      const spacingY = box.height / (rows + 1);

      for (let row = 1; row <= rows && placed < total; row++) {
        for (let col = 1; col <= cols && placed < total; col++) {
          const x = box.x + spacingX * col;
          const y = box.y + spacingY * row;

          ctx.fillStyle = "rgba(80, 172, 84, 0.85)";
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#337733";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(plant.name, x, y + 4);

          placed++;
        }
      }

      boxIndex++;
    }
  }
}

populatePlantList();
