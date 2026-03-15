const featuredProducts = [
  { name: "Hanna Zeka", price: "4.900 RSD" },
  { name: "Luna Meda", price: "5.400 RSD" },
  { name: "Mila Labud", price: "5.100 RSD" },
  { name: "Noa Slonce", price: "5.900 RSD" },
];

const collections = [
  {
    title: "Decija kolekcija",
    text: "Nezni tonovi, bezvremenski oblici i rucno radjeni detalji koji unose toplinu u decije sobe.",
  },
  {
    title: "Pokloni za uspomenu",
    text: "Pazljivo pravljeni rucni komadi koji deluju licno, emotivno i posebno.",
  },
  {
    title: "Sezonski favoriti",
    text: "Topla kolekcija osmisljena za posebne trenutke, proslave i poklone koji se pamte.",
  },
];

function createPlaceholder(label, tall = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `placeholder ${tall ? "tall" : ""}`.trim();
  wrapper.innerHTML = `
    <div class="placeholder-inner">
      <div class="placeholder-badge"></div>
      <p class="placeholder-label">${label}</p>
    </div>
  `;
  return wrapper;
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  featuredProducts.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-meta">
        <h3 class="product-title">${item.name}</h3>
        <p class="price">${item.price}</p>
      </div>
    `;

    card.prepend(createPlaceholder("Fotografija proizvoda"));
    grid.appendChild(card);
  });
}

function renderCollections() {
  const grid = document.getElementById("collectionsGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  collections.forEach((item) => {
    const card = document.createElement("article");
    card.className = "collection-card";
    card.innerHTML = `
      <h3 class="collection-title">${item.title}</h3>
      <p>${item.text}</p>
      <a class="text-link" href="#">Pogledaj kolekciju &rarr;</a>
    `;

    card.prepend(createPlaceholder("Fotografija kolekcije"));
    grid.appendChild(card);
  });
}

function setupMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (!menuToggle || !navMenu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navMenu.classList.remove("open"));
  });
}

function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  const emailInput = document.getElementById("newsletterEmail");

  if (!form || !emailInput) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
      return;
    }

    alert(`Hvala na prijavi, ${email}!`);
    form.reset();
  });
}

function init() {
  renderProducts();
  renderCollections();
  setupMenu();
  setupNewsletter();
}

init();
