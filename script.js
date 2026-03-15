const store = window.HannaStore;

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

const CART_STORAGE_KEY = "hanna-artesa-cart";
let cartState = loadCart();
let lightboxScale = 1;
let lightboxTranslateX = 0;
let lightboxTranslateY = 0;
let isLightboxDragging = false;
let lightboxDragStartX = 0;
let lightboxDragStartY = 0;

function getProductsCatalog() {
  return store.getVisibleProducts();
}

function getFeaturedProducts() {
  return getProductsCatalog().slice(0, 4);
}

function formatPrice(value) {
  return `${new Intl.NumberFormat("sr-RS").format(value)} RSD`;
}

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

function createAddToCartButton(product) {
  const button = document.createElement("button");
  button.className = "product-add-btn";
  button.type = "button";
  button.dataset.addToCart = product.id;
  button.setAttribute("aria-label", `Dodaj ${product.name} u korpu`);
  button.innerHTML = `
    <svg viewBox="0 0 24 24" role="presentation" focusable="false">
      <path d="M3 5h2l2.2 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H7.1" />
      <path d="M12 10v4" />
      <path d="M10 12h4" />
      <circle cx="10" cy="19" r="1.7" />
      <circle cx="17" cy="19" r="1.7" />
    </svg>
  `;
  return button;
}

function createProductMedia(product) {
  const wrapper = document.createElement("div");
  wrapper.className = "product-media";
  wrapper.dataset.productId = product.id;

  if (product.image) {
    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.image;
    image.alt = product.name;
    image.dataset.productId = product.id;
    wrapper.appendChild(image);
  } else {
    wrapper.appendChild(createPlaceholder("Fotografija proizvoda"));
  }

  wrapper.appendChild(createAddToCartButton(product));
  return wrapper;
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) {
    return;
  }

  const productsToRender = document.body.classList.contains("shop-page")
    ? getProductsCatalog()
    : getFeaturedProducts();

  grid.innerHTML = "";

  productsToRender.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-meta">
        <h3 class="product-title">${item.name}</h3>
        <p class="price">${formatPrice(item.priceValue)}</p>
      </div>
    `;

    card.prepend(createProductMedia(item));
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
    store.addNewsletterSignup(email);
    store.recordEvent("newsletter_signup", { email });
    form.reset();
  });
}

function createLightbox() {
  if (document.getElementById("photoLightbox")) {
    return;
  }

  const lightbox = document.createElement("div");
  lightbox.className = "photo-lightbox";
  lightbox.id = "photoLightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button class="photo-lightbox-backdrop" data-lightbox-close type="button" aria-label="Zatvori fotografiju"></button>
    <div class="photo-lightbox-panel" role="dialog" aria-modal="true" aria-label="Fotografija proizvoda">
      <button class="photo-lightbox-close" data-lightbox-close type="button" aria-label="Zatvori fotografiju">&times;</button>
      <div class="photo-lightbox-stage" id="photoLightboxStage">
        <img class="photo-lightbox-image" id="photoLightboxImage" alt="">
      </div>
    </div>
  `;

  document.body.appendChild(lightbox);
}

function updateLightboxTransform() {
  const image = document.getElementById("photoLightboxImage");
  const stage = document.getElementById("photoLightboxStage");
  if (!image) {
    return;
  }

  image.style.transform = `translate(${lightboxTranslateX}px, ${lightboxTranslateY}px) scale(${lightboxScale})`;

  if (!stage) {
    return;
  }

  if (lightboxScale > 1) {
    stage.classList.add("is-zoomed");
  } else {
    stage.classList.remove("is-zoomed");
  }
}

function setLightboxOpen(isOpen, imageSrc = "", imageAlt = "") {
  const lightbox = document.getElementById("photoLightbox");
  const image = document.getElementById("photoLightboxImage");
  if (!lightbox || !image) {
    return;
  }

  if (isOpen) {
    lightbox.hidden = false;
    lightbox.classList.add("open");
    document.body.classList.add("lightbox-open");
    lightboxScale = 1;
    lightboxTranslateX = 0;
    lightboxTranslateY = 0;
    isLightboxDragging = false;
    image.src = imageSrc;
    image.alt = imageAlt;
    updateLightboxTransform();
    return;
  }

  lightbox.hidden = true;
  lightbox.classList.remove("open");
  document.body.classList.remove("lightbox-open");
  image.removeAttribute("src");
  image.alt = "";
  lightboxScale = 1;
  lightboxTranslateX = 0;
  lightboxTranslateY = 0;
  isLightboxDragging = false;
}

