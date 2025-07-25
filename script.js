
  { name: "Bone Blossom", image: "images/bone_blossom.png" },
  { name: "Candy Blossom", image: "images/candy_blossom.png" },
  { name: "Maple Apple", image: "images/maple_apple.png" },
  { name: "Spiked Mango", image: "images/spiked_mango.png" },
  { name: "Moon Mango", image: "images/moon_mango.png" },
  { name: "Dragon Pepper", image: "images/dragon_pepper.png" },
  { name: "Fossilight Fruit", image: "images/fossilight_fruit.png" },
  { name: "Elephant Ears", image: "images/elephant_ears.png" },
  { name: "Sugar Apple", image: "images/sugar_apple.png" },
  { name: "Giant Pinecone", image: "images/giant_pinecone.png" },
  { name: "Traveler's Fruit", image: "images/travelers_fruit.png" },
  { name: "Moon Blossom", image: "images/moon_blossom.png" },
  { name: "Hive Fruit", image: "images/hive_fruit.png" },
  { name: "Beanstalk", image: "images/beanstalk.png" },
  { name: "Lily of the Valley", image: "images/lily_valley.png" },
  { name: "Lilac", image: "images/lilac.png" },
  { name: "Nectarine", image: "images/nectarine.png" },
  { name: "Serenity", image: "images/serenity.png" },
  { name: "Guanabana", image: "images/guanabana.png" },
  { name: "Burning Bud", image: "images/burning_bud.png" },
  { name: "Cacao", image: "images/cacao.png" },
  { name: "Avocado", image: "images/avocado.png" },
  { name: "Sweet Root", image: "images/sweet_root.png" },
  { name: "Solarmelon", image: "images/solarmelon.png" },
  { name: "Wiggly Leaf", image: "images/wiggly_leaf.png" },
  { name: "Glow Bulb", image: "images/glow_bulb.png" },
  { name: "Frost Bloom", image: "images/frost_bloom.png" }
];

const canvas = document.getElementById("plotCanvas");
const ctx = canvas.getContext("2d");
const darkToggle = document.querySelector(".dark-toggle");
const body = document.body;
const searchInput = document.getElementById("plantSearch");
const suggestionsBox = document.getElementById("suggestions");
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

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  suggestionsBox.innerHTML = "";

  if (!query) return;

  const matches = plantData.filter(p => p.name.toLowerCase().includes(query));
  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = match.name;
    div.onclick = () => {
      searchInput.value = match.name;
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

    const img = document.createElement("img");
    img.src = plant.image;
    img.alt = plant.name;
    img.className = "plant-icon";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = "0";
    input.dataset.plant = plant.name;

    const label = document.createElement("label");
    label.textContent = plant.name;

    wrapper.appendChild(img);
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
