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
const BUY_NOW_STORAGE_KEY = "hanna-artesa-buy-now";
const AUTH_STORAGE_KEY = "hanna-artesa-auth";
let cartState = loadCart();
let authState = loadAuthState();
let lightboxScale = 1;
let lightboxTranslateX = 0;
let lightboxTranslateY = 0;
let isLightboxDragging = false;
let lightboxDragStartX = 0;
let lightboxDragStartY = 0;
let didLightboxDrag = false;
let currentLightboxProduct = null;
let currentLightboxImages = [];
let currentLightboxIndex = 0;
let isLightboxDetailsCollapsed = false;
let currentShopFilter = getInitialShopFilter();
let isAuthMenuOpen = false;

function getInitialShopFilter() {
  const allowedFilters = new Set(["all", "torbe", "kape", "carape", "igracke"]);
  const params = new URLSearchParams(window.location.search);
  const filter = params.get("filter");

  if (!filter || !allowedFilters.has(filter)) {
    return "all";
  }

  return filter;
}

function closeShopDropdowns(exceptGroup = "") {
  document.querySelectorAll(".shop-category-group").forEach((group) => {
    const shouldStayOpen = exceptGroup && group.dataset.shopGroup === exceptGroup;
    group.classList.toggle("open", shouldStayOpen);

    const toggle = group.querySelector("[data-shop-group-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(shouldStayOpen));
    }
  });
}

function getProductBaseName(productName) {
  return String(productName || "")
    .replace(/\s+\d+$/, "")
    .trim();
}

function mergeProductImages(...productLists) {
  return productLists
    .flatMap((product) => getProductGalleryImages(product))
    .filter((value, index, array) => value && array.indexOf(value) === index);
}

function groupProductsForDisplay(products) {
  const groupedProducts = new Map();

  products.forEach((product) => {
    const baseName = getProductBaseName(product.name) || product.name || "Proizvod";
    const groupKey = `${product.category || ""}::${baseName.toLowerCase()}`;
    const existing = groupedProducts.get(groupKey);

    if (!existing) {
      groupedProducts.set(groupKey, {
        ...product,
        name: baseName,
        image: product.image || "",
        images: mergeProductImages(product),
        _primaryResolved: product.name === baseName,
      });
      return;
    }

    const currentIsPrimary = product.name === baseName;
    const existingIsPrimary = existing._primaryResolved === true;
    const shouldReplacePrimary = currentIsPrimary && !existingIsPrimary;
    const mergedImages = mergeProductImages(existing, product);

    groupedProducts.set(groupKey, {
      ...(shouldReplacePrimary ? product : existing),
      name: baseName,
      image: shouldReplacePrimary
        ? product.image || mergedImages[0] || existing.image || ""
        : existing.image || mergedImages[0] || product.image || "",
      images: mergedImages,
      _primaryResolved: shouldReplacePrimary || existingIsPrimary,
    });
  });

  return Array.from(groupedProducts.values()).map(({ _primaryResolved, ...product }) => product);
}