function setupLightbox() {
  createLightbox();

  const lightbox = document.getElementById("photoLightbox");
  const stage = document.getElementById("photoLightboxStage");
  const image = document.getElementById("photoLightboxImage");
  if (!lightbox || !stage || !image) {
    return;
  }

  document.addEventListener("click", (event) => {
    const image = event.target.closest(".product-image");
    if (image) {
      store.recordEvent("product_click", { productId: image.dataset.productId || "" });
      store.recordEvent("image_open", { productId: image.dataset.productId || "" });
      setLightboxOpen(true, image.currentSrc || image.src, image.alt);
      return;
    }

    const closeTrigger = event.target.closest("[data-lightbox-close]");
    if (closeTrigger) {
      setLightboxOpen(false);
    }
  });

  stage.addEventListener("click", (event) => {
    if (event.target === stage) {
      setLightboxOpen(false);
    }
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      if (lightbox.hidden) {
        return;
      }

      event.preventDefault();
      const previousScale = lightboxScale;
      const delta = event.deltaY < 0 ? 0.16 : -0.16;
      lightboxScale = Math.min(4, Math.max(1, lightboxScale + delta));

      if (lightboxScale < previousScale && previousScale > 1) {
        const recenterRatio = lightboxScale === 1
          ? 0
          : (lightboxScale - 1) / (previousScale - 1);
        lightboxTranslateX *= recenterRatio;
        lightboxTranslateY *= recenterRatio;
      }

      if (lightboxScale === 1) {
        lightboxTranslateX = 0;
        lightboxTranslateY = 0;
      }
      updateLightboxTransform();
    },
    { passive: false },
  );

  image.addEventListener("mousedown", (event) => {
    if (lightbox.hidden || lightboxScale <= 1) {
      return;
    }

    event.preventDefault();
    isLightboxDragging = true;
    lightboxDragStartX = event.clientX - lightboxTranslateX;
    lightboxDragStartY = event.clientY - lightboxTranslateY;
    stage.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (event) => {
    if (!isLightboxDragging) {
      return;
    }

    lightboxTranslateX = event.clientX - lightboxDragStartX;
    lightboxTranslateY = event.clientY - lightboxDragStartY;
    updateLightboxTransform();
  });

  window.addEventListener("mouseup", () => {
    isLightboxDragging = false;
    stage.classList.remove("is-dragging");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setLightboxOpen(false);
    }
  });
}

function loadCart() {
  try {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawCart) {
      return {};
    }

    const parsedCart = JSON.parse(rawCart);
    if (!parsedCart || typeof parsedCart !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedCart).filter(([, quantity]) => Number.isFinite(quantity) && quantity > 0),
    );
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  } catch {
    // Ignore storage failures so the UI still works in-memory.
  }
}

function getProductById(productId) {
  return store.getProducts().find((item) => item.id === productId) || null;
}

function getCartSummary() {
  const items = Object.entries(cartState)
    .map(([productId, quantity]) => {
      const product = getProductById(productId);
      if (!product) {
        return null;
      }

      return {
        ...product,
        quantity,
        lineTotal: product.priceValue * quantity,
      };
    })
    .filter(Boolean);

  return items.reduce(
    (summary, item) => {
      summary.items.push(item);
      summary.totalCount += item.quantity;
      summary.totalValue += item.lineTotal;
      return summary;
    },
    { items: [], totalCount: 0, totalValue: 0 },
  );
}

function renderCart() {
  const summary = getCartSummary();

  document.querySelectorAll("[data-cart-total]").forEach((node) => {
    node.textContent = formatPrice(summary.totalValue);
  });

  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(summary.totalCount);
  });

  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartTotalValue = document.getElementById("cartTotalValue");

  if (!cartItems || !cartEmpty || !cartTotalValue) {
    return;
  }

  cartTotalValue.textContent = formatPrice(summary.totalValue);
  cartItems.innerHTML = "";
  cartEmpty.hidden = summary.items.length > 0;

  summary.items.forEach((item) => {
    const cartRow = document.createElement("div");
    cartRow.className = "cart-item";
    cartRow.innerHTML = `
      <div class="cart-item-copy">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.quantity} x ${formatPrice(item.priceValue)}</p>
      </div>
      <div class="cart-item-actions">
        <strong class="cart-item-total">${formatPrice(item.lineTotal)}</strong>
        <button class="cart-remove" data-remove-from-cart="${item.id}" type="button">Ukloni</button>
      </div>
    `;
    cartItems.appendChild(cartRow);
  });
}

function addToCart(productId) {
  if (!getProductById(productId)) {
    return;
  }

  cartState = {
    ...cartState,
    [productId]: (cartState[productId] || 0) + 1,
  };

  saveCart();
  store.recordEvent("product_click", { productId });
  store.recordEvent("cart_add", { productId });
  renderCart();
}

function removeFromCart(productId) {
  if (!cartState[productId]) {
    return;
  }

  const nextCart = { ...cartState };
  delete nextCart[productId];
  cartState = nextCart;

  saveCart();
  store.recordEvent("cart_remove", { productId });
  renderCart();
}

function setCartOpen(isOpen) {
  const cartDrawer = document.getElementById("cartDrawer");
  if (!cartDrawer) {
    return;
  }

  cartDrawer.hidden = !isOpen;
  cartDrawer.classList.toggle("open", isOpen);
  document.body.classList.toggle("cart-open", isOpen);
}

function setupCart() {
  const cartToggle = document.getElementById("cartToggle");
  if (!cartToggle) {
    return;
  }

  renderCart();

  cartToggle.addEventListener("click", () => {
    setCartOpen(true);
  });

  document.querySelectorAll("[data-cart-close]").forEach((button) => {
    button.addEventListener("click", () => {
      setCartOpen(false);
    });
  });

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      addToCart(addButton.dataset.addToCart);
      setCartOpen(true);
      return;
    }

    const removeButton = event.target.closest("[data-remove-from-cart]");
    if (removeButton) {
      removeFromCart(removeButton.dataset.removeFromCart);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setCartOpen(false);
    }
  });
}

function init() {
  renderProducts();
  renderCollections();
  setupMenu();
  setupNewsletter();
  setupCart();
  setupLightbox();
  store.recordEvent("page_view", {
    pageType: document.body.classList.contains("shop-page") ? "shop" : "home",
  });
}

init();