function getProductsCatalog() {
  return groupProductsForDisplay(store.getVisibleProducts());
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
  const filteredProducts = document.body.classList.contains("shop-page") && currentShopFilter !== "all"
    ? productsToRender.filter((product) => product.category === currentShopFilter)
    : productsToRender;

  grid.innerHTML = "";

  filteredProducts.forEach((item) => {
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

function syncShopFilterButtons() {
  document.querySelectorAll("[data-shop-filter]").forEach((button) => {
    const isActive = button.dataset.shopFilter === currentShopFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-shop-group-toggle]").forEach((button) => {
    const groupValues = (button.dataset.shopGroupValues || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    button.classList.toggle("active", groupValues.includes(currentShopFilter));
  });
}

function setupShopDropdowns() {
  document.querySelectorAll(".shop-category-group").forEach((group) => {
    const toggle = group.querySelector("[data-shop-group-toggle]");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = group.classList.contains("open");
      closeShopDropdowns(isOpen ? "" : group.dataset.shopGroup);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".shop-category-group")) {
      closeShopDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeShopDropdowns();
    }
  });
}

function setupShopFilters() {
  if (!document.body.classList.contains("shop-page")) {
    return;
  }

  syncShopFilterButtons();
  setupShopDropdowns();

  document.querySelectorAll("[data-shop-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentShopFilter = button.dataset.shopFilter;
      const nextUrl = new URL(window.location.href);
      if (currentShopFilter === "all") {
        nextUrl.searchParams.delete("filter");
      } else {
        nextUrl.searchParams.set("filter", currentShopFilter);
      }
      window.history.replaceState({}, "", nextUrl);
      syncShopFilterButtons();
      renderProducts();
      closeShopDropdowns();
      store.recordEvent("shop_filter", { filter: currentShopFilter });
    });
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
  const statusNode = document.getElementById("newsletterStatus");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !emailInput) {
    return;
  }

  const setStatus = (message, state = "") => {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.classList.remove("is-success", "is-error", "is-loading");

    if (state) {
      statusNode.classList.add(state);
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus("Slanje prijave...", "is-loading");

    try {
      const response = await fetch("./api/newsletter.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Newsletter endpoint nije dostupan.");
      }

      store.addNewsletterSignup(email);
      store.recordEvent("newsletter_signup", { email });
      setStatus(data?.message || "Uspesno ste prijavljeni na newsletter.", "is-success");
      form.reset();
    } catch (error) {
      setStatus(
        error?.message || "Prijava trenutno nije uspela. Pokusajte ponovo malo kasnije.",
        "is-error",
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
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
    <div class="photo-lightbox-panel" role="dialog" aria-modal="true" aria-label="Detalji proizvoda">
      <button class="photo-lightbox-close" data-lightbox-close type="button" aria-label="Zatvori fotografiju">&times;</button>
      <div class="photo-lightbox-shell">
        <div class="photo-lightbox-media">
          <div class="photo-lightbox-stage" id="photoLightboxStage">
            <button class="photo-lightbox-nav photo-lightbox-nav-prev" data-lightbox-prev type="button" aria-label="Prethodna fotografija">&#10094;</button>
            <img class="photo-lightbox-image" id="photoLightboxImage" alt="">
            <button class="photo-lightbox-nav photo-lightbox-nav-next" data-lightbox-next type="button" aria-label="Sledeca fotografija">&#10095;</button>
            <p class="photo-lightbox-counter" id="photoLightboxCounter" hidden></p>
          </div>
          <div class="photo-lightbox-thumbs" id="photoLightboxThumbs" aria-label="Galerija proizvoda"></div>
        </div>
        <div class="photo-lightbox-details" id="photoLightboxDetails"></div>
      </div>
    </div>
  `;

  document.body.appendChild(lightbox);
}

function getProductPreviewDetails(product) {
  const defaultsByCategory = {
    torbe: {
      description: "Rucno radjena torba osmisljena za svakodnevne kombinacije, sa toplim butik utiskom i dovoljno prostora za osnovne sitnice.",
      material: "Rucno radjena prediva, pazljivo oblikovana struktura i detalji po modelu.",
      dimensions: "Priblizno 35 x 28 cm",
    },
    kape: {
      description: "Mekana rucno radjena kapa koja greje, lepo prijanja i lako se uklapa uz zimske kombinacije.",
      material: "Mekano predivo prijatno za nosenje i svakodnevnu upotrebu.",
      dimensions: "Univerzalna velicina / po dogovoru",
    },
    carape: {
      description: "Rucno radjene carape sa toplim i udobnim osecajem, idealne za poklon ili svakodnevnu udobnost.",
      material: "Toplo i mekano predivo prilagodjeno sezonskom nosenju.",
      dimensions: "Velicina po modelu ili dogovoru",
    },
    igracke: {
      description: "Rucno radjena igracka sa sarmom, dekorativnim karakterom i toplim handmade izgledom.",
      material: "Mekano punjenje i rucno radjeni tekstilni / heklani detalji po modelu.",
      dimensions: "Dimenzije se razlikuju po modelu, okvirno 20-35 cm",
    },
  };

  const defaults = defaultsByCategory[product.category] || defaultsByCategory.igracke;

  return {
    description: product.description || defaults.description,
    material: product.material || defaults.material,
    dimensions: product.dimensions || defaults.dimensions,
  };
}

function getProductGalleryImages(product) {
  const galleryImages = Array.isArray(product?.images)
    ? product.images.filter((value) => typeof value === "string" && value.trim())
    : [];

  if (galleryImages.length) {
    return galleryImages;
  }

  return product?.image ? [product.image] : [];
}

function resetLightboxView() {
  const stage = document.getElementById("photoLightboxStage");
  lightboxScale = 1;
  lightboxTranslateX = 0;
  lightboxTranslateY = 0;
  isLightboxDragging = false;
  didLightboxDrag = false;
  if (stage) {
    stage.classList.remove("is-dragging");
  }
  updateLightboxTransform();
}

function setLightboxDetailsCollapsed(isCollapsed) {
  const shell = document.querySelector(".photo-lightbox-shell");
  if (!shell) {
    return;
  }

  isLightboxDetailsCollapsed = isCollapsed;
  shell.classList.toggle("details-collapsed", isCollapsed);

  if (!isCollapsed) {
    resetLightboxView();
  }
}

function updateLightboxCounter() {
  const counter = document.getElementById("photoLightboxCounter");
  if (!counter) {
    return;
  }

  if (currentLightboxImages.length <= 1) {
    counter.hidden = true;
    counter.textContent = "";
    return;
  }

  counter.hidden = false;
  counter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxImages.length}`;
}

function updateLightboxNavState() {
  const prevButton = document.querySelector("[data-lightbox-prev]");
  const nextButton = document.querySelector("[data-lightbox-next]");
  const thumbs = document.getElementById("photoLightboxThumbs");
  const hasGallery = currentLightboxImages.length > 1;

  if (prevButton) {
    prevButton.hidden = !hasGallery;
  }

  if (nextButton) {
    nextButton.hidden = !hasGallery;
  }

  if (thumbs) {
    thumbs.hidden = currentLightboxImages.length <= 1;
  }
}

function renderLightboxThumbnails() {
  const thumbs = document.getElementById("photoLightboxThumbs");
  if (!thumbs) {
    return;
  }

  thumbs.innerHTML = currentLightboxImages
    .map((src, index) => `
      <button
        class="photo-lightbox-thumb ${index === currentLightboxIndex ? "active" : ""}"
        data-lightbox-thumb="${index}"
        type="button"
        aria-label="Prikazi fotografiju ${index + 1}"
      >
        <img src="${escapeHtml(src)}" alt="${escapeHtml(currentLightboxProduct?.name || "Proizvod")}">
      </button>
    `)
    .join("");

  updateLightboxNavState();
  updateLightboxCounter();
}

function setLightboxImageIndex(index) {
  const image = document.getElementById("photoLightboxImage");
  if (!image || !currentLightboxImages.length) {
    return;
  }

  const boundedIndex = (index + currentLightboxImages.length) % currentLightboxImages.length;
  currentLightboxIndex = boundedIndex;
  image.src = currentLightboxImages[currentLightboxIndex];
  image.alt = currentLightboxProduct?.name || "";
  resetLightboxView();
  renderLightboxThumbnails();
}

function stepLightboxZoom(delta) {
  const previousScale = lightboxScale;
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
}

function toggleLightboxZoom() {
  if (lightboxScale === 1) {
    lightboxScale = 2;
  } else {
    lightboxScale = 1;
    lightboxTranslateX = 0;
    lightboxTranslateY = 0;
  }

  updateLightboxTransform();
}

function renderLightboxDetails(product) {
  const detailsContainer = document.getElementById("photoLightboxDetails");
  if (!detailsContainer) {
    return;
  }

  const preview = getProductPreviewDetails(product);
  detailsContainer.innerHTML = `
    <div class="photo-lightbox-details-inner">
      <p class="photo-lightbox-kicker">Pregled proizvoda</p>
      <h2 class="photo-lightbox-title">${escapeHtml(product.name)}</h2>
      <p class="photo-lightbox-description">${escapeHtml(preview.description)}</p>
      <div class="photo-lightbox-specs">
        <div class="photo-lightbox-spec">
          <span>Materijal</span>
          <strong>${escapeHtml(preview.material)}</strong>
        </div>
        <div class="photo-lightbox-spec">
          <span>Dimenzije</span>
          <strong>${escapeHtml(preview.dimensions)}</strong>
        </div>
      </div>
      <p class="photo-lightbox-price">${formatPrice(product.priceValue)}</p>
      <p class="photo-lightbox-note">
        Sve cene su sa PDV-om / Deklaracija se nalazi na proizvodu
      </p>
      <p class="photo-lightbox-note">
        U slucaju da artikal nije dostupan, kontaktirajte nas kako bi sto pre pripremili i izradili artikal za vas!
      </p>
      <div class="photo-lightbox-actions">
        <button class="btn btn-primary photo-lightbox-cta" data-add-to-cart="${escapeHtml(product.id)}" type="button">Dodaj u korpu</button>
        <button class="btn btn-secondary photo-lightbox-buy-now" data-buy-now="${escapeHtml(product.id)}" type="button">Kupi odmah</button>
      </div>
    </div>
    <button class="photo-lightbox-details-tab" data-lightbox-expand-details type="button" aria-label="Prikazi detalje proizvoda">
      <span>Pregled proizvoda</span>
    </button>
  `;
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

function setLightboxOpen(isOpen, product = null) {
  const lightbox = document.getElementById("photoLightbox");
  const image = document.getElementById("photoLightboxImage");
  const details = document.getElementById("photoLightboxDetails");
  const thumbs = document.getElementById("photoLightboxThumbs");
  const counter = document.getElementById("photoLightboxCounter");
  if (!lightbox || !image) {
    return;
  }

  if (isOpen) {
    currentLightboxProduct = product;
    currentLightboxImages = getProductGalleryImages(product);
    currentLightboxIndex = 0;
    isLightboxDetailsCollapsed = false;
    lightbox.hidden = false;
    lightbox.classList.add("open");
    document.body.classList.add("lightbox-open");
    renderLightboxDetails(product || {});
    setLightboxDetailsCollapsed(false);
    setLightboxImageIndex(0);
    return;
  }

  lightbox.hidden = true;
  lightbox.classList.remove("open");
  document.body.classList.remove("lightbox-open");
  currentLightboxProduct = null;
  currentLightboxImages = [];
  currentLightboxIndex = 0;
  isLightboxDetailsCollapsed = false;
  image.removeAttribute("src");
  image.alt = "";
  if (details) {
    details.innerHTML = "";
  }
  if (thumbs) {
    thumbs.innerHTML = "";
  }
  if (counter) {
    counter.hidden = true;
    counter.textContent = "";
  }
  resetLightboxView();
}

function setupLightbox() {
  createLightbox();

  const lightbox = document.getElementById("photoLightbox");
  const panel = lightbox?.querySelector(".photo-lightbox-panel");
  const stage = document.getElementById("photoLightboxStage");
  const image = document.getElementById("photoLightboxImage");
  if (!lightbox || !panel || !stage || !image) {
    return;
  }

  document.addEventListener("click", (event) => {
    const image = event.target.closest(".product-image");
    const productCard = event.target.closest(".product-card");

    if (image || (productCard && !event.target.closest("[data-add-to-cart]"))) {
      const productId = image?.dataset.productId || productCard?.querySelector("[data-add-to-cart]")?.dataset.addToCart || "";
      const product = getProductById(productId);
      if (!product) {
        return;
      }

      store.recordEvent("product_click", { productId });
      store.recordEvent("image_open", { productId });
      setLightboxOpen(true, product);
      return;
    }

    const closeTrigger = event.target.closest("[data-lightbox-close]");
    if (closeTrigger) {
      setLightboxOpen(false);
      return;
    }

    const previousTrigger = event.target.closest("[data-lightbox-prev]");
    if (previousTrigger) {
      setLightboxImageIndex(currentLightboxIndex - 1);
      return;
    }

    const nextTrigger = event.target.closest("[data-lightbox-next]");
    if (nextTrigger) {
      setLightboxImageIndex(currentLightboxIndex + 1);
      return;
    }

    const thumbTrigger = event.target.closest("[data-lightbox-thumb]");
    if (thumbTrigger) {
      setLightboxImageIndex(Number(thumbTrigger.dataset.lightboxThumb));
      return;
    }

    const expandDetailsTrigger = event.target.closest("[data-lightbox-expand-details]");
    if (expandDetailsTrigger) {
      setLightboxDetailsCollapsed(false);
      return;
    }

  });

  panel.addEventListener("click", (event) => {
    if (event.target === panel) {
      setLightboxOpen(false);
    }
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      if (lightbox.hidden || !isLightboxDetailsCollapsed) {
        return;
      }

      event.preventDefault();
      stepLightboxZoom(event.deltaY < 0 ? 0.16 : -0.16);
    },
    { passive: false },
  );

  image.addEventListener("click", () => {
    if (lightbox.hidden) {
      return;
    }

    if (didLightboxDrag) {
      didLightboxDrag = false;
      return;
    }

    if (!isLightboxDetailsCollapsed) {
      setLightboxDetailsCollapsed(true);
      return;
    }

    toggleLightboxZoom();
  });

  image.addEventListener("mousedown", (event) => {
    if (lightbox.hidden || !isLightboxDetailsCollapsed || lightboxScale <= 1) {
      return;
    }

    event.preventDefault();
    isLightboxDragging = true;
    didLightboxDrag = false;
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
    didLightboxDrag = true;
    updateLightboxTransform();
  });

  window.addEventListener("mouseup", () => {
    isLightboxDragging = false;
    stage.classList.remove("is-dragging");
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) {
      return;
    }

    if (event.key === "Escape") {
      setLightboxOpen(false);
      return;
    }

    if (event.key === "ArrowLeft" && currentLightboxImages.length > 1) {
      setLightboxImageIndex(currentLightboxIndex - 1);
      return;
    }

    if (event.key === "ArrowRight" && currentLightboxImages.length > 1) {
      setLightboxImageIndex(currentLightboxIndex + 1);
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

function loadBuyNowCart() {
  try {
    const rawBuyNowCart = localStorage.getItem(BUY_NOW_STORAGE_KEY);
    if (!rawBuyNowCart) {
      return {};
    }

    const parsedBuyNowCart = JSON.parse(rawBuyNowCart);
    if (!parsedBuyNowCart || typeof parsedBuyNowCart !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedBuyNowCart).filter(([, quantity]) => Number.isFinite(quantity) && quantity > 0),
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

function saveBuyNowCart(productId) {
  try {
    localStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify({ [productId]: 1 }));
  } catch {
    // Ignore storage failures so the redirect still works when possible.
  }
}

function clearBuyNowCart() {
  try {
    localStorage.removeItem(BUY_NOW_STORAGE_KEY);
  } catch {
    // Ignore storage failures so the UI still works in-memory.
  }
}

function loadAuthState() {
  try {
    const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawAuth) {
      return null;
    }

    const parsedAuth = JSON.parse(rawAuth);
    if (!parsedAuth || typeof parsedAuth !== "object" || !parsedAuth.provider) {
      return null;
    }

    return parsedAuth;
  } catch {
    return null;
  }
}

function saveAuthState() {
  try {
    if (!authState) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  } catch {
    // Ignore storage failures so the UI still works in-memory.
  }
}

function getAuthProviderMeta(provider) {
  const providers = {
    google: {
      label: "Google",
      helper: "Brz nastavak uz Google nalog.",
      className: "google",
    },
    facebook: {
      label: "Facebook",
      helper: "Prijava preko Facebook naloga.",
      className: "facebook",
    },
    instagram: {
      label: "Instagram",
      helper: "Meta / Instagram povezivanje za brzi checkout.",
      className: "instagram",
    },
  };

  return providers[provider] || null;
}

function getAuthProviderIconMarkup(provider, compact = false) {
  const compactClass = compact ? " cart-provider-icon-compact" : "";

  if (provider === "google") {
    return `
      <span class="cart-provider-icon cart-provider-icon-google${compactClass}" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path fill="#EA4335" d="M12.24 10.29v3.92h5.45c-.24 1.26-.96 2.33-2.05 3.05l3.31 2.57c1.93-1.78 3.05-4.4 3.05-7.53 0-.72-.06-1.4-.18-2.01H12.24z"/>
          <path fill="#34A853" d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.31-2.57c-.92.62-2.1.99-3.46.99-2.66 0-4.92-1.8-5.73-4.22H2.85v2.65A10 10 0 0 0 12 22z"/>
          <path fill="#4A90E2" d="M6.27 13.73A5.98 5.98 0 0 1 5.95 12c0-.6.11-1.18.32-1.73V7.62H2.85A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.38l3.19-2.65z"/>
          <path fill="#FBBC05" d="M12 6.05c1.5 0 2.85.52 3.91 1.54l2.93-2.93C17.07 2.98 14.76 2 12 2a10 10 0 0 0-9.15 5.62l3.42 2.65C7.08 7.85 9.34 6.05 12 6.05z"/>
        </svg>
      </span>
    `;
  }

  if (provider === "facebook") {
    return `
      <span class="cart-provider-icon cart-provider-icon-facebook${compactClass}" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path fill="currentColor" d="M13.4 21v-7.29h2.45l.37-2.84H13.4V9.06c0-.82.23-1.38 1.4-1.38h1.5V5.14c-.26-.03-1.14-.11-2.16-.11-2.14 0-3.61 1.31-3.61 3.71v2.13H8.1v2.84h2.43V21h2.87z"/>
        </svg>
      </span>
    `;
  }

  return `
    <span class="cart-provider-icon cart-provider-icon-instagram${compactClass}" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.2" ry="4.2" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/>
      </svg>
    </span>
  `;
}

function ensureHeaderAuthSection() {
  const headerActions = document.querySelector(".header-actions");
  const cartToggle = document.getElementById("cartToggle");
  if (!headerActions || !cartToggle) {
    return null;
  }

  let authSection = document.getElementById("headerAuthSection");
  if (!authSection) {
    authSection = document.createElement("div");
    authSection.id = "headerAuthSection";
    authSection.className = "header-auth";
    cartToggle.insertAdjacentElement("afterend", authSection);
  }

  return authSection;
}

function setAuthMenuOpen(isOpen) {
  const authSection = document.getElementById("headerAuthSection");
  if (!authSection) {
    return;
  }

  isAuthMenuOpen = isOpen;
  authSection.classList.toggle("open", isOpen);

  const trigger = authSection.querySelector("[data-auth-toggle]");
  const panel = authSection.querySelector(".header-auth-panel");

  if (trigger) {
    trigger.setAttribute("aria-expanded", String(isOpen));
  }

  if (panel) {
    panel.hidden = !isOpen;
  }
}

function renderHeaderAuth() {
  const authSection = ensureHeaderAuthSection();
  if (!authSection) {
    return;
  }

  const providersMarkup = ["google", "facebook", "instagram"]
    .map((providerKey) => {
      const provider = getAuthProviderMeta(providerKey);
      return `
        <button class="cart-social-btn ${provider.className}" data-social-login="${providerKey}" type="button">
          ${getAuthProviderIconMarkup(providerKey)}
          <span class="cart-social-copy">
            <strong>${provider.label}</strong>
            <span>${provider.helper}</span>
          </span>
        </button>
      `;
    })
    .join("");

  if (authState) {
    const provider = getAuthProviderMeta(authState.provider);
    const providerLabel = provider?.label || "Social";

    authSection.innerHTML = `
      <button class="header-auth-trigger header-auth-trigger-logged" data-auth-toggle type="button" aria-expanded="${String(isAuthMenuOpen)}" aria-haspopup="true">
        ${getAuthProviderIconMarkup(authState.provider, true)}
        <span class="header-auth-copy">
          <span class="header-auth-label">Nalog</span>
          <strong>${escapeHtml(authState.displayName || `${providerLabel} nalog`)}</strong>
        </span>
      </button>
      <div class="header-auth-panel" ${isAuthMenuOpen ? "" : "hidden"}>
        <p class="cart-login-kicker">Prijava</p>
        <div class="cart-login-topline">
          ${getAuthProviderIconMarkup(authState.provider)}
          <div class="cart-login-copy-wrap">
            <strong class="cart-login-title">Prijavljeni ste</strong>
            <p class="cart-login-copy">Nastavljate kao ${escapeHtml(providerLabel)} korisnik.</p>
          </div>
        </div>
        <div class="cart-login-identity">
          <span class="cart-login-badge">${escapeHtml(providerLabel)}</span>
          <span class="cart-login-name">${escapeHtml(authState.displayName || `${providerLabel} nalog`)}</span>
        </div>
        <div class="cart-social-grid">
          ${providersMarkup}
        </div>
        <button class="cart-login-secondary" data-auth-logout type="button">Odjavi se</button>
      </div>
    `;
    return;
  }

  authSection.innerHTML = `
    <button class="header-auth-trigger" data-auth-toggle type="button" aria-expanded="${String(isAuthMenuOpen)}" aria-haspopup="true">
      <span class="header-auth-badge">Prijava</span>
      <span class="header-auth-mini-icons" aria-hidden="true">
        ${getAuthProviderIconMarkup("google", true)}
        ${getAuthProviderIconMarkup("facebook", true)}
        ${getAuthProviderIconMarkup("instagram", true)}
      </span>
    </button>
    <div class="header-auth-panel" ${isAuthMenuOpen ? "" : "hidden"}>
      <p class="cart-login-kicker">Brza prijava</p>
      <h3 class="cart-login-title">Prijavite se</h3>
      <p class="cart-login-copy">Google, Facebook i Instagram login su odmah uz korpu.</p>
      <div class="cart-social-grid">
        ${providersMarkup}
      </div>
      <p class="cart-login-note">Za pravi OAuth sledeci korak su Google i Meta kljucevi aplikacija.</p>
    </div>
  `;
}

function signInWithProvider(provider) {
  const providerMeta = getAuthProviderMeta(provider);
  if (!providerMeta) {
    return;
  }

  authState = {
    provider,
    displayName: `${providerMeta.label} korisnik`,
    connectedAt: new Date().toISOString(),
  };

  saveAuthState();
  renderHeaderAuth();
  setAuthMenuOpen(false);
  store.recordEvent("social_login_demo", { provider });
}

function signOutUser() {
  if (!authState) {
    return;
  }

  const provider = authState.provider;
  authState = null;
  saveAuthState();
  renderHeaderAuth();
  setAuthMenuOpen(false);
  store.recordEvent("social_logout_demo", { provider });
}

function getProductById(productId) {
  return getProductsCatalog().find((item) => item.id === productId)
    || store.getProducts().find((item) => item.id === productId)
    || null;
}

function getSummaryFromCartState(state) {
  const items = Object.entries(state)
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

function getCartSummary() {
  return getSummaryFromCartState(cartState);
}

function hasActiveBuyNowCheckout() {
  if (!document.body.classList.contains("checkout-page")) {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("buy-now") !== "1") {
    return false;
  }

  return getSummaryFromCartState(loadBuyNowCart()).items.length > 0;
}

function getCheckoutSummaryData() {
  if (hasActiveBuyNowCheckout()) {
    return getSummaryFromCartState(loadBuyNowCart());
  }

  return getCartSummary();
}

function renderCart() {
  const summary = getCartSummary();

  document.querySelectorAll("[data-cart-total]").forEach((node) => {
    node.textContent = formatPrice(summary.totalValue);
  });

  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(summary.totalCount);
  });

  renderCheckoutSummary();

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

function buyNow(productId) {
  if (!getProductById(productId)) {
    return;
  }

  saveBuyNowCart(productId);
  store.recordEvent("product_click", { productId });
  store.recordEvent("buy_now", { productId });
  setLightboxOpen(false);
  window.location.href = "placanje.html?buy-now=1";
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

function renderCheckoutSummary(summary = getCheckoutSummaryData()) {
  const summaryContainer = document.getElementById("checkoutSummary");
  const summaryTotal = document.getElementById("checkoutSummaryTotal");

  if (!summaryContainer || !summaryTotal) {
    return;
  }

  summaryTotal.textContent = formatPrice(summary.totalValue);

  if (!summary.items.length) {
    summaryContainer.innerHTML = `
      <p class="checkout-empty">Korpa je trenutno prazna.</p>
      <a class="btn btn-secondary checkout-back-link" href="shop.html">Pogledaj proizvode</a>
    `;
    return;
  }

  summaryContainer.innerHTML = summary.items
    .map((item) => `
      <div class="checkout-summary-item">
        <div>
          <p class="checkout-summary-name">${escapeHtml(item.name)}</p>
          <p class="checkout-summary-meta">${item.quantity} x ${formatPrice(item.priceValue)}</p>
        </div>
        <strong>${formatPrice(item.lineTotal)}</strong>
      </div>
    `)
    .join("");
}

function setupCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) {
    return;
  }

  renderCheckoutSummary();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isBuyNowCheckout = hasActiveBuyNowCheckout();
    const summary = getCheckoutSummaryData();
    if (!summary.items.length) {
      alert("Korpa je prazna. Dodajte proizvode pre slanja porudzbine.");
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    store.recordEvent("checkout_submit", {
      firstName: payload.first_name || "",
      lastName: payload.last_name || "",
      city: payload.city || "",
      totalValue: summary.totalValue,
      totalCount: summary.totalCount,
    });

    alert("Hvala! Porudzbina je zabelezena u ovoj demonstracionoj formi.");
    if (isBuyNowCheckout) {
      clearBuyNowCart();
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("buy-now");
      window.history.replaceState({}, "", nextUrl);
    } else {
      cartState = {};
      saveCart();
    }
    renderCart();
    renderCheckoutSummary();
    form.reset();
  });
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

  renderHeaderAuth();
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
    const authToggle = event.target.closest("[data-auth-toggle]");
    if (authToggle) {
      setAuthMenuOpen(!isAuthMenuOpen);
      return;
    }

    const socialLoginButton = event.target.closest("[data-social-login]");
    if (socialLoginButton) {
      signInWithProvider(socialLoginButton.dataset.socialLogin);
      return;
    }

    const logoutButton = event.target.closest("[data-auth-logout]");
    if (logoutButton) {
      signOutUser();
      return;
    }

    if (!event.target.closest(".header-auth")) {
      setAuthMenuOpen(false);
    }

    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      addToCart(addButton.dataset.addToCart);
      setLightboxOpen(false);
      setCartOpen(true);
      return;
    }

    const buyNowButton = event.target.closest("[data-buy-now]");
    if (buyNowButton) {
      buyNow(buyNowButton.dataset.buyNow);
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
      setAuthMenuOpen(false);
    }
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncateText(value, maxLength = 110) {
  const normalized = String(value || "").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function renderInstagramFallback(container, profileUrl, message) {
  container.innerHTML = `
    <a class="instagram-window" href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Otvori Instagram profil Hanna Artesa">
      <span class="instagram-window-bar">
        <span class="instagram-dot"></span>
        <span class="instagram-dot"></span>
        <span class="instagram-dot"></span>
      </span>
      <span class="instagram-window-body">
        <span class="instagram-profile-row">
          <span class="instagram-avatar"></span>
          <span class="instagram-profile-copy">
            <strong>hanna_artesa_</strong>
            <span>@hanna_artesa_</span>
          </span>
        </span>
        <span class="instagram-preview">
          <span class="instagram-preview-badge">Instagram</span>
        </span>
        <span class="instagram-caption">${escapeHtml(message)}</span>
      </span>
    </a>
  `;
}

function renderInstagramFeed(container, data, profileUrlFallback) {
  const profile = data?.profile || {};
  const posts = Array.isArray(data?.posts) ? data.posts.slice(0, 3) : [];
  const profileUrl = profile.profileUrl || profileUrlFallback;
  const profilePicture = profile.profilePictureUrl
    ? `<img class="instagram-avatar-image" src="${escapeHtml(profile.profilePictureUrl)}" alt="${escapeHtml(profile.username || "Instagram profil")}">`
    : "";
  const postsMarkup = posts.length
    ? posts.map((post, index) => {
      const mediaMarkup = post.mediaUrl
        ? `<img class="instagram-post-image" src="${escapeHtml(post.mediaUrl)}" alt="${escapeHtml(truncateText(post.caption || `Instagram objava ${index + 1}`, 90))}">`
        : `<span class="instagram-post-placeholder">Instagram</span>`;

      return `
        <a class="instagram-post-card" href="${escapeHtml(post.permalink || profileUrl)}" target="_blank" rel="noopener noreferrer">
          <span class="instagram-post-media">${mediaMarkup}</span>
          <span class="instagram-post-copy">${escapeHtml(truncateText(post.caption || "Pogledajte objavu na Instagramu."))}</span>
        </a>
      `;
    }).join("")
    : `
      <a class="instagram-post-card instagram-post-card-empty" href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer">
        <span class="instagram-post-media"><span class="instagram-post-placeholder">Instagram</span></span>
        <span class="instagram-post-copy">Objave će se prikazati kada API vrati poslednje postove.</span>
      </a>
    `;

  container.innerHTML = `
    <a class="instagram-window instagram-window-profile" href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Otvori Instagram profil">
      <span class="instagram-window-bar">
        <span class="instagram-dot"></span>
        <span class="instagram-dot"></span>
        <span class="instagram-dot"></span>
      </span>
      <span class="instagram-window-body">
        <span class="instagram-profile-row">
          <span class="instagram-avatar">${profilePicture}</span>
          <span class="instagram-profile-copy">
            <strong>${escapeHtml(profile.username || "hanna_artesa_")}</strong>
            <span>@hanna_artesa_</span>
          </span>
        </span>
        <span class="instagram-caption">${escapeHtml(profile.biography || "Kliknite da otvorite profil i pogledate najnovije objave.")}</span>
      </span>
    </a>
    <div class="instagram-post-grid">
      ${postsMarkup}
    </div>
  `;
}

async function setupInstagramFeed() {
  const container = document.getElementById("instagramFeed");
  if (!container) {
    return;
  }

  const profileUrl = container.dataset.instagramProfileUrl || "https://www.instagram.com/hanna_artesa_/";

  try {
    const response = await fetch("./api/instagram.php", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Instagram endpoint is not available yet.");
    }

    const data = await response.json();
    renderInstagramFeed(container, data, profileUrl);
  } catch {
    renderInstagramFallback(
      container,
      profileUrl,
      "Povezite Meta API i serverske env varijable da bi se prikazali pravi profil i poslednje 3 objave.",
    );
  }
}

function init() {
  renderProducts();
  renderCollections();
  setupMenu();
  setupNewsletter();
  setupCart();
  setupCheckoutForm();
  setupLightbox();
  setupShopFilters();
  setupInstagramFeed();
  store.recordEvent("page_view", {
    pageType: document.body.classList.contains("shop-page") ? "shop" : "home",
  });
}

init();
